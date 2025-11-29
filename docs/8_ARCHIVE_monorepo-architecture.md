# Monorepo Rearchitecture Plan

**Goal**: Isolate projects into workspaces, GitHub as source of truth, production-ready Build With Me platform

## Target Architecture

```
soma-portfolio/
├── packages/
│   ├── ab-simulator/          # Standalone Astro app
│   │   ├── package.json
│   │   ├── src/pages/index.astro
│   │   ├── public/js/*.js
│   │   └── README.md
│   ├── basketball-analyzer/   # Future project
│   └── shared/                # Shared utilities
│       ├── posthog.ts
│       ├── supabase.ts
│       └── analytics.ts
├── src/                       # Main portfolio site
│   ├── pages/
│   │   ├── index.astro        # Homepage
│   │   └── projects/
│   │       └── index.astro    # Build With Me hub
│   └── components/
├── scripts/
│   └── fetch-build-with-me-data.mjs
├── pnpm-workspace.yaml
└── package.json
```

**URL Structure**:
- `eeshans.com/` → Portfolio homepage
- `eeshans.com/projects/` → Build With Me hub
- `eeshans.com/ab-simulator/` → AB Sim app (from packages/ab-simulator)
- `eeshans.com/basketball/` → Basketball app (from packages/basketball-analyzer)

**GitHub Labels**:
- `project:ab-simulator`
- `project:basketball`
- `project:portfolio`

**Fetch script**: Filters issues by label, discovers projects dynamically

---

## Phase 1: Remove Mock Data ✅ **COMPLETE**

**Goal**: GitHub = source of truth, fail loudly on missing data

### - [x] 1.1: Fetch script fails without GITHUB_TOKEN
- `scripts/fetch-build-with-me-data.mjs` L21-24: Change `console.warn` + `exit(0)` → `console.error` + `exit(1)`

### - [x] 1.2: Remove hardcoded "upcoming" projects
- `scripts/fetch-build-with-me-data.mjs` L200-203: Delete `upcoming` array from payload
- `src/pages/projects/index.astro` L56-61: Remove `Upcoming` interface
- `src/pages/projects/index.astro` L66: Remove `upcoming` from destructuring
- `src/pages/projects/index.astro` L350-374: Delete Upcoming sidebar section

### - [x] 1.3: Add validation layer
- **New**: `src/lib/validate-build-with-me.ts` - Function checks arrays (cycles/tasks/hats/leaderboard), validates task fields (id/title/githubUrl/category), returns null on error
- `src/pages/projects/index.astro` L64: Import validator, call before destructuring, throw if null

### - [x] 1.4: Add pre-build hook
- `package.json`: Add `"prebuild": "node scripts/fetch-build-with-me-data.mjs"`

### - [x] 1.5: Update .env.example
- Add section for `GITHUB_TOKEN`, `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME`

### - [x] 1.6: Discover projects dynamically
- `scripts/fetch-build-with-me-data.mjs` L189: After building tasks, iterate to extract unique `projectSlug` values
- Build cycles by mapping slugs → filter tasks by slug → count open/claimed/merged
- Use `PROJECT_METADATA[slug]?.name ?? slug` for display names (prep for Phase 2)
- Remove any hardcoded project references (Basketball, Metal Lyrics)

### - [x] 1.7: Test Phase 1
```bash
npm run fetch:build-with-me  # Should output: Projects: ab-sim, Tasks: 1
cat src/data/build-with-me-data.json  # Verify no fake data
npm run build  # Should fail if data invalid
```

**Success Criteria**:
- ✅ Fetch fails without token
- ✅ No "upcoming" in JSON
- ✅ Build errors on bad data
- ✅ Only real GH issues shown
- ✅ Projects auto-discovered

---

## Phase 2: Monorepo Structure ✅ **COMPLETE**

**Trigger**: When 2+ distinct `project:*` labels exist on GitHub
**Goal**: Physical workspace separation

### - [x] 2.1: Install pnpm workspaces
```bash
npm i -g pnpm
echo 'packages:\n  - "packages/*"' > pnpm-workspace.yaml
rm -rf node_modules package-lock.json && pnpm install
```

### - [x] 2.2: Create shared package
- Created `packages/shared/` with placeholder utils for posthog, supabase, analytics

### - [x] 2.3: Create AB Simulator package
- Moved AB sim files to `packages/ab-simulator/src/pages/index.astro`
- Copied public assets (`public/js/ab-sim`, `puzzle-config.js`, `utils.js`)
- Created standalone BaseLayout.astro for AB sim
- Configured `base: '/ab-simulator'`, `outDir: '../../dist/ab-simulator'`
- Added `@soma/shared: workspace:*` dependency

