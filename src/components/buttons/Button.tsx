import { forwardRef, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Check, Copy } from 'lucide-react'
import { cn, copyText } from '@/lib/utils'
import { gsap, motionDisabled } from '@/lib/animation'

type Variant = 'outline' | 'solid' | 'on-ink'
type Size = 'md' | 'sm'

function classes(variant: Variant, size: Size, className?: string) {
  return cn('btn', variant === 'solid' && 'btn-solid', variant === 'on-ink' && 'btn-on-ink', size === 'sm' && 'btn-sm', className)
}

interface Common {
  variant?: Variant
  size?: Size
  /** Arrow glyph: internal → right, external → diagonal, none. */
  arrow?: 'right' | 'external' | 'none'
  children: ReactNode
}

function Arrow({ kind }: { kind: Common['arrow'] }) {
  if (kind === 'none') return null
  const Icon = kind === 'external' ? ArrowUpRight : ArrowRight
  return <Icon className="btn-arrow" size={16} strokeWidth={1.5} aria-hidden="true" />
}

/** Internal route link styled as a button. */
export function ButtonLink({ variant = 'outline', size = 'md', arrow = 'right', className, children, ...rest }: Common & LinkProps) {
  return (
    <Link className={classes(variant, size, className)} data-cursor="link" {...rest}>
      <span>{children}</span>
      <Arrow kind={arrow} />
    </Link>
  )
}

/** External / file link styled as a button. */
export function ButtonAnchor({
  variant = 'outline',
  size = 'md',
  arrow = 'external',
  className,
  children,
  ...rest
}: Common & ComponentPropsWithoutRef<'a'>) {
  return (
    <a className={classes(variant, size, className)} data-cursor="link" {...rest}>
      <span>{children}</span>
      <Arrow kind={arrow} />
    </a>
  )
}

export const Button = forwardRef<HTMLButtonElement, Common & ComponentPropsWithoutRef<'button'>>(function Button(
  { variant = 'outline', size = 'md', arrow = 'none', className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={classes(variant, size, className)} data-cursor="link" {...rest}>
      <span>{children}</span>
      <Arrow kind={arrow} />
    </button>
  )
})

/** Copies text and announces the result to screen readers. */
export function CopyButton({
  value,
  label,
  className,
  variant = 'outline',
  size = 'sm',
}: {
  value: string
  label: string
  className?: string
  variant?: Variant
  size?: Size
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const timer = useRef<number | undefined>(undefined)
  async function onClick() {
    const ok = await copyText(value)
    setState(ok ? 'copied' : 'failed')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setState('idle'), 2200)
  }
  return (
    <button type="button" onClick={onClick} className={classes(variant, size, className)} data-cursor="link">
      {state === 'copied' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      <span>{state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : label}</span>
      <span className="sr-only" role="status" aria-live="polite">
        {state === 'copied' ? `${value} copied to clipboard` : state === 'failed' ? 'Copy failed — select the text manually' : ''}
      </span>
    </button>
  )
}

/** Pointer-magnetic wrapper — desktop fine pointers only, never affects layout. */
export function Magnetic({ children, strength = 0.28, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  function move(e: React.PointerEvent) {
    const el = ref.current
    if (!el || e.pointerType !== 'mouse' || motionDisabled()) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - (r.left + r.width / 2)) * strength
    const y = (e.clientY - (r.top + r.height / 2)) * strength
    gsap.to(el, { x, y, duration: 0.6, ease: 'power3.out' })
  }
  function leave() {
    if (ref.current) gsap.to(ref.current, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' })
  }
  return (
    <span ref={ref} className={cn('inline-block', className)} onPointerMove={move} onPointerLeave={leave}>
      {children}
    </span>
  )
}
