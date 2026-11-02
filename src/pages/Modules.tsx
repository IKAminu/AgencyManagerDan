import { useMemo, useState } from 'react'
import { Download, ExternalLink, Filter, Info, Pencil, Plus, Search } from 'lucide-react'
import { Badge, Button, EmptyState, Input, PageHeader, Select, TableShell } from '@/components/ui'
import { documents, supplierCosts } from '@/data/mockData'
import { useAppStore } from '@/hooks/useAppStore'
import { bookingBalance, confirmedPaid, money, shortDate, supplierOutstanding, travellerCount } from '@/lib/business'
import type { QuickActionType } from '@/types'

function Toolbar({ query, setQuery, filter, setFilter, options }: { query: string; setQuery: (value: string) => void; filter: string; setFilter: (value: string) => void; options: string[] }) {
  return <div className="toolbar"><div className="table-search"><Search size={17} /><Input aria-label="Search records" placeholder="Search records…" value={query} onChange={(event) => setQuery(event.target.value)} /></div><div className="filter-select"><Filter size={16} /><Select aria-label="Filter records" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="">All statuses</option>{options.map((option) => <option key={option}>{option}</option>)}</Select></div><Button variant="secondary"><Download size={16} /> Export</Button></div>
}

function Module({ title, description, actionLabel, actionType, children, options = [], query, setQuery, filter, setFilter }: { title: string; description: string; actionLabel: string; actionType?: QuickActionType; children: React.ReactNode; options?: string[]; query: string; setQuery: (v: string) => void; filter: string; setFilter: (v: string) => void }) {
  const { setAction } = useAppStore()
  return <div className="page"><PageHeader title={title} description={description} action={<Button onClick={() => actionType && setAction(actionType)} disabled={!actionType}><Plus size={17} /> {actionLabel}</Button>} /><Toolbar query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} options={options} />{children}<div className="table-footer"><span>Showing current demo records</span><span>Updated from session data</span></div></div>
}

const useFilter = () => {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('')
  return { query, setQuery, filter, setFilter }
}

export function LeadsPage() {
  const controls = useFilter()
  const { leads, setAction, setEditing } = useAppStore()
  const rows = leads.filter((item) => (!controls.filter || item.status === controls.filter) && `${item.reference} ${item.name} ${item.phone} ${item.source}`.toLowerCase().includes(controls.query.toLowerCase()))
  return <Module title="Leads" description="Manage enquiries, follow-ups and conversion into customers." actionLabel="Add lead" actionType="lead" options={['New', 'Contacted', 'Follow-up Required', 'Interested', 'Converted', 'Lost']} {...controls}><TableShell><table><thead><tr><th>Lead reference</th><th>Name</th><th>Phone</th><th>Service</th><th>Source</th><th>Campaign</th><th>Status</th><th>Received</th><th>Next follow-up</th><th>Actions</th></tr></thead><tbody>{rows.map((lead) => <tr key={lead.id}><td><strong>{lead.reference}</strong></td><td>{lead.name}</td><td>{lead.phone}</td><td>{lead.service}</td><td>{lead.source}</td><td>{lead.campaign || '—'}</td><td><Badge>{lead.status}</Badge></td><td>{shortDate(lead.receivedAt)}</td><td>{lead.followUp ? shortDate(lead.followUp) : '—'}</td><td><Button variant="secondary" onClick={() => { setEditing({ type: 'lead', id: lead.id }); setAction('lead') }}><Pencil size={14} /> Edit</Button></td></tr>)}</tbody></table>{!rows.length && <EmptyState title="No leads found" text="Adjust the search or filter, or add a new enquiry." />}</TableShell></Module>
}

