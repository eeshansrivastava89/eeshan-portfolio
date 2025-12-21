# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm dev              # Start dev server on port 3000
pnpm build            # Full production build (packages + main site)
pnpm lint             # Prettier + ESLint fix
pnpm preview          # Preview production build locally

# Package-specific
pnpm dev:ab-sim       # Dev server for ab-simulator only
pnpm --filter @eeshans/shared build
pnpm --filter @eeshans/ab-simulator dev

# Create new app package
node scripts/create-package.mjs <name> "<Display Name>" "<Description>"

# Run notebooks locally
node scripts/run-notebook.mjs              # Run all notebooks
node scripts/run-notebook.mjs ab-simulator # Run specific folder
node scripts/run-notebook.mjs --list       # List available notebooks
```

## Architecture Overview

**Monorepo structure with three layers:**

1. **`packages/shared/`** — Shared layouts, components, utilities (import via `@eeshans/shared`)
2. **`src/`** — Main portfolio site (routes: `/`, `/about`, `/writing`, `/projects`, `/contribute`)
3. **`packages/{app-name}/`** — Standalone apps with own routes (e.g., `/ab-simulator/`)

**Tech stack:** Astro 4.4 (static-first), React 19 (islands), Tailwind CSS, TypeScript, pnpm workspaces

**Data pipeline:** PostHog → Cloudflare Worker proxy → Supabase PostgreSQL → PostgREST API → React islands

## Key Patterns

### Project Data Model (DRY)
Each project has three linked parts:
- **App:** Route at `/{projectId}/` (interactive app in `packages/{projectId}/`)
- **Hub page:** Route at `/projects/{projectId}/` (overview, analysis links)
- **Metadata:** `packages/shared/src/data/projects/{projectId}.yaml`

Project data auto-loads via `projectLoader.ts` with `getAllProjects()` and `getProjectById(id)`.

### Notebook → Astro Data Contract
- Notebooks write YAML to `public/analysis/{projectId}/{notebookId}.yaml`
- Astro reads at build time via shared `NotebookSummary` component
- Use `analytics/lib/summary.py` → `write_notebook_summary()` in notebook final cells

### Two Analytics Pipelines
- **Batch (hourly):** All events in `posthog_batch_events` table
- **Webhook (real-time):** App-specific events in `posthog_events` table

Views and RPCs expose aggregated data via PostgREST. Frontend calls `/rest/v1/rpc/{function_name}`.

### Deployment
- Docker multi-stage build (Node → Nginx)
- Auto-deploy via GitHub Actions on push to main
- Jupyter notebooks auto-run weekly and publish to `/analysis/{projectId}/`

## Working Philosophy

- **Fix root causes, not symptoms** — Research docs/code deeply before claiming to understand a problem
- **Chunk-based delivery** — Complete small, verifiable pieces. Ask user before proceeding to next chunk
- **Show the work** — Explain briefly and ask for permission before acting, even in agent mode
- **Don't do workarounds by default** — If stuck, ask the user for help
- **Brutalize scope** — Remove features/configs/dependencies that don't earn their weight. Prefer simplicity over completeness
- **Enterprise mindset** — Every decision should be defensible in a real company context. No toy code
- **Tools over custom code** — Prefer established tools (PostHog, Tailwind) over rolling custom solutions
- **Test thoroughly before shipping** — Build locally, test all features, verify production-like behavior
- **Commit small, clear changes** — One logical fix per commit. Descriptive messages. Easy to review and rollback
- **Code inspection over assumptions** — Read actual files/output. Don't guess about behavior
- **Brutally minimal documentation** — Don't create new md files unless asked for
- **End of task metric** — Calculate precise % of lines added/removed

## Claude should think about the full app structure when making changes

- **Think like a new contributor** — Every change should consider: "If someone runs `create-package.mjs` tomorrow, will they get this pattern for free?"
- **DRY is non-negotiable** — Before writing new code, ask: Can this be reused? Should it live in `packages/shared/`? Is there an existing pattern?
- **Propagate dependencies systematically** — When adding new functionality:
  1. `analytics/requirements.txt` for Python deps
  2. `package.json` for JS deps
  3. `scripts/create-package.mjs` — does the generated package need this?
  4. `scripts/templates/` — do templates need updating to use the new pattern?

## Component Placement

- **`packages/shared/src/components/`** — Reusable across projects (Breadcrumbs, ProjectCard, NotebookSummary)
- **`src/components/`** — Site-specific, only used by the main Astro site

## Code Patterns

- **Check existing patterns first** — Before creating a new component, read similar existing ones to understand available utilities and conventions
- **Test the full pipeline early** — Don't assume code works. Run `pnpm build`, check actual output, verify in browser
- **Astro build-time data** — Use `fs.readFileSync` + `js-yaml` for build-time data loading, not dynamic `import()`

## User's Workflow

1. Ideate with the AI assistant on UX, backend, frontend, data science
2. Think through architecture before planning todos
3. Plan out and document the todos and tasks in one of the existing md files or ask user
4. As much as possible, use existing coding patterns and existing DRY patterns
5. Create GitHub issues for these tasks — ask user first
6. Execute tasks
7. Verify locally and approach chunk by chunk
8. Commit & push + close out GitHub issues — ask user first
9. do not add anything about "claude" in commit messages
