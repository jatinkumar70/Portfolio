import { useRef, useState } from 'react'
import { Maximize2, X } from 'lucide-react'
import { projects } from '@/data/projects'
import type { Project } from '@/types/content'
import { gsap, useGSAP, ease, motionDisabled } from '@/lib/animation'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/lib/motion-preferences'
import { Eyebrow } from '@/components/typography/Typography'
import { SplitReveal } from '@/components/animations/Reveal'
import { cn } from '@/lib/utils'
import { useSmoothScroll } from '@/lib/smooth-scroll'

/**
 * Selected work as a deck of sticky cards. On wide screens with motion on,
 * each card pins under the header and the one beneath recedes as the next
 * slides over it; screenshots unmask and settle as they arrive. Elsewhere the
 * cards simply stack with entrance reveals — no scroll-jacking on phones.
 */
export function SelectedWork() {
  const root = useRef<HTMLElement>(null)
  const desktop = useMediaQuery('(min-width: 64rem)')
  const reduced = useReducedMotion()
  const stacking = desktop && !reduced
  const [open, setOpen] = useState<Project | null>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el || motionDisabled()) return
      const cards = gsap.utils.toArray<HTMLElement>('[data-card]', el)

      cards.forEach((card, i) => {
        const shot = card.querySelector('[data-shot]')
        const copy = card.querySelectorAll('[data-copy]')

        // Screenshot: clip open + settle as the card arrives.
        if (shot)
          gsap.fromTo(
            shot,
            { clipPath: 'inset(12% 10% 12% 10%)', scale: 1.08 },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              scale: 1,
              ease: 'none',
              scrollTrigger: { trigger: card, start: 'top 90%', end: stacking ? 'top 15%' : 'top 40%', scrub: 0.6 },
            },
          )
        gsap.from(copy, {
          y: 40,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.07,
          ease: ease.out,
          scrollTrigger: { trigger: card, start: 'top 70%', once: true },
        })

        // Stacking: the card below recedes while the next one covers it.
        const next = cards[i + 1]
        if (stacking && next) {
          gsap.fromTo(card.querySelector('[data-card-inner]'), { scale: 1 }, {
            scale: 0.93,
            ease: 'none',
            scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top+=120', scrub: true },
          })
        }
      })
    },
    { scope: root, dependencies: [stacking], revertOnUpdate: true },
  )

  return (
    <section ref={root} id="work" aria-labelledby="work-title" className="scroll-mt-16 pt-[var(--section-y)]">
      <div className="shell">
        <div className="grid-12 gap-y-6 border-t border-ink pt-6">
          <div className="col-span-4 md:col-span-3">
            <Eyebrow index="02">Selected work</Eyebrow>
          </div>
          <div className="col-span-4 md:col-span-9">
            <SplitReveal as="h2" id="work-title" className="display text-display">
              Things I&apos;ve
              <br />
              shipped.
            </SplitReveal>
            <p className="mt-6 max-w-[54ch] text-[1.02rem] text-charcoal">
              Business operations, hospitality, roadside assistance and education — dashboards, data-heavy admin panels and the consumer
              experiences around them.
            </p>
          </div>
        </div>
      </div>

      <ol className="shell mt-14 md:mt-20">
        {projects.map((p, i) => (
          <li
            key={p.slug}
            data-card
            className={cn('relative', stacking ? 'sticky top-[calc(var(--header-h)+1.5rem)] pb-[12vh]' : 'mb-16 md:mb-24')}
            style={{ zIndex: i + 1 }}
          >
            <ProjectCard project={p} onOpen={() => setOpen(p)} />
          </li>
        ))}
      </ol>
      {/* lets the final sticky card finish its scroll before the next section */}
      {stacking && <div aria-hidden="true" className="h-[10vh]" />}

      <Lightbox project={open} onClose={() => setOpen(null)} />
    </section>
  )
}

