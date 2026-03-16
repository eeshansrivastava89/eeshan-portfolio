import yaml from 'js-yaml'

/**
 * Substack RSS Integration
 *
 * Fetches posts from Substack RSS feed and joins with manual YAML mapping
 * to associate posts with project IDs.
 */

export interface SubstackPost {
  title: string
  link: string
  pubDate: Date
  description: string
  projectId?: string // From YAML mapping
}

interface SubstackMapping {
  url: string
  project_id: string
}

interface SubstackMappings {
  posts?: SubstackMapping[]
}

/**
 * Fetch and parse Substack RSS feed
 */
async function fetchSubstackRSS(feedUrl: string): Promise<SubstackPost[]> {
  try {
    const response = await fetch(feedUrl)
    if (!response.ok) {
      console.warn(`Failed to fetch Substack RSS: ${response.status}`)
      return []
    }

    const xmlText = await response.text()

    // Parse RSS XML (simple extraction, no heavy XML parser needed)
    const items: SubstackPost[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemContent = match[1]

      const title = extractTag(itemContent, 'title')
      const link = extractTag(itemContent, 'link')
      const pubDateStr = extractTag(itemContent, 'pubDate')
      const description = extractTag(itemContent, 'description')

      if (title && link && pubDateStr) {
        items.push({
          title: decodeHTML(title),
          link,
          pubDate: new Date(pubDateStr),
          description: decodeHTML(stripHTML(description || '')),
        })
      }
    }

    return items
  } catch (error) {
    console.error('Error fetching Substack RSS:', error)
    return []
  }
}

/**
 * Extract content between XML tags and handle CDATA sections
 */
function extractTag(content: string, tag: string): string {
  const regex = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const match = content.match(regex)
  if (!match) return ''

  let extracted = match[1].trim()

  // Handle CDATA sections: <![CDATA[content]]>
  const cdataRegex = /<!\[CDATA\[([\s\S]*?)\]\]>/
  const cdataMatch = extracted.match(cdataRegex)
  if (cdataMatch) {
    extracted = cdataMatch[1]
  }

  return extracted
}

/**
 * Strip HTML tags from string
 */
function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

/**
 * Decode HTML entities
 */
function decodeHTML(html: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
  }

  return html.replace(/&[^;]+;/g, (entity) => {
    if (entities[entity]) return entities[entity]
    // Handle numeric entities like &#8212; and &#x2014;
    const numMatch = entity.match(/^&#(\d+);$/)
    if (numMatch) return String.fromCodePoint(Number(numMatch[1]))
    const hexMatch = entity.match(/^&#x([0-9a-fA-F]+);$/)
    if (hexMatch) return String.fromCodePoint(parseInt(hexMatch[1], 16))
    return entity
  })
}

/**
 * Load YAML mappings from src/data/substack-posts.yaml
 */
function loadMappings(yamlContent: string): Map<string, string> {
  const mappings = new Map<string, string>()

  try {
    const data = yaml.load(yamlContent) as SubstackMappings
    if (data?.posts) {
      for (const mapping of data.posts) {
        mappings.set(mapping.url, mapping.project_id)
      }
    }
  } catch (error) {
    console.warn('Failed to parse substack-posts.yaml:', error)
  }

  return mappings
}

/**
 * Get all Substack posts with project_id mapping applied
 *
 * @param feedUrl - Substack RSS feed URL
 * @param yamlContent - Raw YAML content from src/data/substack-posts.yaml
 */
export async function getSubstackPosts(
  feedUrl: string,
  yamlContent: string
): Promise<SubstackPost[]> {
  const posts = await fetchSubstackRSS(feedUrl)
  const mappings = loadMappings(yamlContent)

  // Apply project_id mapping
  return posts.map(post => ({
    ...post,
    projectId: mappings.get(post.link),
  }))
}

/**
 * Get posts filtered by project ID
 */
export function getPostsByProject(
  posts: SubstackPost[],
  projectId: string
): SubstackPost[] {
  return posts.filter(post => post.projectId === projectId)
}
