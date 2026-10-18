'use client'

import { useEffect, useRef } from 'react'
import { sound } from '@/lib/sound/engine'
import { prefersReducedMotion } from '@/lib/runtime'
import styles from './SoundBars.module.css'

type Props = {
  /** Drive the bars from the live audio. */
  active?: boolean
  /** Decorative bounce (used before audio exists, e.g. on the "Enter with sound" button). */
  demo?: boolean
  className?: string
}

/** Four equaliser bars that move with the actual music. */
export default function SoundBars({ active = false, demo = false, className = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const bars = Array.from(ref.current?.children ?? []) as HTMLElement[]
    if (!active || prefersReducedMotion()) {
      bars.forEach((b) => (b.style.transform = ''))
      return
    }
    const levels = [0, 0, 0, 0]
    let raf = 0
    const loop = () => {
      sound.levels(levels)
      bars.forEach((b, i) => (b.style.transform = `scaleY(${0.2 + Math.min(1, levels[i] * 1.5) * 0.8})`))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [active])

  return (
    <span ref={ref} className={`${styles.bars} ${className}`} data-active={active || undefined} data-demo={demo || undefined} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  )
}
