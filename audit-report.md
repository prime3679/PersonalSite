# adrianlumley.co — Technical Audit Report

**Date:** 2026-03-14
**Branch:** main
**Commit:** e6dbe02
**Auditor:** Bishop (automated)

---

## Summary Table

| # | Finding | Category | Severity | Fix Effort |
|---|---------|----------|----------|------------|
| 1 | Blog post `<title>` double-suffixes "— Adrian Lumley — Adrian Lumley" | SEO | **Critical** | Trivial |
| 2 | 3 npm vulnerabilities (rollup, svgo, devalue) | Dependencies | **High** | Trivial |
| 3 | `maximum-scale=1` blocks pinch-to-zoom | Accessibility | **High** | Trivial |
| 4 | Muted text fails WCAG AA contrast (3.8:1 vs 4.5:1 required) | Accessibility | **High** | Small |
| 5 | Lab demos have zero ARIA attributes (43+ interactive elements) | Accessibility | **High** | Medium |
| 6 | `BlogPost.astro` is dead code — never used | Code Quality | **Medium** | Trivial |
| 7 | `Header.test.ts` tests stale nav items — will fail | Code Quality | **Medium** | Small |
| 8 | `happy-dom` / `vitest` in devDeps but not installed | Dependencies | **Medium** | Trivial |
| 9 | Lab demos missing `<meta description>` and OG tags | SEO | **Medium** | Small |
| 10 | Blog posts use `og:type=website` instead of `article` | SEO | **Medium** | Trivial |
| 11 | No BlogPosting JSON-LD on blog posts | SEO | **Medium** | Small |
| 12 | `lab.astro` at 499 lines with repetitive card markup | Code Quality | **Medium** | Medium |
| 13 | `@astrojs/markdown-remark` likely unused direct dependency | Dependencies | **Low** | Trivial |
| 14 | No RSS/Atom feed for blog | SEO | **Low** | Small |
| 15 | `time` elements lack `datetime` attribute | SEO/A11y | **Low** | Trivial |
| 16 | TypeScript type annotation in inline `<script>` tag | Code Quality | **Low** | Trivial |
| 17 | Footer nav duplicates main nav with no `aria-label` distinction | Accessibility | **Low** | Trivial |
| 18 | Sitemap includes hidden pages (/work, /services) | SEO | **Low** | Small |
| 19 | OG image is PNG, not WebP | Performance | **Low** | Small |
| 20 | No `article:published_time` meta for blog posts | SEO | **Low** | Trivial |

---

## 1. Dependency Health

### 1.1 Known Vulnerabilities

Three issues found via `npm audit`:

| Package | Severity | Issue | Fix |
|---------|----------|-------|-----|
| rollup 4.0–4.58 | High | Arbitrary file write via path traversal (GHSA-mw96) | `npm audit fix` |
| svgo 4.0.0 | High | DoS via entity expansion (GHSA-xpqw) | `npm audit fix` |
| devalue ≤5.6.3 | Moderate | Prototype pollution in parse/unflatten (4 advisories) | `npm audit fix` |

**All fixable with `npm audit fix`.** These are transitive dependencies (via Astro/Vite), not direct attack surface on a static site, but should be patched.

### 1.2 Outdated Packages

| Package | Current | Latest | Type |
|---------|---------|--------|------|
| astro | 5.17.2 | 6.0.4 | Major |
| tailwindcss | 3.4.19 | 4.2.1 | Major |
| zod | 3.25.76 | 4.3.6 | Major |
| @astrojs/sitemap | 3.7.0 | 3.7.1 | Patch |
| @astrojs/markdown-remark | 6.3.10 | 7.0.0 | Major |

**Recommendation:** Patch `@astrojs/sitemap` now. Major bumps (Astro 6, Tailwind 4) are optional — evaluate when a feature requires them.

### 1.3 Unused / Problematic Dependencies

