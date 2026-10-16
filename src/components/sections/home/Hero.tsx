import { useEffect, useRef, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { site } from '@/data/site'
import { gsap, ScrollTrigger, SplitText, useGSAP, motionDisabled, ease, mq } from '@/lib/animation'
import { useLocalTime } from '@/hooks/useLocalTime'
import { usePreloader } from '@/components/preloader/preloader-state'
import { HeroStage } from '@/components/3d/HeroStage'
import { Button, ButtonLink, Magnetic } from '@/components/buttons/Button'
import { useSmoothScroll } from '@/lib/smooth-scroll'

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const headline = useRef<HTMLHeadingElement>(null)
  const progressRef = useRef(0)
  const [exploded, setExploded] = useState(false)
  const { active } = usePreloader()
  const time = useLocalTime(site.location.timeZone)
  const { scrollTo } = useSmoothScroll()
  const entranceRef = useRef<gsap.core.Timeline | null>(null)

  // Entrance: built paused, played when the intro hands over (or immediately).
  useGSAP(
    () => {
      const el = root.current
      if (!el || !headline.current || motionDisabled()) return
      const q = gsap.utils.selector(el)
      const split = SplitText.create(headline.current.querySelectorAll('[data-line]'), { type: 'chars', mask: 'chars' })
      const tl = gsap.timeline({ paused: true })
      tl.from(split.chars, { yPercent: 115, duration: 1.3, stagger: 0.022, ease: ease.out })
        .from(q('[data-hero-stage]'), { autoAlpha: 0, scale: 0.92, duration: 1.6, ease: ease.out }, 0.1)
        .from(q('[data-hero-fade]'), { autoAlpha: 0, y: 18, duration: 1, stagger: 0.07, ease: ease.out }, 0.45)
        .from(q('[data-hero-rule]'), { scaleX: 0, transformOrigin: '0% 50%', duration: 1.4, ease: ease.inOut }, 0.2)
      entranceRef.current = tl
      return () => split.revert()
    },
    { scope: root },
  )

  useEffect(() => {
    const play = () => entranceRef.current?.play()
    if (!active) {
      play()
      return
    }
    window.addEventListener('jk:intro-exit', play, { once: true })
    return () => window.removeEventListener('jk:intro-exit', play)
  }, [active])

  // Scroll-linked transformation into the next section.
  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add(mq.motion, () => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => {
            progressRef.current = self.progress
          },
        })
      })
      mm.add(mq.desktop, () => {
        const lines = el.querySelectorAll('[data-line]')
        lines.forEach((line, i) => {
          gsap.to(line, {
            xPercent: i % 2 ? 6 : -4,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 },
          })
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} aria-labelledby="hero-title" className="relative flex min-h-[100svh] flex-col overflow-hidden pt-[var(--header-h)]">
      {/* drafting backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="shell relative h-full">
          <div className="absolute inset-y-0 left-[var(--gutter)] w-px bg-line" />
          <div className="absolute inset-y-0 right-[var(--gutter)] w-px bg-line" />
          <div className="absolute inset-y-0 left-1/2 hidden w-px bg-line md:block" />
        </div>
      </div>

      <div className="shell relative z-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pt-6 md:pt-8">
        <p data-hero-fade className="eyebrow">
          <span className="text-ink">(00)</span>&nbsp;&nbsp;{site.studioMark}
        </p>
        <div data-hero-fade className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {site.availability.show && (
            <p className="meta flex items-center gap-2 text-ink">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inset-0 animate-ping bg-accent opacity-60" />
                <span className="relative h-2 w-2 bg-accent" />
              </span>
              {site.availability.label}
            </p>
          )}
          <p className="meta hidden sm:block">
            {site.location.label}
            {time && (
              <>
                {' '}
                · {time} {site.location.tzLabel}
              </>
            )}
          </p>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col">
        {/* 3D centerpiece */}
        <div
          data-hero-stage
          className="relative mx-auto mt-4 aspect-[5/4] w-full max-w-[34rem] md:absolute md:right-[2%] md:top-[2%] md:mt-0 md:aspect-auto md:h-[88%] md:w-[58%] md:max-w-none lg:right-[4%] lg:w-[52%]"
        >
          <HeroStage progressRef={progressRef} exploded={exploded} className="h-full w-full" />
          <div className="pointer-events-none absolute right-[var(--gutter)] top-[7%] hidden text-right md:block">
            <p className="meta">FIG. A — Interface model</p>
            <p className="meta text-muted">5 layers · drag pointer · scroll to separate</p>
          </div>
        </div>

        <div className="shell relative z-10 flex flex-1 flex-col justify-end pb-8 md:pb-10">
          <h1 id="hero-title" ref={headline} className="display hero-headline pointer-events-none md:mt-[8vh]">
            <span className="sr-only">
              {site.name}, {site.role}.{' '}
            </span>
            <span data-line className="block">
              Complex
            </span>
            <span data-line className="block md:pl-[8vw]">
              systems.
            </span>
            <span data-line className="block">
              Effortless
            </span>
            <span data-line className="block md:pl-[16vw]">
              experiences<span className="text-accent">.</span>
            </span>
          </h1>

          <div data-hero-rule className="mt-8 h-px w-full bg-ink md:mt-10" />

          <div className="mt-6 grid gap-8 md:grid-cols-12 md:gap-6">
            <div data-hero-fade className="md:col-span-5">
              <p className="font-display text-[1.05rem] font-bold uppercase tracking-tight">
                {site.name} <span className="font-normal text-muted-text">— {site.role}</span>
              </p>
              <p className="mt-3 max-w-[46ch] text-[1.02rem] leading-relaxed text-charcoal">{site.supporting}</p>
            </div>
            <div data-hero-fade className="flex flex-wrap items-start gap-3 md:col-span-4 md:col-start-6">
              <Magnetic>
                <ButtonLink to="/#work" variant="solid">
                  Explore selected work
                </ButtonLink>
              </Magnetic>
              <ButtonLink to="/contact" arrow="none">
                Let&apos;s talk
              </ButtonLink>
            </div>
            <div data-hero-fade className="flex items-start justify-between gap-4 md:col-span-3 md:flex-col md:items-end">
              <Button
                size="sm"
                aria-pressed={exploded}
                onClick={() => setExploded((v) => !v)}
                className="md:order-2"
              >
                Model: {exploded ? 'Exploded' : 'Assembled'}
              </Button>
              <button
                type="button"
                onClick={() => scrollTo('#manifesto')}
                className="group meta flex min-h-10 items-center gap-3 text-ink md:order-1"
                data-cursor="link"
              >
                <span className="relative block h-8 w-px overflow-hidden bg-line-strong" aria-hidden="true">
                  <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_1.8s_var(--ease-in-out)_infinite] bg-ink" />
                </span>
                Scroll
                <ArrowDown size={14} aria-hidden="true" className="transition-transform group-hover:translate-y-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
