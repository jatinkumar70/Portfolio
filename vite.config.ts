import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/**
 * Social-image URLs must be absolute. When VITE_SITE_URL is set they become
 * `https://domain/og-image.png`; otherwise they stay root-relative.
 * Canonical + og:url are rendered per route by <Seo /> from the same variable.
 */
function siteUrlPlugin(siteUrl: string): Plugin {
  const base = siteUrl.replace(/\/$/, '')
  return {
    name: 'site-url',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', base),
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), siteUrlPlugin(env.VITE_SITE_URL || '')],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      target: 'es2022',
      // three.js (~260 kB gzip) is only loaded lazily by the hero scene.
      chunkSizeWarningLimit: 1000,
    },
  }
})
