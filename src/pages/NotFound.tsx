import { useLocation } from 'react-router-dom'
import { Seo } from '@/components/layout/Seo'
import { ButtonLink } from '@/components/buttons/Button'
import { Decrypt } from '@/components/animations/Reveal'

export default function NotFoundPage() {
  const { pathname } = useLocation()
  return (
    <>
      <Seo title="Not found" description="This page does not exist." />
      <meta name="robots" content="noindex" />
      <section className="shell relative flex min-h-[100svh] flex-col justify-center pb-20 pt-[calc(var(--header-h)+3rem)]">
        <p className="hud text-magenta">
          ERR_404 // <span className="normal-case">{pathname}</span>
        </p>
        <h1 className="display mt-8 text-[clamp(4rem,16vw,16rem)] leading-[0.8]">
          <span className="glitch block text-neon neon-glow" data-text="SIGNAL" data-live="true">
            SIGNAL
          </span>
          <span className="glitch stroke block [--stroke:var(--fg)]" data-text="LOST" data-live="true">
            LOST
          </span>
        </h1>
        <p className="hud mt-8 max-w-[44ch] normal-case tracking-[0.04em] text-fg-2">
          <Decrypt text="> This node doesn't exist on the grid. The index below does." />
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink to="/" variant="solid">
            Back to index
          </ButtonLink>
          <ButtonLink to="/#work">Selected work</ButtonLink>
        </div>
      </section>
    </>
  )
}
