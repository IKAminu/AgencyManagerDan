import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { todayDate } from '@/lib/business'
import { loadLiveStore, saveLiveStore } from '@/lib/supabaseStore'
import type { AppMode } from '@/auth/AuthGate'
import { initialBookings, initialCustomers, initialLeads, initialPackages, initialPayments, initialTravellers, initialSupplierPayments, supplierCosts as initialSupplierCosts, documents as initialDocuments } from '@/data/mockData'
import type { Booking, Customer, Lead, Payment, DocumentRecord, QuickActionType, SupplierCost, SupplierPayment, TravelPackage, Traveller } from '@/types'

type AppStore = {
  leads: Lead[]
  customers: Customer[]
  bookings: Booking[]
  packages: TravelPackage[]
  payments: Payment[]
  travellers: Traveller[]
  supplierCosts: SupplierCost[]
  supplierPayments: SupplierPayment[]
  documents: DocumentRecord[]
  action: QuickActionType | null
  setAction: (action: QuickActionType | null) => void
  addRecord: (type: QuickActionType, values: Record<string, string>) => void
  editing: { type: QuickActionType; id: string } | null
  setEditing: (value: { type: QuickActionType; id: string } | null) => void
  updateRecord: (type: QuickActionType, recordId: string, values: Record<string, string>) => void
  convertLead: (leadId: string, values?: Record<string, string>) => void
  reversePayment: (paymentId: string, reason: string) => void
  voidSupplierPayment: (paymentId: string, reason: string) => void
}

const StoreContext = createContext<AppStore | null>(null)
const id = () => crypto.randomUUID()
const reference = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
const today = todayDate
const confirmedSupplierPaid = (costId: string, payments: SupplierPayment[]) =>
  payments.filter((payment) => payment.supplierCostId === costId && (payment.status || 'Confirmed') === 'Confirmed').reduce((sum, payment) => sum + payment.amount, 0)
const packageAvailabilityStatus = (status: TravelPackage['status'], availability: number): TravelPackage['status'] =>
  availability <= 0 && status === 'Active' ? 'Fully Booked' : availability > 0 && status === 'Fully Booked' ? 'Active' : status
const bookingReservesPlaces = (status: Booking['status']) => !['Enquiry', 'Cancelled'].includes(status)

