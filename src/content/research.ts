import type { Link } from './profile'

export const researchIntro =
  'Research is where I spend most of my time. It lives where deep learning meets the messy real world — forged audio, noisy sensors, and models that should keep learning after they ship.'

export const interests = ['Continual learning', 'Efficient LLM training', 'Audio forensics', 'Model robustness', 'Signal processing']

export const mentors: Link[] = [
  { label: 'Dr. Sudhakar Mishra', href: 'https://scholar.google.com/citations?hl=en&user=raA5Dc8AAAAJ' },
  { label: 'Dr. Rahul Dixit', href: 'https://scholar.google.com/citations?user=v8yxEN8AAAAJ&hl=en&oi=ao' },
]

export type Publication = {
  year: string
  status: string
  title: string
  venue: string
  note: string
  slug?: string
  links?: Link[]
}

export const publications: Publication[] = [
  {
    year: '2025',
    status: 'Accepted',
    title: 'Full LibriSpeech Copy-Move Forgery Dataset',
    venue: 'Springer conference proceedings',
    note: 'A 57,078-sample, speaker-disjoint benchmark for copy-move audio forgery detection and localisation.',
    slug: 'librispeech-dataset',
    links: [
      { label: 'Paper', href: 'https://github.com/RDisCoding/Full-LibriSpeech-CopyMove-Forgery-Dataset/blob/main/Paper%20ID%20190.pdf' },
      { label: 'Dataset', href: 'https://github.com/RDisCoding/Full-LibriSpeech-CopyMove-Forgery-Dataset' },
    ],
  },
  {
    year: '2025',
    status: 'Peer-reviewed × 2',
    title: 'Speech-forgery detection under clean & degraded audio',
    venue: 'Two co-authored articles · with Dr. Rahul Dixit',
    note: 'How CNN detectors trained on spectrograms hold up as audio quality degrades.',
    slug: 'audio-forgery',
  },
]
