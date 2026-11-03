import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { initialBookings, initialCustomers, initialLeads, initialPackages, initialPayments, initialTravellers, supplierCosts as initialSupplierCosts, documents as initialDocuments } from '@/data/mockData'
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
}

const StoreContext = createContext<AppStore | null>(null)
const id = () => crypto.randomUUID()
const reference = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
const today = () => new Date().toISOString().slice(0, 10)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState(initialLeads)
  const [customers, setCustomers] = useState(initialCustomers)
  const [bookings, setBookings] = useState(initialBookings)
  const [packages, setPackages] = useState<TravelPackage[]>(initialPackages)
  const [payments, setPayments] = useState(initialPayments)
  const [travellers, setTravellers] = useState(initialTravellers)
  const [supplierCosts, setSupplierCosts] = useState<SupplierCost[]>(initialSupplierCosts)
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>([])
  const [documents, setDocuments] = useState<DocumentRecord[]>(initialDocuments)
  const [action, setAction] = useState<QuickActionType | null>(null)
  const [editing, setEditing] = useState<{ type: QuickActionType; id: string } | null>(null)

  const addRecord = (type: QuickActionType, values: Record<string, string>) => {
    if (type === 'document') setDocuments((items) => [{ id: id(), name: values.name, category: values.category, relatedType: values.relatedType as DocumentRecord['relatedType'], relatedReference: values.relatedReference, url: values.url, recordedAt: today(), status: values.status as DocumentRecord['status'] }, ...items])
    if (type === 'supplier-cost') setSupplierCosts((items) => [{ id: id(), bookingId: values.bookingId, supplier: values.supplier, category: values.category, amount: Number(values.amount), dueDate: values.dueDate, paid: 0, status: 'Unpaid' }, ...items])
    if (type === 'supplier-payment') {
      const payment: SupplierPayment = { id: id(), supplierCostId: values.supplierCostId, amount: Number(values.amount), date: values.date, method: values.method as SupplierPayment['method'], reference: values.reference || undefined }
      setSupplierPayments((items) => [payment, ...items])
      setSupplierCosts((items) => items.map((cost) => {
        if (cost.id !== values.supplierCostId) return cost
        const paid = cost.paid + payment.amount
        return { ...cost, paid, status: paid >= cost.amount ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Unpaid' }
      }))
    }
    if (type === 'package') setPackages((items) => [{ id: id(), code: values.code, name: values.name, category: values.category, destination: values.destination, duration: values.duration, price: Number(values.price), estimatedCost: Number(values.estimatedCost || 0), currency: 'NGN', availability: Number(values.availability || 0), status: (values.status || 'Draft') as TravelPackage['status'] }, ...items])
    if (type === 'lead') setLeads((items) => [{ id: id(), reference: `DNC-2026-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, name: values.name, phone: values.phone, email: values.email, service: values.service, travelPeriod: values.travelPeriod || 'Flexible', source: values.source, status: (values.status || 'New') as Lead['status'], receivedAt: today(), followUp: values.followUp || undefined, groupSize: Number(values.groupSize || 1), city: values.city }, ...items])
    if (type === 'customer') setCustomers((items) => [{ id: id(), reference: reference('CUS'), name: values.name, phone: values.phone, email: values.email, nationality: values.nationality || 'Nigerian', city: values.city, historical: values.historical === 'true', createdAt: today() }, ...items])
    if (type === 'booking') setBookings((items) => [{ id: id(), reference: `BKG-2026-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, customerId: values.customerId, packageId: values.packageId || undefined, packageName: values.packageName, agreedPrice: Number(values.agreedPrice || values.amount), currency: 'NGN', bookingDate: today(), departureDate: values.departureDate, returnDate: values.returnDate, status: (values.status || 'Pending Confirmation') as Booking['status'] }, ...items])
    if (type === 'payment') {
      let customer = customers.find((item) => item.reference === values.customerName?.split(' — ').at(-1))
      if (!customer && values.customerName?.trim()) {
        customer = { id: id(), reference: reference('CUS'), name: values.customerName.trim(), phone: values.customerPhone.trim(), email: values.customerEmail.trim() || undefined, nationality: values.customerNationality || 'Nigerian', createdAt: today() }
        setCustomers((items) => [customer!, ...items])
      }
      if (customer) {
        const selectedBooking = bookings.find((booking) => booking.id === values.bookingId && booking.customerId === customer!.id)
        setPayments((items) => [{ id: id(), reference: reference('PAY'), bookingId: selectedBooking?.id, customerId: customer!.id, packageId: values.purposeType === 'package' ? values.packageId || undefined : undefined, purpose: values.purposeType === 'package' ? (packages.find((item) => item.id === values.packageId)?.name || 'Package payment') : values.customPurpose.trim(), amount: Number(values.amount), date: values.date, method: values.method as Payment['method'], status: (values.status || 'Confirmed') as Payment['status'], transactionReference: values.transactionReference || undefined }, ...items])
      }
    }
    if (type === 'traveller') setTravellers((items) => [{ id: id(), name: values.name, bookingId: values.bookingId, nationality: values.nationality || 'Nigerian', status: (values.status || 'Not Started') as Traveller['status'], group: values.group || undefined, documentsComplete: ['Documents Complete', 'Ready for Travel', 'Departed', 'Abroad', 'Returned'].includes(values.status) }, ...items])
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
        reference: `CUS-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
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
    setLeads((items) => items.map((item) => item.id === leadId ? { ...item, status: 'Converted' } : item))
  }

  const reversePayment = (paymentId: string, reason: string) => {
    if (!reason.trim()) return
    setPayments((items) => items.map((payment) => payment.id === paymentId && payment.status === 'Confirmed' ? { ...payment, status: 'Reversed', reversalReason: reason.trim() } : payment))
  }

  const updateRecord = (type: QuickActionType, recordId: string, values: Record<string, string>) => {
    if (type === 'document') setDocuments((items) => items.map((item) => item.id === recordId ? { ...item, name: values.name, category: values.category, relatedType: values.relatedType as DocumentRecord['relatedType'], relatedReference: values.relatedReference, url: values.url, status: values.status as DocumentRecord['status'] } : item))
    if (type === 'supplier-cost') setSupplierCosts((items) => items.map((item) => item.id === recordId ? { ...item, supplier: values.supplier, category: values.category, amount: Math.max(Number(values.amount), item.paid), dueDate: values.dueDate, status: item.paid >= Number(values.amount) ? 'Paid' : item.paid > 0 ? 'Partially Paid' : 'Unpaid' } : item))
    if (type === 'package') setPackages((items) => items.map((item) => item.id === recordId ? { ...item, code: values.code, name: values.name, category: values.category, destination: values.destination, duration: values.duration, price: Number(values.price), estimatedCost: Number(values.estimatedCost || 0), availability: Number(values.availability || 0), status: values.status as TravelPackage['status'] } : item))
    if (type === 'lead' && values.status === 'Converted') convertLead(recordId, values)
    if (type === 'lead' && values.status !== 'Converted') setLeads((items) => items.map((item) => item.id === recordId ? { ...item, name: values.name, phone: values.phone, email: values.email || undefined, service: values.service, source: values.source, travelPeriod: values.travelPeriod, status: values.status as Lead['status'], followUp: values.followUp || undefined, groupSize: Number(values.groupSize || 1), city: values.city || undefined, notes: values.notes || undefined } : item))
    if (type === 'customer') setCustomers((items) => items.map((item) => item.id === recordId ? { ...item, name: values.name, phone: values.phone, email: values.email || undefined, nationality: values.nationality, city: values.city || undefined, historical: values.historical === 'true', notes: values.notes || undefined } : item))
    if (type === 'booking') setBookings((items) => items.map((item) => item.id === recordId ? { ...item, packageName: values.packageName, agreedPrice: Number(values.agreedPrice), departureDate: values.departureDate, returnDate: values.returnDate, status: values.status as Booking['status'] } : item))
    if (type === 'payment') setPayments((items) => items.map((item) => item.id === recordId ? { ...item, amount: Number(values.amount), date: values.date, method: values.method as Payment['method'], status: item.status === 'Pending' ? (values.status as Payment['status']) : item.status, transactionReference: values.transactionReference || undefined } : item))
    if (type === 'traveller') setTravellers((items) => items.map((item) => item.id === recordId ? { ...item, name: values.name, nationality: values.nationality, group: values.group || undefined, status: values.status as Traveller['status'], documentsComplete: values.status === 'Documents Complete' || values.status === 'Ready for Travel' || values.status === 'Departed' || values.status === 'Abroad' || values.status === 'Returned' } : item))
    setEditing(null)
  }

  const value = useMemo(() => ({ leads, customers, bookings, packages, payments, travellers, supplierCosts, supplierPayments, documents, action, setAction, addRecord, editing, setEditing, updateRecord, convertLead, reversePayment }), [leads, customers, bookings, packages, payments, travellers, supplierCosts, supplierPayments, documents, action, editing])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useAppStore = () => {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useAppStore must be used inside AppStoreProvider')
  return context
}
