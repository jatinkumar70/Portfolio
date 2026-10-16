import { useRef } from 'react'
import { Download } from 'lucide-react'
import { site } from '@/data/site'
import { timeline } from '@/data/timeline'
import { Seo } from '@/components/layout/Seo'
import { SectionBar, SourceNote } from '@/components/typography/Typography'
import { SplitReveal, Reveal, DrawOnScroll, Decrypt } from '@/components/animations/Reveal'
import { ButtonAnchor, ButtonLink } from '@/components/buttons/Button'
import { Stack } from '@/components/sections/Stack'
import { ContactCTA } from '@/components/sections/ContactCTA'
import { MONOGRAM_PATHS } from '@/components/navigation/monogram-paths'
import { gsap, useGSAP, motionDisabled, ease } from '@/lib/animation'
import { useFinePointer } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

const PHILOSOPHY = [
  { t: 'Model the workflow before the screen', d: 'Lead stages, approval states, payment status — when the states are explicit, the interface can be honest about what can happen next.' },
  { t: 'Reusable, not generic', d: 'Shared components and tokens that make delivery faster and consistent, without flattening every product into the same template.' },
  { t: 'Dense where it helps, calm where it counts', d: 'Operations teams need information density; customers need clarity. Same craft, different composition.' },
  { t: 'Types and tests are UX for the team', d: 'Strict TypeScript and unit tests protect the people who change the code next — including future me.' },
  { t: 'Motion with a job', d: 'Animation should explain a change of state or guide attention. If it only decorates, it goes.' },
]

const ENJOY = [
  { k: 'Operational backoffices', v: 'Multi-step forms, filterable tables, finance modules, exportable reports.' },
  { k: 'Real-time dashboards', v: 'Interfaces that update from REST and WebSocket data without becoming noisy.' },
  { k: 'Consumer platforms', v: 'Search, booking and authentication flows that feel effortless on any screen.' },
  { k: 'UI architecture', v: 'Component systems with Redux Toolkit, Tailwind CSS and MUI that scale across products.' },
  { k: 'Creative interaction', v: 'Drawing, type, motion and 3D — explored in the lab, applied with restraint in products.' },
]

/**
 * Holographic ID card: the JK monogram draws itself in neon inside rotating
 * targeting rings, and the whole card tilts toward the pointer in 3D.
 */
