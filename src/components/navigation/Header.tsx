import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { primaryNav } from '@/data/navigation'
import { site } from '@/data/site'
import { useLocalTime } from '@/hooks/useLocalTime'
import { cn } from '@/lib/utils'
import { Monogram } from './Monogram'
import { MenuOverlay } from './MenuOverlay'
import { ScrambleText } from '@/components/animations/ScrambleText'

/**
 * Fixed header. Transparent at the top of a page, then a solid porcelain bar
 * with a hairline. It tucks away while scrolling down and returns on scroll up
 * — but never while it holds keyboard focus or the menu is open.
 */
export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const time = useLocalTime(site.location.timeZone)
  const { pathname } = useLocation()

  useEffect(() => {
    let lastY = window.scrollY
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        setScrolled(y > 24)
        const focusedInside = headerRef.current?.contains(document.activeElement)
        if (!focusedInside) setHidden(y > 320 && y > lastY + 2)
        if (y < lastY - 2) setHidden(false)
        lastY = y
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Close the menu whenever the route changes (adjusting state during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(false)
  }

  return (
    <>
      <header
        ref={headerRef}
        onFocus={() => setHidden(false)}
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-500 ease-[var(--ease-out)]',
          'border-b pt-[env(safe-area-inset-top)]',
          scrolled ? 'border-line bg-porcelain' : 'border-transparent bg-transparent',
          hidden && !open && '-translate-y-full',
        )}
      >
        <div className="shell flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link to="/" className="group flex items-center gap-3" data-cursor="link" aria-label={`${site.name} — home`}>
            <Monogram className="h-7 transition-transform duration-500 group-hover:-rotate-6" title="" />
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-[0.95rem] font-bold uppercase tracking-tight">{site.name}</span>
              <span className="meta mt-1 text-[0.65rem]">{site.role}</span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {primaryNav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end
                    data-cursor="link"
                    className={({ isActive }) =>
                      cn('link-u group py-2 text-[0.86rem] font-medium tracking-tight', isActive ? 'text-ink' : 'text-charcoal')
                    }
                  >
                    <span className="mr-1.5 font-mono text-[0.62rem] text-muted-text">{item.index}</span>
                    <ScrambleText text={item.label} />
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-5">
            {time && (
              <p className="meta hidden xl:block" aria-label={`Local time for Jatin: ${time} ${site.location.tzLabel}`}>
                <span className="mr-2 inline-block h-1.5 w-1.5 translate-y-[-1px] bg-accent" aria-hidden="true" />
                {site.location.tzLabel} {time}
              </p>
            )}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="site-menu"
              data-cursor="link"
              className="group relative flex h-11 min-w-11 items-center gap-3 px-1"
            >
              <span className="font-mono text-[0.72rem] uppercase tracking-[0.08em]">{open ? 'Close' : 'Menu'}</span>
              <span aria-hidden="true" className="relative block h-3 w-6">
                <span
                  className={cn(
                    'absolute left-0 top-0 h-px w-full bg-ink transition-transform duration-500 ease-[var(--ease-out)]',
                    open ? 'translate-y-1.5 rotate-45' : 'group-hover:translate-x-1',
                  )}
                />
                <span
                  className={cn(
                    'absolute bottom-0 left-0 h-px w-full bg-ink transition-transform duration-500 ease-[var(--ease-out)]',
                    open ? '-translate-y-1.5 -rotate-45' : 'w-2/3 group-hover:w-full',
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>
      <MenuOverlay open={open} onClose={() => setOpen(false)} returnFocusRef={toggleRef} />
    </>
  )
}
