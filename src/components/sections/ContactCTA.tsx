import { Link } from 'react-router-dom'
import { site } from '@/data/site'
import { SplitReveal } from '@/components/animations/Reveal'
import { ButtonAnchor, ButtonLink, Magnetic } from '@/components/buttons/Button'
import { Eyebrow } from '@/components/typography/Typography'

/** Closing invitation used at the end of the homepage and every case study. */
export function ContactCTA({ index = '—', compact = false }: { index?: string; compact?: boolean }) {
  return (
    <section aria-labelledby="cta-title" className="shell py-[clamp(5rem,12vw,11rem)]">
      <div className="border-t border-ink pt-6">
        <Eyebrow index={index}>Next step</Eyebrow>
        <div className="mt-10 grid gap-10 md:mt-16 lg:grid-cols-[1fr_auto] lg:items-end">
          <SplitReveal as="h2" id="cta-title" className={compact ? 'display text-h1' : 'display text-display'}>
            Have something
            <br />
            interesting <span className="text-accent">to build?</span>
          </SplitReveal>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Magnetic>
              <ButtonLink to="/contact" variant="solid">
                Let&apos;s talk
              </ButtonLink>
            </Magnetic>
            <ButtonAnchor href={`mailto:${site.contact.email}`} arrow="external">
              {site.contact.email}
            </ButtonAnchor>
          </div>
        </div>
        <p className="mt-10 max-w-[52ch] text-[1.02rem] text-charcoal">
          Frontend engineering, product development, complex interfaces or a creative digital experience — I&apos;m happy to talk it
          through. Or{' '}
          <Link to="/about" className="link-u text-ink" data-cursor="link">
            read the longer story
          </Link>
          .
        </p>
      </div>
    </section>
  )
}
