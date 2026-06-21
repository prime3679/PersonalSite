# AdrianLumley.co v2 — Design Variants

Three standalone, high-taste design directions for the homepage + lab refresh.
Each is a single self-contained HTML file you can open directly in a browser — no
build step, no production files touched. Content mirrors the real `src/data/lab.ts`,
`src/data/now.ts`, and `src/pages/index.astro`, plus the new **Agent Arcade** card
(→ `http://arcade.adrianlumley.co/app/`).

> These are **prototypes for review**, not production. They load fonts from Google
> Fonts CDN so the typography reads true in review; production would self-host (see
> *Implementation notes*). Lab demos in `public/lab/` stay zero-dependency — that
> rule is unchanged.

## The three directions

| # | File | Concept | Theme | Type system | Best at |
|---|------|---------|-------|-------------|---------|
| 01 | `01-operator-notebook.html` | An operator's working notebook / engineering ledger | Warm cream paper, light | Fraunces (display) + Newsreader (body) + JetBrains Mono (data labels) | Warmth, craft, "a person made this" |
| 02 | `02-personal-os-console.html` | A personal operating system run in public — panes, status line, processes | Warm graphite, dark | Space Grotesk (display) + JetBrains Mono (system voice) | Honoring the current mono brand while leveling it up; "builder" credibility |
| 03 | `03-editorial-lab.html` | A printed field journal / magazine index | Cool near-white paper, light | Bodoni Moda (Didone display) + Spectral (body) | Editorial gravitas, recruiter/advisory audiences; maximum distance from generic dev sites |

Each is responsive (fluid `clamp()` type, single-column collapse at mobile breakpoints),
respects `prefers-reduced-motion`, and uses a single load-in stagger rather than
scattered micro-animations.

### What each one deliberately avoids (the AI-slop test)
- No cyan-on-dark, no purple→blue gradients, no neon, no glassmorphism.
- No identical icon-over-heading card grids. The lab is a **ledger** (01), a
  **process list** (02), and a **table of contents** (03) — never a SaaS card wall.
- No gradient text on metrics, no decorative sparklines, no big-number hero template.
- Neutrals are tinted toward each palette's hue; pure black/white never used.
- Status badges carry real meaning (active / paused / public), not decoration.

## Recommendation

**Lead with `02 — Personal OS Console`, with `01 — Operator Notebook` as the
warm-mode counterpart.**

Reasoning:
1. **Continuity with equity.** The current site's identity is monospace + dark.
   `02` keeps that DNA so returning visitors aren't disoriented, but it replaces
   "mono because technical" with a genuine, cohesive *operating-system* metaphor —
   panes, a status line, processes with health states. That's the single
   "how was this made?" hook, and it's *true* to Adrian: the whole site really is
   one person's OS run off a Mac mini.
2. **The lab content wants to be a system, not a grid.** Agents, tools, toys with
   live-ish stats read naturally as running processes. The metaphor does narrative
   work the current card grid can't.
3. **`01` is the hedge, not a throwaway.** Same information architecture, warm light
   palette, serif voice. Shipping a light/dark pair off one token set (see below)
   gives range without a second codebase — and `01` is the stronger choice if Adrian
   wants the site to feel less "engineer," more "maker with taste."
4. **`03` is the boldest and the riskiest.** It's beautiful and the furthest from a
   generic dev portfolio, but a full Didone editorial system is a bigger tonal bet
   and a heavier type-loading cost. Recommend it only if v2 is meant to reposition
   toward advisory/writing audiences. Great candidate for the `/about` or `/work`
   pages even if the homepage goes with `02`.

Net: build **`02`** as the homepage, port its tokens to a light theme that *is* `01`,
and keep `03` in the back pocket for an editorial section.

## Implementation notes (Astro + Tailwind)

The repo already has the right bones: `darkMode: 'class'`, HSL CSS-variable color
tokens (`--background`, `--foreground`, `--muted`, `--border`), data-driven lab cards
in `src/data/lab.ts`, and a shared `Base.astro` + `Header.astro`. None of these
prototypes require throwing that away.

