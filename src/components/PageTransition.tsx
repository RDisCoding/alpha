'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { getLenis, registerCover, scrollTo } from '@/lib/runtime'

/** Violet curtain that covers the page on navigation and lifts once the new route has rendered. */
export default function PageTransition() {
  const curtain = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const first = useRef(true)

  useEffect(() => {
    registerCover(
      () =>
        new Promise<void>((resolve) => {
          gsap.fromTo(
            curtain.current,
            { clipPath: 'inset(100% 0% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.85, ease: 'expo.inOut', onComplete: resolve },
          )
        }),
    )
    return () => registerCover(null)
  }, [])

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const hash = window.location.hash
    // The menu may have stopped Lenis (which clips <html> overflow), so restart it before jumping.
    getLenis()?.start()
    getLenis()?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo(0, 0)

    // Let the new page mount its ScrollTriggers (pins change layout) before measuring.
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      if (hash) scrollTo(hash, { immediate: true })
      gsap.to(curtain.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: 'expo.inOut', delay: 0.1 })
    })
    return () => cancelAnimationFrame(id)
  }, [pathname])

  return (
    <div ref={curtain} className="curtain" aria-hidden="true">
      <span className="mono">Rudray Dave — loading</span>
    </div>
  )
}
