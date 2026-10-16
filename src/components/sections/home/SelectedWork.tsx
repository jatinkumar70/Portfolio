import { useRef, useState } from 'react'
import { ArrowRight, Maximize2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { projects } from '@/data/projects'
import type { Project } from '@/types/content'
import { gsap, useGSAP, ease, motionDisabled, ScrollTrigger } from '@/lib/animation'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/lib/motion-preferences'
import { SectionBar } from '@/components/typography/Typography'
import { SplitReveal } from '@/components/animations/Reveal'
import { cn } from '@/lib/utils'
import { useSmoothScroll } from '@/lib/smooth-scroll'

/**
 * Selected work as a horizontal data-stream. On wide screens with motion on,
 * the section pins and vertical scroll drives the track sideways; the track
 * skews with scroll velocity, screenshots unclip as they slide in and a HUD
 * counter tracks the active project. Elsewhere it is a plain vertical list.
 */
export function SelectedWork() {
  const root = useRef<HTMLElement>(null)
  const desktop = useMediaQuery('(min-width: 64rem)')
  const reduced = useReducedMotion()
  const horizontal = desktop && !reduced
  const [open, setOpen] = useState<Project | null>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el || motionDisabled()) return
      const q = gsap.utils.selector(el)
      const panels = q('[data-panel]')

      if (!horizontal) {
        panels.forEach((p) => {
          const shot = p.querySelector('[data-shot]')
          if (shot)
            gsap.fromTo(
              shot,
              { clipPath: 'inset(0% 100% 0% 0%)' },
              { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: ease.servo, scrollTrigger: { trigger: p, start: 'top 75%', once: true } },
            )
          gsap.from(p.querySelectorAll('[data-copy]'), {
            y: 30,
            autoAlpha: 0,
            duration: 0.9,
            stagger: 0.06,
            ease: ease.out,
            scrollTrigger: { trigger: p, start: 'top 75%', once: true },
          })
        })
        return
      }

      const track = q('[data-track]')[0] as HTMLElement
      const distance = () => track.scrollWidth - window.innerWidth
      const skew = gsap.quickTo(track, 'skewX', { duration: 0.4, ease: 'power3.out' })
      // onUpdate stops firing when scrolling stops, so ease the shear back to 0 shortly after
      const settle = gsap.delayedCall(0.12, () => skew(0)).pause()
      const counter = q('[data-counter]')[0]
      const bar = q('[data-bar]')[0]

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: q('[data-hpin]')[0],
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            skew(gsap.utils.clamp(-8, 8, self.getVelocity() / -400))
            settle.restart(true)
            const n = projects.length
            const i = Math.min(n, Math.max(1, Math.round(self.progress * (n + 1))))
            if (counter) counter.textContent = String(i).padStart(2, '0')
            if (bar) (bar as HTMLElement).style.transform = `scaleX(${self.progress})`
          },
          onLeave: () => skew(0),
          onLeaveBack: () => skew(0),
        },
      })

      panels.forEach((p) => {
        const shot = p.querySelector('[data-shot]')
        const num = p.querySelector('[data-num]')
        if (shot)
          gsap.fromTo(
            shot,
            { clipPath: 'inset(0% 0% 0% 100%)', scale: 1.15 },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              scale: 1,
              ease: 'none',
              scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 95%', end: 'left 35%', scrub: true },
            },
          )
        if (num)
          gsap.fromTo(num, { xPercent: 60 }, { xPercent: -30, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } })
        gsap.from(p.querySelectorAll('[data-copy]'), {
          autoAlpha: 0,
          x: 60,
          duration: 0.8,
          stagger: 0.05,
          ease: ease.out,
          scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 70%', toggleActions: 'play none none reverse' },
        })
      })

      // images load lazily and change the track width
      const imgs = Array.from(el.querySelectorAll('img'))
      const refresh = () => ScrollTrigger.refresh()
      imgs.forEach((img) => !img.complete && img.addEventListener('load', refresh, { once: true }))
      return () => imgs.forEach((img) => img.removeEventListener('load', refresh))
    },
    { scope: root, dependencies: [horizontal], revertOnUpdate: true },
  )

  return (
    <section ref={root} id="work" aria-labelledby="work-title" className="relative scroll-mt-16 bg-void">
      <div data-hpin className={cn('relative', horizontal ? 'h-[100svh] overflow-hidden' : 'py-[var(--section-y)]')}>
        {horizontal && <div aria-hidden="true" className="grid-bg absolute inset-0 opacity-40" />}

        <div
          data-track
          className={cn(
            'relative',
            horizontal ? 'flex h-full w-max items-center gap-[5vw] pl-[var(--gutter)] pr-[12vw] pt-[var(--header-h)] will-change-transform' : 'shell flex flex-col gap-20',
          )}
        >
          {/* intro panel */}
          <div className={cn('flex shrink-0 flex-col justify-center', horizontal && 'w-[min(38rem,42vw)]')}>
            <SectionBar index="02" label="Selected work" />
            <SplitReveal as="h2" id="work-title" className="display mt-8 text-[clamp(3rem,7.5vw,8.5rem)] leading-[0.82]">
              Shipped
              <br />
              <span className="stroke [--stroke:var(--neon)]">to prod.</span>
            </SplitReveal>
            <p className="mt-8 max-w-[44ch] text-[1.02rem] leading-relaxed text-fg-2">
              Business operations, hospitality, roadside assistance and education — dashboards, data-heavy admin panels and the consumer
              experiences around them.
            </p>
            <p className="hud mt-8 flex items-center gap-3">
              <span className="text-neon">{String(projects.length).padStart(2, '0')}</span> case files
              {horizontal && (
                <>
                  <span className="h-px w-10 bg-line-strong" aria-hidden="true" />
                  scroll <ArrowRight size={12} aria-hidden="true" className="text-neon" />
                </>
              )}
            </p>
          </div>

          {projects.map((p) => (
            <ProjectPanel key={p.slug} project={p} horizontal={horizontal} onOpen={() => setOpen(p)} />
          ))}

          {/* outro panel */}
          <div className={cn('flex shrink-0 flex-col justify-center gap-6', horizontal && 'w-[min(30rem,34vw)]')}>
            <p className="hud text-cyan">&gt; end of stream</p>
            <p className="display text-h1 leading-[0.9]">
              More in the <span className="text-neon">dossier.</span>
            </p>
            <Link to="/about" className="btn self-start" data-cursor="link">
              <span>Read the full story</span>
              <ArrowRight className="btn-arrow" size={16} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {horizontal && (
          <div aria-hidden="true" className="shell absolute inset-x-0 bottom-6 flex items-center gap-5">
            <span className="hud">
              File <span data-counter className="tabular text-neon">01</span> / {String(projects.length).padStart(2, '0')}
            </span>
            <span className="relative h-[2px] flex-1 bg-line">
              <span data-bar className="absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-cyan via-magenta to-neon" />
            </span>
            <span className="hud">Scroll ↓ = →</span>
          </div>
        )}
      </div>

      <Lightbox project={open} onClose={() => setOpen(null)} />
    </section>
  )
}

