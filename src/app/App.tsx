import { RouterProvider } from 'react-router'
import { AppStoreProvider } from '@/hooks/useAppStore'
import { router } from '@/app/routes'

export default function App() {
  return <AppStoreProvider><RouterProvider router={router} /></AppStoreProvider>
}
