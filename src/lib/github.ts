/**
 * GitHub API utilities for fetching contributor data at build time
 */

export interface Contributor {
  login: string
  avatar_url: string
  html_url: string
}

const REPO_OWNER = 'eeshansrivastava89'
const REPO_NAME = 'ds-apps-main'

/**
 * Fetch recent contributors from GitHub Issues and PRs (last 30 days)
 * Deduplicates by login and excludes repo owner
 */
export async function getRecentContributors(days = 30): Promise<Contributor[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceISO = since.toISOString()

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'ds-apps-main',
  }

  // Use token if available (avoids rate limits)
  const token = import.meta.env.GITHUB_TOKEN
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const contributors = new Map<string, Contributor>()

  try {
    // Fetch recent issues
    const issuesUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=all&since=${sinceISO}&per_page=100`
    const issuesRes = await fetch(issuesUrl, { headers })
    
    if (issuesRes.ok) {
      const issues = await issuesRes.json()
      for (const issue of issues) {
        if (issue.user && issue.user.login !== REPO_OWNER) {
          contributors.set(issue.user.login, {
            login: issue.user.login,
            avatar_url: issue.user.avatar_url,
            html_url: issue.user.html_url,
          })
        }
      }
    }

    // Fetch recent PRs (issues endpoint includes PRs, but let's also check events)
    const eventsUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/events?per_page=100`
    const eventsRes = await fetch(eventsUrl, { headers })
    
    if (eventsRes.ok) {
      const events = await eventsRes.json()
      const cutoff = since.getTime()
      
      for (const event of events) {
        const eventDate = new Date(event.created_at).getTime()
        if (eventDate < cutoff) continue
        
        // Include PR and Issue events from non-owners
        if (
          event.actor &&
          event.actor.login !== REPO_OWNER &&
          ['PullRequestEvent', 'IssuesEvent', 'PullRequestReviewEvent'].includes(event.type)
        ) {
          contributors.set(event.actor.login, {
            login: event.actor.login,
            avatar_url: event.actor.avatar_url,
            html_url: `https://github.com/${event.actor.login}`,
          })
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch GitHub contributors:', error)
  }

  return Array.from(contributors.values())
}
