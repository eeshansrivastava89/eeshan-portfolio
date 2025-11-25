import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import TasksView from './TasksView'
import ContributorCards from './ContributorCards'
import ActivityFeed from './ActivityFeed'
import { refreshGitHubData } from '../lib/github-refresh'
import type { Task, Contributor, ActivityItem } from '../lib/validate-build-with-me'

interface BuildWithMeViewProps {
	tasks: Task[]
	contributors: Contributor[]
	recentActivity: ActivityItem[]
}

export default function BuildWithMeView({
	tasks: initialTasks,
	contributors: initialContributors,
	recentActivity: initialActivity,
}: BuildWithMeViewProps) {
	const [tasks, setTasks] = useState<Task[]>(initialTasks)
	const [contributors, setContributors] = useState<Contributor[]>(initialContributors)
	const [recentActivity, setRecentActivity] = useState<ActivityItem[]>(initialActivity)
	const [isRefreshing, setIsRefreshing] = useState(false)

	const handleRefresh = async () => {
		setIsRefreshing(true)
		try {
			const data = await refreshGitHubData()
			setTasks(data.tasks)
			setContributors(data.contributors)
			setRecentActivity(data.recentActivity)
		} catch (e) {
			console.error('Refresh failed:', e)
		} finally {
			setIsRefreshing(false)
		}
	}

	return (
		<div className='space-y-8'>
			{/* Quick nav + refresh */}
			<div className='flex items-center justify-between gap-4 border-t border-border pt-4'>
				<div className='flex flex-wrap items-center gap-2'>
					<a
						href='#open-work'
						className='rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-400'
					>
						Open Work
					</a>
					<a
						href='#contributors'
						className='rounded-full border border-border bg-primary-foreground px-4 py-2 text-sm font-medium text-foreground transition hover:-translate-y-0.5 hover:border-foreground/30'
					>
						Contributors
					</a>
					<a
						href='#how-to'
						className='rounded-full border border-border bg-primary-foreground px-4 py-2 text-sm font-medium text-foreground transition hover:-translate-y-0.5 hover:border-foreground/30'
					>
						How to Ship
					</a>
					<a
						href='#faq'
						className='rounded-full border border-border bg-primary-foreground px-4 py-2 text-sm font-medium text-foreground transition hover:-translate-y-0.5 hover:border-foreground/30'
					>
						FAQ
					</a>
				</div>
				<button
					onClick={handleRefresh}
					disabled={isRefreshing}
					className='inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-600 disabled:opacity-50'
				>
					<RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
					{isRefreshing ? 'Refreshing...' : 'Refresh'}
				</button>
			</div>

			<section>
				<ActivityFeed activities={recentActivity} />
			</section>

			<section id='open-work' className='space-y-4' aria-label='Open work'>
				<div>
					<h2 className='text-2xl font-bold text-foreground'>Open Work</h2>
					<p className='text-sm text-muted-foreground'>Pick a task, claim an issue, and ship.</p>
				</div>
				<TasksView tasks={tasks} />
			</section>

			<section id='contributors' aria-label='Contributors'>
				<ContributorCards contributors={contributors} tasks={tasks} />
			</section>
		</div>
	)
}
