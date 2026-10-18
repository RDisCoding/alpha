import type { MetadataRoute } from 'next'
import { profile } from '@/content/profile'
import { projects } from '@/content/projects'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${profile.site}/`, changeFrequency: 'monthly', priority: 1 },
    ...projects.map((p) => ({ url: `${profile.site}/work/${p.slug}/`, changeFrequency: 'yearly' as const, priority: 0.7 })),
  ]
}
