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
- [x] **Step 2 — Shared content + format lib**: `src/lib/format.ts` (long date, episode padding) and `src/lib/content.ts` (published posts, sorted episodes, canonical URLs); dedupe blog/signal-room/RSS/OG/lab call sites; fix the hardcoded domain. Unit tests for both libs.
- [x] **Step 3 — UX / accessibility pass**: allow pinch-zoom (drop `maximum-scale`), skip-to-content link, `aria-current="page"` on active nav links, Escape closes the mobile menu, prev/next links on blog posts.
- [x] **Step 4 — Final review**: full test matrix, code review of the cumulative diff, close out this log.

## Step log

- **Step 0** — Baseline green: 17 unit tests, 38 Playwright tests (chromium + mobile-chrome). Note: 7 webkit tests fail *in this sandbox on the unmodified baseline too* (headless-webkit visibility quirks in the container); they pass in CI, so chromium/firefox/mobile-chrome are the local gate and CI remains the webkit gate.
- **Step 4** — Adversarial review of the cumulative branch diff (7 independent review angles), then fixes for everything that survived verification:
  - *Regression caught & fixed:* the mechanical de-indent in Step 1 had shifted the whitespace-significant ASCII diagram inside `/familyos`'s `<pre>` by two columns. Restored to baseline alignment (the only `<pre>` in any page).
  - *A11y depth fixes:* `<main id="main">` now carries `tabindex="-1"` (Safari doesn't move focus to non-focusable fragment targets, so the skip link previously skipped nothing there) plus `scroll-mt-20` so the sticky header doesn't cover the landing point; `aria-current="page"` is now exact-match only — child routes like `/blog/<slug>` no longer announce the Blog tab as "current page" (visual section highlight unchanged); the Escape handler respects `event.defaultPrevented`.
  - *Cleanups:* `extraMainClass` prop so `/start` and `/operator-stack` add `space-y-16` without restating the default column string; `/90-day-os` passes `mainClass=""` instead of a no-op class pair; dropped a redundant re-sort of related posts; `published` filter reads the schema-defaulted boolean directly; `episodeTitle()` keeps RSS and JSON-LD titles in lockstep; `postOgPath`/`episodeOgPath` and `pngResponse()` finish the routing/OG consolidation; six stale `<!-- Header -->` comments renamed; CLAUDE.md updated to the new architecture (Base owns the shell; lib helpers documented; episode-vs-date ordering clarified).
  - *Reviewed and deliberately not changed:* `new URL(..., Astro.site)` hard-requires `site` in astro.config (it's set, and the same dependency predates this branch); blog dates now rendering in UTC is the intended fix, not drift; prev/next stays per-page (two call sites with different domain semantics don't justify a shared helper yet).
  - Verified: build, 25 unit tests, 80 Playwright tests (chromium + firefox + mobile-chrome) green; RSS titles/GUIDs byte-identical; diagram alignment confirmed in built HTML.
- **Step 3** — UX/accessibility: viewport no longer blocks pinch-zoom (`maximum-scale=1` removed — WCAG 1.4.4); a skip-to-content link is the first tabbable element on every page (visually hidden until focused); active header/mobile nav links carry `aria-current="page"`; Escape closes the mobile menu and returns focus to the hamburger; blog posts gained prev/next date-order navigation matching the Signal Room pattern; footer nav got an `aria-label`. 4 new e2e tests (skip link, aria-current, prev/next walk, Escape-close). Verified: build, 24 unit tests, 80 Playwright tests green.
- **Step 2** — Added `src/lib/format.ts` (formatLongDate / formatMonthYear / padEpisode / snapshotLabel, all pinned to UTC) and `src/lib/content.ts` (getPublishedPosts, getEpisodes, postPath/episodePath). Seven call sites (blog index + post, signal-room index + episode, lab, RSS, both per-slug OG endpoints) now share them. Fixes along the way: blog post structured-data URL no longer hardcodes the domain (derived from `Astro.site`), and blog dates now format in UTC like everything else (local-zone formatting could shift the shown day). RSS GUIDs verified byte-identical so feed readers see no churn. 7 new unit tests for the formatters. Verified: build, 24 unit tests, 73 Playwright tests green.
- **Step 1** — `Base.astro` now owns the page shell: it renders `<Header />`, wraps the slot in `<main>` (standard centered column by default, `mainClass` prop for `/work` and `/90-day-os`), and keeps the footer. All 18 page files lost their copy-pasted shell; `src/layouts/BlogPost.astro` (dead since posts render via `blog/[...slug].astro`) is deleted. Net −60 lines, and a new page can no longer forget its header. Verified: build, 17 unit tests, 73 Playwright tests (chromium + firefox + mobile-chrome) green.
