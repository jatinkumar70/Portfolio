import { Link } from 'react-router-dom'
import { ArrowUp, ArrowUpRight } from 'lucide-react'
import { primaryNav } from '@/data/navigation'
import { site } from '@/data/site'
import { MONOGRAM_PATHS } from '@/components/navigation/monogram-paths'
import { DrawOnScroll } from '@/components/animations/Reveal'
import { setMotionOverride, useReducedMotion } from '@/lib/motion-preferences'
import { useSmoothScroll } from '@/lib/smooth-scroll'
import { usePreloader } from '@/components/preloader/preloader-state'

export function Footer() {
  const year = new Date().getFullYear()
  const reduced = useReducedMotion()
  const { scrollTo } = useSmoothScroll()
  const { replay } = usePreloader()

  return (
    <footer className="relative border-t border-line bg-porcelain">
      <div className="shell grid-12 gap-y-12 pb-10 pt-16 md:pt-24">
        <div className="col-span-4 md:col-span-5">
          <DrawOnScroll className="w-[clamp(6rem,14vw,11rem)] text-ink">
            <svg viewBox="-4 -4 62 60" fill="none" aria-hidden="true" className="w-full overflow-visible">
              <g stroke="var(--line-strong)" strokeWidth="0.4">
                {[0, 13, 26, 39, 52].map((v) => (
                  <path key={`h${v}`} d={`M-4 ${v} H58`} data-draw />
                ))}
                {[0, 13.5, 27, 40.5, 54].map((v) => (
                  <path key={`v${v}`} d={`M${v} -4 V56`} data-draw />
                ))}
              </g>
              <path d={MONOGRAM_PATHS.j} stroke="currentColor" strokeWidth="3.2" strokeLinecap="square" data-draw />
              <path d={MONOGRAM_PATHS.kStem} stroke="currentColor" strokeWidth="3.2" strokeLinecap="square" data-draw />
              <path d={MONOGRAM_PATHS.kArms} stroke="currentColor" strokeWidth="3.2" strokeLinecap="square" data-draw />
              <rect x="34" y="23.5" width="5" height="5" fill="var(--accent)" data-draw-fade />
            </svg>
          </DrawOnScroll>
          <p className="display mt-8 text-h2">{site.name}</p>
          <p className="mt-2 text-[0.95rem] text-charcoal">{site.role}</p>
          <p className="meta mt-6 max-w-[40ch]">{site.tagline}</p>
        </div>

        <nav aria-label="Footer" className="col-span-2 md:col-span-2 md:col-start-7">
          <p className="eyebrow">Index</p>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link to="/" className="link-u text-[0.95rem]" data-cursor="link">
                Home
              </Link>
            </li>
            {primaryNav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="link-u text-[0.95rem]" data-cursor="link">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-2 md:col-span-2">
          <p className="eyebrow">Elsewhere</p>
          <ul className="mt-4 space-y-2.5">
            <li>
              <a href={site.contact.linkedin} target="_blank" rel="noreferrer" className="link-u text-[0.95rem]" data-cursor="link">
                LinkedIn <ArrowUpRight size={13} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a href={site.contact.github} target="_blank" rel="noreferrer" className="link-u text-[0.95rem]" data-cursor="link">
                GitHub <ArrowUpRight size={13} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${site.contact.email}`} className="link-u text-[0.95rem]" data-cursor="link">
                Email
              </a>
            </li>
            <li>
              <a href={site.resume.href} download={site.resume.fileName} className="link-u text-[0.95rem]" data-cursor="link">
                Resume (PDF)
              </a>
            </li>
          </ul>
        </div>

        <div className="col-span-4 md:col-span-2">
          <p className="eyebrow">Settings</p>
          <ul className="mt-4 space-y-2.5">
            <li>
              <button type="button" className="link-u text-left text-[0.95rem]" onClick={replay} data-cursor="link">
                Replay intro
              </button>
            </li>
            <li>
              <button
                type="button"
                className="link-u text-left text-[0.95rem]"
                aria-pressed={reduced}
                onClick={() => setMotionOverride(reduced ? 'full' : 'reduce')}
                data-cursor="link"
              >
                Reduce motion: {reduced ? 'on' : 'off'}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="shell flex flex-wrap items-center justify-between gap-4 border-t border-line py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <p className="meta">
          © {year} {site.name} · Designed &amp; engineered by hand
        </p>
        <button
          type="button"
          onClick={() => scrollTo(0)}
          className="group meta flex items-center gap-2 text-ink"
          data-cursor="link"
        >
          Back to top
          <span className="grid h-8 w-8 place-items-center border border-ink transition-colors group-hover:bg-ink group-hover:text-paper">
            <ArrowUp size={14} aria-hidden="true" />
          </span>
        </button>
      </div>
    </footer>
  )
}
