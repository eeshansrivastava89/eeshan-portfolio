# eeshans.com — Data science portfolio & writing hub

> "The best way to understand data is to build the system that creates it."

**Live:** [eeshans.com](https://eeshans.com)

---

## What This Is

A personal portfolio site that aggregates projects, writing, and analysis from across multiple repos and platforms into one information-dense hub.

Each project lives in its own repo with its own hosting. This site surfaces them all — with live stats, full Substack articles rendered on-site, GitHub activity, and published analysis.

---

## Current Projects

| Project | Stack | Link |
|---------|-------|------|
| A/B Testing Memory Game | Astro, React, PostHog, Supabase | [Try it](https://eeshans.com/ab-simulator) |
| How I Prompt | Python, Claude AI | [Try it](https://howiprompt.eeshans.com) |
| Local LLM Bench | MLX, Ollama, Python | [Try it](https://eeshansrivastava89.github.io/local-llm-bench/) |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Astro 5 | Static-first, React islands for interactivity |
| Styling | Tailwind CSS | Utility-first, dark mode, responsive |
| Interactivity | React 19 | Subscribe dialog, commit feed, data tables |
| Analytics | PostHog | Event tracking, feature flags |
| Database | Supabase | PostgreSQL + PostgREST for live stats |
| Hosting | Fly.io | Docker deployment, static nginx |

---

## Architecture

```
datascienceapps/
├── src/
│   ├── pages/             # Home, Projects, Writing, About
│   ├── components/        # All UI components
│   ├── lib/               # Substack RSS, GitHub API, project loader
│   ├── data/              # Project YAML definitions
│   └── styles/            # Tailwind + theme CSS
├── .cache/                # Build-time API response cache
├── public/                # Static assets + pre-rendered analysis
└── packages/
    └── ab-simulator/      # Quarantined — pending migration to own repo
```

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for full technical details.

---

## Development

```bash
pnpm install
cp .env.example .env
pnpm dev
```

---

## License

MIT © 2025 Eeshan Srivastava
