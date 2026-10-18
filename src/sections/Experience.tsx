'use client'

import { useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/runtime'
import { experience } from '@/content/experience'
import SectionHead from '@/components/SectionHead'
import styles from './Experience.module.css'

export default function Experience() {
  const [open, setOpen] = useState(0)
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('[data-row]', {
        y: 60,
        autoAlpha: 0,
        stagger: 0.09,
        duration: 1.3,
        scrollTrigger: { trigger: '[data-list]', start: 'top 85%', once: true },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="experience" className={styles.exp}>
      <SectionHead index="03" label="Experience" title={<>Where I&apos;ve <em>worked</em></>} aside={`${experience.length} roles · research & industry`} />

      <ol className={styles.list} data-list>
        {experience.map((e, i) => {
          const isOpen = open === i
          return (
            <li key={e.org + e.period} className={styles.item} data-open={isOpen} data-row>
              <button
                className={styles.row}
                aria-expanded={isOpen}
                aria-controls={`exp-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span className={`${styles.idx} mono`}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.role}>{e.role}</span>
                <span className={styles.org}>{e.org}</span>
                <span className={`${styles.period} mono`}>
                  {e.current && <i className={styles.live} aria-label="current" />}
                  {e.period}
                </span>
                <span className={styles.plus} aria-hidden="true" />
              </button>

              <div
                id={`exp-${i}`}
                role="region"
                className={styles.panel}
                onTransitionEnd={(ev) => ev.propertyName === 'grid-template-rows' && ScrollTrigger.refresh()}
              >
                <div className={styles.panelInner}>
                  <div className={styles.panelBody}>
                    <p className={styles.summary}>{e.summary}</p>
                    <div className={styles.side}>
                      <ul className={styles.tags}>
                        {e.tags.map((t) => (
                          <li key={t} className="mono">
                            {t}
                          </li>
                        ))}
                      </ul>
                      {e.links && (
                        <div className={styles.links}>
                          {e.links.map((l) => (
                            <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="btn btn--dark">
                              <span className="roll">
                                <span data-text={l.label}>{l.label}</span>
                              </span>
                              <span aria-hidden="true">↗</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
