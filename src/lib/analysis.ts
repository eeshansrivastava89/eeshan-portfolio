import yaml from 'js-yaml'
import { getSubstackPosts, type SubstackPost } from '@/lib/substack'

/**
 * Unified content type for /analysis page
 * Combines notebooks and Substack posts
 */
export interface AnalysisContent {
  type: 'notebook' | 'post'
  title: string
  projectId?: string
  date: Date | string // Can be Date or ISO string after serialization
  link: string
  description?: string
  methods?: string[]
  tags?: string[]
  status?: string // notebook only: "significant" | "not_significant" | "inconclusive" | "error"
}

interface NotebookYAML {
  title: string
  project_id?: string
  status?: string
  decision?: string
  methods?: string[]
  tags?: string[]
  generated_at?: string
}

/**
 * Load all notebook YAML summaries from public/analysis/
 */
function getAllNotebooks(): AnalysisContent[] {
  const notebooks: AnalysisContent[] = []

  // Import all YAML files from public/analysis/ using Vite glob
  const notebookFiles = import.meta.glob('/public/analysis/*/*.yaml', {
    eager: true,
    query: '?raw',
    import: 'default',
  })

  for (const [path, content] of Object.entries(notebookFiles)) {
    try {
      const data = yaml.load(content as string) as NotebookYAML

      // Extract project_id and notebook_id from path
      // Path format: /public/analysis/{project_id}/{notebook_id}.yaml
      const pathParts = path.split('/')
      const projectId = pathParts[pathParts.length - 2]
      const notebookId = pathParts[pathParts.length - 1].replace('.yaml', '')

      // Build link to notebook detail page
      const link = `/projects/${projectId}/analysis/${notebookId}/`

      const date = data.generated_at ? new Date(data.generated_at) : new Date()

      notebooks.push({
        type: 'notebook',
        title: data.title,
        projectId: data.project_id || projectId,
        date: date,
        link,
        description: data.decision,
        methods: data.methods || [],
        tags: data.tags || [],
        status: data.status,
      })
    } catch (e) {
      console.warn(`Failed to parse notebook YAML ${path}:`, e)
    }
  }

  return notebooks
}

/**
 * Convert Substack posts to unified format
 */
function substackToAnalysisContent(posts: SubstackPost[]): AnalysisContent[] {
  return posts.map(post => ({
    type: 'post' as const,
    title: post.title,
    projectId: post.projectId,
    date: post.pubDate,
    link: post.link,
    description: post.description,
    methods: [],
    tags: [],
  }))
}

/**
 * Get all analysis content (notebooks + posts) unified
 */
export async function getAllAnalysisContent(
  substackRssUrl: string,
  substackMappingsYaml: string
): Promise<AnalysisContent[]> {
  // Load notebooks (synchronous, from public/)
  const notebooks = getAllNotebooks()

  // Load Substack posts (async, from RSS)
  const substackPosts = await getSubstackPosts(substackRssUrl, substackMappingsYaml)
  const posts = substackToAnalysisContent(substackPosts)

  // Combine and sort by date (newest first)
  const allContent = [...notebooks, ...posts]
  allContent.sort((a, b) => b.date.getTime() - a.date.getTime())

  return allContent
}

/**
 * Get unique methods across all content (for filter options)
 */
export function getUniqueMethods(content: AnalysisContent[]): string[] {
  const methodsSet = new Set<string>()
  content.forEach(item => {
    item.methods?.forEach(method => methodsSet.add(method))
  })
  return Array.from(methodsSet).sort()
}

/**
 * Get unique project IDs (for filter options)
 */
export function getUniqueProjects(content: AnalysisContent[]): string[] {
  const projectsSet = new Set<string>()
  content.forEach(item => {
    if (item.projectId) projectsSet.add(item.projectId)
  })
  return Array.from(projectsSet).sort()
}

/**
 * Get unique tags (for filter options)
 */
export function getUniqueTags(content: AnalysisContent[]): string[] {
  const tagsSet = new Set<string>()
  content.forEach(item => {
    item.tags?.forEach(tag => tagsSet.add(tag))
  })
  return Array.from(tagsSet).sort()
}
