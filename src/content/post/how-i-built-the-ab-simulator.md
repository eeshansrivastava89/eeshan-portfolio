---
title: 'From Parameters to Product: How I Built the A/B Simulator'
description: 'A technical deep-dive into pivoting from a data science blog to a full-stack product, and the architectural lessons learned along the way.'
publishDate: '2025-11-22'
draft: true
featured: true
category: technical
tags: ['engineering', 'analytics', 'astro', 'supabase']
projectId: ab-simulator
---

I never intended to build a memory game.

Months ago, I started with a simple goal: create a blog to write about data science. I wanted to pontificate on A/B testing, Marketing Mix Modeling, and statistical significance. I spun up a Hugo site, picked a "Rusty Typewriter" theme, and sat down to write.

But a nagging thought kept stopping me: _Why write about doing data science when I could just... do it?_

What if, instead of writing a tutorial on "How to Calculate Lift," I built a live product where people generated that lift in real time? What if I built a simulator?

This decision kicked off a 25-hour journey that transformed a static blog into a production-grade experimentation platform. It forced me to abandon my comfort zone (Python backends), embrace modern tools (Supabase, PostHog, Astro), and fundamentally change how I build software.

Here is the story of how I built the A/B Testing Simulator, and the "brutal" principles that emerged along the way.

## Phase 1: The "Custom Code" Trap

My first instinct was to build everything myself. I'm a data scientist, so I reach for Python.

I built a custom FastAPI backend to handle clicks. I wrote raw SQL queries. I managed state in a complex vanilla JavaScript file (489 lines of spaghetti). I deployed everything to Fly.io.

It worked, but it was fragile.

- **Latency:** My Python dashboard took 15-20 seconds to load because I was doing heavy joins on every request.
- **Maintenance:** I was debugging deployment scripts instead of analyzing data.
- **Complexity:** I had created a distributed system just to count pineapples.

I had violated my own rule: **Don't build what you can buy (or use for free).**

## Phase 2: The "Tools First" Pivot

I realized I wasn't building a backend engineering portfolio; I was building a _data product_. The backend needed to disappear.

I decided to burn it down.

- **Tracking:** Replaced my custom click logger with **PostHog**. Zero maintenance event capture.
- **Database:** Replaced my local Postgres with **Supabase**.
- **API:** Replaced my FastAPI endpoints with **PostgREST**.

Why write an API endpoint to `SELECT count(*) FROM clicks` when Supabase gives you a secure REST API over your Views for free?

This shift was profound. My architecture went from:
`User -> JS -> Custom API -> Python -> DB -> Python -> JS -> User`

To:
`User -> PostHog -> Supabase -> Dashboard`

The code didn't just get smaller; the _class_ of problems I was solving changed. I stopped fixing 500 errors and started fixing user funnel drop-offs.

## Phase 3: The "Brutal" Refactor (Hugo to Astro)

With the backend modernized, the frontend (Hugo + jQuery-style JS) felt ancient. It was hard to add interactive components like the real-time timeline or the dynamic dashboard.

I migrated to **Astro**.

Astro was a revelation. Its "Islands Architecture" meant I could ship zero JavaScript for the content pages but hydrate React components only where needed (like the live dashboard).

During this migration, my AI coding partner (who I treat less like a copilot and more like a senior engineer) helped me enforce a new principle: **"Brutalize Scope."**

Every file we touched, we asked: _Do we need this?_

- **JavaScript:** We cut the simulator logic from 489 lines to 250 lines **(-49%)** by modularizing the state machine.
- **CSS:** We deleted 130 lines of custom CSS and replaced it entirely with **Tailwind Utility Classes**. Zero custom stylesheets.
- **Complexity:** We removed Framer Motion and used simple CSS transitions.

The result? A site that feels instant, scores 100 on Lighthouse, and fits in a 23MB Docker image.

## Phase 4: The Build with Me Philosophy

The most interesting part of this journey wasn't the tech stack; it was the workflow.

Working with AI, I realized that the bottleneck isn't _writing_ code anymore—it's _deciding_ what to code.

- **Fix Root Causes:** When a button didn't click, we didn't just add a check; we traced the event listener lifecycle.
- **Chunk-Based Delivery:** We never worked on "The Dashboard." We worked on "The Funnel Query," then "The Chart Component," then "The Refresh Logic." Small, verifiable wins.

This experience crystallized the **Build with Me** vision.

We teach data science backwards. We teach students to analyze datasets someone else cleaned, using algorithms someone else wrote, to answer questions someone else asked.

Real data science is messy. It involves building the product, breaking the tracking, fixing the data pipeline, and _then_ doing the analysis.

The A/B Simulator is just the first step. It proves that you can run a full product lifecycle—from code to click to chart—as a single developer, if you choose the right tools.

**Tech Deep Dive:**

- **Frontend:** Astro 4.4 + React Islands
- **Styling:** Tailwind CSS (No custom CSS)
- **Experiments:** PostHog Feature Flags (`memory-game-difficulty`)
- **Backend:** Supabase (Postgres + Edge Functions)
- **Viz:** Plotly.js (Client-side rendering)

[Check out the code on GitHub](https://github.com/eeshansrivastava89/ds-apps-main) or [Try the Simulator](/ab-simulator).
