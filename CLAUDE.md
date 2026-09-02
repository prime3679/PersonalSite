# PersonalSite, Project Context

Adrian Lumley's personal site. Live at https://adrianlumley.co. Cloudflare Workers Assets is the authoritative production runtime for the apex host. GitHub Pages also publishes from `main`, but it is not the authoritative apex release path.

## Stack
- **Framework:** Astro + TypeScript + Tailwind CSS
- **Typography:** four languages, each internally consistent. The record (homepage and connected pages): one sans (Geist via `@fontsource-variable/geist`) at body size and weight 400, italic reserved for labels, one 1.5x size jump per page, one ink on flat paper. Essays (`/writing/<slug>/`): Newsreader title and prose via `src/styles/essay.css`, the only route that imports or preloads the serif. Signal Room (index and episodes): the instrument via `src/styles/instrument.css`, dark panel, Geist Mono for log and meta, Geist for anything read at length, no serif. `/360/`: its own terminal file
- **Deploy:** Cloudflare Workers Assets for `adrianlumley.co/*`; a separate Cloudflare redirect Worker for `www.adrianlumley.co/*`; an active GitHub Pages workflow also publishes pushes to `main`
- **Style:** premium editorial/product-leader surface with subtle systems cues, not a terminal dashboard

## Key Files
- `src/pages/` , all pages and routes
- `src/layouts/Base.astro` , shared head/OG shell, skip link, `<Header />`, `<main>`, and footer; `chrome={false}` drops header and footer, which the homepage uses
- `src/components/Header.astro` , sticky header with wordmark, desktop nav, and mobile hamburger menu
- `src/data/nav.ts` , single source of truth for public nav
- `src/data/siteMetadata.ts` , title, description, social links, OG defaults
- `src/lib/content.ts` , canonical collection queries and route path helpers
- `src/lib/format.ts` , shared date and episode formatting
- `src/content/blog/` , writing posts, still used as the content collection
- `src/content/signal-room/` , Signal Room episodes
- `src/lib/og-image.ts` and `src/pages/og/` , generated 1200x630 OG cards
- `src/styles/global.css` , global tokens, typography, layout, reduced-motion rules
- `public/lab/<slug>/` , self-contained HTML demos and toys
- `AGENTS.md` , agent-facing current operating guide
- `.hermes/verifiers/` , repo-local verification harness

## Canonical Public Nav
Defined once in `src/data/nav.ts` and rendered by header, mobile menu, and footer.

```text
work · lab · writing · signal room · contact
```

Rules:
- mobile nav is a hamburger/toggle on inner pages
- `adrian lumley` wordmark must not wrap
- do not hardcode alternate nav labels in pages
- old `/blog/` URLs must keep redirecting/aliasing to `/writing/`

## Record Rules (every connected page)
The record does not stop at the homepage. Inner pages share one type system:
- body: the record sans at `--text-body`, weight 400, `--ink` on flat `--paper`; no `--ink-soft` text, no gradient
- the page title is the page's one size jump (`--text-feature`, same as the homepage feature title)
- section names, ledger keys, and eyebrows are italic `.label`s at body size; nothing uppercase, nothing tracked, nothing in mono outside code
- tables are `.rows` / `.row` (key column, value column), the same shape as the homepage ledger
- no reveal or fade-in animation, no view-transition crossfade, no hover lift
- one link style everywhere; internal hrefs carry the trailing slash (`postHref`, `navItems`) so no click pays the canonical 308

Three other languages sit beside the record, each whole on its own pages; do not mix them or flatten them into the record:
- essays (`/writing/<slug>/`) read in Newsreader, title and prose, inside record chrome (`src/styles/essay.css`, essay route only). The writing index stays a record table with its tag chips, per-post tag links, and `?tag=` deep links; no reading-time lines. List is record, article is essay.
- the Signal Room is one instrument on the index and every episode (`src/styles/instrument.css`): the dark panel, Geist Mono for the log and the meta lines, the record's sans for anything read at length, the single accent on the highlight. Episodes are read inside the panel. Never import `essay.css` or put Newsreader on a Signal Room page.
- `/360/` keeps its own terminal voice (system mono, black on white, `→` and `//` glyphs); it is not restyled to paper and ink

