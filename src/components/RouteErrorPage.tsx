import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router'

export function RouteErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()
  const message = error instanceof Error ? error.message : ''
  const isChunkError = /dynamically imported module|importing a module script failed|failed to fetch module|loading chunk/i.test(message)
  const title = isChunkError ? 'This page could not be loaded' : 'Something went wrong'
  const description = isChunkError
    ? 'The app could not load this page’s code. This can happen after an update or when the network interrupts a file download. Reload the app to fetch the latest version.'
    : isRouteErrorResponse(error) && error.status === 404
      ? 'The page you requested could not be found.'
      : 'The app ran into an unexpected problem. Your saved records have not been intentionally changed. Return to the dashboard or reload and try again.'

  return <main className="route-error-screen" role="alert">
    <section className="route-error-card" aria-labelledby="route-error-title">
      <div className="route-error-icon"><AlertTriangle size={22} /></div>
      <h1 id="route-error-title">{title}</h1>
      <p>{description}</p>
      <div className="route-error-actions">
        <button type="button" onClick={() => window.location.reload()}><RefreshCw size={15} /> Reload app</button>
        <button type="button" onClick={() => navigate('/', { replace: true })}><Home size={15} /> Go to dashboard</button>
      </div>
    </section>
  </main>
}
