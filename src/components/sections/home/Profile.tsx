import { useRef } from 'react'
import { timeline } from '@/data/timeline'
import { site } from '@/data/site'
import { gsap, useGSAP, motionDisabled, ease } from '@/lib/animation'
import { SectionBar, SourceNote } from '@/components/typography/Typography'
import { SplitReveal } from '@/components/animations/Reveal'
import { ButtonAnchor, ButtonLink } from '@/components/buttons/Button'
import { cn } from '@/lib/utils'

/** Every figure here is stated in the resume. */
const STATS = [
  { prefix: '', value: 2, suffix: '+', label: 'Years shipping React + TypeScript in production' },
  { prefix: '×', value: 2, suffix: '', label: 'Promotions in under two years at EdgeNRoots' },
  { prefix: '', value: 4, suffix: '', label: 'Products in the selected-work file', pad: 2 },
  { prefix: '', value: 30, suffix: '%', label: 'Fewer regression defects after Jest testing (Crossroads)' },
]

/**
 * Operator profile: oversized counters that spin up through random values and
 * lock onto the real figure, then a neon career rail that charges up with
 * scroll and lights each node as the current passes it.
 */
export function Profile() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el || motionDisabled()) return
      const q = gsap.utils.selector(el)

      q('[data-stat]').forEach((s) => {
        const num = s.querySelector<HTMLElement>('[data-n]')
        if (!num) return
        const target = Number(num.dataset.n)
        const pad = Number(num.dataset.pad || 0)
        const o = { v: 0 }
        gsap
          .timeline({ scrollTrigger: { trigger: s, start: 'top 85%', once: true } })
          .from(s, { autoAlpha: 0, duration: 0.4, ease: 'steps(4)' })
          .to(
            o,
            {
              v: target,
              duration: 1.6,
              ease: 'power3.out',
              onUpdate: () => {
                // noisy digits while far from the target, locked when close
                const near = o.v / target > 0.85
                const shown = near ? Math.round(o.v) : Math.floor(Math.random() * (target * 3 + 9))
                num.textContent = String(shown).padStart(pad, '0')
              },
              onComplete: () => void (num.textContent = String(target).padStart(pad, '0')),
            },
            0,
          )
          .from(s.querySelector('[data-stat-bar]'), { scaleX: 0, transformOrigin: '0% 50%', duration: 1.2, ease: ease.servo }, 0.2)
      })

      const rail = q('[data-rail]')
      const stops = q('[data-stop]')
      gsap.fromTo(
        rail,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          transformOrigin: '0% 50%',
          scrollTrigger: {
            trigger: q('[data-line-wrap]')[0],
            start: 'top 85%',
            end: 'bottom 55%',
            scrub: 0.5,
            onUpdate: (self) => {
              stops.forEach((st, i) => st.toggleAttribute('data-on', self.progress >= i / Math.max(1, stops.length - 1) - 0.02))
            },
          },
        },
      )
      gsap.from(q('[data-stop-copy]'), {
        y: 24,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: ease.out,
        scrollTrigger: { trigger: q('[data-line-wrap]')[0], start: 'top 80%', once: true },
      })
    },
    { scope: ref },
  )

  return (
    <section ref={ref} aria-labelledby="profile-title" className="shell section relative">
      <SectionBar index="04" label="Operator profile" right={<SourceNote>Figures from resume</SourceNote>} />
      <div className="grid-12 mt-10 gap-y-6 md:mt-14">
        <SplitReveal as="h2" id="profile-title" className="col-span-4 font-tech text-h1 font-bold uppercase md:col-span-9">
          I care about what people feel — <span className="text-dim">and what makes it work.</span>
        </SplitReveal>
        <p className="col-span-4 max-w-[56ch] text-[1.02rem] leading-relaxed text-fg-2 md:col-span-7">{site.summary}</p>
      </div>

      <dl className="mt-16 grid gap-px bg-line-strong md:mt-20 md:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} data-stat className="relative flex flex-col justify-between gap-8 bg-void p-6 md:p-8">
            <dt className="order-2 text-[0.95rem] leading-snug text-fg-2">{s.label}</dt>
            <dd className="order-1 display-narrow text-[clamp(4.5rem,9vw,8.5rem)] leading-[0.8] text-neon neon-glow">
              <span className="text-[0.6em] text-fg">{s.prefix}</span>
              <span data-n={s.value} data-pad={s.pad ?? 0} className="tabular">
                {String(s.value).padStart(s.pad ?? 0, '0')}
              </span>
              <span className="text-[0.5em] text-cyan">{s.suffix}</span>
            </dd>
            <span data-stat-bar aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-neon via-magenta to-transparent" />
          </div>
        ))}
      </dl>

      <div data-line-wrap className="relative mt-20 md:mt-28">
        <p className="hud mb-8">&gt; career trace</p>
        <div className="relative">
        <div aria-hidden="true" className="absolute left-0 right-0 top-0 hidden h-px bg-line-strong md:block" />
        <div data-rail aria-hidden="true" className="absolute left-0 right-0 top-[-0.5px] hidden h-[2px] bg-neon shadow-[0_0_14px_var(--neon)] md:block" />
        <ol className="grid gap-10 md:grid-cols-4 md:gap-6">
          {timeline.map((t) => (
            <li key={t.id} className="relative border-l border-line-strong pl-5 md:border-l-0 md:pl-0">
              <span
                data-stop
                aria-hidden="true"
                className={cn(
                  'absolute -left-[6px] top-1 block h-[11px] w-[11px] rotate-45 border-2 border-line-strong bg-void transition-all duration-300 md:left-0 md:top-[-5px]',
                  'data-[on]:border-neon data-[on]:bg-neon data-[on]:shadow-[0_0_14px_var(--neon)]',
                  t.kind === 'milestone' && 'data-[on]:border-magenta data-[on]:bg-magenta data-[on]:shadow-[0_0_14px_var(--magenta)]',
                )}
              />
              <div data-stop-copy className="md:pt-8">
                <p className="hud text-cyan">{t.period}</p>
                <p className="mt-2 font-tech text-[1.3rem] font-bold uppercase leading-tight">{t.title}</p>
                <p className="mt-1 text-[0.92rem] text-dim">{t.org}</p>
              </div>
            </li>
          ))}
        </ol>
        </div>
      </div>

      <div className="mt-14 flex flex-wrap gap-3">
        <ButtonLink to="/about">Open the full dossier</ButtonLink>
        <ButtonAnchor href={site.resume.href} download={site.resume.fileName} arrow="none">
          Download resume (PDF)
        </ButtonAnchor>
      </div>
    </section>
  )
}
