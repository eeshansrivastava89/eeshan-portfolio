import { Users, ExternalLink } from 'lucide-react'
import type { Contributor, Task } from '../lib/validate-build-with-me'

interface ContributorCardsProps {
	contributors: Contributor[]
	tasks: Task[]
}

function formatDate(dateStr: string): string {
	const date = new Date(dateStr)
	return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ProgressBar({ merged, total }: { merged: number; total: number }) {
	const percentage = total > 0 ? Math.round((merged / total) * 100) : 0
	return (
		<div className='space-y-1'>
			<div className='flex items-center justify-between text-xs'>
				<span className='text-muted-foreground'>Completion</span>
				<span className='font-medium text-foreground'>{percentage}%</span>
			</div>
			<div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
				<div
					className='h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700'
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	)
}

export default function ContributorCards({ contributors, tasks }: ContributorCardsProps) {
	// Get total issues count for progress bar
	const totalIssues = tasks.length

	// Build a map of latest shipped PR per contributor
	const latestShipByUser = new Map<string, Task>()
	tasks
		.filter((t) => t.status === 'merged' && t.closedAt)
		.sort((a, b) => new Date(b.closedAt!).getTime() - new Date(a.closedAt!).getTime())
		.forEach((task) => {
			const user = task.closedBy?.name || task.assignees?.[0]?.name
			if (user && !latestShipByUser.has(user)) {
				latestShipByUser.set(user, task)
			}
		})

	if (contributors.length === 0) {
		return (
			<div className='rounded-2xl border border-border bg-primary-foreground p-8 text-center'>
				<Users className='mx-auto h-8 w-8 text-muted-foreground' />
				<p className='mt-2 text-sm text-muted-foreground'>
					No contributors yet. Be the first to ship!
				</p>
			</div>
		)
	}

	return (
		<div className='space-y-4'>
			<div className='flex items-center gap-2'>
				<Users className='h-5 w-5 text-orange-500' />
				<h2 className='text-xl font-semibold text-foreground'>Contributors</h2>
				<span className='text-sm text-muted-foreground'>({contributors.length})</span>
			</div>
			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
				{contributors.map((contributor) => {
					const latestShip = latestShipByUser.get(contributor.name)

					return (
						<div
							key={contributor.name}
							className='group rounded-2xl border border-border bg-primary-foreground p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg'
						>
							{/* Header: Avatar + Name */}
							<div className='flex items-start gap-4'>
								{contributor.avatarUrl ? (
									<img
										src={contributor.avatarUrl}
										alt={contributor.name}
										className='h-14 w-14 rounded-full border-2 border-border shadow-sm'
									/>
								) : (
									<div className='flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100 text-lg font-bold text-orange-600'>
										{contributor.name.charAt(0).toUpperCase()}
									</div>
								)}
								<div className='min-w-0 flex-1'>
									<span className='truncate text-base font-semibold text-foreground'>
										{contributor.name}
									</span>
									<div className='mt-0.5 text-sm text-muted-foreground'>
										{contributor.mergedPRs} PRs merged
										{contributor.reviews > 0 && ` • ${contributor.reviews} reviews`}
									</div>
								</div>
							</div>

							{/* Progress bar */}
							<div className='mt-4'>
								<ProgressBar merged={contributor.mergedPRs} total={totalIssues} />
							</div>

							{/* Latest ship */}
							{latestShip && (
								<div className='mt-4 border-t border-border pt-3'>
									<div className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>
										Latest ship
									</div>
									<a
										href={latestShip.githubUrl}
										target='_blank'
										rel='noreferrer'
										className='mt-1 block text-sm text-foreground transition hover:text-orange-600'
									>
										<span className='line-clamp-2'>{latestShip.title}</span>
									</a>
									<div className='mt-1 flex items-center justify-between'>
										<span className='text-xs text-muted-foreground'>
											{latestShip.closedAt && formatDate(latestShip.closedAt)}
										</span>
										<a
											href={latestShip.githubUrl}
											target='_blank'
											rel='noreferrer'
											className='inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600'
										>
											<ExternalLink className='h-3 w-3' />
											View
										</a>
									</div>
								</div>
							)}
						</div>
					)
				})}
			</div>
		</div>
	)
}
