import { useEffect, useRef, useState } from 'react'
import { ArrowDown, Download } from 'lucide-react'
import { site } from '@/data/site'
import { gsap, SplitText, useGSAP, motionDisabled, ease, mq, GLYPHS } from '@/lib/animation'
import { usePreloader } from '@/components/preloader/preloader-state'
import { useLocalTime } from '@/hooks/useLocalTime'
import { NeonCity } from '@/components/fx/NeonCity'
import { ButtonAnchor, ButtonLink, Magnetic } from '@/components/buttons/Button'

/** What the cycling readout under the name rotates through — all from the resume. */
const FOCUS = ['React + TypeScript', 'Real-time dashboards', 'Backoffice systems', 'Consumer platforms', 'Finance modules', 'WebSocket UIs']

/**
 * The hero: a live neon-city shader behind a two-line glitching name. After the
 * boot sequence hands over, characters punch in while the shader spikes. On
 * scroll the section pins, the city warps to full speed, JATIN and KUMAR shear
 * apart and a "jack in" readout takes over before the page drops to void.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null)
  const progressRef = useRef(0)
  const glitchRef = useRef(0)
  const focusRef = useRef<HTMLSpanElement>(null)
  const { complete } = usePreloader()
  const [exiting, setExiting] = useState(false)
  // Start the entrance as the preloader's slices open (not after), or immediately on revisit.
  const go = complete || exiting
  const time = useLocalTime(site.location.timeZone)

  useEffect(() => {
    const onExit = () => setExiting(true)
    window.addEventListener('jk:intro-exit', onExit)
    return () => window.removeEventListener('jk:intro-exit', onExit)
  }, [])

  // ── Entrance ─────────────────────────────────────────────
  useGSAP(
    () => {
      const el = root.current
      if (!el || motionDisabled()) return
      const q = gsap.utils.selector(el)
      if (!go) {
        gsap.set(q('[data-intro]'), { autoAlpha: 0 })
        return
      }
      const splits = q('[data-name]').map((n) => SplitText.create(n, { type: 'chars', mask: 'chars' }))
      const chars = splits.flatMap((s) => s.chars)
      const tl = gsap.timeline({ delay: 0.15 })
      tl.set(q('[data-intro]'), { autoAlpha: 1 })
        .call(() => void (glitchRef.current = 1))
        .from(chars, { yPercent: 110, duration: 1.1, ease: ease.out, stagger: { each: 0.045, from: 'random' } }, 0)
        .from(chars, { color: 'var(--magenta)', duration: 0.5, ease: 'steps(3)', stagger: { each: 0.045, from: 'random' }, clearProps: 'color' }, 0.1)
        .from(q('[data-hud]'), { autoAlpha: 0, duration: 0.45, ease: 'steps(5)', stagger: 0.08 }, 0.4)
        .from(q('[data-rule]'), { scaleX: 0, transformOrigin: '0% 50%', duration: 1.2, ease: ease.inOut }, 0.5)
        .from(q('[data-corner]'), { scale: 0, duration: 0.6, ease: 'back.out(3)', stagger: 0.06 }, 0.2)
        .call(() => void (glitchRef.current = 0.7), [], 1.2)
      return () => splits.forEach((s) => s.revert())
    },
    { scope: root, dependencies: [go], revertOnUpdate: true },
  )

  // ── Cycling focus readout ─────────────────────────────────
  useEffect(() => {
    const el = focusRef.current
    if (!el || !go || motionDisabled()) return
    let i = 0
    const id = window.setInterval(() => {
      i = (i + 1) % FOCUS.length
      gsap.to(el, { duration: 0.7, ease: 'none', scrambleText: { text: FOCUS[i], chars: GLYPHS, speed: 0.9 } })
    }, 2600)
    return () => window.clearInterval(id)
  }, [go])

  // ── Scroll: pin + warp + shear ────────────────────────────
  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const q = gsap.utils.selector(el)
      const mm = gsap.matchMedia()
      const build = (pin: boolean) => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: pin ? '+=130%' : 'bottom top',
            scrub: 0.6,
            pin,
            anticipatePin: 1,
            onUpdate: (self) => {
              progressRef.current = self.progress
              // scrolling fast tears the signal
              glitchRef.current = Math.max(glitchRef.current, Math.min(0.8, Math.abs(self.getVelocity()) / 6000))
            },
          },
        })
        tl.to(q('[data-hud-wrap]'), { autoAlpha: 0, duration: 0.25, ease: 'steps(4)' }, 0)
          .to(q('[data-line-a]'), { xPercent: -55, skewX: 25, duration: 1 }, 0)
          .to(q('[data-line-b]'), { xPercent: 55, skewX: -25, duration: 1 }, 0)
          .to(q('[data-name]'), { autoAlpha: 0, duration: 0.35, ease: 'steps(6)' }, 0.55)
          .fromTo(q('[data-jack]'), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'steps(5)' }, 0.45)
          .to(q('[data-jack]'), { scale: 2.6, autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, 0.85)
          .to(q('[data-blackout]'), { autoAlpha: 1, duration: 0.25 }, 0.85)
        return tl
      }
      mm.add(mq.desktop, () => void build(true))
      mm.add(mq.mobile, () => void build(false))
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} aria-labelledby="hero-title" className="relative h-[100svh] min-h-[36rem] overflow-hidden bg-void">
      <div className="absolute inset-0">
        <NeonCity progressRef={progressRef} glitchRef={glitchRef} className="h-full w-full" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-void via-void/70 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-void/80 to-transparent" />

      {/* HUD corner brackets */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-3 md:inset-5">
        {['left-0 top-[calc(var(--header-h)-0.25rem)] border-l-2 border-t-2', 'right-0 top-[calc(var(--header-h)-0.25rem)] border-r-2 border-t-2', 'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map((c) => (
          <span key={c} data-corner data-intro className={`absolute h-5 w-5 border-neon/80 ${c}`} />
        ))}
      </div>

      <div className="shell relative z-10 flex h-full flex-col pt-[var(--header-h)]">
        <div data-hud-wrap className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 pt-6 md:pt-8">
          <div data-hud data-intro className="hud space-y-1">
            <p>
              <span className="text-neon">[00]</span> // Neon grid · portfolio v2.6
            </p>
            <p className="hidden sm:block">
              Ident: <span className="text-fg">{site.name}</span> · class: <span className="text-cyan">{site.role}</span>
            </p>
          </div>
          <div data-hud data-intro className="hud space-y-1 text-right">
            {site.availability.show && (
              <p className="flex items-center justify-end gap-2 text-fg">
                <span className="pip" aria-hidden="true" />
                {site.availability.label}
              </p>
            )}
            <p className="hidden sm:block">
              {site.location.label}
              {time && (
                <>
                  {' '}
                  · {site.location.tzLabel} <span className="tabular text-fg">{time}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-end pb-6 md:pb-9">
          <p data-hud data-hud-wrap data-intro className="hud mb-3 flex items-center gap-2 text-fg-2 md:mb-5">
            <span className="text-neon">&gt;</span> focus:
            <span ref={focusRef} className="text-cyan" aria-live="off">
              {FOCUS[0]}
            </span>
            <span className="caret" aria-hidden="true" />
          </p>

          <h1 id="hero-title" className="display pointer-events-none select-none whitespace-nowrap text-[min(16.5vw,30svh)] leading-[0.8] tracking-[-0.02em]">
            <span className="sr-only">
              {site.name} — {site.role}. {site.statement}
            </span>
            <span aria-hidden="true" data-line-a className="block will-change-transform">
              <span data-name data-intro className="glitch" data-text="JATIN" data-live="true">
                JATIN
              </span>
            </span>
            <span aria-hidden="true" data-line-b className="block text-right will-change-transform">
              <span data-name data-intro className="glitch stroke [--stroke:var(--neon)]" data-text="KUMAR">
                KUMAR
              </span>
            </span>
          </h1>

          <div data-hud-wrap>
            <div data-rule data-intro className="mt-6 h-px w-full bg-gradient-to-r from-neon via-magenta to-cyan md:mt-8" />
            <div className="mt-5 grid gap-6 md:grid-cols-12 md:items-end">
              <p data-hud data-intro className="max-w-[46ch] text-[0.98rem] leading-relaxed text-fg-2 md:col-span-5">
                {site.supporting}
              </p>
              <div data-hud data-intro className="flex flex-wrap gap-3 md:col-span-5 md:col-start-6">
                <Magnetic>
                  <ButtonLink to="/#work" variant="solid">
                    View the work
                  </ButtonLink>
                </Magnetic>
                <ButtonAnchor href={site.resume.href} download={site.resume.fileName} arrow="none">
                  <span className="inline-flex items-center gap-2">
                    <Download size={14} aria-hidden="true" /> Resume
                  </span>
                </ButtonAnchor>
              </div>
              <a
                data-hud
                data-intro
                href="#manifesto"
                className="hud group hidden items-center justify-end gap-3 text-fg md:col-span-2 md:flex"
                data-cursor="link"
              >
                Scroll // jack in
                <span className="relative block h-10 w-px overflow-hidden bg-line-strong" aria-hidden="true">
                  <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_1.6s_var(--ease-servo)_infinite] bg-neon" />
                </span>
                <ArrowDown size={14} aria-hidden="true" className="transition-transform group-hover:translate-y-0.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* mid-scroll takeover */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
        <p data-jack className="text-center opacity-0">
          <span className="display glitch block text-[clamp(3rem,11vw,10rem)] leading-[0.85] text-neon neon-glow" data-text="JACK IN" data-live="true">
            JACK IN
          </span>
          <span className="hud mt-4 block text-cyan">&gt; establishing uplink · selected work below</span>
        </p>
      </div>
      <div data-blackout aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 bg-void opacity-0" />
    </section>
  )
}
