# PersonalSite

Adrian Lumley's personal website. Live at [adrianlumley.co](https://adrianlumley.co).

## What it is

A personal site and writing home for:
- current work and background
- blog posts
- small lab projects / demos
- contact / advisory surface

This repo is active and deployed from `main`.

## Stack

- **Framework:** Astro
- **Styling:** Tailwind CSS
- **Deploy:** GitHub Pages via GitHub Actions
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

Push to `main` to trigger the GitHub Pages deployment pipeline.

```bash
git add -A
git commit -m "your message"
git push origin main
```

## Notes

Recent site work has included:
- blog publishing and content collection cleanup
- dynamic OG image generation
- schema/SEO improvements
- lab project additions
- header polish, including live NYC time in the nav

## URL

- Production: [adrianlumley.co](https://adrianlumley.co)
- Repo: `prime3679/PersonalSite`
