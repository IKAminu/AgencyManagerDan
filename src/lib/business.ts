import type { Booking, Payment, SupplierCost, Traveller } from '@/types'

export const money = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount)

export const shortDate = (date: string) =>
  new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`))

export const confirmedPaid = (bookingId: string, payments: Payment[]) =>
  payments.filter((payment) => payment.bookingId === bookingId && payment.status === 'Confirmed').reduce((sum, payment) => sum + payment.amount, 0)

export const bookingBalance = (booking: Booking, payments: Payment[]) =>
  Math.max(0, booking.agreedPrice - confirmedPaid(booking.id, payments))

export const travellerCount = (bookingId: string, travellers: Traveller[]) =>
  travellers.filter((traveller) => traveller.bookingId === bookingId).length

export const supplierOutstanding = (cost: SupplierCost) => Math.max(0, cost.amount - cost.paid)

export const daysFromToday = (date: string) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((new Date(`${date}T00:00:00`).getTime() - today.getTime()) / 86400000)
}
