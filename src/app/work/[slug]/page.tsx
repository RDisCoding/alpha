import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProject, inGroup, projects } from '@/content/projects'
import ProjectView from '@/sections/ProjectView'

type Params = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const p = getProject(slug)
  if (!p) return {}
  return {
    title: p.short ?? p.title,
    description: p.tagline,
    alternates: { canonical: `/work/${p.slug}/` },
    openGraph: { title: p.title, description: p.tagline, url: `/work/${p.slug}/`, images: [p.cover?.src ?? '/og.jpg'] },
  }
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()
  // "Next project" stays within the same group (research → research, etc.).
  const siblings = inGroup(project.group)
  const next = siblings[(siblings.indexOf(project) + 1) % siblings.length]
  return <ProjectView project={project} next={next} />
}
