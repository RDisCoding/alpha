'use client'

import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/runtime'

const VERT = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

// Domain-warped simplex fBm with a fake-lit sheen ("violet silk"), lensed around the pointer.
const FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uSeed;
uniform float uFade;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p, int octaves) {
  float f = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    if (i >= octaves) break;
    f += a * snoise(p);
    p = rot * p * 2.03;
    a *= 0.48;
  }
  return f;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0);
  float t = uTime * 0.05 + uSeed;

  // Pointer lens
  vec2 d = p - m;
  float md = dot(d, d);
  p -= d * 0.35 * exp(-md * 5.0);

  // Two layers of domain warping → long silk ribbons
  vec2 q = vec2(fbm(p * 0.35 + vec2(0.0, t), 2), fbm(p * 0.35 + vec2(5.2, -t * 0.8), 2));
  vec2 r = vec2(
    fbm(p * 0.5 + 1.5 * q + vec2(1.7, 9.2) + t * 0.6, 2),
    fbm(p * 0.5 + 1.5 * q + vec2(8.3, 2.8) - t * 0.5, 2)
  );
  vec2 fp = p * 0.45 + 1.6 * r;
  float f = 0.5 + 0.5 * fbm(fp, 2);

  vec3 ink = vec3(0.031, 0.027, 0.043);
  vec3 deep = vec3(0.12, 0.045, 0.30);
  vec3 violet = vec3(0.50, 0.24, 1.0);
  vec3 lilac = vec3(0.86, 0.80, 1.0);

  float silk = smoothstep(0.42, 0.95, f);
  vec3 col = mix(ink, deep, smoothstep(0.3, 0.75, f));
  col = mix(col, violet, silk * clamp(length(q) * 1.6, 0.0, 1.0) * 0.9);
  col += lilac * pow(silk, 4.0) * 0.55 * clamp(length(r) * 1.8, 0.0, 1.0);

  // Fake-lit sheen from the field's gradient
  float e = 0.012;
  float fx = 0.5 + 0.5 * fbm(fp + vec2(e, 0.0), 2);
  float fy = 0.5 + 0.5 * fbm(fp + vec2(0.0, e), 2);
  vec3 nrm = normalize(vec3((f - fx) / e, (f - fy) / e, 1.4));
  float spec = pow(max(dot(nrm, normalize(vec3(-0.4, 0.6, 0.7))), 0.0), 18.0);
  col += mix(violet, lilac, 0.5) * spec * 0.6 * smoothstep(0.3, 0.8, f);

  col += violet * 0.22 * exp(-md * 7.0);

  float vig = smoothstep(1.35, 0.2, length(p * vec2(0.7, 1.05)));
  col *= mix(0.25, 1.0, vig);
  col = mix(col, ink, smoothstep(0.5, 0.0, uv.y) * 0.7);
  col = mix(ink, col, uFade);

  float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (n - 0.5) / 128.0;
  gl_FragColor = vec4(col, 1.0);
}
`

const RENDER_SCALE = 0.5

type Props = { className?: string; seed?: number }

export default function ShaderCanvas({ className, seed = 0 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'high-performance' })
    if (!gl) {
      canvas.dataset.state = 'fallback'
      return
    }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s))
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.dataset.state = 'fallback'
      return
    }
    gl.useProgram(prog)

    // One oversized triangle covers the viewport.
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(prog, 'uRes')
    const uTime = gl.getUniformLocation(prog, 'uTime')
    const uMouse = gl.getUniformLocation(prog, 'uMouse')
    const uSeed = gl.getUniformLocation(prog, 'uSeed')
    const uFade = gl.getUniformLocation(prog, 'uFade')
    gl.uniform1f(uSeed, seed)

    const reduced = prefersReducedMotion()
    const mouse = { x: 0.62, y: 0.6, tx: 0.62, ty: 0.6 }
    let visible = true
    let fade = reduced ? 1 : 0
    let raf = 0
    const start = performance.now()

    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * RENDER_SCALE))
      const h = Math.max(1, Math.round(canvas.clientHeight * RENDER_SCALE))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
        gl.uniform2f(uRes, w, h)
      }
    }

    const draw = (time: number) => {
      gl.uniform1f(uTime, time)
      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.uniform1f(uFade, fade)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible) return
      mouse.x += (mouse.tx - mouse.x) * 0.045
      mouse.y += (mouse.ty - mouse.y) * 0.045
      fade = Math.min(1, fade + 0.012)
      draw((now - start) / 1000)
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.tx = (e.clientX - r.left) / r.width
      mouse.ty = 1 - (e.clientY - r.top) / r.height
    }

    const ro = new ResizeObserver(() => {
      resize()
      if (reduced) draw(12)
    })
    ro.observe(canvas)
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
    io.observe(canvas)

    resize()
    canvas.dataset.state = 'ready'
    if (reduced) draw(12)
    else {
      window.addEventListener('pointermove', onMove, { passive: true })
      raf = requestAnimationFrame(frame)
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      // Free the context on real unmounts (not StrictMode's simulated one, where the node stays mounted).
      if (!canvas.isConnected) gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [seed])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
