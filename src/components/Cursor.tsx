'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from '@/lib/gsap'
import { hasFinePointer } from '@/lib/runtime'
import styles from './Cursor.module.css'

/**
 * Dot + trailing ring. Elements opt in with:
 *   data-cursor="link"            → ring grows
 *   data-cursor="view" data-cursor-label="Open"  → filled disc with a label
 *   data-cursor="hide"            → cursor fades out (e.g. over media)
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (!hasFinePointer() || !dot.current || !ring.current) return
    const html = document.documentElement
    html.classList.add('has-cursor')

    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.12, ease: 'power3' })
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.12, ease: 'power3' })
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.55, ease: 'power3' })
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.55, ease: 'power3' })

    let visible = false
    const move = (e: PointerEvent) => {
      if (!visible) {
        visible = true
        gsap.set([dot.current, ring.current], { x: e.clientX, y: e.clientY })
        gsap.to([dot.current, ring.current], { autoAlpha: 1, duration: 0.3 })
      }
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
    }

    const setState = (target: Element | null) => {
      const el = target?.closest<HTMLElement>('[data-cursor], a, button, [role="button"], summary, label')
      const mode = el?.dataset.cursor ?? (el ? 'link' : '')
      ring.current!.dataset.mode = mode
      dot.current!.dataset.mode = mode
      if (label.current) label.current.textContent = mode === 'view' ? el?.dataset.cursorLabel || 'View' : ''
    }

    const over = (e: MouseEvent) => setState(e.target as Element)
    const leave = () => {
      visible = false
      gsap.to([dot.current, ring.current], { autoAlpha: 0, duration: 0.3 })
    }
    const down = () => gsap.to(ring.current, { scale: 0.8, duration: 0.2 })
    const up = () => gsap.to(ring.current, { scale: 1, duration: 0.4 })

    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('mouseover', over)
    document.documentElement.addEventListener('mouseleave', leave)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)

    return () => {
      html.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('mouseover', over)
      document.documentElement.removeEventListener('mouseleave', leave)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  // Reset hover state after client-side navigation.
  useEffect(() => {
    if (ring.current) ring.current.dataset.mode = ''
    if (dot.current) dot.current.dataset.mode = ''
  }, [pathname])

  return (
    <>
      <div ref={ring} className={styles.ring} aria-hidden="true">
        <span ref={label} className={`${styles.label} mono`} />
      </div>
      <div ref={dot} className={styles.dot} aria-hidden="true" />
    </>
  )
}
