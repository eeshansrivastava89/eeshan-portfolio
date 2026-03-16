import yaml from 'js-yaml'
import fs from 'node:fs'
import path from 'node:path'

export interface NotebookMetadata {
  id: string
  title: string
  projectId: string
  link: string
  yamlPath: string
  status?: string
  decision?: string
  methods?: string[]
  tags?: string[]
  generatedAt?: Date
}

/**
 * Get all notebooks for a specific project
 * Reads YAML files from public/analysis/{projectId}/
 */
export function getNotebooksForProject(projectId: string): NotebookMetadata[] {
  const notebooks: NotebookMetadata[] = []

  const projectDir = path.join(process.cwd(), 'public', 'analysis', projectId)

  if (!fs.existsSync(projectDir)) {
    return notebooks
  }

  const files = fs.readdirSync(projectDir).filter(f => f.endsWith('.yaml'))

  for (const file of files) {
    try {
      const filePath = path.join(projectDir, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      const data = yaml.load(content) as any

      const notebookId = file.replace('.yaml', '')
      const link = `/projects/${projectId}/analysis/${notebookId}/`

      notebooks.push({
        id: notebookId,
        title: data.title || notebookId,
        projectId: projectId,
        link,
        yamlPath: filePath,
        status: data.status,
        decision: data.decision,
        methods: data.methods || [],
        tags: data.tags || [],
        generatedAt: data.generated_at ? new Date(data.generated_at) : undefined,
      })
    } catch (e) {
      console.warn(`Failed to parse notebook YAML ${file}:`, e)
    }
  }

  notebooks.sort((a, b) => {
    if (!a.generatedAt) return 1
    if (!b.generatedAt) return -1
    return b.generatedAt.getTime() - a.generatedAt.getTime()
  })

  return notebooks
}
