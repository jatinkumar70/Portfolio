import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/animation'
import { useFinePointer } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/lib/motion-preferences'

/**
 * Targeting reticle: a neon dot locked to the pointer and four bracket corners
 * that lag behind, widen over links and become a filled "View" lens over media.
 * The system cursor stays visible. Desktop + fine pointer only.
 */
export function Cursor() {
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const enabled = fine && !reduced
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'idle' | 'link' | 'view'>('idle')
  const [label, setLabel] = useState('View')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled || !dot.current || !ring.current) return
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08, ease: 'none' })
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.08, ease: 'none' })
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.5, ease: 'power3.out' })
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.5, ease: 'power3.out' })
    const rot = gsap.quickTo(ring.current, 'rotation', { duration: 0.6, ease: 'power3.out' })
    let lastX = 0

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
      rot(gsap.utils.clamp(-25, 25, (e.clientX - lastX) * 1.5))
      lastX = e.clientX
      setVisible(true)
      const target = (e.target as Element | null)?.closest?.('[data-cursor], a, button') as HTMLElement | null
      const next = (target?.dataset.cursor as 'link' | 'view' | undefined) ?? (target ? 'link' : 'idle')
      setState(next)
      if (next === 'view') setLabel(target?.dataset.cursorLabel ?? 'View')
    }
    const down = () => gsap.to(ring.current, { scale: 0.7, duration: 0.15 })
    const up = () => gsap.to(ring.current, { scale: 1, duration: 0.5, ease: 'lock' })
    const leave = () => setVisible(false)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <>
      <div ref={ring} className="cursor-ring" data-state={state} data-visible={visible} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <span className="cursor-label">{label}</span>
      </div>
      <div ref={dot} className="cursor" data-visible={visible} aria-hidden="true">
        <div className="cursor-dot" />
      </div>
    </>
  )
}
