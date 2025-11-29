# Build Log Enhancements

**Location**: `src/pages/build-log/` (merged into main site)

---

## Phase 1: Initial Build Log Page ✅

**Goal:** Build the contributor-focused `/build-with-me/` page with gamification and social proof.

**Completed:** 2025-11-25

### Tasks

| Task | Description | Status |
|------|-------------|--------|
| **Activity Feed** ([#15](https://github.com/eeshansrivastava89/soma-portfolio/issues/15)) | Recent claims/merges/opens with avatars | ✅ Done |
| **Hero Rewrite** ([#15](https://github.com/eeshansrivastava89/soma-portfolio/issues/15)) | Stats bar, manifesto copy, video CTA | ✅ Done |
| **Task Enrichment** ([#12](https://github.com/eeshansrivastava89/soma-portfolio/issues/12)) | "You'll Learn" tags, "Good First Issue" badge | ✅ Done |
| **Recently Merged / Shoutouts** ([#15](https://github.com/eeshansrivastava89/soma-portfolio/issues/15)) | Contributor credit | ✅ Done |
| **Leaderboard Upgrades** ([#12](https://github.com/eeshansrivastava89/soma-portfolio/issues/12)) | Streak indicators | ✅ Done |
| **Filter Pills** ([#15](https://github.com/eeshansrivastava89/soma-portfolio/issues/15)) | Quick filters | ✅ Done |
| **Start Here Guide** ([#15](https://github.com/eeshansrivastava89/soma-portfolio/issues/15)) | Collapsible onboarding | ✅ Done |
| **Video Modal** ([#15](https://github.com/eeshansrivastava89/soma-portfolio/issues/15)) | Overlay player | ✅ Done |
| **Quick Nav Bar** ([#15](https://github.com/eeshansrivastava89/soma-portfolio/issues/15)) | Section links | ✅ Done |
| **Mobile Polish** ([#15](https://github.com/eeshansrivastava89/soma-portfolio/issues/15)) | Responsive fixes | ✅ Done |

### Progress Log

Consolidated 3 sections into unified `ContributorCards`. Removed competitive elements.

**Key changes:**
- `ContributorCards.tsx`: Unified contributor display
- `index.astro`: Hero redesign with video, quick nav pills
- `StartHereGuide.tsx`: Always-visible expand/collapse
- `VideoModal.tsx`: Video overlay
- Deleted: `LeaderboardTable.tsx`, `Shoutouts.tsx`, `DataFreshness.tsx`
- React 19 upgrade

---

## Phase 2: Solo-First Reframe ✅

**Goal:** Reframe from contributor-focused to solo-first learning journey (80/20 split). Rename route to `/build-log/`.

**Completed:** 2025-11-27

### Tasks

| Task | Description | Status |
|------|-------------|--------|
| **Route Rename** ([#23](https://github.com/eeshansrivastava89/soma-portfolio/issues/23)) | `/build-with-me/` → `/build-log/` | ✅ Done |
| **Build Log Reframe** ([#24](https://github.com/eeshansrivastava89/soma-portfolio/issues/24)) | Reorder: Hero → Projects → Learnings → Contribute | ✅ Done |
| **Latest Learnings Section** ([#25](https://github.com/eeshansrivastava89/soma-portfolio/issues/25)) | Blog post links section | ✅ Done |
| **Current Projects Section** ([#26](https://github.com/eeshansrivastava89/soma-portfolio/issues/26)) | A/B Simulator card with status | ✅ Done |
| **Hero Copy Update** ([#27](https://github.com/eeshansrivastava89/soma-portfolio/issues/27)) | "The Build Log" solo-first framing | ✅ Done |

### Progress Log

**Route Rename:**
- Renamed folder: `packages/build-with-me/` → `packages/build-log/`
- Package name: `@soma/build-with-me` → `@soma/build-log`
- Astro config: `base: '/build-log'`, `outDir: '../../dist/build-log'`
- Dockerfile: Added `/build-log/` nginx location block
- All imports updated across 10+ component files

**Page Restructure:**
- Hero: New solo-first copy + CTAs ("See Current Project" / "Want to Contribute?")
- Added "What I'm Building" section with A/B Simulator card
- Added "What I've Learned" section
- Moved contribution section below with border separator

---

## Phase 3: Learnings Infrastructure ✅

**Goal:** Build YAML-based learnings data system with timeline component and filtering.

**Completed:** 2025-11-27

### Tasks

| Task | Description | Status |
|------|-------------|--------|
| **Learnings YAML + Schema** ([#28](https://github.com/eeshansrivastava89/soma-portfolio/issues/28)) | YAML data file with JSON schema for VS Code | ✅ Done |
| **Learnings Timeline** ([#29](https://github.com/eeshansrivastava89/soma-portfolio/issues/29)) | Timeline component with type badges | ✅ Done |
| **Filter Pills + Pagination** ([#30](https://github.com/eeshansrivastava89/soma-portfolio/issues/30)) | Project filters, 10 items per page | ✅ Done |
| **Contribute Page** ([#31](https://github.com/eeshansrivastava89/soma-portfolio/issues/31)) | Separate `/build-log/contribute/` page | ✅ Done |
| **Contribute Nav Link** ([#32](https://github.com/eeshansrivastava89/soma-portfolio/issues/32)) | Add to header nav | ✅ Done |

### Progress Log

**New files:**
- `packages/shared/src/data/learnings.yaml` — Data file with 2 seed entries
- `packages/shared/src/data/learnings.schema.json` — JSON schema for VS Code autocomplete
- `packages/shared/src/lib/learnings.ts` — TypeScript loader with types + helpers
- `packages/build-log/src/components/LearningsTimeline.tsx` — Timeline component
- `packages/build-log/src/pages/contribute/index.astro` — Dedicated contribute page

**Features:**
- Type badges: 📝 Blog, 📰 Substack, 📄 Doc, 🎥 Video
- Featured items pinned to top
- Project filter pills with counts
- Built-in pagination (10 items per page)
- Compact contribute CTA on main page

---

## Phase 4: Home Page Redesign ✅

**Goal:** Redesign home page to showcase Build Log as the main differentiator, with compact hero and clear CTAs.

**Completed:** 2025-11-27

### Tasks

| Task | Description | Status |
|------|-------------|--------|
| **Hero card redesign** ([#33](https://github.com/eeshansrivastava89/soma-portfolio/issues/33)) | Horizontal layout: photo left, name/tagline/socials right | ✅ Done |
| **Build Log showcase** ([#34](https://github.com/eeshansrivastava89/soma-portfolio/issues/34)) | Current projects + learnings preview section | ✅ Done |
| **Contribute CTA** ([#35](https://github.com/eeshansrivastava89/soma-portfolio/issues/35)) | Compact card with stats linking to /build-log/contribute | ✅ Done |
| **Substack CTA** ([#36](https://github.com/eeshansrivastava89/soma-portfolio/issues/36)) | Keep orange styling, move to bottom | ✅ Done |
| **Remove blog sections** ([#37](https://github.com/eeshansrivastava89/soma-portfolio/issues/37)) | Delete Latest Post + Explore by Topic | ✅ Done |
| **Update tagline** ([#38](https://github.com/eeshansrivastava89/soma-portfolio/issues/38)) | New tagline in index.astro | ✅ Done |

### Progress Log

**Commit:** `954dc0a`

**Key changes to `src/pages/index.astro`:**
- Compact horizontal hero card with profile image, name, tagline, social links
- Build Log section with A/B Simulator card (Live badge) + What I've Learned card
- Contribute CTA with dynamic stats from `build-log-data.json`
- Substack newsletter CTA at bottom
- Removed: Latest Post section, Explore by Topic section
- Dynamic data: `learningsCount`, `totalContributors`, `openTasks`

**Lines changed:** 149 added, 162 removed = -13 net lines

---

## Phase 4b: DRY Projects Infrastructure ✅

**Goal:** Create shared YAML-based projects data system so projects appear consistently on both home page and build log.

**Completed:** 2025-11-27

### Tasks

| Task | Description | Status |
|------|-------------|--------|
| **Projects YAML + Schema** ([#39](https://github.com/eeshansrivastava89/soma-portfolio/issues/39)) | YAML data file with JSON schema for VS Code | ✅ Done |

### Progress Log

**Commit:** `8082a26`

**New files:**
- `packages/shared/src/data/projects.yaml` — Project data with tags and status
- `packages/shared/src/data/projects.schema.json` — JSON schema for VS Code autocomplete
- `packages/shared/src/lib/projects.ts` — TypeScript types, color configs, parser
- `packages/shared/src/components/ProjectCard.astro` — Shared component with full/compact variants

**Key changes:**
- `tailwind.config.js` — Added shared package to content paths
- `src/pages/index.astro` — Uses ProjectCard with `variant="compact"`
- `packages/build-log/src/pages/index.astro` — Uses ProjectCard with `variant="full"`

**Result:** Add a project once in `projects.yaml`, it appears on both home page and build log with appropriate styling.

---

## Phase 5: Design System Refinement & Live Stats ✅

**Goal:** Shift from "friendly/eager" to "authoritative/minimal" design. Remove decorative elements, adopt black/white palette, and add live project stats fetched from Supabase.

**Completed:** 2025-11-28

### Tasks

| Task | Description | Status |
|------|-------------|--------|
| **Remove border beam** ([#40](https://github.com/eeshansrivastava89/soma-portfolio/issues/40)) | Delete rotating animation from Build Log nav | ✅ Done |
| **Black/white buttons** ([#41](https://github.com/eeshansrivastava89/soma-portfolio/issues/41)) | Replace orange CTAs with black throughout site | ✅ Done |
| **Gray tags** ([#42](https://github.com/eeshansrivastava89/soma-portfolio/issues/42)) | Replace colored tag pills with neutral gray | ✅ Done |
| **Featured posts field** ([#43](https://github.com/eeshansrivastava89/soma-portfolio/issues/43)) | Add `featured: true` to post frontmatter schema | ✅ Done |
| **Featured posts section** ([#44](https://github.com/eeshansrivastava89/soma-portfolio/issues/44)) | Show hand-picked posts on home page | ✅ Done |
| **Supabase view for stats** ([#45](https://github.com/eeshansrivastava89/soma-portfolio/issues/45)) | Create `v_project_stats` view | ✅ Done |
| **Stats in projects.yaml** ([#46](https://github.com/eeshansrivastava89/soma-portfolio/issues/46)) | Add stats config per project | ✅ Done |
| **Live stats in ProjectCard** ([#47](https://github.com/eeshansrivastava89/soma-portfolio/issues/47)) | Client-side hydration of stats from Supabase | ✅ Done |

### Progress Log

**Design Changes:**
- Removed 64-line border-beam animation from `app.css`
- Replaced all `bg-orange-*` buttons with `bg-foreground text-background`
- Replaced `TAG_COLORS` system with neutral `bg-muted text-muted-foreground`
- Updated 15+ component files across `packages/build-log/src/components/`
- Changed grid-live pulse animation to neutral black shadow

**Featured Posts:**
- Added `featured: z.boolean().default(false)` to post schema
- Marked 2 posts as featured: "How I AI" and "AI Series"
- Home page now shows Featured Writing section above Build Log

**Live Stats Architecture (Final):**

Initially planned a server-side API proxy (`/api/project-stats`), but simplified to call Supabase directly from client (same pattern as A/B simulator dashboard). No architecture change needed.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ProjectCard   │───▶│    Supabase     │───▶│ v_project_stats │
│  (client-side)  │    │   REST API      │    │     (view)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Supabase View (created):**

```sql
CREATE OR REPLACE VIEW v_project_stats AS
SELECT 
  'ab-simulator' as project_id,
  COUNT(*) FILTER (WHERE event = 'puzzle_started') as games_played,
  CASE 
    WHEN COUNT(*) FILTER (WHERE event = 'puzzle_started') > 0 THEN
      ROUND(
        COUNT(*) FILTER (WHERE event = 'puzzle_completed')::numeric / 
        COUNT(*) FILTER (WHERE event = 'puzzle_started') * 100
      )::integer
    ELSE 0
  END as completion_rate,
  (SELECT variant FROM v_variant_stats ORDER BY avg_completion_time ASC LIMIT 1) as winning_variant
FROM posthog_events
WHERE event IN ('puzzle_started', 'puzzle_completed') AND session_id IS NOT NULL;

GRANT SELECT ON v_project_stats TO anon, authenticated;
```

**projects.yaml (final):**

```yaml
stats:
  metrics:
    - key: games_played
      label: games played
    - key: completion_rate
      label: completion
      format: percent
    - key: winning_variant
      label: winning
```

**Files Modified:**

| File | Change |
|------|--------|
| `src/styles/app.css` | Removed border-beam (64 lines), neutral grid-live |
| `packages/shared/src/styles/app.css` | Neutral grid-live animation |
| `src/components/layout/Header.astro` | Removed border-beam class |
| `src/pages/index.astro` | Black buttons, featured posts section |
| `packages/build-log/src/pages/index.astro` | Black buttons |
| `packages/build-log/src/pages/contribute/index.astro` | Neutral stats display |
| `packages/build-log/src/components/*.tsx` | Orange → foreground (15 files) |
| `packages/shared/src/components/ProjectCard.astro` | Stats hydration, gray tags |
| `packages/shared/src/lib/projects.ts` | Removed TAG_COLORS, added stats types |
| `packages/shared/src/lib/learnings.ts` | Blog type badge now gray |
| `packages/shared/src/data/projects.yaml` | Stats config |
| `packages/ab-simulator/src/pages/index.astro` | Stop/Try Again buttons |
| `src/content/config.ts` | Added featured field |
| `src/content/post/how-i-ai.md` | `featured: true` |
| `src/content/post/series-ai.md` | `featured: true` |
| `supabase-schema.sql` | Added v_project_stats view |

### Design Principles (Applied)

1. **Restraint over enthusiasm** — Removed border beam, reduced color variety
2. **Black/white palette** — Only functional indicators use color (Live = green)
3. **Typography carries design** — Less visual noise, content forward
4. **Data proves credibility** — Live stats from real usage (172 games, 70% completion)

---

## Phase 6: Sharp Editorial Design ✅

**Goal:** Remove all rounded corners for a sharp, editorial aesthetic. Cards become rectangular, buttons get hard edges.

**Completed:** 2025-11-28

### Tasks

| Task | Description | Status |
|------|-------------|--------|
| **Remove rounded corners** | Delete all `rounded-*` classes except `rounded-full` for circular elements | ✅ Done |

### Progress Log

**Commit:** `d8e9f11`

Removed rounded corners from 23 files across the site. Kept `rounded-full` only for:
- Profile images (circular)
- Timeline dots
- Icon containers

**Files changed:** 23 files, net removal of decorative styling.

---

## Phase 7: Merge Build-Log into Main Site ✅

**Goal:** Eliminate `packages/build-log/` as a separate Astro app. Move pages into main site to enable direct content collection access and simplify architecture.

**Completed:** 2025-11-29

**Issue:** [#49](https://github.com/eeshansrivastava89/soma-portfolio/issues/49) (Closes #48)

### Problem

Build-log was a separate Astro app but needed:
- Main site's content collection (`getCollection('post')`)
- Shared layouts and components
- No independent UI logic justifying separation

This forced `learnings.yaml` duplication and complex build coordination.

### Solution

```
packages/build-log/          → DELETED
src/pages/build-log/         → Pages now here
src/components/build-log/    → Components now here
scripts/fetch-build-log.mjs  → Standalone fetch script
src/data/build-log-data.json → GitHub data
src/lib/build-log-types.ts   → Types
src/lib/build-log-config.ts  → Config
```

### Subtasks

| Task | Description | Status |
|------|-------------|--------|
| Move pages | `src/pages/build-log/index.astro` + `contribute/` | ✅ Done |
| Move components | `src/components/build-log/` (10 React + 1 Astro) | ✅ Done |
| Move fetch script | `scripts/fetch-build-log.mjs` (inline config) | ✅ Done |
| Move data file | `src/data/build-log-data.json` | ✅ Done |
| Update imports | Use `@/lib/*` and `@/data/*` aliases | ✅ Done |
| Replace learnings.yaml | Use `getCollection('post')` with `project:*` tags | ✅ Done |
| Delete package | Removed `packages/build-log/` entirely | ✅ Done |
| Delete learnings system | Removed `learnings.yaml`, schema, and loader | ✅ Done |
| Update build scripts | Simplified `package.json` prebuild | ✅ Done |
| Verify & commit | Build passes, 19 pages generated | ✅ Done |

### Progress Log

**Commit:** `acd49ba`

**Files Created:**
- `src/pages/build-log/index.astro` — Uses `getCollection('post')` + PostList
- `src/pages/build-log/contribute/index.astro` — Uses BuildLogView React component
- `src/components/build-log/PostList.astro` — Replaces LearningsTimeline
- `src/components/build-log/*.tsx` — 10 React components migrated
- `src/lib/build-log-types.ts` — TypeScript types
- `src/lib/build-log-config.ts` — Status/category styles
- `scripts/fetch-build-log.mjs` — Standalone fetch script

**Files Deleted:**
- Entire `packages/build-log/` folder
- `packages/shared/src/data/learnings.yaml`
- `packages/shared/src/data/learnings.schema.json`
- `packages/shared/src/lib/learnings.ts`

**tsconfig.json Updates:**
```json
"@/lib/*": ["src/lib/*"],
"@/data/*": ["src/data/*"]
```

### Outcome

- ✅ Direct content collection access (no more learnings.yaml to maintain)
- ✅ Simpler build (one Astro build)
- ✅ Cleaner imports with path aliases
- ✅ **-1091 lines net (902 added, 1993 deleted) = 54% reduction**

---

## Phase 8: Site Simplification ✅

**Goal:** Radical simplification of site structure. Remove build-log page, rename blog to writing, streamline home page to 3 sections.

**Completed:** 2025-11-29

### Problem

Current structure has redundancy and unclear hierarchy:
- Home page has "What I'm Writing" section → but there's also a Blog page
- `/build-log/` page duplicates home page content
- "Build Log" nav item is confusing (is it a blog? a project page?)
- Too many CTAs for contributing

### Solution

**Home Page (3 sections):**
```
Hero (name + tagline + socials + newsletter)
What I'm Building (ProjectCard with live stats)
Join the Build (contribute CTA)
```

**Writing Page (replaces Blog):**
```
/writing/           → Preview (5 per section) + "View all" links
/writing/technical/ → All technical posts (paginated)
/writing/essays/    → All essay posts (paginated)
```

**Nav:**
```
About | Writing | Contribute
```

### Subtasks

| Task | Description | Status |
|------|-------------|--------|
| Add `category` to post schema | `technical` or `essay` field | ✅ Done |
| Update existing posts | Add category to frontmatter | ✅ Done |
| Create `/writing/` page | Two-section layout with previews | ✅ Done |
| Create `/writing/technical/` | Paginated technical posts | ✅ Done |
| Create `/writing/essays/` | Paginated essay posts | ✅ Done |
| Delete `/blog/` route | Remove `src/pages/blog/` | ✅ Done |
| Update home page | Remove "What I'm Writing" section | ✅ Done |
| Delete `/build-log/` page | Remove `src/pages/build-log/index.astro` | ✅ Done |
| Move contribute page | `/build-log/contribute/` → `/contribute/` | ✅ Done |
| Update nav | Blog → Writing, remove Build Log | ✅ Done |
| Rename component folders | `blog/` → `writing/`, `build-log/` → `contribute/` | ✅ Done |
| Verify & commit | Build passes, 18 pages | ✅ Done |

### Progress Log

**Commits:** `8ae4c67`, `1e2fa14`

**Files Created:**
- `src/pages/writing/index.astro` — Preview page with 5 per section
- `src/pages/writing/[...slug].astro` — Individual post pages
- `src/pages/writing/technical/[...page].astro` — Paginated technical posts
- `src/pages/writing/essays/[...page].astro` — Paginated essay posts
- `src/pages/contribute/index.astro` — Moved from build-log

**Files Deleted:**
- `src/pages/blog/` — Entire folder
- `src/pages/build-log/` — Entire folder
- `src/components/build-log/PostList.astro`

**Files Renamed:**
- `src/components/blog/` → `src/components/writing/`
- `src/components/build-log/` → `src/components/contribute/`

### Outcome

- ✅ Clearer site structure (4 pages: Home, Writing, Contribute, About)
- ✅ No duplicate content between pages
- ✅ Fewer nav items (4 → 3)
- ✅ Home page is the "build log" - no separate page needed
- ✅ Writing page scales with pagination
- ✅ **-292 lines net**

---

## Backlog

| Task | Description | Status |
|------|-------------|--------|
| **PostHog Tracking** | CTA clicks, scroll depth | ⬜ Later |
