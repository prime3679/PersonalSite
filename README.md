# PersonalSite

Adrian Lumley's personal website. Live at [adrianlumley.co](https://adrianlumley.co).

## What it is

A personal site and writing home for:
- writing
- small lab projects / demos
- about, with the work record

This repo is active. Cloudflare Workers Assets is the production runtime. Nothing deploys on push.

## Stack

- **Framework:** Astro
- **Styling:** Tailwind CSS
- **Deploy:** Cloudflare Workers Assets for the apex host and a separate Cloudflare Worker for `www` redirects
- **Testing:** Vitest for units, Playwright for end-to-end
- **Node:** 22.23.4 or newer (the floor Astro sets; `.nvmrc` and the Tests workflow track Node 22)
- **Image generation:** Satori + Sharp for dynamic OG images

## Current structure

```text
src/
  pages/        # site pages (home, writing, lab, about, contact) plus redirect stubs
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
npm run check      # astro type check
npm run build
npm run preview
npx vitest run     # unit tests
npm test           # playwright, every browser project
```

The secret-scan pre-commit hook is opt-in per clone. It needs `gitleaks` installed:

```bash
git config core.hooksPath .githooks
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

A push to `main` deploys nothing. It runs `.github/workflows/test.yml`: type check, unit tests, build, the public-surface scan, end-to-end tests, and the mobile verifier.

## Notes

Recent site work has included:
- blog publishing and content collection cleanup
- dynamic OG image generation
- schema/SEO improvements
- lab project additions
- a three-item nav with no mobile menu; dark mode follows the system setting

## Agent contribution path

Fresh coding agents should start with `REVIEW.md`, then read `AGENTS.md`, `CLAUDE.md`, and `docs/zero-context-contribution.md`.

The repo-owned contribution contract lives at `.agent/contribution-contract.json`, and the local gate lives at `.agent/contribution_gate.py`.

Before implementation, fresh agents should read `.agent/architecture.json`. Humans can open `docs/architecture.html` directly from disk for the synchronized visual architecture map.

## URL

- Production: [adrianlumley.co](https://adrianlumley.co)
- Repo: `prime3679/PersonalSite`
