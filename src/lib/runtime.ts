'use client'

import type Lenis from 'lenis'

/* ---------- motion preferences ---------- */

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const hasFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

/* ---------- smooth scroll (Lenis) ---------- */

let lenis: Lenis | null = null

export const setLenis = (instance: Lenis | null) => {
  lenis = instance
}
export const getLenis = () => lenis

const byHash = (hash: string) => {
  const id = hash.replace(/^#/, '')
  try {
    return document.getElementById(decodeURIComponent(id))
  } catch {
    return document.getElementById(id)
  }
}

export function scrollTo(target: string | number | HTMLElement, opts: { immediate?: boolean; offset?: number } = {}) {
  const el = typeof target === 'string' ? byHash(target) : target
  if (el === null) return
  if (lenis) {
    // Lenis caches the scroll limit; after a route change it may still hold the previous page's height.
    lenis.resize()
    lenis.scrollTo(el, { offset: opts.offset ?? 0, immediate: opts.immediate, duration: 1.6, force: true })
    return
  }
  const top = typeof el === 'number' ? el : el.getBoundingClientRect().top + window.scrollY + (opts.offset ?? 0)
  window.scrollTo({ top, behavior: opts.immediate || prefersReducedMotion() ? 'auto' : 'smooth' })
}

/* ---------- intro (preloader) ---------- */

let introDone = false
const introListeners = new Set<() => void>()

export function markIntroDone() {
  if (introDone) return
  introDone = true
  introListeners.forEach((fn) => fn())
  introListeners.clear()
}

/** Runs `fn` once the preloader has lifted (immediately if it already has). Returns an unsubscribe. */
export function onIntroDone(fn: () => void) {
  if (introDone) {
    fn()
    return () => {}
  }
  introListeners.add(fn)
  return () => {
    introListeners.delete(fn)
  }
}

/* ---------- page transition curtain ---------- */

let coverFn: (() => Promise<void>) | null = null
export const registerCover = (fn: (() => Promise<void>) | null) => {
  coverFn = fn
}
export const coverPage = () => (coverFn ? coverFn() : Promise.resolve())
