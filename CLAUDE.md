# PersonalSite, Project Context

Adrian Lumley's personal site. Live at https://adrianlumley.co. GitHub Pages deploys from `main`.

## Stack
- **Framework:** Astro + TypeScript + Tailwind CSS
- **Typography:** premium editorial system using Newsreader, Geist, and Geist Mono via `@fontsource-variable/*`
- **Deploy:** GitHub Pages (`prime3679/PersonalSite`), push to `main` triggers deploy
- **Style:** premium editorial/product-leader surface with subtle systems cues, not a terminal dashboard

## Key Files
- `src/pages/` , all pages and routes
- `src/layouts/Base.astro` , shared head/OG shell, skip link, `<Header />`, `<main>`, and footer
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
- mobile nav is a hamburger/toggle
- `adrian lumley` wordmark must not wrap
- do not hardcode alternate nav labels in pages
- old `/blog/` URLs must keep redirecting/aliasing to `/writing/`

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
```bash
git add -A
git commit -m "type: concise message"
git push origin HEAD:main
gh run watch <run_id> --repo prime3679/PersonalSite --exit-status
```

The job is not complete at push. Wait for GitHub Pages deploy, then verify the live URL.

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
