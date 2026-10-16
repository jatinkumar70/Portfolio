import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Edges, Environment, Html, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { cssVar, mulberry32 } from '@/lib/utils'
import { deviceTier, maxDpr } from '@/lib/webgl'

/**
 * "The Stack" — an architectural model of an interface, built from layered
 * slabs with drafted UI linework, vertical connectors and a travelling data
 * pulse. It assembles / explodes with scroll and responds to the pointer.
 */

interface SlabSpec {
  w: number
  d: number
  x: number
  z: number
  rot: number
  label: string
}

const SLABS: SlabSpec[] = [
  { w: 3.7, d: 2.7, x: 0, z: 0, rot: 0, label: '05 — Data' },
  { w: 3.1, d: 2.1, x: 0.35, z: -0.2, rot: 0, label: '04 — Realtime' },
  { w: 2.5, d: 2.9, x: -0.4, z: 0.1, rot: 0, label: '03 — State' },
  { w: 3.3, d: 1.5, x: 0.1, z: 0.55, rot: 0, label: '02 — Components' },
  { w: 2.0, d: 2.0, x: 0.55, z: -0.35, rot: 0, label: '01 — Interface' },
]

const THICK = 0.07
const GAP_ASSEMBLED = 0.34
const GAP_EXPLODED = 0.86

/** Connector posts (x, z) — must fall within most slabs' footprints. */
const POSTS: [number, number][] = [
  [-0.55, -0.45],
  [0.8, 0.35],
  [0.15, -0.75],
]

export interface HeroSceneProps {
  /** 0 → 1 scroll progress out of the hero. */
  progressRef: RefObject<number>
  /** Visitor-toggled exploded view. */
  exploded: boolean
  reduced: boolean
  /** Rendering active (in view + tab visible). */
  active: boolean
  onContextLost: () => void
  onReady?: () => void
}

