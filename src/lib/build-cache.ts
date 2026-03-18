import fs from 'node:fs'
import path from 'node:path'

const CACHE_DIR = path.join(process.cwd(), '.cache')

/**
 * Fetch with cached fallback for build resilience.
 * On success: writes response to .cache/{key}.json
 * On failure: reads from .cache/{key}.json if it exists
 */
export async function fetchWithCache<T>(
  url: string,
  cacheKey: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`)

  try {
    const data = await fetcher()

    // Write cache on success
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true })
    }
    fs.writeFileSync(cachePath, JSON.stringify(data, null, 2))

    return data
  } catch (error) {
    console.warn(`[build-cache] Failed to fetch ${url}: ${error}`)

    // Fall back to cache
    if (fs.existsSync(cachePath)) {
      console.warn(`[build-cache] Using cached data for ${cacheKey}`)
      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'))
      return cached as T
    }

    console.warn(`[build-cache] No cache available for ${cacheKey}, returning empty`)
    return [] as unknown as T
  }
}
