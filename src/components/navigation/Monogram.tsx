import { cn } from '@/lib/utils'
import { MONOGRAM_PATHS } from './monogram-paths'

export function Monogram({ className, title = 'Jatin Kumar — home', strokeWidth = 3.2 }: { className?: string; title?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 54 52" className={cn('h-8 w-auto', className)} fill="none" {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}>
      <path d={MONOGRAM_PATHS.j} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="square" />
      <path d={MONOGRAM_PATHS.kStem} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="square" />
      <path d={MONOGRAM_PATHS.kArms} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="miter" />
      <rect x="34" y="23.5" width="5" height="5" fill="var(--accent)" />
    </svg>
  )
}