export function CustomersPage() {
  const controls = useFilter()
  const { customers, bookings, payments, setAction, setEditing } = useAppStore()
  const rows = customers.filter((item) => `${item.reference} ${item.name} ${item.phone} ${item.email}`.toLowerCase().includes(controls.query.toLowerCase()))
  return <Module title="Customer records" description="Permanent customer profiles and their complete relationship with Dandurgu." actionLabel="Add customer" actionType="customer" options={['Current', 'Historical']} {...controls}><TableShell><table><thead><tr><th>Customer</th><th>Contact</th><th>Nationality</th><th>Type</th><th>Bookings</th><th>Total paid</th><th>Outstanding</th><th>Actions</th></tr></thead><tbody>{rows.map((customer) => {
    const customerBookings = bookings.filter((item) => item.customerId === customer.id)
    return <tr key={customer.id}><td><strong>{customer.name}</strong><span className="cell-sub">{customer.reference}</span></td><td>{customer.phone}<span className="cell-sub">{customer.email || 'No email recorded'}</span></td><td>{customer.nationality}</td><td>{customer.historical ? <Badge>Historical</Badge> : 'Current'}</td><td>{customerBookings.length}</td><td>{money(payments.filter((item) => item.customerId === customer.id && item.status === 'Confirmed').reduce((sum, item) => sum + item.amount, 0))}</td><td><strong>{money(customerBookings.reduce((sum, booking) => sum + bookingBalance(booking, payments), 0))}</strong></td><td><Button variant="secondary" onClick={() => { setEditing({ type: 'customer', id: customer.id }); setAction('customer') }}><Pencil size={14} /> Edit</Button></td></tr>
  })}</tbody></table></TableShell></Module>
}

export function PackagesPage() {
  const controls = useFilter()
  const { packages } = useAppStore()
  const rows = packages.filter((item) => (!controls.filter || item.status === controls.filter) && `${item.code} ${item.name} ${item.category}`.toLowerCase().includes(controls.query.toLowerCase()))
  return <Module title="Travel packages" description="Manage the internal catalogue, pricing and availability." actionLabel="Create package" options={['Active', 'Draft', 'Fully Booked', 'Unavailable']} {...controls}><TableShell><table><thead><tr><th>Package</th><th>Category</th><th>Destination</th><th>Duration</th><th>Price</th><th>Estimated cost</th><th>Availability</th><th>Status</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><span className="cell-sub">{item.code}</span></td><td>{item.category}</td><td>{item.destination}</td><td>{item.duration}</td><td><strong>{money(item.price)}</strong></td><td>{money(item.estimatedCost)}</td><td>{item.availability} places</td><td><Badge>{item.status}</Badge></td></tr>)}</tbody></table></TableShell><p className="info-note"><Info size={16} /> Booking prices are stored as snapshots. Changing a package never rewrites an existing booking.</p></Module>
}

export function BookingsPage() {
  const controls = useFilter()
  const { bookings, customers, travellers, payments } = useAppStore()
  const rows = bookings.filter((item) => (!controls.filter || item.status === controls.filter) && `${item.reference} ${item.packageName} ${customers.find((c) => c.id === item.customerId)?.name}`.toLowerCase().includes(controls.query.toLowerCase()))
  return <Module title="Bookings" description="Commercial travel arrangements connecting customers, travellers and payments." actionLabel="Create booking" actionType="booking" options={['Pending Confirmation', 'Confirmed', 'In Preparation', 'Ready for Travel', 'Travelling', 'Completed']} {...controls}><TableShell><table><thead><tr><th>Booking</th><th>Customer</th><th>Package snapshot</th><th>Travel dates</th><th>Travellers</th><th>Agreed price</th><th>Paid</th><th>Outstanding</th><th>Status</th></tr></thead><tbody>{rows.map((booking) => <tr key={booking.id}><td><strong>{booking.reference}</strong></td><td>{customers.find((item) => item.id === booking.customerId)?.name}</td><td>{booking.packageName}</td><td>{shortDate(booking.departureDate)}<span className="cell-sub">to {shortDate(booking.returnDate)}</span></td><td>{travellerCount(booking.id, travellers)}</td><td>{money(booking.agreedPrice)}</td><td>{money(confirmedPaid(booking.id, payments))}</td><td><strong>{money(bookingBalance(booking, payments))}</strong></td><td><Badge>{booking.status}</Badge></td></tr>)}</tbody></table></TableShell></Module>
}

