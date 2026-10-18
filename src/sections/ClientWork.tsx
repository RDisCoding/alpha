'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/runtime'
import { clientProjects, figLabel } from '@/content/projects'
import SectionHead from '@/components/SectionHead'
import ProjectCover from '@/components/ProjectCover'
import TransitionLink from '@/components/TransitionLink'
import styles from './ClientWork.module.css'

export default function ClientWork() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.utils.toArray<HTMLElement>('[data-client]', root.current).forEach((el, i) =>
        gsap.from(el, { y: 90, autoAlpha: 0, duration: 1.4, delay: i * 0.1, scrollTrigger: { trigger: el, start: 'top 90%', once: true } }),
      )
    },
    { scope: root },
  )

  return (
    <section ref={root} id="clients" className={styles.clients}>
      <SectionHead index="05" label="Client work" title={<>Client <em>work</em></>} aside="Freelance · websites" />
      <p className={styles.lede}>Websites I&apos;ve built and shipped for real businesses — with a CMS behind them, so the content stays in the client&apos;s hands.</p>

      <div className={styles.grid}>
        {clientProjects.map((p) => {
          const live = p.links?.find((l) => /live|site|website/i.test(l.label))
          return (
            <article key={p.slug} className={styles.card} data-client>
              <TransitionLink href={`/work/${p.slug}/`} className={styles.link} data-cursor="view" data-cursor-label="Open">
                <ProjectCover project={p} uid="client" className={styles.cover} />
                <div className={styles.meta}>
                  <span className="mono muted">
                    {figLabel(p)} — {p.year}
                  </span>
                  <h3 className={styles.title}>{p.title}</h3>
                  <p className={styles.tagline}>{p.tagline}</p>
                </div>
              </TransitionLink>
              <div className={styles.foot}>
                <ul className={styles.stack}>
                  {p.stack.map((s) => (
                    <li key={s} className="mono">
                      {s}
                    </li>
                  ))}
                </ul>
                {live && (
                  <a href={live.href} target="_blank" rel="noreferrer" className="btn">
                    <span className="roll">
                      <span data-text="Visit site">Visit site</span>
                    </span>
                    <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
