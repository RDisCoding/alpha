'use client'

import { Fragment, useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/runtime'
import { about, profile } from '@/content/profile'
import SectionHead from '@/components/SectionHead'
import TransitionLink from '@/components/TransitionLink'
import styles from './About.module.css'

export default function About() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(root)

      gsap.fromTo(
        q('[data-word]'),
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: q('[data-manifesto]')[0], start: 'top 78%', end: 'bottom 50%', scrub: 1 },
        },
      )
      gsap.from(q('[data-pill]'), {
        width: 0,
        duration: 1.6,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: q('[data-manifesto]')[0], start: 'top 80%', once: true },
      })

      const portrait = q('[data-portrait]')[0]
      const reveal = { trigger: portrait, start: 'top 95%', end: 'center 55%', scrub: true }
      gsap.fromTo(portrait, { clipPath: 'inset(16% 16% 16% 16% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'none', scrollTrigger: reveal })
      gsap.fromTo(q('[data-portrait] img'), { scale: 1.35 }, { scale: 1, ease: 'none', scrollTrigger: reveal })

      gsap.from(q('[data-fact]'), {
        y: 24,
        autoAlpha: 0,
        stagger: 0.06,
        duration: 1.1,
        scrollTrigger: { trigger: q('[data-facts]')[0], start: 'top 88%', once: true },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="about" className={styles.about}>
      <SectionHead index="01" label="About" aside="Who's behind the models" />

      <p className={styles.manifesto} data-manifesto>
        {about.manifesto.map((part, i) =>
          'portrait' in part ? (
            <Fragment key={i}>
              <span className={styles.pill} data-pill aria-hidden="true">
                <img src={profile.portrait} alt="" />
              </span>{' '}
            </Fragment>
          ) : (
            part.text.split(' ').map((w, j) => {
              const Tag = part.em ? 'em' : 'span'
              return (
                <Fragment key={`${i}-${j}`}>
                  <Tag data-word>{w}</Tag>{' '}
                </Fragment>
              )
            })
          ),
        )}
      </p>

      <div className={styles.grid}>
        <figure className={styles.portrait} data-portrait data-cursor="hide">
          <img src={profile.portrait} alt="Portrait of Rudray Dave" loading="lazy" />
          <figcaption className="mono">Fig. 00 — The author, Surat</figcaption>
        </figure>

        <div className={styles.details}>
          <span className="mono muted">(Bio)</span>
          {about.bio.map((p) => (
            <p key={p.slice(0, 24)} className={styles.bio}>
              {p}
            </p>
          ))}

          <dl className={styles.facts} data-facts>
            {about.facts.map((f) => (
              <div key={f.label} data-fact>
                <dt className="mono muted">{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>

          <div className={styles.ctas}>
            <a href={profile.resume} target="_blank" rel="noreferrer" className="btn btn--violet">
              <span className="roll">
                <span data-text="Download résumé">Download résumé</span>
              </span>
              <span aria-hidden="true">↗</span>
            </a>
            <TransitionLink href="/#contact" className="btn">
              <span className="roll">
                <span data-text="Get in touch">Get in touch</span>
              </span>
            </TransitionLink>
          </div>
        </div>
      </div>
    </section>
  )
}
