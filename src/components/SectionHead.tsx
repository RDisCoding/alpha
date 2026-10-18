'use client'

import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/runtime'
import Reveal from './Reveal'
import styles from './SectionHead.module.css'

type Props = { index: string; label: string; title?: ReactNode; aside?: ReactNode; className?: string }

/** "(03) Selected work ——— aside" rule + a big masked title. */
export default function SectionHead({ index, label, title, aside, className = '' }: Props) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('[data-rule]', {
        scaleX: 0,
        duration: 1.6,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: ref.current, start: 'top 90%', once: true },
      })
    },
    { scope: ref },
  )

  return (
    <header ref={ref} className={`${styles.head} ${className}`}>
      <div className={`${styles.meta} mono`}>
        <span>({index})</span>
        <span>{label}</span>
        <span className={styles.rule} data-rule />
        {aside && <span className={styles.aside}>{aside}</span>}
      </div>
      {title && (
        <Reveal as="h2" className={styles.title}>
          {title}
        </Reveal>
      )}
    </header>
  )
}
