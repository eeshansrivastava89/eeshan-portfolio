import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import TaskList from './TaskList'
import ContributorCards from './ContributorCards'
import type { Task, Contributor, ActivityItem } from '@/lib/build-log-types'

interface BuildLogViewProps {
	tasks: Task[]
	contributors: Contributor[]
	recentActivity: ActivityItem[]
}

export default function BuildLogView({ tasks: initialTasks, contributors: initialContributors }: BuildLogViewProps) {
	const [tasks, setTasks] = useState<Task[]>(initialTasks)
	const [contributors, setContributors] = useState<Contributor[]>(initialContributors)
	const [isRefreshing, setIsRefreshing] = useState(false)

	const handleRefresh = async () => {
		setIsRefreshing(true)
		try {
			const res = await fetch('/api/refresh-build-log')
			if (res.ok) {
				const data = await res.json()
				setTasks(data.tasks)
				setContributors(data.contributors)
			}
		} catch (e) {
			console.error('Refresh failed:', e)
		} finally {
			setIsRefreshing(false)
		}
	}

	const openTasks = tasks.filter(t => t.status === 'open' || t.status === 'claimed' || t.status === 'in-review')

	return (
		<div className='space-y-12'>
			{/* Open Work - Main content */}
			<section id='open-work' className='space-y-4' aria-label='Open work'>
				<div className='flex items-center justify-between'>
					<div>
						<h2 className='text-xl font-semibold text-foreground'>Open Work</h2>
						<p className='text-sm text-muted-foreground'>Pick a task, claim the issue, and ship.</p>
					</div>
					<button onClick={handleRefresh} disabled={isRefreshing} className='inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:border-foreground/50 disabled:opacity-50'>
						<RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
						{isRefreshing ? 'Refreshing...' : 'Refresh'}
					</button>
				</div>
				<TaskList tasks={openTasks} />
			</section>

			{/* Contributors */}
			<section id='contributors' aria-label='Contributors'>
				<ContributorCards contributors={contributors} tasks={tasks} />
			</section>
		</div>
	)
}
