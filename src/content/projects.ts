import type { Link } from './profile'

/** Generative cover styles — used when a project has no screenshot (see components/GenerativeCover). */
export type CoverArt = 'nodes' | 'ridges' | 'spectro' | 'matrix' | 'orbits' | 'bars' | 'court'

export type Filter = 'AI / ML' | 'Big Data' | 'Product' | 'Web' | 'Hackathon'

/** research = the main body of work · side = hackathons, coursework & personal builds · client = freelance websites */
export type Group = 'research' | 'side' | 'client'

export type Image = { src: string; alt: string; caption?: string }

export type Project = {
  slug: string
  group: Group
  title: string
  /** Shorter title for cards & lists. */
  short?: string
  /** One-liner shown on cards. */
  tagline: string
  year: string
  /** Primary label, e.g. "Research", "SaaS". */
  kind: string
  /** Side-project filters in the Index. */
  filters: Filter[]
  /** Where it came from — course, hackathon, client… */
  context?: string
  /** Research only: where it stands, e.g. "Ongoing", "Accepted · Springer". */
  status?: string
  /** Research only: supervising faculty. */
  advisor?: Link
  stack: string[]
  /** Paragraphs for the case-study page. */
  body: string[]
  highlights?: { value: string; label: string }[]
  links?: Link[]
  /** A real screenshot for the cover; otherwise `art` is drawn. */
  cover?: Image
  art: CoverArt
  /** Short caption printed on generative covers, research-paper style. */
  figure: string
  gallery?: Image[]
}

const RAHUL_DIXIT = { label: 'Dr. Rahul Dixit', href: 'https://scholar.google.com/citations?user=v8yxEN8AAAAJ&hl=en&oi=ao' }
const SUDHAKAR_MISHRA = { label: 'Dr. Sudhakar Mishra', href: 'https://scholar.google.com/citations?hl=en&user=raA5Dc8AAAAJ' }
const DATASET_PAPER = 'https://github.com/RDisCoding/Full-LibriSpeech-CopyMove-Forgery-Dataset/blob/main/Paper%20ID%20190.pdf'