## Homepage Rules
The homepage is the record, not an app shell:
- no site header, wordmark, night shift pill, hamburger, or site footer on `/`
- dark ink on light paper from the first paint; no fade-in or reveal animation on the record
- night shift, when the visitor has it on, remaps paper and ink together; never light ink on light ground
- one lede line, the featured essay with date and dek, currently/past, writing, lab, then the four footer links
- no name-hero, no Rogue on the first screen, no contact pitch

## Live Routes That Matter
- `/`
- `/work/`
- `/about/`
- `/writing/`
- `/lab/`
- `/signal-room/`
- `/contact/`
- `/rss.xml`

Legacy/support routes may exist for compatibility or toys, but they must not re-enter the primary public surface unless Adrian explicitly asks.

## Public-Surface Rules
- all UI copy should be lowercase unless proper nouns require otherwise
- no em dashes in shipped public source/content
- no mockup scaffold labels such as `homepage / hero`, `lab / flagship card`, or `signal room / episode log`
- no public OpenClaw references
- no active public Operator Stack, FamilyOS, bishop-bench, or retired Mission Control cards/routes/stat tiles
- Rogue is the current agent surface
- Bishop and Mission Control may appear only as fictional/archive language inside Signal Room episodes, not as active product surfaces
- keep public family details generic if encountered
- do not invent metrics or work outcomes

## Lab Rules
The current Lab page is intentionally lean:
- one flagship Rogue card
- one factual stat tile only, currently `67 days running`
- one plain text row of surviving toys: iron log, joytap, my kid's world, chaos garden, meeting price tag
- no toy cards
- no Operator Stack
- do not restyle internal playground/toy HTML pages unless explicitly asked

## Signal Room Rules
- episodes live in `src/content/signal-room/`
- next episode number is derived from the highest existing `episode` frontmatter value
- publishing requires local checks and Signal Room Playwright tests
- Signal Room may use Bishop/Mission Control as fiction/archive language
- do not autopublish from loops without explicit approval

**Signal Room episode format:**
```markdown
---
title: "episode title"
episode: 8
date: YYYY-MM-DD
teaser: "one-line hook shown on the index"
badges: ["episode 08", "episode title"]
---
Prose here...
```

## Verification Commands
Before pushing public-site changes run:

```bash
npm run check
npm run build
npx vitest run
npx playwright test tests/mobile/mobile-nav.spec.ts tests/header.spec.ts tests/e2e/homepage.spec.ts --project=mobile-chrome --project=chromium
node .hermes/verifiers/public-surface-scan.mjs
node .hermes/verifiers/mobile-homepage.mjs
```

For Signal Room publishing also run:

```bash
npx playwright test tests/e2e/signal-room.spec.ts --project=chromium
```

For homepage/header/mobile changes verify 320, 375, 390, and 414px widths:
- no horizontal scroll
- no wrapping wordmark
- no orphaned nav items
- menu links remain tappable
- hero type does not swallow the first screen
- no mockup scaffold labels

## Deploy

The authoritative production release uses the Cloudflare scripts:

```bash
npm run deploy:cloudflare
npm run deploy:cloudflare:www
npm run deploy:cloudflare:all
```

`deploy:cloudflare` builds and deploys `dist/` through `wrangler.toml` to the `adrianlumley.co/*` Worker route. `deploy:cloudflare:www` deploys the separate redirect Worker through `wrangler.www.toml`. `deploy:cloudflare:all` performs both in sequence.

The active `.github/workflows/deploy.yml` workflow still builds and publishes a GitHub Pages artifact on pushes to `main`. A push alone does not complete an authoritative apex production release. After an authorized Cloudflare deploy, wait for completion and verify the live URL.

## Loop Artifacts
Rogue loop contracts and signal bus live outside this repo:

```text
~/.hermes/state/rogue-loops/contracts/
~/.hermes/state/rogue-loops/signals/
```

Coding agents should read those when working on loops, PR babysitting, Signal Room publishing, or personal-site health.

## zero-context contribution
For fresh-agent contribution work, start with `REVIEW.md`, then `AGENTS.md`, this file, and `docs/zero-context-contribution.md`. Before implementation, read `.agent/contribution-contract.json` and `.agent/architecture.json`.

Use `.agent/contribution-contract.json` as the enforceable contract and `.agent/contribution_gate.py` for local audit and verify runs.

Humans can open `docs/architecture.html` directly from disk for the synchronized visual architecture map.