| Package | Issue |
|---------|-------|
| `@astrojs/markdown-remark` | Not directly imported — Astro resolves it internally. Likely safe to remove from `dependencies` as Astro bundles its own. Verify with a build after removal. |
| `happy-dom` (devDep) | Listed but **not installed** (`npm-check` reports MISSING). |
| `vitest` (devDep) | Listed but **not installed**. Unit tests cannot run. |
| `playwright-core` | 9.6MB — E2E test dependency. Appropriate if E2E tests are active. |

### 1.4 Bundle Size (node_modules top 10)

| Package | Size |
|---------|------|
| typescript | 23MB |
| @img | 16MB |
| @shikijs | 13MB |
| vite | 12MB |
| @esbuild | 9.9MB |
| playwright-core | 9.6MB |
| tailwindcss | 6.0MB |
| @astrojs | 5.4MB |
| astro | 5.3MB |
| @babel | 5.1MB |

All expected for an Astro + Tailwind build pipeline. No bloat concerns — these are build-time only.

### 1.5 Build Output

Total dist: **988KB**. Single CSS file: **16.6KB**. Zero framework JS shipped. Excellent.

---

## 2. Performance

### 2.1 Strengths

- **Fully static** — every page pre-rendered at build time. No SSR, no hydration.
- **Zero client-side JS from framework** — only inline theme toggle (~500B minified) and Umami analytics (deferred).
- **System fonts** — no font loading, no FOIT/FOUT. SF Mono / monospace stack.
- **Single CSS bundle** — 16.6KB, one request, no render-blocking external sheets.
- **CSP headers** in meta tag — good security posture.
- **`prefers-reduced-motion` respected** in global.css — animations disabled for users who request it.

### 2.2 Issues

| Finding | Impact | Severity |
|---------|--------|----------|
| OG image served as PNG (optimized by Astro, but could be WebP for social sharing) | Minor — social platform crawlers handle PNG fine | Low |
| Lab demos are single-file HTML (iron-log: 51KB, la carte: 38KB) with all CSS/JS inline | No code splitting, but these are designed to be self-contained. Acceptable tradeoff. | Informational |
| FamilyOS/Bishop stats fetched on lab page load (2 API calls) | Minimal impact — 5s timeout, graceful degradation to cache | Informational |
| `scroll-behavior: smooth` applied globally | Can cause jank on low-end devices — mitigated by reduced-motion media query | Informational |

### 2.3 Lighthouse Estimate

Given the architecture (static HTML, system fonts, single CSS, no JS framework, deferred analytics), expected scores:

| Metric | Estimated Score |
|--------|----------------|
| Performance | 95–100 |
| Accessibility | 80–85 (drag from contrast, zoom, ARIA gaps) |
| Best Practices | 90–95 |
| SEO | 85–90 (drag from missing structured data, title duplication) |

---

## 3. Code Quality

### 3.1 Dead Code

**`src/layouts/BlogPost.astro`** — This layout is never imported by any page. Blog posts are rendered by `src/pages/blog/[...slug].astro`, which uses `Base.astro` + `Header.astro` directly. BlogPost.astro duplicates the same pattern but is unused. **Delete it.**

**`src/data/caseStudies.ts`** — Referenced in project memory as containing 3 case studies, but the file does not exist. `work.astro` may have inlined the data. If the file was deleted, the stale memory reference should be cleaned up.

### 3.2 Stale Tests

**`src/components/Header.test.ts`** — Tests for nav items that were removed: `/work`, `/services`, `/bishop-development`. Current nav is home/blog/lab/contact. This test will fail if run.

**`vitest` not installed** — `happy-dom` and `vitest` are in `devDependencies` but not in `node_modules`. Running `npm test` (which calls Playwright) works, but `npx vitest` would fail to resolve.

### 3.3 Files Warranting Refactoring

**`src/pages/lab.astro` (499 lines)** — Contains 8 project cards with identical structure: border card → header with title/date/status badge → description → stats grid → links. This is a prime candidate for a `<ProjectCard />` component. The inline `<script>` block (lines 376–498) containing cache utilities and fetch logic adds another 122 lines.

