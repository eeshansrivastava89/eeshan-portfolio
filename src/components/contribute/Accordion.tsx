import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface AccordionProps {
	title: string
	children: ReactNode
	defaultOpen?: boolean
}

export default function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen)

	return (
		<div className='border border-border'>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-muted/50'
			>
				<span className='text-base font-semibold text-foreground'>{title}</span>
				<ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
			</button>
			{isOpen && (
				<div className='border-t border-border px-4 py-4'>
					{children}
				</div>
			)}
		</div>
	)
}
