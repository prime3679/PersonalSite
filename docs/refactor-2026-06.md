# Refactor log — June 2026

Goal: tighten the architecture and the user experience without changing the
site's voice or visual identity. Every step is live-tested (build + Playwright
against the built site, Vitest for units) and committed separately so the
history reads as a sequence of safe moves.

Branch: `claude/refactor-architecture-ux-ox3l1u`

## Findings (baseline audit)

- Every page repeats the same shell: `<Base><Header /><main class="mx-auto max-w-2xl px-6 py-12 font-mono">…` — 16 copies of boilerplate, and forgetting `<Header />` on a new page would silently ship a page with no nav.
- `src/layouts/BlogPost.astro` is dead code — nothing imports it (blog posts render through `src/pages/blog/[...slug].astro`).
- Date formatting (`fmtDate`, `formatDate`), episode padding (`pad`), and the published-posts filter+sort are each duplicated 3–5 times across pages, RSS, and OG endpoints.
- `blog/[...slug].astro` hardcodes `https://adrianlumley.co` instead of deriving from `siteMetadata`/`Astro.site`.
- Viewport meta uses `maximum-scale=1`, which blocks pinch-zoom on mobile (WCAG 1.4.4 failure).
- No skip-to-content link; active nav state is color-only (no `aria-current`).
- Blog posts have no prev/next navigation (Signal Room episodes do).
- Mobile menu has no Escape-to-close.

## Plan / progress

- [x] **Step 0 — Baseline**: install deps, run the existing suites, commit this log.
- [x] **Step 1 — Page shell consolidation**: move `<Header />` + `<main>` (+ default classes, overridable via prop) into `Base.astro`; strip the boilerplate from all 16 pages; delete dead `BlogPost.astro`.
- [ ] **Step 2 — Shared content + format lib**: `src/lib/format.ts` (long date, episode padding) and `src/lib/content.ts` (published posts, sorted episodes, canonical URLs); dedupe blog/signal-room/RSS/OG/lab call sites; fix the hardcoded domain. Unit tests for both libs.
- [ ] **Step 3 — UX / accessibility pass**: allow pinch-zoom (drop `maximum-scale`), skip-to-content link, `aria-current="page"` on active nav links, Escape closes the mobile menu, prev/next links on blog posts.
- [ ] **Step 4 — Final review**: full test matrix, code review of the cumulative diff, close out this log.

## Step log

- **Step 0** — Baseline green: 17 unit tests, 38 Playwright tests (chromium + mobile-chrome). Note: 7 webkit tests fail *in this sandbox on the unmodified baseline too* (headless-webkit visibility quirks in the container); they pass in CI, so chromium/firefox/mobile-chrome are the local gate and CI remains the webkit gate.
- **Step 1** — `Base.astro` now owns the page shell: it renders `<Header />`, wraps the slot in `<main>` (standard centered column by default, `mainClass` prop for `/work` and `/90-day-os`), and keeps the footer. All 18 page files lost their copy-pasted shell; `src/layouts/BlogPost.astro` (dead since posts render via `blog/[...slug].astro`) is deleted. Net −60 lines, and a new page can no longer forget its header. Verified: build, 17 unit tests, 73 Playwright tests (chromium + firefox + mobile-chrome) green.
