import { useEffect, useRef } from 'react'
import { motionDisabled } from '@/lib/animation'

const GLYPHS = '!<>-_\\/[]{}—=+*^?#01'

/**
 * Text that briefly "decodes" through glyphs when its parent link/button is
 * hovered or focused. Screen readers always get the real text via aria-label.
 */
export function ScrambleText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    const host = el?.closest('a, button') ?? el
    if (!el || !host) return
    let raf = 0
    const run = () => {
      if (motionDisabled()) return
      cancelAnimationFrame(raf)
      const start = performance.now()
      const duration = 420
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / duration)
        const reveal = Math.floor(p * text.length)
        let out = ''
        for (let i = 0; i < text.length; i++) {
          const ch = text[i]
          out += i < reveal || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]
        }
        el.textContent = out
        if (p < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }
    host.addEventListener('pointerenter', run)
    host.addEventListener('focus', run)
    return () => {
      cancelAnimationFrame(raf)
      host.removeEventListener('pointerenter', run)
      host.removeEventListener('focus', run)
      el.textContent = text
    }
  }, [text])

  return (
    <span className={className} aria-label={text}>
      <span ref={ref} aria-hidden="true" className="tabular">
        {text}
      </span>
    </span>
  )
}
