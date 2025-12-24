import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'

// Substack icon SVG
const SubstackIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
  </svg>
)

export function SubscribeDialog() {
  const [email, setEmail] = React.useState('')
  const [open, setOpen] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      window.open(
        `https://0to1datascience.substack.com/subscribe?email=${encodeURIComponent(email)}`,
        '_blank'
      )
      setOpen(false)
      setEmail('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs sm:text-sm font-medium bg-[#FF6719] text-white rounded-full hover:bg-[#E55A15] transition-colors"
          aria-label="Subscribe to Newsletter"
        >
          <SubstackIcon className="h-3.5 w-3.5" />
          Subscribe
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF6719]/10">
            <SubstackIcon className="h-7 w-7 text-[#FF6719]" />
          </div>
          <DialogTitle className="text-xl">Follow along on Substack</DialogTitle>
          <DialogDescription className="text-base">
            Get updates on what works, what breaks, and what I'm learning building data science applications.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
            className="w-full px-4 py-3 text-sm border border-border bg-background text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6719]/30 focus:border-[#FF6719] transition-all"
            autoFocus
          />

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <button
              type="submit"
              className="w-full bg-[#FF6719] text-white hover:bg-[#E55A15] rounded-lg py-2.5 font-medium transition-colors"
            >
              Continue to Substack →
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Maybe later
            </button>
          </DialogFooter>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-2">
          One more click on Substack to confirm your subscription.
        </p>
      </DialogContent>
    </Dialog>
  )
}
