# Launch Implementation Plan

**Goal:** Ship a polished site with visible proof, honest framing, and DRY patterns that scale to future projects.

---

## Principles

| # | Principle | Implication |
|---|-----------|-------------|
| 1 | **Data lives in YAML, logic in TS** | `projects.yaml` is source of truth for project metadata, stats config, AI story |
| 2 | **One component, multiple contexts** | `<ProjectCard>`, `<StatsCard>`, `<Timeline>` work on home, hub, stack, contribute |
| 3 | **Content links to projects** | Posts have `projectId` frontmatter; `getPostsByProject()` util queries them |
| 4 | **Patterns before pages** | Extract shared components first, then build pages that compose them |

---

## Phase 1: Shared Infrastructure ✅ COMPLETE

**Why:** Build reusable pieces before creating pages that use them.

| ✓ | Task | Notes |
|---|------|-------|
| ✅ | `projects.yaml` with id, name, status, description, tags, stats config | Done |
| ✅ | `projects.ts` with `parseProjectsYaml`, `getProjectsByStatus`, `STATUS_CONFIG` | Done |
| ✅ | `<ProjectCard>` with stats hydration (full + compact variants) | Done |
| ✅ | Add `projectId` to post schema (`src/content/config.ts`) | Done |
| ✅ | Create `getPostsByProject(projectId)` util in `src/lib/posts.ts` | Done |
| ✅ | Add `aiStory` field to `projects.yaml` (array of bullets) | Done |
| ✅ | Extract `<Timeline>` to `packages/shared/src/components/Timeline.astro` | Done |
| ✅ | Create `<ConnectionStatus>` component | Done |

---

## Phase 2: Project Hub + Game Polish ✅ COMPLETE

**Why:** Hub is the shareable portfolio piece. Game stays focused on play with minimal chrome.

**Architecture:**
```
/projects (index)
├── Live projects (ProjectCard full variant)
├── What's Next (Timeline component)
└── Add to nav

/projects/ab-simulator (hub)
├── Hero + [Play Game →]
├── Stats (reuses StatsCard logic from ProjectCard)
├── AI Story (from projects.yaml.aiStory)
├── Related Content (getPostsByProject)
└── [Play Again →]

/ab-simulator (game)
├── <ConnectionStatus /> top bar
├── Nav: [← Back] [Project Docs]
└── Game UI (unchanged)
```

| ✓ | Task | Notes |
|---|------|-------|
| ✅ | Create `/projects/index.astro` | ProjectCard (full) + Timeline, add to nav |
| ✅ | Create `/projects/ab-simulator.astro` hub page | Template for future hubs |
| ✅ | Hero with project name, description, [Play Game →] CTA | From `projects.yaml` |
| ✅ | Stats section using same Supabase fetch as ProjectCard | Done |
| ✅ | AI Story section rendering `projects.yaml.aiStory` bullets | Done |
| ✅ | Related Content section using `getPostsByProject('ab-simulator')` | Done |
| ✅ | Add `<ConnectionStatus>` to game page header | Green/red dots for PostHog/Supabase |
| ✅ | Add nav to game + "Project Docs" button | Done |

---

## Phase 3: Contribute + Content ✅ COMPLETE

**Why:** Honest framing for contribute. Analysis post proves DS chops and feeds hub.

**Key Decision:** Replace React-powered GitHub table with **static Markdown page**.

