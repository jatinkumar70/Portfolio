import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

/** Last-resort error screen (e.g. a lazy chunk failed after a redeploy). */
export function RouteError() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : 'Something went wrong loading this page.'
  return (
    <main className="shell flex min-h-[100dvh] flex-col justify-center gap-8 py-20">
      <p className="eyebrow">Error</p>
      <h1 className="display text-h1">This page didn&apos;t load.</h1>
      <p className="max-w-[48ch] text-charcoal">{message} A refresh usually fixes it — a newer version of the site may have been published.</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn btn-solid" onClick={() => window.location.reload()}>
          Reload
        </button>
        <Link to="/" className="btn">
          Go home
        </Link>
      </div>
    </main>
  )
}