### 1. Add the Agent Arcade card (do this regardless of direction)
Append one entry to `labProjects` in `src/data/lab.ts` — it's already the single
source of truth and the page renders the markup:
```ts
{
  id: 'agent-arcade',
  category: 'agents',
  title: 'agent arcade',
  href: 'http://arcade.adrianlumley.co/app/',
  external: true,
  dateline: 'live · 2026',
  badge: { label: 'new', tone: 'green' },
  description:
    'a public arcade where agents play. small games and head-to-head demos you can watch, poke, and occasionally break — the playful end of the bishop stack.',
  stats: [
    { value: 'live', label: 'arena' },
    { value: 'multi', label: 'agent' },
    { value: 'open', label: 'to poke' },
  ],
  links: [{ label: 'enter the arcade ↗', href: 'http://arcade.adrianlumley.co/app/', external: true }],
},
```
> Note: arcade is currently `http://` (not `https://`). The site's CSP and the
> `upgrade-insecure-requests` directive in `Base.astro` will force/upgrade the
> scheme — confirm the arcade serves over HTTPS before launch, or the link breaks
> mixed-content rules. Easiest fix: serve arcade behind the existing Cloudflare
> tunnel like `mission.adrianlumley.co`.

### 2. Tokenize the chosen palette
Extend the existing CSS variables instead of hardcoding hex. For `02`:
```css
:root {
  --background: 40 18% 8%;     /* warm graphite, HSL to match existing var pattern */
  --foreground: 40 30% 88%;    /* bone */
  --accent: 38 72% 56%;        /* amber signal */
  --status-active: 96 22% 57%; /* sage */
  --status-paused: 22 52% 54%; /* rust */
  --status-public: 205 26% 61%;/* ice */
}
```
Then map to Tailwind in `tailwind.config.mjs` under `theme.extend.colors`
(`accent: 'hsl(var(--accent))'`, a `status` object, etc.), exactly like the current
`border`/`muted` entries. Light theme (`01`) is the same variable names with light
values — no new components.

### 3. Fonts: self-host, don't CDN
Prototypes use Google Fonts CDN; production should self-host to match the existing
JetBrains Mono setup (it's already self-hosted — see commit "Self-host JetBrains
Mono"). Use `@fontsource-variable/*` packages or drop woff2 in `public/fonts/` with
`@font-face` + `font-display: swap`. Per direction:
- 01 → `@fontsource-variable/fraunces`, `@fontsource-variable/newsreader` (+ existing mono)
- 02 → `@fontsource-variable/space-grotesk` (+ existing mono)
- 03 → `@fontsource/bodoni-moda`, `@fontsource-variable/spectral`
Update `tailwind.config.mjs` `fontFamily` with `display`/`serif` keys alongside `mono`.
The CSP `style-src`/`font-src` is `'self'` — self-hosting is required anyway; CDN
fonts would be blocked in production.

### 4. Componentize, reuse the data layer
- The lab section maps cleanly onto the existing `labProjects` + `badgeToneClasses`
  pattern. Keep the build-time stat overrides in `lab.astro` (signal-room episode
  count, familyos/bishop stats JSON) — the prototypes hardcode plausible numbers;
  production must keep pulling the real ones so they can't go stale.
- "Currently" already comes from `src/data/now.ts`. Both `index.astro` and the
  variants render the same fields — no new data source needed.
- Pull each card/row into a small Astro component (`LabEntry.astro`,
  `ProcessRow.astro`, or `IndexEntry.astro`) so the homepage feature list and the
  full `/lab` page share one renderer.

### 5. Motion & a11y
- Load-in uses `transform`/`opacity` only (no layout animation) with
  `cubic-bezier(.16,1,.3,1)` ease-out — already wrapped in
  `@media (prefers-reduced-motion: reduce)`. Keep that guard.
- `02`'s live NYC clock + uptime: the repo's `Header.astro` already ships an NYC
  clock — reuse that script rather than adding a second one.
- Maintain heading order and the existing structured-data / OG setup in `Base.astro`;
  these prototypes only mock the `<main>`.

### 6. Nav
Nav stays driven by `src/data/nav.ts` (header + footer). The prototypes show a
trimmed in-page nav for review; production keeps the real seven-item nav. Don't
hardcode links in either layout.

## Validation performed
- `node --check` on the inline scripts of all three files (extracted) — no syntax errors.
- HTML structure sanity: balanced `<section>` / `<article>` / `<div>` counts, single
  `<h1>` per file, all internal links resolve to existing routes, external links carry
  `target="_blank" rel="noopener"`.
- Responsive collapse verified via the breakpoints in each `<style>` block
  (≤520/640/720/760px single-column rules).
See the parent task report for the exact commands.
