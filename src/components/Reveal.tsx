'use client'

import { useRef, type ElementType, type ReactNode } from 'react'
import { gsap, SplitText, useGSAP } from '@/lib/gsap'
import { onIntroDone, prefersReducedMotion } from '@/lib/runtime'

type Props = {
  as?: ElementType
  children: ReactNode
  className?: string
  id?: string
  /** What slides up from behind its line mask. */
  split?: 'lines' | 'words' | 'chars'
  delay?: number
  stagger?: number
  /** `scroll`: when it enters the viewport. `intro`: right after the preloader / page transition. */
  trigger?: 'scroll' | 'intro'
}

/** Masked line/word/char reveal powered by GSAP SplitText (re-splits on resize & font load). */
export default function Reveal({ as: Tag = 'div', children, className, id, split = 'lines', delay = 0, stagger, trigger = 'scroll' }: Props) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    (_, contextSafe) => {
      const el = ref.current
      if (!el || prefersReducedMotion()) return
      if (trigger === 'intro') gsap.set(el, { autoAlpha: 0 })

      let splitter: SplitText | undefined
      const run = contextSafe!(() => {
        gsap.set(el, { autoAlpha: 1 })
        splitter = SplitText.create(el, {
          type: split === 'lines' ? 'lines' : `lines,${split}`,
          mask: 'lines',
          linesClass: 'split-line',
          autoSplit: true,
          onSplit(self) {
            const targets = split === 'lines' ? self.lines : split === 'words' ? self.words : self.chars
            return gsap.from(targets, {
              yPercent: 120,
              rotate: split === 'chars' ? 0 : 2,
              duration: 1.4,
              ease: 'expo.out',
              stagger: stagger ?? (split === 'chars' ? 0.025 : split === 'words' ? 0.03 : 0.09),
              delay,
              scrollTrigger: trigger === 'scroll' ? { trigger: el, start: 'top 88%', once: true } : undefined,
            })
          },
        })
      })

      if (trigger === 'intro') {
        const off = onIntroDone(run)
        return () => {
          off()
          splitter?.revert()
        }
      }
      run()
      return () => splitter?.revert()
    },
    { scope: ref },
  )

  return (
    <Tag ref={ref} className={className} id={id}>
      {children}
    </Tag>
  )
}
