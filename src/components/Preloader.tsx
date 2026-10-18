'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { getLenis, markIntroDone, prefersReducedMotion, scrollTo } from '@/lib/runtime'
import { sound } from '@/lib/sound/engine'
import { soundHint } from '@/content/music'
import SoundBars from './SoundBars'
import styles from './Preloader.module.css'

const LOG = [
  { at: 8, text: 'initializing weights' },
  { at: 34, text: 'loading tensors' },
  { at: 61, text: 'warming up attention' },
  { at: 88, text: 'compiling curiosity' },
]

function finish() {
  document.documentElement.classList.remove('is-loading')
  getLenis()?.start()
  markIntroDone()
  // Deep links like /#research: jump there once layout (pins included) has settled.
  const hash = window.location.hash
  if (hash.length > 1) {
    ScrollTrigger.refresh()
    requestAnimationFrame(() => scrollTo(hash, { immediate: true }))
  }
}

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const log = useRef<HTMLOListElement>(null)
  const [gone, setGone] = useState(false)
  const [gate, setGate] = useState(false)

  const exit = () => {
    if (!root.current) return
    const tl = gsap.timeline({ onComplete: () => setGone(true) })
    tl.to(root.current.firstElementChild, { yPercent: -12, autoAlpha: 0, duration: 0.7, ease: 'power3.in' }, 0)
      .to(root.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.25, ease: 'expo.inOut' }, 0.25)
      .add(finish, 0.75)
  }

  // The click is the user gesture browsers require before audio can start.
  const choose = (withSound: boolean) => {
    if (withSound) sound.play()
    else sound.pause()
    exit()
  }

  useEffect(() => {
    sound.init()
    if (prefersReducedMotion()) {
      if (sound.preference() === 'on') sound.arm()
      finish()
      setGone(true)
      return
    }

    // Render the soundtrack while the counter runs, so it's ready the moment they choose.
    if (sound.preference() !== 'off') sound.prepare()

    let seen = false
    try {
      seen = sessionStorage.getItem('rd:seen') === '1'
      sessionStorage.setItem('rd:seen', '1')
    } catch {}

    const lines = Array.from(log.current?.children ?? []) as HTMLElement[]
    const state = { v: 0 }
    const counting = new Promise<void>((resolve) => {
      gsap.to(state, {
        v: 100,
        duration: seen ? 1 : 2.4,
        ease: 'power3.inOut',
        onUpdate: () => {
          const v = Math.round(state.v)
          if (count.current) count.current.textContent = String(v).padStart(3, '0')
          if (bar.current) bar.current.style.transform = `scaleX(${state.v / 100})`
          LOG.forEach((l, i) => lines[i]?.classList.toggle(styles.on, v >= l.at))
        },
        onComplete: resolve,
      })
    })
    const loaded = new Promise<void>((resolve) => {
      if (document.readyState === 'complete') resolve()
      else window.addEventListener('load', () => resolve(), { once: true })
      setTimeout(resolve, 5000)
    })

    let killed = false
    Promise.all([counting, loaded, document.fonts?.ready]).then(() => {
      if (killed || !root.current) return
      const pref = sound.preference()
      // First visit: ask, and render the first track while they decide so it starts instantly.
      // Returning visitors keep their choice ("on" starts at their first click).
      if (sound.getState().supported && pref === null) {
        sound.prepare()
        return setGate(true)
      }
      if (pref === 'on') sound.arm()
      exit()
    })

    return () => {
      killed = true
    }
  }, [])

  if (gone) return null

  return (
    <div
      ref={root}
      className={`${styles.preloader} preloader`}
      aria-hidden={!gate}
      role={gate ? 'dialog' : undefined}
      aria-label={gate ? 'Choose whether to play music' : undefined}
    >
      <div className={styles.inner}>
        <div className={`${styles.top} mono`}>
          <span>Rudray Dave</span>
          <span>AI Engineer & Researcher</span>
          <span suppressHydrationWarning>Portfolio ©{new Date().getFullYear()}</span>
        </div>

        <ol ref={log} className={`${styles.log} mono`}>
          {LOG.map((l) => (
            <li key={l.text}>
              <span>&gt; {l.text}</span>
              <span className={styles.dots} />
              <span>ok</span>
            </li>
          ))}
        </ol>

        <div className={styles.bottom}>
          <div className={styles.count}>
            <span ref={count}>000</span>
            <sup>%</sup>
          </div>
          {gate ? (
            <div className={styles.gate} data-sound-control>
              <p className={`${styles.gateHint} mono`}>{soundHint}</p>
              <div className={styles.gateButtons}>
                <button className={styles.enterSound} onClick={() => choose(true)} autoFocus>
                  <SoundBars demo />
                  Enter with sound
                </button>
                <button className={styles.enterSilent} onClick={() => choose(false)}>
                  Enter in silence
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.barWrap}>
              <span className="mono">Loading weights</span>
              <div className={styles.bar}>
                <span ref={bar} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
