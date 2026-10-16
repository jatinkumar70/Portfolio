import { useId, useRef, useState, type FormEvent } from 'react'
import { ArrowUpRight, Mail } from 'lucide-react'
import { site } from '@/data/site'
import { Seo } from '@/components/layout/Seo'
import { Eyebrow } from '@/components/typography/Typography'
import { SplitReveal, Reveal } from '@/components/animations/Reveal'
import { Button, CopyButton, ButtonAnchor } from '@/components/buttons/Button'
import { useLocalTime } from '@/hooks/useLocalTime'
import { cn } from '@/lib/utils'

const TOPICS = ['Full-time role', 'Contract / freelance', 'Product collaboration', 'Creative project', 'Just saying hello'] as const

interface Fields {
  name: string
  email: string
  topic: (typeof TOPICS)[number]
  message: string
}

type Errors = Partial<Record<keyof Fields, string>>

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'mailto' }
  | { kind: 'error'; message: string }

function validate(f: Fields): Errors {
  const e: Errors = {}
  if (!f.name.trim()) e.name = 'Please add your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Please enter a valid email address.'
  if (f.message.trim().length < 10) e.message = 'A sentence or two helps — at least 10 characters.'
  return e
}

function composeMailto(f: Fields) {
  const subject = `${f.topic} — from ${f.name}`
  const body = `${f.message}\n\n— ${f.name}\n${f.email}`
  return `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/**
 * Contact form. With VITE_CONTACT_ENDPOINT configured it POSTs JSON and only
 * reports success on a 2xx response. Without it, it composes an email in the
 * visitor's mail app — and says exactly that, never a fake "sent".
 */
function ContactForm() {
  const uid = useId()
  const [fields, setFields] = useState<Fields>({ name: '', email: '', topic: TOPICS[0], message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const formRef = useRef<HTMLFormElement>(null)
  const endpoint = site.formEndpoint

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => {
    setFields((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const errs = validate(fields)
    setErrors(errs)
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0]
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    if (!endpoint) {
      window.location.href = composeMailto(fields)
      setStatus({ kind: 'mailto' })
      return
    }
    setStatus({ kind: 'sending' })
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(fields),
      })
      if (!res.ok) throw new Error(`The form service responded with ${res.status}.`)
      setStatus({ kind: 'sent' })
      setFields({ name: '', email: '', topic: TOPICS[0], message: '' })
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'The message could not be sent.' })
    }
  }

  const field = 'mt-2 block w-full border-0 border-b border-ink bg-transparent px-0 py-3 text-[1.05rem] text-ink outline-none transition-colors placeholder:text-muted focus:border-accent focus-visible:outline-none'

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-describedby={`${uid}-mode`} className="space-y-9">
      <p id={`${uid}-mode`} className="meta">
        {endpoint ? 'Messages are sent through the configured form service.' : 'No form backend is configured: sending opens your email app with this message pre-filled.'}
      </p>

      <div className="grid gap-9 md:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-name`} className="eyebrow text-ink">
            Your name
          </label>
          <input
            id={`${uid}-name`}
            name="name"
            autoComplete="name"
            value={fields.name}
            onChange={(e) => set('name', e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${uid}-name-err` : undefined}
            className={field}
            placeholder="Ada Lovelace"
          />
          {errors.name && (
            <p id={`${uid}-name-err`} className="mt-2 text-[0.85rem] text-danger">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${uid}-email`} className="eyebrow text-ink">
            Email
          </label>
          <input
            id={`${uid}-email`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={fields.email}
            onChange={(e) => set('email', e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${uid}-email-err` : undefined}
            className={field}
            placeholder="you@company.com"
          />
          {errors.email && (
            <p id={`${uid}-email-err`} className="mt-2 text-[0.85rem] text-danger">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <fieldset>
        <legend className="eyebrow text-ink">What&apos;s it about?</legend>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {TOPICS.map((t) => (
            <label
              key={t}
              className={cn(
                'flex min-h-10 cursor-pointer items-center border px-3 font-mono text-[0.72rem] uppercase tracking-[0.05em] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)]',
                fields.topic === t ? 'border-ink bg-ink text-paper' : 'border-line-strong text-charcoal hover:border-ink',
              )}
            >
              <input type="radio" name="topic" value={t} checked={fields.topic === t} onChange={() => set('topic', t)} className="sr-only" />
              {t}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor={`${uid}-message`} className="eyebrow text-ink">
          Message
        </label>
        <textarea
          id={`${uid}-message`}
          name="message"
          rows={5}
          value={fields.message}
          onChange={(e) => set('message', e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? `${uid}-message-err` : undefined}
          className={cn(field, 'resize-y')}
          placeholder="What are you building, and where could I help?"
        />
        {errors.message && (
          <p id={`${uid}-message-err`} className="mt-2 text-[0.85rem] text-danger">
            {errors.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <Button type="submit" variant="solid" arrow="right" disabled={status.kind === 'sending'}>
          {status.kind === 'sending' ? 'Sending…' : endpoint ? 'Send message' : 'Compose email'}
        </Button>
        <div role="status" aria-live="polite" className="text-[0.92rem]">
          {status.kind === 'sent' && <p className="text-ok">Thank you — your message was delivered. I&apos;ll reply by email.</p>}
          {status.kind === 'mailto' && (
            <p className="max-w-[46ch] text-charcoal">
              Your email app should now be open with the message ready to send. Nothing has been sent yet. If no app opened, write to{' '}
              <a className="link-u text-ink" href={`mailto:${site.contact.email}`}>
                {site.contact.email}
              </a>
              .
            </p>
          )}
          {status.kind === 'error' && (
            <p className="max-w-[46ch] text-danger">
              {status.message} Your message was not sent — please email{' '}
              <a className="link-u" href={`mailto:${site.contact.email}`}>
                {site.contact.email}
              </a>{' '}
              directly.
            </p>
          )}
        </div>
      </div>
    </form>
  )
}

export default function ContactPage() {
  const time = useLocalTime(site.location.timeZone)
  return (
    <>
      <Seo title="Contact" description="Start a conversation with Jatin Kumar about frontend engineering, product development, complex interfaces or creative digital experiences." />
      <header className="shell pt-[calc(var(--header-h)+clamp(2.5rem,7vw,6rem))]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
          <Eyebrow index="04">Contact</Eyebrow>
          {site.availability.show && (
            <p className="meta flex items-center gap-2 text-ink">
              <span className="h-2 w-2 bg-accent" aria-hidden="true" />
              {site.availability.label}
            </p>
          )}
        </div>
        <SplitReveal as="h1" immediate className="display mt-10 text-mega md:mt-14">
          Have something
          <br />
          <span className="md:pl-[10vw]">interesting</span>
          <br />
          to build<span className="text-accent">?</span>
        </SplitReveal>
        <p className="mt-10 max-w-[52ch] text-lead text-charcoal">
          I&apos;m always glad to talk about frontend engineering, product development, complex interfaces and creative digital
          experiences — a role, a project, or an idea that needs a sounding board.
        </p>
      </header>

      <section aria-label="Ways to reach me" className="shell section">
        <div className="grid-12 gap-y-16">
          <Reveal stagger={0.08} className="col-span-4 space-y-10 md:col-span-5">
            <div className="border-t border-ink pt-5">
              <p className="eyebrow">Email — fastest</p>
              <a href={`mailto:${site.contact.email}`} className="link-u mt-3 break-all text-[clamp(1.25rem,2.2vw,1.9rem)] font-bold tracking-tight" data-cursor="link">
                <Mail size={20} aria-hidden="true" />
                {site.contact.email}
              </a>
              <div className="mt-4">
                <CopyButton value={site.contact.email} label="Copy email" />
              </div>
            </div>
            <div className="border-t border-ink pt-5">
              <p className="eyebrow">Elsewhere</p>
              <ul className="mt-3 divide-y divide-line">
                {[
                  { label: 'LinkedIn', href: site.contact.linkedin, note: 'Professional profile' },
                  { label: 'GitHub', href: site.contact.github, note: 'Code' },
                ].map((l) => (
                  <li key={l.label}>
                    <a href={l.href} target="_blank" rel="noreferrer" className="group flex min-h-14 items-center justify-between gap-4 py-3" data-cursor="link">
                      <span>
                        <span className="display block text-h3 transition-transform duration-500 group-hover:translate-x-2">{l.label}</span>
                        <span className="meta">{l.note}</span>
                      </span>
                      <ArrowUpRight size={20} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-ink pt-5">
              <p className="eyebrow">Resume</p>
              <div className="mt-4">
                <ButtonAnchor href={site.resume.href} download={site.resume.fileName} arrow="none">
                  Download PDF
                </ButtonAnchor>
              </div>
            </div>
            <div className="border-t border-ink pt-5">
              <p className="eyebrow">Where &amp; when</p>
              <p className="mt-3 text-[1rem] text-charcoal">
                {site.location.label}
                {time && (
                  <>
                    <br />
                    <span className="meta">
                      Local time {time} {site.location.tzLabel} (calculated in your browser)
                    </span>
                  </>
                )}
              </p>
            </div>
          </Reveal>

          <div className="col-span-4 md:col-span-6 md:col-start-7">
            <div className="border-t border-ink pt-5">
              <h2 className="display text-h2">Write a note</h2>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
