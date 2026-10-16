import { useEffect, useRef, useState, type RefObject } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { primaryNav } from '@/data/navigation'
import { site } from '@/data/site'
import { gsap, motionDisabled, ease, GLYPHS } from '@/lib/animation'
import { useSmoothScroll } from '@/lib/smooth-scroll'
import { Monogram } from './Monogram'

const BARS = 6

/**
 * Fullscreen menu: six void bars servo in from alternating sides, then giant
 * links punch up out of masks. Hovering a link glitches it and flashes its
 * index huge in the background. Accessible modal: focus is trapped, Escape
 * closes, focus returns to the toggle, background scroll is locked.
 */
export function MenuOverlay({
  open,
  onClose,
  returnFocusRef,
}: {
  open: boolean
  onClose: () => void
  returnFocusRef: RefObject<HTMLButtonElement | null>
}) {
  const [mounted, setMounted] = useState(false)
  const [hover, setHover] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const ghostRef = useRef<HTMLSpanElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const { lock, unlock } = useSmoothScroll()

  if (open && !mounted) setMounted(true)

  // Enter / exit choreography
  useEffect(() => {
    const panel = panelRef.current
    if (!mounted || !panel) return
    const bars = panel.querySelectorAll('[data-bar]')
    const links = panel.querySelectorAll('[data-menu-line]')
    const fades = panel.querySelectorAll('[data-menu-fade]')
    tlRef.current?.kill()

    if (open) {
      lock()
      const tl = gsap.timeline()
      tl.set(panel, { autoAlpha: 1 })
      if (motionDisabled()) {
        tl.set(bars, { xPercent: 0 }).set([links, fades], { yPercent: 0, autoAlpha: 1 })
      } else {
        tl.fromTo(bars, { xPercent: (i: number) => (i % 2 ? 101 : -101) }, { xPercent: 0, duration: 0.7, stagger: 0.04, ease: ease.servo })
          .fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.07, ease: ease.out }, '-=0.25')
          .fromTo(fades, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, stagger: 0.05, ease: 'steps(4)' }, '-=0.6')
      }
      tlRef.current = tl
      requestAnimationFrame(() => closeRef.current?.focus())
      return
    }

    // closing
    const done = () => {
      setMounted(false)
      unlock()
      returnFocusRef.current?.focus({ preventScroll: true })
    }
    if (motionDisabled()) {
      done()
      return
    }
    tlRef.current = gsap
      .timeline({ onComplete: done })
      .to([links, fades], { autoAlpha: 0, duration: 0.2, ease: 'steps(3)' })
      .to(bars, { xPercent: (i: number) => (i % 2 ? -101 : 101), duration: 0.55, stagger: 0.03, ease: ease.servo }, '-=0.05')
  }, [open, mounted, lock, unlock, returnFocusRef])

  useEffect(() => () => void tlRef.current?.kill(), [])

  // Ghost index flashes on hover
  useEffect(() => {
    const g = ghostRef.current
    if (!g || motionDisabled()) return
    if (hover) gsap.to(g, { duration: 0.5, scrambleText: { text: hover, chars: GLYPHS, speed: 1 }, autoAlpha: 1 })
    else gsap.to(g, { autoAlpha: 0, duration: 0.3 })
  }, [hover])

  // Escape + focus trap
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusables = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!mounted) return null

  return (
    <div
      ref={panelRef}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      data-lenis-prevent
      className="fixed inset-0 z-[60] flex flex-col overflow-y-auto text-fg"
      style={{ visibility: 'hidden' }}
    >
      <div aria-hidden="true" className="fixed inset-0 flex flex-col">
        {Array.from({ length: BARS }, (_, i) => (
          <div key={i} data-bar className="relative flex-1 bg-void">
            <span className="absolute inset-x-0 bottom-0 h-px bg-line" />
          </div>
        ))}
      </div>
      <span
        ref={ghostRef}
        aria-hidden="true"
        className="display-narrow stroke pointer-events-none fixed bottom-[-0.12em] right-[-0.04em] text-[42vw] leading-none opacity-0 [--stroke:var(--line-strong)]"
      />

      <div className="relative shell flex h-[var(--header-h)] shrink-0 items-center justify-between pt-[env(safe-area-inset-top)]">
        <Link to="/" onClick={onClose} className="flex items-center gap-3" aria-label={`${site.name} — home`}>
          <Monogram className="h-7" title="" />
          <span className="font-mono text-[0.8rem] font-semibold uppercase tracking-[0.18em]">Jatin.Kumar</span>
        </Link>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="chamfer flex h-11 items-center gap-3 border border-neon bg-panel/60 px-4 text-neon"
          aria-label="Close menu"
        >
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em]">Close</span>
          <span aria-hidden="true" className="relative block h-3 w-4">
            <span className="absolute left-0 top-1.5 h-[2px] w-full rotate-45 bg-neon" />
            <span className="absolute left-0 top-1.5 h-[2px] w-full -rotate-45 bg-neon" />
          </span>
        </button>
      </div>

      <div className="relative shell flex flex-1 flex-col justify-between gap-12 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 md:pt-10">
        <nav aria-label="Menu">
          <p data-menu-fade className="hud mb-4">
            &gt; select destination_
          </p>
          <ul className="border-t border-line-strong">
            {primaryNav.map((item) => (
              <li key={item.to} className="border-b border-line-strong">
                <NavLink
                  to={item.to}
                  end
                  onClick={onClose}
                  onPointerEnter={() => setHover(item.index)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(item.index)}
                  onBlur={() => setHover(null)}
                  className="group grid grid-cols-[2.5rem_1fr] items-center gap-x-4 py-3 md:grid-cols-[4rem_1fr_auto] md:py-4"
                >
                  {({ isActive }) => (
                    <>
                      <span className="font-mono text-[0.72rem] text-dim group-hover:text-neon">[{item.index}]</span>
                      <span className="block overflow-hidden">
                        <span
                          data-menu-line
                          data-text={item.label.toUpperCase()}
                          className="glitch display block text-[clamp(2.6rem,9.5vw,8rem)] leading-[0.95] transition-[color,transform] duration-300 ease-[var(--ease-servo)] group-hover:translate-x-4 group-hover:text-neon"
                        >
                          {item.label}
                        </span>
                      </span>
                      <span data-menu-fade className="col-start-2 hud md:col-start-auto">
                        {isActive ? <span className="text-ok">● current node</span> : item.description}
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div data-menu-fade className="grid gap-6 text-fg-2 sm:grid-cols-3">
          <div>
            <p className="hud">Comms</p>
            <a href={`mailto:${site.contact.email}`} className="link-u mt-2 break-all text-[0.95rem]">
              {site.contact.email}
            </a>
          </div>
          <div>
            <p className="hud">Uplinks</p>
            <div className="mt-2 flex gap-5 text-[0.95rem]">
              <a href={site.contact.linkedin} target="_blank" rel="noreferrer" className="link-u">
                LinkedIn <ArrowUpRight size={14} aria-hidden="true" />
              </a>
              <a href={site.contact.github} target="_blank" rel="noreferrer" className="link-u">
                GitHub <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div>
            <p className="hud">Dossier</p>
            <a href={site.resume.href} download={site.resume.fileName} className="link-u mt-2 text-[0.95rem]">
              Download resume (PDF)
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
