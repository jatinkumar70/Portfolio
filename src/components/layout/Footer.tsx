import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUp, ArrowUpRight } from 'lucide-react'
import { primaryNav } from '@/data/navigation'
import { site } from '@/data/site'
import { setMotionOverride, useReducedMotion } from '@/lib/motion-preferences'
import { useSmoothScroll } from '@/lib/smooth-scroll'
import { usePreloader } from '@/components/preloader/preloader-state'
import { gsap, SplitText, useGSAP, motionDisabled } from '@/lib/animation'
import { useLocalTime } from '@/hooks/useLocalTime'

export function Footer() {
  const year = new Date().getFullYear()
  const reduced = useReducedMotion()
  const { scrollTo } = useSmoothScroll()
  const { replay } = usePreloader()
  const time = useLocalTime(site.location.timeZone)
  const ref = useRef<HTMLElement>(null)

  // The sign-off name rises letter by letter as the footer comes up.
  useGSAP(
    () => {
      const el = ref.current?.querySelector<HTMLElement>('[data-signoff]')
      if (!el || motionDisabled()) return
      const split = SplitText.create(el, { type: 'chars', mask: 'chars' })
      gsap.fromTo(
        split.chars,
        { yPercent: 100 },
        { yPercent: 0, ease: 'none', stagger: 0.04, scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: 0.5 } },
      )
      return () => split.revert()
    },
    { scope: ref },
  )

  const linkCls = 'link-u text-[0.95rem] text-fg-2'

  return (
    <footer ref={ref} className="relative overflow-hidden border-t border-line bg-void">
      <div className="shell grid-12 gap-y-12 pb-10 pt-16 md:pt-24">
        <div className="col-span-4 md:col-span-5">
          <p className="hud text-neon">&gt; end of transmission_</p>
          <p className="mt-6 font-tech text-h2 font-bold uppercase leading-none">{site.name}</p>
          <p className="mt-2 text-[0.95rem] text-dim">{site.role}</p>
          <p className="hud mt-6 max-w-[40ch] text-cyan">{site.tagline}</p>
        </div>

        <nav aria-label="Footer" className="col-span-2 md:col-span-2 md:col-start-7">
          <p className="hud">Index</p>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link to="/" className={linkCls} data-cursor="link">
                Home
              </Link>
            </li>
            {primaryNav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className={linkCls} data-cursor="link">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-2 md:col-span-2">
          <p className="hud">Uplinks</p>
          <ul className="mt-4 space-y-2.5">
            <li>
              <a href={site.contact.linkedin} target="_blank" rel="noreferrer" className={linkCls} data-cursor="link">
                LinkedIn <ArrowUpRight size={13} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a href={site.contact.github} target="_blank" rel="noreferrer" className={linkCls} data-cursor="link">
                GitHub <ArrowUpRight size={13} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${site.contact.email}`} className={linkCls} data-cursor="link">
                Email
              </a>
            </li>
            <li>
              <a href={site.resume.href} download={site.resume.fileName} className={linkCls} data-cursor="link">
                Resume (PDF)
              </a>
            </li>
          </ul>
        </div>

        <div className="col-span-4 md:col-span-2">
          <p className="hud">System</p>
          <ul className="mt-4 space-y-2.5">
            <li>
              <button type="button" className={`${linkCls} text-left`} onClick={replay} data-cursor="link">
                Replay boot sequence
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`${linkCls} text-left`}
                aria-pressed={reduced}
                onClick={() => setMotionOverride(reduced ? 'full' : 'reduce')}
                data-cursor="link"
              >
                Reduce motion: <span className={reduced ? 'text-ok' : 'text-dim'}>{reduced ? 'on' : 'off'}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="shell" aria-hidden="true">
        <p data-signoff className="display stroke select-none whitespace-nowrap text-[9.4vw] leading-[0.8] [--stroke:var(--line-strong)]">
          JATIN<span className="text-neon [-webkit-text-stroke:0]">.</span>KUMAR
        </p>
      </div>

      <div className="shell flex flex-wrap items-center justify-between gap-4 border-t border-line py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <p className="hud">
          © {year} {site.name} · built by hand · {site.location.tzLabel} {time}
        </p>
        <button type="button" onClick={() => scrollTo(0)} className="group hud flex items-center gap-3 text-fg" data-cursor="link">
          Back to top
          <span className="chamfer grid h-9 w-9 place-items-center border border-line-strong bg-panel transition-colors group-hover:bg-neon group-hover:text-neon-ink">
            <ArrowUp size={14} aria-hidden="true" />
          </span>
        </button>
      </div>
    </footer>
  )
}