/** Procedural UI linework for a slab's top face. */
function useSlabLines(spec: SlabSpec, seed: number) {
  return useMemo(() => {
    const rnd = mulberry32(seed)
    const pts: number[] = []
    const y = THICK / 2 + 0.002
    const pad = 0.14
    const x0 = -spec.w / 2 + pad
    const x1 = spec.w / 2 - pad
    const z0 = -spec.d / 2 + pad
    const z1 = spec.d / 2 - pad
    const rect = (ax: number, az: number, bx: number, bz: number) => {
      pts.push(ax, y, az, bx, y, az, bx, y, az, bx, y, bz, bx, y, bz, ax, y, bz, ax, y, bz, ax, y, az)
    }
    // header bar
    const header = z0 + (z1 - z0) * 0.16
    rect(x0, z0, x1, header)
    // columns
    const cols = 2 + Math.floor(rnd() * 2)
    const sideW = (x1 - x0) * (0.22 + rnd() * 0.1)
    rect(x0, header + 0.08, x0 + sideW, z1)
    const cx0 = x0 + sideW + 0.08
    const colW = (x1 - cx0 - 0.08 * (cols - 1)) / cols
    for (let c = 0; c < cols; c++) {
      const ax = cx0 + c * (colW + 0.08)
      const rows = 1 + Math.floor(rnd() * 3)
      const rowH = (z1 - header - 0.08 - 0.08 * (rows - 1)) / rows
      for (let r = 0; r < rows; r++) {
        const az = header + 0.08 + r * (rowH + 0.08)
        rect(ax, az, ax + colW, az + rowH)
      }
    }
    // sidebar list lines
    for (let i = 0; i < 4; i++) {
      const lz = header + 0.22 + i * 0.16
      if (lz > z1 - 0.05) break
      pts.push(x0 + 0.06, y, lz, x0 + sideW * (0.5 + rnd() * 0.4), y, lz)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [spec, seed])
}

function Slab({
  spec,
  index,
  ink,
  accent,
  yTarget,
  showLabel,
  snap,
}: {
  spec: SlabSpec
  index: number
  ink: string
  accent: string
  yTarget: RefObject<number[]>
  showLabel: boolean
  snap: RefObject<boolean>
}) {
  const ref = useRef<THREE.Group>(null)
  const lines = useSlabLines(spec, 11 + index * 7)
  useEffect(() => () => lines.dispose(), [lines])

  useFrame((_, dt) => {
    const g = ref.current
    const target = yTarget.current?.[index]
    if (!g || target === undefined) return
    g.position.y = snap.current ? target : THREE.MathUtils.damp(g.position.y, target, 6, dt)
  })

  return (
    <group ref={ref} position={[spec.x, index * GAP_ASSEMBLED, spec.z]} rotation={[0, spec.rot, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[spec.w, THICK, spec.d]} />
        <meshPhysicalMaterial color="#fbfbf8" roughness={0.32} metalness={0} clearcoat={1} clearcoatRoughness={0.25} />
        <Edges color={ink} threshold={15} />
      </mesh>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color={ink} transparent opacity={0.55} />
      </lineSegments>
      {index === 2 && (
        <mesh position={[spec.w / 2 - 0.42, THICK / 2 + 0.004, -spec.d / 2 + 0.38]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.36, 0.2]} />
          <meshBasicMaterial color={accent} />
        </mesh>
      )}
      {showLabel && (
        <Html position={[spec.w / 2 + 0.1, 0, -spec.d / 2 + 0.2]} center={false} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
          <span className="hero-scene-label" aria-hidden="true">
            {spec.label}
          </span>
        </Html>
      )}
    </group>
  )
}

function Posts({ ink, accent, heightRef }: { ink: string; accent: string; heightRef: RefObject<number> }) {
  const lineRefs = useRef<THREE.Mesh[]>([])
  const pulse = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const h = heightRef.current ?? 1
    lineRefs.current.forEach((m) => {
      if (!m) return
      m.scale.y = h
      m.position.y = h / 2
    })
    if (pulse.current) {
      const t = (clock.elapsedTime * 0.35) % 1
      pulse.current.position.y = t * h
      const s = 1 - Math.abs(t - 0.5) * 0.8
      pulse.current.scale.setScalar(0.6 + s * 0.6)
    }
  })
  return (
    <group>
      {POSTS.map(([x, z], i) => (
        <mesh
          key={`${x}-${z}`}
          position={[x, 0.5, z]}
          ref={(m) => {
            if (m) lineRefs.current[i] = m
          }}
        >
          <cylinderGeometry args={[0.006, 0.006, 1, 6]} />
          <meshBasicMaterial color={ink} />
        </mesh>
      ))}
      <mesh ref={pulse} position={[POSTS[1][0], 0, POSTS[1][1]]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color={accent} />
      </mesh>
    </group>
  )
}

function Nodes({ ink, yTarget, snap }: { ink: string; yTarget: RefObject<number[]>; snap: RefObject<boolean> }) {
  const refs = useRef<THREE.Mesh[]>([])
  const geo = useMemo(() => new THREE.SphereGeometry(0.03, 12, 12), [])
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: ink }), [ink])
  useEffect(
    () => () => {
      geo.dispose()
      mat.dispose()
    },
    [geo, mat],
  )
  const nodes = useMemo(() => {
    const list: { x: number; z: number; slab: number }[] = []
    POSTS.forEach(([x, z]) =>
      SLABS.forEach((s, slab) => {
        if (Math.abs(x - s.x) < s.w / 2 - 0.05 && Math.abs(z - s.z) < s.d / 2 - 0.05) list.push({ x, z, slab })
      }),
    )
    return list
  }, [])
  useFrame((_, dt) => {
    refs.current.forEach((m, i) => {
      const n = nodes[i]
      const target = (yTarget.current?.[n.slab] ?? 0) + THICK / 2 + 0.03
      if (m) m.position.y = snap.current ? target : THREE.MathUtils.damp(m.position.y, target, 6, dt)
    })
  })
  return (
    <group>
      {nodes.map((n, i) => (
        <mesh
          key={`${n.x}-${n.z}-${n.slab}`}
          geometry={geo}
          material={mat}
          position={[n.x, n.slab * GAP_ASSEMBLED, n.z]}
          ref={(m) => {
            if (m) refs.current[i] = m
          }}
        />
      ))}
    </group>
  )
}

