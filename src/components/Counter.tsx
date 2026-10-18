'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/runtime'

type Props = { value: number; decimals?: number; prefix?: string; suffix?: string }

/** Counts up from zero when scrolled into view. Server HTML holds the final value. */
export default function Counter({ value, decimals = 0, prefix = '', suffix = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const state = { v: 0 }
    const render = () => (el.textContent = `${prefix}${state.v.toFixed(decimals)}${suffix}`)
    render()
    gsap.to(state, {
      v: value,
      duration: 2.2,
      ease: 'power3.out',
      onUpdate: render,
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    })
  })

  return (
    <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  )
}