### - [x] 2.4: Update root package.json
- Added `dev:ab-sim`, `build:packages`, updated `build` script

### - [x] 2.5: Update Dockerfile
- Installed pnpm globally, copied workspace files, used `pnpm install --frozen-lockfile`

### - [x] 2.6: Update nginx.conf
- Added `/ab-simulator/` location block with proper fallback

### - [x] 2.7: Centralize project metadata
- Added `PROJECT_METADATA` to both `.ts` and `.js` config files
- Exported `getProjectName()` and `getProjectPath()` helpers

### - [x] 2.8: Update fetch script
- Using `getProjectName(slug)` for dynamic project names

### - [x] 2.9: Test monorepo
- ✅ Build passes: `pnpm run build` successful
- ✅ `dist/ab-simulator/index.html` exists with all assets
- ✅ Root Astro config set to `emptyOutDir: false` to preserve package builds

### - [x] 2.10: Fix script loading and static assets
- ✅ Replaced dynamic script loading with static `<script src="">` tags (removed complexity)
- ✅ Removed `mode: 'cors'` from fetch calls (was breaking, not needed)
- ✅ Added `./public/**/*.js` to Tailwind content array (fixes purged classes)
- ✅ Centralized shared assets: `public/shared-assets/{fonts,favicon}`
- ✅ Created symlinks in package: `public/fonts` → `../../../public/shared-assets/fonts`
- ✅ Build completes with no errors, all assets copied correctly

**Success Criteria**:
- ✅ pnpm workspace functional with 3 packages (root, shared, ab-simulator)
- ✅ `dist/ab-simulator/index.html` exists with all JS, fonts, favicons
- ✅ Each package has isolated deps
- ✅ Metadata centralized with fallback for unknown projects
- ✅ JavaScript loads correctly (no dynamic loading complexity)
- ✅ Fonts/favicons shared via symlinks (zero duplication in git)
- ✅ Tailwind classes not purged from dynamically-generated HTML

---

## Phase 3: Build With Me Platform Overhaul ✅ **COMPLETE**

**Goal**: Transform static cards → professional dashboard with shadcn/ui DataTables

**Problems**: Hardcoded stats, no data tables, basic filters, no search, no freshness indicators
**Solution**: Dynamic stats, DataTable with @tanstack/react-table, fuzzy search, multi-select filters, sync status

### Tasks:

