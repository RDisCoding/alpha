'use client'

import { useEffect, useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { hasFinePointer, onIntroDone, prefersReducedMotion } from '@/lib/runtime'
import { profile } from '@/content/profile'
import ShaderCanvas from '@/components/ShaderCanvas'
import TransitionLink from '@/components/TransitionLink'
import styles from './Hero.module.css'

const letters = (word: string, weighted = false) =>
  word.split('').map((c, i) => (
    <span key={i} className={styles.mask}>
      <span className={styles.char} data-char data-weight={weighted || undefined}>
        {c}
      </span>
    </span>
  ))

export default function Hero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(root)
      const chars = q('[data-char]')
      const fades = q('[data-fade]')
      gsap.set(chars, { yPercent: 120 })
      gsap.set(fades, { autoAlpha: 0, y: 24 })
      gsap.set(q('[data-line]'), { scaleX: 0 })

      const off = onIntroDone(() => {
        gsap
          .timeline()
          .to(chars, { yPercent: 0, duration: 1.9, stagger: 0.065, ease: 'expo.out' })
          .to(q('[data-line]'), { scaleX: 1, duration: 1.8, ease: 'expo.inOut' }, 0.15)
          .to(fades, { autoAlpha: 1, y: 0, duration: 1.3, stagger: 0.07, ease: 'expo.out' }, 0.55)
      })

      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
        .to(q('[data-name]'), { yPercent: 32, ease: 'none' }, 0)
        .to(q('[data-canvas]'), { yPercent: 22, opacity: 0.25, ease: 'none' }, 0)
        .to(q('[data-top]'), { yPercent: -60, opacity: 0, ease: 'none' }, 0)
      return off
    },
    { scope: root },
  )

  // Variable-font letters swell toward the cursor.
  useEffect(() => {
    const el = root.current
    if (!el || !hasFinePointer() || prefersReducedMotion()) return
    const nodes = Array.from(el.querySelectorAll<HTMLElement>('[data-weight]'))
    const current = nodes.map(() => 500)
    let mx = 0
    let my = 0
    let inside = false
    let raf = 0

    const loop = () => {
      const rects = nodes.map((n) => n.getBoundingClientRect())
      let moving = false
      nodes.forEach((n, i) => {
        const r = rects[i]
        const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2))
        const target = inside ? 340 + 520 * Math.max(0, 1 - d / 560) : 500
        current[i] += (target - current[i]) * 0.12
        if (Math.abs(target - current[i]) > 0.5) moving = true
        n.style.fontWeight = String(Math.round(current[i]))
      })
      raf = moving ? requestAnimationFrame(loop) : 0
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop)
    }
    const move = (e: PointerEvent) => {
      mx = e.clientX
      my = e.clientY
      inside = true
      kick()
    }
    const leave = () => {
      inside = false
      kick()
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [])

  return (
    <section ref={root} className={styles.hero} id="top" aria-label="Introduction">
      <div className={styles.canvas} data-canvas>
        <ShaderCanvas className={styles.gl} seed={3.7} />
      </div>

      <div className={styles.inner}>
        <div className={`${styles.top} mono`} data-top>
          <p data-fade>
            AI Engineer
            <br />& Researcher
          </p>
          <p data-fade className={styles.topMid}>
            B.Tech AI — SVNIT
            <br />
            {profile.location}
          </p>
          <p data-fade className={styles.status}>
            <span className={styles.pulse} aria-hidden="true" />
            {profile.status}
          </p>
        </div>

        <h1 className={styles.name} data-name>
          <span className="sr-only">{profile.name}</span>
          <span className={styles.first} aria-hidden="true">
            {letters(profile.firstName, true)}
          </span>
          <span className={styles.last} aria-hidden="true">
            {letters(profile.lastName)}
          </span>
        </h1>

        <div className={styles.bottom}>
          <span className={styles.rule} data-line />
          <p data-fade className={styles.intro}>
            I build AI systems that <em>learn</em>, <em>remember</em> and <em>ship</em> — from research papers to production.
          </p>
          <TransitionLink href="/#about" data-fade className={styles.badge} aria-label="Scroll to About">
            <svg viewBox="0 0 120 120" className={styles.badgeText} aria-hidden="true">
              <defs>
                <path id="hero-badge-circle" d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" />
              </defs>
              <text>
                <textPath href="#hero-badge-circle" textLength="290" lengthAdjust="spacing">
                  Scroll to explore ✦ Scroll to explore ✦
                </textPath>
              </text>
            </svg>
            <span className={styles.badgeArrow} aria-hidden="true">
              ↓
            </span>
          </TransitionLink>
          <div data-fade className={styles.now}>
            <span className="mono muted">Currently</span>
            <p>
              {profile.now.role} <em>at</em>
              <br />
              {profile.now.org}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
