/**
 * Project Aggregator
 * 
 * Loads individual project YAML files from the projects/ directory.
 * Each project owns its own file - safer for contributors.
 * 
 * Files are loaded at build time via Vite's import.meta.glob
 */
import yaml from 'js-yaml'
import type { Project } from '@/lib/projects'

// Import all yaml files from projects/ directory
const projectFiles = import.meta.glob('./projects/*.yaml', { 
  eager: true, 
  query: '?raw',
  import: 'default' 
})

/**
 * Get all projects from individual yaml files
 */
export function getAllProjects(): Project[] {
  const projects: Project[] = []
  
  for (const [path, content] of Object.entries(projectFiles)) {
    try {
      const project = yaml.load(content as string) as Project
      if (project && project.id) {
        projects.push(project)
      }
    } catch (e) {
      console.warn(`Failed to parse project file ${path}:`, e)
    }
  }
  
  // Sort by status priority: live first, then in-progress
  const statusOrder = { 'live': 0, 'in-progress': 1, 'coming-soon': 2 }
  return projects.sort((a, b) => 
    (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99)
  )
}

/**
 * Get a single project by ID
 */
export function getProjectById(id: string): Project | undefined {
  return getAllProjects().find(p => p.id === id)
}
