import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/animation'
import { useFinePointer } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/lib/motion-preferences'

/**
 * A difference-blended ring that trails the system cursor (which stays visible).
 * Grows into a "View" disc over project links. Desktop + fine pointer only.
 */
export function Cursor() {
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const enabled = fine && !reduced
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'idle' | 'link' | 'view'>('idle')
  const [label, setLabel] = useState('View')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled || !ref.current) return
    const xTo = gsap.quickTo(ref.current, 'x', { duration: 0.45, ease: 'power3.out' })
    const yTo = gsap.quickTo(ref.current, 'y', { duration: 0.45, ease: 'power3.out' })

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      xTo(e.clientX)
      yTo(e.clientY)
      setVisible(true)
      const target = (e.target as Element | null)?.closest?.('[data-cursor]') as HTMLElement | null
      const next = (target?.dataset.cursor as 'link' | 'view' | undefined) ?? 'idle'
      setState(next)
      if (next === 'view') setLabel(target?.dataset.cursorLabel ?? 'View')
    }
    const leave = () => setVisible(false)
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div ref={ref} className="cursor-dot" data-state={state} data-visible={visible} aria-hidden="true">
      <span className="cursor-label">{label}</span>
    </div>
  )
}
