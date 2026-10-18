/**
 * The site soundtrack. The three generative tracks are composed live in the browser (no files, no licensing).
 *
 * To add your own song, put the file in /public/music and add an entry like:
 *   { kind: 'file', title: 'Song name', note: 'Artist', src: '/music/song.mp3' }
 * Only use music you have the rights to publish.
 */
export type TrackSpec =
  | { kind: 'generative'; id: 'lofi-tensors' | 'latent-drift' | 'night-shift'; title: string; note: string }
  | { kind: 'file'; title: string; note: string; src: string }

export const playlist: TrackSpec[] = [
  { kind: 'generative', id: 'lofi-tensors', title: 'Lo-fi Tensors', note: 'Lo-fi · 78 bpm' },
  { kind: 'generative', id: 'latent-drift', title: 'Latent Drift', note: 'Ambient · 60 bpm' },
  { kind: 'generative', id: 'night-shift', title: 'Night Shift', note: 'Synthwave · 96 bpm' },
]

export const soundHint = 'The soundtrack is composed live in your browser. Best with headphones.'
