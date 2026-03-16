import { useState, useEffect } from 'react'

interface CommitEvent {
  repo: string
  message: string
  time: string
}

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export default function CommitFeed() {
  const [commits, setCommits] = useState<CommitEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('https://api.github.com/users/eeshansrivastava89/events?per_page=50')
      .then(res => {
        if (!res.ok) throw new Error(`${res.status}`)
        return res.json()
      })
      .then(events => {
        const pushEvents = events
          .filter((e: any) => e.type === 'PushEvent')
          .flatMap((e: any) =>
            (e.payload.commits || []).map((c: any) => ({
              repo: e.repo.name.replace('eeshansrivastava89/', ''),
              message: c.message.split('\n')[0],
              time: e.created_at,
            }))
          )
          .slice(0, 8)

        setCommits(pushEvents)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            style={{
              height: '32px',
              borderRadius: '6px',
              background: 'hsl(var(--muted))',
              animation: 'pulse 1.5s ease-in-out infinite',
              opacity: 1 - i * 0.15,
            }}
          />
        ))}
      </div>
    )
  }

  if (error || commits.length === 0) {
    return (
      <p style={{
        fontSize: '13px',
        color: 'hsl(var(--muted-foreground))',
        padding: '12px',
        textAlign: 'center',
      }}>
        {error ? 'Could not load recent commits.' : 'No recent commits.'}
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {commits.map((commit, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '16px',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'hsl(var(--muted))')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{
            color: 'hsl(var(--muted-foreground))',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            <span style={{ color: 'hsl(210 60% 60%)', fontWeight: 500 }}>
              {commit.repo}
            </span>
            {' · '}
            {commit.message}
          </div>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            color: 'hsl(var(--muted-foreground))',
            whiteSpace: 'nowrap',
          }}>
            {relativeTime(commit.time)}
          </span>
        </div>
      ))}
    </div>
  )
}
