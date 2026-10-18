import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import 'lenis/dist/lenis.css'
import './globals.css'
import { profile } from '@/content/profile'
import SmoothScroll from '@/components/SmoothScroll'
import Preloader from '@/components/Preloader'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import PageTransition from '@/components/PageTransition'
import Cursor from '@/components/Cursor'
import SoundBridge from '@/components/SoundBridge'

const sans = Geist({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' })

const title = `${profile.name} — ${profile.role}`

export const metadata: Metadata = {
  metadataBase: new URL(profile.site),
  title: { default: title, template: `%s — ${profile.name}` },
  description: profile.description,
  keywords: ['Rudray Dave', 'AI engineer', 'machine learning', 'LLM', 'audio forensics', 'SVNIT', 'portfolio'],
  authors: [{ name: profile.name, url: profile.site }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: profile.name,
    title,
    description: profile.description,
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: profile.name }],
  },
  twitter: { card: 'summary_large_image', title, description: profile.description, images: ['/og.jpg'] },
}

export const viewport: Viewport = { themeColor: '#08070b', colorScheme: 'dark' }

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.name,
  url: profile.site,
  email: `mailto:${profile.email}`,
  jobTitle: profile.role,
  image: `${profile.site}${profile.portrait}`,
  address: { '@type': 'PostalAddress', addressLocality: 'Surat', addressCountry: 'IN' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'Sardar Vallabhbhai National Institute of Technology, Surat' },
  sameAs: profile.socials.map((s) => s.href),
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable} is-loading`} suppressHydrationWarning>
      <body>
        <noscript>
          <style>{'.preloader{display:none!important}html.is-loading{overflow:auto!important}'}</style>
        </noscript>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SmoothScroll />
        <SoundBridge />
        <Preloader />
        <Nav />
        {children}
        <Footer />
        <PageTransition />
        <Cursor />
        <div className="grain" aria-hidden="true" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Analytics />
      </body>
    </html>
  )
}
