# Audit Log

## 1) Audit Protocol (Codex)
- Purpose: periodic, read-only architectural audit; no code changes.
- Scope: base site `src/`, app packages `packages/*`, shared/DRY `packages/shared` + `scripts`, CI workflows.
- Source of truth: code over docs.
- Steps:
  1) Inventory files with `rg --files` for base/app/shared/scripts/workflows.
  2) Read key layouts, pages, libs, and content loaders in base site.
  3) Read app page + client JS modules for gameplay/analytics/data flow.
  4) Read shared components/layouts/data schemas + scaffolding templates/scripts.
  5) Compare to stated vision/positioning.
  6) Output a prioritized report (High/Medium/Low) with file refs, then recommendations + required user input.
- Starting prompt template:
  "Run a full audit of the codebase in three dimensions (base site, app package(s), shared/DRY). Read-only. Produce a report vs vision/positioning, list risks/bloat, and recommend actions + required user input. Document in docs/audit_log.md."
- Output format:
  - Vision alignment summary
  - Findings by severity (with file refs)
  - Cleanup roadmap (ordered)
  - Recommendations
  - Requires user input

## 2) Implementation Protocol (Claude)
- Read the latest audit entry and create a chunked plan.
- Ask the user before each chunk; keep changes non-breaking.
- Do not push or amend commits unless explicitly asked.
- Clarify all "Requires user input" items before edits.
- Update docs only when requested.

## 3) Standing Policy Addenda

### Framework Decision
- Decision: stay on Astro. The core issues are architectural drift and scaffolding hygiene, not framework choice.
- Rationale: static-first content pipeline + React islands fit the portfolio/analysis flywheel, keep deploys simple, and align with the PostHog/Supabase no-backend model.
- Migration triggers (revisit if these become true):
  - Site becomes server-heavy (auth, personalized data, server actions, streaming SSR).
  - App packages evolve into full products with deep shared runtime/state needs.
  - You need a single full-stack runtime to replace the static base.

### UI System Policy
- Decision: adopt shadcn only for React islands (interactive widgets); keep Astro components for static layout/content.
- Scope for shadcn: tables, filters, modals, dropdowns, dashboards, any React-only interactive surfaces.
- Scope for Astro: header/footer, page layouts, project cards, writing pages, static sections.
- Design consistency: align CSS variables/tokens so Astro + shadcn share the same visual system.

## 4) 2025-12-23 Audit (Codex)

### Scope
- Base site: `src/` pages, components, layouts, libs.
- App: `packages/ab-simulator` Astro page + JS modules.
- Shared/DRY: `packages/shared` components/layouts/data + `scripts` templates.
- CI: `.github/workflows`.

### Vision Alignment Summary
- Strong: two-part architecture (base + apps), no-backend analytics pipeline, unified analysis index.
- Drift: residual hub-page concept, duplicated layout shells, version drift, stale shared exports, brittle cross-package imports.

### Findings (ordered)
High
1) Hub page concept persists in scaffolding and data; new apps will ship broken links.
   - `scripts/create-package.mjs`, `scripts/delete-package.mjs`, `scripts/templates/project.yaml.template`, `packages/shared/src/data/projects.schema.json`, `packages/shared/src/data/projects/ab-simulator.yaml`
2) Shared package exports reference non-existent files; will break consumers and signals stale architecture.
   - `packages/shared/package.json`
3) Cross-package imports use deep relative paths and a reverse dependency (shared imports base), making refactors brittle.
   - `src/pages/*` imports from `packages/shared/src/*`
   - `packages/ab-simulator/src/pages/index.astro`
   - `packages/shared/src/components/layout/Header.astro` importing from `src/components/*`

Medium
4) Layout + analytics boilerplate duplicated between base and shared shells; drift risk for nav/branding/analytics updates.
   - `src/layouts/BaseLayout.astro`, `packages/shared/src/layouts/SiteLayout.astro`, `src/components/layout/Header.astro`, `packages/shared/src/components/layout/Header.astro`, `src/components/layout/Footer.astro`, `packages/shared/src/components/layout/Footer.astro`, `src/components/BaseHead.astro`
5) Related content is injected by `AppLayout` but ab-sim also hard-codes related sections; duplicates and rule conflicts.
   - `packages/shared/src/layouts/AppLayout.astro`, `packages/shared/src/components/RelatedContent.astro`, `packages/ab-simulator/src/pages/index.astro`
6) Version drift across root/app/scaffold (Astro 4 vs 5; React 18 in scaffold vs 19 in root) increases maintenance friction.
   - `package.json`, `packages/ab-simulator/package.json`, `scripts/create-package.mjs`

Low
7) Shared notebook loader assumes `/public/analysis` exists inside app builds; may silently hide content for standalone app builds.
   - `packages/shared/src/lib/content-loader.ts`
8) Likes only capture a PostHog event; persistence path is unclear if not backed by an RPC or ingestion rule.
   - `src/components/LikeButton.astro`
9) Unused or stale config adds noise.
   - `src/site.config.ts`, `packages/shared/src/data/projects.schema.json`

### Cleanup Roadmap (ordered)
1) Fix package boundaries and imports
   - Make `packages/shared` a real API surface (exports + aliases).
   - Remove deep relative imports; stop shared → base imports.
2) Remove hub-page legacy
   - Drop `hubUrl` from schema/data/templates and adjust scaffolding.
3) Resolve RelatedContent ownership
   - Pick one: AppLayout auto-injects vs app pages own it.
4) Consolidate layout shells
   - Reduce duplication between base and shared layout/head/nav/footer.
5) Align dependency versions
   - Keep Astro/React/Tailwind versions consistent across root/app/scaffold.
6) Optional fixes
   - Clarify likes persistence path; harden notebook loading for app builds.

### Recommendations
- Decommission the hub concept: remove `hubUrl` from project schema/data/templates and update scaffolding to avoid dead links.
- Fix shared exports to match actual files (or reintroduce missing modules).
- Introduce aliases (`@eeshans/shared/*` or `@shared/*`) and migrate imports away from `../../..`.
- Decide on a single layout source of truth to reduce drift.
- Decide whether `RelatedContent` lives in `AppLayout` or app pages (pick one).
- Align dependency versions across root/app/scaffold.

### Requires User Input (before Claude implements)
- Breadcrumb model for notebook detail pages (Analysis-only vs Analysis + Project).
- Whether `RelatedContent` is auto-injected by `AppLayout` or opt-in per app.
- Whether to consolidate layout shells (base + app) into one shared shell.
- Alias strategy for shared imports (`@eeshans/shared/*` vs `@shared/*`).
- Intended likes behavior (persist via RPC vs event-only).
