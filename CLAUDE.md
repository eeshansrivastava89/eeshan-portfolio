# CLAUDE.md — Claude's Memory for datascienceapps

> **This is my memory file.** It loads automatically at conversation start. If context feels stale or you're starting a major task, ask me to "refresh memory" and I'll:
> 1. Re-scan `docs/ARCHITECTURE.md`, `docs/CONTRIBUTING.md`, `internal/docs/ACTIVE_WORK.md`
> 2. Check `gh issue list --state open` for current work
> 3. Review `git log --oneline -20` for recent changes
> 4. Explore the codebase structure with `tree -L 3`
> 5. Read key source files (projectLoader.ts, projects.ts, schema files)
>
> **Codebase is source of truth over docs** — always verify against actual implementation.

---

## 🏗️ Architecture Overview

**Static-first monorepo** with React islands for interactivity. Three-layer structure:

| Layer | Location | Purpose |
|-------|----------|---------|
| **Shared** | `packages/shared/` | Layouts, components, utilities (`@eeshans/shared`) |
| **Portfolio Site** | `src/` | Main site: `/`, `/about`, `/writing`, `/projects`, `/contribute` |
| **App Packages** | `packages/{app}/` | Standalone apps like `/ab-simulator/` |

**Tech stack:** Astro 4.x, React 19, Tailwind CSS, TypeScript, pnpm workspaces

**Key files:**
- `packages/shared/src/data/projectLoader.ts` — Aggregates project YAMLs via `getAllProjects()`, `getProjectById()`
- `packages/shared/src/lib/projects.ts` — Project types, status helpers
- `src/layouts/ProjectHubLayout.astro` — Reusable hub page template
- `scripts/create-package.mjs` — Scaffolds new apps with templates from `scripts/templates/`

---

## 📊 Data Pipeline (No Backend!)

```
User → PostHog SDK → Cloudflare Worker → PostHog Cloud
                                              ↓
                     ┌──────────────────┬─────┴─────┐
                     │ Batch (hourly)   │ Webhook   │
                     │ posthog_batch_   │ posthog_  │
                     │ events           │ events    │
                     └────────┬─────────┴─────┬─────┘
                              ↓               ↓
                         SQL Views + RPCs (PostgREST API)
                              ↓
                         React Islands + Plotly Charts
```

**Two data paths:**
- **Batch** (hourly): General analytics → `posthog_batch_events`
- **Webhook** (real-time): App-specific events → `posthog_events` (for leaderboards, live stats)

**Key principle:** No backend code. SQL views + PostgREST = instant API.

---

## 🎮 Current Live Project: A/B Simulator

**Location:** `packages/ab-simulator/`

**Game logic** (vanilla ES6 modules in `public/js/ab-sim/`):
- `core.js` — State machine: IDLE → MEMORIZE → HUNT → RESULT
- `analytics.js` — PostHog events + feature flags
- `supabase-api.js` — PostgREST calls (leaderboard, variantOverview, etc.)
- `dashboard.js` — Plotly charts with adaptive polling

**A/B Test:** PostHog feature flag `memory-game-difficulty` (3 vs 4 pineapples)

---

## 🗄️ Database Schema

**Tables:**
| Table | Purpose |
|-------|---------|
| `posthog_batch_events` | Hourly batch export (pageviews, all events) |
| `posthog_events` | Real-time webhook (game events) with generated columns for `variant`, `completion_time_seconds` |
| `likes` | Page likes with distinct_id |
| `analytics_run_log` | Notebook execution logs |

**Key Views:** `v_project_engagement_stats`, `v_variant_overview`, `v_conversion_funnel`, `v_ab_completions_geo`

**Key RPCs:** `leaderboard()`, `variant_overview()`, `project_engagement_stats()`, `recent_completions()`, `ab_completions_geo()`

**Schema reference:** `internal/supabase-schema-live.sql`

---

## 🚀 CI/CD

**Single workflow:** `.github/workflows/build-and-deploy.yml`

1. Runs notebooks (every 4 hours) → publishes HTML/YAML to `public/analysis/`
2. Builds Astro site
3. Deploys to Fly.io

**Trigger:** Push to main, schedule (every 4 hours), or manual dispatch.

---

## 🧭 Working Philosophy

1. **Fix root causes, not symptoms** — Research deeply before claiming to understand
2. **Chunk-based delivery** — Complete small, verifiable pieces. Ask before proceeding
3. **Show the work** — Explain briefly and ask for permission before acting
4. **Don't do workarounds** — If stuck, ask the user for help
5. **Brutalize scope** — Remove features/configs/dependencies that don't earn their weight
6. **Enterprise mindset** — Defensible decisions, no toy code
7. **Tools over custom code** — Prefer PostHog, Tailwind, Supabase
8. **Test thoroughly** — Build locally, verify production-like behavior
9. **Commit small, clear changes** — One logical fix per commit
10. **Code inspection over assumptions** — Read actual files/output, don't guess
11. **End-of-task metric** — Calculate % of lines added/removed
12. **No "claude" in commit messages**

---

## 🔧 Adding New Apps

```bash
node scripts/create-package.mjs my-app "My App" "Short description"
```

**Creates:**
- `packages/my-app/` — Full Astro package
- `src/pages/projects/my-app.astro` — Hub page using ProjectHubLayout
- `packages/shared/src/data/projects/my-app.yaml` — Project metadata
- `analytics/notebooks/my-app/` — Sample notebook
- `src/content/post/my-app-getting-started.md` — Sample post

**Convention:**
- Hub page: `/projects/{id}`
- App: `/{id}/`


---

*Last refreshed: December 2025*
