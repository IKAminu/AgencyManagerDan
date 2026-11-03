import { ArrowRight, CalendarDays, CircleDollarSign, Clock3, PlaneLanding, PlaneTakeoff, Users } from 'lucide-react'
import { Link } from 'react-router'
import { Badge, Button, PageHeader, TableShell } from '@/components/ui'
import { useAppStore } from '@/hooks/useAppStore'
import { bookingBalance, confirmedPaid, daysFromToday, money, shortDate, travellerCount } from '@/lib/business'
import type { QuickActionType } from '@/types'

export function Dashboard() {
  const { leads, bookings, customers, payments, travellers, setAction } = useAppStore()
  const activeLeads = leads.filter((lead) => !['Converted', 'Lost', 'Not Interested'].includes(lead.status))
  const activeBookings = bookings.filter((booking) => !['Completed', 'Cancelled'].includes(booking.status))
  const upcoming = bookings.filter((booking) => !['Completed', 'Cancelled'].includes(booking.status) && daysFromToday(booking.departureDate) >= 0 && daysFromToday(booking.departureDate) <= 7)
  const abroad = travellers.filter((traveller) => traveller.status === 'Abroad')
  const outstanding = bookings.reduce((sum, booking) => sum + bookingBalance(booking, payments), 0)
  const received = payments.filter((payment) => payment.status === 'Confirmed').reduce((sum, payment) => sum + payment.amount, 0)
  const quickActions: { label: string; type: QuickActionType }[] = [{ label: 'Add lead', type: 'lead' }, { label: 'Add customer', type: 'customer' }, { label: 'Create booking', type: 'booking' }, { label: 'Record payment', type: 'payment' }, { label: 'Add traveller', type: 'traveller' }]

  const metrics = [
    { label: 'Active leads', value: activeLeads.length, detail: `${leads.filter((lead) => lead.status === 'New').length} awaiting attention`, icon: Users, to: '/leads' },
    { label: 'Active bookings', value: activeBookings.length, detail: `${upcoming.length} departing soon`, icon: CalendarDays, to: '/bookings' },
    { label: 'Confirmed payments', value: money(received), detail: 'Across all demo records', icon: CircleDollarSign, to: '/payments' },
    { label: 'Outstanding balance', value: money(outstanding), detail: 'Calculated from transactions', icon: Clock3, to: '/payments' },
    { label: 'Travellers abroad', value: abroad.length, detail: `${travellers.filter((item) => item.status === 'Ready for Travel').length} ready to travel`, icon: PlaneTakeoff, to: '/travellers' },
    { label: 'Upcoming returns', value: bookings.filter((booking) => daysFromToday(booking.returnDate) >= 0 && daysFromToday(booking.returnDate) <= 10).length, detail: 'Within the next 10 days', icon: PlaneLanding, to: '/travellers' },
  ]

  return <div className="page">
    <PageHeader title="Good morning" description="Here is what needs attention across Dandurgu today." action={<div className="date-chip"><CalendarDays size={16} /> {shortDate(new Date().toISOString().slice(0, 10))}</div>} />
    <section className="demo-banner"><div><strong>Demonstration workspace</strong><span>Records created here are session-only. Supabase is prepared but not connected.</span></div><Link to="/settings">View integration status <ArrowRight size={15} /></Link></section>
    <section className="metrics-grid">{metrics.map(({ label, value, detail, icon: Icon, to }) => <Link className="metric" to={to} key={label}><div className="metric-head"><span>{label}</span><Icon size={18} /></div><strong>{value}</strong><p>{detail}</p></Link>)}</section>
    <section className="quick-strip"><div><strong>Quick actions</strong><span>Start a common task without leaving the dashboard.</span></div><div>{quickActions.map((action) => <Button variant="secondary" key={action.type} onClick={() => setAction(action.type)}>{action.label}</Button>)}</div></section>
    <div className="dashboard-grid">
      <section className="content-section span-two">
        <div className="section-title"><div><h2>Upcoming departures</h2><p>Bookings departing in the next seven days.</p></div><Link to="/bookings">View all <ArrowRight size={15} /></Link></div>
        <TableShell><table><thead><tr><th>Booking</th><th>Customer</th><th>Package</th><th>Departure</th><th>Travellers</th><th>Status</th><th>Requirements</th></tr></thead><tbody>{upcoming.map((booking) => {
          const customer = customers.find((item) => item.id === booking.customerId)
          const count = travellerCount(booking.id, travellers)
          const missing = travellers.filter((item) => item.bookingId === booking.id && !item.documentsComplete).length
          return <tr key={booking.id}><td><strong>{booking.reference}</strong></td><td>{customer?.name}</td><td>{booking.packageName}</td><td>{shortDate(booking.departureDate)}</td><td>{count}</td><td><Badge>{booking.status}</Badge></td><td>{missing ? `${missing} document check${missing > 1 ? 's' : ''}` : 'Ready'}</td></tr>
        })}</tbody></table>{!upcoming.length && <div className="empty"><strong>No upcoming departures</strong><p>Bookings departing within the next seven days will appear here.</p></div>}</TableShell>
      </section>
      <section className="content-section">
        <div className="section-title"><div><h2>Pending follow-ups</h2><p>Due and overdue lead activity.</p></div><Link to="/leads">Open leads</Link></div>
        <div className="list">{leads.filter((lead) => lead.followUp && daysFromToday(lead.followUp) <= 1 && !['Converted', 'Lost', 'Not Interested'].includes(lead.status)).map((lead) => <div className="list-row" key={lead.id}><div className="avatar">{lead.name.split(' ').map((part) => part[0]).join('')}</div><div><strong>{lead.name}</strong><span>{lead.service} · {lead.source}</span></div><div className="list-end"><Badge>{lead.status}</Badge><small>{daysFromToday(lead.followUp!) < 0 ? 'Overdue' : 'Due today'}</small></div></div>)}</div>{!leads.some((lead) => lead.followUp && daysFromToday(lead.followUp) <= 1 && !['Converted', 'Lost', 'Not Interested'].includes(lead.status)) && <div className="empty"><strong>No follow-ups due</strong><p>There are no overdue or due-today lead follow-ups.</p></div>}
      </section>
      <section className="content-section">
        <div className="section-title"><div><h2>Currently abroad</h2><p>Travel has commenced; not marked returned.</p></div><Link to="/travellers">Operations</Link></div>
        <div className="list">{abroad.map((traveller) => {
          const booking = bookings.find((item) => item.id === traveller.bookingId)!
          return <div className="list-row" key={traveller.id}><div className="avatar">{traveller.name.split(' ').map((part) => part[0]).join('')}</div><div><strong>{traveller.name}</strong><span>{booking.reference} · {booking.packageName}</span></div><div className="list-end"><Badge>{traveller.status}</Badge><small>Returns {shortDate(booking.returnDate)}</small></div></div>
        })}</div>{!abroad.length && <div className="empty"><strong>No travellers currently abroad</strong><p>Travellers marked Abroad will appear here.</p></div>}
      </section>
      <section className="content-section span-two">
        <div className="section-title"><div><h2>Outstanding balances</h2><p>Calculated from agreed prices and confirmed transactions.</p></div><Link to="/payments">Finance overview</Link></div>
        <TableShell><table><thead><tr><th>Customer</th><th>Booking</th><th>Agreed price</th><th>Confirmed paid</th><th>Outstanding</th></tr></thead><tbody>{bookings.filter((booking) => bookingBalance(booking, payments) > 0).slice(0, 4).map((booking) => <tr key={booking.id}><td>{customers.find((item) => item.id === booking.customerId)?.name}</td><td><strong>{booking.reference}</strong></td><td>{money(booking.agreedPrice)}</td><td>{money(confirmedPaid(booking.id, payments))}</td><td><strong>{money(bookingBalance(booking, payments))}</strong></td></tr>)}</tbody></table>{!bookings.some((booking) => bookingBalance(booking, payments) > 0) && <div className="empty"><strong>No outstanding balances</strong><p>Bookings with an unpaid balance will appear here.</p></div>}</TableShell>
      </section>
    </div>
  </div>
}
