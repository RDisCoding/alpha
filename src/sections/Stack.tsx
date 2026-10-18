'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/runtime'
import { coursework, skills } from '@/content/background'
import SectionHead from '@/components/SectionHead'
import Marquee from '@/components/Marquee'
import styles from './Stack.module.css'

const half = Math.ceil(skills.length / 2)
const rowA = skills.slice(0, half).flatMap((g) => g.items)
const rowB = skills.slice(half).flatMap((g) => g.items)

export default function Stack() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.utils.toArray<HTMLElement>('[data-group]', root.current).forEach((g) => {
        gsap.from(g.querySelectorAll('[data-pill]'), {
          y: 24,
          autoAlpha: 0,
          scale: 0.9,
          stagger: 0.03,
          duration: 0.9,
          ease: 'back.out(2)',
          scrollTrigger: { trigger: g, start: 'top 85%', once: true },
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="stack" className={styles.stack}>
      <div className={styles.marquees} aria-hidden="true">
        <Marquee items={rowA} speed={55} className={styles.mq} separator="/" />
        <Marquee items={rowB} speed={45} reverse className={`${styles.mq} ${styles.mqOutline}`} separator="/" />
      </div>

      <div className={styles.inner}>
        <SectionHead index="07" label="Stack" title={<>Tools of the <em>trade</em></>} aside={`${skills.reduce((n, g) => n + g.items.length, 0)} tools & counting`} />

        <ul className={styles.groups}>
          {skills.map((g, i) => (
            <li key={g.group} className={styles.group} data-group>
              <span className="mono muted">{String(i + 1).padStart(2, '0')}</span>
              <h3 className={styles.groupName}>{g.group}</h3>
              <ul className={styles.pills}>
                {g.items.map((s) => (
                  <li key={s} data-pill>
                    {s}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <details className={styles.course} onToggle={() => ScrollTrigger.refresh()}>
          <summary>
            <span className="mono">Relevant coursework</span>
            <span className={styles.toggle} aria-hidden="true" />
          </summary>
          <div className={styles.courseGrid}>
            {coursework.map((c) => (
              <div key={c.group}>
                <h4 className="mono muted">{c.group}</h4>
                <ul>
                  {c.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      </div>
    </section>
  )
}
