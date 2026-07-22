# PersonalSite

Adrian Lumley's personal website. Live at [adrianlumley.co](https://adrianlumley.co).

## What it is

A personal site and writing home for:
- current work and background
- blog posts
- small lab projects / demos
- contact / advisory surface

This repo is active. Cloudflare Workers Assets is the authoritative production runtime; pushes to `main` also publish through an active GitHub Pages workflow.

## Stack

- **Framework:** Astro
- **Styling:** Tailwind CSS
- **Deploy:** Cloudflare Workers Assets for the apex host, a separate Cloudflare Worker for `www` redirects, plus an active GitHub Pages pipeline
- **Testing:** Playwright
- **Image generation:** Satori + Sharp for dynamic OG images

## Current structure

```text
src/
  pages/        # site pages (home, about, blog, lab, contact, now, work, ...)
  layouts/      # shared page layout
  components/   # shared UI like the header
  content/blog/ # blog posts via Astro Content Collections
public/
  lab/          # standalone demos / mini-projects
dist/           # generated build output
```

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
npm test
```

## Deployment

The authoritative `adrianlumley.co/*` production release builds and deploys `dist/` through `wrangler.toml`:

```bash
npm run deploy:cloudflare
```

The `www.adrianlumley.co/*` redirect Worker uses its separate configuration. The combined command performs both deployments:

```bash
npm run deploy:cloudflare:www
npm run deploy:cloudflare:all
```

Pushes to `main` still trigger `.github/workflows/deploy.yml`, which builds and publishes a GitHub Pages artifact. That active pipeline is not the authoritative apex production release path, so push-to-main alone does not complete production deployment.

## Notes

Recent site work has included:
- blog publishing and content collection cleanup
- dynamic OG image generation
- schema/SEO improvements
- lab project additions
- header polish, including live NYC time in the nav

## Agent contribution path

Fresh coding agents should start with `REVIEW.md`, then read `AGENTS.md`, `CLAUDE.md`, and `docs/zero-context-contribution.md`.

The repo-owned contribution contract lives at `.agent/contribution-contract.json`, and the local gate lives at `.agent/contribution_gate.py`.

Before implementation, fresh agents should read `.agent/architecture.json`. Humans can open `docs/architecture.html` directly from disk for the synchronized visual architecture map.

## URL

- Production: [adrianlumley.co](https://adrianlumley.co)
- Repo: `prime3679/PersonalSite`
