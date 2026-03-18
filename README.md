# PersonalSite

Adrian Lumley's personal site. Live at [adrianlumley.co](https://adrianlumley.co).

## Stack

- **Framework:** Astro + Tailwind CSS
- **Deploy:** GitHub Pages (`prime3679/PersonalSite`) — push to `main` triggers deploy via GitHub Actions

## Structure

```text
src/
  pages/        # .astro pages (index, blog, lab, contact, now, ...)
  layouts/      # Base.astro wraps all pages
  components/   # Header, shared UI
  content/blog/ # Blog posts as Markdown (Astro Content Collections)
public/
  lab/          # Standalone lab demos (self-contained HTML)
    lacarte/
    iron-log/
```

## Commands

| Command           | Action                                      |
| :---------------- | :------------------------------------------ |
| `npm install`     | Install dependencies                        |
| `npm run dev`     | Start local dev server at `localhost:4321`  |
| `npm run build`   | Build production site to `./dist/`          |
| `npm run preview` | Preview production build locally            |

## Deploy

```bash
git add -A && git commit -m "your message" && git push origin main
# GitHub Actions builds and deploys — live in ~2 min
```
