'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { hasFinePointer, prefersReducedMotion } from '@/lib/runtime'
import { education, leadership, life } from '@/content/background'
import SectionHead from '@/components/SectionHead'
import Counter from '@/components/Counter'
import styles from './Beyond.module.css'

export default function Beyond() {
  const root = useRef<HTMLElement>(null)
  const float = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<string | null>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('[data-edu]', { y: 60, autoAlpha: 0, stagger: 0.12, duration: 1.3, scrollTrigger: { trigger: '[data-edu-list]', start: 'top 85%', once: true } })
      gsap.from('[data-lead]', { x: -30, autoAlpha: 0, stagger: 0.08, duration: 1.1, scrollTrigger: { trigger: '[data-lead-list]', start: 'top 88%', once: true } })
    },
    { scope: root },
  )

  useEffect(() => {
    const el = float.current
    if (!el || !hasFinePointer()) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' })
    const move = (e: PointerEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  return (
    <section ref={root} id="beyond" className={styles.beyond}>
      <SectionHead index="08" label="Education & beyond" title={<>School, service & <em>side quests</em></>} />

      <div className={styles.cols}>
        <div>
          <span className="mono muted">Education</span>
          <div className={styles.eduList} data-edu-list>
            {education.map((e) => (
              <article key={e.degree} className={styles.edu} data-edu>
                <div className={styles.score}>
                  <Counter value={parseFloat(e.score)} decimals={2} />
                  <span className="mono muted">{e.scale}</span>
                </div>
                <div className={styles.eduBody}>
                  <h3>{e.degree}</h3>
                  <p>{e.school}</p>
                  <p className="mono muted">{e.period}</p>
                  {e.detail && <p className={styles.detail}>{e.detail}</p>}
                  {e.link && (
                    <a href={e.link.href} target="_blank" rel="noreferrer" className={`${styles.eduLink} mono u-link`}>
                      {e.link.label} ↗
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div>
          <span className="mono muted">Leadership</span>
          <ul className={styles.leadList} data-lead-list>
            {leadership.map((l) => (
              <li key={l.role} data-lead>
                <div>
                  <h3>{l.role}</h3>
                  <p>{l.org}</p>
                </div>
                <span className="mono">{l.period}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.life}>
        <span className="mono muted">Off the clock</span>
        <p className={styles.lifeLine}>
          When I&apos;m not training models, I&apos;m probably playing{' '}
          {life.map((item, i) => (
            <Fragment key={item.word}>
              {item.image ? (
                <span
                  className={styles.hot}
                  onPointerEnter={() => setHover(item.word)}
                  onPointerLeave={() => setHover(null)}
                  data-cursor="hide"
                >
                  {item.word}
                </span>
              ) : (
                <em>{item.word}</em>
              )}
              {i < life.length - 2 ? ', ' : i === life.length - 2 ? ' or ' : '.'}
            </Fragment>
          ))}
        </p>
      </div>

      <div ref={float} className={styles.float} data-visible={hover !== null} aria-hidden="true">
        {life
          .filter((l) => l.image)
          .map((l) => (
            <figure key={l.word} className={styles.floatItem} data-active={hover === l.word}>
              <img src={l.image} alt="" loading="lazy" />
              <figcaption className="mono">{l.caption}</figcaption>
            </figure>
          ))}
      </div>
    </section>
  )
}
