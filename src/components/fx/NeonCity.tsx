import { useEffect, useRef, useState, type RefObject } from 'react'
import { gsap } from '@/lib/animation'
import { hasWebGL, maxDpr } from '@/lib/webgl'
import { useReducedMotion } from '@/lib/motion-preferences'
import { cn, cssVar } from '@/lib/utils'

/**
 * A raw-WebGL fragment shader: an endless neon grid floor racing toward a
 * two-layer procedural skyline under digital rain. Mouse parallaxes the
 * camera, scroll (progressRef 0→1) warps speed and sinks the horizon, and
 * glitchRef spikes block-shift + chromatic aberration.
 * No three.js — one quad, one program, ~0 KB of dependencies.
 */
const VERT = `
attribute vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }
`

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uTravel;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uGlitch;
uniform vec3 uNeon;
uniform vec3 uCyan;
uniform vec3 uMag;

float h11(float p){ return fract(sin(p * 127.1) * 43758.5453); }
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float gridLine(float v, float w){ float d = abs(fract(v + 0.5) - 0.5); return smoothstep(w, 0.0, d); }

vec4 city(vec2 uv, float hz, float cols, float maxH, float seed, float bright){
  float cx = floor(uv.x * cols);
  float r = h11(cx + seed);
  float hgt = maxH * (0.22 + 0.78 * r * r);
  hgt *= 1.0 + step(0.9, h11(cx * 3.1 + seed)) * 1.1;
  float y = uv.y - hz;
  if (y < 0.0 || y > hgt) return vec4(0.0);
  float lx = fract(uv.x * cols);
  // windows
  vec2 wg = vec2(uv.x * cols * 5.0, y * cols * 7.0);
  vec2 wid = floor(wg);
  vec2 wf = fract(wg);
  float win = step(0.28, wf.x) * step(wf.x, 0.72) * step(0.32, wf.y) * step(wf.y, 0.68);
  float lit = step(0.8, h21(wid + seed));
  float flick = 0.55 + 0.45 * sin(uTime * (1.0 + h21(wid) * 3.0) + h21(wid * 1.7) * 40.0);
  float pick = h21(wid * 1.31 + seed);
  vec3 wc = pick < 0.5 ? uNeon : (pick < 0.85 ? uCyan : uMag);
  // rim light on the roof line and edges
  float rim = smoothstep(0.012, 0.0, hgt - y) + smoothstep(0.05, 0.0, min(lx, 1.0 - lx)) * 0.25;
  vec3 c = vec3(0.016, 0.016, 0.034) + wc * win * lit * flick * 0.9 * bright + uMag * rim * 0.35 * bright;
  // antenna beacon on the tallest towers
  float beacon = step(0.9, h11(cx * 3.1 + seed)) * smoothstep(0.004, 0.0, length(vec2((lx - 0.5) / cols, y - hgt - 0.008)));
  c += uMag * beacon * (0.6 + 0.4 * sin(uTime * 4.0 + cx));
  return vec4(c, 1.0);
}

vec3 scene(vec2 uv){
  float hz = -0.04 - uScroll * 0.28 + uMouse.y * 0.025;
  float sy = uv.y - hz;
  vec3 col = vec3(0.01, 0.01, 0.022);

  if (sy >= 0.0) {
    // sky: magenta haze at the horizon fading into cold blue
    col += uMag * 0.22 * exp(-sy * 7.0);
    col += uCyan * 0.04 * exp(-sy * 2.0);
    // digital rain
    float cols = 110.0;
    float cx = floor(uv.x * cols);
    float sp = 0.25 + h11(cx) * 0.9;
    float t = fract(uv.y * 1.2 + uTime * sp * 0.32 + h11(cx * 7.0));
    float drop = pow(t, 22.0) * step(0.55, h11(cx * 3.7));
    col += uCyan * drop * 0.4 * smoothstep(0.02, 0.5, sy);

    vec4 far = city(uv + vec2(uMouse.x * 0.015 + uTravel * 0.0015, 0.0), hz, 30.0, 0.34, 3.0, 0.45);
    col = mix(col, far.rgb + uMag * 0.03, far.a);
    vec4 near = city(uv + vec2(uMouse.x * 0.045 + uTravel * 0.005, 0.0), hz, 13.0, 0.24, 11.0, 1.0);
    col = mix(col, near.rgb, near.a);
  } else {
    // floor: perspective grid racing toward the camera
    float z = 0.32 / (-sy + 0.0005);
    float x = (uv.x + uMouse.x * 0.08) * z;
    float zz = z + uTravel;
    float w = 0.018 + z * 0.0035;
    float g = max(gridLine(x * 0.5, w), gridLine(zz * 0.5, w));
    float fog = exp(-z * 0.075);
    vec3 gc = mix(uCyan, uMag, smoothstep(-4.0, 4.0, x * 0.35));
    col = vec3(0.008, 0.006, 0.018) + gc * g * fog * 1.35;
    // light trails along the centre lanes
    float lane = gridLine(x * 0.5 - 0.5, 0.06) * step(abs(x), 3.0);
    float pulse = pow(fract(zz * 0.08 - uTime * 0.6), 10.0);
    col += uNeon * lane * pulse * fog * 1.6;
    // horizon reflection
    col += uMag * 0.3 * exp(sy * 16.0);
  }
  // the hot horizon line
  col += mix(uMag, uNeon, 0.2) * exp(-abs(sy) * 110.0) * 1.1;
  return col;
}

