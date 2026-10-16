import { marqueeItems, stackGroups } from '@/data/stack'
import { Marquee } from '@/components/animations/Marquee'
import { Reveal, SplitReveal, Decrypt } from '@/components/animations/Reveal'
import { SectionBar } from '@/components/typography/Typography'

/**
 * Arsenal: two crossed hazard-tape marquees that surge and reverse with
 * scroll velocity, then the toolkit as loadout modules whose entries decrypt
 * on hover.
 */
export function Stack({ index = '03' }: { index?: string }) {
  return (
    <section aria-labelledby="stack-title" className="section relative overflow-hidden">
      <div className="shell">
        <SectionBar index={index} label="Arsenal" right={`${stackGroups.reduce((n, g) => n + g.items.length, 0)} modules loaded`} />
        <SplitReveal as="h2" id="stack-title" className="display mt-10 text-display md:mt-14">
          What I build <span className="text-neon">with.</span>
        </SplitReveal>
      </div>

      <div aria-hidden="true" className="relative my-20 h-[clamp(9rem,20vw,16rem)] md:my-28">
        <div className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 rotate-[-4deg] border-y-2 border-neon-ink bg-neon py-3 shadow-[0_0_40px_color-mix(in_srgb,var(--neon)_35%,transparent)]">
          <Marquee speed={70}>
            {marqueeItems.map((t) => (
              <span key={t} className="display flex items-center gap-[0.5em] pr-[0.5em] text-[clamp(1.8rem,4.6vw,4.4rem)] leading-none text-neon-ink">
                {t}
                <span className="font-mono text-[0.4em] tracking-[0.2em]">///</span>
              </span>
            ))}
          </Marquee>
        </div>
        <div className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 rotate-[3deg] border-y border-cyan bg-void/90 py-3 backdrop-blur-sm">
          <Marquee speed={40} reverse>
            {marqueeItems.map((t) => (
              <span key={t} className="display stroke flex items-center gap-[0.5em] pr-[0.5em] text-[clamp(1.8rem,4.6vw,4.4rem)] leading-none [--stroke:var(--cyan)]">
                {t}
                <span className="inline-block h-[0.2em] w-[0.2em] rotate-45 bg-magenta" />
              </span>
            ))}
          </Marquee>
        </div>
      </div>

      <Reveal stagger={0.08} className="shell grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stackGroups.map((g, i) => (
          <div key={g.label} className="hud-frame p-5 [--frame-accent:var(--cyan)]">
            <p className="hud flex items-center justify-between gap-2 border-b border-line-strong pb-3 text-fg">
              <span>
                <span className="text-neon">MOD_{String.fromCharCode(65 + i)}</span> {g.label}
              </span>
              <span className="text-dim">{String(g.items.length).padStart(2, '0')}</span>
            </p>
            <ul className="mt-3 space-y-1">
              {g.items.map((it) => (
                <li key={it} data-decrypt-host className="group flex items-center gap-2 py-0.5 text-[0.98rem] text-fg-2 transition-colors hover:text-neon">
                  <span aria-hidden="true" className="font-mono text-[0.7rem] text-line-strong transition-colors group-hover:text-cyan">
                    &gt;
                  </span>
                  <Decrypt text={it} hover duration={0.8} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
