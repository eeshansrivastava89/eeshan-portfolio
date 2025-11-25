import { useState, useEffect } from 'react'
import { GitMerge, UserPlus, GitPullRequest, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ActivityItem } from '../lib/validate-build-with-me'

interface ActivityFeedProps {
	activities: ActivityItem[]
	initialLimit?: number
}

const DEFAULT_LIMIT = 5
const PAGE_SIZE = 5

function timeAgo(timestamp: string): string {
	const now = new Date()
	const then = new Date(timestamp)
	const diffMs = now.getTime() - then.getTime()
	const diffMins = Math.floor(diffMs / 60000)
	const diffHours = Math.floor(diffMins / 60)
	const diffDays = Math.floor(diffHours / 24)

	if (diffMins < 1) return 'just now'
	if (diffMins < 60) return `${diffMins}m ago`
	if (diffHours < 24) return `${diffHours}h ago`
	if (diffDays < 7) return `${diffDays}d ago`
	return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function TimeAgo({ timestamp }: { timestamp: string }) {
	const [time, setTime] = useState<string>('')
	
	useEffect(() => {
		setTime(timeAgo(timestamp))
		// Update every minute
		const interval = setInterval(() => setTime(timeAgo(timestamp)), 60000)
		return () => clearInterval(interval)
	}, [timestamp])
	
	return <span>{time}</span>
}

function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
	switch (type) {
		case 'merged':
			return <GitMerge className='h-4 w-4 text-emerald-500' />
		case 'pr-opened':
			return <GitPullRequest className='h-4 w-4 text-sky-500' />
		case 'claimed':
			return <UserPlus className='h-4 w-4 text-amber-500' />
	}
}

function activityVerb(type: ActivityItem['type']): string {
	switch (type) {
		case 'merged':
			return 'merged'
		case 'pr-opened':
			return 'opened PR for'
		case 'claimed':
			return 'claimed'
	}
}

export default function ActivityFeed({ activities, initialLimit = DEFAULT_LIMIT }: ActivityFeedProps) {
	const [currentPage, setCurrentPage] = useState(0)
	
	if (activities.length === 0) {
		return null
	}

	const pageCount = Math.ceil(activities.length / PAGE_SIZE)
	const startIndex = currentPage * PAGE_SIZE
	const displayedActivities = activities.slice(startIndex, startIndex + PAGE_SIZE)

	return (
		<section className='rounded-2xl border border-border bg-primary-foreground p-4 shadow-lg shadow-black/5'>
			<div className='mb-3 flex items-center gap-2'>
				<div className='h-2 w-2 animate-pulse rounded-full bg-emerald-500' />
				<h2 className='text-sm font-semibold text-foreground'>Recent Activity</h2>
				<span className='text-xs text-muted-foreground'>({activities.length})</span>
			</div>
			<div className='space-y-3'>
				{displayedActivities.map((activity, idx) => (
					<div
						key={`${activity.taskId}-${activity.type}-${idx}`}
						className='flex items-start gap-3'
					>
						{/* Avatar */}
						<div className='flex-shrink-0'>
							{activity.avatarUrl ? (
								<img
									src={activity.avatarUrl}
									alt={activity.user}
									className='h-8 w-8 rounded-full border border-border'
								/>
							) : (
								<div className='flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground'>
									{activity.user.charAt(0).toUpperCase()}
								</div>
							)}
						</div>

						{/* Content */}
						<div className='min-w-0 flex-1'>
							<div className='flex items-center gap-2'>
								<ActivityIcon type={activity.type} />
								<span className='text-sm'>
									<span className='font-semibold text-foreground'>{activity.user}</span>
									<span className='text-muted-foreground'> {activityVerb(activity.type)} </span>
								</span>
							</div>
							<a
								href={activity.githubUrl}
								target='_blank'
								rel='noreferrer'
								className='group mt-0.5 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground'
							>
								<span className='line-clamp-1'>#{activity.taskId} {activity.taskTitle}</span>
								<ExternalLink className='h-3 w-3 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100' />
							</a>
						</div>

						{/* Timestamp */}
						<div className='flex-shrink-0 text-xs text-muted-foreground'>
							<TimeAgo timestamp={activity.timestamp} />
						</div>
					</div>
				))}
			</div>
			{pageCount > 1 && (
				<div className='mt-3 flex items-center justify-center gap-1'>
					<button
						onClick={() => setCurrentPage((p) => p - 1)}
						disabled={currentPage === 0}
						className='rounded p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent'
					>
						<ChevronLeft className='h-4 w-4' />
					</button>
					{Array.from({ length: pageCount }, (_, i) => (
						<button
							key={i}
							onClick={() => setCurrentPage(i)}
							className={`min-w-[32px] rounded px-2 py-1.5 text-xs font-medium transition ${
								currentPage === i
									? 'bg-foreground text-background'
									: 'text-muted-foreground hover:bg-muted hover:text-foreground'
							}`}
						>
							{i + 1}
						</button>
					))}
					<button
						onClick={() => setCurrentPage((p) => p + 1)}
						disabled={currentPage === pageCount - 1}
						className='rounded p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent'
					>
						<ChevronRight className='h-4 w-4' />
					</button>
				</div>
			)}
		</section>
	)
}
