import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Download, ExternalLink, Eye, Filter, Info, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Badge, Button, EmptyState, Input, Modal, PageHeader, Select, TableShell } from '@/components/ui'
import { useAppStore } from '@/hooks/useAppStore'
import { bookingBalance, confirmedPaid, money, shortDate, supplierOutstanding, travellerCount } from '@/lib/business'
import { supabase } from '@/lib/supabase'
import type { QuickActionType } from '@/types'

type DeletableRecordType = 'lead' | 'customer' | 'package' | 'booking' | 'traveller' | 'supplier-cost' | 'document'
type SelectableRecord = { id: string }
type SelectionContextValue = { ids: string[]; selected: string[]; toggle: (id: string) => void; toggleAll: () => void }
const SelectionContext = createContext<SelectionContextValue | null>(null)

function RecordCheckbox({ id }: { id: string }) {
  const selection = useContext(SelectionContext)
  if (!selection) return null
  return <input aria-label={`Select record ${id}`} type="checkbox" checked={selection.selected.includes(id)} onChange={() => selection.toggle(id)} />
}

function SelectAllCheckbox() {
  const selection = useContext(SelectionContext)
  if (!selection || !selection.ids.length) return null
  return <input aria-label="Select all visible records" type="checkbox" checked={selection.ids.every((id) => selection.selected.includes(id))} ref={(element) => { if (element) element.indeterminate = selection.selected.length > 0 && !selection.ids.every((id) => selection.selected.includes(id)) }} onChange={selection.toggleAll} />
}

function exportRecords(records: SelectableRecord[], filename: string) {
  if (!records.length) return
  const columns = Array.from(new Set(records.flatMap((record) => Object.keys(record as Record<string, unknown>).filter((key) => key !== 'id'))))
  const quote = (value: unknown) => {
    const raw = String(value ?? '')
    // Neutralize spreadsheet formulas before users open exported records.
    const safe = /^[\s\u0000-\u001f]*[=+\-@]/.test(raw) ? "'" + raw : raw
    return `"${safe.replace(/"/g, '""')}"`
  }
  const csv = [columns.map(quote).join(','), ...records.map((record) => columns.map((key) => quote((record as Record<string, unknown>)[key])).join(','))].join('\r\n')
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url)
}

function exportVisibleTable() {
  const table = document.querySelector('.page table')
  if (!table) return
  const csv = Array.from(table.querySelectorAll('tr')).map((row) =>
    Array.from(row.querySelectorAll('th, td')).map((cell) => {
      const value = (cell.textContent || '').replace(/\s+/g, ' ').trim()
      const safe = /^[\s\u0000-\u001f]*[=+\-@]/.test(value) ? "'" + value : value
      return '"' + safe.replace(/"/g, '""') + '"'
    }).join(',')
  ).join('\r\n')
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'dandurgu-records.csv'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function Toolbar({ query, setQuery, filter, setFilter, options, onExport, selectionActions }: { query: string; setQuery: (value: string) => void; filter: string; setFilter: (value: string) => void; options: string[]; onExport: () => void; selectionActions?: React.ReactNode }) {
  return <><div className="toolbar"><div className="table-search"><Search size={17} /><Input aria-label="Search records" placeholder="Search records…" value={query} onChange={(event) => setQuery(event.target.value)} /></div><div className="filter-select"><Filter size={16} /><Select aria-label="Filter records" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="">All statuses</option>{options.map((option) => <option key={option}>{option}</option>)}</Select></div><Button variant="secondary" onClick={onExport}><Download size={16} /> Export CSV</Button></div>{selectionActions}</>
}

function Module({ title, description, actionLabel, actionType, children, options = [], query, setQuery, filter, setFilter, recordType, records = [] }: { title: string; description: string; actionLabel: string; actionType?: QuickActionType; children: React.ReactNode; options?: string[]; query: string; setQuery: (v: string) => void; filter: string; setFilter: (v: string) => void; recordType?: DeletableRecordType; records?: SelectableRecord[] }) {
  const { mode, setAction, deleteRecords } = useAppStore()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const ids = records.map((record) => record.id)
  const selectedRecords = records.filter((record) => selectedIds.includes(record.id))
  const activeSelectedIds = selectedRecords.map((record) => record.id)
  const selection: SelectionContextValue = { ids, selected: selectedIds, toggle: (id) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]), toggleAll: () => setSelectedIds((current) => ids.every((id) => current.includes(id)) ? current.filter((id) => !ids.includes(id)) : Array.from(new Set([...current, ...ids]))) }
  const removeSelected = async () => {
    if (!recordType || !activeSelectedIds.length) return
    if (!window.confirm(`Delete ${activeSelectedIds.length} selected ${recordType.replace('-', ' ')} record(s)? This cannot be undone.`)) return
    try { await deleteRecords(recordType, activeSelectedIds); setSelectedIds((current) => current.filter((id) => !activeSelectedIds.includes(id))) }
    catch (error) { window.alert(error instanceof Error ? error.message : 'The selected records could not be deleted.') }
  }
  const selectionActions = recordType ? <div className="toolbar selection-toolbar"><span>{activeSelectedIds.length} selected</span><Button variant="secondary" disabled={!activeSelectedIds.length} onClick={() => exportRecords(selectedRecords, `dandurgu-selected-${recordType}.csv`)}><Download size={15} /> Export selected</Button><Button variant="danger" disabled={!activeSelectedIds.length} onClick={() => void removeSelected()}><Trash2 size={15} /> Delete selected</Button></div> : null
  return <div className="page"><PageHeader title={title} description={description} action={<Button onClick={() => actionType && setAction(actionType)} disabled={!actionType}><Plus size={17} /> {actionLabel}</Button>} /><Toolbar query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} options={options} onExport={() => recordType ? exportRecords(records, `dandurgu-${recordType}.csv`) : exportVisibleTable()} selectionActions={selectionActions} /><SelectionContext.Provider value={selection}>{children}</SelectionContext.Provider><div className="table-footer"><span>{mode === 'demo' ? 'Showing sample records' : 'Showing agency records'}</span><span>{mode === 'demo' ? 'Changes are session-only' : 'Live database records'}</span></div></div>
}

