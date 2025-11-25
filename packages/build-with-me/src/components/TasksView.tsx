import { useState, useEffect } from 'react'
import { Sparkles, Clock, CircleDot, RefreshCw } from 'lucide-react'
import TasksTable from './TasksTable'
import SearchBar from './SearchBar'
import FilterPanel from './FilterPanel'
import { refreshGitHubData } from '../lib/github-refresh'
import type { Task } from '../lib/validate-build-with-me'
import type { Category, Status } from '../data/build-with-me-config'

interface TasksViewProps {
	tasks: Task[]
}

type QuickFilter = 'good-first-issue' | 'quick' | 'open-only'

const QUICK_FILTERS: { id: QuickFilter; label: string; icon: typeof Sparkles }[] = [
	{ id: 'good-first-issue', label: 'Good First Issue', icon: Sparkles },
	{ id: 'quick', label: '1-2 hours', icon: Clock },
	{ id: 'open-only', label: 'Open only', icon: CircleDot },
]

export default function TasksView({ tasks: initialTasks }: TasksViewProps) {
	const [tasks, setTasks] = useState<Task[]>(initialTasks)
	const [searchFilteredTasks, setSearchFilteredTasks] = useState<Task[]>(initialTasks)
	const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
	const [selectedStatuses, setSelectedStatuses] = useState<Status[]>([])
	const [quickFilters, setQuickFilters] = useState<Set<QuickFilter>>(new Set())
	const [finalTasks, setFinalTasks] = useState<Task[]>(initialTasks)
	const [isRefreshing, setIsRefreshing] = useState(false)

	const handleRefresh = async () => {
		setIsRefreshing(true)
		try {
			const data = await refreshGitHubData()
			setTasks(data.tasks)
			setSearchFilteredTasks(data.tasks)
		} catch (e) {
			console.error('Refresh failed:', e)
		} finally {
			setIsRefreshing(false)
		}
	}

	const toggleQuickFilter = (filter: QuickFilter) => {
		setQuickFilters((prev) => {
			const next = new Set(prev)
			if (next.has(filter)) {
				next.delete(filter)
			} else {
				next.add(filter)
			}
			return next
		})
	}

	useEffect(() => {
		let filtered = searchFilteredTasks

		// Apply category filter
		if (selectedCategories.length > 0) {
			filtered = filtered.filter((task) =>
				task.category.some((cat) => selectedCategories.includes(cat))
			)
		}

		// Apply status filter
		if (selectedStatuses.length > 0) {
			filtered = filtered.filter((task) => selectedStatuses.includes(task.status))
		}

		// Apply quick filters
		if (quickFilters.has('good-first-issue')) {
			filtered = filtered.filter((task) => task.isGoodFirstIssue)
		}
		if (quickFilters.has('quick')) {
			filtered = filtered.filter((task) => task.estimatedHours === '1-2')
		}
		if (quickFilters.has('open-only')) {
			filtered = filtered.filter((task) => task.status === 'open')
		}

		setFinalTasks(filtered)
	}, [searchFilteredTasks, selectedCategories, selectedStatuses, quickFilters])

	return (
		<div className='space-y-4'>
			<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
				<div className='flex-1'>
					<SearchBar tasks={tasks} onFilteredTasks={setSearchFilteredTasks} />
				</div>
				<FilterPanel
					selectedCategories={selectedCategories}
					selectedStatuses={selectedStatuses}
					onCategoryChange={setSelectedCategories}
					onStatusChange={setSelectedStatuses}
				/>
			</div>
			{/* Quick filter pills */}
			<div className='flex flex-wrap items-center gap-2'>
				<span className='text-xs font-medium text-muted-foreground'>Quick filters:</span>
				{QUICK_FILTERS.map(({ id, label, icon: Icon }) => {
					const isActive = quickFilters.has(id)
					return (
						<button
							key={id}
							onClick={() => toggleQuickFilter(id)}
							className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
								isActive
									? 'bg-orange-500 text-white'
									: 'border border-border bg-muted/50 text-muted-foreground hover:border-orange-500/50 hover:text-foreground'
							}`}
						>
							<Icon className='h-3 w-3' />
							{label}
						</button>
					)
				})}
				{quickFilters.size > 0 && (
					<button
						onClick={() => setQuickFilters(new Set())}
						className='text-xs text-muted-foreground hover:text-foreground'
					>
						Clear
					</button>
				)}
				{/* Refresh button */}
				<div className='ml-auto'>
					<button
						onClick={handleRefresh}
						disabled={isRefreshing}
						className='inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-600 disabled:opacity-50'
					>
						<RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
						{isRefreshing ? 'Refreshing...' : 'Refresh'}
					</button>
				</div>
			</div>
			<TasksTable tasks={finalTasks} />
		</div>
	)
}