**Lab page inline script uses TypeScript syntax** (`stats: any` on line 479) inside a non-TypeScript `<script>` tag. Astro compiles `<script>` tags but the `: any` annotation in an inline script is fragile — it works because Astro processes it, but it's inconsistent with the rest of the codebase.

### 3.4 Duplication

- `[...slug].astro` and `BlogPost.astro` implement the same blog post layout (header → content → footer). Only one should exist.
- `readCache()`, `writeCache()`, `fetchStats()` are utility functions inlined in lab.astro. If more pages need stats fetching, these should be extracted.
- Every page file imports `Base` + `Header` with identical pattern. This is fine for Astro's architecture — not worth abstracting.

### 3.5 Inconsistencies

- `[...slug].astro` builds `fullTitle` as `${title} — Adrian Lumley` (line 26), then passes it to Base.astro which also appends ` — ${siteMetadata.title}` (line 13). This causes the double-suffix bug.
- Blog post article has classes `prose space-y-6 text-sm leading-relaxed` in `[...slug].astro` but `prose max-w-none` in unused `BlogPost.astro` — diverged before BlogPost was abandoned.

---

## 4. SEO & Meta

### 4.1 Critical: Title Double-Suffix

Blog posts render as:

```
I cut my AI costs 70% in a weekend. Here's the only thing that mattered. — Adrian Lumley — Adrian Lumley
```

**Root cause:** `[...slug].astro:26` creates `fullTitle = "${title} — Adrian Lumley"`, then `Base.astro:13` creates `fullTitle = "${title} — ${siteMetadata.title}"`, stacking the suffix.

**Fix:** Pass the raw `post.data.title` to Base and let Base handle the suffix. One-line change.

### 4.2 Missing Meta on Lab Demos

`/lab/iron-log/` and `/lab/lacarte/` are standalone HTML files that bypass Base.astro. They lack:
- `<meta name="description">`
- All OG tags (`og:title`, `og:description`, `og:image`)
- Twitter card tags
- Canonical URLs
- JSON-LD structured data

These pages are publicly accessible and appear in the sitemap.

### 4.3 Blog Post Structured Data

All pages use the same Person JSON-LD schema. Blog posts should additionally include:

```json
{
  "@type": "BlogPosting",
  "headline": "...",
  "datePublished": "...",
  "author": { "@type": "Person", "name": "Adrian Lumley" }
}
```

This enables rich results in Google Search.

### 4.4 OG Type

All pages (including blog posts) use `og:type=website`. Blog posts should use `og:type=article` with `article:published_time`.

### 4.5 Time Elements

Blog post `<time>` tags display formatted dates but lack the `datetime` attribute (e.g., `datetime="2026-02-18"`), which helps search engines parse dates.

### 4.6 No RSS Feed

No `/rss.xml` or `/feed.xml` endpoint. Astro has a first-party `@astrojs/rss` integration that generates this from the blog collection.

### 4.7 Sitemap

Sitemap includes 15 URLs. Hidden pages (`/work`, `/services`) are included — these are intentionally accessible by URL per project rules, so this may be desired. If not, `@astrojs/sitemap` supports a `filter` option.

---

## 5. Accessibility

### 5.1 Critical: Pinch-to-Zoom Blocked

