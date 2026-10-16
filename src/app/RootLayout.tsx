import { Suspense, useEffect, useLayoutEffect, useRef, type MouseEvent } from 'react'
import { Outlet, useLocation, useNavigation } from 'react-router-dom'
import { Header } from '@/components/navigation/Header'
import { Footer } from '@/components/layout/Footer'
import { Cursor } from '@/components/layout/Cursor'
import { Preloader } from '@/components/preloader/Preloader'
import { usePreloader } from '@/components/preloader/preloader-state'
import { useSmoothScroll } from '@/lib/smooth-scroll'
import { gsap, ScrollTrigger, motionDisabled, ease, GLYPHS } from '@/lib/animation'

/** Resets scroll on navigation and resolves #hash targets with the header offset. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  const { scrollTo } = useSmoothScroll()

  useLayoutEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  }, [])

  useEffect(() => {
    if (hash) {
      // wait a frame so lazy content has laid out
      const id = window.setTimeout(() => scrollTo(hash, { immediate: false }), 120)
      return () => window.clearTimeout(id)
    }
    scrollTo(0, { immediate: true })
  }, [pathname, hash, scrollTo])

  // Layout can shift after fonts and lazy media load — keep triggers accurate.
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 400)
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {})
    return () => window.clearTimeout(id)
  }, [pathname])

  return null
}

/** A thin neon line that tracks lazy route loading. */
function RouteProgress() {
  const navigation = useNavigation()
  const loading = navigation.state === 'loading'
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-neon shadow-[0_0_10px_var(--neon)] transition-transform duration-700 ease-[var(--ease-out)]"
      style={{ transform: `scaleX(${loading ? 0.7 : 0})`, opacity: loading ? 1 : 0 }}
    />
  )
}

const BARS = 7

/**
 * Route change: the screen is shuttered by void bars carrying the destination
 * name, which decrypts, then the bars servo out sideways from the centre.
 */
function RouteCurtain() {
  const { pathname } = useLocation()
  const ref = useRef<HTMLDivElement>(null)
  const first = useRef(true)
  const label = pathname === '/' ? 'INDEX' : pathname.replace(/^\//, '').replace(/\//g, ' / ').toUpperCase()

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const el = ref.current
    if (!el || motionDisabled()) return
    const q = gsap.utils.selector(el)
    const tl = gsap
      .timeline()
      .set(el, { autoAlpha: 1 })
      .set(q('[data-bar]'), { xPercent: 0 })
      .set(q('[data-label]'), { autoAlpha: 1 })
      .to(q('[data-name]'), { duration: 0.45, ease: 'none', scrambleText: { text: label, chars: GLYPHS, speed: 1 } })
      .to(q('[data-label]'), { autoAlpha: 0, duration: 0.15, ease: 'steps(3)' })
      .to(q('[data-bar]'), { xPercent: (i: number) => (i % 2 ? 101 : -101), duration: 0.75, ease: ease.servo, stagger: { each: 0.035, from: 'center' } }, '-=0.05')
      .set(el, { autoAlpha: 0 })
    const main = document.getElementById('main')
    if (main) gsap.fromTo(main, { y: 60 }, { y: 0, duration: 1.2, delay: 0.5, ease: ease.out, clearProps: 'transform' })
    return () => {
      tl.kill()
    }
  }, [pathname, label])

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[55]" style={{ visibility: 'hidden' }}>
      <div className="absolute inset-0 flex flex-col">
        {Array.from({ length: BARS }, (_, i) => (
          <div key={i} data-bar className="relative flex-1 bg-void">
            <span className="absolute inset-x-0 bottom-0 h-px bg-line" />
          </div>
        ))}
      </div>
      <div data-label className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="hud text-cyan">&gt; routing to</p>
          <p data-name className="display mt-3 text-[clamp(2.5rem,8vw,7rem)] leading-none text-neon neon-glow">{label}</p>
        </div>
      </div>
    </div>
  )
}

/** Fixed right-edge readout of page scroll. */
function ScrollMeter() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const bar = el.querySelector<HTMLElement>('[data-fill]')
    const num = el.querySelector<HTMLElement>('[data-num]')
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        if (bar) bar.style.transform = `scaleY(${self.progress})`
        if (num) num.textContent = String(Math.round(self.progress * 100)).padStart(3, '0')
      },
    })
    return () => st.kill()
  }, [])
  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex">
      <span className="hud [writing-mode:vertical-rl]">scroll</span>
      <span className="relative h-32 w-[2px] bg-line-strong">
        <span data-fill className="absolute inset-0 origin-top scale-y-0 bg-neon shadow-[0_0_8px_var(--neon)]" />
      </span>
      <span data-num className="hud tabular text-neon">000</span>
    </div>
  )
}

/** CRT dressing — scanlines, vignette, film grain. Decorative only. */
function CrtOverlay() {
  return (
    <>
      <div aria-hidden="true" className="fx-vignette" />
      <div aria-hidden="true" className="fx-scanlines" />
      <div aria-hidden="true" className="fx-grain" />
    </>
  )
}

export function RootLayout() {
  const { active, runId } = usePreloader()
  const { scrollTo } = useSmoothScroll()

  // Same-page anchors scroll smoothly with the header offset.
  function onClickCapture(e: MouseEvent<HTMLDivElement>) {
    const a = (e.target as Element).closest('a')
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return
    const href = a.getAttribute('href')
    if (!href) return
    // '#id' anywhere, or '/#id' while already on the home page
    const hash = href.startsWith('#') ? href : href.startsWith('/#') && location.pathname === '/' ? href.slice(1) : null
    if (!hash || hash.length < 2) return
    const target = document.getElementById(decodeURIComponent(hash.slice(1)))
    if (!target) return
    e.preventDefault()
    history.replaceState(history.state, '', hash)
    scrollTo(target)
    target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }

  return (
    <div onClickCapture={onClickCapture}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <ScrollManager />
      <RouteProgress />
      <RouteCurtain />
      <Header />
      <main id="main" className="outline-none">
        <Suspense fallback={<div className="min-h-[100dvh]" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <ScrollMeter />
      <CrtOverlay />
      <Cursor />
      {active && <Preloader key={runId} />}
    </div>
  )
}
