import { useRef } from 'react'
import { gsap, useGSAP, motionDisabled, mq } from '@/lib/animation'
import { site } from '@/data/site'
import { cssVar } from '@/lib/utils'
import { SectionBar } from '@/components/typography/Typography'
import { Reveal } from '@/components/animations/Reveal'

const PRINCIPLES = [
  {
    k: 'Intent',
    v: 'Every screen answers a question someone actually has. Hierarchy, motion and copy exist to make the next step obvious.',
  },
  {
    k: 'Depth',
    v: 'Lifecycle states, permissions, finance logic, live data — the complexity is real, so the architecture has to be honest about it.',
  },
  {
    k: 'Ownership',
    v: 'From pixel-level UI to data-heavy admin panels, working directly with backend teams and stakeholders until it ships.',
  },
]

/** Words that light up neon instead of white. */
const HOT = /^(design|complex|engineering)/i

/**
 * The statement "decrypts" as you scroll: the section pins (desktop), words
 * power on one by one from dead grey to white — keywords to neon — while a
 * percentage readout climbs and a giant outline word drifts behind.
 */
export function Manifesto() {
  const ref = useRef<HTMLElement>(null)
  const words = site.statement.split(' ')

  useGSAP(
    () => {
      const el = ref.current
      if (!el || motionDisabled()) return
      const q = gsap.utils.selector(el)
      const ws = q('[data-word]')
      const pct = q('[data-pct]')[0]
      const fg = cssVar('--fg', '#ecebf5')
      const neon = cssVar('--neon', '#f5ee0b')
      const dead = cssVar('--line-strong', '#33334a')

      const mm = gsap.matchMedia()
      const build = (pin: boolean) => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: q('[data-pin]')[0],
            start: pin ? 'top top' : 'top 80%',
            end: pin ? '+=140%' : 'bottom 40%',
            scrub: 0.5,
            pin,
            onUpdate: (self) => {
              if (pct) pct.textContent = String(Math.round(self.progress * 100)).padStart(3, '0')
            },
          },
        })
        tl.fromTo(
          ws,
          { color: dead, textShadow: '0 0 0 transparent' },
          {
            color: (_i: number, w: Element) => (HOT.test(w.textContent ?? '') ? neon : fg),
            textShadow: (_i: number, w: Element) => (HOT.test(w.textContent ?? '') ? `0 0 24px ${neon}88` : '0 0 0 transparent'),
            stagger: 0.12,
            duration: 0.3,
            ease: 'steps(2)',
          },
        ).fromTo(q('[data-ghost]'), { xPercent: 10 }, { xPercent: -40, duration: tl.duration() || 1 }, 0)
        return tl
      }
      mm.add(mq.desktop, () => void build(true))
      mm.add(mq.mobile, () => void build(false))
      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <section ref={ref} id="manifesto" aria-labelledby="manifesto-title" className="relative scroll-mt-20 overflow-hidden bg-void">
      <div data-pin className="relative flex min-h-[100svh] flex-col justify-center py-[calc(var(--header-h)+2rem)]">
        <span
          data-ghost
          aria-hidden="true"
          className="display stroke pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap text-[28vw] leading-none opacity-60 [--stroke:var(--line)]"
        >
          MANIFESTO//
        </span>
        <div className="shell relative">
          <SectionBar
            index="01"
            label="Manifesto"
            right={
              <>
                Decrypted <span data-pct className="tabular text-neon">000</span>%
              </>
            }
          />
          <h2 id="manifesto-title" className="sr-only">
            Manifesto
          </h2>
          <p className="mt-10 font-tech text-[clamp(2rem,5.4vw,5.6rem)] font-bold uppercase leading-[1] tracking-[-0.01em] md:mt-16">
            <span className="mr-[0.3em] align-top font-mono text-[0.25em] text-cyan" aria-hidden="true">
              &gt;_
            </span>
            {words.map((w, i) => (
              <span key={`${w}-${i}`} data-word>
                {w}
                {i < words.length - 1 ? ' ' : ''}
              </span>
            ))}
          </p>
        </div>
      </div>

      <div className="shell pb-[var(--section-y)]">
        <Reveal as="dl" stagger={0.12} className="grid gap-4 md:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <div key={p.k} className="hud-frame chamfer-r group p-6 transition-colors duration-300 hover:bg-panel-2 md:p-8">
              <dt className="flex items-baseline justify-between gap-4">
                <span className="display text-h3 transition-colors group-hover:text-neon">{p.k}</span>
                <span className="hud">0x0{i + 1}</span>
              </dt>
              <dd className="mt-5 max-w-[38ch] text-[1rem] leading-relaxed text-fg-2">{p.v}</dd>
              <span aria-hidden="true" className="mt-6 block h-[2px] w-8 bg-cyan transition-all duration-500 group-hover:w-full group-hover:bg-neon" />
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
