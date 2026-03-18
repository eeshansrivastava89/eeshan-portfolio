# eeshans.com — Data science portfolio & writing hub

> "The best way to understand data is to build the system that creates it."

**Live:** [eeshans.com](https://eeshans.com)

---

## What This Is

A personal portfolio site that aggregates projects, writing, and analysis from across multiple repos and platforms into one information-dense hub.

Each project lives in its own repo with its own hosting. This site surfaces them all — with live stats, full Substack articles rendered on-site, GitHub activity, and published notebooks.

---

## Current Projects

| Project | Stack | Link |
|---------|-------|------|
| A/B Testing Memory Game | Astro, PostHog, Supabase, Python | [absim.eeshans.com](https://absim.eeshans.com) |
| How I Prompt | Python, Claude AI | [howiprompt.eeshans.com](https://howiprompt.eeshans.com) |
| Local LLM Bench | MLX, Ollama, Python | [GitHub Pages](https://eeshansrivastava89.github.io/local-llm-bench/) |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Astro 5 | Static-first, React islands for interactivity |
| Styling | Tailwind CSS | 6-theme system (Coffee/Catppuccin/Classic × light/dark) |
| Analytics | PostHog | Event tracking, proxied through Cloudflare Worker |
| Database | Supabase | PostgreSQL + PostgREST for live stats |
| Hosting | Fly.io | Docker deployment, static nginx |

---

## Architecture

```
datascienceapps/
├── src/
│   ├── pages/             # Home, Projects, Writing, Analysis, About
│   ├── components/        # All UI components
│   ├── lib/               # Substack RSS, GitHub GraphQL, project loader
│   ├── data/              # Project YAML definitions
│   └── styles/            # Tailwind + theme CSS variables
├── .cache/                # Build-time API response cache
└── public/                # Static assets + pre-rendered analysis
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
