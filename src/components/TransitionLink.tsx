'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { ComponentProps, MouseEvent } from 'react'
import { coverPage, scrollTo } from '@/lib/runtime'

type Props = ComponentProps<typeof Link> & { href: string }

/**
 * Internal link that plays the curtain before navigating,
 * and smooth-scrolls (via Lenis) for same-page hash links.
 */
export default function TransitionLink({ href, onClick, ...rest }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

    const url = new URL(href, window.location.href)
    const samePage = url.pathname.replace(/\/$/, '') === pathname.replace(/\/$/, '')

    if (samePage) {
      e.preventDefault()
      if (url.hash) {
        scrollTo(url.hash)
        history.replaceState(null, '', url.hash)
      } else scrollTo(0)
      return
    }

    e.preventDefault()
    coverPage().then(() => router.push(href, { scroll: false }))
  }

  return <Link href={href} onClick={handle} {...rest} />
}
