# Hugo → Astro Migration Plan

**Project:** Migrate soma-blog-hugo to Astro + Tailwind using Astro Theme Resume  
**Goal:** Reduce code, enable interactivity, preserve all current features  
**Philosophy:** Fast, modular, minimal chunks  
**Status:** � READY TO START

---

## Key Questions Answered

### 1. Blank Site vs Theme?
**Decision: Use [Astro Theme Resume](https://github.com/srleom/astro-theme-resume) as foundation** ✅

**Why this theme:**
- ✅ **Perfect balance**: Resume homepage + blog system (exactly what you need)
- ✅ **Highly modular**: `<Section>` components easy to customize/remove
- ✅ **Your tech stack**: Astro v4 + Tailwind + TypeScript + MDX
- ✅ **Built-in structure**: About, Experience, Projects, Skills, Certifications sections
- ✅ **Professional design**: Resume-inspired (not teenager-y, not docs-focused)
- ✅ **Clean & minimal**: 250 stars, actively maintained, MIT license
- ✅ **Easy customization**: Simple data arrays, reorderable sections
- ✅ **Great foundation**: Based on Astro Cactus + minirezume-framer

**What we'll customize:**
- Replace **Experience section** → Your animated timeline component
- Keep **Projects section** → Showcase for A/B simulator
- Keep **About section** → Your intro text
- Keep **Blog system** → Posts with tags, search, RSS
- Remove **Education/Certifications** → Not needed
- Add custom pages → As needed for your content

**Demo:** [astro-theme-resume.vercel.app](https://astro-theme-resume.vercel.app/)  
**Repo:** [github.com/srleom/astro-theme-resume](https://github.com/srleom/astro-theme-resume)

### 2. Theme Structure Analysis ✅
**Homepage Layout (index.astro):**
```
- Hero section (name, tagline, CTA, location/links)
- About section (bio text)
- Posts section (recent blog previews)
- Experience section ← REPLACE WITH TIMELINE
- Education section ← REMOVE (not needed)
- Projects section (showcase cards with images)
- Certifications section ← REMOVE (not needed)
- Skills section (categorized: Languages, Frontend, Backend, Others)
```

**Page Structure:**
```
src/pages/
├── index.astro           # Resume-style homepage (customize)
├── blog/
│   ├── index.astro       # Blog listing page (use as-is)
│   └── [...slug].astro   # Individual posts (use as-is)
├── tags/
│   ├── index.astro       # All tags (use as-is)
│   └── [tag]/[...page].astro  # Posts by tag (use as-is)
└── tools/                # Example page (can repurpose for "Projects")
```

**Component Architecture:**
- `<Section>` - Wrapper for each homepage section (very modular!)
- `<Card>` - Experience/Education items (replace with Timeline)
- `<ProjectCard>` - Project showcase with images (perfect for A/B simulator)
- `<PostPreview>` - Blog post cards (use as-is)
- `<SkillLayout>` - Skill categories (customize or remove)

**Customization Strategy:**
1. Use homepage sections as-is for quick start
2. Replace Experience `<Card>` components with Timeline component
3. Remove Education/Certifications sections (just delete from index.astro)
4. Add your content to Projects section
5. Optionally create separate `/projects` page for expanded showcase

---

## Migration Overview

### Your Site Requirements (Confirmed)
1. **Home page** - Your info + links + post previews + project previews
2. **Posts page** - Blog listing with filtering/search
3. **Projects page** - Cool showcase (like A/B simulator) people can click into
4. **About page** - With animated timeline

### What We're Keeping
- ✅ All blog content (markdown files)
- ✅ Timeline data (YAML → will use `file()` loader)
- ✅ PostHog integration (analytics + experiments)
- ✅ Supabase connection (data warehouse)
- ✅ Streamlit dashboard (iframe embed)
- ✅ A/B test simulator (puzzle game)
- ✅ Company logos and static assets
- ✅ Domain and deployment setup
- ✅ Current visual aesthetic (professional, minimal)

### What We're Replacing
- ❌ Hugo static site generator → Astro v5.0
- ❌ Custom CSS (130 lines timeline) → Tailwind + Framer Motion
- ❌ Hugo shortcodes → React/Astro components
- ❌ Rusty Typewriter theme → Custom blank site
- ❌ Static HTML layouts → Astro layouts + islands

### What We're Adding
- ✨ Animated timeline (Framer Motion + Aceternity inspiration)
- ✨ Interactive blog filters (React islands)
- ✨ Real-time search (Fuse.js)
- ✨ Project showcase grid (Tailwind cards with hover effects)
- ✨ Modern UI/UX (animations, transitions)

---

## Architecture Comparison

### Before (Hugo)
```
Hugo (Go templates)
  → Static HTML
    → Custom CSS (130 lines)
      → No interactivity
        → PostHog SDK
          → Supabase
            → Streamlit iframe
```

### After (Astro)
```
Astro (Static + Islands)
  → Static HTML (default)
    → React Islands (where needed)
      → Tailwind CSS (utility classes)
        → Aceternity/Shadcn components
          → PostHog SDK (preserved)
            → Supabase (preserved)
              → Streamlit iframe (preserved)
```

---

## Tech Stack

### Core Framework
- **Astro 4.x** - Static site generator with islands
- **React 18** - For interactive components only
- **TypeScript** - Type safety

### Styling
- **Tailwind CSS 3.4** - Utility-first CSS
- **Framer Motion** - Animations

### Components
- **Aceternity UI** - Animated timeline, hero sections
- **Shadcn/ui** - Form components, buttons
- **Radix UI** - Accessible primitives (via Shadcn)

### Preserved Integrations
- **PostHog SDK** - Analytics + experiments (no changes)
- **Supabase** - PostgreSQL data warehouse (no changes)
- **Streamlit** - Dashboard iframe (no changes)

### Deployment
- **Fly.io** - Same hosting, different Dockerfile
- **GitHub Actions** - Modified workflow

---

## Migration Phases (6 Chunks)

### ⏱️ Time Estimate: 1 working day (8 hours)

| Phase | Time | Difficulty | Dependencies |
|-------|------|------------|--------------|
| 1. Astro Setup | 1h | Easy | None |
| 2. Content Migration | 1h | Easy | Phase 1 |
| 3. Timeline Component | 2h | Medium | Phase 2 |
| 4. Layout & Navigation | 1.5h | Medium | Phase 3 |
| 5. Integrations | 1.5h | Medium | Phase 4 |
| 6. Deploy & Test | 1h | Easy | Phase 5 |

---

## PHASE 1: Clone & Setup Theme

**Goal:** Get Astro Theme Resume running locally, understand structure

**Time:** 30 minutes  
**Difficulty:** ⭐ Easy  
**Blockers:** None

### Tasks

#### 1.1: Clone Theme Repository
- [ ] Clone repo: `git clone https://github.com/srleom/astro-theme-resume.git soma-portfolio`
- [ ] Enter directory: `cd soma-portfolio`
- [ ] Remove git history: `rm -rf .git`
- [ ] Initialize new repo: `git init && git add . && git commit -m "Initial commit with Astro Theme Resume"`

#### 1.2: Install Dependencies
- [ ] Install packages: `pnpm install` (or `npm install`)
- [ ] Verify installation completes without errors
- [ ] Check Astro version: Should be v4.x (easily upgradeable later)

#### 1.3: First Run & Exploration
- [ ] Start dev server: `pnpm dev` (or `npm run dev`)
- [ ] Visit `http://localhost:4321`
- [ ] Explore demo content (see all sections working)
- [ ] Test hot reload (edit `src/pages/index.astro`, save, verify changes)

#### 1.4: Understand Project Structure
```
soma-portfolio/
├── src/
│   ├── components/           # Reusable components
│   │   ├── Card.astro        # Experience/Education cards
│   │   ├── ProjectCard.astro # Project showcase
│   │   ├── Section.astro     # Section wrapper (very useful!)
│   │   ├── Label.astro       # Icon labels (location, work)
│   │   ├── SkillLayout.astro # Skills display
│   │   └── blog/             # Blog-specific components
│   ├── layouts/
│   │   ├── BaseLayout.astro  # Main layout (add PostHog here)
│   │   └── BlogPost.astro    # Blog post layout
│   ├── pages/
│   │   ├── index.astro       # Homepage (customize this!)
│   │   ├── blog/             # Blog system
│   │   ├── tags/             # Tag pages
│   │   └── tools/            # Example page (repurpose)
│   ├── content/              # Markdown blog posts
│   ├── styles/               # Global CSS
│   ├── utils/                # Helper functions
│   └── site.config.ts        # Site metadata (EDIT THIS FIRST)
├── public/                   # Static assets
└── astro.config.mjs          # Astro configuration
```

#### 1.5: Configure Site Metadata
- [ ] Edit `src/site.config.ts`
- [ ] Update site title, description, author
- [ ] Update social links (GitHub, LinkedIn)
- [ ] Change base URL to your domain
- [ ] Save and verify changes appear on site

#### 1.6: Install Additional Dependencies (for Timeline)
- [ ] Install Framer Motion: `pnpm add framer-motion` (for timeline animations)
- [ ] Install js-yaml: `pnpm add js-yaml @types/js-yaml` (for timeline data)
- [ ] Verify packages installed correctly

### Success Criteria
- ✅ Theme running locally without errors
- ✅ Hot reload working
- ✅ Understanding of component structure
- ✅ Site config updated with your info
- ✅ Additional dependencies installed

### Rollback Plan
- Delete `soma-portfolio` directory
- No changes to `soma-blog-hugo` yet

---

## PHASE 2: Content & Asset Migration

**Goal:** Move your Hugo content and assets to Astro theme structure

**Time:** 45 minutes  
**Difficulty:** ⭐ Easy  
**Blockers:** Phase 1 complete

### Tasks

#### 2.1: Clean Demo Content
- [ ] Delete demo blog posts from `src/content/blog/`
- [ ] Keep folder structure (will add your posts)
- [ ] Note: Content collection config already exists (no need to create)

#### 2.2: Copy Your Blog Posts
- [ ] Copy `soma-blog-hugo/content/posts/first-post.md` to `src/content/blog/`
- [ ] Update frontmatter (compare Hugo vs Astro format in existing demo posts)
- [ ] Verify post renders at `http://localhost:4321/blog/first-post/`

**Frontmatter changes (if needed):**
```yaml
# Hugo format
---
title: "Post Title"
date: 2024-01-01
draft: false
---

# Astro format (theme uses)
---
title: "Post Title"
publishDate: 2024-01-01
description: "Short description for SEO"
tags: ["tag1", "tag2"]
draft: false
---
```

#### 2.3: Copy Static Assets
- [ ] Copy `soma-blog-hugo/static/images/` → `public/images/`
- [ ] Copy `soma-blog-hugo/static/logos/` → `public/logos/` (company logos for timeline)
- [ ] Copy `soma-blog-hugo/static/css/ab-simulator.css` → `public/css/` (for A/B test)
- [ ] Copy `soma-blog-hugo/static/js/ab-simulator.js` → `public/js/` (preserve as-is)
- [ ] Verify assets accessible at `/images/`, `/logos/`, etc.

#### 2.4: Copy Timeline Data
- [ ] Copy `soma-blog-hugo/data/timeline.yaml` → `src/data/timeline.yaml`
- [ ] Verify YAML format is valid (open file, check syntax)
- [ ] No changes needed yet (will use in Phase 3)

#### 2.5: Test Content Rendering
- [ ] Visit blog listing: `http://localhost:4321/blog/`
- [ ] Click your blog post, verify it displays correctly
- [ ] Check images load (if referenced in markdown)
- [ ] Test markdown features (code blocks, links, lists)

### Success Criteria
- ✅ Your blog post visible on site
- ✅ All static assets accessible
- ✅ Images and logos copied correctly
- ✅ Timeline YAML in place (ready for next phase)
- ✅ No broken links or missing assets

### Rollback Plan
- Content still exists in `soma-blog-hugo`
- Can re-copy if issues occur
- No production impact yet

---

## PHASE 3: Replace Experience Section with Timeline

**Goal:** Build custom timeline component, replace demo Experience section

**Time:** 1.5 hours  
**Difficulty:** ⭐⭐ Medium  
**Blockers:** Phase 2 complete

### Tasks

#### 3.1: Create Timeline Component
- [ ] Create `src/components/Timeline.tsx` (React component for animations)
- [ ] Import timeline YAML: `import timelineData from '../data/timeline.yaml'`
- [ ] Define TypeScript interface for timeline items
- [ ] Build basic structure with Tailwind grid (3-column: timespan | logo | content)

**Component skeleton:**
```tsx
// src/components/Timeline.tsx
import { motion } from 'framer-motion';

interface TimelineItem {
  timespan: string;
  title: string;
  company?: string;
  logo?: string;
  description?: string;
  details?: string[];
}

export default function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="relative grid gap-8">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="grid grid-cols-[160px_80px_1fr] gap-x-8 items-start"
        >
          {/* Timespan */}
          <div className="text-sm text-muted-foreground">{item.timespan}</div>
          
          {/* Logo */}
          <div className="relative">
            {item.logo && (
              <img src={`/logos/${item.logo}`} alt={item.company} className="h-12 w-12 object-contain" />
            )}
          </div>
          
          {/* Content */}
          <div>
            <h3 className="font-semibold">{item.title}</h3>
            {item.company && <p className="text-muted-foreground">{item.company}</p>}
            {item.description && <p className="mt-2">{item.description}</p>}
            {item.details && (
              <ul className="mt-2 list-disc list-inside">
                {item.details.map((detail, j) => <li key={j}>{detail}</li>)}
              </ul>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
```

#### 3.2: Update Homepage to Use Timeline
- [ ] Open `src/pages/index.astro`
- [ ] Find `<Section title='Experience'>` section
- [ ] Replace all `<Card>` components with your Timeline component
- [ ] Import timeline data and pass to component
- [ ] Import Timeline component with client directive: `<Timeline client:visible items={timelineData} />`

**Before (demo content):**
```astro
<Section title='Experience'>
  <Card heading='Lorem Ipsum' ... />
  <Card heading='Lorem Ipsum' ... />
</Section>
```

**After (your timeline):**
```astro
---
import Timeline from '@/components/Timeline';
import timelineData from '@/data/timeline.yaml';
---

<Section title='Experience'>
  <Timeline client:visible items={timelineData} />
</Section>
```

#### 3.3: Style and Polish
- [ ] Match visual design to your Hugo timeline (colors, spacing)
- [ ] Add responsive design (collapse to single column on mobile)
- [ ] Test animations (scroll to see fade-in effects)
- [ ] Adjust spacing using Tailwind classes

#### 3.4: Remove Unused Sections (Optional)
- [ ] Delete `<Section title='Education'>` if not needed
- [ ] Delete `<Section title='Certifications'>` if not needed
- [ ] Delete `<Section title='Skills'>` if not needed (or keep and customize)
- [ ] Simplify homepage to focus on what matters

#### 3.5: Test Timeline
- [ ] Visit homepage, scroll to Experience section
- [ ] Verify timeline items display correctly
- [ ] Check logos load (from `/public/logos/`)
- [ ] Test on mobile (responsive layout)
- [ ] Verify animations work smoothly

### Success Criteria
- ✅ Timeline component working
- ✅ Your work history displayed correctly
- ✅ Logos visible and properly sized
- ✅ Animations smooth and performant
- ✅ Mobile responsive
- ✅ Replaces old 130-line CSS with clean React component

### Rollback Plan
- Keep demo `<Card>` components as backup
- Can switch back to static version if animations cause issues
- Timeline data safe in YAML file

---

## PHASE 4: Customize Homepage & Add Pages

**Goal:** Personalize homepage, create custom pages (Projects showcase, standalone About)

**Time:** 1 hour  
**Difficulty:** ⭐⭐ Medium  
**Blockers:** Phase 3 complete

### Tasks

#### 4.1: Customize Homepage Hero Section
- [ ] Edit `src/pages/index.astro`
- [ ] Update hero section with your name, tagline
- [ ] Update location label (or remove if not needed)
- [ ] Update LinkedIn/GitHub links to your profiles
- [ ] Replace "Get free template" CTA with your own CTA (or remove)

#### 4.2: Update About Section
- [ ] Replace demo "Lorem ipsum" text with your real bio
- [ ] Keep it concise (2-3 sentences for homepage)
- [ ] Link to full About page if needed

#### 4.3: Customize Projects Section
- [ ] Update `<ProjectCard>` components with your projects
- [ ] Add A/B Test Simulator project:
  ```astro
  <ProjectCard
    href='/projects/ab-test-simulator'
    heading='A/B Test Simulator'
    subheading='Interactive word search puzzle with PostHog experiments'
    imagePath='/images/ab-simulator-preview.png'
    altText='A/B Test Simulator'
    class='w-full sm:w-1/2'
  />
  ```
- [ ] Add more projects as needed (or remove second card)

#### 4.4: Remove/Customize Unwanted Sections
- [ ] **Education section**: Delete if not needed
- [ ] **Certifications section**: Delete if not needed  
- [ ] **Skills section**: Keep and customize, or delete
- [ ] Reorder sections if desired (drag `<Section>` blocks)

#### 4.5: Create Projects Showcase Page (Optional)
- [ ] Create `src/pages/projects.astro` (if you want dedicated page)
- [ ] Copy structure from homepage Projects section
- [ ] Expand with more details about each project
- [ ] Add navigation link in header (edit `src/layouts/BaseLayout.astro`)

**Or repurpose existing `/tools` page:**
- [ ] Rename `src/pages/tools/` to `src/pages/projects/`
- [ ] Update content for your projects
- [ ] Keep same structure

#### 4.6: Create Standalone About Page (Optional)
- [ ] Create `src/pages/about.astro`
- [ ] Add full bio text (longer than homepage version)
- [ ] Include Timeline component: `<Timeline client:visible items={timelineData} />`
- [ ] Add any additional sections (values, philosophy, etc.)
- [ ] Add navigation link in header

#### 4.7: Update Site Navigation
- [ ] Open `src/layouts/BaseLayout.astro`
- [ ] Find navigation menu
- [ ] Update links:
  - Home → `/`
  - Blog → `/blog`
  - Projects → `/projects` (if created)
  - About → `/about` (if created)
- [ ] Remove "Tools" link if not using

### Success Criteria
- ✅ Homepage personalized with your content
- ✅ Demo text replaced with real content
- ✅ Projects section shows your work
- ✅ Unnecessary sections removed
- ✅ Navigation updated
- ✅ Optional pages created (Projects, About)
- ✅ Site feels like yours, not a template

### Rollback Plan
- Git commit before making changes
- Can revert to demo content if needed
- Easy to re-add sections later

---

## PHASE 5: Add PostHog, A/B Simulator, Streamlit

**Goal:** Migrate your integrations (PostHog, A/B test, Streamlit dashboard)

**Time:** 1.5 hours  
**Difficulty:** ⭐⭐ Medium  
**Blockers:** Phase 4 complete

### Tasks

#### 5.1: Add PostHog SDK to Base Layout
- [ ] Open `src/layouts/BaseLayout.astro`
- [ ] Add PostHog script to `<head>` (copy from Hugo `baseof.html`):
  ```html
  <script>
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){...
  </script>
  ```
- [ ] Initialize PostHog with your project key
- [ ] Add console warning suppression script (if needed)
- [ ] Test PostHog loads: Check browser DevTools → Network tab

#### 5.2: Create A/B Test Simulator Page
- [ ] Create `src/pages/projects/ab-test-simulator.astro`
- [ ] Copy HTML structure from Hugo `ab-test-simulator.md`
- [ ] Add CSS: Copy `/public/css/ab-simulator.css` content (or refactor to Tailwind)
- [ ] Add JavaScript: Include script from `/public/js/ab-simulator.js`
- [ ] Wire up PostHog feature flags:
  ```astro
  <script>
    // Get variant from PostHog
    const variant = posthog.getFeatureFlag('word-search-difficulty');
    // Rest of game logic...
  </script>
  ```

**Or create React component:**
- [ ] Create `src/components/ABSimulator.tsx` (React island)
- [ ] Port game logic to React (useState, useEffect)
- [ ] Use PostHog React SDK: `pnpm add posthog-js`
- [ ] Render with: `<ABSimulator client:load />`

#### 5.3: Add Streamlit Dashboard Embed
- [ ] Create `src/components/StreamlitDashboard.astro`
- [ ] Add iframe embed:
  ```astro
  <iframe
    src="https://soma-app-dashboard-bfabkj7dkvffezprdsnm78.streamlit.app"
    width="100%"
    height="800px"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  ></iframe>
  ```
- [ ] Add loading state (optional)
- [ ] Style with Tailwind (rounded corners, shadow, etc.)

#### 5.4: Embed Dashboard on Page
- [ ] Option A: Add to homepage Projects section
- [ ] Option B: Create dedicated `/dashboard` page
- [ ] Option C: Embed in A/B simulator page (show results)
- [ ] Import and use: `<StreamlitDashboard />`

#### 5.5: Test Complete Integration Flow
- [ ] Visit A/B simulator page
- [ ] Play puzzle game
- [ ] Check PostHog dashboard for events (posthog.com)
- [ ] Check Supabase database for events (via Streamlit)
- [ ] Verify Streamlit dashboard displays data
- [ ] Confirm end-to-end pipeline works

#### 5.6: Suppress Console Warnings (Optional)
- [ ] If SameSite cookie warnings appear, add suppression:
  ```html
  <script>
    // Suppress SameSite warnings from Streamlit iframe
    const originalWarn = console.warn;
    console.warn = function(...args) {
      if (args[0]?.includes('SameSite')) return;
      originalWarn.apply(console, args);
    };
  </script>
  ```

### Success Criteria
- ✅ PostHog SDK loaded and tracking
- ✅ Feature flags working (A/B test assigns variants)
- ✅ Puzzle game functional and fun
- ✅ PostHog events captured
- ✅ Streamlit dashboard embeds correctly
- ✅ Data flows: Game → PostHog → Supabase → Streamlit
- ✅ No console errors (or suppressed)

### Rollback Plan
- Keep Hugo site running in parallel during testing
- PostHog and Supabase unchanged (no risk to data)
- Can revert A/B simulator to Hugo version if issues
- Streamlit dashboard unaffected (separate deployment)

---

## PHASE 6: Build, Deploy & Launch

**Goal:** Deploy Astro site to Fly.io, verify production works

**Time:** 1 hour  
**Difficulty:** ⭐ Easy  
**Blockers:** Phase 5 complete

### Tasks

#### 6.1: Test Production Build Locally
- [ ] Run production build: `pnpm build` (or `npm run build`)
- [ ] Check build output in `dist/` folder
- [ ] Preview production build: `pnpm preview`
- [ ] Visit `http://localhost:4321` and test all features
- [ ] Verify no build errors or warnings

#### 6.2: Create Dockerfile for Astro
- [ ] Create `Dockerfile` in project root:
  ```dockerfile
  FROM node:20-alpine AS builder
  WORKDIR /app
  COPY package*.json pnpm-lock.yaml ./
  RUN npm install -g pnpm
  RUN pnpm install
  COPY . .
  RUN pnpm build

  FROM nginx:alpine
  COPY --from=builder /app/dist /usr/share/nginx/html
  EXPOSE 8080
  CMD ["nginx", "-g", "daemon off;"]
  ```
- [ ] Test Docker build locally: `docker build -t soma-astro .`
- [ ] Test Docker run: `docker run -p 8080:8080 soma-astro`
- [ ] Verify site loads at `http://localhost:8080`

#### 6.3: Update fly.toml Configuration
- [ ] Copy `fly.toml` from Hugo project (or create new)
- [ ] Update app name: `soma-portfolio` or reuse existing
- [ ] Set internal port to 8080 (matches nginx)
- [ ] Add environment variables if needed:
  ```toml
  [env]
    PORT = "8080"
  ```
- [ ] Verify configuration valid: `fly config validate`

#### 6.4: Deploy to Fly.io Staging (Recommended)
- [ ] Create staging app: `fly apps create soma-portfolio-staging`
- [ ] Deploy staging: `fly deploy --app soma-portfolio-staging`
- [ ] Wait for deployment to complete
- [ ] Visit staging URL: `https://soma-portfolio-staging.fly.dev`
- [ ] Test ALL features thoroughly on staging

**Staging checklist:**
- [ ] Homepage loads with your content
- [ ] Blog posts display correctly
- [ ] Timeline animates smoothly
- [ ] A/B simulator game works
- [ ] PostHog events fire (check dashboard)
- [ ] Streamlit dashboard embeds
- [ ] Mobile responsive
- [ ] No console errors

#### 6.5: Deploy to Production
- [ ] Deploy to main app: `fly deploy` (or `fly deploy --app soma-blog`)
- [ ] Monitor deployment logs: `fly logs`
- [ ] Verify deployment successful
- [ ] Visit production URL
- [ ] Run through full feature checklist again

#### 6.6: Post-Deployment Verification
- [ ] Test on multiple devices (desktop, mobile, tablet)
- [ ] Test on multiple browsers (Chrome, Safari, Firefox)
- [ ] Check PostHog analytics dashboard (events flowing?)
- [ ] Check Supabase database (data persisting?)
- [ ] Verify Streamlit dashboard updates with new data
- [ ] Test performance (Lighthouse, PageSpeed Insights)
- [ ] Check for any console errors or warnings

#### 6.7: Update Domain (If Needed)
- [ ] If using custom domain, update DNS
- [ ] Configure SSL certificate: `fly certs create yourdomain.com`
- [ ] Verify domain resolves correctly
- [ ] Test HTTPS works

#### 6.8: Clean Up
- [ ] Remove old Hugo site deployment (if satisfied)
- [ ] Or keep Hugo as backup for a week
- [ ] Update GitHub repo description
- [ ] Celebrate! 🎉

### Success Criteria
- ✅ Astro site deployed to Fly.io
- ✅ Production build works perfectly
- ✅ All features functional in production
- ✅ Performance good (<3s load time)
- ✅ Mobile responsive
- ✅ No broken links or console errors
- ✅ PostHog tracking verified
- ✅ Streamlit embed working
- ✅ Ready to show off to the world!

### Rollback Plan
- Keep Hugo site running during testing
- If issues found, point domain back to Hugo: `fly apps create`
- Can redeploy Astro after fixes
- Zero downtime with Fly.io's blue-green deployment
- Supabase and PostHog unchanged (no data loss risk)

---

## Post-Migration Enhancements (Future Phases)

**Not part of initial migration, but enabled by Astro:**

### Enhancement 1: Interactive Blog Filters
- Add React component for filtering by tags/series
- Real-time search with Fuse.js
- Smooth transitions

### Enhancement 2: ML-Powered Recommendations
- Create React island that fetches from your API
- Display "Related Posts" based on content similarity
- Use your data science skills

### Enhancement 3: Enhanced Timeline
- Add Aceternity UI animated timeline templates
- Timeline item expand/collapse
- Timeline filtering by company/role type

### Enhancement 4: Dark Mode
- Add theme toggle (Tailwind dark mode)
- Persist user preference
- Smooth theme transitions

### Enhancement 5: Performance Optimization
- Optimize images with Astro image component
- Add view transitions
- Lazy load components
- Achieve 95+ Lighthouse score

---

## Success Metrics

### Code Reduction
- Timeline: 130 lines → ~60 lines (53% reduction)
- CSS: Inline styles → Tailwind utilities (80%+ reduction)
- Shortcodes: Hugo partials → React components (cleaner)

### Performance
- Load time: <3 seconds (maintain current)
- Lighthouse score: 90+ (improve from baseline)
- Bundle size: Monitor with Astro build stats

### Feature Parity
- ✅ All current features working
- ✅ PostHog integration intact
- ✅ Supabase connection intact
- ✅ Streamlit embed intact
- ✅ A/B test simulator working

### User Experience
- ✅ Smooth animations
- ✅ Mobile responsive
- ✅ Fast navigation
- ✅ No console errors

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| PostHog breaks | Low | High | Test thoroughly, keep SDK unchanged |
| Streamlit embed fails | Low | High | CSP headers, test iframe |
| Timeline animations janky | Medium | Low | Can disable, fallback to static |
| Build time increases | Low | Low | Astro is fast, should be fine |
| Fly.io deployment issues | Low | Medium | Keep Hugo running, blue-green deploy |
| Content migration errors | Low | Medium | Validate markdown, test locally |

---

## Decision Log

### Why Astro?
- Static by default (like Hugo)
- Islands for interactivity (only where needed)
- Excellent DX (hot reload, TypeScript)
- React ecosystem access
- Easy migration path

### Why Tailwind?
- Reduce custom CSS from 130 lines → utilities
- Faster iteration
- Consistent design system
- Industry standard

### Why React Islands?
- Minimal JS (only for interactive components)
- Easy to understand
- Large component ecosystem
- Your familiarity

### Why Keep Integrations?
- PostHog, Supabase, Streamlit already work
- Zero risk migration (don't touch what works)
- Focus on frontend improvements only

---

## Communication Plan

### During Migration
- Commit after each phase completion
- Tag commits: `migration-phase-1`, etc.
- Document blockers immediately

### After Migration
- Update README with new tech stack
- Document new component structure
- Create blog post: "Why We Migrated Hugo → Astro"

---

## Timeline

### Day 1 (8 hours)
- **Morning (4h):** Phase 1-2 (Setup + Content)
- **Afternoon (4h):** Phase 3 (Timeline component)

### OR Spread Over Week
- **Day 1:** Phase 1-2 (2h)
- **Day 2:** Phase 3 (2h)
- **Day 3:** Phase 4 (1.5h)
- **Day 4:** Phase 5 (1.5h)
- **Day 5:** Phase 6 (1h)

---

## Next Steps

When ready to start:

1. **Create workspace**: `npm create astro@latest soma-portfolio`
2. **Open migration doc**: Keep this file open as checklist
3. **Start Phase 1**: Check off tasks as you complete them
4. **Commit often**: After each task or phase
5. **Ask for help**: If stuck, describe blocker with context

---

## Summary: What You're Getting

### Before (Hugo)
- ❌ 130 lines of custom CSS for timeline
- ❌ Limited interactivity (static site only)
- ❌ Hugo shortcodes (template-specific)
- ❌ Rusty Typewriter theme (harder to customize)
- ❌ Go templates (unfamiliar)

### After (Astro + Theme Resume)
- ✅ **Professional resume-style homepage** (ready to use)
- ✅ **Modular `<Section>` components** (super easy to customize)
- ✅ **Clean timeline with Framer Motion** (50%+ less code)
- ✅ **Built-in blog system** (tags, search, RSS, pagination)
- ✅ **Project showcase** (perfect for A/B simulator)
- ✅ **React islands** (add interactivity where needed)
- ✅ **Tailwind CSS** (rapid styling, consistent design)
- ✅ **TypeScript** (type safety, better DX)
- ✅ **Modern animations** (smooth, performant)
- ✅ **All integrations preserved** (PostHog, Supabase, Streamlit)

---

**Status:** 🟢 READY TO START  
**Theme:** [Astro Theme Resume](https://astro-theme-resume.vercel.app/) - Perfect balance of blog + portfolio  
**Estimated Time:** 5.5 hours total (spread over days or do in one session)  
**Risk Level:** 🟢 Low (Hugo site stays running until verified)  
**Excitement Level:** 🚀 VERY HIGH

Let's build something amazing! The theme does 70% of the work, we just customize it for your needs.
