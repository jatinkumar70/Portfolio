import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { site } from '@/data/site'
import { gsap, useGSAP, motionDisabled } from '@/lib/animation'
import { SplitReveal } from '@/components/animations/Reveal'
import { ButtonAnchor, ButtonLink, Magnetic } from '@/components/buttons/Button'
import { Marquee } from '@/components/animations/Marquee'

/**
 * Closing invitation: a neon-yellow plate irises open from a point as it
 * scrolls into view (clip-path circle, scrubbed), carrying an oversized
 * question in ink and a ticker running along its top edge.
 */
export function ContactCTA({ index = '—' }: { index?: string }) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el || motionDisabled()) return
      const plate = el.querySelector('[data-plate]')
      gsap.fromTo(
        plate,
        { clipPath: 'circle(4% at 50% 70%)' },
        { clipPath: 'circle(150% at 50% 70%)', ease: 'power2.in', scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 15%', scrub: 0.6 } },
      )
      gsap.fromTo(
        el.querySelector('[data-inner]'),
        { yPercent: 12, scale: 0.94 },
        { yPercent: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 15%', scrub: 0.6 } },
      )
    },
    { scope: ref },
  )

  return (
    <section ref={ref} aria-labelledby="cta-title" className="relative px-0 py-[clamp(3rem,6vw,5rem)]">
      <div data-plate className="relative overflow-hidden bg-neon text-neon-ink">
        <div aria-hidden="true" className="border-b-2 border-neon-ink bg-neon-ink py-2 text-neon">
          <Marquee speed={45}>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} className="flex items-center gap-6 pr-6 font-mono text-[0.72rem] uppercase tracking-[0.2em]">
                <span>open channel</span>
                <span>◆</span>
                <span>{site.availability.show ? site.availability.label : 'Say hello'}</span>
                <span>◆</span>
                <span>{site.location.label}</span>
                <span>◆</span>
              </span>
            ))}
          </Marquee>
        </div>

        <div data-inner className="shell py-[clamp(5rem,12vw,11rem)]">
          <p className="flex items-center gap-3 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em]">
            <span>[{index}]</span>
            <span aria-hidden="true">//</span>
            <span>Next step</span>
          </p>
          <SplitReveal as="h2" id="cta-title" className="display mt-8 text-[clamp(2.8rem,10vw,11rem)] leading-[0.82]">
            Have something
            <br />
            interesting
            <br />
            to build<span className="text-magenta">?</span>
          </SplitReveal>
          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <p className="max-w-[52ch] text-[1.08rem] font-medium leading-relaxed">
              Frontend engineering, product development, complex interfaces or a creative digital experience — I&apos;m happy to talk it
              through. Or{' '}
              <Link to="/about" className="font-bold underline decoration-2 underline-offset-4 hover:text-magenta" data-cursor="link">
                read the longer story
              </Link>
              .
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Magnetic>
                <ButtonLink to="/contact" variant="ink">
                  Initiate contact
                </ButtonLink>
              </Magnetic>
              <ButtonAnchor href={`mailto:${site.contact.email}`} variant="ink-outline" arrow="external">
                {site.contact.email}
              </ButtonAnchor>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
