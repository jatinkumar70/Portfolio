import { useRef } from 'react'
import { Download } from 'lucide-react'
import { site } from '@/data/site'
import { timeline } from '@/data/timeline'
import { Seo } from '@/components/layout/Seo'
import { Eyebrow, ProvenanceBadge } from '@/components/typography/Typography'
import { SplitReveal, Reveal, DrawOnScroll } from '@/components/animations/Reveal'
import { ButtonAnchor, ButtonLink } from '@/components/buttons/Button'
import { Stack } from '@/components/sections/Stack'
import { ContactCTA } from '@/components/sections/ContactCTA'
import { MONOGRAM_PATHS } from '@/components/navigation/monogram-paths'
import { gsap, useGSAP, motionDisabled, ease } from '@/lib/animation'
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

/** Abstract self-representation: the monogram plotted as a field of points on a drafting grid. */
function AbstractPortrait() {
  // Sample points along the monogram paths at build time (deterministic).
  const dots: { x: number; y: number; on: boolean }[] = []
  const cols = 18
  const rows = 17
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * 3.2
      const y = r * 3.2
      dots.push({ x, y, on: false })
    }
  }
  return (
    <DrawOnScroll className="relative">
      <svg viewBox="-6 -6 66 66" className="w-full" role="img" aria-label="Abstract portrait: the JK monogram drawn over a grid of points">
        <g fill="var(--line-strong)">
          {dots.map((d) => (
            <circle key={`${d.x}-${d.y}`} cx={d.x} cy={d.y} r="0.35" />
          ))}
        </g>
        <g stroke="var(--line-strong)" strokeWidth="0.15" fill="none">
          <circle data-draw cx="27" cy="26" r="27" />
          <path data-draw d="M-6 26 H60 M27 -6 V60" />
        </g>
        <g fill="none" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="square">
          <path data-draw d={MONOGRAM_PATHS.j} />
          <path data-draw d={MONOGRAM_PATHS.kStem} />
          <path data-draw d={MONOGRAM_PATHS.kArms} />
        </g>
        <rect data-draw-fade x="34" y="23.5" width="5" height="5" fill="var(--accent)" />
        <g fontFamily="var(--font-mono)" fontSize="1.6" fill="var(--muted-text)" data-draw-fade>
          <text x="-5" y="-2">
            FIG. B — PORTRAIT, ABSTRACT
          </text>
          <text x="-5" y="58.5">
            NO PHOTOGRAPH · BY DESIGN
          </text>
        </g>
      </svg>
    </DrawOnScroll>
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
          y: 30,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 1,
          ease: ease.out,
          scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        })
        const node = el.querySelector('[data-node]')
        if (node) gsap.from(node, { scale: 0, duration: 0.6, ease: 'back.out(3)', scrollTrigger: { trigger: el, start: 'top 75%', once: true } })
      })
    },
    { scope: ref },
  )
  return (
    <ol ref={ref} className="relative mt-14 md:mt-20">
      <span data-spine aria-hidden="true" className="absolute bottom-0 left-[5px] top-0 w-px bg-ink md:left-[calc(25%+5px)]" />
      {timeline.map((t) => (
        <li key={t.id} data-entry className="relative grid gap-3 pb-16 pl-10 md:grid-cols-4 md:gap-8 md:pl-0">
          <span
            data-node
            aria-hidden="true"
            className={cn(
              'absolute left-0 top-1.5 block h-[11px] w-[11px] md:left-[25%]',
              t.kind === 'milestone' ? 'bg-accent' : t.kind === 'role' ? 'bg-ink' : 'border border-ink bg-porcelain',
            )}
          />
          <div className="md:pr-10 md:text-right">
            <p data-e className="meta text-ink">
              {t.period}
            </p>
            <p data-e className="eyebrow mt-1">
              {t.kind === 'milestone' ? 'Milestone' : t.kind === 'internship' ? 'Internship' : t.kind === 'education' ? 'Education' : 'Role'}
            </p>
          </div>
          <div className="md:col-span-3 md:pl-12">
            <h3 data-e className="display text-h2">
              {t.title}
            </h3>
            <p data-e className="mt-2 text-[1rem] text-ink">
              {t.org}
              {t.place && <span className="text-muted-text"> · {t.place}</span>}
            </p>
            <p data-e className="mt-4 max-w-[60ch] text-[1rem] leading-relaxed text-charcoal">
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

      <header className="shell pt-[calc(var(--header-h)+clamp(2.5rem,7vw,6rem))]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
          <Eyebrow index="02">About</Eyebrow>
          <p className="meta">{site.location.label}</p>
        </div>
        <div className="grid-12 mt-10 gap-y-12 md:mt-14">
          <div className="col-span-4 md:col-span-8">
            <SplitReveal as="h1" immediate className="text-[clamp(2.4rem,6.4vw,6.5rem)] font-bold leading-[0.95] tracking-[-0.04em]">
              I care about what people feel <span className="text-muted">— and what makes it work.</span>
            </SplitReveal>
          </div>
          <div className="col-span-4 max-w-[19rem] md:col-span-4 md:max-w-none md:self-end">
            <AbstractPortrait />
          </div>
        </div>
      </header>

      <section aria-labelledby="bio-title" className="shell section">
        <div className="grid-12 gap-y-8 border-t border-ink pt-6">
          <div className="col-span-4 md:col-span-3">
            <Eyebrow index="A">Biography</Eyebrow>
            <h2 id="bio-title" className="sr-only">
              Biography
            </h2>
          </div>
          <Reveal stagger={0.1} className="prose-body col-span-4 md:col-span-7">
            <p className="text-lead text-ink">
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
      <section aria-labelledby="promo-title" className="border-y border-ink bg-paper">
        <div className="shell grid-12 items-end gap-y-8 py-[clamp(4rem,9vw,8rem)]">
          <p aria-hidden="true" className="display col-span-4 text-[clamp(7rem,26vw,22rem)] leading-[0.75] md:col-span-6">
            ×2
          </p>
          <div className="col-span-4 md:col-span-6">
            <ProvenanceBadge kind="fact" />
            <h2 id="promo-title" className="display mt-5 text-h1">
              Promoted twice in under two years.
            </h2>
            <p className="mt-4 max-w-[48ch] text-[1.02rem] text-charcoal">
              Two promotions at EdgeNRoots for consistent technical ownership and delivery quality — joined as a Software Engineer in January
              2024.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="timeline-title" className="shell section">
        <div className="grid-12 gap-y-6 border-t border-ink pt-6">
          <div className="col-span-4 md:col-span-3">
            <Eyebrow index="B">Timeline</Eyebrow>
          </div>
          <div className="col-span-4 md:col-span-9">
            <SplitReveal as="h2" id="timeline-title" className="display text-display">
              From first principles to production.
            </SplitReveal>
          </div>
        </div>
        <Timeline />
      </section>

      <section aria-labelledby="philosophy-title" className="shell section pt-0">
        <div className="grid-12 gap-y-6 border-t border-ink pt-6">
          <div className="col-span-4 md:col-span-3">
            <Eyebrow index="C">Philosophy</Eyebrow>
          </div>
          <div className="col-span-4 md:col-span-9">
            <SplitReveal as="h2" id="philosophy-title" className="text-h1 font-bold">
              Frontend engineering is product thinking with a compiler.
            </SplitReveal>
          </div>
        </div>
        <Reveal as="ol" stagger={0.08} className="mt-14 grid gap-px border-y border-line bg-line md:grid-cols-2 xl:grid-cols-3">
          {PHILOSOPHY.map((p, i) => (
            <li key={p.t} className="bg-porcelain p-6 md:p-8">
              <span className="meta text-ink">P{i + 1}</span>
              <h3 className="mt-6 text-h3 font-bold">{p.t}</h3>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-charcoal">{p.d}</p>
            </li>
          ))}
          <li className="flex flex-col justify-between bg-ink p-6 text-paper md:p-8">
            <span className="meta text-paper/60">Tagline</span>
            <p className="display mt-6 text-h2">{site.tagline}</p>
          </li>
        </Reveal>
      </section>

      <section aria-labelledby="enjoy-title" className="shell section pt-0">
        <div className="grid-12 gap-y-6 border-t border-ink pt-6">
          <div className="col-span-4 md:col-span-3">
            <Eyebrow index="D">What I enjoy building</Eyebrow>
          </div>
          <div className="col-span-4 md:col-span-9">
            <h2 id="enjoy-title" className="sr-only">
              What I enjoy building
            </h2>
            <Reveal as="dl" stagger={0.06} className="divide-y divide-line border-y border-line">
              {ENJOY.map((e) => (
                <div key={e.k} className="grid gap-2 py-5 md:grid-cols-[1fr_1.4fr] md:gap-8">
                  <dt className="display text-h3">{e.k}</dt>
                  <dd className="text-[1rem] text-charcoal">{e.v}</dd>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      <section aria-labelledby="collab-title" className="shell section pt-0">
        <div className="grid-12 gap-y-6 border-t border-ink pt-6">
          <div className="col-span-4 md:col-span-3">
            <Eyebrow index="E">Collaboration &amp; ownership</Eyebrow>
          </div>
          <div className="col-span-4 md:col-span-9">
            <SplitReveal as="h2" id="collab-title" className="text-h1 font-bold">
              Close to the backend, close to the business.
            </SplitReveal>
            <Reveal stagger={0.08} className="mt-10 grid gap-8 md:grid-cols-2">
              <div>
                <p className="eyebrow">At work</p>
                <ul className="mt-4 space-y-3 text-[1rem] leading-relaxed text-charcoal">
                  <li>— Working directly with backend teams and stakeholders to align frontend delivery with business requirements.</li>
                  <li>— Agile/Scrum in remote teams, across products and clients.</li>
                  <li>— End-to-end frontend ownership, from consumer websites to backoffice systems.</li>
                </ul>
              </div>
              <div>
                <p className="eyebrow">Leadership &amp; open source</p>
                <ul className="mt-4 space-y-3 text-[1rem] leading-relaxed text-charcoal">
                  <li>— GirlScript Summer of Code: led features, code reviews and documentation while collaborating with other contributors.</li>
                  <li>— Led development of Crossroads, a full-stack site (React, Express, MongoDB), coordinating tasks across the team.</li>
                </ul>
              </div>
            </Reveal>
            <p className="meta mt-8">All statements on this page are taken from the resume.</p>
          </div>
        </div>
      </section>

      <Stack index="F" />

      <section aria-labelledby="resume-title" className="shell pb-8">
        <div className="flex flex-col gap-8 border border-ink p-6 md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <p className="eyebrow">Resume</p>
            <h2 id="resume-title" className="display mt-3 text-h2">
              The one-page version.
            </h2>
            <p className="meta mt-2">PDF · {site.resume.fileName}</p>
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

      <ContactCTA />
    </>
  )
}