export const projects: Project[] = [
  /* ============================== Research ============================== */
  {
    slug: 'neural-memory',
    group: 'research',
    title: 'Inference-Time Learning via Persistent Neural Memory',
    short: 'Persistent Neural Memory',
    tagline: 'A neural memory that lets a frozen LLM keep learning after deployment.',
    year: '2026',
    kind: 'Research',
    status: 'Benchmarked',
    filters: [],
    stack: ['PyTorch', 'Continual learning', 'Reinforcement learning', 'LLM agents'],
    body: [
      'Large language models stop learning the moment training ends. This project explores a persistent neural memory that sits beside a frozen base LLM and adapts online — so an agent can recover from tasks it previously failed without touching the base model’s weights.',
      'I developed and benchmarked the architecture end-to-end, evaluating continual learning, memory consolidation and stability against a memoryless baseline.',
    ],
    highlights: [
      { value: '45.5%', label: 'Previously failed tasks recovered' },
      { value: '12.5%', label: 'Memoryless baseline' },
      { value: '3.6×', label: 'Improvement over baseline' },
    ],
    links: [{ label: 'GitHub', href: 'https://github.com/RDisCoding/neural-memory' }],
    art: 'nodes',
    figure: 'memory-augmented inference path',
  },
  {
    slug: 'adaptive-data-selection',
    group: 'research',
    title: 'Compute-Efficient LLM Training via Adaptive Data Selection',
    short: 'Adaptive Data Selection',
    tagline: 'Can choosing what to train on beat random sampling at the same GPU budget?',
    year: '2026 — Now',
    kind: 'Research',
    status: 'Ongoing',
    advisor: SUDHAKAR_MISHRA,
    filters: [],
    stack: ['LLM training', 'Data selection', 'MATH-500', 'Controlled experiments'],
    body: [
      'Training LLMs to reason is expensive. This ongoing study evaluates adaptive data selection for compute-efficient LLM reasoning — choosing which examples to train on, instead of sampling at random.',
      'Experiments are controlled and matched on GPU budget, comparing selection overhead, training efficiency and MATH-500 accuracy against random sampling across multiple random seeds.',
    ],
    highlights: [
      { value: 'MATH-500', label: 'Evaluation benchmark' },
      { value: 'Matched', label: 'GPU budget across runs' },
      { value: 'Multi-seed', label: 'Controlled comparisons' },
    ],
    links: [{ label: 'GitHub', href: 'https://github.com/RDisCoding/zion' }],
    art: 'bars',
    figure: 'selected vs. sampled batches',
  },
  {
    slug: 'librispeech-dataset',
    group: 'research',
    title: 'Full LibriSpeech Copy-Move Forgery Dataset',
    short: 'LibriSpeech Forgery Dataset',
    tagline: 'A 57K-sample, speaker-disjoint benchmark for audio forensics — accepted by Springer.',
    year: '2025',
    kind: 'Dataset · Paper',
    status: 'Accepted · Springer',
    filters: [],
    context: 'Accepted in Springer conference proceedings',
    stack: ['Python', 'FFmpeg', 'NumPy', 'Pandas', 'Matplotlib'],
    body: [
      'Existing audio-forensics datasets leak speakers across splits and lack precise labels. This benchmark, built from the LibriSpeech train-clean-100 corpus, comprises 57,078 samples with rigorously enforced speaker-disjoint training, validation and test splits.',
      'Copy-move forgeries are stratified into three difficulty levels — subtle, medium and obvious — with precise temporal annotations of source and target regions, supporting both detection and localisation. Standardised preprocessing, fixed-length clips and high-resolution mel-spectrograms make it a robust foundation for forgery-detection research.',
    ],
    highlights: [
      { value: '57,078', label: 'Audio samples' },
      { value: '3', label: 'Difficulty tiers' },
      { value: '0', label: 'Speaker overlap between splits' },
    ],
    links: [
      { label: 'Paper', href: DATASET_PAPER },
      { label: 'GitHub', href: 'https://github.com/RDisCoding/Full-LibriSpeech-CopyMove-Forgery-Dataset' },
    ],
    art: 'spectro',
    figure: 'copy-move: source → target',
    gallery: [
      { src: '/images/work/librispeech-dataset/speaker-distribution.webp', alt: 'Speaker and gender distribution across splits', caption: 'Speaker-disjoint splits and gender balance' },
      { src: '/images/work/librispeech-dataset/temporal-stats.webp', alt: 'Temporal statistics of forged segments', caption: 'Temporal statistics of forged segments' },
    ],
  },
  {
    slug: 'audio-forgery',
    group: 'research',
    title: 'Audio Forgery Detection with Deep Learning',
    short: 'Audio Forgery Detection',
    tagline: 'Spotting copy-move forgeries in speech from their spectrograms.',
    year: '2025',
    kind: 'Research',
    status: 'Peer-reviewed × 2',
    advisor: RAHUL_DIXIT,
    filters: [],
    stack: ['PyTorch', 'timm', 'CNNs', 'Mel spectrograms', 'NumPy', 'Pandas'],
    body: [
      'An end-to-end framework for realistic audio forgery generation and detection, addressing key gaps in modern audio forensics. Forgeries are created with an amplitude-matched copy-move technique that produces perceptually seamless manipulations under both clean and noisy conditions.',
      'For detection, audio is transformed into Mel spectrograms and analysed with CNN models trained via end-to-end transfer learning. I trained and evaluated three PyTorch CNN architectures, and the work fed into two co-authored peer-reviewed articles on robustness across clean and degraded audio.',
    ],
    highlights: [
      { value: '98.4%', label: 'Accuracy on speaker-disjoint test data' },
      { value: '−12%', label: 'False positives vs. baseline methods' },
      { value: '3', label: 'CNN architectures evaluated' },
    ],
    links: [{ label: 'Paper', href: DATASET_PAPER }],
    art: 'ridges',
    figure: 'waveform ridges, clean vs. forged',
    gallery: [
      { src: '/images/work/audio-forgery/forgery-process.webp', alt: 'Original vs forged waveform, spectrogram and difference', caption: 'Original vs. forged — waveform, spectrogram and difference' },
      { src: '/images/work/audio-forgery/spectrograms.webp', alt: 'Mel spectrograms of original and forged audio', caption: 'Mel spectrograms with the forged region marked' },
    ],
  },

  /* ============================ Side projects ============================ */
  {
    slug: 'cortogen',
    group: 'side',
    title: 'Cortogen',
    tagline: 'Persistent, cross-session memory for your LLM chats — shipped as a Chrome extension.',
    year: '2026',
    kind: 'SaaS',
    filters: ['Product', 'AI / ML', 'Web'],
    stack: ['Chrome Extension', 'FastAPI', 'LangChain', 'FAISS', 'PostgreSQL', 'AWS'],
    body: [
      'Every new LLM conversation starts from zero, so you re-explain context and pay for the same tokens again. Cortogen is a production Chrome extension that gives LLM conversations a persistent memory across sessions.',
      'I built and deployed it end-to-end: a FastAPI backend orchestrating LangChain pipelines, FAISS for vector retrieval and PostgreSQL for persistence, all running on AWS — cutting manual effort and token usage.',
    ],
    highlights: [
      { value: 'Live', label: 'In production at cortogen.com' },
      { value: 'Cross-session', label: 'LLM memory that persists' },
    ],
    links: [{ label: 'Website', href: 'https://cortogen.com' }],
    art: 'orbits',
    figure: 'context retained across sessions',
  },
  {
    slug: 'fraud-detection',
    group: 'side',
    title: 'Financial Fraud Detection on a Distributed Cluster',
    short: 'Distributed Fraud Detection',
    tagline: 'An LSTM over 6.3M+ transactions, trained on a Hadoop + Spark cluster.',
    year: '2026',
    kind: 'Big Data · ML',
    filters: ['Big Data', 'AI / ML'],
    context: 'Big Data Analytics course project',
    stack: ['Hadoop', 'HDFS', 'Spark', 'PySpark', 'Hive', 'LSTM'],
    body: [
      'A distributed fraud-detection pipeline over 6.3M+ PaySim mobile-money transactions, built on a Hadoop cluster with Spark, Hive and PySpark.',
      'Transactions are grouped into per-account sliding windows and fed to a 2-layer LSTM, so the model learns behavioural sequences instead of judging each transaction in isolation.',
    ],
    highlights: [
      { value: '0.9631', label: 'F1-score' },
      { value: '0.9996', label: 'ROC-AUC' },
      { value: '6.3M+', label: 'Transactions processed' },
    ],
    links: [{ label: 'GitHub', href: 'https://github.com/RDisCoding/Financial-Fraud-Detection-using-Hadoop-Cluster-and-LSTM' }],
    art: 'matrix',
    figure: 'anomalous accounts, flagged',
  },
  {
    slug: 'bindis-cupcakery',
    group: 'side',
    title: 'Bindi’s Cupcakery',
    tagline: 'A cloud-kitchen bakery platform that won Google Winter of Code.',
    year: '2025',
    kind: 'Full-stack',
    filters: ['Web', 'Hackathon', 'Product'],
    context: 'Google Winter of Code — 1st place',
    stack: ['PostgreSQL', 'Express', 'React', 'Node.js', 'JWT'],
    body: [
      'A full-stack e-commerce platform built for Google Winter of Code, where it took 1st place. It simulates a complete cloud-kitchen experience for cupcakes, cakes and custom dessert hampers — browse, customise, manage a cart and check out securely with real-time order tracking.',
      'The React frontend sits on a Node.js, Express and PostgreSQL backend with JWT authentication for user and admin roles. An admin dashboard handles inventory and orders, with integrated payment gateways and automated WhatsApp notifications.',
    ],
    highlights: [
      { value: '1st', label: 'Google Winter of Code' },
      { value: 'PERN', label: 'Full-stack, user + admin roles' },
    ],
    links: [
      { label: 'Live site', href: 'https://bindis-cupcakery.vercel.app/' },
      { label: 'GitHub', href: 'https://github.com/Smitvd22/Bindis-Cupcakery' },
    ],
    cover: { src: '/images/work/bindis-cupcakery/landing.webp', alt: 'Bindi’s Cupcakery landing page' },
    art: 'orbits',
    figure: 'storefront',
    gallery: [
      { src: '/images/work/bindis-cupcakery/landing.webp', alt: 'Landing page', caption: 'Landing' },
      { src: '/images/work/bindis-cupcakery/products.webp', alt: 'Products page', caption: 'Product catalogue' },
      { src: '/images/work/bindis-cupcakery/hampers.webp', alt: 'Hampers page', caption: 'Custom dessert hampers' },
    ],
  },
  {
    slug: 'quickcourt',
    group: 'side',
    title: 'QuickCourt',
    tagline: 'Court booking & management, built by a team in 24 hours.',
    year: '2025',
    kind: 'Hackathon',
    filters: ['Hackathon', 'Web'],
    context: 'Odoo Hackathon — Finalist',
    stack: ['TypeScript', 'React', 'Node.js', 'Express', 'PostgreSQL', 'Drizzle', 'Tailwind CSS', 'Vite', 'Stripe', 'AWS'],
    body: [
      'Built with a team during the 24-hour Odoo Hackathon: a court booking platform with availability scheduling, authentication, booking confirmations, payment processing and role-based access. The project was selected as a finalist.',
      'It runs on a TypeScript stack — React and Tailwind on Vite up front, Node.js and Express on PostgreSQL with Drizzle behind — with Stripe handling payments and AWS for hosting.',
    ],
    highlights: [
      { value: 'Finalist', label: 'Odoo Hackathon' },
      { value: '24h', label: 'Idea to working platform' },
    ],
    links: [
      { label: 'Demo video', href: 'https://drive.google.com/file/d/17zET2A84vQ-wy9axivD497jfWpTMjQi9/view?usp=drive_link' },
      { label: 'GitHub', href: 'https://github.com/Aaditya-T/QuickCourt' },
    ],
    art: 'court',
    figure: 'slots, courts & bookings',
  },
  {
    slug: 'civicassist',
    group: 'side',
    title: 'CivicAssist',
    tagline: 'Find the government schemes you’re eligible for — even offline.',
    year: '2026',
    kind: 'Hackathon',
    filters: ['Hackathon', 'Web', 'AI / ML'],
    context: 'DotSlash 9.0',
    stack: ['Next.js', 'Express', 'Supabase', 'Gemini'],
    body: [
      'An offline-first platform for discovering government schemes, built at DotSlash 9.0. Citizens get eligibility assessment and personalised recommendations instead of wading through portals.',
      'Gemini powers plain-language policy simplification, on top of a Next.js, Express and Supabase stack.',
    ],
    highlights: [
      { value: 'Offline-first', label: 'Works with patchy connectivity' },
      { value: 'Gemini', label: 'AI policy simplification' },
    ],
    links: [{ label: 'GitHub', href: 'https://github.com/DotSlash-9-0/Neutrons' }],
    art: 'matrix',
    figure: 'eligibility, mapped',
  },
  {
    slug: 'kaggle-datathon',
    group: 'side',
    title: 'Kaggle Datathon',
    tagline: 'Rank 11 among hundreds in a three-day team datathon.',
    year: '2025',
    kind: 'Competition',
    filters: ['Hackathon', 'AI / ML'],
    context: 'Google Developer Groups on Campus, SVNIT',
    stack: ['Python', 'Jupyter', 'NumPy', 'Pandas', 'LSTM'],
    body: [
      'A team machine-learning solution for the Kaggle Datathon run by Google Developer Groups on Campus, SVNIT, from October 31 to November 2, 2025.',
      'We worked in Python and Jupyter notebooks — NumPy and Pandas for the data, LSTM-based models on top — and finished 11th among hundreds of participants.',
    ],
    highlights: [{ value: '#11', label: 'Final leaderboard rank' }],
    links: [
      { label: 'GitHub', href: 'https://github.com/RDisCoding/kaggle-datathon' },
      { label: 'Certificate', href: 'https://drive.google.com/file/d/1Jc3NT6Bj1n4Sxa3u2X4g1NEmLQp0lgbl/view?usp=sharing' },
    ],
    art: 'bars',
    figure: 'leaderboard climb',
    gallery: [{ src: '/images/work/kaggle-datathon/certificate.webp', alt: 'Kaggle Datathon certificate', caption: 'Certificate of achievement' }],
  },
  {
    slug: 'bank-profitability',
    group: 'side',
    title: 'Bank Profitability Prediction on a Multi-Node Cluster',
    short: 'Bank Profitability Prediction',
    tagline: 'A Hadoop cluster built from scratch to model 650K+ bank records.',
    year: '2025',
    kind: 'Big Data · ML',
    filters: ['Big Data', 'AI / ML'],
    stack: ['Hadoop', 'HDFS', 'YARN', 'PySpark', 'Hive', 'MLlib'],
    body: [
      'An end-to-end big-data and machine-learning pipeline that predicts a bank’s future profitability from large-scale financial-ratio data. I built a multi-node Hadoop cluster from scratch to process a 4.5 GB dataset — 650,000+ records across 796 financial metrics — integrating HDFS, YARN, Spark and Hive with an external MySQL metastore.',
      'Cleaning and feature engineering ran in PySpark, including dimensionality reduction, a forward-looking target variable and class-weighted learning for severe imbalance. A reproducible MLlib pipeline with weighted logistic regression reached an AUC of 0.949.',
    ],
    highlights: [
      { value: '0.949', label: 'AUC' },
      { value: '4.5 GB', label: '650K+ records, 796 metrics' },
    ],
    links: [{ label: 'GitHub', href: 'https://github.com/RDisCoding/Big-Data-Analytics-Project-using-Hadoop-Spark' }],
    art: 'ridges',
    figure: 'financial ratios over time',
  },
  {
    slug: 'blue-carbon-registry',
    group: 'side',
    title: 'Samudra Sathi — Blue Carbon Registry',
    short: 'Blue Carbon Registry',
    tagline: 'A concept for verifying coastal restoration and turning it into on-chain carbon credits.',
    year: 'Concept',
    kind: 'Blockchain',
    filters: [],
    context: 'Architecture only — never built',
    stack: ['Polygon', 'ERC-1155', 'Chainlink oracles', 'IPFS', 'Mobile app', 'Chatbots'],
    body: [
      'An architecture for a blockchain-backed blue-carbon registry with built-in MRV — monitoring, reporting and verification. NGO field agents, community members and drone or IoT sensors feed restoration data through a mobile app, Samudra Sathi, while projects are onboarded and approved by an NCCR admin.',
      'Approved auditors, backed by satellite and drone analysis, verify submissions through a credit-approval workflow. Verified data is pinned to IPFS and relayed by Chainlink oracles to smart contracts on Polygon, which mint blue carbon tokens (ERC-1155), set aside insurance tokens in a buffer pool and retire credits on loss.',
      'An access layer brings it to people: a marketplace and community wallets for listing and buying credits, chatbots for communities and buyers, and dashboards for admins and auditors. It stayed on the whiteboard — we mapped the architecture but never got the chance to build it.',
    ],
    highlights: [
      { value: '5', label: 'Layers — collection, verification, trust, chain, marketplace' },
      { value: 'ERC-1155', label: 'Tokenised blue carbon credits' },
    ],
    art: 'ridges',
    figure: 'tides of verified carbon',
    gallery: [{ src: '/images/work/blue-carbon-registry/architecture.webp', alt: 'Blue carbon registry system architecture', caption: 'System architecture — collection, verification, trust, Polygon & marketplace layers' }],
  },

  /* ============================= Client work ============================= */
  {
    slug: 'maheshwari-brothers',
    group: 'client',
    title: 'Maheshwari Brothers',
    tagline: 'A storefront for an agricultural commodities trader.',
    year: '2026',
    kind: 'Client',
    filters: ['Web'],
    context: 'Freelance client project',
    stack: ['Next.js', 'Sanity CMS', 'Tailwind CSS'],
    body: [
      'A full website for a client trading premium grains and seeds, showcasing their full product range and making it easy for buyers to request quotes — part of my freelance work, and it helped the business scale.',
      'Content is managed through Sanity CMS so the client can update products without touching code.',
    ],
    links: [
      { label: 'Live site', href: 'https://delta-sigma-two.vercel.app/' },
      { label: 'GitHub', href: 'https://github.com/RDisCoding/Delta' },
    ],
    cover: { src: '/images/work/maheshwari-brothers/01.webp', alt: 'Maheshwari Brothers homepage' },
    art: 'matrix',
    figure: 'storefront',
    gallery: [
      { src: '/images/work/maheshwari-brothers/01.webp', alt: 'Homepage hero', caption: 'Homepage' },
      { src: '/images/work/maheshwari-brothers/02.webp', alt: 'Why choose us section', caption: 'Trust & numbers' },
      { src: '/images/work/maheshwari-brothers/03.webp', alt: 'Inquiry form', caption: 'Inquiry flow' },
      { src: '/images/work/maheshwari-brothers/04.webp', alt: 'Call to action and footer', caption: 'Call to action' },
    ],
  },
  {
    slug: 'matrugaya-tirth',
    group: 'client',
    title: 'Matrugaya Tirth',
    tagline: 'The official website for a pilgrimage site — rituals and travel, made clear.',
    year: '2025',
    kind: 'Client',
    filters: ['Web'],
    context: 'Freelance client project',
    stack: ['Next.js', 'Sanity CMS', 'Google Translate API', 'Tailwind CSS'],
    body: [
      'The official website for Matrugaya Tirth, a religious and pilgrimage destination, giving devotees comprehensive information about rituals, spiritual services and travel.',
      'I structured the content so complex religious procedures read clearly for every age group, and worked closely with stakeholders on requirements and cultural accuracy. Google Translate integration makes it multilingual.',
    ],
    links: [
      { label: 'Live site', href: 'https://www.matrugayatirth.com/' },
      { label: 'GitHub', href: 'https://github.com/RDisCoding/Gamma' },
    ],
    art: 'orbits',
    figure: 'mandala of services',
  },
]

export const groups: Record<Group, { label: string; prefix: string; href: string }> = {
  research: { label: 'Research', prefix: 'R', href: '/#research' },
  side: { label: 'Side projects', prefix: 'S', href: '/#projects' },
  client: { label: 'Client work', prefix: 'C', href: '/#clients' },
}

export const inGroup = (group: Group) => projects.filter((p) => p.group === group)

export const researchProjects = inGroup('research')
export const sideProjects = inGroup('side')
export const clientProjects = inGroup('client')

/** "R01", "S04", "C02" — the project's figure number within its group. */
export function figLabel(p: Project) {
  return `${groups[p.group].prefix}${String(inGroup(p.group).indexOf(p) + 1).padStart(2, '0')}`
}

export const filters: Filter[] = ['AI / ML', 'Big Data', 'Product', 'Web', 'Hackathon']

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug)
}
