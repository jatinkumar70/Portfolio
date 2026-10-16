// Writes dist/sitemap.xml (and adds it to dist/robots.txt) when SITE_URL or
// VITE_SITE_URL is set at build time. Without a known domain it does nothing —
// we never invent a production URL.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const base = (process.env.SITE_URL || process.env.VITE_SITE_URL || '').replace(/\/$/, '')
if (!base) {
  console.log('[sitemap] SITE_URL not set — skipping sitemap generation.')
  process.exit(0)
}

const routes = ['/', '/about', '/contact']
const today = new Date().toISOString().slice(0, 10)
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((r) => `  <url><loc>${base}${r}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`
writeFileSync('dist/sitemap.xml', xml)

if (existsSync('dist/robots.txt')) {
  const robots = readFileSync('dist/robots.txt', 'utf8').replace(/^# Sitemap:.*$/m, `Sitemap: ${base}/sitemap.xml`)
  writeFileSync('dist/robots.txt', robots.includes('Sitemap:') ? robots : `${robots}\nSitemap: ${base}/sitemap.xml\n`)
}
console.log(`[sitemap] wrote dist/sitemap.xml for ${base}`)
