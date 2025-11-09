# SOMA Portfolio: Complete Project History

**Status:** 🟢 LIVE | **Domain:** https://eeshans.com | **Current Version:** Astro 4.4.15 | **Updated:** Nov 8, 2025

---

## Memory Refresh (Read This First)

**What is SOMA?** A demonstration portfolio site showcasing enterprise-grade analytics, experimentation, and data science workflows through an interactive A/B test simulator.

**Three Repos:**
1. `soma-blog-hugo` - Original Hugo blog (Oct 2025, now archived)
2. `soma-streamlit-dashboard` - Analytics dashboard (Oct 2025, still live)
3. `soma-portfolio` - New Astro portfolio (Nov 2025, current production)

**Key Insight:** Each phase solved a different problem. Hugo + PostHog + Supabase + Streamlit proved the concept. Astro migration consolidated everything into one clean, modern stack.

**Most Important File:** This file. Keep it current.

---

## Working Principles for AI Assistant [READ AND MEMORIZE]

Applied consistently across all three projects:

- **Fix root causes, not symptoms** — Research docs/code deeply before claiming to understand a problem
- **Chunk-based delivery** — Complete small, verifiable pieces. Test before proceeding to next chunk
- **Brutalize scope** — Remove features/configs/dependencies that don't earn their weight. Prefer simplicity over completeness
- **Enterprise mindset** — Every decision should be defensible in a real company context. No toy code
- **Tools over custom code** — Prefer established tools (PostHog, Streamlit, Tailwind) over rolling custom solutions
- **Test thoroughly before shipping** — Build locally, test all features, verify production-like behavior
- **Commit small, clear changes** — One logical fix per commit. Descriptive messages. Easy to review and rollback
- **Code inspection over assumptions** — Read actual files/output. Don't guess about behavior

**When restarting:** Re-read these principles first. They define your decision-making framework.

---


## Tech Stack & Architecture

### Current Stack (Astro Era)

**Frontend:** Astro 4.4.15 (static site generation) + Tailwind CSS + React (islands)  
**Runtime:** Node.js 20 (build time only)  
**Styling:** Tailwind utilities (no custom CSS)  
**Animations:** Tailwind transforms (formerly Framer Motion)  
**Components:** React for timeline, pure Astro/HTML for everything else

**Deployment Stack:**
```
npm run build          → Astro compiles pages to dist/ (1.07s locally)
Docker multi-stage    → Node 20 build → Nginx Alpine (~23MB image)
Fly.io                → soma-portfolio app, dfw region, 2 machines
Let's Encrypt         → SSL/TLS (eeshans.com + www, auto-renewing)
GitHub Actions        → Auto-deploy on main push (needs FLY_API_TOKEN secret)
Cloudflare            → DNS records (A + AAAA + CNAME for www)
```

### Local runs
* For Astro site: ```npm run dev```
* For Hugo site: ```hugo server -D```
* For Streamlit: ```streamlit run app.py```

### Previous Stack (Hugo Era - ARCHIVED)

**Frontend:** Hugo (Go templates) + Rusty Typewriter theme + custom CSS  
**Backend:** FastAPI (Python) on Fly.io - REMOVED  
**Analytics:** PostHog SDK → Supabase Edge Function webhook → PostgreSQL  
**Dashboard:** Streamlit app (still live, embedding in Astro now)

### Shared Infrastructure (Both Eras)

**PostHog:** Feature flags + event tracking
- API Key: `phc_zfue5Ca8VaxypRHPCi9j2h2R3Qy1eytEHt3TMPWlOOS`
- Host: `https://us.i.posthog.com`
- Feature flag: `word_search_difficulty_v2` (50/50 A/B test)

**Supabase:** PostgreSQL database + Edge Functions
- Project: `nazioidbiydxduonenmb`
- Host: `aws-1-us-east-2.pooler.supabase.com` (connection pooler on port 6543)
- Webhook: PostHog → Edge Function → Events table
- Views: v_variant_stats, v_conversion_funnel, v_stats_by_hour

**Streamlit:** Analytics dashboard (Python app)
- URL: `https://soma-app-dashboard-bfabkj7dkvffezprdsnm78.streamlit.app`
- Repo: soma-streamlit-dashboard
- Refresh: 10-second cache TTL
- Embedding: Iframe in `/projects/ab-test-simulator` page

### Configuration Files (Critical)

**astro.config.mjs** - Site URL must be `https://eeshans.com` (affects canonical URLs & sitemap)  
**Dockerfile** - Nginx must have `port_in_redirect off;` (prevents :8080 in URLs)  
**fly.toml** - No PORT env variable (kept bloat-free)  
**.env** - Contains `PUBLIC_POSTHOG_KEY` and `PUBLIC_POSTHOG_HOST` (git-ignored)

---

## Complete Project Timeline

**Total Project Time:** ~25.75 hours | **Status:** ✅ Complete & Live

