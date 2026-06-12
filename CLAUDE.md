# PersonalSite — Project Context

Adrian Lumley's personal site. Live at https://adrianlumley.co. GitHub Pages, deployed from `main`.

## Stack
- **Framework:** Astro + Tailwind CSS
- **Font:** Self-hosted JetBrains Mono (`public/fonts/`, declared in `src/styles/global.css`). The whole site is monospace.
- **Deploy:** GitHub Pages (`prime3679/PersonalSite`) — push to main = deploy
- **Style:** Dark, monochrome aesthetic. Minimal. No clutter.

## Key Files
- `src/pages/` — all pages (index.astro, blog/, signal-room/, lab.astro, 404.astro, rss.xml.ts)
- `src/layouts/Base.astro` — owns the whole page shell: head/OG/structured data, skip link, `<Header />`, the `<main>` wrapper (standard centered column; `mainClass` replaces it, `extraMainClass` adds to it), and the footer. **Pages render content only — never add `<Header />` or `<main>` inside a page.**
- `src/components/Header.astro` — sticky top bar: "adrian lumley" wordmark (home) + theme toggle
- `src/lib/content.ts` — canonical collection queries (`getPublishedPosts`, `getEpisodes`) and route paths (`postPath`, `episodePath`, OG variants). The trailing-slash shapes are RSS GUIDs — don't "normalize" them.
- `src/lib/format.ts` — shared display formatting (dates pinned to UTC, episode padding/titles). Don't hand-roll `toLocaleDateString` in pages.
- `src/data/nav.ts` — single source of truth for nav (header tabs + footer + mobile menu)
- `src/data/now.ts` — homepage "currently" content
- `src/data/lab.ts` — every /lab project card (one entry per build)
- `src/data/siteMetadata.ts` — title, description, social links
- `src/content/blog/` — blog posts (Markdown content collection)
- `src/content/signal-room/` — fiction serial episodes (Markdown content collection)
- `src/lib/og-image.ts` + `src/pages/og/` — generated 1200×630 OG cards (satori + sharp)
- `public/lab/<slug>/` — self-contained HTML demos (iron-log, meeting-cost, my-kids-world, chaos-garden)

## Live Pages
- `/` — intro, "currently", and contact links
- `/about` — bio
- `/blog` — blog index (+ `/rss.xml` combined writing feed) → `/blog/<slug>` per post
- `/signal-room` — fiction serial index → `/signal-room/<slug>` per episode
- `/lab` — lab projects (one card per build, from `src/data/lab.ts`)
- `/contact` — contact form (Formspree)
- Also live, just not in nav: `/work`, `/services`, `/operator-stack`, `/90-day-os`, `/familyos`, `/bishop-development`, `/start`, `/joytap-privacy`

## Nav
Defined once in `src/data/nav.ts` — items flagged `primary` are the header tabs; the footer and mobile menu render the full list. Don't hardcode nav links.
- **Header tabs:** `adrian lumley` wordmark (home) · About · Blog · Lab · Contact
- **Footer / mobile menu also include:** Signal Room
Other pages stay out of nav but remain reachable by URL — don't delete them.

## Rules
- No Salesforce work on /work — NDAs. No explanation needed.
- Public content: "partner" and "child" only — no names, ages, gender.
- Lab demos must be self-contained HTML — no external dependencies (vendor assets locally; e.g. chaos-garden ships its own p5.js).
- New lab demos go in `public/lab/<slug>/index.html` and get an entry in `src/data/lab.ts`.

## Testing
- **Unit (Vitest):** `src/**/*.test.ts` → `npx vitest run src`.
- **E2E (Playwright):** specs in `tests/` (and `tests/e2e/`) run against the **built** site (`build && preview`); `tests/mobile/` runs on touch viewports.
- **CI:** `.github/workflows/test.yml` runs both on every PR — keep it green.

## Deploy
```bash
git add -A && git commit -m "your message" && git push origin main
# GitHub Actions builds + deploys — live in ~1–2 min
```

## Content Formats
**Blog post** (`src/content/blog/<slug>.md`):
```markdown
---
title: "Post Title"
date: YYYY-MM-DD
description: "One-sentence description"
tags: ["optional", "tags"]
---
Content here...
```

**Signal Room episode** (`src/content/signal-room/<slug>.md`):
```markdown
---
title: "episode title"
episode: 5                # drives site order (index, prev/next, "latest signal")
date: YYYY-MM-DD          # weekly (Monday) cadence; drives RSS order and the shown date
teaser: "one-line hook shown on the index"
badges: ["episode 05", "episode title"]
---
Prose here...
```
Both automatically get a generated OG card and join `/rss.xml`.
