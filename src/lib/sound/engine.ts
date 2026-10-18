'use client'

import { useSyncExternalStore } from 'react'
import { playlist } from '@/content/music'
import { renderTrack } from './tracks'

/*
 * Live graph (deliberately tiny, so the page can never starve it):
 *   looping AudioBuffer → track fade → muffle (lowpass) → master (volume) → compressor → analyser → speakers
 * Generative tracks are pre-rendered off the main thread (see tracks.ts) and cached.
 */

export type SoundState = {
  supported: boolean
  playing: boolean
  /** Waiting for a track to finish rendering. */
  loading: boolean
  /** Will start on the visitor's next click/keypress (browsers block audio before a gesture). */
  armed: boolean
  index: number
  volume: number
}

const KEY = { pref: 'rd:sound', track: 'rd:track', volume: 'rd:volume' }
const LEVEL = 1.5
/**
 * Everything runs at 32 kHz: renders are 1.5× cheaper, buffers match the live context exactly
 * (no in-graph resampling), and the browser upsamples to the speakers with a high-quality resampler.
 */
const RATE = 32000

const store = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v)
    } catch {}
  },
}

type Running = { index: number; fade: GainNode; stop: (at: number) => void }

class SoundEngine {
  private state: SoundState = { supported: false, playing: false, loading: false, armed: false, index: 0, volume: 0.7 }
  private readonly serverState: SoundState = this.state
  private listeners = new Set<() => void>()
  private ready = false

  private ctx: AudioContext | null = null
  private bus!: GainNode
  private muffleFilter!: BiquadFilterNode
  private master!: GainNode
  private analyser!: AnalyserNode
  private bins: Uint8Array<ArrayBuffer> | null = null
  private current: Running | null = null
  private buffers = new Map<number, Promise<AudioBuffer | null>>()
  private token = 0
  private suspendTimer = 0

  /* ---------- store plumbing (for useSyncExternalStore) ---------- */

  subscribe = (fn: () => void) => {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }
  getState = () => this.state
  getServerState = () => this.serverState
  private update(patch: Partial<SoundState>) {
    this.state = { ...this.state, ...patch }
    this.listeners.forEach((fn) => fn())
  }

