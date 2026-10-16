import { useRef, type ElementType, type HTMLAttributes, type ReactNode, type ComponentPropsWithoutRef } from 'react'
import { gsap, SplitText, useGSAP, motionDisabled, ease } from '@/lib/animation'

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
 * Scroll-triggered entrance. Content is visible by default; GSAP only sets the
 * from-state when motion is allowed, so nothing hides if JS or motion is off.
 */
export function Reveal<T extends ElementType = 'div'>({
  as,
  children,
  stagger = false,
  y = 36,
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
      const targets = stagger !== false ? Array.from(el.children) : el
      gsap.from(targets, {
        y,
        autoAlpha: 0,
        duration: 1.1,
        delay,
        ease: ease.out,
        stagger: stagger || 0,
        clearProps: 'transform,opacity,visibility',
        scrollTrigger: { trigger: el, start, once: true },
      })
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
  /** Animate on mount instead of on scroll. */
  immediate?: boolean
  start?: string
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>

/** Masked line-by-line headline reveal using SplitText (re-splits on resize). */
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

  useGSAP(
    () => {
      const el = ref.current
      if (!el || motionDisabled()) return
      let played = false
      const split = SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'split-line',
        autoSplit: true,
        onSplit(self) {
          if (played) return
          return gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.25,
            delay,
            ease: ease.out,
            stagger: 0.08,
            onComplete: () => {
              played = true
            },
            scrollTrigger: immediate ? undefined : { trigger: el, start, once: true },
          })
        },
      })
      return () => split.revert()
    },
    { scope: ref },
  )

  return (
    <Tag ref={ref} className={className} {...(rest as HTMLAttributes<HTMLDivElement>)}>
      {children}
    </Tag>
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
        scrollTrigger: scrub
          ? { trigger: ref.current, start, end, scrub }
          : { trigger: ref.current, start, once: true },
      })
      const fades = ref.current.querySelectorAll('[data-draw-fade]')
      if (fades.length)
        gsap.from(fades, {
          autoAlpha: 0,
          y: 8,
          duration: 0.8,
          stagger: 0.04,
          delay: 0.5,
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
