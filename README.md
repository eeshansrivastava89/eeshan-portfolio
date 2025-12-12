# eeshans.com — Full Stack Data Scientist Portfolio

Personal portfolio site with interactive data science projects, built end-to-end with AI assistance.

**Live:** [eeshans.com](https://eeshans.com)

## What's Here

- **Portfolio site** — About, projects, writing, contribution guide
- **A/B Simulator** — Interactive memory game with real A/B testing, live stats, and full analysis pipeline
- **Analytics pipeline** — PostHog → Supabase → live dashboards
- **Analysis notebooks** — Publication-quality Jupyter notebooks rendered as HTML

## Stack

| Layer | Tech | Why |
|-------|------|-----|
| Framework | Astro 4.x | Static-first, React islands for interactivity |
| Styling | Tailwind CSS | Utility-first, dark mode, Playfair + Lato typography |
| Islands | React 19 | Interactive components (stats, game, comments) |
| Analytics | PostHog | Events, session replay, feature flags |
| Database | Supabase (Postgres) | Views, PostgREST API, edge functions |
| Hosting | Cloudflare Pages | Fast, free, global CDN |
| Proxy | Cloudflare Worker | PostHog reverse proxy (bypass blockers) |
| Monorepo | pnpm workspaces | Shared components across packages |

## Project Structure

```
ds-apps-main/
├── src/                      # Main site
│   ├── pages/               # Routes (index, about, projects, writing, contribute)
│   ├── content/post/        # MDX blog posts
│   ├── components/          # Site-specific components
│   ├── data/                # YAML data (timeline, social links)
│   └── styles/              # Global CSS (Tailwind + fonts)
├── packages/
│   ├── ab-simulator/        # Standalone A/B testing game
│   └── shared/              # Shared components, utils, projects.yaml
├── analytics/
│   └── notebooks/           # Jupyter analysis notebooks
├── internal/                # Cloudflare worker, Supabase schema
├── docs/                    # Project planning docs
└── public/                  # Static assets
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Create .env with required keys
cp .env.example .env
# Edit .env with your Supabase/PostHog keys

# Run dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

**Environment variables:**
- `PUBLIC_SUPABASE_URL` — Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (safe for client)
- `PUBLIC_POSTHOG_KEY` — PostHog project key
- `PUBLIC_POSTHOG_HOST` — PostHog host (or proxy URL)

## Key Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, projects, newsletter |
| `/about` | Bio, experience timeline, stack |
| `/projects` | Project index with live stats |
| `/projects/ab-simulator` | A/B Simulator hub with analysis |
| `/ab-simulator` | The actual game (embedded from package) |
| `/writing` | Blog posts (technical + essays) |
| `/contribute` | Build with me — how to follow along |

## Analytics Pipeline

```
User Action → PostHog SDK → Cloudflare Worker (proxy) → PostHog Cloud
                                                            ↓
                                                      Batch Export
                                                            ↓
Supabase Edge Function ← Webhook ← PostHog
        ↓
   PostgreSQL (posthog_events, posthog_batch_events)
        ↓
   Views (v_ab_simulator_stats, v_page_views)
        ↓
   PostgREST API → React islands → Live stats
```

## Development

```bash
# Main site
pnpm dev

# A/B Simulator package only
pnpm dev:ab-sim

# Lint and format
pnpm lint

# Type check
pnpm build:check
```

## Deployment

**Cloudflare Pages** (automatic on push to main via GitHub integration)

For manual Fly.io deployment:
```bash
fly deploy \
    --build-arg PUBLIC_SUPABASE_URL=... \
    --build-arg PUBLIC_SUPABASE_ANON_KEY=... \
    --build-arg PUBLIC_POSTHOG_KEY=...
```

## Analysis Notebooks

Jupyter notebooks in `analytics/notebooks/` are auto-executed via GitHub Actions and rendered as HTML:

- `ab_dashboard_health.ipynb` — Dashboard monitoring
- Full A/B test analysis at `/projects/ab-simulator/analysis/ab-test-analysis`

## License

MIT
