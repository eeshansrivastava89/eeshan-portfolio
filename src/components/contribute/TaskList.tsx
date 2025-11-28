import { ExternalLink, Sparkles, Clock } from 'lucide-react'
import type { Task } from '@/lib/build-log-types'
import { CATEGORY_STYLES } from '@/lib/build-log-config'

const SKILL_STYLES: Record<string, { label: string; color: string }> = {
	react: { label: 'React', color: 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300' },
	typescript: { label: 'TypeScript', color: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300' },
	tailwind: { label: 'Tailwind', color: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300' },
	astro: { label: 'Astro', color: 'bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300' },
	python: { label: 'Python', color: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' },
	sql: { label: 'SQL', color: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' },
	git: { label: 'Git', color: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300' },
	testing: { label: 'Testing', color: 'bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300' },
}

interface TaskListProps {
	tasks: Task[]
}

export default function TaskList({ tasks }: TaskListProps) {
	if (tasks.length === 0) {
		return (
			<div className='border border-border bg-primary-foreground p-8 text-center'>
				<p className='text-sm text-muted-foreground'>No open tasks right now. Check back soon!</p>
			</div>
		)
	}

	return (
		<div className='divide-y divide-border border border-border bg-primary-foreground'>
			{tasks.map((task) => {
				const isOpen = task.status === 'open'
				const isClaimed = task.status === 'claimed' || task.status === 'in-review'
				
				return (
					<div key={task.id} className='flex items-start justify-between gap-4 p-4 transition hover:bg-muted/20'>
						{/* Left: Title + Tags */}
						<div className='min-w-0 flex-1 space-y-2'>
							<div className='flex items-start gap-2'>
								<span className='text-sm text-muted-foreground'>#{task.id}</span>
								<span className='text-sm font-medium text-foreground'>{task.title}</span>
							</div>
							
							{/* Tags row */}
							<div className='flex flex-wrap items-center gap-1.5'>
								{task.isGoodFirstIssue && (
									<span className='inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:text-purple-300'>
										<Sparkles className='h-3 w-3' />Good First
									</span>
								)}
								{task.estimatedHours && (
									<span className='inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-500/20 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-300'>
										<Clock className='h-3 w-3' />{task.estimatedHours}h
									</span>
								)}
								{task.category.map((cat) => (
									<span key={cat} className={`px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_STYLES[cat]}`}>{cat}</span>
								))}
								{task.skills?.map((skill) => {
									const style = SKILL_STYLES[skill] || { label: skill, color: 'bg-gray-100 text-gray-600' }
									return <span key={skill} className={`px-2 py-0.5 text-[10px] font-medium ${style.color}`}>{style.label}</span>
								})}
							</div>
						</div>

						{/* Right: Status + Assignee + Link */}
						<div className='flex shrink-0 items-center gap-4 text-right'>
							{/* Assignee or Open status */}
							<div className='text-xs'>
								{isClaimed && task.assignees?.length ? (
									<span className='text-muted-foreground'>{task.assignees[0].name}</span>
								) : isOpen ? (
									<span className='font-medium text-emerald-600 dark:text-emerald-400'>Open</span>
								) : (
									<span className='text-amber-600 dark:text-amber-400'>{task.status}</span>
								)}
							</div>
							
							{/* GitHub link */}
							<a 
								href={task.githubUrl} 
								target='_blank' 
								rel='noreferrer'
								className='inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground'
							>
								<ExternalLink className='h-3.5 w-3.5' />
							</a>
						</div>
					</div>
				)
			})}
		</div>
	)
}
