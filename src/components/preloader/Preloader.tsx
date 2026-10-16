import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap, SplitText, motionDisabled, ease } from '@/lib/animation'
import { useSmoothScroll } from '@/lib/smooth-scroll'
import { hasWebGL } from '@/lib/webgl'
import { site } from '@/data/site'
import { MONOGRAM_PATHS } from '@/components/navigation/monogram-paths'
import { usePreloader } from './preloader-state'

/** Hard ceiling: the intro never holds the page longer than this. */
const MAX_WAIT_MS = 4200

type TaskState = 'pending' | 'done' | 'deferred'
interface Task {
  id: string
  label: string
  run: () => Promise<unknown>
}

/** Real readiness work — progress reflects these, not a fake percentage. */
function buildTasks(pathname: string): Task[] {
  const tasks: Task[] = [
    {
      id: 'type',
      label: 'Typefaces',
      run: () =>
        Promise.all([
          document.fonts?.load('800 1em "Archivo Variable"'),
          document.fonts?.load('400 1em "Inter Variable"'),
          document.fonts?.load('500 1em "JetBrains Mono Variable"'),
        ]).then(() => document.fonts?.ready),
    },
    {
      id: 'doc',
      label: 'Document',
      run: () =>
        document.readyState === 'complete'
          ? Promise.resolve()
          : new Promise<void>((r) => window.addEventListener('load', () => r(), { once: true })),
    },
  ]
  // Only warm the 3D chunk where the hero actually needs it.
  if (pathname === '/' && hasWebGL()) {
    tasks.push({ id: 'scene', label: 'Scene', run: () => import('@/components/3d/HeroScene') })
  } else {
    tasks.push({ id: 'layout', label: 'Layout', run: () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))) })
  }
  return tasks
}

/**
 * Signature intro: a drafting studio constructing the JK mark in real time.
 * Grid → compass → a thread drawn by a moving nib → the monogram → the name → a
 * wipe into the page. Plays once per session (or via "Replay intro").
 */
