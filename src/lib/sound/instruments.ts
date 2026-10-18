/*
 * Small Web Audio instruments. Every function schedules one note at time `t`.
 * They run inside an OfflineAudioContext: tracks are rendered to a loop up front, never synthesised live.
 */

export type Kit = {
  ctx: BaseAudioContext
  /** Dry output for this track. */
  out: AudioNode
  /** Reverb and delay sends. */
  reverb: AudioNode
  delay: AudioNode
  noise: AudioBuffer
  setDelay: (seconds: number, feedback: number) => void
}

export const mtof = (m: number) => 440 * 2 ** ((m - 69) / 12)
export const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

function send(k: Kit, node: AudioNode, target: AudioNode, amount: number) {
  if (amount <= 0) return
  const g = k.ctx.createGain()
  g.gain.value = amount
  node.connect(g)
  g.connect(target)
}

export function makeNoise(ctx: BaseAudioContext, seconds = 2) {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return buf
}

/** Stereo impulse response: decaying noise, a cheap but lush hall. */
export function makeImpulse(ctx: BaseAudioContext, seconds = 2.6, decay = 2.6) {
  const len = Math.floor(ctx.sampleRate * seconds)
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** decay
  }
  return buf
}

/* ---------------- tonal ---------------- */

/** Warm detuned-saw pad with a slow filter swell. */
export function pad(k: Kit, midi: number, t: number, dur: number, o: { level?: number; attack?: number; release?: number; cutoff?: number; send?: number } = {}) {
  const { ctx } = k
  const level = o.level ?? 0.03
  const attack = o.attack ?? 2
  const release = o.release ?? 3
  const cutoff = o.cutoff ?? 1000
  const hold = t + Math.max(attack, dur)
  const end = hold + release + 0.05

  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(level, t + attack)
  g.gain.setValueAtTime(level, hold)
  g.gain.linearRampToValueAtTime(0, hold + release)

  // A static cutoff keeps the filter cheap (automating it recomputes coefficients every sample).
  const f = ctx.createBiquadFilter()
  f.type = 'lowpass'
  f.Q.value = 0.4
  f.frequency.value = cutoff

  ;[-8, 8].forEach((detune) => {
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = mtof(midi)
    osc.detune.value = detune
    osc.connect(f)
    osc.start(t)
    osc.stop(end)
  })
  f.connect(g)
  g.connect(k.out)
  send(k, g, k.reverb, o.send ?? 0.6)
}

/** Glassy bell: sine plus two inharmonic partials. */
export function bell(k: Kit, midi: number, t: number, o: { level?: number; decay?: number; pan?: number; send?: number; delay?: number } = {}) {
  const { ctx } = k
  const level = o.level ?? 0.05
  const decay = o.decay ?? 2.6
  const freq = mtof(midi)
  const panner = ctx.createStereoPanner()
  panner.pan.value = o.pan ?? 0
  ;[
    [1, 1, decay],
    [2.76, 0.22, decay * 0.45],
    [5.4, 0.07, decay * 0.25],
  ].forEach(([ratio, amp, dec]) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq * ratio
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(level * amp, t + 0.006)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dec)
    osc.connect(g)
    g.connect(panner)
    osc.start(t)
    osc.stop(t + dec + 0.05)
  })
  panner.connect(k.out)
  send(k, panner, k.reverb, o.send ?? 0.7)
  send(k, panner, k.delay, o.delay ?? 0.3)
}

/** Electric-piano-ish FM voice: bright bark on the attack, mellow tail. */
export function keys(k: Kit, midi: number, t: number, o: { level?: number; decay?: number; bright?: number; send?: number } = {}) {
  const { ctx } = k
  const level = o.level ?? 0.05
  const decay = o.decay ?? 2.4
  const bright = o.bright ?? 0.4
  const freq = mtof(midi)

  const car = ctx.createOscillator()
  car.type = 'sine'
  car.frequency.value = freq
  const mod = ctx.createOscillator()
  mod.type = 'sine'
  mod.frequency.value = freq
  const depth = ctx.createGain()
  depth.gain.setValueAtTime(freq * (0.6 + bright * 1.8), t)
  depth.gain.exponentialRampToValueAtTime(freq * 0.08, t + 0.45)
  mod.connect(depth)
  depth.connect(car.frequency)

  const amp = ctx.createGain()
  amp.gain.setValueAtTime(0, t)
  amp.gain.linearRampToValueAtTime(level, t + 0.006)
  amp.gain.exponentialRampToValueAtTime(level * 0.35, t + 0.35)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + decay)
  car.connect(amp)
  amp.connect(k.out)
  send(k, amp, k.reverb, o.send ?? 0.25)

  car.start(t)
  mod.start(t)
  car.stop(t + decay + 0.05)
  mod.stop(t + decay + 0.05)
}

