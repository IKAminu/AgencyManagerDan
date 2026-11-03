import { RouterProvider } from 'react-router'
import { AuthGate, type AppMode } from '@/auth/AuthGate'
import { AppStoreProvider } from '@/hooks/useAppStore'
import { router } from '@/app/routes'

export default function App() {
  return <AuthGate onMode={() => {}}>{(mode: AppMode) => <AppStoreProvider key={mode} mode={mode}><RouterProvider router={router} /></AppStoreProvider>}</AuthGate>
}
