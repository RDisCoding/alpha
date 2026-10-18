import type { ReactNode } from 'react'
import type { CoverArt } from '@/content/projects'

/*
 * Deterministic, research-figure-style artwork for projects without screenshots.
 * Same seed → same SVG on server and client (no Math.random), so it's hydration-safe.
 */

const W = 1600
const H = 1000
const INK = '#0c0a12'
const LILAC = '#cdb9ff'
const VIOLET = '#9b5cff'

function rng(seed: string) {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  let a = h >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const f = (n: number) => Math.round(n * 10) / 10
type Rand = () => number

function nodes(rand: Rand): ReactNode {
  const layers = 6
  const cols = Array.from({ length: layers }, (_, l) => {
    const n = 3 + Math.floor(rand() * 6)
    const x = 220 + (l * (W - 440)) / (layers - 1)
    return Array.from({ length: n }, (_, i) => ({
      x: f(x + (rand() - 0.5) * 50),
      y: f(H / 2 + (i - (n - 1) / 2) * (620 / Math.max(n - 1, 1)) + (rand() - 0.5) * 36),
    }))
  })
  const edges: ReactNode[] = []
  cols.slice(0, -1).forEach((col, l) =>
    col.forEach((a, i) =>
      cols[l + 1].forEach((b, j) => {
        if (rand() < 0.5) edges.push(<line key={`${l}-${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={LILAC} strokeOpacity={f(0.08 + rand() * 0.16)} strokeWidth={1.2} />)
      }),
    ),
  )
  const path = cols.map((c) => c[Math.floor(rand() * c.length)])
  const d = path.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ')
  return (
    <>
      {edges}
      <path d={d} fill="none" stroke={VIOLET} strokeOpacity={0.25} strokeWidth={18} strokeLinejoin="round" />
      <path d={d} fill="none" stroke={LILAC} strokeWidth={3} strokeLinejoin="round" />
      {cols.flat().map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={6} fill={LILAC} fillOpacity={0.5} />
      ))}
      {path.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={26} fill="none" stroke={VIOLET} strokeOpacity={0.55} />
          <circle cx={p.x} cy={p.y} r={10} fill="#fff" />
        </g>
      ))}
    </>
  )
}

function ridges(rand: Rand, gradId: string): ReactNode {
  const lines = 34
  const top = 210
  const bottom = 900
  const x0 = 160
  const x1 = W - 160
  const samples = 80
  const out: ReactNode[] = []
  const hot = Math.floor(lines * (0.45 + rand() * 0.2))
  for (let i = 0; i < lines; i++) {
    const base = top + (i * (bottom - top)) / (lines - 1)
    const p1 = rand() * 6
    const p2 = rand() * 6
    const p3 = rand() * 6
    const c = 0.5 + (rand() - 0.5) * 0.12
    const pts: string[] = []
    for (let s = 0; s <= samples; s++) {
      const t = s / samples
      const env = Math.exp(-Math.pow((t - c) / 0.17, 2))
      const n = 0.55 * Math.sin(t * 23 + p1) + 0.3 * Math.sin(t * 51 + p2) + 0.15 * Math.sin(t * 97 + p3)
      const y = base - Math.max(0, env * (55 + 70 * (n + 1) * 0.5) * (0.6 + rand() * 0.5))
      pts.push(`${f(x0 + t * (x1 - x0))} ${f(y)}`)
    }
    const line = `M${pts.join(' L')}`
    out.push(
      <g key={i}>
        <path d={`${line} L${x1} ${H} L${x0} ${H} Z`} fill={`url(#${gradId})`} />
        <path d={line} fill="none" stroke={i === hot ? VIOLET : LILAC} strokeOpacity={i === hot ? 1 : 0.55} strokeWidth={i === hot ? 3 : 1.6} />
      </g>,
    )
  }
  return out
}

function spectro(rand: Rand): ReactNode {
  const cols = 48
  const rows = 24
  const cw = W / cols
  const ch = H / rows
  const formants = [0.18, 0.36, 0.58].map((b) => ({ b, ph: rand() * 6 }))
  const energy = (c: number, r: number) => {
    const t = c / cols
    const fr = 1 - r / rows
    const voiced = 0.55 + 0.45 * Math.sin(t * 19 + formants[0].ph)
    let e = 0
    formants.forEach((fm, k) => {
      const center = fm.b + 0.06 * Math.sin(t * (7 + k * 3) + fm.ph)
      e += Math.exp(-Math.pow((fr - center) / 0.055, 2)) * (1 - k * 0.22)
    })
    return Math.min(1, e * voiced + rand() * 0.12)
  }
  const grid = Array.from({ length: cols }, (_, c) => Array.from({ length: rows }, (_, r) => energy(c, r)))
  // Copy-move: paste a source window over a target window.
  const span = 7
  const src = 6 + Math.floor(rand() * 8)
  const dst = 30 + Math.floor(rand() * 8)
  for (let k = 0; k < span; k++) grid[dst + k] = grid[src + k]

  const cells: ReactNode[] = []
  grid.forEach((col, c) =>
    col.forEach((e, r) => {
      if (e < 0.08) return
      cells.push(<rect key={`${c}-${r}`} x={f(c * cw + 1)} y={f(r * ch + 1)} width={f(cw - 2)} height={f(ch - 2)} fill={e > 0.62 ? LILAC : VIOLET} fillOpacity={f(e > 0.62 ? e : e * 0.85)} />)
    }),
  )
  const box = (start: number, label: string, solid: boolean) => (
    <g>
      <rect x={start * cw} y={18} width={span * cw} height={H - 36} fill="none" stroke="#fff" strokeWidth={2.5} strokeDasharray={solid ? undefined : '12 10'} />
      <rect x={start * cw} y={18} width={label.length * 15 + 24} height={34} fill="#fff" />
      <text x={start * cw + 12} y={41} fontFamily="monospace" fontSize={20} fill={INK}>
        {label}
      </text>
    </g>
  )
  return (
    <>
      {cells}
      {box(src, 'SRC', false)}
      {box(dst, 'TGT · FORGED', true)}
    </>
  )
}

function matrix(rand: Rand): ReactNode {
  const cols = 36
  const rows = 22
  const gx = (W - 200) / (cols - 1)
  const gy = (H - 200) / (rows - 1)
  const p1 = rand() * 6
  const p2 = rand() * 6
  const dots: ReactNode[] = []
  const anomalies: { x: number; y: number }[] = []
  for (let c = 0; c < cols; c++)
    for (let r = 0; r < rows; r++) {
      const x = 100 + c * gx
      const y = 100 + r * gy
      const v = 0.5 + 0.25 * Math.sin(c * 0.35 + p1) * Math.cos(r * 0.42 + p2) + 0.25 * rand()
      if (rand() < 0.012 && anomalies.length < 7) anomalies.push({ x, y })
      dots.push(<circle key={`${c}-${r}`} cx={f(x)} cy={f(y)} r={f(1.5 + v * 5)} fill={LILAC} fillOpacity={f(0.12 + v * 0.38)} />)
    }
  if (anomalies.length < 4) anomalies.push({ x: 100 + gx * 24, y: 100 + gy * 6 }, { x: 100 + gx * 9, y: 100 + gy * 15 })
  return (
    <>
      {dots}
      {anomalies.map((a, i) => (
        <g key={i}>
          <circle cx={f(a.x)} cy={f(a.y)} r={30} fill="none" stroke={VIOLET} strokeWidth={2} />
          <circle cx={f(a.x)} cy={f(a.y)} r={9} fill="#fff" />
          <line x1={f(a.x - 56)} y1={f(a.y)} x2={f(a.x - 36)} y2={f(a.y)} stroke="#fff" strokeWidth={2} />
          <line x1={f(a.x + 36)} y1={f(a.y)} x2={f(a.x + 56)} y2={f(a.y)} stroke="#fff" strokeWidth={2} />
          <text x={f(a.x + 40)} y={f(a.y - 34)} fontFamily="monospace" fontSize={18} fill={LILAC}>
            {`flag_${String(i + 1).padStart(2, '0')}`}
          </text>
        </g>
      ))}
    </>
  )
}

function orbits(rand: Rand): ReactNode {
  const cx = W / 2 + (rand() - 0.5) * 200
  const cy = H / 2
  const rings = 7
  const out: ReactNode[] = []
  const tilt = -18 + rand() * 36
  for (let i = 0; i < rings; i++) {
    const rx = 120 + i * 95
    const ry = rx * 0.42
    out.push(<ellipse key={`e${i}`} cx={f(cx)} cy={cy} rx={rx} ry={f(ry)} fill="none" stroke={LILAC} strokeOpacity={f(0.12 + (i % 2) * 0.12)} strokeWidth={1.4} transform={`rotate(${f(tilt)} ${f(cx)} ${cy})`} />)
    const count = 1 + Math.floor(rand() * 3)
    for (let k = 0; k < count; k++) {
      const a = rand() * Math.PI * 2
      const px = cx + Math.cos(a) * rx
      const py = cy + Math.sin(a) * ry
      const lit = rand() < 0.35
      out.push(
        <g key={`n${i}-${k}`} transform={`rotate(${f(tilt)} ${f(cx)} ${cy})`}>
          {lit && <line x1={f(cx)} y1={cy} x2={f(px)} y2={f(py)} stroke={VIOLET} strokeOpacity={0.6} strokeWidth={1.6} strokeDasharray="6 8" />}
          <circle cx={f(px)} cy={f(py)} r={lit ? 11 : 6} fill={lit ? '#fff' : LILAC} fillOpacity={lit ? 1 : 0.6} />
        </g>,
      )
    }
  }
  return (
    <>
      {out}
      <circle cx={f(cx)} cy={cy} r={64} fill={VIOLET} fillOpacity={0.25} />
      <circle cx={f(cx)} cy={cy} r={34} fill={LILAC} />
    </>
  )
}

function bars(rand: Rand): ReactNode {
  const n = 46
  const x0 = 140
  const x1 = W - 140
  const base = H - 170
  const bw = (x1 - x0) / n
  const out: ReactNode[] = []
  const curve: string[] = []
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const h = (0.25 + 0.75 * Math.exp(-t * 2.6)) * 560 * (0.55 + rand() * 0.45)
    const picked = rand() < 0.3
    out.push(<rect key={i} x={f(x0 + i * bw + 3)} y={f(base - h)} width={f(bw - 6)} height={f(h)} fill={picked ? VIOLET : LILAC} fillOpacity={picked ? 0.95 : 0.18} />)
    curve.push(`${f(x0 + i * bw + bw / 2)} ${f(base - 600 * (0.12 + 0.88 * Math.exp(-t * 3.4)) - 40)}`)
  }
  return (
    <>
      {out}
      <line x1={x0} y1={base} x2={x1} y2={base} stroke={LILAC} strokeOpacity={0.5} strokeWidth={2} />
      <path d={`M${curve.join(' L')}`} fill="none" stroke="#fff" strokeWidth={3} />
      <text x={x0} y={base + 52} fontFamily="monospace" fontSize={20} fill={LILAC} fillOpacity={0.8}>
        ■ selected   □ sampled   — loss
      </text>
    </>
  )
}

function court(rand: Rand): ReactNode {
  const x0 = 260
  const y0 = 170
  const w = W - 520
  const h = H - 340
  const stroke = { stroke: LILAC, strokeOpacity: 0.7, strokeWidth: 3, fill: 'none' }
  const slots: ReactNode[] = []
  for (let i = 0; i < 9; i++) {
    const booked = rand() < 0.45
    slots.push(<rect key={i} x={x0 + i * (w / 9) + 6} y={H - 120} width={w / 9 - 12} height={34} rx={6} fill={booked ? VIOLET : 'none'} stroke={LILAC} strokeOpacity={0.5} />)
  }
  const bx = x0 + w * (0.2 + rand() * 0.2)
  const ex = x0 + w * (0.65 + rand() * 0.2)
  return (
    <>
      <rect x={x0} y={y0} width={w} height={h} {...stroke} />
      <rect x={x0} y={y0 + h * 0.12} width={w} height={h * 0.76} {...stroke} strokeOpacity={0.35} />
      <line x1={x0 + w / 2} y1={y0 - 30} x2={x0 + w / 2} y2={y0 + h + 30} stroke={VIOLET} strokeWidth={6} />
      <line x1={x0 + w * 0.2} y1={y0 + h / 2} x2={x0 + w * 0.8} y2={y0 + h / 2} {...stroke} strokeOpacity={0.35} />
      <line x1={x0 + w * 0.2} y1={y0} x2={x0 + w * 0.2} y2={y0 + h} {...stroke} strokeOpacity={0.35} />
      <line x1={x0 + w * 0.8} y1={y0} x2={x0 + w * 0.8} y2={y0 + h} {...stroke} strokeOpacity={0.35} />
      <path d={`M${f(bx)} ${y0 + h * 0.78} Q ${x0 + w / 2} ${y0 - 120} ${f(ex)} ${y0 + h * 0.3}`} fill="none" stroke="#fff" strokeWidth={2.5} strokeDasharray="10 12" />
      <circle cx={f(ex)} cy={y0 + h * 0.3} r={14} fill="#fff" />
      {slots}
    </>
  )
}

/** `uid` keeps gradient ids unique when the same cover renders twice on a page. */
type Props = { art: CoverArt; seed: string; uid?: string; className?: string }

export default function GenerativeCover({ art, seed, uid = 'a', className }: Props) {
  const rand = rng(seed)
  const id = `gc-${seed.replace(/[^a-z0-9]/gi, '')}-${uid}`
  const gx = f(300 + rand() * 1000)
  const gy = f(200 + rand() * 600)

  const content = {
    nodes: () => nodes(rand),
    ridges: () => ridges(rand, `${id}-bg`),
    spectro: () => spectro(rand),
    matrix: () => matrix(rand),
    orbits: () => orbits(rand),
    bars: () => bars(rand),
    court: () => court(rand),
  }[art]()

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-bg`} cx={gx} cy={gy} r={900} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2c1366" />
          <stop offset="0.55" stopColor="#140d24" />
          <stop offset="1" stopColor={INK} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-bg)`} />
      {content}
    </svg>
  )
}