**Rationale:**
- Delete **3,834 lines** of code (fetch script, JSON data, 11 React components, types)
- Match existing doc pattern (like `docs/11_ACTIVE_...`)
- Manual updates force honest, current content
- GraphQL refactor (#21) stays open for future polish

**What Was Deleted:**
| File | Lines |
|------|-------|
| `scripts/fetch-build-log.mjs` | 397 |
| `src/data/build-log-data.json` | 2,387 |
| `src/components/contribute/*.tsx` (11 files) | 884 |
| `src/lib/build-log-config.ts` | 27 |
| `src/lib/build-log-types.ts` | 71 |
| `src/data/build-log/build-log-config.ts` | 68 |
| **Total deleted** | **3,834** |
| **New page created** | 230 |
| **Net reduction** | **-3,604** |

**New `/contribute` Structure:**
```markdown
# Build With Me
> Living document. Last updated: {date}

## 🎯 Current Focus
| Project | Status | Try It | Docs |

## 📋 Active Work  
| Phase | Description | Status | GitHub |

## 🔗 Quick Links
- All Open Issues
- Good First Issues
- Project Board

## 🚀 How to Contribute
4-step process + stack summary

## 👥 Contributors
Manual table

## 📰 Follow the Build
Substack, Twitter, RSS

## ❓ FAQ
```

| ✓ | Task | Notes |
|---|------|-------|
| ✅ | Delete React components + fetch script | 3,834 lines deleted |
| ✅ | Create `/contribute` as Markdown-rendered page | 230 lines, clean Astro |
| ✅ | Structure: Focus, Active Work, Links, How-to, Contributors, FAQ | All sections present |
| ✅ | Add passive follow options | RSS, Substack, Twitter links |
| ☐ | Extend analysis notebook | Power, frequentist, Bayesian, CUPED |
| ☐ | Create analysis blog post | `projectId: ab-simulator`, `featured: true` |
| ☐ | Add 1-2 more launch anchor posts | "How I Built This", one essay |

---

## Phase 4: Stack + Documentation ✅ COMPLETE

**Why:** Architecture is non-obvious. Document it once for contributors and curious visitors.

**Site map:**
```
eeshans.com/
├── /                          # Home
├── /about                     # About
├── /projects/{id}             # Project hubs
├── /stack/                    # Architecture + workflows
├── /writing/{slug}            # Posts (with projectId)
└── /contribute/               # Follow the build
```

**Nav order:** About | Projects | Stack | Writing | Contribute

| ✓ | Task | Notes |
|---|------|-------|
| ✅ | Create `/stack` page with architecture diagram | HTML/Tailwind boxes |
| ✅ | Document analytics flow | 6-step pipeline |
| ✅ | Document project bootstrap workflow | 8 steps |
| ✅ | Add shared `<Timeline>` component to stack | Reuses from home |
| ✅ | Writing workflow section | Frontmatter example |
| ✅ | Key file reference links | supabase-schema, cloudflare-proxy, projects.yaml |
| ✅ | Add `/stack` to nav | Order: About, Projects, Stack, Writing, Contribute |

---

## Phase 5: Engagement + Distribution (Backlog)

**Why:** Build social proof metrics for O-1 evidence. Consolidate content distribution.

### Content Architecture

```
eeshans.com (canonical home)
├── /writing/           ← ALL long-form lives here
├── /projects/          ← Proof of work with live stats
└── /contribute/        ← Follow along

Substack (distribution layer)
├── Purpose: Email list + syndication
├── Content: Full posts with canonical URL → eeshans.com
└── Simple nav: Home + About only

LinkedIn (amplification)
└── Teasers that drive to eeshans.com
```

**Rule:** Write once on eeshans.com, cross-post to Substack (set canonical URL), promote on LinkedIn linking to eeshans.com.

### Substack Cleanup

| ✓ | Task | Notes |
|---|------|-------|
| ☐ | Remove multi-section nav | Kill "Stats & Experimentation", "Marketing & Media Measurement", etc. |
| ☐ | Keep simple nav | Just "Home" and "About" |
| ☐ | Update bio | "Full posts at eeshans.com" |
| ☐ | Cross-post with canonical URL | Substack Settings → Post → Set canonical URL |

### Giscus Comments

| ✓ | Task | Notes |
|---|------|-------|
| ✅ | Enable GitHub Discussions on repo | Already enabled |
| ✅ | Configure Giscus | giscus.app → General category, pathname mapping |
| ✅ | Create `<Comments>` component | `src/components/Comments.astro` using giscus web component |
| ✅ | Add to all `/writing/*` posts | Added to `BlogPost.astro` layout |

**Issue:** [#92](https://github.com/eeshansrivastava89/ds-apps-main/issues/92) ✅ Closed

### Engagement Metrics (Supabase)

| ✓ | Task | Notes |
|---|------|-------|
| ✅ | Set up PostHog batch export pipeline | Exports all events (incl. pageviews) to `posthog_batch_events` table |
| ✅ | Create `v_page_views` view | Aggregates pageviews by path from batch export |
| ✅ | Create `page_views()` RPC | Parameterized: `page_views('/projects/%', 30)` for any path pattern |
| ✅ | Rename `v_project_stats` → `v_ab_simulator_stats` | Clarified naming (puzzle-specific, not generic) |
| ✅ | Add indexes on `posthog_batch_events` | pathname, timestamp, event+timestamp |
| ✅ | Add "Like" button component | `LikeButton.astro` + `likes` table + `likes-webhook` edge function |
| ✅ | Add view count to ProjectCard | Fetches from `page_views()` RPC, matches `/{projectId}%` paths |
| ⏸️ | Create "Popular Posts" query | Backlog - Rank by `views + likes * 3` |

**Issue:** [#93](https://github.com/eeshansrivastava89/ds-apps-main/issues/93)

---

## Phase 6: Content + Launch (Backlog)

**Why:** Ship anchor content before announcing.

### 6.1 A/B Test Analysis Notebook

**Goal:** Publication-quality end-to-end A/B test analysis, rendered as HTML and embedded at `/projects/ab-simulator/analysis`

**Metrics Definition:**
- **Primary KPI:** `completion_time_seconds` (continuous) — B variant is harder, expect longer times
- **Secondary/Guardrail:** `completion_rate` (binary) — harder but still engaging
- **Engagement Guardrail:** `repeat_rate` (binary) — harder variant should still drive repeat behavior

**Notebook:** `analytics/notebooks/ab_test_analysis.ipynb`

| # | Section | Tasks | Outputs |
|---|---------|-------|---------|
| 1 | **Setup & Data Pull** | Supabase connection, pull via RPCs, dataframe creation | Raw data loaded |
| 2 | **Exploratory Analysis** | Sample sizes, distributions, outliers, time trends | Histograms, box plots, daily volume chart |
| 3 | **Hypothesis & Metrics** | State H0/H1, define primary/secondary/guardrails | Markdown documentation |
| 4 | **Sanity Checks & QA** | SRM test (chi-square), data quality checks, segment balance | Pass/fail table |
| 5 | **Primary Analysis: T-Test** | Welch's t-test for completion time | p-value, CI, effect size (Cohen's d) |
| 6 | **Primary Analysis: Regression** | OLS with variant dummy, robust SEs | Coefficient table, R² |
| 7 | **Variance Reduction (CUPED)** | Mock setup for future experiment with pre-period covariate | Commented template code |
| 8 | **Secondary Metrics** | Completion rate (chi-square/proportion test), repeat rate | Effect sizes, CIs |
| 9 | **Results Visualization** | CI plots (forest plot style), daily A vs B trend | Publication-ready figures |
| 10 | **Post-Hoc Power Analysis** | Achieved power, MDE retrospective, sample size curves | Power analysis chart |
| 11 | **Conclusions** | Final decision, practical significance, limitations | Summary table |

**Build Pipeline (GitHub Actions):**
```
Push to main (analytics/notebooks/*) → GH Action triggers →
Install Python + deps → papermill execute → nbconvert to HTML →
Commit HTML to public/analysis/ → Fly deploys with fresh HTML
```

**Future scale path:** When datasets grow, swap GH runner for Modal serverless.

| ✓ | Task | Notes |
|---|------|-------|
| ✅ | Create `ab_test_analysis.ipynb` skeleton | All 11 sections as markdown + code cells |
| ✅ | Section 1-2: Setup + EDA | Data pull, distributions, KDE plots |
| ✅ | Section 3-4: Hypothesis + Sanity Checks | SRM test (⚠️ 33/67 split), QA checks |
| ✅ | Section 5-6: T-Test + Regression | Welch's t-test (p=0.42), OLS regression |
| ✅ | Section 7: CUPED template | Simulated demo (39% SE reduction) |
| ✅ | Section 8: Secondary metrics | Completion rate ⚠️-23%, Repeat rate ⚠️-15.5% |
| ✅ | Section 9: Visualizations | CI plot, daily trend chart |
| ✅ | Section 10: Post-hoc power | Power=12.8%, MDE=5.8s at n=49 |
| ✅ | Section 11: Conclusions | Recommend: Do NOT ship Variant B |
| ✅ | Build integration | GH Actions workflow with matrix build |
| ✅ | Create `/projects/ab-simulator/analysis` page | Dynamic Astro page with iframe embed |

### 6.2 Other Content

| ✓ | Task | Notes |
|---|------|-------|
| ✅ | "How I Built the A/B Simulator" post | Published - technical deep-dive |
| ☐ | Launch announcement post | Draft below, ready for LinkedIn + Substack |

### 6.3 UX Consolidation

**Why:** Reduce friction, remove dead ends, create scannable single-scroll experience inspired by thariq.io simplicity.

**UX Audit Findings:**
- 5 nav items = too much cognitive load
- `/tools` and `/tags` were orphaned pages (deleted)
- `/about` used stale ProjectCard component (fixed)
- Timeline repeated on 3 pages (Home, Projects, Stack)
- Stack page target audience unclear
- No sidebar for discovery (recent posts, tags)

**Nav Change:**
```
Before: Home | About | Projects | Stack | Writing | Contribute
After:  About | Projects | Writing | Contribute
```

**Page Structure:**

```
HOME (/)
├── Hero (name, tagline, socials)
├── Philosophy ("AI-Native DS Beyond Notebooks")
├── Projects (compact cards + What's Next timeline)
└── Build With Me (contribute CTA)

+ SIDEBAR (right column)
├── Contribute CTA (top)
├── Recent Posts
├── Recent Analyses  
└── Tags

ABOUT (/about)
├── Bio (compressed)
├── Experience Timeline (visually compact, no cards/icons)
├── Projects (compact)
└── Stack (minified - just tech table, no architecture diagram)

PROJECTS (/projects) — unchanged
WRITING (/writing) — unchanged
CONTRIBUTE (/contribute) — unchanged
```

| ✓ | Task | Notes |
|---|------|-------|
| ✅ | Remove Stack from nav, reduce to 4 items | About, Projects, Writing, Contribute |
| ✅ | Create `<Sidebar>` component | Created, tested, reverted - squished main content |
| ✅ | Sidebar experiment | Removed - iframe pattern doesn't work for homepage |
| ✅ | Newsletter integration | Custom form → opens Substack with email pre-filled |
| ✅ | Brand consolidation | Unified as "Full Stack Data Scientist" |
| ✅ | Update Substack URL | `fullstackdatascientist.substack.com` |
| ✅ | Compress About page timeline | WorkTimeline component matching project timeline style |
| ✅ | Add minified Stack section to About | Tech table only, link to GitHub |
| ✅ | Delete `/stack` as standalone page | Content consolidated into About |
| ✅ | Update sitemap to reflect changes | Stack removed from sitemap |
| ✅ | Typography upgrade | Playfair Display headings + Lato body, warm cream background |
| ✅ | Contribute page consistency | Fixed width + tighter spacing to match other pages |
| ✅ | Update README.md | Comprehensive rewrite reflecting current architecture |

---

## Phase 6.3 Complete ✅

All UX consolidation tasks finished. Site is ready for launch content.

---

## Launch Announcement Draft

**Title:** I Built an A/B Testing Simulator (and Analyzed My Own Experiment)

**Hook (LinkedIn/Substack intro):**

Most A/B testing tutorials teach you to analyze someone else's data.

I wanted to do it differently: build the product, run a real experiment, and publish the full analysis—all as one person.

So I built the A/B Testing Memory Game.

**The Product:**
- A "Find the Pineapple" memory game with two difficulty variants
- Real PostHog tracking, real Supabase backend, real experiment running 24/7
- 200+ games played, data flowing into dashboards automatically

**The Experiment:**
- Variant A: 9 cards (easier)
- Variant B: 12 cards (harder)
- Hypothesis: Harder = longer completion times, but maybe better engagement?

**The Analysis:**
- End-to-end statistical analysis: t-tests, regression, CUPED variance reduction, power analysis
- Auto-refreshing notebook rendered as HTML on my site
- Key finding: With only 49 completions, I had 12.8% power. The experiment was underpowered from the start.

**The Verdict:**
Don't ship Variant B. Completion rate dropped 23%, repeat rate dropped 15.5%, and the time difference wasn't statistically significant (p=0.42).

But the real lesson isn't the result—it's the process. Real data science isn't analyzing clean CSVs. It's building the product, breaking the tracking, fixing the pipeline, and then doing the analysis.

**Links:**
- 🎮 Play the game: eeshans.com/ab-simulator
- 📊 View the analysis: eeshans.com/projects/ab-simulator/analysis/ab-test-analysis
- 📝 How I built it: eeshans.com/writing/how-i-built-the-ab-simulator
- 💻 Source code: github.com/eeshansrivastava89/ds-apps-main

What's your experience with underpowered experiments? Have you ever shipped something only to realize you didn't have enough data?

---

## Phase 7: Repo Architecture (Post-Launch)

**Why:** Separate repos = separate "original contributions" for O-1 evidence. Each project becomes a standalone, forkable artifact.

### Target Architecture

```
Repos:
├── eeshansrivastava89/build-log          ← Main site (eeshans.com)
├── eeshansrivastava89/ab-simulator       ← Standalone project
├── eeshansrivastava89/mmm-explorer       ← Future project
└── (optional) eeshansrivastava89/shared-ui ← npm package if needed

Hosting:
├── eeshans.com                  → build-log repo (Cloudflare Pages)
├── ab.eeshans.com               → ab-simulator repo (Cloudflare Pages)
└── eeshans.com/ab-simulator     → Cloudflare redirect to ab.eeshans.com
```

### Migration Steps

| ✓ | Task | Notes |
|---|------|-------|
| ☐ | Rename `ds-apps-main` → `build-log` | GitHub Settings → Rename |
| ☐ | Extract `packages/ab-simulator` to new repo | New repo `ab-simulator` |
| ☐ | Set up `ab.eeshans.com` subdomain | Cloudflare DNS + Pages |
| ☐ | Copy shared components to new repo | Timeline, ProjectCard (simple copy) |
| ☐ | Update main site links | Point to subdomain |
| ☐ | Add redirect rule | `/ab-simulator/*` → `ab.eeshans.com/*` |

### Benefits

| Metric | Monorepo | Separate Repos |
|--------|----------|----------------|
| GitHub stars | 1 repo | Multiple repos to star |
| Contributors | Shared | Per-project |
| "Original work" | "I built this site" | "I built ab-simulator, mmm-explorer, ..." |
| Forkability | Messy | Clean, focused |

### Shared Code Strategy

**Option 1: Copy-paste (recommended for now)**
- Small overlap (Timeline, ProjectCard)
- No npm publish/versioning overhead

**Option 2: npm package (if shared code grows)**
- Publish `@eeshan/shared-ui` to npm
- Both repos install as dependency
- More maintenance, only worth it for significant shared code

---

## DRY Inventory

| Pattern | Location | Used By |
|---------|----------|---------|
| Project metadata | `projects.yaml` | Home, hub, stack, contribute, ProjectCard |
| Status badges | `STATUS_CONFIG` in `projects.ts` | ProjectCard, Timeline, hub |
| Stats fetch | Inline in ProjectCard → extract to `fetchProjectStats()` | ProjectCard, hub, home |
| Post-project linking | `getPostsByProject()` | Hub, home featured |
| Timeline | Inline in index.astro → extract to `<Timeline>` | Home, stack |
| Connection status | New `<ConnectionStatus>` | Game, contribute |
| AI story | `projects.yaml.aiStory` | Hub |

---

## Execution Order

1. **Phase 1** (remaining): Schema + utils + component extraction
2. **Phase 2**: Hub page (consumes Phase 1 patterns), then game polish
3. **Phase 3**: Contribute reframe + analysis post (hub links to it)
4. **Phase 4**: Stack page documents what we built

---

## GitHub Issues

| Phase | Issue | Tasks |
|-------|-------|-------|
| 1 | [#86 Shared Infrastructure](https://github.com/eeshansrivastava89/ds-apps-main/issues/86) | 5 |
| 2 | [#87 Project Hub + Game Polish](https://github.com/eeshansrivastava89/ds-apps-main/issues/87) | 7 |
| 3 | [#88 Contribute + Content](https://github.com/eeshansrivastava89/ds-apps-main/issues/88) | 8 |
| 4 | [#89 Stack + Documentation](https://github.com/eeshansrivastava89/ds-apps-main/issues/89) | 7 |
| 5 | [#91 Engagement + Distribution](https://github.com/eeshansrivastava89/ds-apps-main/issues/91) | 13 |


### Evidence Tracking

| Metric | Source | Target |
|--------|--------|--------|
| Substack subscribers | Substack dashboard | Track monthly |
| Project interactions | Supabase `game_stats` | "500+ games played" |
| Site visitors | PostHog / Supabase view | "1,000+ unique visitors" |
| Post engagement | Likes + comments | Screenshot for evidence |