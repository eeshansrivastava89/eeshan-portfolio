/**
 * GitHub API utilities
 * - GraphQL: contribution calendar, repo stats, profile (build-time, needs PAT)
 * - REST: recent events/commits (client-side, no auth needed)
 */

import { fetchWithCache } from './build-cache'

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

export interface GitHubData {
  totalContributions: number
  weeks: ContributionWeek[]
  repositories: Repository[]
  bio: string | null
  followers: number
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

  const json = await response.json()

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
  }
}

/**
 * Get GitHub data with cached fallback for build resilience.
 */
export async function getGitHubData(): Promise<GitHubData> {
  return fetchWithCache(
    'https://api.github.com/graphql',
    'github-data',
    fetchGitHubGraphQL
  )
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
