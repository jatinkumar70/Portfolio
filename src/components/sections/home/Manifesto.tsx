import { useRef } from 'react'
import { gsap, useGSAP, motionDisabled } from '@/lib/animation'
import { site } from '@/data/site'
import { cssVar } from '@/lib/utils'
import { Eyebrow } from '@/components/typography/Typography'
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

/** Scroll-scrubbed statement: words ink in as the visitor reads down. */
export function Manifesto() {
  const ref = useRef<HTMLElement>(null)
  const words = site.statement.split(' ')

  useGSAP(
    () => {
      if (!ref.current || motionDisabled()) return
      const ws = ref.current.querySelectorAll('[data-word]')
      gsap.fromTo(
        ws,
        { color: cssVar('--line-strong', '#cfcdc6') },
        {
          color: cssVar('--ink', '#111111'),
          stagger: 0.08,
          ease: 'none',
          scrollTrigger: { trigger: ref.current.querySelector('[data-statement]'), start: 'top 82%', end: 'bottom 45%', scrub: 0.4 },
        },
      )
    },
    { scope: ref },
  )

  return (
    <section ref={ref} id="manifesto" aria-labelledby="manifesto-title" className="shell section scroll-mt-20">
      <div className="grid-12 gap-y-10 border-t border-ink pt-6">
        <div className="col-span-4 md:col-span-3">
          <Eyebrow index="01">Manifesto</Eyebrow>
        </div>
        <div className="col-span-4 md:col-span-9">
          <h2 id="manifesto-title" className="sr-only">
            Manifesto
          </h2>
          <p data-statement className="display-wide text-h1 font-semibold leading-[1.02] tracking-[-0.035em]">
            {words.map((w, i) => (
              <span key={`${w}-${i}`} data-word className={w.startsWith('complex') || w.startsWith('engineering') ? 'italic' : undefined}>
                {w}
                {i < words.length - 1 ? ' ' : ''}
              </span>
            ))}
          </p>
        </div>
      </div>

      <Reveal as="dl" stagger={0.1} className="mt-20 grid gap-px bg-line md:mt-28 md:grid-cols-3">
        {PRINCIPLES.map((p, i) => (
          <div key={p.k} className="bg-porcelain pb-2 pt-6 md:pr-10 md:pt-8 md:[&:not(:first-child)]:pl-8">
            <dt className="flex items-baseline gap-4">
              <span className="meta">{String(i + 1).padStart(2, '0')}</span>
              <span className="display text-h3">{p.k}</span>
            </dt>
            <dd className="mt-4 max-w-[38ch] text-[0.98rem] leading-relaxed text-charcoal">{p.v}</dd>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
