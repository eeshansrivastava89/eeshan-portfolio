// Plain JS version for Node scripts (fetch-data.mjs)
// Keep in sync with build-with-me-config.ts

export const CATEGORY_STYLES = {
	frontend: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30',
	backend: 'bg-amber-100 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-400/30',
	analytics: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-500/30',
	wiring: 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-500/30',
	docs: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
}

export const STATUS_STYLES = {
	open: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30',
	claimed: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30',
	'in-review': 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-500/30',
	merged: 'bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-500/40'
}

export const LABEL_CATEGORY_MAP = {
	'cat:frontend': 'frontend',
	'cat:backend': 'backend',
	'cat:analytics': 'analytics',
	'cat:wiring': 'wiring',
	'cat:docs': 'docs'
}

export const LABEL_DIFFICULTY_MAP = {
	'diff:easy': 'easy',
	'diff:medium': 'medium',
	'diff:hard': 'hard'
}

export const POINTS_PREFIX = 'points:'

export const LABEL_PROJECT_MAP = {
	'project:ab-sim': 'ab-sim',
	'project:basketball': 'basketball'
}

export const PROJECT_METADATA = {
	'ab-sim': {
		name: 'A/B Simulator',
		path: '/ab-simulator'
	},
	basketball: {
		name: 'Basketball Analyzer',
		path: '/basketball'
	}
}

export function getProjectName(slug) {
	return PROJECT_METADATA[slug]?.name ?? slug
}

export function getProjectPath(slug) {
	return PROJECT_METADATA[slug]?.path ?? `/${slug}`
}
