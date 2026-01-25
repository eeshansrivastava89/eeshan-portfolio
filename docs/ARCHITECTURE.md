# Architecture

> Current technical architecture of eeshans.com

---

## Overview

A **static-first monorepo** serving a data science portfolio with interactive apps, production analytics, and automated analysis publishing.

```
User → Astro (static HTML) → React islands (interactivity)
     → PostHog (events) → Supabase (storage) → PostgREST (API)
     → Jupyter (analysis) → Published notebooks
```

---

## Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Astro 5.16 | Static-first SSG, React islands |
| **Styling** | Tailwind CSS 3.4 | Utility-first, dark mode |
| **Charts** | Apache ECharts | Bar, line, funnel (300KB) |
| **Maps** | Leaflet | Tile-based geo visualization |
| **Analytics** | PostHog | Events, feature flags, A/B tests |
| **Database** | Supabase (PostgreSQL) | Storage, views, RPCs |
| **API** | PostgREST | Auto-generated REST from schema |
| **Hosting** | Fly.io | Docker, global CDN |
| **CI/CD** | GitHub Actions | Build, notebooks, deploy |

---

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Home |
| `/about` | Bio, timeline, recognition |
| `/projects` | Project listing |
| `/analysis` | Unified notebooks + Substack posts |
| `/ab-simulator/` | A/B Testing Memory Game |
| `/projects/{id}/analysis/{notebookId}` | Notebook detail pages |

---

## Monorepo Structure

```
datascienceapps/
├── src/                          # Portfolio site
│   ├── pages/                    # Routes
│   ├── components/               # Site-specific components
│   ├── lib/                      # Utilities
│   └── data/                     # YAML data files
├── packages/
│   ├── shared/                   # Reusable across all apps
│   │   ├── components/           # ProjectCard, Timeline, etc.
│   │   ├── layouts/              # SiteLayout, AppLayout
│   │   ├── lib/                  # projects.ts, substack.ts
│   │   └── data/projects/        # Individual project YAMLs
│   └── ab-simulator/             # A/B Testing Memory Game
│       ├── src/pages/            # App routes
│       └── public/js/ab-sim/     # Game modules
├── analytics/notebooks/          # Jupyter notebooks by project
├── supabase/migrations/          # Database schema
├── scripts/                      # Build tooling
├── docs/                         # Public documentation
└── internal/docs/                # Internal documentation
```

---

## Data Flow

### Analytics Pipeline

```
User Actions
    ↓
PostHog SDK (client)
    ↓
Cloudflare Worker (proxy: api-v2.eeshans.com)
    ↓
PostHog Cloud
    ↓
Two paths:
├── Batch Export (hourly) → posthog_batch_events table
└── Webhook (real-time) → app-specific tables (e.g., posthog_events)
    ↓
SQL Views + RPCs
    ↓
PostgREST API
    ↓
React Islands + Charts
```

### Content Pipeline

```
Jupyter Notebooks (.ipynb)
    ↓
GitHub Actions (scheduled)
    ↓
Papermill execution
    ↓
HTML + YAML summary → public/analysis/{projectId}/
    ↓
Astro build (reads YAML at build time)
    ↓
/analysis page + notebook detail pages
```

---

## Database Schema

### Shared Tables

| Table | Purpose |
|-------|---------|
| `posthog_batch_events` | All events (hourly batch) |
| `analytics_run_log` | Notebook execution logs |

### A/B Simulator Tables

| Table | Purpose |
|-------|---------|
| `posthog_events` | Real-time game events (webhook) |

### Key Views

| View | Purpose |
|------|---------|
| `v_page_views` | Pageviews by path |
| `v_project_engagement_stats` | Per-project metrics |
| `v_variant_overview` | A/B test comparison |
| `v_conversion_funnel` | Game funnel metrics |

### Key RPCs

| Function | Purpose |
|----------|---------|
| `variant_overview()` | A/B stats + comparison |
| `leaderboard(variant, limit)` | Top scores |
| `completion_time_distribution()` | KDE data |

---

## Build & Deploy

```
Push to main
    ↓
GitHub Actions
    ↓
1. pnpm install (~30s)
2. Run notebooks (~60s)
3. Astro build (~10s)
4. Docker build + Fly.io deploy (~30s)
    ↓
Live at eeshans.com (~2 min total)
```

---

## Key Patterns

1. **Static-first** — Pre-render HTML, hydrate only where needed
2. **React islands** — Interactive components in static pages
3. **No backend** — SQL views + PostgREST instead of custom APIs
4. **Monorepo** — Shared package + isolated app packages
5. **Notebook → YAML → Web** — Analysis outputs become site content

---

## Related Documentation

- `internal/docs/PROJECT_HISTORY.md` — Narrative timeline of major decisions
- `internal/docs/IMPLEMENTATION_ARCHIVE.md` — Detailed implementation notes
- `internal/docs/ACTIVE_WORK.md` — Current work items

---

*Last updated: January 2026*
