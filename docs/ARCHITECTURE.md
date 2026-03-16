# Architecture

> Current technical architecture of eeshans.com

---

## Overview

A **static Astro site** serving as a portfolio and content hub. Projects live in their own repos. Writing is mirrored from Substack. GitHub activity is surfaced via API.

```
User → Astro (static HTML) → React islands (interactivity)
     → PostHog (events) → Supabase (storage) → PostgREST (API)
```

---

## Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Astro 5 | Static-first SSG, React islands |
| **Styling** | Tailwind CSS 3.4 | Utility-first, dark mode |
| **Analytics** | PostHog | Events, feature flags |
| **Database** | Supabase (PostgreSQL) | Storage, views, RPCs |
| **API** | PostgREST | Auto-generated REST from schema |
| **Hosting** | Fly.io | Docker, nginx static serving |
| **CI/CD** | GitHub Actions | Build and deploy |

---

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Home (writing, projects, open source, about) |
| `/projects` | Project listing |
| `/analysis` | Analysis index |
| `/projects/{id}/analysis/{notebookId}` | Pre-rendered notebook pages |

---

## Project Structure

```
datascienceapps/
├── src/
│   ├── pages/                    # Routes
│   ├── components/               # All UI components
│   ├── lib/                      # Substack RSS, GitHub API, project loader
│   ├── data/
│   │   └── projects/             # One YAML file per project
│   └── styles/                   # Tailwind + theme CSS
├── .cache/                       # Build-time API response cache
├── public/
│   ├── images/                   # Project thumbnails
│   └── analysis/                 # Pre-rendered notebook HTML + YAML
├── packages/
│   └── ab-simulator/             # Quarantined — pending migration to own repo
└── docs/                         # Public documentation
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
└── Webhook (real-time) → app-specific tables
    ↓
SQL Views + RPCs
    ↓
PostgREST API
    ↓
React Islands
```

---

## Database Schema

### Shared Tables

| Table | Purpose |
|-------|---------|
| `posthog_batch_events` | All events (hourly batch) |

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
5. **Build-time data** — Substack RSS and GitHub API fetched at build with cached fallback

---

*Last updated: March 2026*
