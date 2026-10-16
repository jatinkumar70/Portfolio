import { useId, useRef, useState, type FormEvent } from 'react'
import { ArrowUpRight, Mail } from 'lucide-react'
import { site } from '@/data/site'
import { Seo } from '@/components/layout/Seo'
import { SectionBar } from '@/components/typography/Typography'
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

  const field = 'mt-2 block w-full border border-line-strong bg-panel/70 px-4 py-3 font-mono text-[0.98rem] text-fg outline-none transition-[border-color,box-shadow] placeholder:text-dim/60 focus:border-neon focus:shadow-[0_0_0_1px_var(--neon),0_0_24px_-6px_var(--neon)] focus-visible:outline-none aria-[invalid=true]:border-danger'

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-describedby={`${uid}-mode`} className="space-y-9">
      <p id={`${uid}-mode`} className="hud border-l-2 border-cyan pl-3 normal-case tracking-[0.04em]">
        {endpoint ? 'Messages are sent through the configured form service.' : 'No form backend is configured: sending opens your email app with this message pre-filled.'}
      </p>

      <div className="grid gap-9 md:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-name`} className="hud text-fg">
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
            <p id={`${uid}-name-err`} className="mt-2 font-mono text-[0.8rem] text-danger">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${uid}-email`} className="hud text-fg">
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
            <p id={`${uid}-email-err`} className="mt-2 font-mono text-[0.8rem] text-danger">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <fieldset>
        <legend className="hud text-fg">What&apos;s it about?</legend>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {TOPICS.map((t) => (
            <label
              key={t}
              className={cn(
                'flex min-h-10 cursor-pointer items-center border px-3 font-mono text-[0.72rem] uppercase tracking-[0.05em] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)] chamfer [--chamfer:7px]',
                fields.topic === t ? 'border-neon bg-neon text-neon-ink shadow-[0_0_18px_-4px_var(--neon)]' : 'border-line-strong text-fg-2 hover:border-cyan hover:text-cyan',
              )}
            >
              <input type="radio" name="topic" value={t} checked={fields.topic === t} onChange={() => set('topic', t)} className="sr-only" />
              {t}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor={`${uid}-message`} className="hud text-fg">
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
          <p id={`${uid}-message-err`} className="mt-2 font-mono text-[0.8rem] text-danger">
            {errors.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <Button type="submit" variant="solid" arrow="right" disabled={status.kind === 'sending'}>
          {status.kind === 'sending' ? 'Sending…' : endpoint ? 'Send message' : 'Compose email'}
        </Button>
        <div role="status" aria-live="polite" className="text-[0.92rem]">
          {status.kind === 'sent' && <p className="font-mono text-ok">Thank you — your message was delivered. I&apos;ll reply by email.</p>}
          {status.kind === 'mailto' && (
            <p className="max-w-[46ch] text-fg-2">
              Your email app should now be open with the message ready to send. Nothing has been sent yet. If no app opened, write to{' '}
              <a className="link-u text-fg" href={`mailto:${site.contact.email}`}>
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
  const block = 'hud-frame p-5 md:p-6'
  return (
    <>
      <Seo title="Contact" description="Start a conversation with Jatin Kumar about frontend engineering, product development, complex interfaces or creative digital experiences." />
      <header className="shell pt-[calc(var(--header-h)+clamp(2.5rem,7vw,6rem))]">
        <SectionBar
          index="03"
          label="Open channel"
          right={
            site.availability.show && (
              <span className="flex items-center gap-2 text-fg">
                <span className="pip" aria-hidden="true" />
                {site.availability.label}
              </span>
            )
          }
        />
        <SplitReveal as="h1" immediate className="display mt-10 text-[clamp(2.8rem,10vw,11rem)] leading-[0.82] md:mt-14">
          Have something
          <br />
          <span className="stroke [--stroke:var(--neon)]">interesting</span>
          <br />
          to build<span className="text-magenta">?</span>
        </SplitReveal>
        <p className="mt-10 max-w-[52ch] text-lead text-fg-2">
          I&apos;m always glad to talk about frontend engineering, product development, complex interfaces and creative digital
          experiences — a role, a project, or an idea that needs a sounding board.
        </p>
      </header>

      <section aria-label="Ways to reach me" className="shell section">
        <div className="grid-12 gap-y-16">
          <Reveal stagger={0.08} className="col-span-4 space-y-4 md:col-span-5">
            <div className={block}>
              <p className="hud text-neon">Email — fastest</p>
              <a href={`mailto:${site.contact.email}`} className="link-u mt-3 break-all font-mono text-[clamp(1.05rem,1.9vw,1.5rem)] font-semibold" data-cursor="link">
                <Mail size={18} aria-hidden="true" />
                {site.contact.email}
              </a>
              <div className="mt-4">
                <CopyButton value={site.contact.email} label="Copy email" />
              </div>
            </div>
            <div className={block}>
              <p className="hud text-cyan">Uplinks</p>
              <ul className="mt-2 divide-y divide-line-strong">
                {[
                  { label: 'LinkedIn', href: site.contact.linkedin, note: 'Professional profile' },
                  { label: 'GitHub', href: site.contact.github, note: 'Code' },
                ].map((l) => (
                  <li key={l.label}>
                    <a href={l.href} target="_blank" rel="noreferrer" className="group flex min-h-14 items-center justify-between gap-4 py-3" data-cursor="link">
                      <span>
                        <span className="display block text-h3 transition-[transform,color] duration-300 group-hover:translate-x-2 group-hover:text-neon">{l.label}</span>
                        <span className="hud">{l.note}</span>
                      </span>
                      <ArrowUpRight size={20} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neon" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className={block}>
              <p className="hud text-magenta">Dossier</p>
              <div className="mt-4">
                <ButtonAnchor href={site.resume.href} download={site.resume.fileName} arrow="none">
                  Download resume (PDF)
                </ButtonAnchor>
              </div>
            </div>
            <div className={block}>
              <p className="hud">Where &amp; when</p>
              <p className="mt-3 text-[1rem] text-fg-2">
                {site.location.label}
                {time && (
                  <>
                    <br />
                    <span className="hud normal-case tracking-[0.04em]">
                      Local time <span className="text-neon">{time}</span> {site.location.tzLabel} (calculated in your browser)
                    </span>
                  </>
                )}
              </p>
            </div>
          </Reveal>

          <div className="col-span-4 md:col-span-6 md:col-start-7">
            <div className="hud-frame p-5 [--frame-accent:var(--cyan)] md:p-8">
              <p className="hud text-cyan">&gt; compose transmission</p>
              <h2 className="display mt-3 text-h2">Write a note</h2>
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
