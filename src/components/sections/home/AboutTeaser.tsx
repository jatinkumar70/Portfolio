import { useRef } from 'react'
import { timeline } from '@/data/timeline'
import { site } from '@/data/site'
import { gsap, useGSAP, motionDisabled, ease } from '@/lib/animation'
import { Eyebrow } from '@/components/typography/Typography'
import { SplitReveal } from '@/components/animations/Reveal'
import { ButtonAnchor, ButtonLink } from '@/components/buttons/Button'

/** A compact horizontal career line that draws itself, linking to the full story. */
export function AboutTeaser() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (!ref.current || motionDisabled()) return
      const q = gsap.utils.selector(ref.current)
      const tl = gsap.timeline({ scrollTrigger: { trigger: q('[data-line-wrap]')[0], start: 'top 80%', once: true } })
      tl.from(q('[data-rail]'), { scaleX: 0, transformOrigin: '0% 50%', duration: 1.6, ease: ease.inOut })
        .from(q('[data-stop]'), { scale: 0, duration: 0.5, stagger: 0.18, ease: 'back.out(3)' }, 0.3)
        .from(q('[data-stop-copy]'), { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.18, ease: ease.out }, 0.4)
    },
    { scope: ref },
  )

  return (
    <section ref={ref} aria-labelledby="about-teaser-title" className="shell section">
      <div className="grid-12 gap-y-6 border-t border-ink pt-6">
        <div className="col-span-4 md:col-span-3">
          <Eyebrow index="04">About</Eyebrow>
        </div>
        <div className="col-span-4 md:col-span-9">
          <SplitReveal as="h2" id="about-teaser-title" className="text-h1 font-bold">
            I care about what people feel — <span className="text-muted">and what makes it work.</span>
          </SplitReveal>
          <p className="mt-6 max-w-[56ch] text-[1.02rem] leading-relaxed text-charcoal">{site.summary} Promoted twice in under two years.</p>
        </div>
      </div>

      <div data-line-wrap className="relative mt-16 md:mt-24">
        <div data-rail aria-hidden="true" className="absolute left-0 right-0 top-[7px] hidden h-px bg-ink md:block" />
        <ol className="grid gap-10 md:grid-cols-4 md:gap-6">
          {timeline.map((t) => (
            <li key={t.id} className="relative border-l border-ink pl-5 md:border-l-0 md:pl-0">
              <span
                data-stop
                aria-hidden="true"
                className={
                  t.kind === 'milestone'
                    ? 'absolute -left-[5px] top-1 block h-[9px] w-[9px] bg-accent md:left-0 md:top-[3px]'
                    : 'absolute -left-[5px] top-1 block h-[9px] w-[9px] border border-ink bg-porcelain md:left-0 md:top-[3px]'
                }
              />
              <div data-stop-copy className="md:pt-8">
                <p className="meta">{t.period}</p>
                <p className="display mt-2 text-[1.3rem] leading-tight">{t.title}</p>
                <p className="mt-1 text-[0.92rem] text-charcoal">{t.org}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-14 flex flex-wrap gap-3">
        <ButtonLink to="/about">The longer story</ButtonLink>
        <ButtonAnchor href={site.resume.href} download={site.resume.fileName} arrow="none">
          Download resume (PDF)
        </ButtonAnchor>
      </div>
    </section>
  )
}