const useFilter = () => {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('')
  return { query, setQuery, filter, setFilter }
}

type LeadFollowUpNote = { id: string; lead_id: string; activity_type: string; note: string; occurred_at: string; is_demo?: boolean }

function LeadFollowUpNotes({ leadId, mode, open, onToggle, notes, onAdd, onEdit }: { leadId: string; mode: 'live' | 'demo'; open: boolean; onToggle: () => void; notes: LeadFollowUpNote[]; onAdd: (leadId: string, note: string) => Promise<void>; onEdit: (id: string, note: string) => Promise<void> }) {
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState('')
  const leadNotes = notes.filter((item) => item.lead_id === leadId).sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
  const submit = async () => {
    if (!draft.trim() || saving) return
    setSaving(true)
    try {
      if (editingId) await onEdit(editingId, draft.trim())
      else await onAdd(leadId, draft.trim())
      setDraft(''); setEditingId(null); onToggle(); setActionError('')
    } catch (error) { setActionError(error instanceof Error ? error.message : 'Could not save this follow-up note.') }
    finally { setSaving(false) }
  }
  return <div className="lead-followup-cell">
    <button className="lead-followup-trigger" aria-expanded={open} onClick={() => { onToggle(); setEditingId(null); setDraft(''); setActionError('') }}>
      <span>{leadNotes.length ? `${leadNotes.length} ${leadNotes.length === 1 ? 'note' : 'notes'}` : 'No notes yet'}</span>
      <strong>{open ? 'Close' : leadNotes.length ? 'View / add' : '+ Add note'}</strong>
    </button>
    {open && <div className="lead-followup-panel">{actionError && <p className="lead-followup-error" role="alert">{actionError}</p>}
      {leadNotes.map((item) => <div className="lead-followup-item" key={item.id}>
        <div className="lead-followup-item-meta"><time>{new Date(item.occurred_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</time><button onClick={() => { setEditingId(item.id); setDraft(item.note) }}>Edit</button></div>
        {editingId === item.id ? <div className="lead-followup-editor"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} maxLength={4000} aria-label="Edit follow-up note" /><div><button disabled={saving || !draft.trim()} onClick={() => void submit()}>{saving ? 'Saving…' : 'Save note'}</button><button onClick={() => { setEditingId(null); setDraft('') }}>Cancel</button></div></div> : <p>{item.note}</p>}
      </div>)}
      {!editingId && <div className="lead-followup-editor"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} maxLength={4000} placeholder="What happened, what did the customer say, and what is the next step?" aria-label="New follow-up note" /><div><button disabled={saving || !draft.trim()} onClick={() => void submit()}>{saving ? 'Saving…' : 'Save follow-up note'}</button></div></div>}
    </div>}
  </div>
}

export function LeadsPage() {
  const controls = useFilter()
  const { mode, leads, customers, setAction, setEditing, convertLead } = useAppStore()
  const [followUpNotes, setFollowUpNotes] = useState<LeadFollowUpNote[]>([])
  const [openLeadNoteId, setOpenLeadNoteId] = useState<string | null>(null)
  const [notesError, setNotesError] = useState('')
  useEffect(() => {
    let active = true
    if (mode === 'demo') { setFollowUpNotes([]); return () => { active = false } }
    if (!supabase) { setNotesError('Follow-up notes are unavailable because the database is not configured.'); return () => { active = false } }
    supabase.from('lead_activities').select('id, lead_id, activity_type, note, occurred_at, is_demo').eq('is_demo', false).order('occurred_at', { ascending: false }).then(({ data, error }) => {
      if (!active) return
      if (error) setNotesError(error.message)
      else { setFollowUpNotes((data || []) as LeadFollowUpNote[]); setNotesError('') }
    })
    return () => { active = false }
  }, [mode])
  const addFollowUpNote = async (leadId: string, note: string) => {
    if (mode === 'demo') { setFollowUpNotes((items) => [{ id: crypto.randomUUID(), lead_id: leadId, activity_type: 'Follow-up', note, occurred_at: new Date().toISOString(), is_demo: true }, ...items]); return }
    if (!supabase) throw new Error('Database connection is unavailable.')
    const { data, error } = await supabase.from('lead_activities').insert({ lead_id: leadId, activity_type: 'Follow-up', note, is_demo: false }).select('id, lead_id, activity_type, note, occurred_at, is_demo').single()
    if (error) { setNotesError(error.message); throw error }
    setFollowUpNotes((items) => [data as LeadFollowUpNote, ...items]); setNotesError('')
  }
  const editFollowUpNote = async (id: string, note: string) => {
    if (mode === 'demo') { setFollowUpNotes((items) => items.map((item) => item.id === id ? { ...item, note } : item)); return }
    if (!supabase) throw new Error('Database connection is unavailable.')
    const { data, error } = await supabase.from('lead_activities').update({ note }).eq('id', id).eq('is_demo', false).select('id, lead_id, activity_type, note, occurred_at, is_demo').single()
    if (error) { setNotesError(error.message); throw error }
    setFollowUpNotes((items) => items.map((item) => item.id === id ? data as LeadFollowUpNote : item)); setNotesError('')
  }
  const rows = leads.filter((item) => (!controls.filter || item.status === controls.filter) && `${item.reference} ${item.name} ${item.phone} ${item.source} ${item.preferredDepartureDate ?? ''} ${item.departureLocation ?? ''} ${item.state ?? ''} ${item.notes ?? ''}`.toLowerCase().includes(controls.query.toLowerCase())).sort((a, b) => Number(a.status === 'Lost') - Number(b.status === 'Lost'))
  return <Module title="Leads" description="Manage enquiries, follow-ups and conversion into customers." actionLabel="Add lead" actionType="lead" recordType="lead" records={rows} options={['New', 'Contacted', 'Follow-up Required', 'Interested', 'Not Interested', 'Converted', 'Lost']} {...controls}>
    {notesError && <div className="notes-error" role="alert">{notesError}</div>}
    <TableShell><table><thead><tr><th><SelectAllCheckbox /></th><th>Lead reference</th><th>Name</th><th>Phone</th><th>Preferred departure</th><th>Departure from</th><th>State</th><th>Service</th><th>Source</th><th>Campaign</th><th>Status</th><th>Customer record</th><th>Received</th><th>Next follow-up</th><th>Follow-up notes</th><th>Actions</th></tr></thead><tbody>{rows.map((lead) => <tr key={lead.id}><td><RecordCheckbox id={lead.id} /></td><td><strong>{lead.reference}</strong></td><td>{lead.name}</td><td>{lead.phone}</td><td>{lead.preferredDepartureDate ? shortDate(lead.preferredDepartureDate) : '—'}</td><td>{lead.departureLocation || '—'}</td><td>{lead.state || '—'}</td><td>{lead.service}</td><td>{lead.source}</td><td>{lead.campaign || '—'}</td><td><Badge>{lead.status}</Badge></td><td>{customers.find((customer) => customer.leadId === lead.id) ? <strong>{customers.find((customer) => customer.leadId === lead.id)?.reference}</strong> : lead.status === "Converted" ? "Linked customer missing" : "—"}</td><td>{shortDate(lead.receivedAt)}</td><td>{lead.followUp ? shortDate(lead.followUp) : '—'}</td><td><LeadFollowUpNotes leadId={lead.id} mode={mode} open={openLeadNoteId === lead.id} onToggle={() => setOpenLeadNoteId((current) => current === lead.id ? null : lead.id)} notes={followUpNotes} onAdd={addFollowUpNote} onEdit={editFollowUpNote} /></td><td><div className="table-actions">{lead.status !== "Converted" && lead.status !== "Lost" && <Button variant="secondary" onClick={() => convertLead(lead.id)}>Convert</Button>}<Button variant="secondary" onClick={() => { setEditing({ type: 'lead', id: lead.id }); setAction('lead') }}><Pencil size={14} /> Edit</Button></div></td></tr>)}</tbody></table>{!rows.length && <EmptyState title="No leads found" text="Adjust the search or filter, or add a new enquiry." />}</TableShell>
  </Module>
}

