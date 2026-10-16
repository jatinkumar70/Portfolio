import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
/** Where a statement comes from — rendered as a provenance badge. */
export type Provenance = 'fact' | 'concept' | 'experiment'

/** Mono metadata label with an optional index — e.g. "02 — About". */
export function Eyebrow({ index, children, className }: { index?: string; children: ReactNode; className?: string }) {
  return (
    <p className={cn('eyebrow flex items-center gap-3', className)}>
      {index && <span className="text-ink">{index}</span>}
      {index && <span aria-hidden="true" className="h-px w-8 bg-current opacity-50" />}
      <span>{children}</span>
    </p>
  )
}

/** Full-width section header: indexed label on the left, optional slot on the right. */
export function SectionBar({ index, label, right, className }: { index?: string; label: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between gap-4 border-b border-current/20 pb-3', className)}>
      <Eyebrow index={index}>{label}</Eyebrow>
      {right}
    </div>
  )
}

/** Small mono note citing where the figures beside it come from. */
export function SourceNote({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('meta', className)}>{children}</span>
}

const provenanceCopy: Record<Provenance, string> = {
  fact: 'Fact · from resume',
  concept: 'Concept · illustrative reconstruction',
  experiment: 'Experiment · portfolio lab',
}

/**
 * Marks where content comes from. Every interface mock, demo and claim on the
 * site carries one so visitors never confuse a concept with production work.
 */
export function ProvenanceBadge({ kind, children, className }: { kind: Provenance; children?: ReactNode; className?: string }) {
  const color = kind === 'fact' ? 'text-ink' : kind === 'concept' ? 'text-accent-ink' : 'text-info'
  return (
    <span className={cn('provenance', color, className)} data-kind={kind}>
      {children ?? provenanceCopy[kind]}
    </span>
  )
}

/** A thin technical annotation: leader line + mono note. */
export function Annotation({ children, className, align = 'left' }: { children: ReactNode; className?: string; align?: 'left' | 'right' }) {
  return (
    <span className={cn('meta inline-flex items-center gap-2', align === 'right' && 'flex-row-reverse', className)}>
      <span aria-hidden="true" className="inline-block h-px w-6 bg-current" />
      <span>{children}</span>
    </span>
  )
}