export function TravellersPage() {
  const controls = useFilter()
  const { travellers, bookings } = useAppStore()
  const rows = travellers.filter((item) => (!controls.filter || item.status === controls.filter) && `${item.name} ${item.group}`.toLowerCase().includes(controls.query.toLowerCase()))
  return <Module title="Travellers & operations" description="Coordinate traveller readiness, group relationships, departures and returns." actionLabel="Add traveller" actionType="traveller" options={['Not Started', 'Documents Pending', 'Documents Complete', 'Ready for Travel', 'Abroad', 'Returned']} {...controls}><TableShell><table><thead><tr><th>Traveller</th><th>Booking</th><th>Travel group</th><th>Departure</th><th>Expected return</th><th>Documents</th><th>Travel status</th></tr></thead><tbody>{rows.map((traveller) => {
    const booking = bookings.find((item) => item.id === traveller.bookingId)!
    return <tr key={traveller.id}><td><strong>{traveller.name}</strong><span className="cell-sub">{traveller.nationality}</span></td><td>{booking?.reference}</td><td>{traveller.group ? <span className="group-label">{traveller.group}</span> : '—'}</td><td>{shortDate(booking.departureDate)}</td><td>{shortDate(booking.returnDate)}</td><td>{traveller.documentsComplete ? 'Complete' : 'Needs attention'}</td><td><Badge>{traveller.status}</Badge></td></tr>
  })}</tbody></table></TableShell><p className="info-note"><Info size={16} /> Passport numbers are intentionally excluded from tables and global search. View them only in a secured traveller detail record after Supabase authentication is connected.</p></Module>
}

export function PaymentsPage() {
  const controls = useFilter()
  const { payments, bookings, customers } = useAppStore()
  const rows = payments.filter((item) => (!controls.filter || item.status === controls.filter) && `${item.reference} ${item.transactionReference} ${customers.find((c) => c.id === item.customerId)?.name}`.toLowerCase().includes(controls.query.toLowerCase()))
  const total = payments.filter((item) => item.status === 'Confirmed').reduce((sum, item) => sum + item.amount, 0)
  const balance = bookings.reduce((sum, booking) => sum + bookingBalance(booking, payments), 0)
  return <Module title="Payments & balances" description="Customer money received, transaction status and calculated booking balances." actionLabel="Record payment" actionType="payment" options={['Confirmed', 'Pending', 'Reversed', 'Failed']} {...controls}><div className="finance-summary"><div><span>Confirmed payments</span><strong>{money(total)}</strong></div><div><span>Total outstanding</span><strong>{money(balance)}</strong></div><div><span>Pending review</span><strong>{money(payments.filter((item) => item.status === 'Pending').reduce((sum, item) => sum + item.amount, 0))}</strong></div></div><TableShell><table><thead><tr><th>Payment</th><th>Date</th><th>Customer</th><th>Booking</th><th>Amount</th><th>Method</th><th>Transaction reference</th><th>Status</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td><strong>{item.reference}</strong></td><td>{shortDate(item.date)}</td><td>{customers.find((customer) => customer.id === item.customerId)?.name}</td><td>{bookings.find((booking) => booking.id === item.bookingId)?.reference}</td><td><strong>{money(item.amount)}</strong></td><td>{item.method}</td><td>{item.transactionReference || '—'}</td><td><Badge>{item.status}</Badge></td></tr>)}</tbody></table></TableShell><p className="info-note"><Info size={16} /> Only confirmed payments reduce balances. Reversed payments remain visible and do not reduce what the customer owes.</p></Module>
}

