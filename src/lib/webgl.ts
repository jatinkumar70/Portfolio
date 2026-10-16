let cached: boolean | null = null

/** Feature-detect WebGL once; failing environments get SVG fallbacks. */
export function hasWebGL(): boolean {
  if (cached !== null) return cached
  try {
    const canvas = document.createElement('canvas')
    const gl =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (canvas.getContext('webgl') as WebGLRenderingContext | null)
    cached = !!gl
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    cached = false
  }
  return cached
}

/** Rough device tier used to cap pixel ratio and scene detail. */
export function deviceTier(): 'low' | 'mid' | 'high' {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency || 4
  const mem = nav.deviceMemory || 4
  const small = window.matchMedia('(max-width: 47.99rem)').matches
  if (cores <= 4 || mem <= 2) return 'low'
  if (small) return 'mid'
  return 'high'
}

export function maxDpr(): number {
  const tier = deviceTier()
  return tier === 'low' ? 1.25 : tier === 'mid' ? 1.5 : 1.85
}
