import { useRef, type ElementType, type HTMLAttributes, type ReactNode, type ComponentPropsWithoutRef } from 'react'
import { gsap, SplitText, useGSAP, motionDisabled, ease, GLYPHS } from '@/lib/animation'
import { usePreloader } from '@/components/preloader/preloader-state'
import { cn } from '@/lib/utils'

type RevealProps<T extends ElementType> = {
  as?: T
  children: ReactNode
  /** Animate direct children one after another instead of the wrapper. */
  stagger?: number | false
  y?: number
  delay?: number
  /** ScrollTrigger start position. */
  start?: string
  className?: string
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>

/**
 * Scroll-triggered "boot-in": each item flickers on like a CRT segment while
 * sliding up out of a slight skew. Content is visible by default; GSAP only sets
 * the from-state when motion is allowed, so nothing hides if JS or motion is off.
 */
export function Reveal<T extends ElementType = 'div'>({
  as,
  children,
  stagger = false,
  y = 40,
  delay = 0,
  start = 'top 86%',
  className,
  ...rest
}: RevealProps<T>) {
  // Polymorphic tag — typed as a div internally; callers get the right props via the generic.
  const Tag = (as ?? 'div') as unknown as 'div'
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el || motionDisabled()) return
      const targets = stagger !== false ? Array.from(el.children) : [el]
      const tl = gsap.timeline({ delay, scrollTrigger: { trigger: el, start, once: true } })
      tl.from(targets, {
        y,
        skewY: 3,
        duration: 1.1,
        ease: ease.out,
        stagger: stagger || 0,
        clearProps: 'transform',
      }).from(
        targets,
        // stepped opacity = a flicker, not a fade
        { autoAlpha: 0, duration: 0.5, ease: 'steps(5)', stagger: stagger || 0, clearProps: 'opacity,visibility' },
        0,
      )
    },
    { scope: ref },
  )

  return (
    <Tag ref={ref} className={className} {...(rest as HTMLAttributes<HTMLDivElement>)}>
      {children}
    </Tag>
  )
}

type SplitRevealProps<T extends ElementType> = {
  as?: T
  children: ReactNode
  className?: string
  delay?: number
  /** Animate as soon as the intro hands over, instead of on scroll. */
  immediate?: boolean
  start?: string
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>

/**
 * Headline reveal: characters punch up out of masked lines in a scattered
 * order, each with a brief cyan/magenta flash, then settle to white.
 */
export function SplitReveal<T extends ElementType = 'h2'>({
  as,
  children,
  className,
  delay = 0,
  immediate = false,
  start = 'top 85%',
  ...rest
}: SplitRevealProps<T>) {
  const Tag = (as ?? 'h2') as unknown as 'div'
  const ref = useRef<HTMLDivElement>(null)
  const { complete } = usePreloader()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || motionDisabled()) return
      if (immediate && !complete) {
        gsap.set(el, { autoAlpha: 0 })
        return
      }
      gsap.set(el, { autoAlpha: 1 })
      let played = false
      const split = SplitText.create(el, {
        type: 'lines,chars',
        mask: 'lines',
        linesClass: 'split-line',
        autoSplit: true,
        onSplit(self) {
          if (played) return
          const tl = gsap.timeline({
            delay,
            scrollTrigger: immediate ? undefined : { trigger: el, start, once: true },
            onComplete: () => {
              played = true
            },
          })
          tl.from(self.chars, {
            yPercent: 120,
            duration: 1.05,
            ease: ease.out,
            stagger: { each: 0.018, from: 'random' },
          }).from(
            self.chars,
            {
              color: (i: number) => (i % 3 === 0 ? 'var(--cyan)' : i % 3 === 1 ? 'var(--magenta)' : 'var(--neon)'),
              duration: 0.6,
              ease: 'steps(3)',
              stagger: { each: 0.018, from: 'random' },
              clearProps: 'color',
            },
            0.1,
          )
          return tl
        },
      })
      return () => split.revert()
    },
    { scope: ref, dependencies: [complete], revertOnUpdate: true },
  )

  return (
    <Tag ref={ref} className={className} {...(rest as HTMLAttributes<HTMLDivElement>)}>
      {children}
    </Tag>
  )
}

/**
 * Text that decrypts from glyph noise into the real string when it scrolls in
 * (or on hover when `hover` is set). Screen readers get the clean text only.
 */
export function Decrypt({
  text,
  className,
  delay = 0,
  speed = 0.6,
  duration = 1.2,
  hover = false,
  immediate = false,
  start = 'top 90%',
}: {
  text: string
  className?: string
  delay?: number
  speed?: number
  duration?: number
  /** Re-scramble on pointer enter of the closest `[data-decrypt-host]` (or itself). */
  hover?: boolean
  immediate?: boolean
  start?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const { complete } = usePreloader()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || motionDisabled()) return
      if (immediate && !complete) {
        el.textContent = ''
        return
      }
      const run = () =>
        gsap.to(el, {
          duration,
          delay,
          ease: 'none',
          scrambleText: { text, chars: GLYPHS, speed, revealDelay: 0.25, tweenLength: false },
        })
      if (immediate) run()
      else {
        el.textContent = ''
        gsap.to(el, {
          duration,
          delay,
          ease: 'none',
          scrambleText: { text, chars: GLYPHS, speed, revealDelay: 0.25, tweenLength: true },
          scrollTrigger: { trigger: el, start, once: true },
        })
      }
      if (!hover) return
      const host = (el.closest('[data-decrypt-host]') as HTMLElement | null) ?? el
      const onEnter = () => {
        gsap.killTweensOf(el)
        gsap.to(el, { duration: 0.6, ease: 'none', scrambleText: { text, chars: GLYPHS, speed: 1, tweenLength: false } })
      }
      host.addEventListener('pointerenter', onEnter)
      return () => host.removeEventListener('pointerenter', onEnter)
    },
    { scope: ref, dependencies: [complete, text], revertOnUpdate: true },
  )

  return (
    <span className={cn('relative', className)}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true">
        {text}
      </span>
    </span>
  )
}

/** Draws every `[data-draw]` SVG path inside it as the block scrolls into view. */
export function DrawOnScroll({
  children,
  className,
  scrub = false,
  start = 'top 80%',
  end = 'bottom 60%',
}: {
  children: ReactNode
  className?: string
  scrub?: boolean | number
  start?: string
  end?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      if (!ref.current || motionDisabled()) return
      const paths = ref.current.querySelectorAll('[data-draw]')
      if (!paths.length) return
      gsap.from(paths, {
        drawSVG: 0,
        duration: 1.6,
        ease: ease.inOut,
        stagger: 0.06,
        scrollTrigger: scrub ? { trigger: ref.current, start, end, scrub } : { trigger: ref.current, start, once: true },
      })
      const fades = ref.current.querySelectorAll('[data-draw-fade]')
      if (fades.length)
        gsap.from(fades, {
          autoAlpha: 0,
          duration: 0.6,
          ease: 'steps(4)',
          stagger: 0.05,
          delay: 0.6,
          scrollTrigger: { trigger: ref.current, start, once: true },
        })
    },
    { scope: ref },
  )
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