  /** Reads saved preferences. Safe to call repeatedly; client only. */
  init() {
    if (this.ready || typeof window === 'undefined') return
    this.ready = true
    const supported = ('AudioContext' in window || 'webkitAudioContext' in window) && 'OfflineAudioContext' in window
    const index = Math.min(Number(store.get(KEY.track) ?? 0) || 0, playlist.length - 1)
    const savedVol = store.get(KEY.volume)
    const volume = savedVol !== null && Number.isFinite(Number(savedVol)) ? Number(savedVol) : 0.7
    this.update({ supported, index, volume })

    document.addEventListener('visibilitychange', () => {
      if (!this.ctx || !this.state.playing) return
      if (document.hidden) {
        this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15)
        this.suspendTimer = window.setTimeout(() => this.ctx?.suspend(), 600)
      } else {
        clearTimeout(this.suspendTimer)
        this.ctx.resume()
        this.master.gain.setTargetAtTime(this.state.volume * LEVEL, this.ctx.currentTime, 0.4)
      }
    })
  }

  /** The visitor's saved choice: 'on', 'off' or null if they never chose. */
  preference() {
    return store.get(KEY.pref) as 'on' | 'off' | null
  }

  /* ---------- audio ---------- */

  private ensure() {
    if (this.ctx) return this.ctx
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    let ctx: AudioContext
    try {
      ctx = new AC({ latencyHint: 'playback', sampleRate: RATE })
    } catch {
      ctx = new AC({ latencyHint: 'playback' })
    }
    this.ctx = ctx

    this.bus = ctx.createGain()
    this.muffleFilter = ctx.createBiquadFilter()
    this.muffleFilter.type = 'lowpass'
    this.muffleFilter.frequency.value = 20000
    this.master = ctx.createGain()
    this.master.gain.value = 0
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -16
    comp.ratio.value = 3
    comp.attack.value = 0.01
    comp.release.value = 0.25
    this.analyser = ctx.createAnalyser()
    this.analyser.fftSize = 256
    this.analyser.smoothingTimeConstant = 0.82
    this.bins = new Uint8Array(this.analyser.frequencyBinCount)

    this.bus.connect(this.muffleFilter)
    this.muffleFilter.connect(this.master)
    this.master.connect(comp)
    comp.connect(this.analyser)
    this.analyser.connect(ctx.destination)
    return ctx
  }

  /** Rendered loop for a generative track (cached), or null for a file track. */
  private load(index: number) {
    let job = this.buffers.get(index)
    if (!job) {
      const spec = playlist[index]
      job = spec.kind === 'file' ? Promise.resolve(null) : renderTrack(spec.id, this.ctx?.sampleRate ?? RATE)
      job.catch(() => this.buffers.delete(index))
      this.buffers.set(index, job)
    }
    return job
  }

  /** Start rendering a track ahead of time (e.g. while the preloader asks about sound). */
  prepare(index = this.state.index) {
    if (this.state.supported) this.load(index)
  }

  private prefetch(index: number) {
    if (this.buffers.has(index)) return
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
    const run = () => this.load(index)
    if (idle) idle(run, { timeout: 4000 })
    else setTimeout(run, 1500)
  }

  private launch(index: number, buffer: AudioBuffer | null): Running {
    const ctx = this.ctx!
    const fade = ctx.createGain()
    fade.gain.value = 0
    fade.gain.setTargetAtTime(1, ctx.currentTime, 0.5)
    fade.connect(this.bus)
    const spec = playlist[index]

    if (spec.kind === 'file' || !buffer) {
      const el = new Audio(spec.kind === 'file' ? spec.src : '')
      el.loop = true
      const node = ctx.createMediaElementSource(el)
      node.connect(fade)
      el.play().catch(() => {})
      return { index, fade, stop: () => setTimeout(() => el.pause(), 1500) }
    }

    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.loop = true
    src.connect(fade)
    src.start()
    return { index, fade, stop: (at) => src.stop(at) }
  }

  private retire(run: Running | null) {
    if (!run || !this.ctx) return
    const now = this.ctx.currentTime
    run.fade.gain.cancelScheduledValues(now)
    run.fade.gain.setTargetAtTime(0, now, 0.35)
    run.stop(now + 2)
    setTimeout(() => run.fade.disconnect(), 2500)
  }

  /* ---------- controls ---------- */

  /** Start, resume or switch track. Call from a user gesture the first time. */
  play(index = this.state.index) {
    if (!this.state.supported) return
    const ctx = this.ensure()
    clearTimeout(this.suspendTimer)
    if (ctx.state !== 'running') ctx.resume().catch(() => {})
    this.disarm()
    this.master.gain.cancelScheduledValues(ctx.currentTime)
    this.master.gain.setTargetAtTime(this.state.volume * LEVEL, ctx.currentTime, 0.35)
    store.set(KEY.pref, 'on')
    store.set(KEY.track, String(index))

    // Same track (e.g. un-muting): just resume where it left off.
    if (this.current?.index === index) {
      this.update({ playing: true, armed: false, loading: false, index })
      return
    }

    const token = ++this.token
    this.retire(this.current)
    this.current = null
    this.update({ playing: true, armed: false, loading: true, index })
    this.load(index).then(
      (buffer) => {
        if (token !== this.token || !this.state.playing) return
        this.current = this.launch(index, buffer)
        this.update({ loading: false })
        this.prefetch((index + 1) % playlist.length)
      },
      () => token === this.token && this.update({ loading: false, playing: false }),
    )
  }

  pause() {
    this.disarm()
    store.set(KEY.pref, 'off')
    this.update({ playing: false, armed: false, loading: false })
    if (!this.ctx) return
    const ctx = this.ctx
    this.master.gain.setTargetAtTime(0, ctx.currentTime, 0.25)
    // Keep the current track; suspending the context freezes it mid-song for a seamless resume.
    this.suspendTimer = window.setTimeout(() => {
      if (!this.state.playing) ctx.suspend()
    }, 1300)
  }

  /** While armed the UI already reads "Sound on", so toggling means off. */
  toggle() {
    if (this.state.playing || this.state.armed) this.pause()
    else this.play()
  }

  next() {
    this.play((this.state.index + 1) % playlist.length)
  }

  select(index: number) {
    this.play(index)
  }

  setVolume(volume: number) {
    store.set(KEY.volume, String(volume))
    this.update({ volume })
    if (this.ctx && this.state.playing) this.master.gain.setTargetAtTime(volume * LEVEL, this.ctx.currentTime, 0.05)
  }

  /** Dull the mix (e.g. while the menu overlay is open). */
  muffle(on: boolean) {
    if (!this.ctx) return
    this.muffleFilter.frequency.setTargetAtTime(on ? 700 : 20000, this.ctx.currentTime, on ? 0.12 : 0.3)
  }

  /** Returning visitors who chose sound: start on their first click or key press. */
  arm() {
    if (!this.state.supported || this.state.playing) return
    this.update({ armed: true })
    this.prepare()
    window.addEventListener('pointerdown', this.onGesture, true)
    window.addEventListener('keydown', this.onGesture, true)
  }

  private disarm() {
    window.removeEventListener('pointerdown', this.onGesture, true)
    window.removeEventListener('keydown', this.onGesture, true)
  }

  private onGesture = (e: Event) => {
    // Let the sound controls handle their own clicks.
    if ((e.target as Element | null)?.closest?.('[data-sound-control]')) return
    this.play()
  }

  /** Four smoothed band levels (0..1) for the equaliser bars. */
  levels(out: number[]) {
    if (!this.bins || !this.state.playing || this.state.loading) {
      out.fill(0)
      return out
    }
    this.analyser.getByteFrequencyData(this.bins)
    const bands = [
      [1, 3],
      [4, 10],
      [11, 28],
      [29, 70],
    ]
    bands.forEach(([a, b], i) => {
      let sum = 0
      for (let j = a; j <= b; j++) sum += this.bins![j]
      out[i] = sum / (b - a + 1) / 255
    })
    return out
  }
}

export const sound = new SoundEngine()

export function useSound() {
  return useSyncExternalStore(sound.subscribe, sound.getState, sound.getServerState)
}