function Rig({ progressRef, exploded, reduced, onReady }: Pick<HeroSceneProps, 'progressRef' | 'exploded' | 'reduced' | 'onReady'>) {
  const group = useRef<THREE.Group>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const yTarget = useRef<number[]>(SLABS.map((_, i) => i * GAP_ASSEMBLED))
  const postHeight = useRef(SLABS.length * GAP_ASSEMBLED)
  const explodeAmt = useRef(0)
  const { size, invalidate } = useThree()
  const ink = cssVar('--ink', '#111111')
  const accent = cssVar('--accent', '#ff4a1c')
  const compact = size.width < 640
  const tier = useMemo(() => deviceTier(), [])
  const ready = useRef(false)
  const snap = useRef(reduced)
  useEffect(() => {
    snap.current = reduced
  }, [reduced])

  useEffect(() => {
    if (reduced) return
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduced])

  useEffect(() => invalidate(), [exploded, invalidate])

  useFrame(({ clock }, dt) => {
    const g = group.current
    if (!g) return
    if (!ready.current) {
      ready.current = true
      onReady?.()
    }
    const scroll = progressRef.current ?? 0
    const target = Math.max(exploded ? 1 : 0, scroll)
    explodeAmt.current = reduced ? target : THREE.MathUtils.damp(explodeAmt.current, target, 3.2, dt)
    const gap = THREE.MathUtils.lerp(GAP_ASSEMBLED, GAP_EXPLODED, explodeAmt.current)
    for (let i = 0; i < SLABS.length; i++) yTarget.current[i] = i * gap
    postHeight.current = (SLABS.length - 1) * gap + 0.4

    const t = clock.elapsedTime
    const ambient = reduced ? 0 : 1
    const yaw = -0.62 + Math.sin(t * 0.18) * 0.08 * ambient + pointer.current.x * 0.28 * ambient + scroll * 0.7
    const pitch = pointer.current.y * 0.08 * ambient
    g.rotation.y = reduced ? yaw : THREE.MathUtils.damp(g.rotation.y, yaw, 2.5, dt)
    g.rotation.x = reduced ? pitch : THREE.MathUtils.damp(g.rotation.x, pitch, 2.5, dt)
    g.position.y = -((SLABS.length - 1) * gap) / 2 - 0.1 + Math.sin(t * 0.6) * 0.04 * ambient - scroll * 0.4
  })

  const scale = compact ? 1.3 : 1
  return (
    <group ref={group} scale={scale}>
      {SLABS.map((s, i) => (
        <Slab key={s.label} spec={s} index={i} ink={ink} accent={accent} yTarget={yTarget} showLabel={!compact && exploded} snap={snap} />
      ))}
      <Nodes ink={ink} yTarget={yTarget} snap={snap} />
      <Posts ink={ink} accent={accent} heightRef={postHeight} />
      {tier !== 'low' && <ContactShadows position={[0, -0.2, 0]} scale={9} blur={2.6} opacity={0.22} far={4} resolution={256} color={ink} />}
    </group>
  )
}

export default function HeroScene(props: HeroSceneProps) {
  const { active, reduced, onContextLost } = props
  return (
    <Canvas
      flat
      dpr={[1, maxDpr()]}
      frameloop={!active ? 'never' : reduced ? 'demand' : 'always'}
      camera={{ position: [7.2, 5.6, 8.6], fov: 24, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl, camera }) => {
        camera.lookAt(0, 0, 0)
        gl.setClearColor(0x000000, 0)
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          onContextLost()
        })
      }}
      aria-hidden="true"
    >
      <ambientLight intensity={1.15} />
      <directionalLight position={[-4, 8, 5]} intensity={1.9} />
      <directionalLight position={[6, 3, -4]} intensity={0.4} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 5, -2]} scale={[10, 3, 1]} rotation={[Math.PI / 2.4, 0, 0]} />
        <Lightformer form="rect" intensity={1.2} position={[-6, 2, 2]} scale={[3, 6, 1]} rotation={[0, Math.PI / 2, 0]} />
        <Lightformer form="ring" intensity={0.8} position={[5, 3, 4]} scale={2} />
      </Environment>
      <Rig {...props} />
    </Canvas>
  )
}
