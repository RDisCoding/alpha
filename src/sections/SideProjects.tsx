'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { hasFinePointer, prefersReducedMotion } from '@/lib/runtime'
import { figLabel, filters, sideProjects, type Filter } from '@/content/projects'
import SectionHead from '@/components/SectionHead'
import ProjectCover from '@/components/ProjectCover'
import TransitionLink from '@/components/TransitionLink'
import styles from './SideProjects.module.css'

type View = Filter | 'All'

const projects = sideProjects
// Only offer filters that actually match something.
const views: View[] = ['All', ...filters.filter((f) => projects.some((p) => p.filters.includes(f)))]

/** Side projects — hackathons, coursework and personal builds — as a filterable index. */
export default function SideProjects() {
  const [view, setView] = useState<View>('All')
  const [active, setActive] = useState<string | null>(null)
  const root = useRef<HTMLElement>(null)
  const preview = useRef<HTMLDivElement>(null)
  const list = view === 'All' ? projects : projects.filter((p) => p.filters.includes(view))
  const first = useRef(true)

  // Rows rise in on first view, and re-stagger whenever the filter changes.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const rows = gsap.utils.toArray<HTMLElement>('[data-arow]', root.current)
      if (first.current) {
        first.current = false
        gsap.from(rows, { y: 40, autoAlpha: 0, stagger: 0.05, duration: 1.1, scrollTrigger: { trigger: '[data-table]', start: 'top 85%', once: true } })
      } else {
        gsap.from(rows, { y: 30, autoAlpha: 0, stagger: 0.04, duration: 0.9 })
        ScrollTrigger.refresh()
      }
    },
    { scope: root, dependencies: [view] },
  )

  // Floating preview that trails the cursor and leans with its velocity.
  useEffect(() => {
    const el = preview.current
    if (!el || !hasFinePointer()) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3' })
    const rTo = gsap.quickTo(el, 'rotation', { duration: 0.9, ease: 'power3' })
    let lastX = 0
    const move = (e: PointerEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
      rTo(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6))
      lastX = e.clientX
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  return (
    <section ref={root} id="projects" className={styles.archive}>
      <SectionHead index="04" label="Side projects" title={<>Side <em>projects</em></>} aside="Hackathons · coursework · builds" />
      <p className={styles.lede}>Hackathon builds, coursework that got out of hand and things I make for fun — away from the research bench.</p>

      <div className={styles.filters} role="group" aria-label="Filter projects">
        {views.map((f) => {
          const n = f === 'All' ? projects.length : projects.filter((p) => p.filters.includes(f)).length
          return (
            <button key={f} className={styles.filter} aria-pressed={view === f} onClick={() => setView(f)}>
              {f}
              <sup className="mono">{n}</sup>
            </button>
          )
        })}
      </div>

      <div className={styles.table} data-table onPointerLeave={() => setActive(null)}>
        <div className={`${styles.thead} mono`} aria-hidden="true">
          <span>Fig.</span>
          <span>Project</span>
          <span className={styles.colKind}>Type</span>
          <span className={styles.colStack}>Stack</span>
          <span className={styles.colYear}>Year</span>
        </div>
        <ul>
          {list.map((p) => (
            <li key={p.slug} data-arow>
              <TransitionLink
                href={`/work/${p.slug}/`}
                className={styles.row}
                data-cursor="view"
                data-cursor-label="Open"
                onPointerEnter={() => setActive(p.slug)}
                onFocus={() => setActive(p.slug)}
              >
                <span className="mono">{figLabel(p)}</span>
                <span className={styles.name}>
                  {p.short ?? p.title}
                  <span className={styles.arrow} aria-hidden="true">
                    ↗
                  </span>
                </span>
                <span className={styles.colKind}>{p.kind}</span>
                <span className={`${styles.colStack} mono`}>{p.stack.slice(0, 3).join(' · ')}</span>
                <span className={`${styles.colYear} mono`}>{p.year}</span>
              </TransitionLink>
            </li>
          ))}
        </ul>
      </div>

      <div ref={preview} className={styles.preview} data-visible={active !== null} aria-hidden="true">
        <div className={styles.previewInner}>
          {projects.map((p) => (
            <div key={p.slug} className={styles.previewItem} data-active={active === p.slug}>
              <ProjectCover project={p} uid="preview" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
