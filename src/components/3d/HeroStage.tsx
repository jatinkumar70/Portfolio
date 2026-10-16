import { lazy, Suspense, useEffect, useRef, useState, type RefObject } from 'react'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { hasWebGL } from '@/lib/webgl'
import { useReducedMotion } from '@/lib/motion-preferences'
import { cn } from '@/lib/utils'
import { HeroFallback } from './HeroFallback'

const HeroScene = lazy(() => import('./HeroScene'))

/**
 * Decides between the WebGL sculpture and its SVG drawing, pauses rendering
 * off-screen / in background tabs, and recovers from context loss.
 */
export function HeroStage({ progressRef, exploded, className }: { progressRef: RefObject<number>; exploded: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [webgl] = useState(() => hasWebGL())
  const [lost, setLost] = useState(false)
  const [inView, setInView] = useState(true)
  const [visible, setVisible] = useState(() => document.visibilityState === 'visible')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '120px' })
    io.observe(el)
    const onVis = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  const fallback = <HeroFallback className="h-full w-full" />
  const use3d = webgl && !lost

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* SVG drawing sits underneath until the scene has rendered a frame */}
      <div className={cn('absolute inset-0 grid place-items-center p-[8%] transition-opacity duration-700', use3d && ready ? 'opacity-0' : 'opacity-100')}>
        {fallback}
      </div>
      {use3d && (
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <div className={cn('absolute inset-0 transition-opacity duration-1000', ready ? 'opacity-100' : 'opacity-0')}>
              <HeroScene
                progressRef={progressRef}
                exploded={exploded}
                reduced={reduced}
                active={inView && visible}
                onContextLost={() => setLost(true)}
                onReady={() => setReady(true)}
              />
            </div>
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  )
}