function IdCard() {
  const ref = useRef<HTMLDivElement>(null)
  const fine = useFinePointer()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || motionDisabled()) return
      gsap.to(el.querySelectorAll('[data-spin]'), { rotation: (i: number) => (i % 2 ? -360 : 360), duration: (i: number) => 18 + i * 8, repeat: -1, ease: 'none', transformOrigin: '50% 50%' })
      if (!fine) return
      const card = el.querySelector('[data-card]')
      const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' })
      const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' })
      const shine = el.querySelector<HTMLElement>('[data-shine]')
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        ry(x * 18)
        rx(-y * 18)
        if (shine) shine.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, color-mix(in srgb, var(--cyan) 22%, transparent), transparent 55%)`
      }
      const leave = () => {
        rx(0)
        ry(0)
      }
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerleave', leave)
      return () => {
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerleave', leave)
      }
    },
    { scope: ref, dependencies: [fine] },
  )

  const fields = [
    ['Name', site.name],
    ['Class', site.role],
    ['Base', site.location.label],
    ['Status', site.availability.show ? site.availability.label : 'Active'],
  ]

  return (
    <div ref={ref} className="[perspective:1000px]">
      <div data-card className="hud-frame relative overflow-hidden p-5 [transform-style:preserve-3d] md:p-6">
        <div data-shine aria-hidden="true" className="pointer-events-none absolute inset-0" />
        <div className="flex items-center justify-between">
          <p className="hud text-neon">ID // JK-2024</p>
          <p className="hud flex items-center gap-2">
            <span className="pip" aria-hidden="true" /> verified
          </p>
        </div>
        <DrawOnScroll className="relative mx-auto mt-4 w-[80%]">
          <svg viewBox="-12 -12 78 76" className="w-full overflow-visible" role="img" aria-label="Abstract portrait: the JK monogram drawn in neon inside targeting rings">
            <g data-spin fill="none" stroke="var(--line-strong)" strokeWidth="0.4" strokeDasharray="2 3">
              <circle cx="27" cy="26" r="34" />
            </g>
            <g data-spin fill="none" stroke="var(--cyan)" strokeWidth="0.6" strokeDasharray="10 6 2 6">
              <circle cx="27" cy="26" r="29" />
            </g>
            <path data-draw d="M-10 26 H64 M27 -10 V62" stroke="var(--line-strong)" strokeWidth="0.3" />
            <g fill="none" stroke="var(--fg)" strokeWidth="2.6" strokeLinecap="square" style={{ filter: 'drop-shadow(0 0 3px var(--cyan))' }}>
              <path data-draw d={MONOGRAM_PATHS.j} />
              <path data-draw d={MONOGRAM_PATHS.kStem} />
              <path data-draw d={MONOGRAM_PATHS.kArms} />
            </g>
            <rect data-draw-fade x="34" y="23.5" width="5" height="5" fill="var(--neon)" style={{ filter: 'drop-shadow(0 0 4px var(--neon))' }} />
          </svg>
          <span className="scan-sweep" aria-hidden="true" />
        </DrawOnScroll>
        <dl className="mt-4 divide-y divide-line border-t border-line-strong">
          {fields.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4 py-2">
              <dt className="hud">{k}</dt>
              <dd className="text-right text-[0.9rem] text-fg">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="hud mt-3 text-dim">No photograph · by design</p>
      </div>
    </div>
  )
}

function Timeline() {
  const ref = useRef<HTMLOListElement>(null)
  useGSAP(
    () => {
      if (!ref.current || motionDisabled()) return
      const q = gsap.utils.selector(ref.current)
      gsap.fromTo(
        q('[data-spine]'),
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', transformOrigin: '50% 0%', scrollTrigger: { trigger: ref.current, start: 'top 70%', end: 'bottom 60%', scrub: 0.5 } },
      )
      q('[data-entry]').forEach((el) => {
        gsap.from(el.querySelectorAll('[data-e]'), {
          x: 50,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 0.9,
          ease: ease.out,
          scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        })
        const node = el.querySelector('[data-node]')
        if (node) gsap.from(node, { scale: 0, rotation: 180, duration: 0.7, ease: 'back.out(3)', scrollTrigger: { trigger: el, start: 'top 75%', once: true } })
      })
    },
    { scope: ref },
  )
  return (
    <ol ref={ref} className="relative mt-14 md:mt-20">
      <span aria-hidden="true" className="absolute bottom-0 left-[5px] top-0 w-px bg-line-strong md:left-[calc(25%+5px)]" />
      <span data-spine aria-hidden="true" className="absolute bottom-0 left-[4px] top-0 w-[3px] bg-gradient-to-b from-cyan via-magenta to-neon shadow-[0_0_14px_var(--magenta)] md:left-[calc(25%+4px)]" />
      {timeline.map((t) => (
        <li key={t.id} data-entry className="relative grid gap-3 pb-16 pl-10 md:grid-cols-4 md:gap-8 md:pl-0">
          <span
            data-node
            aria-hidden="true"
            className={cn(
              'absolute left-0 top-1.5 block h-[11px] w-[11px] rotate-45 md:left-[25%]',
              t.kind === 'milestone' ? 'bg-magenta shadow-[0_0_14px_var(--magenta)]' : t.kind === 'role' ? 'bg-neon shadow-[0_0_14px_var(--neon)]' : 'border-2 border-cyan bg-void',
            )}
          />
          <div className="md:pr-10 md:text-right">
            <p data-e className="hud text-fg">
              {t.period}
            </p>
            <p data-e className="hud mt-1 text-cyan">
              {t.kind === 'milestone' ? 'Milestone' : t.kind === 'internship' ? 'Internship' : t.kind === 'education' ? 'Education' : 'Role'}
            </p>
          </div>
          <div className="md:col-span-3 md:pl-12">
            <h3 data-e className="font-tech text-h2 font-bold uppercase">
              {t.title}
            </h3>
            <p data-e className="mt-2 text-[1rem] text-fg">
              {t.org}
              {t.place && <span className="text-dim"> · {t.place}</span>}
            </p>
            <p data-e className="mt-4 max-w-[60ch] text-[1rem] leading-relaxed text-fg-2">
              {t.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export default function AboutPage() {
  return (
    <>
      <Seo title="About" description="The story of Jatin Kumar — a frontend engineer who cares about what people feel as much as what makes it work." />

      <header className="shell relative pt-[calc(var(--header-h)+clamp(2.5rem,7vw,6rem))]">
        <SectionBar index="A" label="Subject dossier" right={site.location.label} />
        <div className="grid-12 mt-10 gap-y-12 md:mt-14">
          <div className="col-span-4 flex flex-col justify-between gap-10 md:col-span-7 lg:col-span-8">
            <div>
              <p className="hud text-cyan">&gt; whoami</p>
              <SplitReveal as="h1" immediate className="display mt-4 text-[clamp(2.8rem,8.4vw,9rem)] leading-[0.82]">
                Jatin
                <br />
                <span className="stroke [--stroke:var(--neon)]">Kumar</span>
              </SplitReveal>
            </div>
            <p className="max-w-[30ch] font-tech text-[clamp(1.4rem,2.6vw,2.4rem)] font-bold uppercase leading-[1.05]">
              I care about what people feel <span className="text-dim">— and what makes it work.</span>
            </p>
          </div>
          <div className="col-span-4 max-w-[24rem] md:col-span-5 md:max-w-none lg:col-span-4">
            <IdCard />
          </div>
        </div>
      </header>

      <section aria-labelledby="bio-title" className="shell section">
        <SectionBar index="B" label="Biography" />
        <h2 id="bio-title" className="sr-only">
          Biography
        </h2>
        <div className="grid-12 mt-10 gap-y-8">
          <p className="hud col-span-4 md:col-span-3">
            <span className="text-neon">$</span> cat biography.txt
          </p>
          <Reveal stagger={0.1} className="prose-body col-span-4 md:col-span-8">
            <p className="text-lead text-fg">
              I&apos;m {site.name}, a frontend engineer with 2+ years of professional experience building scalable React and TypeScript
              applications.
            </p>
            <p>
              At EdgeNRoots I&apos;ve delivered client-facing platforms end to end — from consumer websites like BnBme Homes to full backoffice
              systems with multi-step forms, filterable data tables, finance modules, charts and exportable reports. I work in Agile remote
              teams, directly with backend engineers and stakeholders, integrating REST APIs and WebSockets for real-time updates.
            </p>
            <p>
              Before that, as a React Developer Intern at MadRocket, I built a school management app with React and Firebase, handling both
              frontend and backend logic. My foundations are a B.Tech in Computer Science &amp; Information Technology.
            </p>
            <p>
              What ties it together: I care about the experience of a product as much as the complexity behind it — the way a pipeline
              stage reads at a glance, and the state model that keeps it correct.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Promotions */}
      <section aria-labelledby="promo-title" className="relative overflow-hidden border-y border-line-strong bg-panel">
        <div aria-hidden="true" className="grid-bg absolute inset-0 opacity-50" />
        <div className="shell grid-12 relative items-end gap-y-8 py-[clamp(4rem,9vw,8rem)]">
          <p aria-hidden="true" className="display-narrow glitch col-span-4 text-[clamp(8rem,28vw,24rem)] leading-[0.75] text-neon neon-glow md:col-span-6" data-text="×2" data-live="true">
            ×2
          </p>
          <div className="col-span-4 md:col-span-6">
            <SourceNote>Fact · from resume</SourceNote>
            <h2 id="promo-title" className="mt-5 font-tech text-h1 font-bold uppercase">
              Promoted twice in under two years.
            </h2>
            <p className="mt-4 max-w-[48ch] text-[1.02rem] text-fg-2">
              Two promotions at EdgeNRoots for consistent technical ownership and delivery quality — joined as a Software Engineer in January
              2024.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="timeline-title" className="shell section">
        <SectionBar index="C" label="Mission log" />
        <SplitReveal as="h2" id="timeline-title" className="display mt-10 text-display md:mt-14">
          First principles <span className="text-neon">→</span> production.
        </SplitReveal>
        <Timeline />
      </section>

      <section aria-labelledby="philosophy-title" className="shell section pt-0">
        <SectionBar index="D" label="Protocols" />
        <SplitReveal as="h2" id="philosophy-title" className="mt-10 max-w-[22ch] font-tech text-h1 font-bold uppercase md:mt-14">
          Frontend engineering is product thinking with a compiler.
        </SplitReveal>
        <Reveal as="ol" stagger={0.08} className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PHILOSOPHY.map((p, i) => (
            <li key={p.t} className="hud-frame group p-6 transition-colors hover:bg-panel-2 md:p-8">
              <span className="hud text-neon">PROTOCOL_0{i + 1}</span>
              <h3 className="mt-6 font-tech text-h3 font-bold uppercase transition-colors group-hover:text-cyan">{p.t}</h3>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-fg-2">{p.d}</p>
            </li>
          ))}
          <li className="chamfer flex flex-col justify-between bg-neon p-6 text-neon-ink md:p-8">
            <span className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em]">Tagline</span>
            <p className="display mt-6 text-h2">{site.tagline}</p>
          </li>
        </Reveal>
      </section>

      <section aria-labelledby="enjoy-title" className="shell section pt-0">
        <SectionBar index="E" label="What I enjoy building" />
        <h2 id="enjoy-title" className="sr-only">
          What I enjoy building
        </h2>
        <Reveal as="dl" stagger={0.06} className="mt-10 border-t border-line-strong md:mt-14">
          {ENJOY.map((e, i) => (
            <div key={e.k} data-decrypt-host className="group relative grid gap-2 overflow-hidden border-b border-line-strong py-6 md:grid-cols-[4rem_1fr_1.4fr] md:gap-8">
              <span aria-hidden="true" className="absolute inset-0 origin-left scale-x-0 bg-neon/[0.06] transition-transform duration-500 ease-[var(--ease-servo)] group-hover:scale-x-100" />
              <span aria-hidden="true" className="hud relative hidden md:block">
                0{i + 1}
              </span>
              <dt className="relative font-tech text-h3 font-bold uppercase transition-colors group-hover:text-neon">
                <Decrypt text={e.k} hover />
              </dt>
              <dd className="relative text-[1rem] text-fg-2">{e.v}</dd>
            </div>
          ))}
        </Reveal>
      </section>

      <section aria-labelledby="collab-title" className="shell section pt-0">
        <SectionBar index="F" label="Collaboration & ownership" />
        <SplitReveal as="h2" id="collab-title" className="mt-10 max-w-[24ch] font-tech text-h1 font-bold uppercase md:mt-14">
          Close to the backend, close to the business.
        </SplitReveal>
        <Reveal stagger={0.08} className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="hud-frame p-6 md:p-8">
            <p className="hud text-neon">At work</p>
            <ul className="mt-4 space-y-3 text-[1rem] leading-relaxed text-fg-2">
              <li>&gt; Working directly with backend teams and stakeholders to align frontend delivery with business requirements.</li>
              <li>&gt; Agile/Scrum in remote teams, across products and clients.</li>
              <li>&gt; End-to-end frontend ownership, from consumer websites to backoffice systems.</li>
            </ul>
          </div>
          <div className="hud-frame p-6 [--frame-accent:var(--magenta)] md:p-8">
            <p className="hud text-magenta">Leadership &amp; open source</p>
            <ul className="mt-4 space-y-3 text-[1rem] leading-relaxed text-fg-2">
              <li>&gt; GirlScript Summer of Code: led features, code reviews and documentation while collaborating with other contributors.</li>
              <li>&gt; Led development of Crossroads, a full-stack site (React, Express, MongoDB), coordinating tasks across the team.</li>
            </ul>
          </div>
        </Reveal>
        <p className="hud mt-8">All statements on this page are taken from the resume.</p>
      </section>

      <Stack index="G" />

      <section aria-labelledby="resume-title" className="shell pb-8">
        <div className="hud-frame flex flex-col gap-8 p-6 md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <p className="hud text-cyan">&gt; export dossier</p>
            <h2 id="resume-title" className="display mt-3 text-h2">
              The one-page version.
            </h2>
            <p className="hud mt-2">PDF · {site.resume.fileName}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonAnchor href={site.resume.href} download={site.resume.fileName} variant="solid" arrow="none">
              <span className="inline-flex items-center gap-2">
                <Download size={15} aria-hidden="true" /> Download resume
              </span>
            </ButtonAnchor>
            <ButtonAnchor href={site.resume.href} target="_blank" rel="noreferrer">
              Open in new tab
            </ButtonAnchor>
            <ButtonLink to="/#work" arrow="right">
              See the work
            </ButtonLink>
          </div>
        </div>
      </section>

      <ContactCTA index="H" />
    </>
  )
}
