import { useEffect, useRef, useState, type RefObject } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { primaryNav } from '@/data/navigation'
import { site } from '@/data/site'
import { gsap, motionDisabled, ease } from '@/lib/animation'
import { useSmoothScroll } from '@/lib/smooth-scroll'
import { Monogram } from './Monogram'

/**
 * Fullscreen menu: an ink panel wiping down from the header line, with large
 * indexed links rising out of masks. Accessible modal: focus is trapped,
 * Escape closes, focus returns to the toggle, background scroll is locked.
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
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const { lock, unlock } = useSmoothScroll()

  if (open && !mounted) setMounted(true)

  // Enter / exit choreography
  useEffect(() => {
    const panel = panelRef.current
    if (!mounted || !panel) return
    const links = panel.querySelectorAll('[data-menu-line]')
    const fades = panel.querySelectorAll('[data-menu-fade]')
    tlRef.current?.kill()

    if (open) {
      lock()
      const tl = gsap.timeline()
      if (motionDisabled()) {
        tl.set(panel, { clipPath: 'inset(0 0 0% 0)', autoAlpha: 1 }).set([links, fades], { yPercent: 0, y: 0, autoAlpha: 1 })
      } else {
        tl.fromTo(panel, { clipPath: 'inset(0 0 100% 0)', autoAlpha: 1 }, { clipPath: 'inset(0 0 0% 0)', duration: 0.85, ease: ease.inOut })
          .fromTo(links, { yPercent: 105 }, { yPercent: 0, duration: 1, stagger: 0.06, ease: ease.out }, '-=0.35')
          .fromTo(fades, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.05 }, '-=0.8')
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
      .to(links, { yPercent: -105, duration: 0.45, stagger: 0.03, ease: 'power3.in' })
      .to(panel, { clipPath: 'inset(100% 0 0% 0)', duration: 0.7, ease: ease.inOut }, '-=0.15')
  }, [open, mounted, lock, unlock, returnFocusRef])

  useEffect(() => () => void tlRef.current?.kill(), [])

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
      className="on-ink fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-ink text-paper"
      style={{ visibility: 'hidden' }}
    >
      <div className="shell flex h-[var(--header-h)] shrink-0 items-center justify-between pt-[env(safe-area-inset-top)]">
        <Link to="/" onClick={onClose} className="flex items-center gap-3" aria-label={`${site.name} — home`}>
          <Monogram className="h-7" title="" />
          <span className="font-display text-[0.95rem] font-bold uppercase tracking-tight">{site.name}</span>
        </Link>
        <button ref={closeRef} type="button" onClick={onClose} className="flex h-11 items-center gap-3 px-1" aria-label="Close menu">
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.08em]">Close</span>
          <span aria-hidden="true" className="relative block h-3 w-6">
            <span className="absolute left-0 top-1.5 h-px w-full rotate-45 bg-paper" />
            <span className="absolute left-0 top-1.5 h-px w-full -rotate-45 bg-paper" />
          </span>
        </button>
      </div>

      <div className="shell flex flex-1 flex-col justify-between gap-12 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 md:pt-10">
        <nav aria-label="Menu">
          <ul className="border-t border-paper/20">
            {primaryNav.map((item) => (
              <li key={item.to} className="border-b border-paper/20">
                <NavLink
                  to={item.to}
                  end
                  onClick={onClose}
                  className="group grid grid-cols-[2.5rem_1fr] items-center gap-x-4 py-3 md:grid-cols-[4rem_1fr_auto] md:py-4"
                >
                  {({ isActive }) => (
                    <>
                      <span className="font-mono text-[0.72rem] text-paper/55">{item.index}</span>
                      <span className="block overflow-hidden">
                        <span
                          data-menu-line
                          className="display block text-[clamp(2.4rem,9vw,7.5rem)] leading-[0.95] transition-[color,transform] duration-500 ease-[var(--ease-out)] group-hover:translate-x-3 group-hover:text-accent"
                        >
                          {item.label}
                          {isActive && (
                            <span className="ml-4 inline-block translate-y-[-0.6em] align-middle font-mono text-[0.7rem] font-normal normal-case tracking-normal text-accent">
                              ● current
                            </span>
                          )}
                        </span>
                      </span>
                      <span data-menu-fade className="col-start-2 meta text-paper/60 md:col-start-auto">
                        {item.description}
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div data-menu-fade className="grid gap-6 text-paper/80 sm:grid-cols-3">
          <div>
            <p className="eyebrow text-paper/50">Write</p>
            <a href={`mailto:${site.contact.email}`} className="link-u mt-2 break-all text-[0.95rem]">
              {site.contact.email}
            </a>
          </div>
          <div>
            <p className="eyebrow text-paper/50">Elsewhere</p>
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
            <p className="eyebrow text-paper/50">Resume</p>
            <a href={site.resume.href} download={site.resume.fileName} className="link-u mt-2 text-[0.95rem]">
              Download PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
