import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource-variable/inter/index.css'
import '@fontsource-variable/jetbrains-mono/index.css'
import './styles/globals.css'
import { prefersReducedMotion } from './lib/motion-preferences'
import App from './app/App'

const syncMotion = () => (document.documentElement.dataset.motion = prefersReducedMotion() ? 'reduce' : 'full')
syncMotion()
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', syncMotion)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
