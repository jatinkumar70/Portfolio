import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin, SplitText, useGSAP)

gsap.defaults({ ease: 'expo.out', duration: 1 })
// Conditional UI (filters, empty selections) legitimately animates empty sets.
gsap.config({ nullTargetWarn: false })

/** Shared easing vocabulary — keeps the motion language consistent. */
export const ease = {
  out: 'expo.out',
  inOut: 'expo.inOut',
  soft: 'power3.out',
  snap: 'power4.inOut',
  ui: 'power2.out',
  servo: 'power4.out',
} as const

/** Breakpoint contexts for gsap.matchMedia(). */
export const mq = {
  desktop: '(min-width: 64rem) and (prefers-reduced-motion: no-preference)',
  tablet: '(min-width: 48rem) and (max-width: 63.99rem) and (prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 47.99rem) and (prefers-reduced-motion: no-preference)',
  motion: '(prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
} as const

/** True when motion should be skipped (OS setting or visitor override). */
export function motionDisabled(): boolean {
  return document.documentElement.dataset.motion === 'reduce'
}

export { gsap, ScrollTrigger, DrawSVGPlugin, MotionPathPlugin, SplitText, useGSAP }
