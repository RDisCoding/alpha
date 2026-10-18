import { bass, bell, crackle, hat, keys, kick, makeImpulse, makeNoise, pad, pick, pluck, snare, synthBass, type Kit } from './instruments'

/*
 * Each generative track is a fixed-length score rendered once, off the main thread, in an
 * OfflineAudioContext. Playback is then a single looping buffer, so nothing the page does
 * (scrolling, WebGL, image loading) can interrupt or glitch the music.
 */

export type GenerativeId = 'lofi-tensors' | 'latent-drift' | 'night-shift'
/** `tail`: how long sound rings past the end (releases + reverb + echoes); it's folded back onto the start. */
type Score = { seconds: number; tail: number; compose: (k: Kit) => void }
type Chord = { notes: number[]; bass: number; top: number[] }

/** Calls `onStep` for every step of a `seconds`-long score. */
function steps(seconds: number, bpm: number, perBeat: number, onStep: (step: number, t: number, stepDur: number) => void) {
  const sd = 60 / bpm / perBeat
  const n = Math.round(seconds / sd)
  for (let step = 0; step < n; step++) onStep(step, step * sd, sd)
}

/* ---------------------------------------------------------------------------
   Lo-fi Tensors — 78 bpm, swung boom-bap, FM keys, tape wobble and vinyl.
   Fmaj9 → Em7 → Dm9 → Cmaj9, eight bars.
--------------------------------------------------------------------------- */
function lofi(): Score {
  const bpm = 78
  const seconds = 8 * 4 * (60 / bpm)
  return {
    seconds,
    tail: 6,
    compose(k) {
      const { ctx } = k
      k.setDelay((60 / bpm) * 0.75, 0.3)

      // Tape wobble (modulated short delay) → warm lowpass. The LFO completes whole cycles per loop.
      const input = ctx.createGain()
      const wobble = ctx.createDelay(0.05)
      wobble.delayTime.value = 0.012
      const lfo = ctx.createOscillator()
      lfo.frequency.value = Math.round(0.55 * seconds) / seconds
      const lfoDepth = ctx.createGain()
      lfoDepth.gain.value = 0.0016
      lfo.connect(lfoDepth)
      lfoDepth.connect(wobble.delayTime)
      lfo.start(0)
      const tone = ctx.createBiquadFilter()
      tone.type = 'lowpass'
      tone.frequency.value = 8000
      input.connect(wobble)
      wobble.connect(tone)
      tone.connect(k.out)
      const kit: Kit = { ...k, out: input }

      const chords: Chord[] = [
        { notes: [53, 57, 60, 64, 67], bass: 41, top: [69, 72, 76, 79] },
        { notes: [52, 55, 59, 62], bass: 40, top: [67, 71, 74, 76] },
        { notes: [50, 53, 57, 60, 64], bass: 38, top: [69, 72, 74, 77] },
        { notes: [48, 52, 55, 59, 62], bass: 36, top: [67, 71, 72, 76] },
      ]
      crackle(kit, seconds, 0.05)

      steps(seconds, bpm, 4, (step, t, sd) => {
        const s = step % 16
        const ch = chords[Math.floor(step / 16) % chords.length]
        const tt = s % 4 === 2 ? t + sd * 0.34 : t // swing the off-beat 8ths

        if (s === 0) kick(kit, t, 0.4)
        if (s === 10) kick(kit, tt, 0.3)
        if (s === 7 && Math.random() < 0.45) kick(kit, t, 0.22)
        if (s === 4 || s === 12) snare(kit, t, 0.2, { tone: 180, send: 0.3 })
        if (s % 2 === 0) hat(kit, tt, 0.045 + Math.random() * 0.025, s === 14 && Math.random() < 0.3, 5200)

        if (s === 0) {
          ch.notes.forEach((m, i) => keys(kit, m, t + i * 0.022, { level: 0.06, decay: 3.6 }))
          ch.notes.forEach((m) => pad(kit, m + 12, t, sd * 15, { level: 0.008, attack: 0.4, release: 0.8, cutoff: 2200, send: 0.4 }))
        }
        if (s === 6 && Math.random() < 0.8) ch.notes.slice(1).forEach((m, i) => keys(kit, m, tt + i * 0.015, { level: 0.034, decay: 1.4 }))
        if (s === 11 && Math.random() < 0.6) ch.notes.slice(-2).forEach((m) => keys(kit, m, t, { level: 0.03, decay: 1.2 }))
        if (s === 14 && Math.random() < 0.5) ch.notes.slice(-3).forEach((m, i) => keys(kit, m, tt + i * 0.02, { level: 0.026, decay: 1 }))
        if ((s === 8 || s === 13 || s === 14) && Math.random() < 0.3) keys(kit, pick(ch.top), tt, { level: 0.042, decay: 1.8, bright: 0.7, send: 0.35 })

        if (s === 0) bass(kit, ch.bass, t, sd * 6, { level: 0.1, cutoff: 600 })
        if (s === 7) bass(kit, ch.bass, t, sd * 2, { level: 0.075, cutoff: 600 })
        if (s === 10) bass(kit, ch.bass + (Math.random() < 0.5 ? 7 : 12), tt, sd * 4, { level: 0.075, cutoff: 600 })
      })
    },
  }
}

