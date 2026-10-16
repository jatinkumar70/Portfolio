import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** HUD label with an optional index — renders as "[01] // ABOUT". */
export function Eyebrow({ index, children, className }: { index?: string; children: ReactNode; className?: string }) {
  return (
    <p className={cn('hud flex items-center gap-3', className)}>
      {index && <span className="text-neon">[{index}]</span>}
      <span aria-hidden="true" className="text-line-strong">
        //
      </span>
      <span>{children}</span>
    </p>
  )
}

/**
 * Section header bar: index + label on the left, a running rule, an optional
 * readout on the right. Sits on top of every major section.
 */
export function SectionBar({ index, label, right, className }: { index: string; label: string; right?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <Eyebrow index={index}>{label}</Eyebrow>
      <span aria-hidden="true" className="relative h-px flex-1 bg-line-strong">
        <span className="absolute left-0 top-1/2 h-[3px] w-10 -translate-y-1/2 bg-neon" />
      </span>
      {right && <span className="hud hidden sm:inline">{right}</span>}
    </div>
  )
}

/** Small source note — keeps claims honest ("from resume"). */
export function SourceNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('hud inline-flex items-center gap-2 border border-line-strong px-2 py-1 text-fg-2', className)}>
      <span aria-hidden="true" className="h-1.5 w-1.5 bg-ok" />
      {children}
    </span>
  )
}
