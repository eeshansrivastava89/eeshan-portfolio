import { useState, useMemo } from 'react'
import type { Learning, ProjectSlug } from '../../../shared/src/lib/learnings'
import {
  TYPE_CONFIG,
  PROJECT_NAMES,
  formatLearningDate,
  isExternalUrl
} from '../../../shared/src/lib/learnings'

interface Props {
  learnings: Learning[]
  pageSize?: number
}

export default function LearningsTimeline({ learnings, pageSize = 10 }: Props) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProject, setSelectedProject] = useState<ProjectSlug | 'all'>('all')

  // Get unique projects from learnings for filter pills
  const availableProjects = useMemo(() => {
    const projects = new Set(learnings.map(l => l.project))
    return Array.from(projects).sort() as ProjectSlug[]
  }, [learnings])

  // Filter learnings by selected project
  const filteredLearnings = useMemo(() => {
    if (selectedProject === 'all') return learnings
    return learnings.filter(l => l.project === selectedProject)
  }, [learnings, selectedProject])

  // Reset to page 1 when filter changes
  const handleFilterChange = (project: ProjectSlug | 'all') => {
    setSelectedProject(project)
    setCurrentPage(1)
  }

  // Pagination
  const totalPages = Math.ceil(filteredLearnings.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const displayedLearnings = filteredLearnings.slice(startIndex, startIndex + pageSize)

  if (learnings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No learnings yet.{' '}
          <a
            href="https://github.com/eeshansrivastava89/soma-portfolio"
            target="_blank"
            rel="noreferrer"
            className="text-orange-500 hover:underline"
          >
            Check back soon
          </a>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Pills */}
      {availableProjects.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange('all')}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              selectedProject === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All ({learnings.length})
          </button>
          {availableProjects.map(project => {
            const count = learnings.filter(l => l.project === project).length
            return (
              <button
                key={project}
                onClick={() => handleFilterChange(project)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  selectedProject === project
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {PROJECT_NAMES[project]} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Timeline */}
      <div className="relative space-y-0">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-3 bottom-3 w-px bg-border" aria-hidden="true" />

        {displayedLearnings.map((learning, index) => (
          <TimelineItem key={`${learning.url}-${index}`} learning={learning} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-border bg-primary-foreground px-3 py-1.5 text-sm font-medium text-foreground transition hover:border-foreground/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <span className="text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-border bg-primary-foreground px-3 py-1.5 text-sm font-medium text-foreground transition hover:border-foreground/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

function TimelineItem({ learning }: { learning: Learning }) {
  const typeConfig = TYPE_CONFIG[learning.type]
  const isExternal = isExternalUrl(learning.url)

  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      {/* Timeline dot */}
      <div className="relative z-10 mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center">
        <div className="h-2.5 w-2.5 rounded-full bg-orange-500 ring-4 ring-background" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        {/* Header row: type badge + date */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${typeConfig.color}`}>
            <span>{typeConfig.emoji}</span>
            <span>{typeConfig.label}</span>
          </span>
          <span className="text-xs text-muted-foreground">
            {formatLearningDate(learning.date)}
          </span>
          {learning.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
              ⭐ Featured
            </span>
          )}
        </div>

        {/* Title */}
        <a
          href={learning.url}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noreferrer' : undefined}
          className="group block"
        >
          <h3 className="text-base font-semibold text-foreground transition group-hover:text-orange-500">
            {learning.title}
            {isExternal && (
              <span className="ml-1 inline-block text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                ↗
              </span>
            )}
          </h3>
        </a>

        {/* Excerpt */}
        {learning.excerpt && (
          <p className="text-sm text-muted-foreground">{learning.excerpt}</p>
        )}

        {/* Tags */}
        {learning.tags && learning.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {learning.tags.map(tag => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Project badge */}
        {learning.project !== 'general' && (
          <div className="pt-1">
            <span className="text-xs text-muted-foreground">
              Project: <span className="font-medium text-foreground">{PROJECT_NAMES[learning.project]}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
