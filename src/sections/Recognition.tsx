'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/runtime'
import { recognition } from '@/content/recognition'
import SectionHead from '@/components/SectionHead'
import Marquee from '@/components/Marquee'
import TiltCard from '@/components/TiltCard'
import TransitionLink from '@/components/TransitionLink'
import styles from './Recognition.module.css'

export default function Recognition() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('[data-rcard]', {
        y: 100,
        autoAlpha: 0,
        rotate: 2,
        stagger: 0.1,
        duration: 1.4,
        scrollTrigger: { trigger: '[data-rgrid]', start: 'top 85%', once: true },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="recognition" className={styles.rec}>
      <Marquee items={['Winner', 'Finalist', 'Rank #11', 'Published', 'Shipped']} className={styles.marquee} speed={90} />

      <div className={styles.inner}>
        <SectionHead index="06" label="Recognition" title={<>Hackathons & <em>wins</em></>} aside="Leaderboard, so far" />

        <ol className={styles.grid} data-rgrid>
          {recognition.map((r, i) => {
            const body = (
              <>
                <div className={`${styles.top} mono`}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <span>{r.date}</span>
                </div>
                <span className={styles.mark} data-word={/^[#\d]/.test(r.mark) ? undefined : true}>
                  {r.mark}
                </span>
                <div className={styles.body}>
                  <h3>{r.title}</h3>
                  <p className="mono muted">{r.org}</p>
                  <p className={styles.note}>{r.note}</p>
                </div>
                {r.slug && (
                  <span className={`${styles.cta} mono`}>
                    View project <span aria-hidden="true">→</span>
                  </span>
                )}
              </>
            )
            return (
              <li key={r.title} className={styles.cell} data-rcard>
                <TiltCard className={styles.card}>
                  {r.slug ? (
                    <TransitionLink href={`/work/${r.slug}/`} className={styles.cardInner} data-cursor="view" data-cursor-label="Open">
                      {body}
                    </TransitionLink>
                  ) : (
                    <div className={styles.cardInner}>{body}</div>
                  )}
                </TiltCard>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
