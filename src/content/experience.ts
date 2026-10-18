import type { Link } from './profile'

export type Experience = {
  role: string
  org: string
  period: string
  current?: boolean
  summary: string
  tags: string[]
  links?: Link[]
}

export const experience: Experience[] = [
  {
    role: 'R&D Intern',
    org: 'Atomberg Technologies',
    period: 'Aug 2026 — Now',
    current: true,
    summary:
      'Conducting research and development on AI-driven automation and intelligent workflows to improve operational efficiency and drive business growth.',
    tags: ['AI automation', 'Intelligent workflows', 'R&D'],
  },
  {
    role: 'AI Workflow Automation Intern',
    org: 'L&T Technology Services',
    period: 'May — Jul 2026',
    summary:
      'Built AI-driven workflows that extract structured knowledge from P&ID engineering diagrams and automate the placement of Leviton electrical components — streamlining engineering documentation review and improving workflow efficiency.',
    tags: ['Document AI', 'Engineering diagrams', 'Automation'],
    links: [{ label: 'Internship certificate', href: 'https://drive.google.com/file/d/1mXTFc6544Nro__tNlyoSmruGL3R5V6TR/view?usp=sharing' }],
  },
  {
    role: 'Project Intern — Applied ML & Wearables',
    org: 'Gujarat Police',
    period: 'Jan — Apr 2026',
    summary:
      'Developed machine-learning pipelines that infer cognitive and operational states — stress, focus and activity — from wearable physiological signals, taming noisy real-world sensor data through feature engineering and signal processing.',
    tags: ['Signal processing', 'Wearable sensors', 'ML pipelines'],
  },
  {
    role: 'AI Research Intern',
    org: 'Applied AI Research · Dr. Rahul Dixit',
    period: 'Oct — Dec 2025',
    summary:
      'Trained and evaluated three PyTorch CNN architectures on spectrogram representations for speech-forgery detection, and co-authored two peer-reviewed articles investigating model robustness across clean and degraded audio.',
    tags: ['PyTorch', 'Audio forensics', 'CNNs'],
    links: [
      { label: 'Letter of recommendation', href: 'https://drive.google.com/file/d/1L7y91wny2-ap7l1Xxl38NQFCpoi5tpyC/view?usp=sharing' },
      { label: 'Dr. Rahul Dixit', href: 'https://scholar.google.com/citations?user=v8yxEN8AAAAJ&hl=en&oi=ao' },
    ],
  },
]
