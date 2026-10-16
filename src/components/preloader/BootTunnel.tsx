import { useEffect, useRef, type MutableRefObject } from 'react'

const RINGS = 18
const DEPTH = 9
const NEAR = 0.35
const STREAKS = 90
const FOCAL = 0.55

interface BootTunnelProps {
  /** Travel speed — the preloader ramps this with boot progress and spikes it on exit. */
  speedRef: MutableRefObject<number>
  /** 0–1 glitch hit; set it and the canvas tears into displaced bands, then decays. */
  glitchRef: MutableRefObject<number>
  /** Draw a single frame and stop (reduced motion). */
  still?: boolean
  className?: string
}

/**
 * A 2D-canvas warp tunnel: chamfered neon frames rush at the camera along
 * perspective spokes, with streaking particles and band-tear glitches.
 * Cheap enough to run before the WebGL hero is ready.
 */
export function BootTunnel({ speedRef, glitchRef, still = false, className }: BootTunnelProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const css = getComputedStyle(document.documentElement)
    const token = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback
    const C = {
      void: token('--void', '#050508'),
      line: token('--line-strong', '#33334a'),
      cyan: token('--cyan', '#00f0ff'),
      magenta: token('--magenta', '#ff2a6d'),
      neon: token('--neon', '#f5ee0b'),
    }
    const ringColor = (i: number) => (i % 6 === 0 ? C.magenta : i % 6 === 3 ? C.cyan : i % 9 === 4 ? C.neon : C.line)
    const streakColors = [C.cyan, C.magenta, C.neon, C.cyan]

    let w = 0
    let h = 0
    let dpr = 1
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const rings = Array.from({ length: RINGS }, (_, i) => ({ d: NEAR + (i / RINGS) * DEPTH, c: ringColor(i) }))
    const spawn = (d: number) => {
      const a = Math.random() * Math.PI * 2
      const r = 0.2 + Math.random() * 0.9
      return { x: Math.cos(a) * r, y: Math.sin(a) * r, d, c: streakColors[(Math.random() * streakColors.length) | 0] }
    }
    const streaks = Array.from({ length: STREAKS }, () => spawn(NEAR + Math.random() * DEPTH))

    // Vanishing point drifts against the pointer for a little parallax.
    const vp = { x: 0, y: 0, tx: 0, ty: 0 }
    const onMove = (e: PointerEvent) => {
      if (!w || !h) return
      vp.tx = (e.clientX / w - 0.5) * -0.14
      vp.ty = (e.clientY / h - 0.5) * -0.14
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
    const depthAlpha = (d: number) => clamp01((DEPTH - d) / 2.2) * clamp01((d - NEAR) / 0.5)

    function frame(dt: number) {
      const speed = speedRef.current
      vp.x += (vp.tx - vp.x) * 0.05
      vp.y += (vp.ty - vp.y) * 0.05
      const cx = w * (0.5 + vp.x)
      const cy = h * (0.5 + vp.y)
      const proj = (ux: number, uy: number, d: number) => {
        const s = FOCAL / d
        return [cx + ux * w * 0.5 * s * 1.1, cy + uy * h * 0.5 * s * 1.1] as const
      }

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx!.globalCompositeOperation = 'source-over'
      // Partial clear leaves motion trails that lengthen as speed climbs.
      ctx!.globalAlpha = still ? 1 : Math.max(0.18, 0.5 - speed * 0.04)
      ctx!.fillStyle = C.void
      ctx!.fillRect(0, 0, w, h)

      // Core glow
      ctx!.globalAlpha = 0.05 + Math.min(0.12, speed * 0.012)
      const glow = ctx!.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.45)
      glow.addColorStop(0, C.magenta)
      glow.addColorStop(0.45, C.cyan)
      glow.addColorStop(1, 'transparent')
      ctx!.fillStyle = glow
      ctx!.fillRect(0, 0, w, h)

      // Spokes: four per side, from the far plane to the near plane
      ctx!.globalAlpha = 0.35
      ctx!.strokeStyle = C.line
      ctx!.lineWidth = 1
      ctx!.beginPath()
      for (let i = 0; i < 4; i++) {
        const t = -1 + (i / 3) * 2
        for (const [ux, uy] of [[t, -1], [t, 1], [-1, t], [1, t]] as const) {
          const [x0, y0] = proj(ux, uy, DEPTH)
          const [x1, y1] = proj(ux, uy, NEAR)
          ctx!.moveTo(x0, y0)
          ctx!.lineTo(x1, y1)
        }
      }
      ctx!.stroke()

      // Chamfered frames rushing in
      for (const r of rings) {
        r.d -= speed * dt * 2.2
        if (r.d < NEAR) r.d += DEPTH
        const a = depthAlpha(r.d)
        if (a <= 0) continue
        const [l, t] = proj(-1, -1, r.d)
        const [rt, b] = proj(1, 1, r.d)
        const ch = Math.min(rt - l, b - t) * 0.07
        ctx!.globalAlpha = a * (r.c === C.line ? 0.7 : 0.9)
        ctx!.strokeStyle = r.c
        ctx!.lineWidth = Math.min(3, Math.max(0.6, (FOCAL / r.d) * 2.4))
        ctx!.beginPath()
        ctx!.moveTo(l + ch, t)
        ctx!.lineTo(rt, t)
        ctx!.lineTo(rt, b - ch)
        ctx!.lineTo(rt - ch, b)
        ctx!.lineTo(l, b)
        ctx!.lineTo(l, t + ch)
        ctx!.closePath()
        ctx!.stroke()
      }

      // Streaks — longer the faster we go
      ctx!.globalCompositeOperation = 'lighter'
      const len = 0.12 + speed * 0.22
      for (let i = 0; i < streaks.length; i++) {
        const s = streaks[i]
        s.d -= speed * dt * 3
        if (s.d < NEAR) {
          streaks[i] = spawn(DEPTH)
          continue
        }
        const a = depthAlpha(s.d)
        if (a <= 0) continue
        const [x0, y0] = proj(s.x, s.y, s.d)
        const [x1, y1] = proj(s.x, s.y, s.d + len)
        ctx!.globalAlpha = a * 0.85
        ctx!.strokeStyle = s.c
        ctx!.lineWidth = Math.min(2.5, Math.max(0.5, FOCAL / s.d))
        ctx!.beginPath()
        ctx!.moveTo(x1, y1)
        ctx!.lineTo(x0, y0)
        ctx!.stroke()
      }

      // Glitch: tear the frame into horizontally displaced bands
      const g = glitchRef.current
      if (g > 0.03) {
        ctx!.globalCompositeOperation = 'source-over'
        ctx!.globalAlpha = 1
        ctx!.setTransform(1, 0, 0, 1, 0, 0)
        const bands = 2 + ((g * 7) | 0)
        for (let i = 0; i < bands; i++) {
          const y = Math.random() * canvas!.height
          const bh = (4 + Math.random() * 46) * dpr
          const dx = (Math.random() - 0.5) * 140 * g * dpr
          ctx!.drawImage(canvas!, 0, y, canvas!.width, bh, dx, y, canvas!.width, bh)
          if (i % 2 === 0) {
            ctx!.globalAlpha = 0.18 * g
            ctx!.fillStyle = i % 4 === 0 ? C.magenta : C.cyan
            ctx!.fillRect(0, y, canvas!.width, bh)
            ctx!.globalAlpha = 1
          }
        }
        glitchRef.current = g * 0.88
      }
    }

    if (still) {
      frame(0)
      return () => {
        ro.disconnect()
        window.removeEventListener('pointermove', onMove)
      }
    }

    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      frame(dt)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
    }
  }, [speedRef, glitchRef, still])

  return <canvas ref={ref} aria-hidden="true" className={className} />
}