export function SuppliersPage() {
  const controls = useFilter()
  const { bookings } = useAppStore()
  const rows = supplierCosts.filter((item) => (!controls.filter || item.status === controls.filter) && `${item.supplier} ${item.category}`.toLowerCase().includes(controls.query.toLowerCase()))
  return <Module title="Supplier payments" description="Operational costs and payments owed to travel service providers." actionLabel="Record supplier payment" options={['Unpaid', 'Partially Paid', 'Paid', 'Overdue']} {...controls}><div className="finance-summary"><div><span>Total supplier costs</span><strong>{money(supplierCosts.reduce((sum, item) => sum + item.amount, 0))}</strong></div><div><span>Paid to suppliers</span><strong>{money(supplierCosts.reduce((sum, item) => sum + item.paid, 0))}</strong></div><div><span>Outstanding obligations</span><strong>{money(supplierCosts.reduce((sum, item) => sum + supplierOutstanding(item), 0))}</strong></div></div><TableShell><table><thead><tr><th>Supplier</th><th>Booking</th><th>Description</th><th>Due date</th><th>Cost</th><th>Paid</th><th>Outstanding</th><th>Status</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td><strong>{item.supplier}</strong></td><td>{bookings.find((booking) => booking.id === item.bookingId)?.reference}</td><td>{item.category}</td><td>{shortDate(item.dueDate)}</td><td>{money(item.amount)}</td><td>{money(item.paid)}</td><td><strong>{money(supplierOutstanding(item))}</strong></td><td><Badge>{item.status}</Badge></td></tr>)}</tbody></table></TableShell></Module>
}

export function DocumentsPage() {
  const controls = useFilter()
  const rows = documents.filter((item) => (!controls.filter || item.status === controls.filter) && `${item.name} ${item.category} ${item.relatedReference}`.toLowerCase().includes(controls.query.toLowerCase()))
  return <Module title="Documents" description="Organised Google Drive references linked to business records." actionLabel="Add document link" options={['Valid', 'Expiring Soon', 'Needs Review']} {...controls}><TableShell><table><thead><tr><th>Document</th><th>Category</th><th>Related record</th><th>Recorded</th><th>Status</th><th>Link</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td><strong>{item.name}</strong></td><td>{item.category}</td><td>{item.relatedType}<span className="cell-sub">{item.relatedReference}</span></td><td>{shortDate(item.recordedAt)}</td><td><Badge>{item.status}</Badge></td><td><a className="table-link" href={item.url} target="_blank" rel="noreferrer">Open sample link <ExternalLink size={14} /></a></td></tr>)}</tbody></table></TableShell><p className="info-note"><Info size={16} /> Headquarters stores a link only. It does not upload files to Google Drive or guarantee access permissions.</p></Module>
}

export function SettingsPage() {
  return <div className="page"><PageHeader title="Settings" description="Business details, application preferences and integration readiness." /><div className="settings-grid"><section className="settings-section"><h2>Business information</h2><p>Used as the default identity and regional configuration.</p><dl><div><dt>Business name</dt><dd>Dandurgu Air Travel & Tours Ltd</dd></div><div><dt>Default currency</dt><dd>Nigerian Naira (NGN)</dd></div><div><dt>Time zone</dt><dd>Africa/Lagos</dd></div><div><dt>Date format</dt><dd>DD MMM YYYY</dd></div></dl></section><section className="settings-section"><h2>Integration status</h2><p>External services are not represented as connected until configured.</p><div className="integration-list"><div><span><strong>Supabase</strong><small>Database and authentication</small></span><Badge>Demo mode</Badge></div><div><span><strong>Google Drive</strong><small>Document links only</small></span><Badge>Not configured</Badge></div><div><span><strong>Website lead capture</strong><small>Secure endpoint required</small></span><Badge>Not configured</Badge></div><div><span><strong>Meta Ads</strong><small>Attribution fields prepared</small></span><Badge>Not configured</Badge></div></div></section><section className="settings-section"><h2>User account</h2><p>Real access control will be enforced by Supabase Auth and Row Level Security.</p><dl><div><dt>Current profile</dt><dd>Demo operator</dd></div><div><dt>Access</dt><dd>Demonstration only</dd></div></dl><Button variant="secondary" disabled>Change password after connection</Button></section><section className="settings-section"><h2>Data mode</h2><p>Set VITE_USE_MOCK_DATA=false after the Supabase schema, authentication and policies have been reviewed and deployed.</p><div className="code-line">VITE_USE_MOCK_DATA=true</div></section></div></div>
}

export function NotFoundPage() {
  return <div className="page"><EmptyState title="Page not found" text="The address does not match a Headquarters module." /></div>
}
