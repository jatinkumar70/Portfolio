import { Suspense, useEffect, useLayoutEffect, useRef, type MouseEvent } from 'react'
import { Outlet, useLocation, useNavigation } from 'react-router-dom'
import { Header } from '@/components/navigation/Header'
import { Footer } from '@/components/layout/Footer'
import { Cursor } from '@/components/layout/Cursor'
import { Preloader } from '@/components/preloader/Preloader'
import { usePreloader } from '@/components/preloader/preloader-state'
import { useSmoothScroll } from '@/lib/smooth-scroll'
import { gsap, ScrollTrigger, motionDisabled, ease } from '@/lib/animation'

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

/** A thin ink line that tracks lazy route loading. */
function RouteProgress() {
  const navigation = useNavigation()
  const loading = navigation.state === 'loading'
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-accent transition-transform duration-700 ease-[var(--ease-out)]"
      style={{ transform: `scaleX(${loading ? 0.7 : 0})`, opacity: loading ? 1 : 0 }}
    />
  )
}

/** Entrance choreography on every route change: an ink curtain lifts off the new page. */
function RouteCurtain() {
  const { pathname } = useLocation()
  const ref = useRef<HTMLDivElement>(null)
  const first = useRef(true)

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const el = ref.current
    if (!el || motionDisabled()) return
    const tl = gsap
      .timeline()
      .set(el, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)' })
      .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9, ease: ease.inOut })
      .set(el, { autoAlpha: 0 })
    const main = document.getElementById('main')
    if (main) gsap.fromTo(main, { y: 48 }, { y: 0, duration: 1.2, ease: ease.out, clearProps: 'transform' })
    return () => {
      tl.kill()
    }
  }, [pathname])

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[55] bg-ink" style={{ visibility: 'hidden' }}>
      <div className="shell flex h-full items-end pb-10">
        <span className="meta text-paper/60">JK / {pathname === '/' ? 'Index' : pathname.replace(/^\//, '').replace(/\//g, ' / ')}</span>
      </div>
    </div>
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
      <Cursor />
      {active && <Preloader key={runId} />}
    </div>
  )
}