/* ---------------------------------------------------------------------------
   Latent Drift — ambient. Slow lydian-tinted pads in D, pentatonic glass bells.
   Dmaj9 → Bm9 → Gmaj9#11 → Asus2, eight seconds each.
--------------------------------------------------------------------------- */
function ambient(): Score {
  const seconds = 32
  return {
    seconds,
    tail: 8,
    compose(k) {
      k.setDelay(0.75, 0.45)
      const chords: Chord[] = [
        { notes: [50, 57, 61, 64, 66], bass: 38, top: [] },
        { notes: [47, 54, 57, 61, 62], bass: 35, top: [] },
        { notes: [43, 50, 54, 57, 61], bass: 31, top: [] },
        { notes: [45, 52, 57, 59, 64], bass: 33, top: [] },
      ]
      const penta = [74, 76, 78, 81, 83, 86, 88]
      steps(seconds, 60, 1, (step, t) => {
        const ch = chords[Math.floor(step / 8) % chords.length]
        if (step % 8 === 0) {
          ch.notes.forEach((m, i) => pad(k, m, t + i * 0.09, 8, { level: 0.03, attack: 2.6, release: 4.5, cutoff: 1700, send: 0.75 }))
          bass(k, ch.bass + 12, t, 8, { level: 0.05, type: 'sine', cutoff: 300, attack: 1.8, release: 3.5 })
        }
        if (Math.random() < 0.42) {
          bell(k, pick(penta), t + Math.random() * 0.9, { level: 0.04 + Math.random() * 0.035, decay: 3.2, pan: Math.random() * 1.4 - 0.7, send: 0.85, delay: 0.4 })
        }
      })
    },
  }
}

/* ---------------------------------------------------------------------------
   Night Shift — 96 bpm synthwave. Arpeggios through a dotted-eighth delay.
   Am → F → C → G, eight bars.
--------------------------------------------------------------------------- */
function synthwave(): Score {
  const bpm = 96
  const seconds = 8 * 4 * (60 / bpm)
  return {
    seconds,
    tail: 5,
    compose(k) {
      k.setDelay((60 / bpm) * 0.75, 0.38)
      const chords: Chord[] = [
        { notes: [57, 60, 64, 69], bass: 33, top: [] },
        { notes: [53, 57, 60, 65], bass: 29, top: [] },
        { notes: [55, 60, 64, 67], bass: 36, top: [] },
        { notes: [55, 59, 62, 67], bass: 31, top: [] },
      ]
      const pattern = [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 2, 1, 3]
      steps(seconds, bpm, 4, (step, t, sd) => {
        const s = step % 16
        const ch = chords[Math.floor(step / 16) % chords.length]
        pluck(k, ch.notes[pattern[s]] + (s >= 12 ? 12 : 0), t, { level: 0.05, cutoff: 2600, pan: s % 2 ? 0.35 : -0.35, delay: 0.38 })
        if (s % 2 === 0) synthBass(k, ch.bass + 12 + (s % 4 === 2 ? 12 : 0), t, sd * 2, 0.065)
        if (s === 0) ch.notes.forEach((m) => pad(k, m, t, sd * 15, { level: 0.018, attack: 0.5, release: 1.2, cutoff: 2600, send: 0.5 }))
        if (s === 0 || s === 8) kick(k, t, 0.36)
        if (s === 4 || s === 12) snare(k, t, 0.17, { tone: 200, decay: 0.26, send: 0.55 })
        if (s % 2 === 0) hat(k, t, 0.045, false, 6500)
      })
    },
  }
}

const scores: Record<GenerativeId, () => Score> = {
  'lofi-tensors': lofi,
  'latent-drift': ambient,
  'night-shift': synthwave,
}

/**
 * Renders a track to a seamless looping buffer: everything that rings past the end
 * (releases, reverb, echoes) is folded back onto the start, like a real loop would hear it.
 */
export async function renderTrack(id: GenerativeId, sampleRate: number): Promise<AudioBuffer> {
  const score = scores[id]()
  const loopLen = Math.round(score.seconds * sampleRate)
  const ctx = new OfflineAudioContext(2, loopLen + Math.round(score.tail * sampleRate), sampleRate)

  const bus = ctx.createGain()
  bus.connect(ctx.destination)

  const reverbIn = ctx.createGain()
  const conv = ctx.createConvolver()
  conv.buffer = makeImpulse(ctx)
  const revOut = ctx.createGain()
  revOut.gain.value = 0.8
  reverbIn.connect(conv)
  conv.connect(revOut)
  revOut.connect(bus)

  const delayIn = ctx.createGain()
  const delay = ctx.createDelay(2)
  const feedback = ctx.createGain()
  const damp = ctx.createBiquadFilter()
  damp.type = 'lowpass'
  damp.frequency.value = 2600
  const delOut = ctx.createGain()
  delOut.gain.value = 0.5
  delayIn.connect(delay)
  delay.connect(damp)
  damp.connect(feedback)
  feedback.connect(delay)
  damp.connect(delOut)
  delOut.connect(bus)
  delOut.connect(reverbIn)

  score.compose({
    ctx,
    out: bus,
    reverb: reverbIn,
    delay: delayIn,
    noise: makeNoise(ctx),
    setDelay: (seconds, fb) => {
      delay.delayTime.value = seconds
      feedback.gain.value = fb
    },
  })

  const rendered = await ctx.startRendering()
  const loop = new AudioBuffer({ numberOfChannels: 2, length: loopLen, sampleRate })
  for (let ch = 0; ch < 2; ch++) {
    const src = rendered.getChannelData(ch)
    const dst = loop.getChannelData(ch)
    dst.set(src.subarray(0, loopLen))
    for (let i = loopLen; i < src.length; i++) dst[i - loopLen] += src[i]
  }
  return loop
}
