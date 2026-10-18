'use client'

import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { usePathname } from 'next/navigation'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { getLenis, scrollTo } from '@/lib/runtime'
import { profile } from '@/content/profile'
import { playlist } from '@/content/music'
import { sound, useSound } from '@/lib/sound/engine'
import TransitionLink from './TransitionLink'
import LocalTime from './LocalTime'
import SoundBars from './SoundBars'
import styles from './Nav.module.css'

export const sections = [
  { id: 'about', label: 'About' },
  { id: 'research', label: 'Research' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Side projects' },
  { id: 'clients', label: 'Client work' },
  { id: 'recognition', label: 'Recognition' },
  { id: 'contact', label: 'Contact' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const bar = useRef<HTMLElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const holdNav = useRef(0)
  const pathname = usePathname()
  const snd = useSound()
  const soundOn = snd.playing || snd.armed
  const track = playlist[snd.index]

  // Hide on scroll down, show on scroll up.
  useGSAP(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        // Keep the bar visible briefly after a menu jump, which reads as a big scroll down.
        const hide = self.direction === 1 && self.scroll() > 200 && performance.now() > holdNav.current
        gsap.to(bar.current, { yPercent: hide ? -110 : 0, duration: 0.6, ease: 'power3.out', overwrite: true })
      },
    })
    return () => st.kill()
  })

  // Menu timeline.
  useGSAP(
    () => {
      const links = gsap.utils.toArray<HTMLElement>('[data-menu-link]')
      const fades = gsap.utils.toArray<HTMLElement>('[data-menu-fade]')
      tl.current = gsap
        .timeline({ paused: true })
        .set(menu.current, { visibility: 'visible' })
        .fromTo(menu.current, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut' })
        .fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.05, ease: 'expo.out' }, 0.45)
        .fromTo(fades, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.04, ease: 'power3.out' }, 0.6)
    },
    { scope: menu },
  )

  const prevOpen = useRef(open)
  useEffect(() => {
    const t = tl.current
    // Only react to actual toggles, so we never restart Lenis while the preloader holds it.
    if (!t || prevOpen.current === open) return
    prevOpen.current = open
    sound.muffle(open)
    if (open) {
      getLenis()?.stop()
      t.timeScale(1).play()
    } else {
      getLenis()?.start()
      t.timeScale(1.6).reverse()
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  // On the home page, jump straight to the section while the menu still covers the screen,
  // then let it close. (Lenis is stopped while the menu is open; restarting it after a smooth
  // scroll began would cancel that scroll.) Elsewhere, TransitionLink navigates home first.
  const goTo = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (pathname !== '/') return
    e.preventDefault()
    holdNav.current = performance.now() + 800
    getLenis()?.start()
    scrollTo(`#${id}`, { immediate: true })
    history.replaceState(null, '', `#${id}`)
    setOpen(false)
  }

  return (
    <>
      <header ref={bar} className={styles.bar}>
        <TransitionLink href="/" className={styles.logo} aria-label="Rudray Dave — home">
          <span className={styles.mark} aria-hidden="true">
            R<i>D</i>
          </span>
          <span className={`${styles.word} roll`}>
            <span data-text="Rudray Dave ©">Rudray Dave ©</span>
          </span>
        </TransitionLink>

        <p className={`${styles.clock} mono`}>
          Surat, IN — <LocalTime />
        </p>

        <div className={styles.right}>
          <a href={profile.resume} target="_blank" rel="noreferrer" className={`${styles.resume} mono`}>
            <span className="roll">
              <span data-text="Résumé ↗">Résumé ↗</span>
            </span>
          </a>
          {snd.supported && (
            <div className={styles.sound} data-sound-control>
              <button
                className={styles.soundToggle}
                onClick={() => sound.toggle()}
                aria-pressed={soundOn}
                aria-label={soundOn ? 'Turn music off' : 'Turn music on'}
              >
                <SoundBars active={snd.playing && !snd.loading} demo={snd.loading} />
                <span className={`${styles.soundLabel} mono`}>{snd.loading ? 'Loading' : soundOn ? 'Sound on' : 'Sound off'}</span>
              </button>
              <button className={`${styles.trackBtn} mono`} onClick={() => sound.next()} aria-label={`Next track — now playing ${track.title}`}>
                <span className="roll">
                  <span data-text="Next track →">♪ {track.title}</span>
                </span>
              </button>
            </div>
          )}
          <button
            className={styles.burger}
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="site-menu"
            data-open={open}
          >
            <span className="mono">{open ? 'Close' : 'Menu'}</span>
            <span className={styles.lines} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </header>

      <div ref={menu} id="site-menu" className={styles.menu} aria-hidden={!open} inert={!open}>
        <nav className={styles.menuNav} aria-label="Primary">
          <span className="mono muted" data-menu-fade>
            Index
          </span>
          <ul>
            {sections.map((s, i) => (
              <li key={s.id} className={styles.menuItem}>
                <TransitionLink href={`/#${s.id}`} onClick={(e) => goTo(e, s.id)} data-menu-link className={styles.menuLink}>
                  <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                  {s.label}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>

        <aside className={styles.menuAside}>
          <div data-menu-fade>
            <span className="mono muted">Say hello</span>
            <a href={`mailto:${profile.email}`} className={`${styles.menuMail} u-link`}>
              {profile.email}
            </a>
          </div>
          <div data-menu-fade>
            <span className="mono muted">Elsewhere</span>
            <ul className={styles.menuSocials}>
              {profile.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="u-link">
                    {s.label} ↗
                  </a>
                </li>
              ))}
              <li>
                <a href={profile.resume} target="_blank" rel="noreferrer" className="u-link">
                  Résumé ↗
                </a>
              </li>
            </ul>
          </div>
          <div data-menu-fade className={styles.menuNow}>
            <span className="mono muted">Currently</span>
            <p>
              {profile.now.role} at {profile.now.org}
            </p>
          </div>
          {snd.supported && (
            <div data-menu-fade className={styles.menuSound} data-sound-control>
              <span className="mono muted">Soundtrack</span>
              <ul>
                {playlist.map((t, i) => {
                  const on = snd.playing && snd.index === i
                  return (
                    <li key={t.title}>
                      <button className={styles.trackItem} aria-pressed={on} onClick={() => (on ? sound.pause() : sound.select(i))}>
                        <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                        <span className={styles.trackTitle}>{t.title}</span>
                        <span className="mono muted">{on ? 'Playing' : t.note}</span>
                        <SoundBars active={on} className={styles.trackBars} />
                      </button>
                    </li>
                  )
                })}
              </ul>
              <div className={styles.soundRow}>
                <button className="btn" onClick={() => sound.toggle()}>
                  {soundOn ? 'Mute' : 'Play'}
                </button>
                <label className={`${styles.volume} mono muted`}>
                  Volume
                  <input type="range" min={0} max={1} step={0.01} value={snd.volume} onChange={(e) => sound.setVolume(Number(e.target.value))} />
                </label>
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