/** Round sub/bass note. */
export function bass(k: Kit, midi: number, t: number, dur: number, o: { level?: number; type?: OscillatorType; cutoff?: number; attack?: number; release?: number } = {}) {
  const { ctx } = k
  const level = o.level ?? 0.12
  const attack = o.attack ?? 0.012
  const release = o.release ?? 0.15
  const osc = ctx.createOscillator()
  osc.type = o.type ?? 'triangle'
  osc.frequency.value = mtof(midi)
  const f = ctx.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.value = o.cutoff ?? 420
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(level, t + attack)
  g.gain.setTargetAtTime(level * 0.7, t + attack, dur * 0.4)
  g.gain.setValueAtTime(level * 0.7, t + Math.max(dur, attack))
  g.gain.linearRampToValueAtTime(0, t + Math.max(dur, attack) + release)
  osc.connect(f)
  f.connect(g)
  g.connect(k.out)
  osc.start(t)
  osc.stop(t + Math.max(dur, attack) + release + 0.05)
}

/** Synthwave bass: saw with a snappy filter envelope. */
export function synthBass(k: Kit, midi: number, t: number, dur: number, level = 0.08) {
  const { ctx } = k
  const osc = ctx.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.value = mtof(midi)
  const f = ctx.createBiquadFilter()
  f.type = 'lowpass'
  f.Q.value = 3
  f.frequency.setValueAtTime(800, t)
  f.frequency.exponentialRampToValueAtTime(180, t + 0.16)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(level, t + 0.005)
  g.gain.setTargetAtTime(0, t + dur * 0.6, 0.05)
  osc.connect(f)
  f.connect(g)
  g.connect(k.out)
  osc.start(t)
  osc.stop(t + dur + 0.3)
}

/** Resonant pluck for arpeggios. */
export function pluck(k: Kit, midi: number, t: number, o: { level?: number; cutoff?: number; decay?: number; pan?: number; send?: number; delay?: number } = {}) {
  const { ctx } = k
  const level = o.level ?? 0.045
  const decay = o.decay ?? 0.32
  const cutoff = o.cutoff ?? 1600
  const panner = ctx.createStereoPanner()
  panner.pan.value = o.pan ?? 0
  const f = ctx.createBiquadFilter()
  f.type = 'lowpass'
  f.Q.value = 5
  f.frequency.setValueAtTime(cutoff, t)
  f.frequency.exponentialRampToValueAtTime(260, t + decay)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(level, t + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay * 1.6)
  ;(['sawtooth', 'square'] as const).forEach((type, i) => {
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.value = mtof(midi)
    osc.detune.value = i ? 6 : -6
    osc.connect(f)
    osc.start(t)
    osc.stop(t + decay * 1.6 + 0.05)
  })
  f.connect(g)
  g.connect(panner)
  panner.connect(k.out)
  send(k, panner, k.reverb, o.send ?? 0.3)
  send(k, panner, k.delay, o.delay ?? 0.35)
}

/* ---------------- drums ---------------- */

function noiseHit(k: Kit, t: number) {
  const src = k.ctx.createBufferSource()
  src.buffer = k.noise
  src.start(t, Math.random() * (k.noise.duration - 0.5))
  return src
}

export function kick(k: Kit, t: number, level = 0.5) {
  const { ctx } = k
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(150, t)
  osc.frequency.exponentialRampToValueAtTime(44, t + 0.12)
  const g = ctx.createGain()
  g.gain.setValueAtTime(level, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.42)
  osc.connect(g)
  g.connect(k.out)
  osc.start(t)
  osc.stop(t + 0.45)
}

export function snare(k: Kit, t: number, level = 0.18, o: { tone?: number; decay?: number; send?: number } = {}) {
  const { ctx } = k
  const decay = o.decay ?? 0.2
  const src = noiseHit(k, t)
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 1900
  bp.Q.value = 0.7
  const g = ctx.createGain()
  g.gain.setValueAtTime(level, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + decay)
  src.connect(bp)
  bp.connect(g)
  g.connect(k.out)
  src.stop(t + decay + 0.02)
  send(k, g, k.reverb, o.send ?? 0.25)

  const body = ctx.createOscillator()
  body.type = 'triangle'
  body.frequency.value = o.tone ?? 190
  const bg = ctx.createGain()
  bg.gain.setValueAtTime(level * 0.7, t)
  bg.gain.exponentialRampToValueAtTime(0.001, t + 0.09)
  body.connect(bg)
  bg.connect(k.out)
  body.start(t)
  body.stop(t + 0.12)
}

export function hat(k: Kit, t: number, level = 0.05, open = false, cutoff = 7200) {
  const { ctx } = k
  const decay = open ? 0.22 : 0.045
  const src = noiseHit(k, t)
  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = cutoff
  const g = ctx.createGain()
  g.gain.setValueAtTime(level, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + decay)
  src.connect(hp)
  hp.connect(g)
  g.connect(k.out)
  src.stop(t + decay + 0.02)
}

/** Vinyl crackle + hiss from 0 until `until` seconds. */
export function crackle(k: Kit, until: number, level = 0.05) {
  const { ctx } = k
  const len = ctx.sampleRate * 4
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) {
    d[i] += (Math.random() * 2 - 1) * 0.02
    if (Math.random() < 0.00035) {
      const a = (Math.random() * 2 - 1) * (0.3 + Math.random() * 0.5)
      for (let j = 0; j < 24 && i + j < len; j++) d[i + j] += a * Math.exp(-j / 5)
    }
  }
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.loop = true
  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 500
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 5200
  const g = ctx.createGain()
  g.gain.value = level
  src.connect(hp)
  hp.connect(lp)
  lp.connect(g)
  g.connect(k.out)
  src.start(0)
  src.stop(until)
}