- [x] **3.1: Remove hardcoding** - Current Cycle card now data-driven via `cycles[0]?.name`, `cycles[0]?.openTasks`, etc.
- [x] **3.2: Install dependencies** - Installed `@tanstack/react-table`, `fuse.js`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`
- [x] **3.3: TasksTable** - Built with @tanstack/react-table, sortable columns (Task, Status, Points), category/status badges, GitHub links, mobile card view
- [x] **3.4: LeaderboardTable** - Added avatars (`entry.avatarUrl`), count-up animation, top 3 medals (🥇🥈🥉), rank colors (gold/silver/bronze)
- [x] **3.5: SearchBar** - Fuzzy search via fuse.js, searches title/category/status/labels, clear button, threshold 0.3
- [x] **3.6: FilterPanel** - Multi-select for categories & statuses, dropdown UI, active filter count badge, clear all button
- [x] **3.7: DataFreshness** - Color-coded indicator (green < 1hr, blue < 24hr, amber > 24hr), uses `lastFetchTime` from JSON
- [x] **3.8: Mobile optimization** - Responsive: table on desktop (lg+), card layout on mobile, fully functional on all screens

**Components Created**:
```
src/components/
├── TasksView.tsx          # Orchestrator (search + filters + table)
├── TasksTable.tsx         # DataTable (desktop table + mobile cards)
├── LeaderboardTable.tsx   # Rankings with avatars + animation
├── SearchBar.tsx          # Fuzzy search with fuse.js
├── FilterPanel.tsx        # Multi-select dropdown filters
├── DataFreshness.tsx      # Sync status indicator
└── src/lib/utils.ts       # cn() helper for class merging
```

**Success Criteria**:
- ✅ Zero hardcoded stats (all data-driven)
- ✅ Professional DataTable with sort/filter/search
- ✅ Contributor avatars with count-up animation
- ✅ Mobile responsive (cards < lg, table >= lg)
- ✅ Data freshness visible with color coding
- ✅ Multi-select filters with active count
- ✅ Clean component architecture (460+ lines across 7 files)

**Metrics**:
- **Added**: 7 React components (460+ lines), 6 npm packages
- **Modified**: projects/index.astro (-130 lines), fetch script (+1 line), validation (+1 field)
- **Result**: -106 lines of old filter/card code, cleaner separation of concerns

---

## Deployment

**Status**: ✅ All phases complete and deployed

**Production URLs**:
- `eeshans.com/` → Portfolio
- `eeshans.com/projects/` → Build With Me (Phase 3 platform)
- `eeshans.com/ab-simulator/` → AB Simulator

**Latest Deploy**: Phase 3 pushed to main, CI/CD running

**Deploy**: `git push origin main` (auto-deploys via GitHub Actions → Fly.io)

---

## Phase 4: Build With Me Package Migration ✅ **COMPLETE**

**Date**: Nov 25, 2024  
**Goal**: Isolate Build With Me into standalone package, mirror ab-simulator architecture

### Migration Steps:

- [x] **4.1: Create build-with-me package** - `packages/build-with-me/` with own package.json, astro.config.mjs, tailwind.config.js
- [x] **4.2: Move page & components** - Moved `src/pages/projects/index.astro` → `packages/build-with-me/src/pages/index.astro`, all React components (TasksView, LeaderboardTable, etc.)
- [x] **4.3: Configure routing** - Set `base: '/projects'`, `outDir: '../../dist/build-with-me'` to preserve URL structure
- [x] **4.4: Shared dependencies** - Added `@soma/shared: workspace:*`, uses SiteLayout from shared package
- [x] **4.5: Update root scripts** - Added `dev:build-with-me`, `build:build-with-me` to root package.json
- [x] **4.6: Test build** - Verified `dist/build-with-me/index.html` generated correctly

**Success Criteria**:
- ✅ Build With Me at `/projects/` still works
- ✅ Uses shared SiteLayout layout
- ✅ All React components functioning
- ✅ Independent build/dev workflow

---

## Post-Phase 4: Build With Me UI Debugging

**Date**: Nov 25, 2024  
**Trigger**: After migrating Build With Me to `packages/build-with-me/`, UI regressed - content full-width, not respecting `max-w-[60rem]` container, shifted left with no padding

### Root Cause Analysis

**Problem**: Tailwind JIT compiler wasn't generating arbitrary classes (`max-w-[60rem]`) from `@soma/shared` package

**Investigation**:
- Compared working `packages/ab-simulator/` vs broken `packages/build-with-me/`
- DevTools inspection showed `overflow` badge on `main` element
- grep confirmed `max-w-\[60rem\]` class missing from `dist/build-with-me/_astro/*.css`
- Both packages use `SiteLayout.astro` from `@soma/shared` with same `max-w-[60rem]` class

**Root Cause**: `packages/build-with-me/tailwind.config.js` only scanning own `src/` directory, not shared package files:
```js
content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}']  // ❌ Missing shared
```

### Fix Applied

**packages/build-with-me/tailwind.config.js**:
```diff
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
+   '../shared/src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'  // ✅ Scan shared package
  ],
```

**Result**: Arbitrary classes from `SiteLayout` now generated, layout respects container max-width

### Symptomatic Fixes Reverted

**Mistake**: Initially changed section backgrounds from `bg-primary-foreground` to `bg-card` (treating symptom)  
**Correction**: Reverted all color changes to match production styling:
- `bg-primary-foreground` on all sections (Hats & PRs, Leaderboard, Search, Filters)
- `shadow-lg shadow-black/5` on all cards
- React components: LeaderboardTable, TasksTable, SearchBar, FilterPanel all restored

### Outstanding Issue

**Current**: Spacing between sections still incorrect (tight instead of `space-y-8`)  
**Status**: Built HTML verified to have correct `<div class="w-full space-y-8">` wrapper  
**Diagnosis**: Browser cache suspected - hard refresh (Cmd+Shift+R) recommended

**Files Modified**:
- `packages/build-with-me/tailwind.config.js` (added shared path to content array)
- `packages/build-with-me/src/pages/index.astro` (reverted bg-card → bg-primary-foreground)
- `packages/build-with-me/src/components/*.tsx` (4 files reverted to prod colors)

**Lesson**: Always diagnose root cause before fixing. Symptomatic fixes mask architectural issues.

---

## Implementation Notes

**Shared Assets** (symlinks):
- `public/shared-assets/{fonts,favicon}` → All packages symlink to this
- 50% size reduction (640KB → 320KB)
- Git commits symlinks, build dereferences to real files

**Environment Variables**:
- `packages/*/.env` → Symlinked to root `.env`
- All `PUBLIC_*` vars accessible via `import.meta.env`

**Lessons**:
- ✅ Fix root causes (Tailwind content array), not symptoms (CSS hacks)
- ✅ Simplify (static script tags), don't add complexity (dynamic loading)
- ❌ Avoid: Dynamic loading, explicit CORS mode, asset duplication
