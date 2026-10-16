import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  /** Rendered instead of the failed subtree. */
  fallback: ReactNode
  children: ReactNode
  /** Change to reset the boundary (e.g. route path). */
  resetKey?: unknown
}

interface State {
  failed: boolean
  resetKey: unknown
}

/** Keeps non-essential visuals (WebGL, canvases, prototypes) from taking the page down. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false, resetKey: this.props.resetKey }

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true }
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    return props.resetKey !== state.resetKey ? { failed: false, resetKey: props.resetKey } : null
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.warn('[ErrorBoundary] visual feature disabled:', error, info.componentStack)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
