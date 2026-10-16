import { marqueeItems, stackGroups } from '@/data/stack'
import { Marquee } from '@/components/animations/Marquee'
import { Reveal, SplitReveal } from '@/components/animations/Reveal'
import { Eyebrow } from '@/components/typography/Typography'

/** Toolkit: a velocity-reactive marquee and plain grouped lists. */
export function Stack({ index = '03' }: { index?: string }) {
  return (
    <section aria-labelledby="stack-title" className="section overflow-hidden">
      <div className="shell">
        <div className="grid-12 gap-y-6 border-t border-ink pt-6">
          <div className="col-span-4 md:col-span-3">
            <Eyebrow index={index}>Toolkit</Eyebrow>
          </div>
          <div className="col-span-4 md:col-span-9">
            <SplitReveal as="h2" id="stack-title" className="display text-display">
              What I build with.
            </SplitReveal>
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="mt-14 border-y border-ink py-5 md:mt-20">
        <Marquee speed={55}>
          {marqueeItems.map((t) => (
            <span key={t} className="display flex items-center gap-[0.35em] pr-[0.35em] text-[clamp(2.4rem,7vw,6.5rem)] leading-none">
              {t}
              <span className="inline-block h-[0.18em] w-[0.18em] bg-accent" />
            </span>
          ))}
        </Marquee>
        <Marquee speed={30} reverse className="mt-3">
          {marqueeItems.map((t) => (
            <span key={t} className="display flex items-center gap-[0.35em] pr-[0.35em] text-[clamp(2.4rem,7vw,6.5rem)] leading-none text-transparent [-webkit-text-stroke:1px_var(--ink)]">
              {t}
              <span className="inline-block h-[0.18em] w-[0.18em] border border-ink" />
            </span>
          ))}
        </Marquee>
      </div>

      <Reveal stagger={0.08} className="shell mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5 md:mt-20">
        {stackGroups.map((g, i) => (
          <div key={g.label}>
            <p className="eyebrow flex items-center gap-2 border-b border-line pb-2 text-ink">
              <span className="text-muted-text">{String.fromCharCode(65 + i)}</span> {g.label}
            </p>
            <ul className="mt-3 space-y-1.5">
              {g.items.map((it) => (
                <li key={it} className="text-[0.98rem] text-charcoal">
                  {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
