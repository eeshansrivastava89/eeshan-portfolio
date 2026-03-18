# Architecture

> Current technical architecture of eeshans.com

---

## Overview

A **static Astro site** serving as a portfolio and content hub. Projects live in their own repos with their own hosting. Writing is mirrored from Substack. GitHub activity is surfaced via GraphQL API.

```
User → Astro (static HTML) → React islands (interactivity)
     → PostHog (events) → Supabase (storage) → PostgREST (API)
```

---

## Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Astro 5 | Static-first SSG, React islands |
| **Styling** | Tailwind CSS 3.4 | 6-theme system (Coffee/Catppuccin/Classic × light/dark) |
| **Analytics** | PostHog | Events, feature flags, proxied via Cloudflare Worker |
| **Database** | Supabase (PostgreSQL) | Storage, views, RPCs |
| **API** | PostgREST | Auto-generated REST from schema |
| **Hosting** | Fly.io | Docker, nginx static serving |
| **CI/CD** | GitHub Actions | Build and deploy |

---

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Home (writing, projects, open source, analysis, about) |
| `/projects` | Project listing |
| `/writing` | Substack articles rendered on-site |
| `/writing/[slug]` | Individual article with TOC sidebar |
| `/analysis` | Published notebooks index |
| `/about` | Bio and recognition |
| `/ab-simulator/` | 301 redirect to absim.eeshans.com |

---

## Project Structure

```
datascienceapps/
├── src/
│   ├── pages/                    # Routes
│   ├── components/               # All UI components
│   ├── lib/                      # Substack RSS, GitHub GraphQL, project loader
│   ├── data/
│   │   └── projects/             # One YAML file per project
│   └── styles/                   # Tailwind + theme CSS variables
├── .cache/                       # Build-time API response cache
├── public/
│   ├── images/                   # Project thumbnails
│   └── analysis/                 # Pre-rendered notebook HTML + YAML
└── docs/                         # Public documentation
```

Projects are standalone repos with their own hosting:
- **ab-simulator** → [absim.eeshans.com](https://absim.eeshans.com) ([repo](https://github.com/eeshansrivastava89/ab-simulator))
- **howiprompt** → [howiprompt.eeshans.com](https://howiprompt.eeshans.com) ([repo](https://github.com/eeshansrivastava89/howiprompt))
- **local-llm-bench** → [GitHub Pages](https://eeshansrivastava89.github.io/local-llm-bench/) ([repo](https://github.com/eeshansrivastava89/local-llm-bench))

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
└── Webhook (real-time) → app-specific tables
    ↓
SQL Views + RPCs
    ↓
PostgREST API
    ↓
Client-side fetch / React Islands
```

---

## Database Schema

### Shared Tables

| Table | Purpose |
|-------|---------|
| `posthog_batch_events` | All events (hourly batch) |
| `ab_simulator_summary` | Experiment snapshots (appended every 2h by notebook) |

### Key Views

| View | Purpose |
|------|---------|
| `v_page_views` | Pageviews by path |
| `v_project_engagement_stats` | Per-project metrics |

---

## Build & Deploy

```
Push to main
    ↓
GitHub Actions
    ↓
1. pnpm install
2. astro build
3. Docker build + Fly.io deploy
    ↓
Live at eeshans.com
```

---

## Key Patterns

1. **Static-first** — Pre-render HTML, hydrate only where needed
2. **React islands** — Interactive components in static pages
3. **No backend** — SQL views + PostgREST instead of custom APIs
4. **Aggregator model** — Projects live in own repos, portfolio points to them via YAML
5. **Build-time data** — Substack RSS and GitHub GraphQL fetched at build with cached fallback
6. **System-aware theming** — Defaults to system preference, remembers user's manual choice

---

*Last updated: March 2026*
