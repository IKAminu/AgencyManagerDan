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

const lagosDateKey = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value || ''
  return [part('year'), part('month'), part('day')].join('-')
}

export const todayDate = () => lagosDateKey(new Date())

export const daysFromToday = (date: string) => {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return Number.NaN
  const target = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  const today = todayDate().split('-').map(Number)
  return Math.round((target - Date.UTC(today[0], today[1] - 1, today[2])) / 86400000)
}