function ProjectPanel({ project: p, horizontal, onOpen }: { project: Project; horizontal: boolean; onOpen: () => void }) {
  return (
    <article
      data-panel
      aria-labelledby={`p-${p.slug}`}
      className={cn(
        'hud-frame relative grid shrink-0 gap-8 overflow-hidden p-5 md:p-8',
        horizontal ? 'h-[min(76svh,46rem)] w-[min(82vw,84rem)] grid-cols-[minmax(18rem,0.8fr)_1.6fr] items-center gap-10' : 'lg:grid-cols-[minmax(17rem,0.85fr)_2fr]',
      )}
    >
      <span
        data-num
        aria-hidden="true"
        className="display stroke pointer-events-none absolute -bottom-[0.18em] right-[2%] text-[clamp(8rem,22vw,22rem)] leading-none opacity-50 [--stroke:var(--line-strong)]"
      >
        {p.index}
      </span>

      <div className="relative order-2 flex min-w-0 flex-col lg:order-1">
        <div data-copy className="flex items-center justify-between gap-4 border-b border-line-strong pb-3">
          <span className="hud">
            <span className="text-neon">FILE_{p.index}</span> // {p.context}
          </span>
          <span className="hud text-right">{p.period}</span>
        </div>
        <h3 data-copy id={`p-${p.slug}`} className="display mt-6 text-[clamp(2rem,3.6vw,3.8rem)] leading-[0.9]">
          <span className="glitch" data-text={p.title.toUpperCase()}>
            {p.title}
          </span>
        </h3>
        <p data-copy className="hud mt-3 text-cyan">
          &gt; {p.kicker}
        </p>
        <p data-copy className="mt-5 text-[0.98rem] leading-relaxed text-fg-2">
          {p.summary}
        </p>
        <ul data-copy className="mt-5 space-y-2 border-t border-line pt-4">
          {p.highlights.map((h) => (
            <li key={h} className="flex gap-3 text-[0.92rem] leading-snug text-fg">
              <span aria-hidden="true" className="mt-[0.5em] h-1.5 w-1.5 shrink-0 bg-neon shadow-[0_0_8px_var(--neon)]" />
              {h}
            </li>
          ))}
        </ul>
        {p.stack.length > 0 && (
          <ul data-copy className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies">
            {p.stack.map((s) => (
              <li key={s} className="tag">
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative order-1 min-w-0 lg:order-2">
        <div className="flex items-center justify-between gap-3 border border-b-0 border-line-strong bg-panel-2 px-3 py-2">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 bg-magenta" />
            <span className="h-2 w-2 bg-neon" />
            <span className="h-2 w-2 bg-cyan" />
          </span>
          <span className="hud truncate normal-case tracking-[0.06em]">{p.url}</span>
          <span className="hud hidden sm:inline">{p.role.split(' — ')[0]}</span>
        </div>
        <div className="relative overflow-hidden border border-line-strong bg-void">
          {p.image ? (
            <button
              type="button"
              onClick={onOpen}
              data-cursor="view"
              data-cursor-label="Zoom"
              className="group block w-full"
              aria-label={`View ${p.title} screenshot full size`}
            >
              <span data-shot className="block">
                <img
                  src={p.image.src}
                  alt={p.image.alt}
                  width={p.image.width}
                  height={p.image.height}
                  loading="lazy"
                  decoding="async"
                  className={cn('rgb-hover w-full object-cover object-top', horizontal ? 'max-h-[min(56svh,34rem)]' : 'h-auto')}
                />
              </span>
              <span className="scan-sweep" aria-hidden="true" />
              <span className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center bg-neon text-neon-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <Maximize2 size={16} aria-hidden="true" />
              </span>
            </button>
          ) : (
            <SchoolPlate />
          )}
        </div>
        {p.image?.note && <p className="hud mt-2">{p.image.note}</p>}
      </div>
    </article>
  )
}

/** Typographic plate for the project without a screenshot. */
function SchoolPlate() {
  const modules = ['Students', 'Teachers', 'Admissions', 'Assignments', 'Homework']
  return (
    <div data-shot className="grid-bg relative flex aspect-[2.1/1] flex-col justify-between p-6 md:p-10">
      <p className="hud text-cyan">React · Firebase Auth · Firestore</p>
      <ul className="space-y-1">
        {modules.map((m, i) => (
          <li key={m} className="display text-[clamp(1.1rem,2.3vw,2.2rem)] leading-[0.95]" style={{ paddingLeft: `${i * 6}%` }}>
            <span className="mr-3 font-mono text-[0.45em] text-dim">0{i + 1}</span>
            {m}
            {i === modules.length - 1 && <span className="text-neon">_</span>}
          </li>
        ))}
      </ul>
      <p className="hud">Screenshot not available — modules as listed in the resume.</p>
      <span className="scan-sweep" aria-hidden="true" />
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
      if (!motionDisabled())
        gsap.fromTo(d.querySelector('figure'), { clipPath: 'inset(50% 0% 50% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: ease.servo })
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
      className="m-auto max-h-[92vh] w-[min(96vw,110rem)] max-w-none bg-transparent p-0 backdrop:bg-void/90 backdrop:backdrop-blur-sm"
    >
      {img && project && (
        <figure className="hud-frame bg-panel">
          <div className="flex items-center justify-between gap-4 border-b border-line-strong px-4 py-2">
            <figcaption className="hud text-fg">
              <span className="text-neon">FILE_{project.index}</span> // {project.title}
              {img.note && <span className="text-dim"> · {img.note}</span>}
            </figcaption>
            <button type="button" onClick={() => ref.current?.close()} className="grid h-10 w-10 place-items-center text-fg hover:text-neon" aria-label="Close" autoFocus>
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <img src={img.src} alt={img.alt} width={img.width} height={img.height} className="max-h-[80vh] w-full object-contain" />
        </figure>
      )}
    </dialog>
  )
}
