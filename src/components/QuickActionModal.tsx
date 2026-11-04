import { useState, type FormEvent } from 'react'
import { useAppStore } from '@/hooks/useAppStore'
import { Button, Field, Input, Modal, Select } from '@/components/ui'
import { money } from '@/lib/business'
import type { Booking, QuickActionType } from '@/types'

const details: Record<QuickActionType, { title: string; description: string }> = {
  lead: { title: 'Add lead', description: 'Create a new customer enquiry and record its source and follow-up details.' },
  customer: { title: 'Add customer', description: 'Create a direct or historical customer without requiring a lead.' },
  booking: { title: 'Create booking', description: 'The agreed amount is saved as a booking snapshot and will not change with package prices.' },
  payment: { title: 'Record payment', description: 'Only confirmed payments reduce the calculated outstanding balance.' },
  traveller: { title: 'Add traveller', description: 'Add an individual traveller to an existing booking.' },
  package: { title: 'Create package', description: 'Add a travel package to the agency catalogue.' },
  'supplier-cost': { title: 'Record supplier cost', description: 'Record an amount owed to a supplier for a booking.' },
  'supplier-payment': { title: 'Record supplier payment', description: 'Record money paid against an existing supplier cost.' },
  document: { title: 'Add document link', description: 'Save a link to a document stored in an approved location.' },
}

