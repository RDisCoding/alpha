'use client'

import { Fragment, useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/runtime'
import { figLabel, researchProjects } from '@/content/projects'
import { interests, mentors, publications, researchIntro } from '@/content/research'
import SectionHead from '@/components/SectionHead'
import Spectrogram from '@/components/Spectrogram'
import ProjectCover from '@/components/ProjectCover'
import TransitionLink from '@/components/TransitionLink'
import styles from './Research.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

export default function Research() {
  const root = useRef<HTMLElement>(null)
  const pin = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  const total = researchProjects.length

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // Desktop: pin the gallery and scroll it sideways.
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const t = track.current!
        const distance = () => t.scrollWidth - window.innerWidth
        const tween = gsap.to(t, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: pin.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`
              if (count.current) count.current.textContent = pad(Math.min(total, Math.floor(self.progress * total) + 1))
            },
          },
        })

        gsap.utils.toArray<HTMLElement>('[data-card]', root.current).forEach((card) => {
          const media = card.querySelector('[data-parallax]')
          if (media)
            gsap.fromTo(
              media,
              { xPercent: -5 },
              { xPercent: 5, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } },
            )
        })
      })

      mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('[data-card]', root.current).forEach((card) =>
          gsap.from(card, { y: 80, autoAlpha: 0, duration: 1.3, scrollTrigger: { trigger: card, start: 'top 90%', once: true } }),
        )
      })

      if (prefersReducedMotion()) return
      gsap.from('[data-chip]', { y: 20, autoAlpha: 0, stagger: 0.05, duration: 0.9, scrollTrigger: { trigger: '[data-chips]', start: 'top 90%', once: true } })
      gsap.utils.toArray<HTMLElement>('[data-pub]', root.current).forEach((el) =>
        gsap.from(el, { y: 60, autoAlpha: 0, duration: 1.2, scrollTrigger: { trigger: el, start: 'top 90%', once: true } }),
      )
    },
    { scope: root },
  )

  return (
    <section ref={root} id="research" className={styles.research}>
      <div className={styles.intro}>
        <SectionHead index="02" label="Research" aside="The main body of work" title={<>Research & open <em>questions</em></>} />

        <div className={styles.introGrid}>
          <div className={styles.introText}>
            <p className={styles.lede}>{researchIntro}</p>
            <div className={styles.introMeta}>
              <span className="mono muted">Interests</span>
              <ul className={styles.chips} data-chips>
                {interests.map((i) => (
                  <li key={i} data-chip>
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <p className={styles.mentors}>
              <span className="mono muted">Guided by</span>
              <span>
                {mentors.map((m, i) => (
                  <Fragment key={m.href}>
                    {i > 0 && <em> & </em>}
                    <a href={m.href} target="_blank" rel="noreferrer" className="u-link">
                      {m.label}
                    </a>
                  </Fragment>
                ))}
              </span>
            </p>
          </div>

          <figure className={styles.figure}>
            <Spectrogram className={styles.spectro} />
            <figcaption className="mono">Fig. R — a copy-move forgery, live: a past window (SRC) pasted forward (TGT)</figcaption>
          </figure>
        </div>
      </div>

      <div ref={pin} className={styles.pin}>
        <div className={`${styles.topbar} mono`}>
          <span>Research projects</span>
          <span className={styles.rule} />
          <span>
            <span ref={count}>01</span> / {pad(total)}
          </span>
        </div>

        <div ref={track} className={styles.track}>
          {researchProjects.map((p) => (
            <article key={p.slug} className={styles.card} data-card>
              <TransitionLink href={`/work/${p.slug}/`} className={styles.cardLink} data-cursor="view" data-cursor-label="Read">
                <div className={styles.coverWrap}>
                  <ProjectCover project={p} uid="research" parallax className={styles.cover} />
                  {p.status && (
                    <span className={`${styles.status} mono`} data-live={p.status === 'Ongoing' || undefined}>
                      {p.status}
                    </span>
                  )}
                </div>
                <div className={styles.cardMeta}>
                  <span className="mono">{figLabel(p)}</span>
                  <h3 className={styles.cardTitle}>{p.short ?? p.title}</h3>
                  <span className="mono">{p.year}</span>
                </div>
                <div className={styles.cardFoot}>
                  <p>
                    {p.tagline}
                    {p.advisor && <span className={`${styles.with} mono`}>with {p.advisor.label}</span>}
                  </p>
                  {p.highlights?.[0] && (
                    <p className={styles.metric}>
                      <strong>{p.highlights[0].value}</strong>
                      <span>{p.highlights[0].label}</span>
                    </p>
                  )}
                </div>
              </TransitionLink>
            </article>
          ))}

          <div className={styles.outro}>
            <TransitionLink href="/#publications" className={styles.outroLink}>
              <span className="mono">Written up</span>
              <span className={styles.outroTitle}>
                Publications <em>& papers</em>
              </span>
              <span className={styles.outroArrow} aria-hidden="true">
                ↓
              </span>
            </TransitionLink>
          </div>
        </div>

        <div className={styles.progress} aria-hidden="true">
          <span ref={bar} />
        </div>
      </div>

      <div id="publications" className={styles.pubs}>
        <div className={`${styles.pubsHead} mono`}>
          <span>Publications</span>
          <span className={styles.rule} />
          <span>{pad(publications.length)}</span>
        </div>
        <ol>
          {publications.map((pub) => (
            <li key={pub.title} className={styles.pub} data-pub>
              <span className={`${styles.pubYear} mono`}>{pub.year}</span>
              <div className={styles.pubMain}>
                <span className={`${styles.pubStatus} mono`}>{pub.status}</span>
                <h3>{pub.title}</h3>
                <p className={styles.venue}>{pub.venue}</p>
                <p className={styles.note}>{pub.note}</p>
              </div>
              <div className={styles.pubLinks}>
                {pub.slug && (
                  <TransitionLink href={`/work/${pub.slug}/`} className="btn btn--violet">
                    <span className="roll">
                      <span data-text="Case study">Case study</span>
                    </span>
                    <span aria-hidden="true">→</span>
                  </TransitionLink>
                )}
                {pub.links?.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="btn">
                    <span className="roll">
                      <span data-text={l.label}>{l.label}</span>
                    </span>
                    <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
