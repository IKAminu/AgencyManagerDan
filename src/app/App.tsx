import { RouterProvider } from 'react-router'
import { AuthGate } from '@/auth/AuthGate'
import { AppStoreProvider } from '@/hooks/useAppStore'
import { router } from '@/app/routes'

export default function App() {
  return <AuthGate><AppStoreProvider><RouterProvider router={router} /></AppStoreProvider></AuthGate>
}
