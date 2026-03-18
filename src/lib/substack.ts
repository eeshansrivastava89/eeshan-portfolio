import yaml from 'js-yaml'
import { fetchWithCache } from './build-cache'

/**
 * Substack RSS Integration
 *
 * Fetches posts from Substack RSS feed, extracts full article HTML
 * from content:encoded, and joins with YAML mapping for project IDs.
 */

export interface SubstackPost {
  title: string
  link: string
  slug: string
  pubDate: Date
  description: string
  content: string // Full article HTML from content:encoded
  coverImage?: string // From enclosure tag
  projectId?: string
}

interface SubstackMapping {
  url: string
  project_id: string
}

interface SubstackMappings {
  posts?: SubstackMapping[]
}

/**
 * Derive slug from Substack URL
 * e.g., https://theasymptotic.substack.com/p/agentic-coding → agentic-coding
 */
function deriveSlug(url: string): string {
  try {
    const pathname = new URL(url).pathname
    // /p/some-post-slug → some-post-slug
    const match = pathname.match(/\/p\/(.+?)(?:\/|$)/)
    return match ? match[1] : pathname.replace(/^\//, '').replace(/\/$/, '')
  } catch {
    return url.replace(/[^a-z0-9-]/gi, '-').toLowerCase()
  }
}

/**
 * Fetch and parse Substack RSS feed
 */
async function fetchSubstackRSS(feedUrl: string): Promise<SubstackPost[]> {
  const response = await fetch(feedUrl)
  if (!response.ok) {
    throw new Error(`Substack RSS fetch failed: ${response.status}`)
  }

  const xmlText = await response.text()

  const items: SubstackPost[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1]

    const title = extractTag(itemContent, 'title')
    const link = extractTag(itemContent, 'link')
    const pubDateStr = extractTag(itemContent, 'pubDate')
    const description = extractTag(itemContent, 'description')
    const content = extractContentEncoded(itemContent)
    const coverImage = extractEnclosure(itemContent)

    if (title && link && pubDateStr) {
      items.push({
        title: decodeHTML(title),
        link,
        slug: deriveSlug(link),
        pubDate: new Date(pubDateStr),
        description: decodeHTML(stripHTML(description || '')),
        content: content || '',
        coverImage,
      })
    }
  }

  return items
}

/**
 * Extract content:encoded (namespaced tag with CDATA)
 */
function extractContentEncoded(content: string): string {
  const regex = /<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i
  const match = content.match(regex)
  if (!match) return ''

  let extracted = match[1].trim()

  // Handle CDATA
  const cdataRegex = /<!\[CDATA\[([\s\S]*?)\]\]>/
  const cdataMatch = extracted.match(cdataRegex)
  if (cdataMatch) {
    extracted = cdataMatch[1]
  }

  return extracted
}

/**
 * Extract enclosure URL (cover image)
 */
function extractEnclosure(content: string): string | undefined {
  const regex = /<enclosure[^>]+url="([^"]+)"/i
  const match = content.match(regex)
  return match ? match[1] : undefined
}

/**
 * Extract content between XML tags and handle CDATA sections
 */
function extractTag(content: string, tag: string): string {
  const regex = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const match = content.match(regex)
  if (!match) return ''

  let extracted = match[1].trim()

  const cdataRegex = /<!\[CDATA\[([\s\S]*?)\]\]>/
  const cdataMatch = extracted.match(cdataRegex)
  if (cdataMatch) {
    extracted = cdataMatch[1]
  }

  return extracted
}

function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

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
    const numMatch = entity.match(/^&#(\d+);$/)
    if (numMatch) return String.fromCodePoint(Number(numMatch[1]))
    const hexMatch = entity.match(/^&#x([0-9a-fA-F]+);$/)
    if (hexMatch) return String.fromCodePoint(parseInt(hexMatch[1], 16))
    return entity
  })
}

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
 * Get all Substack posts with full content and project mapping.
 * Uses build cache for resilience.
 */
export async function getSubstackPosts(
  feedUrl: string,
  yamlContent: string
): Promise<SubstackPost[]> {
  const posts = await fetchWithCache(
    feedUrl,
    'substack-feed',
    () => fetchSubstackRSS(feedUrl)
  )

  const mappings = loadMappings(yamlContent)

  // Rehydrate dates from cache (JSON serializes Date as string)
  return posts.map(post => ({
    ...post,
    pubDate: new Date(post.pubDate),
    projectId: mappings.get(post.link),
  }))
}

export function getPostsByProject(
  posts: SubstackPost[],
  projectId: string
): SubstackPost[] {
  return posts.filter(post => post.projectId === projectId)
}
