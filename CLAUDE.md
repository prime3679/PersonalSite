# PersonalSite — Project Context

Adrian Lumley's personal site. Live at https://adrianlumley.co. GitHub Pages, deployed from `main`.

## Stack
- **Framework:** Astro + Tailwind CSS
- **Deploy:** GitHub Pages (`prime3679/PersonalSite`) — push to main = deploy
- **Style:** Dark, monochrome aesthetic. Minimal. No clutter.

## Key Files
- `src/pages/` — all pages (index.astro, blog/, lab.astro, 404.astro, rss.xml.ts)
- `src/layouts/Base.astro` — wraps every page (head, footer, structured data)
- `src/components/Header.astro` — sticky top nav + theme toggle + NYC clock
- `src/data/nav.ts` — single source of truth for nav (used by header AND footer)
- `src/data/siteMetadata.ts` — title, description, social links
- `src/content/blog/` — blog posts as Markdown (Astro Content Collections)
- `public/lab/<slug>/` — self-contained HTML demos (iron-log, meeting-cost, evelyns-world, chaos-garden)

## Live Pages
- `/` — intro, "currently", and contact links
- `/about`, `/now` — bio and current focus
- `/blog` — blog index (+ `/rss.xml` feed)
- `/lab` — lab projects (one card per build)
- `/signal-room` — fiction serial
- `/contact` — contact
- Also live, just not in nav: `/work`, `/services`, `/operator-stack`, `/90-day-os`, `/familyos`, `/bishop-development`

## Nav
Defined once in `src/data/nav.ts` — header and footer both render that list. Don't hardcode nav links in either; edit the array.
Current: Home · About · Now · Blog · Signal Room · Lab · Contact. Other pages stay out of nav but remain reachable by URL — don't delete them.

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
