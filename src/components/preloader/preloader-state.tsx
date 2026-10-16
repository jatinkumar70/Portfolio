import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

const SESSION_KEY = 'jk:intro-played'

interface PreloaderState {
  /** Preloader is currently on screen. */
  active: boolean
  /** Intro has handed over to the page (or was skipped). Hero entrances wait for this. */
  complete: boolean
  /** Increments on each replay so the preloader remounts fresh. */
  runId: number
  finish: () => void
  replay: () => void
}

const Ctx = createContext<PreloaderState | null>(null)

function alreadyPlayed() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

/** Is the visitor an automated renderer (search preview, Lighthouse)? Skip the intro for them. */
function isAutomated() {
  return typeof navigator !== 'undefined' && (navigator.webdriver || /bot|crawler|spider|headless/i.test(navigator.userAgent))
}

export function PreloaderProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(() => !alreadyPlayed() && !isAutomated())
  const [complete, setComplete] = useState(() => !active)
  const [runId, setRunId] = useState(0)

  const finish = useCallback(() => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      /* private mode — intro may replay next visit, which is acceptable */
    }
    setActive(false)
    setComplete(true)
  }, [])

  const replay = useCallback(() => {
    window.scrollTo(0, 0)
    setComplete(false)
    setRunId((r) => r + 1)
    setActive(true)
  }, [])

  const value = useMemo(() => ({ active, complete, runId, finish, replay }), [active, complete, runId, finish, replay])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePreloader() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePreloader must be used within PreloaderProvider')
  return ctx
}