export function CustomersPage() {
  const controls = useFilter()
  const { customers, bookings, payments, travellers, setAction, setEditing } = useAppStore()
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const selectedCustomer = customers.find((item) => item.id === selectedCustomerId)
  const customerBookings = bookings.filter((item) => item.customerId === selectedCustomerId)
  const bookingIds = new Set(customerBookings.map((item) => item.id))
  const customerTravellers = travellers.filter((item) => bookingIds.has(item.bookingId))
  const customerPayments = payments.filter((item) => item.customerId === selectedCustomerId)
  const rows = customers.filter((item) => (!controls.filter || (controls.filter === 'Historical' ? item.historical : !item.historical)) && `${item.reference} ${item.name} ${item.phone} ${item.email}`.toLowerCase().includes(controls.query.toLowerCase()))
  return <>
    <Module title="Customer records" description="Permanent customer profiles and their complete relationship with Dandurgu." actionLabel="Add customer" actionType="customer" recordType="customer" records={rows} options={['Current', 'Historical']} {...controls}><TableShell><table><thead><tr><th><SelectAllCheckbox /></th><th>Customer</th><th>Contact</th><th>Nationality</th><th>Type</th><th>Bookings</th><th>Travellers</th><th>Total paid</th><th>Outstanding</th><th>Actions</th></tr></thead><tbody>{rows.map((customer) => {
      const customerBookings = bookings.filter((item) => item.customerId === customer.id)
      const bookingIds = new Set(customerBookings.map((item) => item.id))
      const travellerTotal = travellers.filter((traveller) => bookingIds.has(traveller.bookingId)).length
      return <tr key={customer.id}><td><RecordCheckbox id={customer.id} /></td><td><strong>{customer.name}</strong><span className="cell-sub">{customer.reference}</span></td><td>{customer.phone}<span className="cell-sub">{customer.email || 'No email recorded'}</span></td><td>{customer.nationality}</td><td>{customer.historical ? <Badge>Historical</Badge> : 'Current'}</td><td>{customerBookings.length}</td><td>{travellerTotal}</td><td>{money(payments.filter((item) => item.customerId === customer.id && item.status === 'Confirmed').reduce((sum, item) => sum + item.amount, 0))}</td><td><strong>{money(customerBookings.reduce((sum, booking) => sum + bookingBalance(booking, payments), 0))}</strong></td><td><div className="table-actions"><Button variant="secondary" onClick={() => setSelectedCustomerId(customer.id)}><Eye size={14} /> View</Button><Button variant="secondary" onClick={() => { setEditing({ type: 'customer', id: customer.id }); setAction('customer') }}><Pencil size={14} /> Edit</Button></div></td></tr>
    })}</tbody></table></TableShell></Module>
    {selectedCustomer && <Modal title={selectedCustomer.name} description={`${selectedCustomer.reference} · Customer profile`} onClose={() => setSelectedCustomerId(null)}>
      <div className="detail-grid"><div><span>Phone</span><strong>{selectedCustomer.phone}</strong></div><div><span>Email</span><strong>{selectedCustomer.email || 'Not recorded'}</strong></div><div><span>Nationality</span><strong>{selectedCustomer.nationality}</strong></div><div><span>City</span><strong>{selectedCustomer.city || 'Not recorded'}</strong></div></div>
      <h3>Booking history ({customerBookings.length})</h3>
      {customerBookings.length ? <TableShell><table><thead><tr><th>Booking</th><th>Package</th><th>Travel dates</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead><tbody>{customerBookings.map((booking) => <tr key={booking.id}><td>{booking.reference}</td><td>{booking.packageName}</td><td>{shortDate(booking.departureDate)} to {shortDate(booking.returnDate)}</td><td>{money(confirmedPaid(booking.id, payments))}</td><td>{money(bookingBalance(booking, payments))}</td><td><Badge>{booking.status}</Badge></td></tr>)}</tbody></table></TableShell> : <p>No bookings recorded for this customer.</p>}
      <h3>Travellers on these bookings ({customerTravellers.length})</h3>
      {customerTravellers.length ? <TableShell><table><thead><tr><th>Name</th><th>Booking</th><th>Group</th><th>Status</th></tr></thead><tbody>{customerTravellers.map((traveller) => <tr key={traveller.id}><td>{traveller.name}</td><td>{bookings.find((item) => item.id === traveller.bookingId)?.reference || '—'}</td><td>{traveller.group || '—'}</td><td><Badge>{traveller.status}</Badge></td></tr>)}</tbody></table></TableShell> : <p>No travellers recorded on this customer's bookings.</p>}
      <h3>Payment history ({customerPayments.length})</h3>
      {customerPayments.length ? <TableShell><table><thead><tr><th>Reference</th><th>Date</th><th>Purpose</th><th>Amount</th><th>Status</th></tr></thead><tbody>{customerPayments.map((payment) => <tr key={payment.id}><td>{payment.reference}</td><td>{shortDate(payment.date)}</td><td>{payment.purpose}</td><td>{money(payment.amount)}</td><td><Badge>{payment.status}</Badge></td></tr>)}</tbody></table></TableShell> : <p>No payments recorded for this customer.</p>}
      <div className="form-actions"><Button variant="secondary" onClick={() => setSelectedCustomerId(null)}>Close</Button><Button onClick={() => { setEditing({ type: 'customer', id: selectedCustomer.id }); setAction('customer'); setSelectedCustomerId(null) }}><Pencil size={14} /> Edit customer</Button></div>
    </Modal>}
  </>
}
export function PackagesPage() {
  const controls = useFilter()
  const { packages, setAction, setEditing } = useAppStore()
  const [departureFilter, setDepartureFilter] = useState('')
  const [departureSort, setDepartureSort] = useState('asc')
  const departureLocations = Array.from(new Set(packages.map((item) => item.departureLocation?.trim()).filter((location): location is string => Boolean(location)))).sort((a, b) => a.localeCompare(b))
  const rows = packages
    .filter((item) => (!controls.filter || item.status === controls.filter) && (!departureFilter || item.departureLocation === departureFilter) && `${item.code} ${item.name} ${item.category} ${item.destination} ${item.departureLocation || ''} ${item.departureDate || ''} ${item.sourceAgent || ''}`.toLowerCase().includes(controls.query.toLowerCase()))
    .sort((a, b) => (a.departureLocation || 'ZZZ').localeCompare(b.departureLocation || 'ZZZ') * (departureSort === 'asc' ? 1 : -1))
  return <Module title="Travel packages" description="Manage the internal catalogue, pricing, departure cities and availability." actionLabel="Create package" actionType="package" recordType="package" records={rows} options={['Active', 'Draft', 'Fully Booked', 'Unavailable', 'Archived']} {...controls}>
    <div className="toolbar package-location-toolbar"><div className="filter-select"><Filter size={16} /><Select aria-label="Filter by departure location" value={departureFilter} onChange={(event) => setDepartureFilter(event.target.value)}><option value="">All departure locations</option>{departureLocations.map((location) => <option key={location} value={location}>{location}</option>)}</Select></div><div className="filter-select"><Select aria-label="Sort packages by departure location" value={departureSort} onChange={(event) => setDepartureSort(event.target.value)}><option value="asc">Departure: A to Z</option><option value="desc">Departure: Z to A</option></Select></div></div>
    <TableShell><table><thead><tr><th><SelectAllCheckbox /></th><th>Package</th><th>Category</th><th>Departure</th><th>Departure date(s)</th><th>Source agent</th><th>Destination</th><th>Duration</th><th>Price</th><th>Estimated cost</th><th>Availability</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td><RecordCheckbox id={item.id} /></td><td><strong>{item.name}</strong><span className="cell-sub">{item.code}</span></td><td>{item.category}</td><td>{item.departureLocation || 'Not specified'}</td><td>{item.departureDate || 'Not specified'}</td><td>{item.sourceAgent || 'Not specified'}</td><td>{item.destination}</td><td>{item.duration}</td><td><strong>{money(item.price)}</strong></td><td>{item.estimatedCost == null ? 'Not set' : money(item.estimatedCost)}</td><td>{item.availability == null ? 'Not set' : `${item.availability} places`}</td><td><Badge>{item.status}</Badge></td><td className="package-notes-cell">{item.notes?.trim() ? item.notes : '—'}</td><td><Button variant="secondary" onClick={() => { setEditing({ type: 'package', id: item.id }); setAction('package') }}><Pencil size={14} /> Edit</Button></td></tr>)}</tbody></table>{!rows.length && <EmptyState title="No packages found" text="Adjust the search or filter, or create a new travel package." />}</TableShell><p className="info-note"><Info size={16} /> Booking prices are stored as snapshots. Changing a package never rewrites an existing booking.</p>
  </Module>
}

