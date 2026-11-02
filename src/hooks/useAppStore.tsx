import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { initialBookings, initialCustomers, initialLeads, initialPackages, initialPayments, initialTravellers } from '@/data/mockData'
import type { Booking, Customer, Lead, Payment, QuickActionType, Traveller } from '@/types'

type AppStore = {
  leads: Lead[]
  customers: Customer[]
  bookings: Booking[]
  packages: typeof initialPackages
  payments: Payment[]
  travellers: Traveller[]
  action: QuickActionType | null
  setAction: (action: QuickActionType | null) => void
  addRecord: (type: QuickActionType, values: Record<string, string>) => void
  editing: { type: QuickActionType; id: string } | null
  setEditing: (value: { type: QuickActionType; id: string } | null) => void
  updateRecord: (type: QuickActionType, recordId: string, values: Record<string, string>) => void
}

const StoreContext = createContext<AppStore | null>(null)
const id = () => crypto.randomUUID()
const today = () => new Date().toISOString().slice(0, 10)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState(initialLeads)
  const [customers, setCustomers] = useState(initialCustomers)
  const [bookings, setBookings] = useState(initialBookings)
  const [payments, setPayments] = useState(initialPayments)
  const [travellers, setTravellers] = useState(initialTravellers)
  const [action, setAction] = useState<QuickActionType | null>(null)
  const [editing, setEditing] = useState<{ type: QuickActionType; id: string } | null>(null)

  const addRecord = (type: QuickActionType, values: Record<string, string>) => {
    if (type === 'lead') setLeads((items) => [{ id: id(), reference: `DNC-2026-${Math.random().toString(36).slice(2, 10).toUpperCase()}`, name: values.name, phone: values.phone, email: values.email, service: values.service, travelPeriod: values.travelPeriod || 'Flexible', source: values.source, status: 'New', receivedAt: today(), followUp: values.date, groupSize: Number(values.count || 1), city: values.city }, ...items])
    if (type === 'customer') setCustomers((items) => [{ id: id(), reference: `CUS-${1100 + items.length}`, name: values.name, phone: values.phone, email: values.email, nationality: values.nationality || 'Nigerian', city: values.city, historical: values.historical === 'true', createdAt: today() }, ...items])
    if (type === 'booking') setBookings((items) => [{ id: id(), reference: `BKG-2026-${String(160 + items.length).padStart(4, '0')}`, customerId: values.customerId, packageId: values.packageId || undefined, packageName: values.packageName, agreedPrice: Number(values.amount), currency: 'NGN', bookingDate: today(), departureDate: values.departureDate, returnDate: values.returnDate, status: 'Pending Confirmation' }, ...items])
    if (type === 'payment') setPayments((items) => [{ id: id(), reference: `PAY-${String(510 + items.length).padStart(5, '0')}`, bookingId: values.bookingId, customerId: bookings.find((booking) => booking.id === values.bookingId)?.customerId ?? '', amount: Number(values.amount), date: values.date, method: values.method as Payment['method'], status: 'Confirmed', transactionReference: values.reference }, ...items])
    if (type === 'traveller') setTravellers((items) => [{ id: id(), name: values.name, bookingId: values.bookingId, nationality: values.nationality || 'Nigerian', status: 'Not Started', group: values.group || undefined, documentsComplete: false }, ...items])
    setAction(null)
  }

  const updateRecord = (type: QuickActionType, recordId: string, values: Record<string, string>) => {
    if (type === 'lead') setLeads((items) => items.map((item) => item.id === recordId ? { ...item, name: values.name, phone: values.phone, email: values.email || undefined, service: values.service, source: values.source, travelPeriod: values.travelPeriod, status: values.status as Lead['status'], followUp: values.followUp || undefined, groupSize: Number(values.groupSize || 1), city: values.city || undefined, notes: values.notes || undefined } : item))
    if (type === 'customer') setCustomers((items) => items.map((item) => item.id === recordId ? { ...item, name: values.name, phone: values.phone, email: values.email || undefined, nationality: values.nationality, city: values.city || undefined, historical: values.historical === 'true', notes: values.notes || undefined } : item))
    if (type === 'booking') setBookings((items) => items.map((item) => item.id === recordId ? { ...item, packageName: values.packageName, agreedPrice: Number(values.agreedPrice), departureDate: values.departureDate, returnDate: values.returnDate, status: values.status as Booking['status'] } : item))
    if (type === 'payment') setPayments((items) => items.map((item) => item.id === recordId ? { ...item, amount: Number(values.amount), date: values.date, method: values.method as Payment['method'], status: values.status as Payment['status'], transactionReference: values.transactionReference || undefined } : item))
    if (type === 'traveller') setTravellers((items) => items.map((item) => item.id === recordId ? { ...item, name: values.name, nationality: values.nationality, group: values.group || undefined, status: values.status as Traveller['status'], documentsComplete: values.status === 'Documents Complete' || values.status === 'Ready for Travel' || values.status === 'Departed' || values.status === 'Abroad' || values.status === 'Returned' } : item))
    setEditing(null)
  }

  const value = useMemo(() => ({ leads, customers, bookings, packages: initialPackages, payments, travellers, action, setAction, addRecord, editing, setEditing, updateRecord }), [leads, customers, bookings, payments, travellers, action, editing])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useAppStore = () => {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useAppStore must be used inside AppStoreProvider')
  return context
}