export function AppStoreProvider({ children, mode }: { children: ReactNode; mode: AppMode }) {
  const isDemo = mode === 'demo'
  const [leads, setLeads] = useState<Lead[]>(isDemo ? initialLeads : [])
  const [customers, setCustomers] = useState<Customer[]>(isDemo ? initialCustomers : [])
  const [bookings, setBookings] = useState<Booking[]>(isDemo ? initialBookings : [])
  const [packages, setPackages] = useState<TravelPackage[]>(isDemo ? initialPackages : [])
  const [payments, setPayments] = useState<Payment[]>(isDemo ? initialPayments : [])
  const [travellers, setTravellers] = useState<Traveller[]>(isDemo ? initialTravellers : [])
  const [supplierCosts, setSupplierCosts] = useState<SupplierCost[]>(isDemo ? initialSupplierCosts : [])
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(isDemo ? initialSupplierPayments : [])
  const [documents, setDocuments] = useState<DocumentRecord[]>(isDemo ? initialDocuments : [])
  const [dataReady, setDataReady] = useState(isDemo)
  const [dataError, setDataError] = useState<string | null>(null)

  useEffect(() => {
    if (isDemo) return
    let active = true
    loadLiveStore().then((data) => {
      if (!active) return
      setLeads(data.leads); setCustomers(data.customers); setPackages(data.packages)
      setBookings(data.bookings); setTravellers(data.travellers); setPayments(data.payments)
      setSupplierCosts(data.supplierCosts); setSupplierPayments(data.supplierPayments); setDocuments(data.documents)
      setDataReady(true)
    }).catch((error: unknown) => {
      if (active) { setDataError(error instanceof Error ? error.message : 'Could not load demo records from Supabase.'); setDataReady(true) }
    })
    return () => { active = false }
  }, [isDemo])

  useEffect(() => {
    if (isDemo || !dataReady || dataError) return
    const timer = window.setTimeout(() => {
      saveLiveStore({ leads, customers, packages, bookings, travellers, payments, supplierCosts, supplierPayments, documents })
        .catch((error: unknown) => setDataError(error instanceof Error ? error.message : 'Could not save demo records to Supabase.'))
    }, 500)
    return () => window.clearTimeout(timer)
  }, [leads, customers, packages, bookings, travellers, payments, supplierCosts, supplierPayments, documents, dataReady, dataError, isDemo])
  const [action, setAction] = useState<QuickActionType | null>(null)
  const [editing, setEditing] = useState<{ type: QuickActionType; id: string } | null>(null)

  const addRecord = (type: QuickActionType, values: Record<string, string>) => {
    if (type === 'document') setDocuments((items) => [{ id: id(), name: values.name, category: values.category, relatedType: values.relatedType as DocumentRecord['relatedType'], relatedReference: values.relatedReference, url: values.url, recordedAt: today(), status: values.status as DocumentRecord['status'] }, ...items])
    if (type === 'supplier-cost') setSupplierCosts((items) => [{ id: id(), bookingId: values.bookingId, supplier: values.supplier, category: values.category, amount: Number(values.amount), dueDate: values.dueDate, paid: 0, status: values.dueDate < today() ? 'Overdue' : 'Unpaid' }, ...items])
    if (type === 'supplier-payment') {
      const cost = supplierCosts.find((item) => item.id === values.supplierCostId)
      const amount = Number(values.amount)
      if (!cost || !Number.isFinite(amount) || amount <= 0 || amount > cost.amount - confirmedSupplierPaid(cost.id, supplierPayments)) return
      const payment: SupplierPayment = { id: id(), supplierCostId: values.supplierCostId, amount, date: values.date, method: values.method as SupplierPayment['method'], reference: values.reference || undefined }
      const paid = confirmedSupplierPaid(cost.id, supplierPayments) + amount
      const status: SupplierCost['status'] = paid >= cost.amount ? 'Paid' : cost.dueDate < today() ? 'Overdue' : paid > 0 ? 'Partially Paid' : 'Unpaid'
      payment.status = 'Confirmed'
      setSupplierPayments((items) => [payment, ...items])
      setSupplierCosts((items) => items.map((item) => item.id === cost.id ? { ...item, paid, status } : item))
    }
    if (type === 'package') setPackages((items) => [{ id: id(), code: values.code, name: values.name, category: values.category, destination: values.destination, duration: values.duration, price: Number(values.price), estimatedCost: Number(values.estimatedCost || 0), currency: 'NGN', availability: Number(values.availability || 0), status: (values.status || 'Draft') as TravelPackage['status'] }, ...items])
    if (type === 'lead') setLeads((items) => [{ id: id(), reference: `DNC-2026-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, name: values.name, phone: values.phone, email: values.email, service: values.service, travelPeriod: values.travelPeriod || 'Flexible', source: values.source, status: (values.status || 'New') as Lead['status'], receivedAt: today(), followUp: values.followUp || undefined, groupSize: Number(values.groupSize || 1), city: values.city }, ...items])
    if (type === 'customer') setCustomers((items) => [{ id: id(), reference: reference('CUS'), name: values.name, phone: values.phone, email: values.email, nationality: values.nationality || 'Nigerian', city: values.city, historical: values.historical === 'true', createdAt: today() }, ...items])
    if (type === 'booking') {
      const selectedPackage = packages.find((item) => item.id === values.packageId)
      const partySize = Number(values.partySize || 1)
      const status = (values.status || 'Pending Confirmation') as Booking['status']
      if (selectedPackage && bookingReservesPlaces(status)) {
        if (selectedPackage.status !== 'Active' || selectedPackage.availability < partySize) return
        const availability = selectedPackage.availability - partySize
        setPackages((items) => items.map((item) => item.id === selectedPackage.id ? { ...item, availability, status: packageAvailabilityStatus(item.status, availability) } : item))
      }
      setBookings((items) => [{ id: id(), reference: `BKG-2026-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, customerId: values.customerId, packageId: values.packageId || undefined, packageName: values.packageName, agreedPrice: Number(values.agreedPrice || values.amount), partySize, currency: 'NGN', bookingDate: today(), departureDate: values.departureDate, returnDate: values.returnDate, status }, ...items])
    }
    if (type === 'payment') {
      const enteredCustomerName = values.customerName?.split(' — ')[0].trim().toLocaleLowerCase()
      const matchingCustomers = customers.filter((item) => item.name.trim().toLocaleLowerCase() === enteredCustomerName)
      let customer = customers.find((item) => item.reference === values.customerName?.split(' — ').at(-1)) || (matchingCustomers.length === 1 ? matchingCustomers[0] : undefined)
      if (!customer && values.customerName?.trim()) {
        customer = { id: id(), reference: reference('CUS'), name: values.customerName.trim(), phone: values.customerPhone.trim(), email: values.customerEmail.trim() || undefined, nationality: values.customerNationality || 'Nigerian', createdAt: today() }
        setCustomers((items) => [customer!, ...items])
      }
      if (customer) {
        const selectedBooking = bookings.find((booking) => booking.id === values.bookingId && booking.customerId === customer!.id)
        setPayments((items) => [{ id: id(), reference: reference('PAY'), bookingId: selectedBooking?.id, customerId: customer!.id, packageId: values.purposeType === 'package' ? values.packageId || undefined : undefined, purpose: values.purposeType === 'package' ? (packages.find((item) => item.id === values.packageId)?.name || 'Package payment') : values.customPurpose.trim(), amount: Number(values.amount), date: values.date, method: values.method as Payment['method'], status: (values.status || 'Confirmed') as Payment['status'], transactionReference: values.transactionReference || undefined }, ...items])
      }
    }
    if (type === 'traveller') { const linkedCustomer = customers.find((customer) => customer.id === values.customerId); setTravellers((items) => [{ id: id(), name: values.name?.trim() || linkedCustomer?.name || 'Unnamed traveller', customerId: linkedCustomer?.id, bookingId: values.bookingId, nationality: values.nationality || linkedCustomer?.nationality || 'Nigerian', status: (values.status || 'Not Started') as Traveller['status'], group: values.group?.trim() || undefined, documentsComplete: values.documentsComplete === 'true' }, ...items]) }
    setAction(null)
  }


  const convertLead = (leadId: string, values: Record<string, string> = {}) => {
    const original = leads.find((item) => item.id === leadId)
    if (!original) return
    const lead = { ...original, name: values.name ?? original.name, phone: values.phone ?? original.phone, email: values.email ?? original.email, city: values.city ?? original.city, status: 'Converted' as const }
    const existing = customers.find((customer) => customer.leadId === leadId)
    if (!existing) {
      const customer: Customer = {
        id: id(),
        reference: reference('CUS'),
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        nationality: 'Nigerian',
        city: lead.city,
        leadId,
        createdAt: today(),
      }
      setCustomers((items) => [customer, ...items])
    }
    setLeads((items) => items.map((item) => item.id === leadId ? { ...lead } : item))
  }

  const reversePayment = (paymentId: string, reason: string) => {
    if (!reason.trim()) return
    setPayments((items) => items.map((payment) => payment.id === paymentId && payment.status === 'Confirmed' ? { ...payment, status: 'Reversed', reversalReason: reason.trim() } : payment))
  }

  const voidSupplierPayment = (paymentId: string, reason: string) => {
    const cleanReason = reason.trim()
    if (!cleanReason) return
    const payment = supplierPayments.find((item) => item.id === paymentId)
    if (!payment || payment.status === 'Voided') return
    const cost = supplierCosts.find((item) => item.id === payment.supplierCostId)
    if (!cost || (payment.status || 'Confirmed') !== 'Confirmed') return
    const paid = Math.max(0, confirmedSupplierPaid(cost.id, supplierPayments) - payment.amount)
    const status: SupplierCost['status'] = paid >= cost.amount ? 'Paid' : cost.dueDate < today() ? 'Overdue' : paid > 0 ? 'Partially Paid' : 'Unpaid'
    setSupplierPayments((items) => items.map((item) => item.id === paymentId ? { ...item, status: 'Voided', voidReason: cleanReason } : item))
    setSupplierCosts((items) => items.map((item) => item.id === cost.id ? { ...item, paid, status } : item))
  }

  const updateRecord = (type: QuickActionType, recordId: string, values: Record<string, string>) => {
    if (type === 'document') setDocuments((items) => items.map((item) => item.id === recordId ? { ...item, name: values.name, category: values.category, relatedType: values.relatedType as DocumentRecord['relatedType'], relatedReference: values.relatedReference, url: values.url, status: values.status as DocumentRecord['status'] } : item))
    if (type === 'supplier-cost') setSupplierCosts((items) => items.map((item) => { if (item.id !== recordId) return item; const paid = confirmedSupplierPaid(item.id, supplierPayments); const amount = Math.max(Number(values.amount), paid); const status: SupplierCost['status'] = paid >= amount ? 'Paid' : values.dueDate < today() ? 'Overdue' : paid > 0 ? 'Partially Paid' : 'Unpaid'; return { ...item, supplier: values.supplier, category: values.category, amount, paid, dueDate: values.dueDate, status } }))
    if (type === 'package') setPackages((items) => items.map((item) => { if (item.id !== recordId) return item; const availability = Number(values.availability || 0); const requestedStatus = values.status as TravelPackage['status']; return { ...item, code: values.code, name: values.name, category: values.category, destination: values.destination, duration: values.duration, price: Number(values.price), estimatedCost: Number(values.estimatedCost || 0), availability, status: packageAvailabilityStatus(requestedStatus, availability) } }))
    if (type === 'lead' && values.status === 'Converted') convertLead(recordId, values)
    if (type === 'lead' && values.status !== 'Converted') setLeads((items) => items.map((item) => item.id === recordId ? { ...item, name: values.name, phone: values.phone, email: values.email || undefined, service: values.service, source: values.source, travelPeriod: values.travelPeriod, status: values.status as Lead['status'], followUp: values.followUp || undefined, groupSize: Number(values.groupSize || 1), city: values.city || undefined, notes: values.notes || undefined } : item))
    if (type === 'customer') setCustomers((items) => items.map((item) => item.id === recordId ? { ...item, name: values.name, phone: values.phone, email: values.email || undefined, nationality: values.nationality, city: values.city || undefined, historical: values.historical === 'true', notes: values.notes || undefined } : item))
    if (type === 'booking') {
      const existing = bookings.find((item) => item.id === recordId)
      if (existing) {
        const nextPartySize = Number(values.partySize || existing.partySize || 1)
        const nextStatus = values.status as Booking['status']
        const wasReserved = bookingReservesPlaces(existing.status) ? (existing.partySize || 1) : 0
        const willBeReserved = bookingReservesPlaces(nextStatus) ? nextPartySize : 0
        const delta = willBeReserved - wasReserved
        const linkedPackage = existing.packageId ? packages.find((item) => item.id === existing.packageId) : undefined
        if (linkedPackage && delta > 0 && (linkedPackage.status !== 'Active' || linkedPackage.availability < delta)) return
        if (linkedPackage && delta !== 0) {
          const availability = linkedPackage.availability - delta
          setPackages((items) => items.map((item) => item.id === linkedPackage.id ? { ...item, availability, status: packageAvailabilityStatus(item.status, availability) } : item))
        }
        setBookings((items) => items.map((item) => item.id === recordId ? { ...item, packageName: values.packageName, agreedPrice: Number(values.agreedPrice), partySize: nextPartySize, departureDate: values.departureDate, returnDate: values.returnDate, status: nextStatus } : item))
      }
    }
    if (type === 'payment') setPayments((items) => items.map((item) => item.id === recordId ? { ...item, amount: item.status === 'Pending' ? Number(values.amount) : item.amount, date: values.date, method: values.method as Payment['method'], status: item.status === 'Pending' ? (values.status as Payment['status']) : item.status, transactionReference: values.transactionReference || undefined } : item))
    if (type === 'traveller') setTravellers((items) => items.map((item) => { if (item.id !== recordId) return item; const linkedCustomer = customers.find((customer) => customer.id === values.customerId); return { ...item, name: values.name?.trim() || item.name, customerId: linkedCustomer?.id, nationality: values.nationality || linkedCustomer?.nationality || item.nationality, group: values.group?.trim() || undefined, status: values.status as Traveller['status'], documentsComplete: values.documentsComplete === 'true' } }))
    setEditing(null)
  }

  const value = useMemo(() => ({ leads, customers, bookings, packages, payments, travellers, supplierCosts, supplierPayments, documents, action, setAction, addRecord, editing, setEditing, updateRecord, convertLead, reversePayment, voidSupplierPayment }), [leads, customers, bookings, packages, payments, travellers, supplierCosts, supplierPayments, documents, action, editing])
  return <StoreContext.Provider value={value}>{!isDemo && dataError && <div role="alert" className="data-connection-error">Live database error: {dataError}</div>}{!isDemo && !dataReady && <div className="data-connection-loading" role="status">Loading agency records…</div>}{children}</StoreContext.Provider>
}

export const useAppStore = () => {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useAppStore must be used inside AppStoreProvider')
  return context
}
