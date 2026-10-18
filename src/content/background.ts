import type { Link } from './profile'

export const skills: { group: string; items: string[] }[] = [
  { group: 'AI & LLM systems', items: ['RAG', 'Prompt engineering', 'Vector databases', 'LLMs', 'Fine-tuning', 'LoRA', 'LangChain', 'Agentic systems'] },
  { group: 'Machine learning', items: ['PyTorch', 'scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Hyperparameter tuning'] },
  { group: 'Web development', items: ['Next.js', 'REST APIs', 'MERN', 'PERN', 'MongoDB', 'GraphDB', 'Flask', 'FastAPI', 'Git'] },
  { group: 'Big data & DevOps', items: ['Hadoop', 'Spark', 'PySpark', 'HDFS', 'YARN', 'Hive', 'Docker', 'AWS'] },
  { group: 'Languages', items: ['Python', 'C', 'SQL', 'JavaScript', 'TypeScript'] },
]

export const coursework: { group: string; items: string[] }[] = [
  { group: 'Mathematics & algorithms', items: ['Linear Algebra & Statistics', 'Discrete Mathematics', 'Engineering Mathematics', 'Design & Analysis of Algorithms', 'Advanced Algorithms'] },
  { group: 'AI & machine learning', items: ['Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Reinforcement Learning', 'Generative AI', 'Natural Language Processing'] },
  { group: 'Computing & data', items: ['Data Science', 'Database Management Systems', 'Big Data Analysis & Visualization', 'Cloud Computing', 'Distributed Computing'] },
  { group: 'Computer systems', items: ['Computer Organization', 'Operating Systems', 'Computer Networks', 'Digital Electronics & Logic Design', 'Microprocessors & Interfacing'] },
  { group: 'Specialised', items: ['Nature-Inspired Computing & Optimization', 'Information Security & Cryptography'] },
]

export type Education = {
  degree: string
  school: string
  period: string
  score: string
  scale: string
  detail?: string
  link?: Link
}

export const education: Education[] = [
  {
    degree: 'B.Tech in Artificial Intelligence',
    school: 'Sardar Vallabhbhai National Institute of Technology, Surat',
    period: '2023 — Now',
    score: '8.55',
    scale: 'CGPA / 10',
    link: { label: 'View marksheet', href: 'https://drive.google.com/file/d/1F2Er1m5ApgUmhMaNB4MqEQDmcfljGTQc/view?usp=sharing' },
  },
  {
    degree: 'AI Honours Programme',
    school: 'NIT Surat',
    period: '2024 — Now',
    score: '9.75',
    scale: 'CGPA / 10',
    detail: 'Advanced Algorithms · Generative AI · Advanced Deep Learning · Nature-Inspired Computing',
  },
]

export const leadership: { role: string; org: string; period: string }[] = [
  { role: 'Career Development Cell Coordinator', org: 'Department of AI, SVNIT', period: 'Now' },
  { role: 'Branch Counsellor', org: 'Student Affairs Council, SVNIT', period: '2025 — 26' },
  { role: 'Mentor', org: 'Google Winter of Code · GDGC SVNIT', period: '2025 — 26' },
]

/** "Off the clock" — words with an image get a hover preview. */
export const life: { word: string; image?: string; caption?: string }[] = [
  { word: 'chess', image: '/images/life/chess-stats.webp', caption: '4,700+ games on chess.com — rapid is my territory' },
  { word: 'cricket' },
  { word: 'music' },
  { word: '8-ball pool' },
  { word: 'Call of Duty', image: '/images/life/cod-legendary.webp', caption: 'Legendary rank · 53-kill personal best' },
]