`Base.astro:31`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
```

`maximum-scale=1` prevents pinch-to-zoom on mobile. This is a **WCAG 2.1 SC 1.4.4 (Resize Text)** violation. Users with low vision rely on zoom.

**Fix:** Remove `maximum-scale=1`. Change to `width=device-width, initial-scale=1.0`.

### 5.2 Color Contrast

Light mode muted text: `hsl(0 0% 45%)` on `hsl(0 0% 100%)` = approximately **3.8:1** contrast ratio.
WCAG AA requires **4.5:1** for normal text, **3:1** for large text (18px+ or 14px+ bold).

Muted text is used at `text-xs` (12px) — definitely needs 4.5:1.

**Fix:** Darken `--muted-foreground` from `45%` to `~38%` in light mode to achieve 4.5:1.

Dark mode muted text: `hsl(0 0% 65%)` on `hsl(0 0% 0%)` = approximately **6.3:1** — passes AA.

### 5.3 Lab Demo Accessibility

Both lab demos have **zero ARIA attributes**:
- Iron Log: 28+ buttons with no `aria-label` (workout logging buttons, nav tabs, set controls)
- La Carte: 15+ buttons with no `aria-label` (menu items, quantity selectors, confirmations)
- Neither demo has skip-navigation links
- Neither has focus management for dynamic content
- Neither has `role` attributes on custom interactive elements

### 5.4 Footer Nav

Footer contains a `<nav>` with the same links as the header nav. Neither `<nav>` has an `aria-label` to distinguish them. Screen readers will announce both as "navigation" with no way to differentiate.

**Fix:** Add `aria-label="Main navigation"` to header nav and `aria-label="Footer navigation"` to footer nav.

### 5.5 Theme Toggle

The dark mode toggle has proper `aria-label="Toggle dark mode"` and the mobile menu toggle has `aria-label="Toggle menu"` with `aria-expanded`. These are correct.

---

## 6. Architecture

### 6.1 Overall Assessment

The architecture is clean and appropriate for a personal site:
- Pure Astro (no React/Vue/Svelte) — zero JS framework shipped
- Static-only output — no SSR, no API routes
- Content Collections for blog — proper separation of content and presentation
- Centralized metadata in `siteMetadata.ts`
- CSP headers via meta tag
- Privacy-first analytics (Umami, no cookies)

### 6.2 Smells

| Smell | Location | Impact |
|-------|----------|--------|
| Dead layout file | `BlogPost.astro` | Confusion for future contributors — which layout is canonical? |
| Lab page doing too much | `lab.astro` (499 lines) | Mixes 8 card templates + 2 API fetches + caching logic in one file |
| Inline stats fetching | `lab.astro` script tag | Works fine now, but the cache/fetch pattern is duplicated for FamilyOS and Bishop |
| No component for project cards | `lab.astro` | Each card is ~40 lines of near-identical markup; a `<LabCard>` component would cut the file to ~150 lines |
| Blog title logic split | `[...slug].astro` + `Base.astro` | Title construction happens in two places, causing the double-suffix bug |
| Tests can't run | `vitest` not installed | Unit tests exist but `npm install` doesn't install vitest — likely a `package-lock.json` sync issue |

### 6.3 No Concerns

- **No prop drilling** — Astro components pass props one level deep maximum
- **No state management issues** — site is stateless (localStorage for theme only)
- **No API call patterns to abstract** — the two fetch calls on lab page are the only dynamic data
- **No tight coupling** — components are independent and composable
- **Build output is tiny** — 988KB total, <1s build time

---

## Recommended Priority Order

### Do Now (< 30 min total)
1. Fix blog title double-suffix (change one line in `[...slug].astro`)
2. Run `npm audit fix` (patches 3 CVEs)
3. Remove `maximum-scale=1` from viewport meta
4. Darken `--muted-foreground` light mode to `38%`
5. Delete `BlogPost.astro`
6. Add `aria-label` to both `<nav>` elements

### Do Soon (1–2 hours)
7. Fix `Header.test.ts` to match current nav
8. Install `vitest` + `happy-dom` (or remove from devDeps if unit tests are abandoned)
9. Add `<meta description>` and OG tags to lab demo HTML files
10. Add `datetime` attribute to `<time>` elements
11. Add BlogPosting JSON-LD to blog post template
12. Change blog `og:type` to `article`

### Do Later (half day)
13. Extract `<LabCard>` component from lab.astro
14. Add `@astrojs/rss` for RSS feed
15. Add basic ARIA to lab demos (labels, roles, focus management)
16. Evaluate removing `@astrojs/markdown-remark` from direct dependencies

---

*Report generated 2026-03-14 by Bishop. No code changes made.*
