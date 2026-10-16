import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { CustomEase } from 'gsap/CustomEase'
import { Observer } from 'gsap/Observer'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, CustomEase, Observer, DrawSVGPlugin, useGSAP)

gsap.defaults({ ease: 'expo.out', duration: 1 })
// Conditional UI (filters, empty selections) legitimately animates empty sets.
gsap.config({ nullTargetWarn: false })

/** A hard, mechanical in-out — servo motors, not soft curtains. */
CustomEase.create('servo', 'M0,0 C0.7,0 0.15,1 1,1')
/** Overshoots then snaps back, like a signal locking on. */
CustomEase.create('lock', 'M0,0 C0.2,0 0.25,1.18 0.55,1.04 0.75,0.97 0.85,1 1,1')

/** Shared easing vocabulary — keeps the motion language consistent. */
export const ease = {
  out: 'expo.out',
  inOut: 'expo.inOut',
  soft: 'power3.out',
  snap: 'power4.inOut',
  ui: 'power2.out',
  servo: 'servo',
  lock: 'lock',
} as const

/** Glyph set used by every scramble — katakana + hex + box drawing. */
export const GLYPHS = 'アイウエオカキクケコサシスセソ0123456789ABCDEF<>/\\|#%&*+=_'

/** Breakpoint contexts for gsap.matchMedia(). */
export const mq = {
  desktop: '(min-width: 64rem) and (prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 63.99rem) and (prefers-reduced-motion: no-preference)',
  motion: '(prefers-reduced-motion: no-preference)',
} as const

/** True when motion should be skipped (OS setting or visitor override). */
export function motionDisabled(): boolean {
  return document.documentElement.dataset.motion === 'reduce'
}

export { gsap, ScrollTrigger, SplitText, ScrambleTextPlugin, Observer, DrawSVGPlugin, useGSAP }
