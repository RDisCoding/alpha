'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { onIntroDone, prefersReducedMotion } from '@/lib/runtime'
import { figLabel, groups, inGroup, type Project } from '@/content/projects'
import ProjectCover from '@/components/ProjectCover'
import Reveal from '@/components/Reveal'
import TransitionLink from '@/components/TransitionLink'
import styles from './ProjectView.module.css'

type Props = { project: Project; next: Project }

export default function ProjectView({ project: p, next }: Props) {
  const root = useRef<HTMLElement>(null)
  const group = groups[p.group]
  const groupSize = String(inGroup(p.group).length).padStart(2, '0')
  const sameGroupNext = next.group === p.group && next.slug !== p.slug

  useGSAP(
    (_, contextSafe) => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(root)
      gsap.set(q('[data-fade]'), { autoAlpha: 0, y: 24 })
      gsap.set(q('[data-cover]'), { clipPath: 'inset(12% 8% 0% 8% round 28px)' })

      const intro = contextSafe!(() => {
        gsap.to(q('[data-fade]'), { autoAlpha: 1, y: 0, stagger: 0.06, duration: 1.3, delay: 0.5 })
        gsap.to(q('[data-cover]'), { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.8, ease: 'expo.inOut', delay: 0.3 })
      })
      const off = onIntroDone(intro)

      const media = q('[data-cover] [data-parallax]')[0]
      if (media)
        gsap.fromTo(media, { yPercent: -4 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: q('[data-cover]')[0], start: 'top bottom', end: 'bottom top', scrub: true } })

      q('[data-shot]').forEach((el) =>
        gsap.from(el, { y: 90, autoAlpha: 0, duration: 1.4, scrollTrigger: { trigger: el, start: 'top 90%', once: true } }),
      )
      q('[data-hl]').forEach((el, i) =>
        gsap.from(el, { y: 50, autoAlpha: 0, duration: 1.2, delay: i * 0.08, scrollTrigger: { trigger: el, start: 'top 92%', once: true } }),
      )
      return off
    },
    { scope: root, dependencies: [p.slug] },
  )

  return (
    <main ref={root} id="main" className={styles.page}>
      <header className={styles.hero}>
        <div className={`${styles.crumbs} mono`} data-fade>
          <TransitionLink href={group.href} className="u-link">
            ← {group.label}
          </TransitionLink>
          <span>
            Fig. {figLabel(p)} / {group.prefix}
            {groupSize}
          </span>
        </div>

        <div className={`${styles.kicker} mono`} data-fade>
          <span>{p.kind}</span>
          {p.status && <span data-status={p.status === 'Ongoing' || undefined}>{p.status}</span>}
          <span>{p.year}</span>
          {p.context && <span>{p.context}</span>}
        </div>

        <Reveal as="h1" trigger="intro" delay={0.25} className={styles.title}>
          {p.title}
        </Reveal>
        <p className={styles.tagline} data-fade>
          {p.tagline}
        </p>
      </header>

      <div className={styles.coverWrap} data-cover>
        <ProjectCover project={p} uid="hero" parallax eager className={styles.cover} />
      </div>

      <section className={styles.meta}>
        <dl className={styles.metaList}>
          <div>
            <dt className="mono muted">Year</dt>
            <dd>{p.year}</dd>
          </div>
          <div>
            <dt className="mono muted">Type</dt>
            <dd>{p.kind}</dd>
          </div>
          {p.context && (
            <div>
              <dt className="mono muted">Context</dt>
              <dd>{p.context}</dd>
            </div>
          )}
          {p.advisor && (
            <div>
              <dt className="mono muted">Guided by</dt>
              <dd>
                <a href={p.advisor.href} target="_blank" rel="noreferrer" className="u-link">
                  {p.advisor.label} ↗
                </a>
              </dd>
            </div>
          )}
          <div className={styles.stackItem}>
            <dt className="mono muted">Stack</dt>
            <dd>
              <ul className={styles.stack}>
                {p.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
        {p.links && (
          <div className={styles.links}>
            {p.links.map((l, i) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={`btn ${i === 0 ? 'btn--violet' : ''}`}>
                <span className="roll">
                  <span data-text={l.label}>{l.label}</span>
                </span>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className={styles.body}>
        <span className="mono muted">(Overview)</span>
        <div className={styles.copy}>
          {p.body.map((para, i) =>
            i === 0 ? (
              <Reveal key={i} as="p" className={styles.lead}>
                {para}
              </Reveal>
            ) : (
              <p key={i} className={styles.para}>
                {para}
              </p>
            ),
          )}
        </div>
      </section>

      {p.highlights && (
        <section className={styles.highlights}>
          <span className="mono muted">(Results)</span>
          <ul>
            {p.highlights.map((h) => (
              <li key={h.label} data-hl>
                <span className={styles.hlValue}>{h.value}</span>
                <span className={styles.hlLabel}>{h.label}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {p.gallery && p.gallery.length > 0 && (
        <section className={styles.gallery}>
          <span className="mono muted">(Gallery)</span>
          <div className={styles.shots}>
            {p.gallery.map((g, i) => (
              <figure key={g.src} className={styles.shot} data-shot data-wide={i % 3 === 0 || p.gallery!.length === 1 || undefined}>
                <a href={g.src} target="_blank" rel="noreferrer" data-cursor="view" data-cursor-label="Zoom" aria-label={`Open full size: ${g.alt}`}>
                  <img src={g.src} alt={g.alt} loading="lazy" decoding="async" />
                </a>
                {g.caption && (
                  <figcaption className="mono">
                    {String(i + 1).padStart(2, '0')} — {g.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      <TransitionLink href={`/work/${next.slug}/`} className={styles.next} data-cursor="view" data-cursor-label="Next">
        <span className="mono muted">{sameGroupNext ? `Next in ${group.label.toLowerCase()}` : 'Next project'}</span>
        <span className={styles.nextTitle}>{next.short ?? next.title}</span>
        <span className={`${styles.nextMeta} mono`}>
          {next.kind} — {next.year}
        </span>
        <ProjectCover project={next} uid="next" className={styles.nextCover} />
      </TransitionLink>
    </main>
  )
}
