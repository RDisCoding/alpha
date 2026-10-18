'use client'

import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/runtime'

const COLS = 72
const ROWS = 30
const COPY_SPAN = 9

/**
 * A live, scrolling "spectrogram" that periodically performs a copy-move forgery:
 * a past window of columns gets pasted back in, and both regions are boxed (SRC / TGT).
 */
export default function Spectrogram({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduced = prefersReducedMotion()
    const history: number[][] = []
    let gid = 0 // global id of the next column
    let t = 0
    let copy: { src: number; dst: number; left: number } | null = null
    const marks: { src: number; dst: number }[] = []

    const fresh = () => {
      t += 0.09
      const voiced = 0.5 + 0.5 * Math.sin(t * 0.9) * Math.sin(t * 0.37 + 1)
      return Array.from({ length: ROWS }, (_, r) => {
        const fr = 1 - r / ROWS
        let e = 0
        ;[0.16, 0.34, 0.55, 0.74].forEach((b, k) => {
          const c = b + 0.05 * Math.sin(t * (0.6 + k * 0.3) + k)
          e += Math.exp(-Math.pow((fr - c) / 0.045, 2)) * (1 - k * 0.2)
        })
        return Math.min(1, e * Math.max(0.15, voiced) + Math.random() * 0.1 + (fr < 0.08 ? 0.35 : 0))
      })
    }

    const push = () => {
      let col: number[]
      if (copy) {
        col = history[history.length - (gid - copy.src - (COPY_SPAN - copy.left))] ?? fresh()
        copy.left--
        if (copy.left === 0) copy = null
      } else {
        col = fresh()
        if (gid > COLS && gid % 48 === 0) {
          const src = gid - 28
          copy = { src, dst: gid + 1, left: COPY_SPAN }
          // Only box the latest forgery, so SRC always reads before TGT.
          marks.length = 0
          marks.push({ src, dst: gid + 1 })
        }
      }
      history.push(col)
      if (history.length > COLS * 2) history.shift()
      gid++
    }

    for (let i = 0; i < COLS; i++) push()

    let w = 0
    let h = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (offset: number) => {
      ctx.fillStyle = '#0c0a12'
      ctx.fillRect(0, 0, w, h)
      const cw = w / (COLS - 1)
      const ch = h / ROWS
      const cols = history.slice(-COLS)
      const firstId = gid - cols.length
      cols.forEach((col, c) => {
        const x = c * cw - offset * cw
        col.forEach((e, r) => {
          if (e < 0.06) return
          ctx.fillStyle = e > 0.6 ? `rgba(205,185,255,${e})` : `rgba(155,92,255,${e * 0.85})`
          ctx.fillRect(x + 1, r * ch + 1, cw - 2, ch - 2)
        })
      })
      ctx.font = '10px ui-monospace, monospace'
      ctx.lineWidth = 1.5
      marks.forEach((m) => {
        ;[
          { id: m.src, label: 'SRC', dash: [5, 5] },
          { id: m.dst, label: 'TGT', dash: [] as number[] },
        ].forEach((b) => {
          const x = (b.id - firstId) * cw - offset * cw
          if (x + COPY_SPAN * cw < 0 || x > w) return
          ctx.setLineDash(b.dash)
          ctx.strokeStyle = '#fff'
          ctx.strokeRect(x, 6, COPY_SPAN * cw, h - 12)
          ctx.setLineDash([])
          ctx.fillStyle = '#fff'
          ctx.fillRect(x, 6, 34, 16)
          ctx.fillStyle = '#0c0a12'
          ctx.fillText(b.label, x + 6, 18)
        })
      })
      while (marks.length && marks[0].dst - firstId < -COPY_SPAN) marks.shift()
    }

    resize()
    const ro = new ResizeObserver(() => {
      resize()
      draw(0)
    })
    ro.observe(canvas)

    let visible = false
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(canvas)

    let raf = 0
    let acc = 0
    let last = performance.now()
    const STEP = 70 // ms per column
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible) {
        last = now
        return
      }
      acc += now - last
      last = now
      while (acc >= STEP) {
        push()
        acc -= STEP
      }
      draw(acc / STEP)
    }

    draw(0)
    if (!reduced) raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