export function BookingsPage() {
  const controls = useFilter()
  const { bookings, customers, travellers, payments, setAction, setEditing } = useAppStore()
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const selectedBooking = bookings.find((item) => item.id === selectedBookingId)
  const bookingTravellers = travellers.filter((item) => item.bookingId === selectedBookingId)
  const bookingPayments = payments.filter((item) => item.bookingId === selectedBookingId)
  const rows = bookings.filter((item) => (!controls.filter || item.status === controls.filter) && `${item.reference} ${item.packageName} ${customers.find((c) => c.id === item.customerId)?.name}`.toLowerCase().includes(controls.query.toLowerCase()))
  return <>
    <Module title="Bookings" description="Commercial travel arrangements connecting customers, travellers and payments." actionLabel="Create booking" actionType="booking" recordType="booking" records={rows} options={['Pending Confirmation', 'Confirmed', 'In Preparation', 'Ready for Travel', 'Travelling', 'Completed']} {...controls}><TableShell><table><thead><tr><th><SelectAllCheckbox /></th><th>Booking</th><th>Customer</th><th>Package snapshot</th><th>Travel dates</th><th>Travellers</th><th>Agreed price</th><th>Paid</th><th>Outstanding</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map((booking) => <tr key={booking.id}><td><RecordCheckbox id={booking.id} /></td><td><strong>{booking.reference}</strong></td><td>{customers.find((item) => item.id === booking.customerId)?.name || 'Customer unavailable'}</td><td>{booking.packageName}</td><td>{shortDate(booking.departureDate)}<span className="cell-sub">to {shortDate(booking.returnDate)}</span></td><td>{travellerCount(booking.id, travellers)}</td><td>{money(booking.agreedPrice)}</td><td>{money(confirmedPaid(booking.id, payments))}</td><td><strong>{money(bookingBalance(booking, payments))}</strong></td><td><Badge>{booking.status}</Badge></td><td><div className="table-actions"><Button variant="secondary" onClick={() => setSelectedBookingId(booking.id)}><Eye size={14} /> View</Button><Button variant="secondary" onClick={() => { setEditing({ type: 'booking', id: booking.id }); setAction('booking') }}><Pencil size={14} /> Edit</Button></div></td></tr>)}</tbody></table></TableShell></Module>
    {selectedBooking && <Modal title={selectedBooking.reference} description={`${selectedBooking.packageName} · Booking detail`} onClose={() => setSelectedBookingId(null)}>
      <div className="detail-grid"><div><span>Customer</span><strong>{customers.find((item) => item.id === selectedBooking.customerId)?.name || 'Customer unavailable'}</strong></div><div><span>Agreed price</span><strong>{money(selectedBooking.agreedPrice)}</strong></div><div><span>Departure</span><strong>{shortDate(selectedBooking.departureDate)}</strong></div><div><span>Return</span><strong>{shortDate(selectedBooking.returnDate)}</strong></div><div><span>Confirmed payments</span><strong>{money(confirmedPaid(selectedBooking.id, payments))}</strong></div><div><span>Outstanding balance</span><strong>{money(bookingBalance(selectedBooking, payments))}</strong></div><div><span>Supplier</span><strong>{selectedBooking.supplier || 'Not assigned'}</strong></div><div><span>Booking status</span><strong><Badge>{selectedBooking.status}</Badge></strong></div></div>
      <div className="traveller-section-heading"><h2>Travelling party ({bookingTravellers.length})</h2><Button variant="secondary" onClick={() => setAction('traveller', { bookingId: selectedBooking.id, customerId: selectedBooking.customerId })}><Plus size={14}/> Add traveller</Button></div>
      {bookingTravellers.length ? <TableShell><table><thead><tr><th>Traveller</th><th>Customer profile</th><th>Group</th><th>Travel status</th><th>Documents</th></tr></thead><tbody>{bookingTravellers.map((traveller) => <tr key={traveller.id}><td>{traveller.name}</td><td>{traveller.customerId ? customers.find((item) => item.id === traveller.customerId)?.reference || 'Unavailable' : 'Traveller only'}</td><td>{traveller.group || '—'}</td><td><Badge>{traveller.status}</Badge></td><td>{traveller.documentsComplete ? 'Complete' : 'Needs attention'}</td></tr>)}</tbody></table></TableShell> : <p>No travellers have been added to this booking.</p>}
      <h3>Payment history ({bookingPayments.length})</h3>
      {bookingPayments.length ? <TableShell><table><thead><tr><th>Reference</th><th>Date</th><th>Purpose</th><th>Amount</th><th>Status</th></tr></thead><tbody>{bookingPayments.map((payment) => <tr key={payment.id}><td>{payment.reference}</td><td>{shortDate(payment.date)}</td><td>{payment.purpose}</td><td>{money(payment.amount)}</td><td><Badge>{payment.status}</Badge></td></tr>)}</tbody></table></TableShell> : <p>No payments are linked to this booking.</p>}
      <div className="form-actions"><Button variant="secondary" onClick={() => setSelectedBookingId(null)}>Close</Button><Button onClick={() => { setEditing({ type: 'booking', id: selectedBooking.id }); setAction('booking'); setSelectedBookingId(null) }}><Pencil size={14} /> Edit booking</Button></div>
    </Modal>}
  </>
}
export function TravellersPage() {
  const controls = useFilter()
  const { travellers, bookings, customers, setAction, setEditing } = useAppStore()
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const groupRows = useMemo(() => {
    const groups = new Map<string, { key: string; bookingId: string; group: string; travellers: typeof travellers }>()
    for (const traveller of travellers) {
      const groupName = traveller.group?.trim() || 'Individual travellers'
      const key = `${traveller.bookingId}::${groupName}`
      const existing = groups.get(key)
      if (existing) existing.travellers.push(traveller)
      else groups.set(key, { key, bookingId: traveller.bookingId, group: groupName, travellers: [traveller] })
    }
    return Array.from(groups.values())
  }, [travellers])
  const rows = travellers.filter((item) => {
    const booking = bookings.find((entry) => entry.id === item.bookingId)
    return (!controls.filter || item.status === controls.filter) && `${item.name} ${item.group || ''} ${booking?.reference || ''} ${booking?.packageName || ''}`.toLowerCase().includes(controls.query.toLowerCase())
  })
  const selected = groupRows.find((group) => group.key === selectedGroup)
  return <>
    <Module title="Travellers & operations" description="Track each traveller separately, while managing family and group readiness by booking." actionLabel="Add traveller" actionType="traveller" recordType="traveller" records={rows} options={['Not Started', 'Documents Pending', 'Documents Complete', 'Ready for Travel', 'Departed', 'Abroad', 'Returned']} {...controls}>
      <div className="traveller-metrics" aria-label="Traveller overview">
        <div className="traveller-metric"><span className="traveller-metric-label">Travellers shown</span><strong>{rows.length}</strong><span className="traveller-metric-caption">Matching your current search</span></div>
        <div className="traveller-metric"><span className="traveller-metric-label">Ready for travel</span><strong>{rows.filter((item) => ['Ready for Travel', 'Departed', 'Abroad', 'Returned'].includes(item.status)).length}</strong><span className="traveller-metric-caption">Ready, travelling or returned</span></div>
        <div className="traveller-metric"><span className="traveller-metric-label">Documents complete</span><strong>{rows.filter((item) => item.documentsComplete).length}</strong><span className="traveller-metric-caption">Document checks completed</span></div>
        <div className="traveller-metric traveller-metric-attention"><span className="traveller-metric-label">Needs attention</span><strong>{rows.filter((item) => !item.documentsComplete || item.status === 'Documents Pending').length}</strong><span className="traveller-metric-caption">Missing documents or pending status</span></div>
      </div>
      <div className="traveller-section-heading"><h2>Travelling groups</h2><span className="section-info" title="Groups are organised by their group name within each booking. Travellers without a group name appear as Individual travellers."><Info size={15}/></span></div>
      <TableShell><table><thead><tr><th>Group</th><th>Booking</th><th>Customer / booking owner</th><th>Members</th><th>Documents complete</th><th>Ready / travelling / returned</th><th>Actions</th></tr></thead><tbody>{groupRows.filter((group) => group.travellers.some((traveller) => rows.some((row) => row.id === traveller.id))).map((group) => {
        const booking = bookings.find((item) => item.id === group.bookingId)
        const ready = group.travellers.filter((item) => ['Ready for Travel', 'Departed', 'Abroad', 'Returned'].includes(item.status)).length
        const docs = group.travellers.filter((item) => item.documentsComplete).length
        return <tr key={group.key}><td><strong>{group.group}</strong></td><td>{booking?.reference || 'Booking unavailable'}<span className="cell-sub">{booking?.packageName}</span></td><td>{customers.find((item) => item.id === booking?.customerId)?.name || 'Customer unavailable'}</td><td>{group.travellers.length}</td><td>{docs}/{group.travellers.length}</td><td>{ready}/{group.travellers.length}</td><td><Button variant="secondary" onClick={() => setSelectedGroup(group.key)}><Eye size={14}/> View group</Button></td></tr>
      })}</tbody></table></TableShell>
      <div className="traveller-section-heading"><h2>Individual traveller records</h2><span className="section-info" title="Each traveller has an individual record. Document readiness is tracked separately from their current travel status."><Info size={15}/></span></div>
      <TableShell><table><thead><tr><th><SelectAllCheckbox /></th><th>Traveller</th><th>Customer profile</th><th>Booking</th><th>Group</th><th>Departure</th><th>Expected return</th><th>Documents</th><th>Travel status</th><th>Actions</th></tr></thead><tbody>{rows.map((traveller) => {
        const booking = bookings.find((item) => item.id === traveller.bookingId)
        return <tr key={traveller.id}><td><RecordCheckbox id={traveller.id} /></td><td><strong>{traveller.name}</strong><span className="cell-sub">{traveller.nationality}</span></td><td>{traveller.customerId ? customers.find((customer) => customer.id === traveller.customerId)?.reference || 'Customer unavailable' : 'Traveller only'}</td><td>{booking?.reference || 'Booking unavailable'}</td><td>{traveller.group || 'Individual'}</td><td>{booking ? shortDate(booking.departureDate) : '—'}</td><td>{booking ? shortDate(booking.returnDate) : '—'}</td><td>{traveller.documentsComplete ? <Badge>Complete</Badge> : <Badge>Pending</Badge>}</td><td><Badge>{traveller.status}</Badge></td><td><Button variant="secondary" onClick={() => { setEditing({ type: 'traveller', id: traveller.id }); setAction('traveller') }}><Pencil size={14} /> Edit</Button></td></tr>
      })}</tbody></table>{!rows.length && <EmptyState title="No travellers found" text="Adjust the search or filter, or add a traveller to an existing booking."/>}</TableShell>
      <div className="traveller-security-note"><Info size={16}/><span>Passport numbers are intentionally excluded from tables and global search. Access sensitive travel documents only through approved, access-controlled storage.</span></div>
    </Module>
    {selected && <Modal title={selected.group} description={`${selected.travellers.length} traveller(s) · ${bookings.find((item) => item.id === selected.bookingId)?.reference || 'Booking unavailable'}`} onClose={() => setSelectedGroup(null)}>
      <div className="detail-grid"><div><span>Booking owner</span><strong>{customers.find((item) => item.id === bookings.find((booking) => booking.id === selected.bookingId)?.customerId)?.name || 'Customer unavailable'}</strong></div><div><span>Total members</span><strong>{selected.travellers.length}</strong></div><div><span>Documents complete</span><strong>{selected.travellers.filter((item) => item.documentsComplete).length} / {selected.travellers.length}</strong></div><div><span>Ready / travelling / returned</span><strong>{selected.travellers.filter((item) => ['Ready for Travel', 'Departed', 'Abroad', 'Returned'].includes(item.status)).length} / {selected.travellers.length}</strong></div></div>
      <TableShell><table><thead><tr><th>Traveller</th><th>Documents</th><th>Status</th><th></th></tr></thead><tbody>{selected.travellers.map((traveller) => <tr key={traveller.id}><td>{traveller.name}</td><td>{traveller.documentsComplete ? 'Complete' : 'Pending'}</td><td><Badge>{traveller.status}</Badge></td><td><Button variant="secondary" onClick={() => { setEditing({ type: 'traveller', id: traveller.id }); setAction('traveller', { bookingId: selected.bookingId, customerId: bookings.find((booking) => booking.id === selected.bookingId)?.customerId || '', group: selected.group === 'Individual travellers' ? '' : selected.group }); setSelectedGroup(null) }}><Pencil size={14}/> Edit</Button></td></tr>)}</tbody></table></TableShell>
      <div className="form-actions"><Button onClick={() => { setAction('traveller', { bookingId: selected.bookingId, customerId: bookings.find((booking) => booking.id === selected.bookingId)?.customerId || '', group: selected.group === 'Individual travellers' ? '' : selected.group }); setSelectedGroup(null) }}>Add another traveller</Button><Button variant="secondary" onClick={() => setSelectedGroup(null)}>Close</Button></div>
    </Modal>}
  </>
}
export function PaymentsPage() {
  const controls = useFilter()
  const { payments, bookings, customers, setAction, setEditing, reversePayment } = useAppStore()
  const rows = payments.filter((item) => (!controls.filter || item.status === controls.filter) && `${item.reference} ${item.transactionReference} ${item.purpose} ${customers.find((c) => c.id === item.customerId)?.name}`.toLowerCase().includes(controls.query.toLowerCase()))
  const total = payments.filter((item) => item.status === 'Confirmed').reduce((sum, item) => sum + item.amount, 0)
  const balance = bookings.reduce((sum, booking) => sum + bookingBalance(booking, payments), 0)
  return <Module title="Payments & balances" description="Customer money received, transaction status and calculated booking balances." actionLabel="Record payment" actionType="payment" options={['Confirmed', 'Pending', 'Reversed', 'Failed']} {...controls}><div className="finance-summary"><div><span>Confirmed payments</span><strong>{money(total)}</strong></div><div><span>Total outstanding</span><strong>{money(balance)}</strong></div><div><span>Pending review</span><strong>{money(payments.filter((item) => item.status === 'Pending').reduce((sum, item) => sum + item.amount, 0))}</strong></div></div><TableShell><table><thead><tr><th>Payment</th><th>Date</th><th>Customer</th><th>Payment for</th><th>Booking</th><th>Amount</th><th>Method</th><th>Transaction reference</th><th>Status</th><th>Reversal reason</th><th>Actions</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td><strong>{item.reference}</strong></td><td>{shortDate(item.date)}</td><td>{customers.find((customer) => customer.id === item.customerId)?.name || 'Customer unavailable'}</td><td>{item.purpose || 'Unspecified'}</td><td>{bookings.find((booking) => booking.id === item.bookingId)?.reference || '—'}</td><td><strong>{money(item.amount)}</strong></td><td>{item.method}</td><td>{item.transactionReference || '—'}</td><td><Badge>{item.status}</Badge></td><td>{item.reversalReason || '—'}</td><td><div className="table-actions">{item.status !== 'Reversed' && <Button variant="secondary" onClick={() => { setEditing({ type: 'payment', id: item.id }); setAction('payment') }}><Pencil size={14} /> Edit</Button>}{item.status === 'Confirmed' && <Button variant="danger" onClick={() => { const reason = window.prompt('Enter the reason for reversing this payment.'); if (reason?.trim()) reversePayment(item.id, reason) }}>Reverse payment</Button>}</div></td></tr>)}</tbody></table></TableShell><p className="info-note"><Info size={16} /> Only confirmed payments reduce balances. Reversed payments remain visible and do not reduce what the customer owes.</p></Module>
}

