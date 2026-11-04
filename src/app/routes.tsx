import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/layouts/AppLayout'
import { RouteErrorPage } from '@/components/RouteErrorPage'

export const router = createBrowserRouter([

  {
    path: '/',
    Component: AppLayout,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, lazy: async () => ({ Component: (await import('@/pages/Dashboard')).Dashboard }) },
      { path: 'leads', lazy: async () => ({ Component: (await import('@/pages/Modules')).LeadsPage }) },
      { path: 'customers', lazy: async () => ({ Component: (await import('@/pages/Modules')).CustomersPage }) },
      { path: 'packages', lazy: async () => ({ Component: (await import('@/pages/Modules')).PackagesPage }) },
      { path: 'bookings', lazy: async () => ({ Component: (await import('@/pages/Modules')).BookingsPage }) },
      { path: 'travellers', lazy: async () => ({ Component: (await import('@/pages/Modules')).TravellersPage }) },
      { path: 'payments', lazy: async () => ({ Component: (await import('@/pages/Modules')).PaymentsPage }) },
      { path: 'suppliers', lazy: async () => ({ Component: (await import('@/pages/Modules')).SuppliersPage }) },
      { path: 'documents', lazy: async () => ({ Component: (await import('@/pages/Modules')).DocumentsPage }) },
      { path: 'settings', lazy: async () => ({ Component: (await import('@/pages/Modules')).SettingsPage }) },
      { path: 'notes', lazy: async () => ({ Component: (await import('@/pages/Notes')).NotesPage }) },
      { path: 'notes/guidelines', lazy: async () => ({ Component: (await import('@/pages/Guide')).GuidePage }) },
      { path: '*', lazy: async () => ({ Component: (await import('@/pages/Modules')).NotFoundPage }) },
    ],
  },
], {
  basename: import.meta.env.BASE_URL,
})