void main(){
  vec2 fc = gl_FragCoord.xy;
  vec2 uv = (fc - 0.5 * uRes) / uRes.y;

  float gt = floor(uTime * 16.0);
  float row = floor(uv.y * 26.0);
  float ag = step(0.975, h11(floor(uTime * 2.5) + 0.37));
  float g = max(uGlitch, ag * 0.5);
  float sh = (h21(vec2(row, gt)) - 0.5) * step(0.72, h21(vec2(row * 1.7, gt))) * g * 0.22;
  uv.x += sh;

  float ab = 0.0015 + g * 0.014 + dot(uv, uv) * 0.004;
  vec3 col;
  col.r = scene(uv + vec2(ab, 0.0)).r;
  col.g = scene(uv).g;
  col.b = scene(uv - vec2(ab, 0.0)).b;

  col *= 1.0 - 0.55 * dot(uv * 0.75, uv * 0.75);
  col *= 0.9 + 0.1 * sin(fc.y * 1.7 + uTime * 8.0);
  col *= 1.0 - uScroll * 0.55;
  col = pow(col, vec3(0.92));
  gl_FragColor = vec4(col, 1.0);
}
`

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader compile failed')
  return s
}

interface Props {
  /** 0 → 1 as the hero scrolls away. */
  progressRef?: RefObject<number>
  /** 0 → 1 glitch intensity, decays automatically. */
  glitchRef?: RefObject<number>
  className?: string
}

export function NeonCity({ progressRef, glitchRef, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const [failed, setFailed] = useState(() => !hasWebGL())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || failed) return
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' })
    if (!gl) {
      setFailed(true)
      return
    }

    let prog: WebGLProgram
    try {
      prog = gl.createProgram()!
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT))
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG))
      gl.linkProgram(prog)
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link failed')
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[NeonCity]', err)
      setFailed(true)
      return
    }
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const u = (n: string) => gl.getUniformLocation(prog, n)
    const uRes = u('uRes')
    const uTime = u('uTime')
    const uTravel = u('uTravel')
    const uMouse = u('uMouse')
    const uScroll = u('uScroll')
    const uGlitch = u('uGlitch')
    gl.uniform3fv(u('uNeon'), hexToVec3(cssVar('--neon', '#f5ee0b')))
    gl.uniform3fv(u('uCyan'), hexToVec3(cssVar('--cyan', '#00f0ff')))
    gl.uniform3fv(u('uMag'), hexToVec3(cssVar('--magenta', '#ff2a6d')))

    // Render below native resolution: the CRT look forgives it and fill-rate is the bottleneck.
    const scale = Math.min(window.devicePixelRatio || 1, maxDpr()) * 0.75
    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * scale))
      const h = Math.max(1, Math.round(canvas.clientHeight * scale))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
      gl.uniform2f(uRes, w, h)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.ty = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    let travel = 0
    let time = 0
    let inView = true
    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting))
    io.observe(canvas)

    const draw = (dt: number) => {
      const scroll = progressRef?.current ?? 0
      const glitch = glitchRef?.current ?? 0
      time += dt
      travel += dt * (1.6 + scroll * 14)
      mouse.x += (mouse.tx - mouse.x) * 0.05
      mouse.y += (mouse.ty - mouse.y) * 0.05
      gl.uniform1f(uTime, time)
      gl.uniform1f(uTravel, travel)
      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.uniform1f(uScroll, scroll)
      gl.uniform1f(uGlitch, glitch)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (glitchRef && glitch > 0) glitchRef.current = Math.max(0, glitch - dt * 1.8)
    }

    const onLost = (e: Event) => {
      e.preventDefault()
      setFailed(true)
    }
    canvas.addEventListener('webglcontextlost', onLost)

    let tick: ((t: number, dt: number) => void) | null = null
    if (reduced) {
      time = 12.4
      draw(0)
    } else {
      tick = (_t, dtMs) => {
        if (!inView || document.hidden) return
        draw(Math.min(dtMs, 50) / 1000)
      }
      gsap.ticker.add(tick)
    }

    return () => {
      if (tick) gsap.ticker.remove(tick)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('webglcontextlost', onLost)
      gl.deleteProgram(prog)
      gl.deleteBuffer(buf)
    }
  }, [failed, reduced, progressRef, glitchRef])

  if (failed) {
    return (
      <div
        aria-hidden="true"
        className={cn('grid-bg', className)}
        style={{
          backgroundColor: 'var(--void)',
          backgroundImage:
            'radial-gradient(ellipse 80% 40% at 50% 62%, color-mix(in srgb, var(--magenta) 30%, transparent), transparent 70%), linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 48px 48px, 48px 48px',
        }}
      />
    )
  }
  return <canvas ref={canvasRef} aria-hidden="true" className={cn('block h-full w-full', className)} />
}