export function SuppliersPage() {
  const controls = useFilter()
  const { bookings, supplierCosts, supplierPayments, setAction, setEditing, voidSupplierPayment } = useAppStore()
  const rows = supplierCosts.filter((item) => (!controls.filter || item.status === controls.filter) && `${item.supplier} ${item.category} ${bookings.find((booking) => booking.id === item.bookingId)?.reference || ''}`.toLowerCase().includes(controls.query.toLowerCase()))
  const total = supplierCosts.reduce((sum, item) => sum + item.amount, 0)
  const paid = supplierCosts.reduce((sum, item) => sum + item.paid, 0)
  const outstanding = supplierCosts.reduce((sum, item) => sum + supplierOutstanding(item), 0)
  return <Module title="Supplier payments" description="Track supplier obligations, amounts paid and remaining balances against each booking." actionLabel="Add supplier cost" actionType="supplier-cost" recordType="supplier-cost" records={rows} options={['Unpaid', 'Partially Paid', 'Paid', 'Overdue']} {...controls}>
    <div className="finance-summary"><div><span>Total supplier costs</span><strong>{money(total)}</strong></div><div><span>Paid to suppliers</span><strong>{money(paid)}</strong></div><div><span>Outstanding obligations</span><strong>{money(outstanding)}</strong></div></div>
    <TableShell><table><thead><tr><th><SelectAllCheckbox /></th><th>Supplier</th><th>Booking</th><th>Description</th><th>Due date</th><th>Cost</th><th>Paid</th><th>Outstanding</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td><RecordCheckbox id={item.id} /></td><td><strong>{item.supplier}</strong></td><td>{bookings.find((booking) => booking.id === item.bookingId)?.reference}</td><td>{item.category}</td><td>{shortDate(item.dueDate)}</td><td>{money(item.amount)}</td><td>{money(item.paid)}</td><td><strong>{money(supplierOutstanding(item))}</strong></td><td><Badge>{item.status}</Badge></td><td><div className="table-actions"><Button variant="secondary" onClick={() => { setEditing({ type: 'supplier-cost', id: item.id }); setAction('supplier-cost') }}><Pencil size={14} /> Edit</Button>{supplierOutstanding(item) > 0 && <Button variant="secondary" onClick={() => { setEditing({ type: 'supplier-payment', id: item.id }); setAction('supplier-payment') }}>Record payment</Button>}</div></td></tr>)}</tbody></table>{!rows.length && <EmptyState title="No supplier costs found" text="Add a supplier cost or adjust your search and filters." />}</TableShell>
    <div className="traveller-section-heading"><h2>Supplier payment history</h2><span className="section-info" title="Every supplier disbursement is recorded separately. Voiding an incorrect or failed payment record restores the outstanding supplier balance while keeping the audit history."><Info size={15}/></span></div>
    <TableShell><table><thead><tr><th>Date</th><th>Supplier cost</th><th>Amount</th><th>Method</th><th>Reference</th><th>Status</th><th>Void reason</th><th>Actions</th></tr></thead><tbody>{supplierPayments.map((payment) => { const cost = supplierCosts.find((item) => item.id === payment.supplierCostId); return <tr key={payment.id}><td>{shortDate(payment.date)}</td><td>{cost ? `${cost.supplier} · ${cost.category}` : 'Supplier cost unavailable'}</td><td><strong>{money(payment.amount)}</strong></td><td>{payment.method}</td><td>{payment.reference || '—'}</td><td><Badge>{payment.status || 'Confirmed'}</Badge></td><td>{payment.voidReason || '—'}</td><td>{payment.status !== 'Voided' && <Button variant="danger" onClick={() => { const reason = window.prompt('Why should this payment record be voided? This does not reverse money at the bank.'); if (reason?.trim()) voidSupplierPayment(payment.id, reason) }}>Void record</Button>}</td></tr> })}</tbody></table>{!supplierPayments.length && <EmptyState title="No supplier payments recorded" text="Payments you record against supplier costs will appear here." />}</TableShell>
    <p className="info-note"><Info size={16} /> Supplier payments are separate transactions. Each payment updates the related cost's paid and outstanding totals.</p>
  </Module>
}

