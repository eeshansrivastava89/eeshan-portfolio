# Build Log Enhancements

**Package location**: `packages/build-log/`

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

## Backlog

| Task | Description | Status |
|------|-------------|--------|
| **PostHog Tracking** | CTA clicks, scroll depth | ⬜ Later |
