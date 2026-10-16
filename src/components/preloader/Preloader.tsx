import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap, motionDisabled, ease, GLYPHS } from '@/lib/animation'
import { useSmoothScroll } from '@/lib/smooth-scroll'
import { hasWebGL } from '@/lib/webgl'
import { site } from '@/data/site'
import { MONOGRAM_PATHS } from '@/components/navigation/monogram-paths'
import { usePreloader } from './preloader-state'
import { BootTunnel } from './BootTunnel'

/** Hard ceiling: the intro never holds the page longer than this. */
const MAX_WAIT_MS = 4200
const SLICES = 8
const HEX_ROWS = 16

type TaskState = 'pending' | 'done' | 'deferred'
interface Task {
  id: string
  label: string
  run: () => Promise<unknown>
}

/** Real readiness work — the [ OK ] flags and the counter reflect these. */
function buildTasks(): Task[] {
  return [
    {
      id: 'type',
      label: 'mount /dev/typefaces',
      run: () =>
        Promise.all([
          document.fonts?.load('900 1em "Archivo Variable"'),
          document.fonts?.load('500 1em "Chakra Petch"'),
          document.fonts?.load('500 1em "JetBrains Mono Variable"'),
        ]).then(() => document.fonts?.ready),
    },
    {
      id: 'doc',
      label: 'handshake document',
      run: () =>
        document.readyState === 'complete'
          ? Promise.resolve()
          : new Promise<void>((r) => window.addEventListener('load', () => r(), { once: true })),
    },
    {
      id: 'gpu',
      label: hasWebGL() ? 'link webgl pipeline' : 'webgl unavailable · fallback',
      run: () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
    },
  ]
}

/** Decorative boot chatter between the real tasks. */
const CHATTER = ['allocate neon buffers', 'calibrate glitch matrix', 'decrypt identity']

const HEX = '0123456789ABCDEF'
const hexByte = () => HEX[(Math.random() * 16) | 0] + HEX[(Math.random() * 16) | 0]
const hexRow = (i: number) =>
  `0x${(0x7f00 + i * 16).toString(16).toUpperCase()}  ${Array.from({ length: 8 }, hexByte).join(' ')}  ${Array.from({ length: 6 }, () => GLYPHS[(Math.random() * GLYPHS.length) | 0]).join('')}`

/**
 * Boot sequence: a warp tunnel spins up behind a terminal log of real
 * readiness checks while the JK monogram draws itself in RGB-split strokes and
 * the name decrypts out of glyph noise. Signal hits tear the screen. On ready:
 * ACCESS GRANTED, a white-out flash, and the screen shears into slices that
 * servo away. Plays once per session (or via "Replay intro").
 */
