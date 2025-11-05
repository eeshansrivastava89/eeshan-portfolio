# Hugo → Astro Migration Plan

**Goal:** Migrate to [Astro Theme Resume](https://github.com/srleom/astro-theme-resume)  
**Time:** ~5.5 hours | **Status:** 🟢 READY

---

## Theme Choice: Astro Theme Resume ✅

**Why:** Resume + blog balance | Modular components | Astro v4 + Tailwind + TypeScript | Professional design

**Changes:**
- Replace Experience → Animated timeline  
- Keep Projects → A/B simulator
- Keep Blog → Tags, search, RSS
- Remove Education/Certifications

**Structure:** Hero → About → Posts → Timeline → Projects → Skills  
**Demo:** [astro-theme-resume.vercel.app](https://astro-theme-resume.vercel.app/)

---

## What We're Keeping/Replacing

**Keep:** Blog content, timeline.yaml, PostHog, Supabase, Streamlit, A/B simulator, logos, domain  
**Replace:** Hugo → Astro | 130-line CSS → Tailwind + Framer | Rusty Typewriter → Theme Resume

---

## Migration Phases (6)

### PHASE 1: Clone & Setup (30 min) ⭐ Easy

**Tasks:**
1. Clone: `git clone https://github.com/srleom/astro-theme-resume.git soma-portfolio`
2. Install: `cd soma-portfolio && pnpm install` (or npm)
3. Run: `pnpm dev` → Visit `http://localhost:4321`
4. Configure: Edit `src/site.config.ts` (title, author, links)
5. Install extras: `pnpm add framer-motion js-yaml @types/js-yaml`

**Success:** ✅ Theme running locally | Config updated | Dependencies installed

---

### PHASE 2: Content Migration (45 min) ⭐ Easy

**Tasks:**
1. Delete demo posts from `src/content/blog/`
2. Copy your posts: `soma-blog-hugo/content/posts/*.md` → `src/content/blog/`
3. Update frontmatter (Hugo → Astro format: `date` → `publishDate`, add `description`)
4. Copy assets:
   - `/static/images/` → `public/images/`
   - `/static/logos/` → `public/logos/`
   - `/static/css/ab-simulator.css` → `public/css/`
   - `/static/js/ab-simulator.js` → `public/js/`
5. Copy timeline: `/data/timeline.yaml` → `src/data/timeline.yaml`

**Success:** ✅ Blog posts visible | Assets accessible | Timeline data ready

---

### PHASE 3: Timeline Component (1.5 hrs) ⭐⭐ Medium

**Tasks:**
1. Create `src/components/Timeline.tsx`:
```tsx
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
    <div className="grid gap-8">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="grid grid-cols-[160px_80px_1fr] gap-x-8 items-start"
        >
          <div className="text-sm text-muted-foreground">{item.timespan}</div>
          <div>{item.logo && <img src={`/logos/${item.logo}`} className="h-12 w-12" />}</div>
          <div>
            <h3 className="font-semibold">{item.title}</h3>
            {item.company && <p className="text-muted-foreground">{item.company}</p>}
            {item.description && <p className="mt-2">{item.description}</p>}
            {item.details && <ul className="mt-2 list-disc list-inside">
              {item.details.map((d, j) => <li key={j}>{d}</li>)}
            </ul>}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
```

2. Update `src/pages/index.astro`:
```astro
---
import Timeline from '@/components/Timeline';
import timelineData from '@/data/timeline.yaml';
---

<Section title='Experience'>
  <Timeline client:visible items={timelineData} />
</Section>
```

3. Remove Education/Certifications/Skills sections (delete from index.astro)
4. Test timeline animates on scroll

**Success:** ✅ Timeline working | Animations smooth | Mobile responsive

---

### PHASE 4: Customize Homepage (1 hr) ⭐⭐ Medium

**Tasks:**
1. Edit `src/pages/index.astro` hero section (name, tagline, links)
2. Update About section (replace lorem ipsum with your bio)
3. Update Projects:
```astro
<ProjectCard
  href='/projects/ab-test-simulator'
  heading='A/B Test Simulator'
  subheading='Interactive word search with PostHog experiments'
  imagePath='/images/ab-simulator-preview.png'
/>
```
4. Remove unwanted sections (Education, Certifications, Skills)
5. Optional: Create `src/pages/projects.astro` for expanded showcase

**Success:** ✅ Homepage personalized | Demo text replaced | Navigation updated

---

### PHASE 5: Integrations (1.5 hrs) ⭐⭐ Medium

**Tasks:**
1. **PostHog:** Add to `src/layouts/BaseLayout.astro` `<head>`:
```html
<script>
  !function(t,e){/* PostHog snippet from Hugo */}();
  posthog.init('YOUR_API_KEY');
</script>
```

2. **A/B Simulator:** Create `src/pages/projects/ab-test-simulator.astro`:
```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
---
<BaseLayout title="A/B Test Simulator">
  <div id="puzzle-container"></div>
  <script src="/js/ab-simulator.js"></script>
  <link rel="stylesheet" href="/css/ab-simulator.css">
</BaseLayout>
```

3. **Streamlit Dashboard:** Create `src/components/StreamlitDashboard.astro`:
```astro
<iframe
  src="https://soma-app-dashboard-bfabkj7dkvffezprdsnm78.streamlit.app"
  width="100%"
  height="800px"
  class="rounded-lg shadow-lg"
/>
```

4. Test full pipeline: Play game → Check PostHog → Check Supabase → Check Streamlit

**Success:** ✅ PostHog tracking | A/B test working | Streamlit embedded | Pipeline intact

---

### PHASE 6: Deploy (1 hr) ⭐ Easy

**Tasks:**
1. Test build: `pnpm build && pnpm preview`
2. Create `Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```
3. Update `fly.toml` (port 8080, app name)
4. Deploy staging: `fly deploy --app soma-portfolio-staging`
5. Test staging thoroughly
6. Deploy production: `fly deploy`
7. Verify: Homepage, blog, timeline, A/B test, PostHog, Streamlit

**Success:** ✅ Deployed | All features working | Performance good | 🎉

---

## Quick Reference

**Time Breakdown:**
- Phase 1: 30m (setup)
- Phase 2: 45m (content)  
- Phase 3: 1.5h (timeline)
- Phase 4: 1h (customize)
- Phase 5: 1.5h (integrations)
- Phase 6: 1h (deploy)
- **Total: 5.5 hours**

**Key Files:**
- `src/site.config.ts` - Site metadata
- `src/pages/index.astro` - Homepage
- `src/layouts/BaseLayout.astro` - PostHog goes here
- `src/components/Timeline.tsx` - Custom timeline
- `src/data/timeline.yaml` - Your work history

**Rollback:** Keep Hugo running until Astro verified. No data loss risk (PostHog/Supabase unchanged).

---

**Status:** 🟢 READY | Theme does 70% of work, you customize 30% | Let's go! 🚀
