// Fix lucide-react type compatibility with React 19
// lucide-react bundles types for React 18, causing JSX component errors
// This override allows the icons to work correctly with React 19
declare module 'lucide-react' {
	import { FC, SVGProps } from 'react'
	
	export interface LucideProps extends SVGProps<SVGSVGElement> {
		size?: string | number
		strokeWidth?: string | number
		absoluteStrokeWidth?: boolean
	}
	
	export type LucideIcon = FC<LucideProps>
	
	export const AlertCircle: LucideIcon
	export const ArrowUpDown: LucideIcon
	export const CheckCircle: LucideIcon
	export const ChevronDown: LucideIcon
	export const ChevronLeft: LucideIcon
	export const ChevronRight: LucideIcon
	export const ChevronUp: LucideIcon
	export const CircleDot: LucideIcon
	export const Clock: LucideIcon
	export const ExternalLink: LucideIcon
	export const Filter: LucideIcon
	export const Flame: LucideIcon
	export const GitFork: LucideIcon
	export const GitMerge: LucideIcon
	export const GitPullRequest: LucideIcon
	export const Play: LucideIcon
	export const RefreshCw: LucideIcon
	export const Search: LucideIcon
	export const Sparkles: LucideIcon
	export const UserPlus: LucideIcon
	export const Users: LucideIcon
	export const X: LucideIcon
}
