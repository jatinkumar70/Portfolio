import { useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger, useGSAP, motionDisabled } from '@/lib/animation'
import { cn } from '@/lib/utils'

/**
 * Infinite marquee that drifts on its own and surges / reverses with scroll
 * velocity. Content is duplicated once for a seamless loop. Static (and still
 * fully readable) when motion is reduced.
 */
export function Marquee({ children, className, speed = 40, reverse = false }: { children: ReactNode; className?: string; speed?: number; reverse?: boolean }) {
  const wrap = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const tr = track.current
      if (!tr || motionDisabled()) return
      const dir = reverse ? 1 : -1
      let x = 0
      let boost = 0
      let half = tr.scrollWidth / 2
      const ro = new ResizeObserver(() => (half = tr.scrollWidth / 2))
      ro.observe(tr)
      const st = ScrollTrigger.create({
        trigger: wrap.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          boost = gsap.utils.clamp(-12, 12, self.getVelocity() / 220)
        },
      })
      const tick = (_t: number, dt: number) => {
        boost *= 0.92
        // scrolling down speeds it up; scrolling up hard runs it backwards
        const v = (speed / 1000) * dt * (1 + boost)
        x += v * dir
        if (x <= -half) x += half
        if (x > 0) x -= half
        gsap.set(tr, { x })
      }
      gsap.ticker.add(tick)
      return () => {
        gsap.ticker.remove(tick)
        st.kill()
        ro.disconnect()
      }
    },
    { scope: wrap },
  )

  return (
    <div ref={wrap} className={cn('overflow-hidden', className)}>
      <div ref={track} className="flex w-max will-change-transform">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}