export function Preloader() {
  const { finish } = usePreloader()
  const { lock, unlock } = useSmoothScroll()
  const rootRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLParagraphElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const countWrapRef = useRef<HTMLParagraphElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const hexRef = useRef<HTMLPreElement>(null)
  const skipRef = useRef<HTMLButtonElement>(null)
  const speedRef = useRef(0)
  const glitchRef = useRef(0)
  const [tasks] = useState(buildTasks)
  const [states, setStates] = useState<Record<string, TaskState>>(() => Object.fromEntries(tasks.map((t) => [t.id, 'pending'])))
  const [reduced] = useState(motionDisabled)
  const exitRef = useRef<() => void>(() => {})
  const progress = useRef({ v: 0 })

  const doneCount = Object.values(states).filter((s) => s !== 'pending').length

  /** Paint counter + segmented bar for the current progress value. */
  const paint = useCallback(() => {
    const v = Math.round(progress.current.v)
    const text = String(v).padStart(3, '0')
    if (countRef.current) countRef.current.textContent = text
    countWrapRef.current?.setAttribute('data-text', text)
    if (barRef.current) barRef.current.style.clipPath = `inset(0 ${100 - v}% 0 0)`
  }, [])

  // Lock scroll for the duration; move keyboard focus to "Skip".
  useEffect(() => {
    lock()
    skipRef.current?.focus({ preventScroll: true })
    return () => unlock()
  }, [lock, unlock])

  // Counter + bar follow real task completion (capped below 100 until exit).
  useEffect(() => {
    const target = Math.min(96, (doneCount / tasks.length) * 96)
    gsap.to(progress.current, { v: target, duration: 0.9, ease: ease.soft, onUpdate: paint })
  }, [doneCount, tasks.length, paint])

  // Live hex dump — a couple of rows rewrite every tick.
  useEffect(() => {
    const el = hexRef.current
    if (!el) return
    const rows = Array.from({ length: HEX_ROWS }, (_, i) => hexRow(i))
    el.textContent = rows.join('\n')
    if (reduced) return
    const id = window.setInterval(() => {
      for (let k = 0; k < 3; k++) {
        const i = (Math.random() * HEX_ROWS) | 0
        rows[i] = hexRow(i)
      }
      el.textContent = rows.join('\n')
    }, 70)
    return () => window.clearInterval(id)
  }, [reduced])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let introDone = false
    let readyDone = false
    let exiting = false
    let disposed = false
    let ambient: gsap.core.Tween | null = null
    const q = gsap.utils.selector(root)

    // ── Readiness ──────────────────────────────────────────
    const settle = (id: string, s: TaskState) => setStates((prev) => (prev[id] === 'pending' ? { ...prev, [id]: s } : prev))
    const all = Promise.allSettled(tasks.map((t) => t.run().then(() => settle(t.id, 'done'))))
    const cap = window.setTimeout(() => {
      tasks.forEach((t) => settle(t.id, 'deferred'))
      markReady()
    }, MAX_WAIT_MS)
    all.then(() => markReady())
    // Last resort: if animation frames never run (a backgrounded tab), timers still fire.
    const hardStop = window.setTimeout(() => {
      if (disposed) return
      window.dispatchEvent(new CustomEvent('jk:intro-exit'))
      finish()
    }, MAX_WAIT_MS + 3000)

    function markReady() {
      if (readyDone || disposed) return
      readyDone = true
      window.clearTimeout(cap)
      maybeExit()
    }
    function maybeExit() {
      if (introDone && readyDone) exit()
    }
    function exit() {
      if (exiting || disposed) return
      exiting = true
      ambient?.kill()
      exitTl.play()
    }

    const ctx = gsap.context(() => {}, root)
    let intro!: gsap.core.Timeline
    let exitTl!: gsap.core.Timeline

    ctx.add(() => {
      intro = gsap.timeline({
        onComplete: () => {
          introDone = true
          maybeExit()
        },
      })
      exitTl = gsap.timeline({ paused: true, onComplete: () => finish() })

      if (reduced) {
        intro.to({}, { duration: 0.5 })
        exitTl.call(() => window.dispatchEvent(new CustomEvent('jk:intro-exit'))).to(root, { autoAlpha: 0, duration: 0.3 })
        return
      }

      const center = q('[data-glitch-out]')
      /** A signal hit: canvas tears, the centre block jolts with an RGB split. */
      const hit = (power: number) => {
        glitchRef.current = Math.max(glitchRef.current, power)
        const r = gsap.utils.random
        gsap
          .timeline()
          .set(center, {
            x: r(-24, 24) * power,
            skewX: r(-14, 14) * power,
            filter: `drop-shadow(${-5 * power}px 0 0 var(--cyan)) drop-shadow(${5 * power}px 0 0 var(--magenta))`,
          })
          .set(center, { x: r(-10, 10) * power, skewX: 0 }, 0.05)
          .set(center, { x: 0, skewX: 0, filter: 'none' }, 0.12)
      }
      const scheduleAmbient = () => {
        ambient = gsap.delayedCall(gsap.utils.random(0.45, 1.2), () => {
          if (disposed || exiting) return
          hit(gsap.utils.random(0.25, 0.65))
          scheduleAmbient()
        })
      }

      // RGB ghost layers of the monogram jitter on a hard step clock.
      gsap.to(q('[data-ghost="c"]'), { x: 'random(-7, 1)', y: 'random(-2, 2)', duration: 0.11, ease: 'steps(1)', repeat: -1, repeatRefresh: true })
      gsap.to(q('[data-ghost="m"]'), { x: 'random(-1, 7)', y: 'random(-2, 2)', duration: 0.13, ease: 'steps(1)', repeat: -1, repeatRefresh: true })

      intro
        .fromTo(speedRef, { current: 0 }, { current: 1.3, duration: 1.6, ease: 'power2.out' }, 0)
        .from(q('[data-corner]'), { scale: 0, duration: 0.5, stagger: 0.05, ease: 'back.out(3)' }, 0)
        .from(q('[data-boot-head]'), { autoAlpha: 0, duration: 0.4, ease: 'steps(4)' }, 0)
        .from(q('[data-log]'), { autoAlpha: 0, x: -12, duration: 0.25, stagger: 0.14, ease: 'steps(3)' }, 0.15)
        .from(q('[data-hex]'), { autoAlpha: 0, duration: 0.5, ease: 'steps(5)' }, 0.3)
        .from(q('[data-foot]'), { autoAlpha: 0, yPercent: 30, duration: 0.6, ease: ease.out }, 0.1)
        .from(q('[data-draw]'), { drawSVG: '0%', duration: 1.1, stagger: 0.1, ease: 'power2.inOut' }, 0.25)
        .from(q('[data-node]'), { scale: 0, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(5)' }, 1.15)
        .to(q('[data-node]'), { autoAlpha: 0.2, duration: 0.07, repeat: 5, yoyo: true, ease: 'steps(1)' }, 1.4)
        .to(nameRef.current, { duration: 1.1, ease: 'none', scrambleText: { text: site.name.toUpperCase(), chars: GLYPHS, speed: 0.8, revealDelay: 0.3 } }, 0.8)
        .from(q('[data-role]'), { autoAlpha: 0, duration: 0.4, ease: 'steps(4)' }, 1.55)
        .call(() => hit(0.7), [], 0.55)
        .call(() => hit(0.9), [], 1.15)
        .call(scheduleAmbient, [], 1.3)
        .to({}, { duration: 0.25 })

      // ── Exit: 100%, ACCESS GRANTED, white-out, slices shear away ──
      exitTl
        .to(progress.current, { v: 100, duration: 0.4, ease: 'power2.in', onUpdate: paint }, 0)
        .to(speedRef, { current: 12, duration: 1.1, ease: 'power3.in' }, 0)
        .to(q('[data-side]'), { autoAlpha: 0, duration: 0.25, ease: 'steps(3)' }, 0.3)
        .to(center, { autoAlpha: 0.15, duration: 0.2, ease: 'steps(2)' }, 0.4)
        .call(() => hit(1), [], 0.4)
        .fromTo(q('[data-granted]'), { autoAlpha: 0, scaleY: 0 }, { autoAlpha: 1, scaleY: 1, duration: 0.35, ease: ease.lock }, 0.4)
        .to(q('[data-granted-text]'), { duration: 0.45, ease: 'none', scrambleText: { text: 'ACCESS GRANTED', chars: GLYPHS, speed: 1.2 } }, 0.42)
        .call(() => hit(1), [], 0.95)
        .to(q('[data-granted]'), { x: () => gsap.utils.random(-30, 30), skewX: () => gsap.utils.random(-22, 22), duration: 0.05, repeat: 3, yoyo: true, ease: 'none' }, 0.95)
        .to(q('[data-flash]'), { keyframes: [{ opacity: 0.9, duration: 0.05 }, { opacity: 0, duration: 0.3 }], ease: 'none' }, 1.12)
        .to(q('[data-content]'), { autoAlpha: 0, duration: 0.12, ease: 'steps(2)' }, 1.15)
        .to(q('[data-slice-edge]'), { opacity: 1, duration: 0.1, ease: 'steps(2)' }, 1.15)
        .call(() => window.dispatchEvent(new CustomEvent('jk:intro-exit')), [], 1.2)
        .to(
          q('[data-slice]'),
          {
            xPercent: (i: number) => (i % 2 ? 101 : -101),
            skewX: (i: number) => (i % 2 ? -10 : 10),
            duration: 0.85,
            ease: ease.servo,
            stagger: { each: 0.04, from: 'center' },
          },
          1.2,
        )
    })

    exitRef.current = () => {
      introDone = true
      readyDone = true
      intro.progress(1)
      exit()
      exitTl.timeScale(2)
    }

    return () => {
      disposed = true
      ambient?.kill()
      // revert, not kill: StrictMode re-runs this effect and from() tweens must start clean
      ctx.revert()
      window.clearTimeout(cap)
      window.clearTimeout(hardStop)
    }
  }, [tasks, finish, reduced, paint])

  return (
    <div ref={rootRef} className="fixed inset-0 z-[100] overflow-hidden text-fg" role="dialog" aria-modal="true" aria-label="Loading">
      {/* background slices */}
      <div aria-hidden="true" className="absolute inset-0 flex flex-col">
        {Array.from({ length: SLICES }, (_, i) => (
          <div key={i} data-slice className="relative flex-1 bg-void will-change-transform">
            <span
              data-slice-edge
              className={`absolute inset-x-0 bottom-0 h-[2px] opacity-0 ${i % 2 ? 'bg-cyan shadow-[0_0_14px_var(--cyan)]' : 'bg-magenta shadow-[0_0_14px_var(--magenta)]'}`}
            />
          </div>
        ))}
      </div>

      <div data-content className="absolute inset-0 flex flex-col">
        <BootTunnel speedRef={speedRef} glitchRef={glitchRef} still={reduced} className="absolute inset-0 h-full w-full" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(5,5,8,0.85)_100%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.04)_0_1px,transparent_1px_3px)]" />
        {!reduced && <div aria-hidden="true" className="scan-sweep opacity-35" />}

        {/* HUD corners */}
        {['left-4 top-4 border-l-2 border-t-2', 'right-4 top-4 border-r-2 border-t-2', 'bottom-4 left-4 border-b-2 border-l-2', 'bottom-4 right-4 border-b-2 border-r-2'].map((c) => (
          <span key={c} data-corner aria-hidden="true" className={`absolute h-6 w-6 border-neon ${c}`} />
        ))}

        <div data-side className="shell relative flex items-start justify-between gap-6 pt-10">
          <div data-boot-head className="hud">
            <p className="text-neon">JK//BIOS v2.6.0 — NEON GRID KERNEL</p>
            <p className="mt-1">(c) {new Date().getFullYear()} {site.name.toUpperCase()} · ALL SYSTEMS NOMINAL</p>
          </div>
          <button
            ref={skipRef}
            type="button"
            onClick={() => exitRef.current()}
            className="hud border border-line-strong bg-void/60 px-3 py-2 text-fg transition-colors hover:border-neon hover:text-neon"
          >
            Skip intro [esc]
          </button>
        </div>

        <div data-side className="shell relative mt-8 flex items-start justify-between gap-8">
          <ol className="space-y-1.5 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-dim md:text-[0.78rem]" aria-live="polite">
            {tasks.map((t, i) => (
              <li key={t.id} data-log className="flex w-[min(30rem,calc(100vw-2*var(--gutter)))] items-center gap-3">
                <span className="text-line-strong">{String(i).padStart(2, '0')}</span>
                <span className="text-fg-2">&gt; {t.label}</span>
                <span aria-hidden="true" className="flex-1 overflow-hidden whitespace-nowrap text-line-strong">
                  ..................................................
                </span>
                <span className={states[t.id] === 'done' ? 'text-ok' : states[t.id] === 'deferred' ? 'text-neon' : 'text-dim'}>
                  [{states[t.id] === 'done' ? ' OK ' : states[t.id] === 'deferred' ? 'SKIP' : ' .. '}]
                </span>
              </li>
            ))}
            {CHATTER.map((c, i) => (
              <li key={c} data-log className="hidden w-[min(30rem,calc(100vw-2*var(--gutter)))] items-center gap-3 sm:flex">
                <span className="text-line-strong">{String(tasks.length + i).padStart(2, '0')}</span>
                <span className="text-fg-2">&gt; {c}</span>
                <span aria-hidden="true" className="flex-1 overflow-hidden whitespace-nowrap text-line-strong">
                  ..................................................
                </span>
                <span className="text-cyan">[ ** ]</span>
              </li>
            ))}
          </ol>
          <pre
            ref={hexRef}
            data-hex
            aria-hidden="true"
            className="hidden font-mono text-[0.68rem] leading-[1.45] tracking-[0.08em] text-cyan/60 xl:block"
          />
        </div>

        <div className="relative grid flex-1 place-items-center px-[var(--gutter)]">
          <div data-glitch-out className="flex flex-col items-center text-center will-change-transform">
            <div className="relative h-[clamp(4.5rem,13vw,9.5rem)] aspect-[54/52]" aria-hidden="true">
              {(['c', 'm'] as const).map((g) => (
                <svg key={g} data-ghost={g} viewBox="0 0 54 52" fill="none" className="absolute inset-0 h-full w-full opacity-80 mix-blend-screen">
                  {Object.values(MONOGRAM_PATHS).map((d) => (
                    <path key={d} data-draw d={d} stroke={g === 'c' ? 'var(--cyan)' : 'var(--magenta)'} strokeWidth={3.2} strokeLinecap="square" />
                  ))}
                </svg>
              ))}
              <svg viewBox="0 0 54 52" fill="none" className="absolute inset-0 h-full w-full drop-shadow-[0_0_10px_rgba(236,235,245,0.35)]">
                {Object.values(MONOGRAM_PATHS).map((d) => (
                  <path key={d} data-draw d={d} stroke="var(--fg)" strokeWidth={3.2} strokeLinecap="square" strokeLinejoin="miter" />
                ))}
                <rect data-node x="34" y="23.5" width="5" height="5" fill="var(--neon)" className="drop-shadow-[0_0_6px_var(--neon)]" />
              </svg>
            </div>
            <p
              ref={nameRef}
              aria-label={site.name}
              className="display glitch mt-6 whitespace-nowrap text-[clamp(1.9rem,7.2vw,6.5rem)] leading-[0.85] text-fg"
              data-text={site.name.toUpperCase()}
              data-live="true"
            >
              &nbsp;
            </p>
            <p data-role className="hud mt-4 text-cyan">
              &gt; {site.role} // identity verified
            </p>
          </div>

          {/* exit stamp */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
            <p
              data-granted
              className="chamfer invisible bg-neon px-[0.45em] py-[0.18em] text-neon-ink shadow-[0_0_60px_var(--neon)] [--chamfer:18px]"
            >
              <span data-granted-text className="display block whitespace-nowrap text-[clamp(1.6rem,6.4vw,5.6rem)] leading-[0.9]">
                &nbsp;
              </span>
            </p>
          </div>
        </div>

        <div data-side data-foot className="shell relative flex items-end justify-between gap-6 pb-10">
          <div className="w-full max-w-[24rem]">
            <p className="hud flex justify-between">
              <span>Boot progress</span>
              <span className="text-fg-2">
                {doneCount}/{tasks.length} modules
              </span>
            </p>
            <div className="relative mt-2 h-3 w-full">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(to_right,var(--line)_0_8px,transparent_8px_11px)]" />
              <div
                ref={barRef}
                className="absolute inset-0 bg-[repeating-linear-gradient(to_right,var(--neon)_0_8px,transparent_8px_11px)]"
                style={{ clipPath: 'inset(0 100% 0 0)' }}
              />
            </div>
          </div>
          <p
            ref={countWrapRef}
            className="display-narrow glitch tabular text-[clamp(4rem,14vw,12rem)] leading-[0.8] text-neon neon-glow"
            data-text="000"
            data-live="true"
            aria-hidden="true"
          >
            <span ref={countRef}>000</span>
            <span className="align-top text-[0.35em]">%</span>
          </p>
        </div>

        <div data-flash aria-hidden="true" className="pointer-events-none absolute inset-0 bg-fg opacity-0" />
      </div>
      <EscToSkip onSkip={() => exitRef.current()} />
    </div>
  )
}

function EscToSkip({ onSkip }: { onSkip: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onSkip()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onSkip])
  return null
}
