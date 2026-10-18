'use client'

import { Fragment, useEffect, useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/runtime'
import styles from './Marquee.module.css'

type Props = {
  items: string[]
  /** Pixels per second at rest. */
  speed?: number
  reverse?: boolean
  separator?: ReactNode
  className?: string
}

/** Infinite marquee that speeds up, skews and flips direction with scroll velocity. */
export default function Marquee({ items, speed = 70, reverse = false, separator = '✦', className = '' }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = track.current
    if (!el || !root.current || prefersReducedMotion()) return

    let half = el.scrollWidth / 2
    let x = 0
    let boost = 0
    let scrollDir = 1
    let visible = true
    const base = reverse ? -1 : 1

    const ro = new ResizeObserver(() => (half = el.scrollWidth / 2))
    ro.observe(el)
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
    io.observe(root.current)

    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        boost = Math.min(Math.abs(self.getVelocity()) / 260, 8)
        scrollDir = self.direction
      },
    })

    const setX = gsap.quickSetter(el, 'x', 'px')
    const setSkew = gsap.quickSetter(el, 'skewX', 'deg')
    const tick = (_: number, dt: number) => {
      if (!visible) return
      boost *= 0.93
      x -= (speed * (1 + boost) * base * scrollDir * dt) / 1000
      if (x <= -half) x += half
      if (x > 0) x -= half
      setX(x)
      setSkew(-boost * base * scrollDir * 1.2)
    }
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      st.kill()
      ro.disconnect()
      io.disconnect()
    }
  }, [speed, reverse])

  const group = (
    <>
      {[...items, ...items].map((item, i) => (
        <Fragment key={i}>
          <span className={styles.item}>{item}</span>
          <span className={styles.sep} aria-hidden="true">
            {separator}
          </span>
        </Fragment>
      ))}
    </>
  )

  return (
    <div ref={root} className={`${styles.marquee} ${className}`}>
      <div ref={track} className={styles.track}>
        <div className={styles.group}>{group}</div>
        <div className={styles.group} aria-hidden="true">
          {group}
        </div>
      </div>
    </div>
  )
}