function ProjectCard({ project: p, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <article
      data-card-inner
      aria-labelledby={`p-${p.slug}`}
      className={cn(
        'grid origin-top items-center gap-8 border border-ink bg-porcelain p-5 will-change-transform md:p-8 lg:grid-cols-[minmax(17rem,0.85fr)_2fr] lg:gap-10',
      )}
    >
      <div className="order-2 flex min-w-0 flex-col lg:order-1">
        <div data-copy className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
          <span className="display text-[clamp(3rem,6vw,5.5rem)] leading-none text-transparent [-webkit-text-stroke:1.2px_var(--ink)]" aria-hidden="true">
            {p.index}
          </span>
          <span className="meta text-right">
            {p.context}
            <br />
            {p.period}
          </span>
        </div>
        <h3 data-copy id={`p-${p.slug}`} className="display mt-6 text-h1">
          {p.title}
        </h3>
        <p data-copy className="display-wide mt-2 text-[1.02rem] font-normal text-charcoal">
          {p.kicker}
        </p>
        <p data-copy className="mt-5 text-[0.98rem] leading-relaxed text-charcoal">
          {p.summary}
        </p>
        <ul data-copy className="mt-5 space-y-2 border-t border-line pt-4">
          {p.highlights.map((h) => (
            <li key={h} className="flex gap-3 text-[0.92rem] leading-snug text-ink">
              <span aria-hidden="true" className="mt-[0.45em] h-1.5 w-1.5 shrink-0 bg-accent" />
              {h}
            </li>
          ))}
        </ul>
        {p.stack.length > 0 && (
          <ul data-copy className="mt-auto flex flex-wrap gap-1.5 pt-6" aria-label="Technologies">
            {p.stack.map((s) => (
              <li key={s} className="tag">
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="order-1 min-w-0 lg:order-2">
        <div className="flex items-center justify-between gap-3 border border-b-0 border-ink bg-paper px-3 py-2">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full border border-ink" />
            <span className="h-2.5 w-2.5 rounded-full border border-ink" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          </span>
          <span className="meta truncate">{p.url}</span>
          <span className="meta">{p.role.split(' — ')[0]}</span>
        </div>
        <div className="relative overflow-hidden border border-ink bg-paper">
          {p.image ? (
            <button
              type="button"
              onClick={onOpen}
              data-cursor="view"
              data-cursor-label="Zoom"
              className="group block w-full"
              aria-label={`View ${p.title} screenshot full size`}
            >
              <img
                data-shot
                src={p.image.src}
                alt={p.image.alt}
                width={p.image.width}
                height={p.image.height}
                loading="lazy"
                decoding="async"
                className="h-auto w-full"
              />
              <span className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center border border-ink bg-paper opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <Maximize2 size={16} aria-hidden="true" />
              </span>
            </button>
          ) : (
            <SchoolPlate />
          )}
        </div>
        {p.image?.note && <p className="meta mt-2">{p.image.note}</p>}
      </div>
    </article>
  )
}

/** Typographic plate for the project without a screenshot. */
function SchoolPlate() {
  const modules = ['Students', 'Teachers', 'Admissions', 'Assignments', 'Homework']
  return (
    <div data-shot className="blueprint relative flex aspect-[2.1/1] flex-col justify-between p-6 md:p-10">
      <p className="eyebrow">React · Firebase Auth · Firestore</p>
      <ul className="space-y-1">
        {modules.map((m, i) => (
          <li key={m} className="display text-[clamp(1.1rem,2.4vw,2.3rem)] leading-[0.95]" style={{ paddingLeft: `${i * 6}%` }}>
            {m}
            {i === modules.length - 1 && <span className="text-accent">.</span>}
          </li>
        ))}
      </ul>
      <p className="meta">Screenshot not available — modules as listed in the resume.</p>
    </div>
  )
}

function Lightbox({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const img = project?.image
  const { lock, unlock } = useSmoothScroll()

  useGSAP(() => {
    const d = ref.current
    if (!d) return
    if (img && !d.open) {
      d.showModal()
      lock()
      if (!motionDisabled()) gsap.fromTo(d.querySelector('figure'), { y: 40, autoAlpha: 0, scale: 0.97 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.6, ease: ease.out })
    } else if (!img && d.open) d.close()
  }, [img])

  function handleClose() {
    unlock()
    onClose()
  }

  return (
    <dialog
      ref={ref}
      onClose={handleClose}
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      data-lenis-prevent
      aria-label={project ? `${project.title} screenshot` : 'Screenshot'}
      className="m-auto max-h-[92vh] w-[min(96vw,110rem)] max-w-none bg-transparent p-0 backdrop:bg-ink/85"
    >
      {img && project && (
        <figure className="border border-paper/30 bg-paper">
          <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-2">
            <figcaption className="meta text-ink">
              {project.index} — {project.title}
              {img.note && <span className="text-muted-text"> · {img.note}</span>}
            </figcaption>
            <button type="button" onClick={() => ref.current?.close()} className="grid h-10 w-10 place-items-center" aria-label="Close" autoFocus>
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <img src={img.src} alt={img.alt} width={img.width} height={img.height} className="max-h-[80vh] w-full object-contain" />
        </figure>
      )}
    </dialog>
  )
}
