import { Users, ExternalLink } from 'lucide-react'
import type { Contributor, Task } from '@/lib/build-log-types'

interface ContributorCardsProps {
	contributors: Contributor[]
	tasks: Task[]
}

function formatDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ContributorCards({ contributors, tasks }: ContributorCardsProps) {
	const latestShipByUser = new Map<string, Task>()
	tasks
		.filter((t) => t.status === 'merged' && t.closedAt)
		.sort((a, b) => new Date(b.closedAt!).getTime() - new Date(a.closedAt!).getTime())
		.forEach((task) => {
			const user = task.closedBy?.name || task.assignees?.[0]?.name
			if (user && !latestShipByUser.has(user)) latestShipByUser.set(user, task)
		})

	if (contributors.length === 0) {
		return (
			<div className='space-y-3'>
				<h2 className='text-xl font-semibold text-foreground'>Contributors</h2>
				<div className='border border-border bg-primary-foreground p-6 text-center'>
					<Users className='mx-auto h-6 w-6 text-muted-foreground' />
					<p className='mt-2 text-sm text-muted-foreground'>No contributors yet. Be the first to ship!</p>
				</div>
			</div>
		)
	}

	return (
		<div className='space-y-3'>
			<div className='flex items-center gap-2'>
				<h2 className='text-xl font-semibold text-foreground'>Contributors</h2>
				<span className='text-sm text-muted-foreground'>({contributors.length})</span>
			</div>
			<div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
				{contributors.map((contributor) => {
					const latestShip = latestShipByUser.get(contributor.name)
					return (
						<div key={contributor.name} className='border border-border bg-primary-foreground p-3 transition hover:border-foreground/30'>
							<div className='flex items-center gap-3'>
								{contributor.avatarUrl ? (
									<img src={contributor.avatarUrl} alt={contributor.name} className='h-8 w-8 rounded-full border border-border' />
								) : (
									<div className='flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground'>
										{contributor.name.charAt(0).toUpperCase()}
									</div>
								)}
								<div className='min-w-0 flex-1'>
									<div className='truncate text-sm font-medium text-foreground'>{contributor.name}</div>
									<div className='text-xs text-muted-foreground'>
										{contributor.mergedPRs} merged{contributor.reviews > 0 && ` · ${contributor.reviews} reviews`}
									</div>
								</div>
							</div>
							{latestShip && (
								<a href={latestShip.githubUrl} target='_blank' rel='noreferrer' className='mt-2 flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground transition hover:text-foreground'>
									<span className='line-clamp-1'>#{latestShip.id} {latestShip.title}</span>
									<ExternalLink className='ml-1 h-3 w-3 shrink-0' />
								</a>
							)}
						</div>
					)
				})}
			</div>
		</div>
	)
}
