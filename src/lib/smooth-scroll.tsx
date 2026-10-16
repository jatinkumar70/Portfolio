import Lenis from 'lenis'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger } from './animation'
import { useReducedMotion } from './motion-preferences'

interface ScrollApi {
  /** Scroll to an element, selector or y-position, honouring the fixed header. */
  scrollTo: (target: string | HTMLElement | number, opts?: { immediate?: boolean; offset?: number }) => void
  lock: () => void
  unlock: () => void
}

const ScrollContext = createContext<ScrollApi | null>(null)

function headerOffset() {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--header-h')
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  return -(parseFloat(v) * rem || 68) - 8
}

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis
 * share one clock. Disabled entirely for reduced motion (native scroll is used).
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const locks = useRef(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
      anchors: false,
    })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    if (locks.current > 0) lenis.stop()

    return () => {
      gsap.ticker.remove(tick)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reduced])

  const scrollTo = useCallback<ScrollApi['scrollTo']>(
    (target, opts = {}) => {
      const offset = opts.offset ?? (typeof target === 'number' ? 0 : headerOffset())
      const lenis = lenisRef.current
      if (lenis) {
        lenis.scrollTo(target, { offset, immediate: opts.immediate || reduced, force: true })
        return
      }
      let y: number
      if (typeof target === 'number') y = target
      else {
        const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
        if (!el) return
        y = el.getBoundingClientRect().top + window.scrollY + offset
      }
      window.scrollTo({ top: y, behavior: opts.immediate || reduced ? 'auto' : 'smooth' })
    },
    [reduced],
  )

  const lock = useCallback(() => {
    locks.current += 1
    lenisRef.current?.stop()
    document.documentElement.style.overflow = 'hidden'
  }, [])

  const unlock = useCallback(() => {
    locks.current = Math.max(0, locks.current - 1)
    if (locks.current === 0) {
      lenisRef.current?.start()
      document.documentElement.style.overflow = ''
    }
  }, [])

  const api = useMemo(() => ({ scrollTo, lock, unlock }), [scrollTo, lock, unlock])
  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>
}

export function useSmoothScroll(): ScrollApi {
  const ctx = useContext(ScrollContext)
  if (!ctx) throw new Error('useSmoothScroll must be used inside SmoothScrollProvider')
  return ctx
}
