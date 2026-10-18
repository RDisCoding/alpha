import type { Link } from './profile'

export type Recognition = {
  /** The big mark on the card — a placing, rank or verb. */
  mark: string
  title: string
  org: string
  date: string
  note: string
  /** Links to a case study on this site. */
  slug?: string
  links?: Link[]
}

/** Hackathons, competitions & achievements — newest wins welcome. */
export const recognition: Recognition[] = [
  {
    mark: '1st',
    title: 'Google Winter of Code',
    org: 'GDG on Campus · SVNIT',
    date: 'Feb 2025',
    note: 'Won with Bindi’s Cupcakery — a PERN cloud-kitchen platform with secure auth, live inventory and order management.',
    slug: 'bindis-cupcakery',
  },
  {
    mark: 'Finalist',
    title: 'Odoo Hackathon',
    org: '24-hour hackathon',
    date: 'Aug 2025',
    note: 'QuickCourt — court booking with scheduling, payments and role-based access, built by a team in 24 hours.',
    slug: 'quickcourt',
  },
  {
    mark: '#11',
    title: 'Kaggle Datathon',
    org: 'GDG on Campus · SVNIT',
    date: 'Nov 2025',
    note: 'Placed 11th among hundreds of participants in a three-day team datathon.',
    slug: 'kaggle-datathon',
  },
  {
    mark: 'Published',
    title: 'Springer Proceedings',
    org: 'Conference paper',
    date: '2025',
    note: 'The Full LibriSpeech Copy-Move Forgery Dataset — 57K samples — accepted in Springer conference proceedings.',
    slug: 'librispeech-dataset',
  },
  {
    mark: 'Shipped',
    title: 'DotSlash 9.0',
    org: 'Hackathon',
    date: 'Mar 2026',
    note: 'CivicAssist — offline-first government-scheme discovery with eligibility checks and Gemini-powered policy simplification.',
    slug: 'civicassist',
  },
]