export function QuickActionModal() {
  const { mode, action, setAction, actionDefaults, addRecord, updateRecord, editing, setEditing, leads, customers, bookings, packages, payments, travellers, supplierCosts, documents } = useAppStore()
  const [error, setError] = useState('')
  const [paymentPurposeType, setPaymentPurposeType] = useState<'package' | 'custom'>('package')
  if (!action) return null

  const current = editing?.type === action ? ({
    lead: leads.find((item) => item.id === editing.id),
    customer: customers.find((item) => item.id === editing.id),
    booking: bookings.find((item) => item.id === editing.id),
    payment: payments.find((item) => item.id === editing.id),
    traveller: travellers.find((item) => item.id === editing.id),
    package: packages.find((item) => item.id === editing.id),
    'supplier-cost': supplierCosts.find((item) => item.id === editing.id),
    'supplier-payment': undefined,
    document: documents.find((item) => item.id === editing.id),
  }[action]) : undefined
  const isEditing = Boolean(current)
  const close = () => { setAction(null); setEditing(null); setError(''); setPaymentPurposeType('package') }
  const value = (key: string, fallback = '') => current && key in current ? String((current as unknown as Record<string, unknown>)[key] ?? '') : (actionDefaults[key] ?? fallback)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>
    if (!values.name && (action === 'lead' || action === 'customer' || action === 'traveller')) return setError('Please enter a full name.')
    if (action === 'traveller' && !isEditing && !values.bookingId) return setError('Select the booking this traveller belongs to.')
    if (action === 'traveller' && values.customerId && !customers.some((customer) => customer.id === values.customerId)) return setError('Select a valid customer profile.')
    if (action === 'booking' && (!values.departureDate || !values.returnDate || !Number.isFinite(Date.parse(values.departureDate)) || !Number.isFinite(Date.parse(values.returnDate)))) return setError('Enter valid departure and return dates.')
    if (action === 'booking' && new Date(values.returnDate) <= new Date(values.departureDate)) return setError('Return date must be after the departure date.')
    if (action === 'booking' && (!Number.isFinite(Number(values.agreedPrice)) || Number(values.agreedPrice) <= 0)) return setError('Agreed price must be a valid number greater than zero.')
    if (action === 'booking' && (!Number.isInteger(Number(values.partySize)) || Number(values.partySize) < 1)) return setError('Enter the number of travellers as a whole number of at least one.')
    if (action === 'lead' && values.followUp && !Number.isFinite(Date.parse(values.followUp))) return setError('Enter a valid follow-up date.')
    if (action === 'booking' && !isEditing && !customers.some((customer) => customer.id === values.customerId)) return setError('Select a valid customer for this booking.')
    if (action === 'booking' && values.packageId && !packages.some((item) => item.id === values.packageId && item.status === 'Active' && item.availability >= Number(values.partySize))) return setError('The selected package does not have enough available places for this travelling party.')
    if (action === 'booking' && isEditing && current && 'packageId' in current && current.packageId) {
      const existing = current as Booking
      const selectedPackage = packages.find((item) => item.id === existing.packageId)
      const oldReserved = !['Enquiry', 'Cancelled'].includes(existing.status) ? (existing.partySize || 1) : 0
      const nextReserved = !['Enquiry', 'Cancelled'].includes(values.status as typeof existing.status) ? Number(values.partySize) : 0
      const additionalPlaces = nextReserved - oldReserved
      if (selectedPackage && additionalPlaces > 0 && (selectedPackage.status !== 'Active' || selectedPackage.availability < additionalPlaces)) return setError('There are not enough remaining places to make this booking change.')
    }
    if (action === 'payment' && (!Number.isFinite(Number(values.amount)) || Number(values.amount) <= 0)) return setError('Amount must be a valid number greater than zero.')
    if (action === 'payment' && (!values.date || !Number.isFinite(Date.parse(values.date)))) return setError('Enter a valid date the payment was received.')
    if (action === 'payment' && !isEditing) {
      const enteredName = values.customerName.split(' — ')[0].trim().toLocaleLowerCase()
      const matchingCustomers = customers.filter((customer) => customer.name.trim().toLocaleLowerCase() === enteredName)
      const selectedCustomer = customers.find((customer) => customer.reference === values.customerName.split(' — ').at(-1)) || (matchingCustomers.length === 1 ? matchingCustomers[0] : undefined)
      if (!selectedCustomer && !values.customerPhone?.trim()) return setError('Enter a phone number when adding a new customer.')
      if (values.purposeType === 'package' && !values.packageId) return setError('Select the package this payment is for.')
      if (values.purposeType === 'custom' && !values.customPurpose?.trim()) return setError('Enter a description for this custom payment.')
      if (!selectedCustomer && values.bookingId) return setError("A new customer cannot be linked to an existing customer's booking. Create their booking separately first.")
      if (values.bookingId && selectedCustomer && bookings.find((booking) => booking.id === values.bookingId)?.customerId !== selectedCustomer.id) return setError('The selected booking does not belong to this customer.')
      if (values.bookingId && values.purposeType === 'package' && bookings.find((booking) => booking.id === values.bookingId)?.packageId !== values.packageId) return setError('The selected booking is not for this package.')
      if (values.bookingId && selectedCustomer && bookings.find((booking) => booking.id === values.bookingId) && payments.filter((payment) => payment.bookingId === values.bookingId && payment.status === 'Confirmed').reduce((sum, payment) => sum + payment.amount, 0) + Number(values.amount) > (bookings.find((booking) => booking.id === values.bookingId)?.agreedPrice ?? 0)) return setError('This payment exceeds the booking balance. Check the existing payments or adjust the amount.')
    }
    if (action === 'payment' && isEditing && current && 'status' in current && current.status === 'Pending' && values.status === 'Confirmed' && current.bookingId) {
      const booking = bookings.find((item) => item.id === current.bookingId)
      const alreadyConfirmed = payments.filter((item) => item.bookingId === current.bookingId && item.id !== current.id && item.status === 'Confirmed').reduce((sum, item) => sum + item.amount, 0)
      if (booking && alreadyConfirmed + Number(values.amount) > booking.agreedPrice) return setError('Confirming this payment would exceed the booking balance. Check other confirmed payments or correct the amount.')
    }
    if (action === 'supplier-cost' && (!Number.isFinite(Number(values.amount)) || Number(values.amount) <= 0)) return setError('Supplier cost must be a valid number greater than zero.')
    if (action === 'supplier-cost' && (!values.dueDate || !Number.isFinite(Date.parse(values.dueDate)))) return setError('Enter a valid supplier cost due date.')
    if (action === 'supplier-cost' && values.bookingId && !bookings.some((booking) => booking.id === values.bookingId)) return setError('Select a valid booking for this supplier cost.')
    if (action === 'supplier-cost' && isEditing && Number(values.amount) < (supplierCosts.find((cost) => cost.id === editing?.id)?.paid ?? 0)) return setError('Supplier cost cannot be reduced below the amount already paid.')
    if (action === 'supplier-payment' && (!Number.isFinite(Number(values.amount)) || Number(values.amount) <= 0)) return setError('Payment amount must be a valid number greater than zero.')
    if (action === 'supplier-payment' && (!values.date || !Number.isFinite(Date.parse(values.date)))) return setError('Enter a valid date the supplier payment was made.')
    if (action === 'supplier-payment' && !supplierCosts.some((cost) => cost.id === values.supplierCostId && cost.paid < cost.amount)) return setError('Select a supplier cost with an outstanding balance.')
    if (action === 'supplier-payment' && Number(values.amount) > (supplierCosts.find((cost) => cost.id === values.supplierCostId)?.amount ?? 0) - (supplierCosts.find((cost) => cost.id === values.supplierCostId)?.paid ?? 0)) return setError('Payment cannot exceed the outstanding supplier balance.')
    if (action === 'package' && (!Number.isFinite(Number(values.price)) || Number(values.price) <= 0)) return setError('Package selling price must be a valid number greater than zero.')
    if (action === 'package' && (!Number.isFinite(Number(values.estimatedCost || 0)) || Number(values.estimatedCost || 0) < 0)) return setError('Estimated cost must be a valid amount of zero or more.')
    if (action === 'package' && Number(values.estimatedCost || 0) > Number(values.price)) return setError('Estimated cost cannot exceed the selling price.')
    if (action === 'package' && (!Number.isInteger(Number(values.availability)) || Number(values.availability) < 0)) return setError('Available places must be a whole number of zero or more.')
    if (action === 'document') {
      if (!values.relatedReference?.trim()) return setError('Enter the reference or name of the related record.')
      try {
        const url = new URL(values.url)
        if (url.protocol !== 'https:') return setError('Use a secure HTTPS link for this document.')
      } catch { return setError('Enter a valid document link beginning with https://.') }
    }
    if (isEditing && editing) updateRecord(action, editing.id, values)
    else addRecord(action, values)
    close()
  }

  return <Modal title={isEditing ? `Edit ${action}` : details[action].title} description={details[action].description} onClose={close}>
    <form className="form-grid" onSubmit={submit}>
      {(action === 'lead' || action === 'customer') && <Field label="Full name"><Input name="name" defaultValue={value('name')} autoFocus required /></Field>}
      {(action === 'lead' || action === 'customer') && <Field label="Phone number"><Input name="phone" type="tel" defaultValue={value('phone')} required /></Field>}
      {(action === 'lead' || action === 'customer') && <Field label="Email (optional)"><Input name="email" type="email" defaultValue={value('email')} /></Field>}
      {action === 'lead' && <>
        <Field label="Service of interest"><Select name="service" defaultValue={value('service', 'Umrah')} required><option>Umrah</option><option>Hajj</option><option>General Travel</option><option>Other Tours</option></Select></Field>
        <Field label="Lead source" hint="Where this enquiry came from."><Select name="source" defaultValue={value('source', 'WhatsApp')} required><option>WhatsApp</option><option>Facebook Ads</option><option>Instagram Ads</option><option>Website</option><option>Referral</option><option>Walk-in</option><option>Other</option></Select></Field>
        <Field label="Preferred travel period"><Input name="travelPeriod" defaultValue={value('travelPeriod')} placeholder="e.g. Ramadan 2026" /></Field>
        <Field label="Number of travellers"><Input name="groupSize" type="number" min="1" defaultValue={value('groupSize', '1')} /></Field>
        <Field label="Follow-up date"><Input name="followUp" type="date" defaultValue={value('followUp')} /></Field>
        <Field label="Status"><Select name="status" defaultValue={value('status', 'New')}><option>New</option><option>Contacted</option><option>Follow-up Required</option><option>Interested</option><option>Not Interested</option><option>Converted</option><option>Lost</option></Select></Field>
      </>}
      {action === 'customer' && <>
        <Field label="Nationality"><Input name="nationality" defaultValue={value('nationality', 'Nigerian')} /></Field>
        <Field label="City"><Input name="city" defaultValue={value('city')} /></Field>
        <Field label="Customer type"><Select name="historical" defaultValue={value('historical', 'false')}><option value="false">Current customer</option><option value="true">Historical customer</option></Select></Field>
      </>}
      {action === 'booking' && <>
        {!isEditing && <Field label="Customer"><Select name="customerId" required defaultValue=""><option value="">Select customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · {customer.reference}</option>)}</Select></Field>}
        {isEditing && <Field label="Customer"><Input value={current && 'customerId' in current ? customers.find((customer) => customer.id === current.customerId)?.name || 'Customer unavailable' : 'Customer unavailable'} readOnly /><small>The booking owner is fixed after creation so payment and customer history remain consistent.</small></Field>}
        {!isEditing && <Field label="Package (optional)"><Select name="packageId" defaultValue=""><option value="">Custom arrangement</option>{packages.filter((item) => item.status === 'Active' && item.availability > 0).map((item) => <option key={item.id} value={item.id}>{item.name} · {money(item.price)} · {item.availability} places</option>)}</Select></Field>}
        <Field label="Package / arrangement name"><Input name="packageName" defaultValue={value('packageName')} required /></Field>
        <Field label="Agreed price"><Input name="agreedPrice" type="number" min="1" defaultValue={value('agreedPrice')} required /></Field>
        <Field label="Number of travellers"><Input name="partySize" type="number" min="1" step="1" defaultValue={value('partySize', '1')} required /></Field>
        <Field label="Departure date"><Input name="departureDate" type="date" defaultValue={value('departureDate')} required /></Field>
        <Field label="Return date"><Input name="returnDate" type="date" defaultValue={value('returnDate')} required /></Field>
        <Field label="Status"><Select name="status" defaultValue={value('status', 'Pending Confirmation')}><option>Enquiry</option><option>Pending Confirmation</option><option>Confirmed</option><option>In Preparation</option><option>Ready for Travel</option><option>Travelling</option><option>Completed</option><option>Cancelled</option></Select></Field>
      </>}
      {action === 'payment' && <>
        {!isEditing && <>
          <Field label="Customer" hint="Start typing a name. Choose a suggestion, or enter a new customer's name."><Input name="customerName" list="payment-customer-options" placeholder="Search or enter customer name" required /><datalist id="payment-customer-options">{customers.map((customer) => <option key={customer.id} value={`${customer.name} — ${customer.reference}`} />)}</datalist></Field>
          <Field label="New customer's phone number" hint="Only needed when adding a new customer."><Input name="customerPhone" type="tel" placeholder="e.g. +234..." /></Field>
          <Field label="New customer's email (optional)"><Input name="customerEmail" type="email" /></Field>
          <Field label="New customer's nationality"><Input name="customerNationality" defaultValue="Nigerian" /></Field>
          <Field label="What is this payment for?"><Select name="purposeType" value={paymentPurposeType} onChange={(event) => setPaymentPurposeType(event.target.value as 'package' | 'custom')}><option value="package">Existing package</option><option value="custom">Custom service or item</option></Select></Field>
          {paymentPurposeType === 'package' ? <Field label="Package"><Select name="packageId" defaultValue=""><option value="">Select a package</option>{packages.filter((item) => item.status !== 'Archived').map((item) => <option key={item.id} value={item.id}>{item.name} · {money(item.price)}</option>)}</Select></Field> : <Field label="Custom payment description"><Input name="customPurpose" placeholder="e.g. Visa processing, flight ticket, hotel" required /></Field>}
          <Field label="Related booking (optional)" hint="Only select a booking belonging to the customer above."><Select name="bookingId" defaultValue=""><option value="">Not linked to a booking</option>{bookings.filter((booking) => booking.status !== 'Cancelled').map((booking) => <option key={booking.id} value={booking.id}>{customers.find((customer) => customer.id === booking.customerId)?.name} · {booking.reference} · {booking.packageName}</option>)}</Select></Field>
        </>}
        {isEditing && <Field label="Customer"><Input value={(current && 'customerId' in current ? customers.find((customer) => customer.id === current.customerId)?.name : undefined) || 'Customer unavailable'} readOnly /></Field>}
        <Field label="Amount received"><Input name="amount" type="number" min="1" defaultValue={value('amount')} readOnly={isEditing && (!current || !('status' in current) || current.status !== 'Pending')} required /></Field>
        <Field label="Payment date"><Input name="date" type="date" defaultValue={value('date', new Date().toISOString().slice(0, 10))} required /></Field>
        <Field label="Payment method"><Select name="method" defaultValue={value('method', 'Bank Transfer')}><option>Bank Transfer</option><option>Cash</option><option>POS</option><option>Other</option></Select></Field>
        {!isEditing && <Field label="Status"><Select name="status" defaultValue="Confirmed"><option>Pending</option><option>Confirmed</option></Select></Field>}
        {isEditing && current && 'status' in current && current.status === 'Pending' && <Field label="Status"><Select name="status" defaultValue="Pending"><option>Pending</option><option>Confirmed</option><option>Failed</option></Select></Field>}
        {isEditing && current && 'status' in current && current.status !== 'Pending' && <Field label="Status"><Input value={value('status')} readOnly /></Field>}
        <Field label="Transaction reference"><Input name="transactionReference" defaultValue={value('transactionReference')} /></Field>
      </>}
      {action === 'document' && <>
        <Field label="Document name"><Input name="name" defaultValue={value('name')} required /></Field>
        <Field label="Category"><Select name="category" defaultValue={value('category', 'Passport')}><option>Passport</option><option>Visa</option><option>Flight Ticket</option><option>Hotel Voucher</option><option>Payment Receipt</option><option>Invoice</option><option>Other</option></Select></Field>
        <Field label="Related record type"><Select name="relatedType" defaultValue={value('relatedType', 'Booking')}><option>Customer</option><option>Booking</option><option>Traveller</option><option>Payment</option><option>Supplier</option></Select></Field>
        <Field label="Related record reference"><Input name="relatedReference" defaultValue={value('relatedReference')} placeholder="Customer ID, booking reference, etc." required /></Field>
        <Field label="Document URL"><Input name="url" type="url" defaultValue={value('url')} placeholder="https://..." required /></Field>
        <Field label="Review status"><Select name="status" defaultValue={value('status', 'Needs Review')}><option>Valid</option><option>Expiring Soon</option><option>Needs Review</option></Select></Field>
      </>}
      {action === 'supplier-cost' && <>
        <Field label="Booking"><Select name="bookingId" required>{bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.reference} · {booking.packageName}</option>)}</Select></Field>
        <Field label="Supplier"><Input name="supplier" required /></Field>
        <Field label="Cost description"><Input name="category" placeholder="e.g. Accommodation, flights, visa" required /></Field>
        <Field label="Total cost (NGN)"><Input name="amount" type="number" min="1" required /></Field>
        <Field label="Payment due date"><Input name="dueDate" type="date" required /></Field>
      </>}
      {action === 'supplier-payment' && <>
        <Field label="Supplier cost"><Select name="supplierCostId" required defaultValue={editing?.type === 'supplier-payment' ? editing.id : ''}><option value="">Select supplier cost</option>{supplierCosts.filter((cost) => cost.paid < cost.amount).map((cost) => <option key={cost.id} value={cost.id}>{cost.supplier} · {cost.category} · Outstanding ₦{(cost.amount-cost.paid).toLocaleString('en-NG')}</option>)}</Select></Field>
        <Field label="Amount paid (NGN)"><Input name="amount" type="number" min="1" required /></Field>
        <Field label="Payment date"><Input name="date" type="date" required /></Field>
        <Field label="Payment method"><Select name="method"><option>Bank Transfer</option><option>Cash</option><option>POS</option><option>Other</option></Select></Field>
        <Field label="Transaction reference (optional)"><Input name="reference" /></Field>
      </>}
      {action === 'package' && <>
        <Field label="Package code"><Input name="code" defaultValue={value('code')} required /></Field>
        <Field label="Package name"><Input name="name" defaultValue={value('name')} required /></Field>
        <Field label="Category"><Select name="category" defaultValue={value('category', 'Umrah')}><option>Umrah</option><option>Hajj</option><option>Other Tours</option><option>General Travel</option></Select></Field>
        <Field label="Destination"><Input name="destination" defaultValue={value('destination', 'Makkah & Madinah')} required /></Field>
        <Field label="Duration"><Input name="duration" defaultValue={value('duration')} placeholder="e.g. 10 days" required /></Field>
        <Field label="Selling price (NGN)"><Input name="price" type="number" min="1" defaultValue={value('price')} required /></Field>
        <Field label="Estimated cost (NGN)"><Input name="estimatedCost" type="number" min="0" defaultValue={value('estimatedCost', '0')} /></Field>
        <Field label="Available places"><Input name="availability" type="number" min="0" defaultValue={value('availability', '0')} /></Field>
        <Field label="Status"><Select name="status" defaultValue={value('status', 'Draft')}><option>Draft</option><option>Active</option><option>Fully Booked</option><option>Unavailable</option><option>Archived</option></Select></Field>
      </>}
      {action === 'traveller' && <>
        {!isEditing && <Field label="Booking"><Select name="bookingId" required defaultValue={value('bookingId')}><option value="">Select booking</option>{bookings.filter((booking) => booking.status !== 'Cancelled').map((booking) => <option key={booking.id} value={booking.id}>{booking.reference} · {customers.find((customer) => customer.id === booking.customerId)?.name} · {booking.packageName}</option>)}</Select></Field>}
        <Field label="Link to customer profile (optional)" hint="Choose an existing customer if this traveller already has a customer record. Dependants can remain traveller-only records."><Select name="customerId" defaultValue={value('customerId')}><option value="">No linked customer profile</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · {customer.reference}</option>)}</Select></Field>
        <Field label="Traveller's full name"><Input name="name" defaultValue={value('name')} required /></Field>
        <Field label="Nationality"><Input name="nationality" defaultValue={value('nationality', 'Nigerian')} /></Field>
        <Field label="Traveller group"><Input name="group" defaultValue={value('group')} placeholder="e.g. Bello Family" /></Field>
        <Field label="Document readiness"><Select name="documentsComplete" defaultValue={value('documentsComplete', 'false')}><option value="false">Documents incomplete / pending</option><option value="true">Documents complete</option></Select></Field>
        <Field label="Travel status"><Select name="status" defaultValue={value('status', 'Not Started')}><option>Not Started</option><option>Documents Pending</option><option>Documents Complete</option><option>Ready for Travel</option><option>Departed</option><option>Abroad</option><option>Returned</option></Select></Field>
      </>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions"><Button type="button" variant="secondary" onClick={close}>Cancel</Button><Button type="submit">{isEditing ? 'Save changes' : mode === 'demo' ? 'Save demo record' : 'Save record'}</Button></div>
    </form>
  </Modal>
}
