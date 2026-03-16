/**
 * GitHub API utilities
 * - GraphQL: contribution calendar, repo stats, profile (build-time, needs PAT)
 * - REST: recent public activity (build-time, cached fallback)
 */

import { fetchWithCache } from './build-cache'
import { execSync } from 'node:child_process'

const GITHUB_USERNAME = 'eeshansrivastava89'

// ─── Types ───────────────────────────────────────────────────

export interface ContributionDay {
  date: string
  contributionCount: number
  color: string
}

export interface ContributionWeek {
  contributionDays: ContributionDay[]
}

export interface Repository {
  name: string
  description: string | null
  url: string
  stargazerCount: number
  forkCount: number
  primaryLanguage: { name: string; color: string } | null
}

export interface RecentActivity {
  repo: string
  message: string
  time: string
  url?: string
}

export interface GitHubData {
  totalContributions: number
  weeks: ContributionWeek[]
  repositories: Repository[]
  bio: string | null
  followers: number
  recentActivity: RecentActivity[]
}

// ─── GraphQL (build-time) ────────────────────────────────────

const CONTRIBUTION_QUERY = `
query($username: String!) {
  user(login: $username) {
    bio
    followers { totalCount }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            color
          }
        }
      }
    }
    repositories(
      first: 20
      orderBy: { field: STARGAZERS, direction: DESC }
      ownerAffiliations: OWNER
      privacy: PUBLIC
    ) {
      nodes {
        name
        description
        url
        stargazerCount
        forkCount
        primaryLanguage { name color }
      }
    }
  }
}
`

async function fetchGitHubGraphQL(): Promise<GitHubData> {
  const token = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN
  if (!token) {
    throw new Error('GITHUB_TOKEN not available')
  }

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'eeshans-portfolio',
    },
    body: JSON.stringify({
      query: CONTRIBUTION_QUERY,
      variables: { username: GITHUB_USERNAME },
    }),
  })

  if (!response.ok) {
    throw new Error(`GitHub GraphQL failed: ${response.status}`)
  }

  const activityRes = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'eeshans-portfolio',
      },
    }
  )

  if (!activityRes.ok) {
    throw new Error(`GitHub public events failed: ${activityRes.status}`)
  }

  const json = await response.json()
  const activityJson = await activityRes.json()

  if (json.errors) {
    throw new Error(`GitHub GraphQL errors: ${JSON.stringify(json.errors)}`)
  }

  const user = json.data.user
  const calendar = user.contributionsCollection.contributionCalendar

  return {
    totalContributions: calendar.totalContributions,
    weeks: calendar.weeks,
    repositories: user.repositories.nodes,
    bio: user.bio,
    followers: user.followers.totalCount,
    recentActivity: normalizeRecentActivity(activityJson),
  }
}

function normalizeRecentActivity(events: any[]): RecentActivity[] {
  if (!Array.isArray(events)) return []

  const items = events.flatMap((event: any): RecentActivity[] => {
    const repo = event?.repo?.name?.replace(`${GITHUB_USERNAME}/`, '') || GITHUB_USERNAME
    const time = event?.created_at

    if (!time) return []

    if (event.type === 'PushEvent') {
      const commits = Array.isArray(event.payload?.commits) ? event.payload.commits : []
      if (commits.length === 0) {
        return [{
          repo,
          message: 'Pushed code updates',
          time,
          url: `https://github.com/${event.repo?.name}`,
        }]
      }

      return commits.map((commit: any) => ({
        repo,
        message: String(commit?.message || 'Updated code').split('\n')[0],
        time,
        url: commit?.sha ? `https://github.com/${event.repo?.name}/commit/${commit.sha}` : `https://github.com/${event.repo?.name}`,
      }))
    }

    if (event.type === 'CreateEvent') {
      const refType = event.payload?.ref_type || 'resource'
      const ref = event.payload?.ref ? ` ${event.payload.ref}` : ''
      return [{
        repo,
        message: `Created ${refType}${ref}`,
        time,
        url: `https://github.com/${event.repo?.name}`,
      }]
    }

    if (event.type === 'PullRequestEvent') {
      const title = event.payload?.pull_request?.title || 'pull request'
      const action = event.payload?.action || 'updated'
      return [{
        repo,
        message: `${capitalize(action)} PR: ${title}`,
        time,
        url: event.payload?.pull_request?.html_url,
      }]
    }

    if (event.type === 'IssuesEvent') {
      const title = event.payload?.issue?.title || 'issue'
      const action = event.payload?.action || 'updated'
      return [{
        repo,
        message: `${capitalize(action)} issue: ${title}`,
        time,
        url: event.payload?.issue?.html_url,
      }]
    }

    if (event.type === 'IssueCommentEvent') {
      const title = event.payload?.issue?.title || 'issue'
      return [{
        repo,
        message: `Commented on issue: ${title}`,
        time,
        url: event.payload?.comment?.html_url || event.payload?.issue?.html_url,
      }]
    }

    if (event.type === 'ReleaseEvent') {
      const name = event.payload?.release?.name || event.payload?.release?.tag_name || 'release'
      return [{
        repo,
        message: `Published release: ${name}`,
        time,
        url: event.payload?.release?.html_url,
      }]
    }

    return []
  })

  return items.slice(0, 8)
}

function getLocalGitActivity(limit = 8): RecentActivity[] {
  try {
    const output = execSync(
      `git log -n ${limit} --pretty=format:%cI%x09%s`,
      { cwd: process.cwd(), encoding: 'utf-8' }
    )

    return output
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [time, message] = line.split('\t')
        return {
          repo: 'datascienceapps',
          message: message || 'Updated code',
          time,
          url: 'https://github.com/eeshansrivastava89/datascienceapps',
        }
      })
  } catch {
    return []
  }
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * Get GitHub data with cached fallback for build resilience.
 */
export async function getGitHubData(): Promise<GitHubData> {
  const data = await fetchWithCache<Partial<GitHubData>>(
    'https://api.github.com/graphql',
    'github-data',
    fetchGitHubGraphQL
  )

  const normalized: GitHubData = {
    totalContributions: typeof data.totalContributions === 'number' ? data.totalContributions : 0,
    weeks: Array.isArray(data.weeks) ? data.weeks : [],
    repositories: Array.isArray(data.repositories) ? data.repositories : [],
    bio: typeof data.bio === 'string' || data.bio === null ? data.bio ?? null : null,
    followers: typeof data.followers === 'number' ? data.followers : 0,
    recentActivity: Array.isArray(data.recentActivity) ? data.recentActivity : [],
  }

  if (normalized.recentActivity.length === 0) {
    normalized.recentActivity = getLocalGitActivity()
  }

  return normalized
}

// ─── Contributor fetching (existing) ─────────────────────────

export interface Contributor {
  login: string
  avatar_url: string
  html_url: string
}

export async function getRecentContributors(days = 30): Promise<Contributor[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceISO = since.toISOString()

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'datascienceapps',
  }

  const token = import.meta.env.GITHUB_TOKEN
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const contributors = new Map<string, Contributor>()

  try {
    const issuesUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/datascienceapps/issues?state=all&since=${sinceISO}&per_page=100`
    const issuesRes = await fetch(issuesUrl, { headers })

    if (issuesRes.ok) {
      const issues = await issuesRes.json()
      for (const issue of issues) {
        if (issue.user) {
          contributors.set(issue.user.login, {
            login: issue.user.login,
            avatar_url: issue.user.avatar_url,
            html_url: issue.user.html_url,
          })
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch GitHub contributors:', error)
  }

  return Array.from(contributors.values())
}
