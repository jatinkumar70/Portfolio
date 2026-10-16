/**
 * Static axonometric drawing of the hero "Stack" — used when WebGL is
 * unavailable, the context is lost, or while the 3D chunk loads.
 */
const SLABS = [
  { w: 3.7, d: 2.7, x: 0, z: 0 },
  { w: 3.1, d: 2.1, x: 0.35, z: -0.2 },
  { w: 2.5, d: 2.9, x: -0.4, z: 0.1 },
  { w: 3.3, d: 1.5, x: 0.1, z: 0.55 },
  { w: 2.0, d: 2.0, x: 0.55, z: -0.35 },
]
const GAP = 0.62
const S = 70
const COS = Math.cos(Math.PI / 6)
const SIN = Math.sin(Math.PI / 6)

function p(x: number, y: number, z: number) {
  return [(x - z) * COS * S, (x + z) * SIN * S - y * S] as const
}

function face(pts: (readonly [number, number])[]) {
  return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') + ' Z'
}

export function HeroFallback({ className }: { className?: string }) {
  const slabs = SLABS.map((s, i) => {
    const y = i * GAP
    const x0 = s.x - s.w / 2
    const x1 = s.x + s.w / 2
    const z0 = s.z - s.d / 2
    const z1 = s.z + s.d / 2
    const t = 0.07
    const top = [p(x0, y + t, z0), p(x1, y + t, z0), p(x1, y + t, z1), p(x0, y + t, z1)]
    const front = [p(x0, y + t, z1), p(x1, y + t, z1), p(x1, y, z1), p(x0, y, z1)]
    const side = [p(x1, y + t, z0), p(x1, y + t, z1), p(x1, y, z1), p(x1, y, z0)]
    // inner UI linework
    const pad = 0.16
    const hz = z0 + (z1 - z0) * 0.18
    const inner = [
      face([p(x0 + pad, y + t, z0 + pad), p(x1 - pad, y + t, z0 + pad), p(x1 - pad, y + t, hz), p(x0 + pad, y + t, hz)]),
      face([p(x0 + pad, y + t, hz + 0.08), p(x0 + pad + s.w * 0.26, y + t, hz + 0.08), p(x0 + pad + s.w * 0.26, y + t, z1 - pad), p(x0 + pad, y + t, z1 - pad)]),
      face([
        p(x0 + pad + s.w * 0.26 + 0.08, y + t, hz + 0.08),
        p(x1 - pad, y + t, hz + 0.08),
        p(x1 - pad, y + t, z1 - pad),
        p(x0 + pad + s.w * 0.26 + 0.08, y + t, z1 - pad),
      ]),
    ]
    return { top: face(top), front: face(front), side: face(side), inner, key: i }
  })
  const posts = [
    [-0.55, -0.45],
    [0.8, 0.35],
  ].map(([x, z]) => {
    const [ax, ay] = p(x, 0, z)
    const [bx, by] = p(x, (SLABS.length - 1) * GAP + 0.4, z)
    return `M${ax.toFixed(1)} ${ay.toFixed(1)} L${bx.toFixed(1)} ${by.toFixed(1)}`
  })

  return (
    <svg viewBox="-330 -360 660 560" className={className} role="img" aria-label="Axonometric drawing of five stacked interface layers connected by vertical lines">
      {slabs.map((s) => (
        <g key={s.key} stroke="var(--ink)" strokeWidth="1" strokeLinejoin="round">
          <path d={s.front} fill="#efeee9" />
          <path d={s.side} fill="#e4e3dd" />
          <path d={s.top} fill="var(--paper)" />
          <g strokeWidth="0.6" opacity="0.55" fill="none">
            {s.inner.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        </g>
      ))}
      <g stroke="var(--ink)" strokeWidth="0.8">
        {posts.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <circle cx={p(0.8, 1.6, 0.35)[0]} cy={p(0.8, 1.6, 0.35)[1]} r="4" fill="var(--accent)" />
    </svg>
  )
}
