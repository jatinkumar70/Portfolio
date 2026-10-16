import { useLocation } from 'react-router-dom'
import { Seo } from '@/components/layout/Seo'
import { ButtonLink } from '@/components/buttons/Button'
import { DrawOnScroll } from '@/components/animations/Reveal'

export default function NotFoundPage() {
  const { pathname } = useLocation()
  return (
    <>
      <Seo title="Not found" description="This page does not exist." />
      <meta name="robots" content="noindex" />
      <section className="shell flex min-h-[100svh] flex-col justify-center pb-20 pt-[calc(var(--header-h)+3rem)]">
        <p className="eyebrow">Error 404 · {pathname}</p>
        <div className="mt-8 grid items-end gap-10 md:grid-cols-[1fr_auto]">
          <h1 className="display text-mega">
            Off the
            <br />
            grid<span className="text-accent">.</span>
          </h1>
          <DrawOnScroll className="w-40 md:w-56">
            <svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
              <path data-draw d="M10 60 H110 M60 10 V110" stroke="var(--line-strong)" />
              <circle data-draw cx="60" cy="60" r="40" stroke="var(--ink)" />
              <path data-draw d="M88 32 L104 16" stroke="var(--accent)" strokeWidth="2" />
            </svg>
          </DrawOnScroll>
        </div>
        <p className="mt-8 max-w-[44ch] text-charcoal">This route doesn&apos;t exist — the index below does.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink to="/" variant="solid">
            Back home
          </ButtonLink>
          <ButtonLink to="/#work">Selected work</ButtonLink>
        </div>
      </section>
    </>
  )
}
