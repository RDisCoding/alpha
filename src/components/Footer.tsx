'use client'

import { useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { prefersReducedMotion, scrollTo } from '@/lib/runtime'
import { profile } from '@/content/profile'
import ShaderCanvas from './ShaderCanvas'
import Magnetic from './Magnetic'
import LocalTime from './LocalTime'
import Reveal from './Reveal'
import TransitionLink from './TransitionLink'
import { sections } from './Nav'
import styles from './Footer.module.css'

export default function Footer() {
  const root = useRef<HTMLElement>(null)
  const [copied, setCopied] = useState(false)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.fromTo(
        '[data-footer-inner]',
        { yPercent: -18 },
        { yPercent: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom bottom', scrub: true } },
      )
      gsap.from('[data-giant] span', {
        yPercent: 100,
        stagger: 0.04,
        duration: 1.6,
        ease: 'expo.out',
        scrollTrigger: { trigger: '[data-giant]', start: 'top 98%', once: true },
      })
    },
    { scope: root },
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  return (
    <footer ref={root} id="contact" className={styles.footer}>
      <div className={styles.inner} data-footer-inner>
        <div className={styles.canvas}>
          <ShaderCanvas className={styles.gl} seed={11.3} />
        </div>

        <div className={styles.content}>
          <div className={`${styles.meta} mono`}>
            <span>(09)</span>
            <span>Contact</span>
            <span className={styles.rule} />
            <span>Inbox open</span>
          </div>

          <Reveal as="h2" className={styles.cta}>
            Got a problem
            <br />
            worth <em>solving?</em>
          </Reveal>

          <div className={styles.actions}>
            <Magnetic strength={0.4}>
              <a href={`mailto:${profile.email}`} className={styles.circle}>
                <span>
                  Say <em>hello</em>
                </span>
                <span aria-hidden="true">↗</span>
              </a>
            </Magnetic>
            <button className={styles.copy} onClick={copy} aria-live="polite">
              <span className={styles.email}>{profile.email}</span>
              <span className={`${styles.copyTag} mono`}>{copied ? 'Copied ✓' : 'Copy'}</span>
            </button>
          </div>

          <div className={styles.cols}>
            <div>
              <span className="mono muted">Socials</span>
              <ul>
                {profile.socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noreferrer">
                      <span className="roll">
                        <span data-text={s.label}>{s.label}</span>
                      </span>
                      <span className="muted"> ↗</span>
                    </a>
                  </li>
                ))}
                <li>
                  <a href={profile.resume} target="_blank" rel="noreferrer">
                    <span className="roll">
                      <span data-text="Résumé">Résumé</span>
                    </span>
                    <span className="muted"> ↗</span>
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <span className="mono muted">Navigate</span>
              <ul>
                {sections.slice(0, 5).map((s) => (
                  <li key={s.id}>
                    <TransitionLink href={`/#${s.id}`}>
                      <span className="roll">
                        <span data-text={s.label}>{s.label}</span>
                      </span>
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="mono muted">Local time</span>
              <p className={styles.time}>
                <LocalTime seconds={false} />
              </p>
              <p className="muted">{profile.location}</p>
            </div>
            <div className={styles.topWrap}>
              <button className="btn" onClick={() => scrollTo(0)}>
                <span className="roll">
                  <span data-text="Back to top">Back to top</span>
                </span>
                <span aria-hidden="true">↑</span>
              </button>
            </div>
          </div>
        </div>

        <div className={styles.giant} data-giant aria-hidden="true">
          {'Rudray'.split('').map((c, i) => (
            <span key={i}>{c}</span>
          ))}
          <span className={styles.giantSerif}>Dave</span>
        </div>

        <div className={`${styles.legal} mono`}>
          <span suppressHydrationWarning>© {new Date().getFullYear()} Rudray Dave</span>
          <span>Designed & engineered from scratch</span>
        </div>
      </div>
    </footer>
  )
}
