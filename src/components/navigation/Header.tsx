import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { primaryNav } from '@/data/navigation'
import { site } from '@/data/site'
import { useLocalTime } from '@/hooks/useLocalTime'
import { cn } from '@/lib/utils'
import { Monogram } from './Monogram'
import { MenuOverlay } from './MenuOverlay'
import { Decrypt } from '@/components/animations/Reveal'

/**
 * HUD bar. Transparent over the hero, then a blurred void panel with a neon
 * hairline. Tucks away while scrolling down and returns on scroll up — but
 * never while it holds keyboard focus or the menu is open.
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
          'fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-[transform,background-color,border-color] duration-500 ease-[var(--ease-servo)]',
          'border-b',
          scrolled ? 'border-line bg-void/75 backdrop-blur-md' : 'border-transparent bg-transparent',
          hidden && !open && '-translate-y-full',
        )}
      >
        <div className="shell flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link to="/" className="group flex items-center gap-3" data-cursor="link" aria-label={`${site.name} — home`} data-decrypt-host>
            <Monogram className="h-7 transition-transform duration-300 group-hover:skew-x-[-12deg]" title="" />
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-mono text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-fg">
                <Decrypt text="Jatin.Kumar" hover immediate />
              </span>
              <span className="hud mt-1.5 text-[0.6rem] text-dim">
                <span className="text-neon">SYS</span>/frontend_eng
              </span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {primaryNav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end
                    data-cursor="link"
                    data-decrypt-host
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-2 px-4 py-2 font-mono text-[0.74rem] uppercase tracking-[0.16em] transition-colors',
                        isActive ? 'text-neon' : 'text-fg-2 hover:text-fg',
                      )
                    }
                  >
                    <span className="text-[0.62rem] text-dim group-hover:text-cyan">{item.index}</span>
                    <Decrypt text={item.label} hover />
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-4 bottom-0 h-px origin-left scale-x-0 bg-neon transition-transform duration-300 group-hover:scale-x-100 group-aria-[current=page]:scale-x-100"
                    />
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-5">
            {time && (
              <p className="hud hidden items-center gap-2 xl:flex" aria-label={`Local time for ${site.name}: ${time} ${site.location.tzLabel}`}>
                <span className="pip" aria-hidden="true" />
                <span className="text-fg-2">{site.location.tzLabel}</span>
                <span className="tabular text-fg">{time}</span>
              </p>
            )}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="site-menu"
              data-cursor="link"
              className="chamfer group relative flex h-11 items-center gap-3 border border-line-strong bg-panel/60 px-4 transition-colors hover:border-neon"
            >
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] group-hover:text-neon">{open ? 'Close' : 'Menu'}</span>
              <span aria-hidden="true" className="flex h-3 w-5 flex-col justify-between">
                <span className="h-[2px] w-full bg-neon transition-transform duration-300 group-hover:translate-x-1" />
                <span className="h-[2px] w-3/5 bg-fg transition-all duration-300 group-hover:w-full" />
                <span className="h-[2px] w-4/5 bg-cyan transition-transform duration-300 group-hover:-translate-x-1" />
              </span>
            </button>
          </div>
        </div>
      </header>
      <MenuOverlay open={open} onClose={() => setOpen(false)} returnFocusRef={toggleRef} />
    </>
  )
}
