/**
 * GitHub API utilities
 * - GraphQL: contribution calendar, repo stats, profile (build-time, needs PAT)
 * - REST: recent public activity (build-time, cached fallback)
 */

import { fetchWithCache } from './build-cache'
import { execSync } from 'node:child_process'

const GITHUB_USERNAME = 'eeshansrivastava89'
const ACTIVITY_DAYS = 365 // How many days of activity to show in the timeline

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
  category?: 'commit' | 'issue' | 'pr' | 'repo'
}

export interface ActivityTotals {
  commits: number
  issues: number
  prs: number
  repos: number
}

export interface GitHubData {
  totalContributions: number
  weeks: ContributionWeek[]
  repositories: Repository[]
  bio: string | null
  followers: number
  recentActivity: RecentActivity[]
  activityTotals: ActivityTotals
}

// ─── GraphQL (build-time) ────────────────────────────────────

const CONTRIBUTION_QUERY = `
query($username: String!, $activityFrom: DateTime!) {
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
    recentActivity: contributionsCollection(from: $activityFrom) {
      totalCommitContributions
      totalIssueContributions
      totalPullRequestContributions
      totalRepositoryContributions
      commitContributionsByRepository(maxRepositories: 20) {
        repository { name url }
        contributions { totalCount }
      }
      issueContributions(first: 20, orderBy: {direction: DESC}) {
        nodes {
          issue { title url createdAt repository { name url } }
        }
      }
      pullRequestContributions(first: 20, orderBy: {direction: DESC}) {
        nodes {
          pullRequest { title url createdAt repository { name url } }
        }
      }
      repositoryContributions(first: 10, orderBy: {direction: DESC}) {
        nodes {
          repository { name url createdAt primaryLanguage { name } }
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
      variables: {
        username: GITHUB_USERNAME,
        activityFrom: new Date(Date.now() - ACTIVITY_DAYS * 86400000).toISOString(),
      },
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
    recentActivity: buildActivityFromGraphQL(user.recentActivity),
    activityTotals: {
      commits: user.recentActivity?.totalCommitContributions || 0,
      issues: user.recentActivity?.totalIssueContributions || 0,
      prs: user.recentActivity?.totalPullRequestContributions || 0,
      repos: user.recentActivity?.totalRepositoryContributions || 0,
    },
  }
}

function buildActivityFromGraphQL(contributions: any): RecentActivity[] {
  const items: RecentActivity[] = []

  // Commits by repository (aggregated — like "178 commits" per repo)
  const commitsByRepo = contributions.commitContributionsByRepository || []
  for (const entry of commitsByRepo) {
    const repo = entry.repository?.name || 'unknown'
    const count = entry.contributions?.totalCount || 0
    if (count > 0) {
      items.push({
        repo,
        message: `${count} commit${count !== 1 ? 's' : ''}`,
        time: new Date().toISOString(),
        url: entry.repository?.url,
        category: 'commit',
      })
    }
  }

  // New repositories created
  const newRepos = contributions.repositoryContributions?.nodes || []
  for (const entry of newRepos) {
    const repo = entry.repository?.name || 'unknown'
    const lang = entry.repository?.primaryLanguage?.name
    items.push({
      repo,
      message: `Created repository${lang ? ` · ${lang}` : ''}`,
      time: entry.repository?.createdAt || new Date().toISOString(),
      url: entry.repository?.url,
      category: 'repo',
    })
  }

  // Issues opened
  const issues = contributions.issueContributions?.nodes || []
  for (const entry of issues) {
    const issue = entry.issue
    if (!issue) continue
    const repo = issue.repository?.name || 'unknown'
    items.push({
      repo,
      message: `Opened issue: ${issue.title}`,
      time: issue.createdAt,
      url: issue.url,
      category: 'issue',
    })
  }

  // Pull requests
  const prs = contributions.pullRequestContributions?.nodes || []
  for (const entry of prs) {
    const pr = entry.pullRequest
    if (!pr) continue
    const repo = pr.repository?.name || 'unknown'
    items.push({
      repo,
      message: `Opened PR: ${pr.title}`,
      time: pr.createdAt,
      url: pr.url,
      category: 'pr',
    })
  }

  // Sort by time descending
  items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

  return items.slice(0, 20)
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
    activityTotals: data.activityTotals || { commits: 0, issues: 0, prs: 0, repos: 0 },
  }

  if (normalized.recentActivity.length === 0) {
    normalized.recentActivity = getLocalGitActivity()
  }

  return normalized
}

