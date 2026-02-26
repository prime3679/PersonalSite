# PersonalSite — Project Context

Adrian Lumley's personal site. Live at https://adrianlumley.co. GitHub Pages, deployed from `main`.

## Stack
- **Framework:** Astro + Tailwind CSS
- **Deploy:** GitHub Pages (`prime3679/PersonalSite`) — push to main = deploy
- **Style:** Dark, monochrome aesthetic. Minimal. No clutter.

## Key Files
- `src/pages/` — all pages (index.astro, blog/, lab/)
- `src/layouts/` — BaseLayout.astro wraps everything
- `src/content/blog/` — blog posts as Markdown (Astro Content Collections)
- `public/lab/` — standalone lab demos (plain HTML, self-contained)
- `public/lab/lacarte/` — La Carte demo
- `public/lab/iron-log/` — Iron Log workout tracker

## Live Pages
- `/` — 2-sentence intro + link to /work
- `/blog` — blog index
- `/lab` — lab projects (Iron Log, La Carte)
- `/contact` — contact

## Nav
Home · Blog · Lab · Contact ONLY. Work, Services, Log removed from nav (still accessible by URL — don't delete them).

## Rules
- No Salesforce work on /work — NDAs. No explanation needed.
- Public content: "partner" and "child" only — no names, ages, gender.
- Lab demos must be self-contained HTML — no Python servers, no external dependencies.
- New lab demos go in `public/lab/<slug>/index.html` and get a card on `/lab`.

## Deploy
```bash
git add -A && git commit -m "your message" && git push origin main
# GitHub Actions handles the rest — live in ~2 min
```

## Blog Post Format
```markdown
---
title: "Post Title"
date: YYYY-MM-DD
description: "One-sentence description"
---
Content here...
```