export function DocumentsPage() {
  const controls = useFilter()
  const { documents, setAction, setEditing } = useAppStore()
  const rows = documents.filter((item) => (!controls.filter || item.status === controls.filter) && `${item.name} ${item.category} ${item.relatedReference}`.toLowerCase().includes(controls.query.toLowerCase()))
  return <Module title="Documents" description="Organised document links connected to customers, bookings and other business records." actionLabel="Add document link" actionType="document" recordType="document" records={rows} options={['Valid', 'Expiring Soon', 'Needs Review']} {...controls}><TableShell><table><thead><tr><th><SelectAllCheckbox /></th><th>Document</th><th>Category</th><th>Related record</th><th>Recorded</th><th>Status</th><th>Link</th><th>Actions</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td><RecordCheckbox id={item.id} /></td><td><strong>{item.name}</strong></td><td>{item.category}</td><td>{item.relatedType}<span className="cell-sub">{item.relatedReference}</span></td><td>{shortDate(item.recordedAt)}</td><td><Badge>{item.status}</Badge></td><td><a className="table-link" href={item.url} target="_blank" rel="noreferrer">Open link <ExternalLink size={14} /></a></td><td><Button variant="secondary" onClick={() => { setEditing({ type: 'document', id: item.id }); setAction('document') }}><Pencil size={14} /> Edit</Button></td></tr>)}</tbody></table>{!rows.length && <EmptyState title="No documents found" text="Add a document link or adjust your search and filters." />}</TableShell><p className="info-note"><Info size={16} /> Headquarters stores a link only. It does not upload files to Google Drive or guarantee access permissions. Avoid public links for passports and other sensitive documents.</p></Module>
}