### Phase 0: Hugo Blog Foundation (Sept 2025)
Started with Hugo (Go templates) + custom CSS (130 lines) + vanilla JavaScript (489 lines) + A/B puzzle game hosted on Fly.io. Problem: Everything custom-built, hard to iterate, stats calculation scattered.

### Phase 1: PostHog + Supabase Integration (Oct 25, 2025) — 11 hours
Built modern data pipeline by replacing FastAPI middleware with established tools. Split into 7 chunks:
- PostHog SDK integration + event tracking (2h)
- PostHog webhook → Supabase pipeline + database schema (3h)
- Streamlit dashboard built in Python (3h)
- Streamlit iframe embedded in Hugo + end-to-end testing (1h)
- Documentation + polish (1h)

**Key Result:** Enterprise-grade data pipeline proven. Switched from custom code to tools-first approach (PostHog → Supabase → Streamlit).

### Phase 2: Hugo to Astro Migration (Nov 1-8, 2025) — 14.75 hours
Migrated to modern Astro framework while preserving all integrations:
- Setup + content migration (1.25h)
- Built React Timeline component with 7 company logos (1.5h)
- Personalized homepage, projects, simulator pages (3h)
- Re-integrated PostHog + Streamlit embed (1.5h)
- Minimized JavaScript 489→250 lines (49%) + CSS 130→0 lines (Tailwind) (1.5h)
- Removed framer-motion dependency, migrated animations to Tailwind (0.5h)
- Docker multi-stage build + Fly.io deployment (2h)
- Custom domain (eeshans.com) + Let's Encrypt SSL (1.5h)
- Fixed :8080 port issue in Nginx `port_in_redirect off;` (1h)

**Result:** Modern portfolio site live at https://eeshans.com with all 11 pages working, zero console errors, 23MB Docker image.

### Phase 3: Production Polish (Nov 8, 2025)
- Copied profile image from Hugo to Astro assets (69KB)
- Updated header branding from "resume" to "Eeshan S."
- Increased profile image size from h-28 to 200px
- Scaled Hugo site to zero machines (preserved, not deleted)
- Disabled GitHub Actions on Hugo (preserved workflow code)

---



## How to Maintain This

**If you need to change the puzzle game:**
- Edit: `public/js/ab-simulator.js`
- Test: `npm run dev` → navigate to `/projects/ab-test-simulator`
- Verify: Play game, check PostHog events 30 seconds later
- Deploy: `git add -A && git commit -m "fix: ..."` → `git push origin main`

**If you need to change styling:**
- Edit: `tailwind.config.js` or `src/styles/app.css`
- No custom CSS files (everything is Tailwind)
- Test locally, then deploy

**If you need to add a blog post:**
- Create: `src/content/post/[slug].md` with frontmatter
- Test: `npm run dev` → check `/blog` and `/blog/[slug]`
- Deploy: Push to main

**If PostHog events aren't tracking:**
- Check: `.env` has `PUBLIC_POSTHOG_KEY` and `PUBLIC_POSTHOG_HOST`
- Test: Open browser DevTools → Network → look for posthog requests
- Verify: Post to `https://us.i.posthog.com/e/` should exist
- Check PostHog dashboard directly

**If site won't build:**
- Run: `npm run build` locally to see error details
- Check: All astro.config.mjs settings correct
- Verify: No TypeScript errors
- Test: `npm run preview` to simulate production

---

## Quick Reference

**Critical Files to Know:**
- `astro.config.mjs` - Build config, integrations, site URL
- `Dockerfile` - Container build (Node 20 → Nginx Alpine)
- `fly.toml` - Fly.io config (app name, region, port)
- `src/pages/index.astro` - Homepage
- `src/pages/projects/ab-test-simulator.astro` - Puzzle page
- `public/js/ab-simulator.js` - Game logic & PostHog tracking
- `.env` - PostHog credentials (git-ignored)
- `.github/workflows/deploy.yml` - CI/CD pipeline

**Most Common Commands:**
- `npm run dev` - Start dev server (localhost:4321)
- `npm run build` - Build for production (creates dist/)
- `npm run preview` - Test production build locally
- `fly deploy` - Deploy to Fly.io manually
- `fly logs` - Check deployment logs
- `fly certs check eeshans.com` - Verify SSL certificate

**Useful One-Liners:**
```bash
# Deploy and see live logs
git push origin main && sleep 5 && fly logs -a soma-portfolio

# Test production build works
npm run build && npm run preview

# Reset PostHog variant (in browser console)
localStorage.clear(); posthog.reset(); location.reload();
```

---

## For Future Sessions

1. Read the "Working Principles" section above (defines how you think)
2. Check the "Tech Stack & Architecture" section (current state)
3. Understand the three repos: Hugo (archived), Streamlit (still running), Astro (current)
4. If something breaks, look at "Critical Fixes" first (you've seen these problems before)
5. Keep this file updated with each major change

This document is your north star. Update it. Reference it.

