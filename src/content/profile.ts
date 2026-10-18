export type Link = { label: string; href: string }

export const profile = {
  name: 'Rudray Dave',
  firstName: 'Rudray',
  lastName: 'Dave',
  role: 'AI Engineer & Researcher',
  location: 'Surat, India',
  timezone: 'Asia/Kolkata',
  tzLabel: 'IST',
  email: 'rudraydave@gmail.com',
  status: 'Open to opportunities',
  now: { role: 'R&D Intern', org: 'Atomberg Technologies' },
  resume: '/Rudray_Dave_CV.pdf',
  portrait: '/images/portrait.webp',
  site: 'https://rudraydave.vercel.app',
  description:
    'Rudray Dave is an AI engineer and researcher at SVNIT, Surat, building LLM systems, audio-forensics models and production software.',
  socials: [
    { label: 'GitHub', handle: '@RDisCoding', href: 'https://github.com/RDisCoding' },
    { label: 'LinkedIn', handle: 'in/rudray-dave', href: 'https://www.linkedin.com/in/rudray-dave-95686627a' },
    { label: 'LeetCode', handle: '@CodeConqueror', href: 'https://leetcode.com/u/CodeConqueror' },
  ],
}

/**
 * The big scroll-revealed paragraph in the About section.
 * `{ portrait: true }` drops an inline photo pill into the sentence; `em` renders in italic serif.
 */
export type ManifestoPart = { text: string; em?: boolean } | { portrait: true }

export const about = {
  manifesto: [
    { text: "Hi, I'm Rudray" },
    { portrait: true },
    { text: '— an AI engineer and researcher at SVNIT, Surat. I train models, write papers and' },
    { text: 'ship them', em: true },
    { text: 'as products people actually use: neural memory for LLMs, audio forensics, fraud detection at scale and SaaS that lives in your browser.' },
  ] as ManifestoPart[],
  bio: [
    'I’m a B.Tech Artificial Intelligence student at SVNIT and an Honours scholar in AI. I work across the stack — training and fine-tuning models, building data pipelines on distributed clusters, and deploying full-scale applications.',
    'I care about execution, scalability and real-world impact. I learn fast, build fast and iterate faster. The goal: engineer intelligent systems that solve meaningful problems at global scale.',
  ],
  facts: [
    { label: 'Based in', value: 'Surat, India' },
    { label: 'Studying', value: 'B.Tech AI · SVNIT' },
    { label: 'Currently', value: 'R&D Intern · Atomberg' },
    { label: 'Into', value: 'LLM systems · Audio forensics · Continual learning' },
  ],
}
