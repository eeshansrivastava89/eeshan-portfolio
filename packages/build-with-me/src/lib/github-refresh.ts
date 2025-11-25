// Client-side GitHub data refresh (no auth, 60 req/hr limit)
import type { Task, Contributor } from './validate-build-with-me'
import {
	LABEL_CATEGORY_MAP,
	LABEL_DIFFICULTY_MAP,
	LABEL_PROJECT_MAP,
	POINTS_PREFIX
} from '../data/build-with-me-config'

const REPO_OWNER = 'eeshansrivastava89'
const REPO_NAME = 'soma-portfolio'

interface GitHubIssue {
	number: number
	title: string
	state: string
	labels: { name: string }[]
	assignee?: { login: string; avatar_url: string }
	closed_by?: { login: string; avatar_url: string }
	html_url: string
	updated_at: string
	closed_at?: string
	pull_request?: unknown
}

interface GitHubPR {
	number: number
	state: string
	merged_at?: string
}

async function fetchAllIssues(): Promise<GitHubIssue[]> {
	const issues: GitHubIssue[] = []
	let page = 1
	while (true) {
		const res = await fetch(
			`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=all&per_page=100&page=${page}`
		)
		if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
		const chunk = await res.json()
		const filtered = chunk.filter((item: GitHubIssue) => !item.pull_request)
		issues.push(...filtered)
		if (chunk.length < 100) break
		page++
	}
	return issues
}

async function fetchAllPRs(): Promise<GitHubPR[]> {
	const prs: GitHubPR[] = []
	let page = 1
	while (true) {
		const res = await fetch(
			`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=all&per_page=100&page=${page}`
		)
		if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
		const chunk = await res.json()
		prs.push(...chunk)
		if (chunk.length < 100) break
		page++
	}
	return prs
}

function mapLabels(labels: { name: string }[]) {
	const cats = new Set<string>()
	const skills: string[] = []
	let difficulty: string | undefined
	let points: number | undefined
	let projectSlug = 'ab-sim'
	let estimatedHours: string | undefined
	let isGoodFirstIssue = false

	for (const l of labels) {
		const name = l.name || ''
		if (LABEL_CATEGORY_MAP[name]) cats.add(LABEL_CATEGORY_MAP[name])
		if (LABEL_DIFFICULTY_MAP[name]) difficulty = LABEL_DIFFICULTY_MAP[name]
		if (LABEL_PROJECT_MAP[name]) projectSlug = LABEL_PROJECT_MAP[name]
		if (name.startsWith(POINTS_PREFIX)) {
			const val = parseInt(name.replace(POINTS_PREFIX, ''), 10)
			if (!Number.isNaN(val)) points = val
		}
		if (name.startsWith('learn:')) skills.push(name.replace('learn:', ''))
		if (name.startsWith('hours:')) estimatedHours = name.replace('hours:', '')
		if (name === 'good first issue') isGoodFirstIssue = true
	}

	return { category: Array.from(cats), difficulty, points, projectSlug, skills, estimatedHours, isGoodFirstIssue }
}

function mapStatus(issue: GitHubIssue, prIndex: Map<number, GitHubPR>): string {
	if (issue.state === 'closed') return 'merged'
	if (prIndex.has(issue.number)) {
		const pr = prIndex.get(issue.number)!
		if (pr.merged_at) return 'merged'
		if (pr.state === 'open') return 'in-review'
		return 'claimed'
	}
	if (issue.assignee) return 'claimed'
	return 'open'
}

function buildTasks(issues: GitHubIssue[], prs: GitHubPR[]): Task[] {
	const prIndex = new Map<number, GitHubPR>()
	prs.forEach((pr) => prIndex.set(pr.number, pr))

	return issues.map((issue) => {
		const { category, difficulty, points, projectSlug, skills, estimatedHours, isGoodFirstIssue } = mapLabels(issue.labels)
		const status = mapStatus(issue, prIndex)
		const assignees = issue.assignee
			? [{ name: issue.assignee.login, avatarUrl: issue.assignee.avatar_url }]
			: undefined
		const closedBy = issue.closed_by
			? { name: issue.closed_by.login, avatarUrl: issue.closed_by.avatar_url }
			: undefined

		return {
			id: String(issue.number),
			title: issue.title,
			projectSlug,
			category: category.length ? category : ['frontend'],
			status,
			difficulty,
			points,
			assignees,
			closedBy,
			labels: issue.labels.map((l) => l.name).filter(Boolean),
			skills,
			estimatedHours,
			isGoodFirstIssue,
			githubUrl: issue.html_url,
			updatedAt: issue.updated_at,
			closedAt: issue.closed_at
		} as Task
	})
}

function buildContributors(tasks: Task[]): Contributor[] {
	const map = new Map<string, Contributor>()
	tasks.forEach((task) => {
		if (task.assignees) {
			task.assignees.forEach((a) => {
				const current = map.get(a.name) || { name: a.name, avatarUrl: a.avatarUrl, mergedPRs: 0, reviews: 0 }
				if (task.status === 'merged') current.mergedPRs += 1
				if (a.avatarUrl && !current.avatarUrl) current.avatarUrl = a.avatarUrl
				map.set(a.name, current)
			})
		}
	})
	return Array.from(map.values()).sort((a, b) => b.mergedPRs - a.mergedPRs)
}

interface ActivityItem {
	type: 'merged' | 'claimed' | 'pr-opened'
	taskId: string
	taskTitle: string
	user: string
	avatarUrl?: string
	timestamp: string
	githubUrl: string
}

function buildRecentActivity(tasks: Task[]): ActivityItem[] {
	const activities: ActivityItem[] = []
	
	tasks.forEach((task) => {
		if (task.status === 'merged' && task.closedBy && task.closedAt) {
			activities.push({
				type: 'merged',
				taskId: task.id,
				taskTitle: task.title,
				user: task.closedBy.name,
				avatarUrl: task.closedBy.avatarUrl,
				timestamp: task.closedAt,
				githubUrl: task.githubUrl
			})
		} else if (task.status === 'claimed' && task.assignees?.[0] && task.updatedAt) {
			activities.push({
				type: 'claimed',
				taskId: task.id,
				taskTitle: task.title,
				user: task.assignees[0].name,
				avatarUrl: task.assignees[0].avatarUrl,
				timestamp: task.updatedAt,
				githubUrl: task.githubUrl
			})
		}
	})
	
	return activities
		.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
		.slice(0, 10)
}

export interface RefreshResult {
	tasks: Task[]
	contributors: Contributor[]
	recentActivity: ActivityItem[]
	lastFetchTime: string
}

export async function refreshGitHubData(): Promise<RefreshResult> {
	const [issues, prs] = await Promise.all([fetchAllIssues(), fetchAllPRs()])
	const tasks = buildTasks(issues, prs)
	const contributors = buildContributors(tasks)
	const recentActivity = buildRecentActivity(tasks)
	return { tasks, contributors, recentActivity, lastFetchTime: new Date().toISOString() }
}
