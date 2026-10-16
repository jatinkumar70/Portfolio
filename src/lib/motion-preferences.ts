import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/** Override stored per visitor via the footer "Motion" toggle. */
const STORAGE_KEY = 'jk:motion'

type Listener = () => void
const listeners = new Set<Listener>()

function readOverride(): 'reduce' | 'full' | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    return v === 'reduce' || v === 'full' ? v : null
  } catch {
    return null
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  const override = readOverride()
  if (override) return override === 'reduce'
  return window.matchMedia(QUERY).matches
}

export function setMotionOverride(value: 'reduce' | 'full' | null) {
  try {
    if (value) window.localStorage.setItem(STORAGE_KEY, value)
    else window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* storage unavailable — preference applies for this page view only */
  }
  document.documentElement.dataset.motion = prefersReducedMotion() ? 'reduce' : 'full'
  listeners.forEach((l) => l())
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', listener)
  return () => {
    listeners.delete(listener)
    mq.removeEventListener('change', listener)
  }
}

/** Reactive reduced-motion flag (OS setting, overridable by the visitor). */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false)
}