export function Preloader() {
  const { finish } = usePreloader()
  const { lock, unlock } = useSmoothScroll()
  const { pathname } = useLocation()
  const rootRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLParagraphElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const skipRef = useRef<HTMLButtonElement>(null)
  const [tasks] = useState(() => buildTasks(pathname))
  const [states, setStates] = useState<Record<string, TaskState>>(() => Object.fromEntries(tasks.map((t) => [t.id, 'pending'])))
  const exitRef = useRef<() => void>(() => {})

  const doneCount = Object.values(states).filter((s) => s !== 'pending').length

  // Lock scroll for the duration; move keyboard focus to "Skip".
  useEffect(() => {
    lock()
    skipRef.current?.focus({ preventScroll: true })
    return () => unlock()
  }, [lock, unlock])

  // Progress bar follows real task completion.
  useEffect(() => {
    if (barRef.current) gsap.to(barRef.current, { scaleX: doneCount / tasks.length, duration: 0.6, ease: ease.soft })
  }, [doneCount, tasks.length])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = motionDisabled()
    let drawnDone = false
    let readyDone = false
    let exiting = false
    let disposed = false
    const q = gsap.utils.selector(root)

    // ── Readiness ──────────────────────────────────────────
    const settle = (id: string, s: TaskState) => setStates((prev) => (prev[id] === 'pending' ? { ...prev, [id]: s } : prev))
    const all = Promise.allSettled(tasks.map((t) => t.run().then(() => settle(t.id, 'done'))))
    const cap = window.setTimeout(() => {
      tasks.forEach((t) => settle(t.id, 'deferred'))
      markReady()
    }, MAX_WAIT_MS)
    all.then(() => markReady())
    // Last resort: if animation frames never run (e.g. a backgrounded or non-painting tab),
    // timers still fire — remove the intro without waiting for the exit timeline.
    const hardStop = window.setTimeout(() => {
      if (disposed) return
      window.dispatchEvent(new CustomEvent('jk:intro-exit'))
      finish()
    }, MAX_WAIT_MS + 2500)

    function markReady() {
      if (readyDone || disposed) return
      readyDone = true
      window.clearTimeout(cap)
      maybeExit()
    }
    function maybeExit() {
      if (drawnDone && readyDone) exit()
    }

    // ── Name split ─────────────────────────────────────────
    const split = nameRef.current ? SplitText.create(nameRef.current, { type: 'chars', mask: 'chars' }) : null

    // ── Exit ───────────────────────────────────────────────
    const exitTl = gsap.timeline({ paused: true, onComplete: () => finish() })
    function exit() {
      if (exiting || disposed) return
      exiting = true
      window.dispatchEvent(new CustomEvent('jk:intro-exit'))
      exitTl.play()
    }
    exitRef.current = () => {
      drawnDone = true
      readyDone = true
      intro.progress(1)
      exit()
      exitTl.timeScale(2.2)
    }

    // ── Construction sequence ─────────────────────────────
    const intro = gsap.timeline({
      onComplete: () => {
        drawnDone = true
        maybeExit()
      },
    })

    if (reduced) {
      intro.set(q('[data-fade]'), { autoAlpha: 1 }).to({}, { duration: 0.6 })
      exitTl.to(root, { autoAlpha: 0, duration: 0.35 })
      return () => {
        disposed = true
        intro.kill()
        exitTl.kill()
        split?.revert()
        window.clearTimeout(cap)
        window.clearTimeout(hardStop)
      }
    }

    const thread = root.querySelector<SVGPathElement>('[data-thread]')
    intro
      .fromTo(q('[data-id]'), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: ease.out })
      .fromTo(q('[data-grid]'), { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: 0.9, stagger: 0.04, ease: ease.inOut }, 0.1)
      .fromTo(q('[data-compass]'), { drawSVG: 0 }, { drawSVG: '100%', duration: 1.1, ease: ease.inOut, stagger: 0.12 }, 0.35)
      .set(q('[data-nib]'), { autoAlpha: 1 }, 0.55)
      .fromTo(q('[data-thread]'), { drawSVG: 0 }, { drawSVG: '100%', duration: 1.15, ease: 'power2.inOut' }, 0.55)
      .to(
        q('[data-nib]'),
        {
          motionPath: { path: thread ?? '', align: thread ?? undefined, alignOrigin: [0.5, 0.5], autoRotate: true },
          duration: 1.15,
          ease: 'power2.inOut',
        },
        0.55,
      )
      .to(q('[data-nib]'), { autoAlpha: 0, scale: 0.4, duration: 0.25 }, 1.65)
      .fromTo(q('[data-mono]'), { drawSVG: 0 }, { drawSVG: '100%', duration: 0.7, stagger: 0.14, ease: 'power3.inOut' }, 1.55)
      .fromTo(q('[data-node]'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, 2.1)
      .to(q('[data-thread]'), { opacity: 0.18, duration: 0.6 }, 2.1)
      .fromTo(q('[data-note]'), { autoAlpha: 0, y: 5 }, { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.5 }, 1.2)
      .fromTo(split?.chars ?? [], { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.035, ease: ease.out }, 2.05)

    exitTl
      .to(q('[data-stage]'), { yPercent: -12, scale: 0.94, duration: 1, ease: ease.inOut }, 0)
      .to(q('[data-name-wrap]'), { yPercent: -40, duration: 1, ease: ease.inOut }, 0)
      .to(root, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.05, ease: ease.inOut }, 0.1)

    return () => {
      disposed = true
      intro.kill()
      exitTl.kill()
      split?.revert()
      window.clearTimeout(cap)
      window.clearTimeout(hardStop)
    }
  }, [tasks, finish])

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-porcelain text-ink"
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      aria-busy={doneCount < tasks.length}
    >
      <p className="sr-only" role="status">Loading {site.name}&apos;s portfolio.</p>

      {/* Top rail */}
      <div className="shell flex items-start justify-between gap-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <p data-id className="eyebrow text-ink">
          {site.studioMark}
        </p>
        <ul className="hidden gap-5 sm:flex" aria-label="Initialisation">
          {tasks.map((t) => (
            <li key={t.id} className="meta flex items-center gap-2">
              <span
                aria-hidden="true"
                className={
                  states[t.id] === 'done' ? 'h-1.5 w-1.5 bg-ink' : states[t.id] === 'deferred' ? 'h-1.5 w-1.5 border border-ink' : 'h-1.5 w-1.5 bg-line-strong'
                }
              />
              {t.label}
              <span className="sr-only">{states[t.id] === 'pending' ? 'loading' : states[t.id] === 'done' ? 'ready' : 'continuing in background'}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Drafting stage */}
      <div className="relative flex flex-1 flex-col items-center justify-center">
        <div data-stage className="w-[min(92vw,62rem)]">
          <svg viewBox="0 0 1000 560" fill="none" className="w-full overflow-visible" aria-hidden="true">
            {/* construction grid */}
            <g stroke="var(--line-strong)" strokeWidth="1">
              {[150, 280, 410].map((y) => (
                <path key={`h${y}`} data-grid d={`M110 ${y} H890`} />
              ))}
              {[365, 500, 635].map((x) => (
                <path key={`v${x}`} data-grid d={`M${x} 70 V490`} />
              ))}
              <path data-grid d="M240 70 L760 490" strokeDasharray="3 6" />
            </g>

            {/* compass work */}
            <g stroke="var(--ink)" strokeWidth="0.75" opacity="0.55">
              <circle data-compass cx="500" cy="280" r="196" />
              <path data-compass d="M640 156 A 160 160 0 0 1 690 300" />
              <circle data-compass cx="547.5" cy="280" r="34" strokeDasharray="2 4" />
            </g>

            {/* registration marks */}
            <g stroke="var(--ink)" strokeWidth="1" data-fade>
              {[
                [365, 150],
                [635, 150],
                [365, 410],
                [635, 410],
              ].map(([x, y]) => (
                <path key={`${x}-${y}`} data-note d={`M${x - 9} ${y} H${x + 9} M${x} ${y - 9} V${y + 9}`} />
              ))}
            </g>

            {/* dimension annotations */}
            <g fontFamily="var(--font-mono)" fontSize="11" fill="var(--muted-text)" letterSpacing="0.06em">
              <g data-note>
                <path d="M365 122 H635 M365 116 V128 M635 116 V128" stroke="var(--ink)" strokeWidth="0.75" />
                <text x="500" y="110" textAnchor="middle">
                  270 · MONOGRAM / GRID 13.5
                </text>
              </g>
              <text data-note x="905" y="284">
                Ø 392
              </text>
              <text data-note x="700" y="312">
                R 160
              </text>
              <text data-note x="120" y="140">
                FIG. 01 — CONSTRUCTION
              </text>
              <text data-note x="120" y="505">
                JK / {new Date().getFullYear()}
              </text>
            </g>

            {/* the thread — drawn by the nib */}
            <path
              data-thread
              d="M-60 470 C 90 470 150 360 250 392 S 400 520 520 468 S 760 330 690 230 S 470 96 395 190"
              stroke="var(--ink)"
              strokeWidth="1.25"
            />

            {/* the monogram, built from the same geometry as the logo */}
            <g transform="translate(365 150) scale(5)">
              <path data-mono d={MONOGRAM_PATHS.j} stroke="var(--ink)" strokeWidth="3.2" strokeLinecap="square" />
              <path data-mono d={MONOGRAM_PATHS.kStem} stroke="var(--ink)" strokeWidth="3.2" strokeLinecap="square" />
              <path data-mono d={MONOGRAM_PATHS.kArms} stroke="var(--ink)" strokeWidth="3.2" strokeLinecap="square" />
              <rect data-node x="34" y="23.5" width="5" height="5" fill="var(--accent)" />
            </g>

            {/* drafting nib */}
            <g data-nib style={{ visibility: 'hidden' }}>
              <path d="M-14 0 L8 -6 L14 0 L8 6 Z" fill="var(--ink)" />
              <circle cx="14" cy="0" r="2.4" fill="var(--accent)" />
            </g>
          </svg>
        </div>

        <div data-name-wrap className="mt-[clamp(0.5rem,3vh,2rem)] w-full">
          <p ref={nameRef} className="display text-center text-[clamp(2.6rem,11vw,10rem)] leading-[0.85]" aria-label={site.name}>
            {site.name}
          </p>
        </div>
      </div>

      {/* Bottom rail: real progress */}
      <div className="shell pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex items-end justify-between gap-6">
          <p className="meta tabular" data-id>
            Ready {doneCount}/{tasks.length}
          </p>
          <button
            ref={skipRef}
            type="button"
            onClick={() => exitRef.current()}
            className="meta link-u min-h-10 text-ink"
          >
            Skip intro
          </button>
        </div>
        <div className="mt-3 h-px w-full bg-line">
          <div ref={barRef} className="h-px w-full origin-left bg-ink" style={{ transform: 'scaleX(0)' }} />
        </div>
      </div>
    </div>
  )
}
