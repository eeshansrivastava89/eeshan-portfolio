/**
 * Extract headings from HTML and inject id attributes for anchor linking.
 */

export interface TocEntry {
  id: string
  text: string
  level: number
}

/**
 * Parse heading tags from HTML string, return TOC entries and
 * modified HTML with id attributes injected into headings.
 */
function decodeEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
    '&#39;': "'", '&apos;': "'", '&nbsp;': ' ',
  }
  return text.replace(/&[^;]+;/g, (entity) => {
    if (entities[entity]) return entities[entity]
    const numMatch = entity.match(/^&#(\d+);$/)
    if (numMatch) return String.fromCodePoint(Number(numMatch[1]))
    const hexMatch = entity.match(/^&#x([0-9a-fA-F]+);$/)
    if (hexMatch) return String.fromCodePoint(parseInt(hexMatch[1], 16))
    return entity
  })
}

export function extractToc(html: string): { toc: TocEntry[]; html: string } {
  const toc: TocEntry[] = []
  const usedIds = new Set<string>()

  const processed = html.replace(
    /<(h[1-3])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag, attrs, content) => {
      const level = parseInt(tag[1])
      const text = decodeEntities(content.replace(/<[^>]*>/g, '').trim())
      if (!text) return match

      let id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60)

      // Deduplicate
      if (usedIds.has(id)) {
        let i = 2
        while (usedIds.has(`${id}-${i}`)) i++
        id = `${id}-${i}`
      }
      usedIds.add(id)

      toc.push({ id, text, level })

      // Inject id, preserving existing attributes
      if (attrs.includes('id=')) {
        return match // Already has an id
      }
      return `<${tag}${attrs} id="${id}">${content}</${tag}>`
    }
  )

  return { toc, html: processed }
}
