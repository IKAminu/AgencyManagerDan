import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { Bell, BookOpen, BriefcaseBusiness, CalendarCheck, ChevronDown, CircleDollarSign, FileText, LayoutDashboard, LogOut, Menu, Package, Plus, Search, Settings, Users, WalletCards, X } from 'lucide-react'
import { appConfig } from '@/config/app'\nimport { supabase } from '@/lib/supabase'
import { useAppStore } from '@/hooks/useAppStore'
import { Button, IconButton } from '@/components/ui'
import { QuickActionModal } from '@/components/QuickActionModal'
import { daysFromToday, supplierOutstanding } from '@/lib/business'

const groups = [
  { label: 'Overview', links: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }] },
  { label: 'Customers', links: [{ to: '/leads', label: 'Leads', icon: BriefcaseBusiness }, { to: '/customers', label: 'Customer records', icon: Users }] },
  { label: 'Travel management', links: [{ to: '/packages', label: 'Packages', icon: Package }, { to: '/bookings', label: 'Bookings', icon: BookOpen }, { to: '/travellers', label: 'Travellers & operations', icon: CalendarCheck }] },
  { label: 'Finance', links: [{ to: '/payments', label: 'Payments & balances', icon: CircleDollarSign }, { to: '/suppliers', label: 'Supplier payments', icon: WalletCards }] },
  { label: 'Administration', links: [{ to: '/documents', label: 'Documents', icon: FileText }, { to: '/settings', label: 'Settings', icon: Settings }] },
]

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { leads, customers, bookings, travellers, supplierCosts, setAction } = useAppStore()
  useEffect(() => {
    const closeOverlays = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchOpen(false)
        setNotificationsOpen(false)
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', closeOverlays)
    return () => window.removeEventListener('keydown', closeOverlays)
  }, [])

  const alerts = useMemo(() => {
    const followUps = leads.filter((item) => item.followUp && daysFromToday(item.followUp) <= 1 && !['Converted', 'Lost', 'Not Interested'].includes(item.status))
    const departures = bookings.filter((item) => daysFromToday(item.departureDate) >= 0 && daysFromToday(item.departureDate) <= 7 && !['Cancelled', 'Completed'].includes(item.status))
    const overdueCosts = supplierCosts.filter((item) => supplierOutstanding(item) > 0 && (item.status === 'Overdue' || daysFromToday(item.dueDate) < 0))
    return [
      ...followUps.map((item) => ({ title: item.name, detail: `${daysFromToday(item.followUp!) < 0 ? 'Overdue' : 'Due today'} · Lead follow-up`, path: '/leads' })),
      ...departures.map((item) => ({ title: item.reference, detail: `Departure ${item.departureDate} · Review travel readiness`, path: '/bookings' })),
      ...overdueCosts.map((item) => ({ title: item.supplier, detail: `Overdue supplier balance · ${item.category}`, path: '/suppliers' })),
    ].slice(0, 8)
  }, [leads, bookings, supplierCosts])

  const results = useMemo(() => {
    if (query.length < 2) return []
    const q = query.toLowerCase()
    return [
      ...leads.filter((item) => `${item.reference} ${item.name} ${item.phone}`.toLowerCase().includes(q)).map((item) => ({ label: item.name, meta: `Lead · ${item.reference}`, path: '/leads' })),
      ...customers.filter((item) => `${item.reference} ${item.name} ${item.phone}`.toLowerCase().includes(q)).map((item) => ({ label: item.name, meta: `Customer · ${item.reference}`, path: '/customers' })),
      ...bookings.filter((item) => `${item.reference} ${item.packageName}`.toLowerCase().includes(q)).map((item) => ({ label: item.reference, meta: `Booking · ${item.packageName}`, path: '/bookings' })),
      ...travellers.filter((item) => item.name.toLowerCase().includes(q)).map((item) => ({ label: item.name, meta: 'Traveller', path: '/travellers' })),
    ].slice(0, 7)
  }, [query, leads, customers, bookings, travellers])

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><img className="brand-logo" src={`${import.meta.env.BASE_URL}brand/logo.png`} alt="Dandurgu logo" /><div className="brand-name"><strong>Dandurgu</strong><span>Headquarters</span></div><IconButton label="Close navigation" className="mobile-close" onClick={() => setMenuOpen(false)}><X size={18} /></IconButton></div>
      <nav>{groups.map((group) => <div className="nav-group" key={group.label}><p>{group.label}</p>{group.links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={18} /><span>{label}</span></NavLink>)}</div>)}</nav>
      <div className="sidebar-foot"><span className="status-dot" /> <div><strong>{appConfig.useMockData ? 'Demo mode' : 'Supabase mode'}</strong><span>{appConfig.useMockData ? 'Session-only mock records' : 'Shared database records'}</span></div></div>
    </aside>
    {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}
    <div className="main-column">
      <header className="topbar">
        <IconButton label="Open navigation" className="menu-button" onClick={() => setMenuOpen(true)}><Menu size={20} /></IconButton>
        <div className="global-search">
          <Search size={18} />
          <input aria-label="Search all records" placeholder="Search customers, bookings, travellers…" value={query} onFocus={() => setSearchOpen(true)} onChange={(event) => { setQuery(event.target.value); setSearchOpen(true) }} />
          {searchOpen && query && <div className="search-results">{results.length ? results.map((result, index) => <button key={`${result.meta}-${index}`} onClick={() => { navigate(result.path); setQuery(''); setSearchOpen(false) }}><strong>{result.label}</strong><span>{result.meta}</span></button>) : <p>No matching records</p>}</div>}
        </div>
        <div className="top-actions">
          <div className="popover-wrap"><IconButton label={alerts.length ? `View ${alerts.length} notifications` : 'No current notifications'} onClick={() => setNotificationsOpen(!notificationsOpen)}><Bell size={19} />{alerts.length > 0 && <span className="notification-dot" />}</IconButton>{notificationsOpen && <div className="notifications"><div><strong>Current alerts</strong><span>{alerts.length} items · Based on current records</span></div>{alerts.length ? alerts.map((alert, index) => <button key={`${alert.path}-${index}`} onClick={() => { navigate(alert.path); setNotificationsOpen(false) }}><strong>{alert.title}</strong><span>{alert.detail}</span></button>) : <p className="notification-empty">Nothing needs attention right now.</p>}</div>}</div>
          <Button className="quick-button" onClick={() => setAction('lead')}><Plus size={17} /> Quick action <ChevronDown size={15} /></Button>
          <IconButton label="Sign out" title="Sign out" onClick={() => { void supabase?.auth.signOut() }}><LogOut size={18} /></IconButton>
        </div>
      </header>
      <main><Outlet /></main>
    </div>
    <button className="mobile-fab" aria-label="Add lead" onClick={() => setAction('lead')}><Plus size={22} /></button>
    <QuickActionModal />
  </div>
}
