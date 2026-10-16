import { useLocation } from 'react-router-dom'
import { site } from '@/data/site'

/**
 * Per-route document metadata. React 19 hoists <title>/<meta>/<link> into <head>.
 * Canonical + og:url are emitted only once a production URL is configured in data/site.ts.
 */
export function Seo({ title, description }: { title?: string; description?: string }) {
  const { pathname } = useLocation()
  const fullTitle = title ? `${title} — ${site.name}` : `${site.name} — ${site.role}`
  const desc = description ?? site.summary
  const url = site.siteUrl ? `${site.siteUrl.replace(/\/$/, '')}${pathname}` : null
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {url && <link rel="canonical" href={url} />}
      {url && <meta property="og:url" content={url} />}
    </>
  )
}