export function SettingsPage() {
  const { mode } = useAppStore()
  return <div className="page"><PageHeader title="Settings" description="Business details, application preferences and integration readiness." /><div className="settings-grid"><section className="settings-section"><h2>Business information</h2><p>Used as the default identity and regional configuration.</p><dl><div><dt>Business name</dt><dd>Dandurgu Air Travel & Tours Ltd</dd></div><div><dt>Default currency</dt><dd>Nigerian Naira (NGN)</dd></div><div><dt>Time zone</dt><dd>Africa/Lagos</dd></div><div><dt>Date format</dt><dd>DD MMM YYYY</dd></div></dl></section><section className="settings-section"><h2>Integration status</h2><p>External services are not represented as connected until configured.</p><div className="integration-list"><div><span><strong>Supabase</strong><small>Database and authentication</small></span><Badge>{mode === 'live' ? 'Connected' : 'Not used in demo'}</Badge></div><div><span><strong>Google Drive</strong><small>Document links only</small></span><Badge>Not configured</Badge></div><div><span><strong>Website lead capture</strong><small>Secure endpoint required</small></span><Badge>Not configured</Badge></div><div><span><strong>Meta Ads</strong><small>Attribution fields prepared</small></span><Badge>Not configured</Badge></div></div></section><section className="settings-section"><h2>User account</h2><p>Access to live agency records is protected by account sign-in and authenticator verification.</p><dl><div><dt>Current profile</dt><dd>{mode === 'live' ? 'Authorised account' : 'Guest user'}</dd></div><div><dt>Access</dt><dd>{mode === 'live' ? 'Live agency workspace' : 'Sample records only'}</dd></div></dl></section><section className="settings-section"><h2>Workspace mode</h2><p>{mode === 'live' ? 'This session is connected to the agency database. Changes are saved to the live workspace.' : 'This guest workspace uses sample records bundled with the application. Changes are temporary and are not sent to the agency database.'}</p><div className="code-line">{mode === 'live' ? 'LIVE MODE' : 'DEMO MODE'}</div></section></div></div>
}

export function NotFoundPage() {
  return <div className="page"><EmptyState title="Page not found" text="The address does not match a Headquarters module." /></div>
}
