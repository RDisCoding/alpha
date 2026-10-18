import { figLabel, type Project } from '@/content/projects'
import GenerativeCover from './GenerativeCover'
import styles from './ProjectCover.module.css'

type Props = {
  project: Project
  uid?: string
  className?: string
  /** Oversizes the media so a parent can translate it for parallax. */
  parallax?: boolean
  eager?: boolean
}

/** Screenshot if the project has one, otherwise its generative "figure". */
export default function ProjectCover({ project, uid, className = '', parallax = false, eager = false }: Props) {
  return (
    <div className={`${styles.cover} ${className}`}>
      <div className={`${styles.media} ${parallax ? styles.parallax : ''}`} data-parallax={parallax || undefined}>
        {project.cover ? (
          <img src={project.cover.src} alt={project.cover.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
        ) : (
          <GenerativeCover art={project.art} seed={project.slug} uid={uid} />
        )}
      </div>
      {!project.cover && (
        <span className={`${styles.fig} mono`}>
          Fig. {figLabel(project)} — {project.figure}
        </span>
      )}
    </div>
  )
}
