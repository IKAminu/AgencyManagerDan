import { useState, type FormEvent } from 'react'
import { useAppStore } from '@/hooks/useAppStore'
import { Button, Field, Input, Modal, Select } from '@/components/ui'
import type { QuickActionType } from '@/types'

const details: Record<QuickActionType, { title: string; description: string }> = {
  lead: { title: 'Add lead', description: 'Create a new enquiry. This demonstration record is kept in this browser session only.' },
  customer: { title: 'Add customer', description: 'Create a direct or historical customer without requiring a lead.' },
  booking: { title: 'Create booking', description: 'The agreed amount is saved as a booking snapshot and will not change with package prices.' },
  payment: { title: 'Record payment', description: 'Only confirmed payments reduce the calculated outstanding balance.' },
  traveller: { title: 'Add traveller', description: 'Add an individual traveller to an existing booking.' },
}

export function QuickActionModal() {
  const { action, setAction, addRecord, customers, bookings, packages } = useAppStore()
  const [error, setError] = useState('')
  if (!action) return null

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>
    if (!values.name && (action === 'lead' || action === 'customer' || action === 'traveller')) return setError('Please enter a full name.')
    if (action === 'booking' && new Date(values.returnDate) <= new Date(values.departureDate)) return setError('Return date must be after the departure date.')
    if (action === 'payment' && Number(values.amount) <= 0) return setError('Payment amount must be greater than zero.')
    addRecord(action, values)
  }

  return <Modal title={details[action].title} description={details[action].description} onClose={() => setAction(null)}>
    <form className="form-grid" onSubmit={submit}>
      {(action === 'lead' || action === 'customer' || action === 'traveller') && <Field label="Full name"><Input name="name" autoFocus required /></Field>}
      {(action === 'lead' || action === 'customer') && <Field label="Phone number"><Input name="phone" type="tel" required /></Field>}
      {(action === 'lead' || action === 'customer') && <Field label="Email (optional)"><Input name="email" type="email" /></Field>}
      {action === 'lead' && <>
        <Field label="Service of interest"><Select name="service" required><option>Umrah</option><option>Hajj</option><option>General Travel</option><option>Other Tours</option></Select></Field>
        <Field label="Lead source" hint="Where this enquiry came from."><Select name="source" required><option>WhatsApp</option><option>Facebook Ads</option><option>Instagram Ads</option><option>Website</option><option>Referral</option><option>Walk-in</option><option>Other</option></Select></Field>
        <Field label="Preferred travel period"><Input name="travelPeriod" placeholder="e.g. Ramadan 2026" /></Field>
        <Field label="Number of travellers"><Input name="count" type="number" min="1" defaultValue="1" /></Field>
        <Field label="Follow-up date"><Input name="date" type="date" /></Field>
      </>}
      {action === 'customer' && <>
        <Field label="Nationality"><Input name="nationality" defaultValue="Nigerian" /></Field>
        <Field label="City"><Input name="city" /></Field>
        <Field label="Customer type" hint="Use historical for clients served before Headquarters."><Select name="historical"><option value="false">Current customer</option><option value="true">Historical customer</option></Select></Field>
      </>}
      {action === 'booking' && <>
        <Field label="Customer"><Select name="customerId" required>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</Select></Field>
        <Field label="Package"><Select name="packageId" onChange={(event) => {
          const selected = packages.find((item) => item.id === event.target.value)
          const form = event.currentTarget.form
          if (selected && form) {
            ;(form.elements.namedItem('packageName') as HTMLInputElement).value = selected.name
            ;(form.elements.namedItem('amount') as HTMLInputElement).value = String(selected.price)
          }
        }}><option value="">Custom arrangement</option>{packages.filter((item) => item.status === 'Active').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field>
        <Field label="Package / arrangement name"><Input name="packageName" required /></Field>
        <Field label="Agreed price"><Input name="amount" type="number" min="1" required /></Field>
        <Field label="Departure date"><Input name="departureDate" type="date" required /></Field>
        <Field label="Return date"><Input name="returnDate" type="date" required /></Field>
      </>}
      {action === 'payment' && <>
        <Field label="Booking"><Select name="bookingId" required>{bookings.filter((booking) => booking.status !== 'Cancelled').map((booking) => <option key={booking.id} value={booking.id}>{booking.reference} — {booking.packageName}</option>)}</Select></Field>
        <Field label="Amount received"><Input name="amount" type="number" min="1" required /></Field>
        <Field label="Payment date"><Input name="date" type="date" required /></Field>
        <Field label="Payment method"><Select name="method"><option>Bank Transfer</option><option>Cash</option><option>POS</option><option>Other</option></Select></Field>
        <Field label="Transaction reference (optional)"><Input name="reference" /></Field>
      </>}
      {action === 'traveller' && <>
        <Field label="Booking"><Select name="bookingId" required>{bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.reference} — {booking.packageName}</option>)}</Select></Field>
        <Field label="Nationality"><Input name="nationality" defaultValue="Nigerian" /></Field>
        <Field label="Traveller group (optional)"><Input name="group" placeholder="e.g. Bello Family" /></Field>
      </>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions"><Button type="button" variant="secondary" onClick={() => setAction(null)}>Cancel</Button><Button type="submit">Save demo record</Button></div>
    </form>
  </Modal>
}
