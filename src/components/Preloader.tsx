'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { getLenis, markIntroDone, prefersReducedMotion, scrollTo } from '@/lib/runtime'
import styles from './Preloader.module.css'

const LOG = [
  { at: 8, text: 'initializing weights' },
  { at: 34, text: 'loading tensors' },
  { at: 61, text: 'warming up attention' },
  { at: 88, text: 'compiling curiosity' },
]

function finish() {
  document.documentElement.classList.remove('is-loading')
  getLenis()?.start()
  markIntroDone()
  // Deep links like /#research: jump there once layout (pins included) has settled.
  const hash = window.location.hash
  if (hash.length > 1) {
    ScrollTrigger.refresh()
    requestAnimationFrame(() => scrollTo(hash, { immediate: true }))
  }
}

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const log = useRef<HTMLOListElement>(null)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) {
      finish()
      setGone(true)
      return
    }

    let seen = false
    try {
      seen = sessionStorage.getItem('rd:seen') === '1'
      sessionStorage.setItem('rd:seen', '1')
    } catch {}

    const lines = Array.from(log.current?.children ?? []) as HTMLElement[]
    const state = { v: 0 }
    const counting = new Promise<void>((resolve) => {
      gsap.to(state, {
        v: 100,
        duration: seen ? 1 : 2.4,
        ease: 'power3.inOut',
        onUpdate: () => {
          const v = Math.round(state.v)
          if (count.current) count.current.textContent = String(v).padStart(3, '0')
          if (bar.current) bar.current.style.transform = `scaleX(${state.v / 100})`
          LOG.forEach((l, i) => lines[i]?.classList.toggle(styles.on, v >= l.at))
        },
        onComplete: resolve,
      })
    })
    const loaded = new Promise<void>((resolve) => {
      if (document.readyState === 'complete') resolve()
      else window.addEventListener('load', () => resolve(), { once: true })
      setTimeout(resolve, 5000)
    })

    let killed = false
    Promise.all([counting, loaded, document.fonts?.ready]).then(() => {
      if (killed || !root.current) return
      const tl = gsap.timeline({ onComplete: () => setGone(true) })
      tl.to(root.current.firstElementChild, { yPercent: -12, autoAlpha: 0, duration: 0.7, ease: 'power3.in' }, 0)
        .to(root.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.25, ease: 'expo.inOut' }, 0.25)
        .add(finish, 0.75)
    })

    return () => {
      killed = true
    }
  }, [])

  if (gone) return null

  return (
    <div ref={root} className={`${styles.preloader} preloader`} aria-hidden="true">
      <div className={styles.inner}>
        <div className={`${styles.top} mono`}>
          <span>Rudray Dave</span>
          <span>AI Engineer & Researcher</span>
          <span suppressHydrationWarning>Portfolio ©{new Date().getFullYear()}</span>
        </div>

        <ol ref={log} className={`${styles.log} mono`}>
          {LOG.map((l) => (
            <li key={l.text}>
              <span>&gt; {l.text}</span>
              <span className={styles.dots} />
              <span>ok</span>
            </li>
          ))}
        </ol>

        <div className={styles.bottom}>
          <div className={styles.count}>
            <span ref={count}>000</span>
            <sup>%</sup>
          </div>
          <div className={styles.barWrap}>
            <span className="mono">Loading weights</span>
            <div className={styles.bar}>
              <span ref={bar} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
