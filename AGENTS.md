# agents guide for adrianlumley.co

This repo is Adrian Lumley's public personal site. Treat it as a premium editorial/product-leader surface, not a terminal dashboard.

## stack
- Astro + TypeScript
- source pages: `src/pages/`
- content: `src/content/`
- global styles: `src/styles/global.css`
- tests: Vitest and Playwright

## canonical public nav
The only public nav labels, in order:

```text
writing · lab · about
```

Three items fit on one row at 320px, so there is no hamburger or mobile menu. The `adrian lumley` wordmark must not wrap. Contact is the `email` link in the footer and on about.

## homepage
The homepage is the record, not an app shell. It renders through `Base` with `chrome={false}`: no header, wordmark, or site footer. The record is dark ink on light paper from the first paint with no fade-in; dark mode follows the system setting, remaps paper and ink together, and must never leave light ink on light ground. There is no theme toggle and no easter-egg script. Keep the featured essay under the lede. Do not restore a name-hero or add a contact pitch.

## record type on every page
Inner pages share the homepage's type system: one sans at body size and weight 400 in one ink on flat paper, the page title as the only size jump, italic `.label`s for section names and keys, `.rows` tables for anything keyed, no uppercase or mono display text, no fade-in. Internal hrefs carry the trailing slash.

One other language sits beside it, whole on its own pages: essays (`/writing/<slug>/`) read in Newsreader while the writing index stays a record table with its tag filter. Never mix the two on one page.

## public-surface rules
- all UI copy should be lowercase unless proper nouns require otherwise
- no em dashes in shipped public source/content
- no mockup scaffold labels such as `homepage / hero`, `lab / flagship card`, or `signal room / episode log`
- no public OpenClaw references
- no public Operator Stack, FamilyOS, bishop-bench, or retired Mission Control cards/routes/stat tiles
- Rogue is retired; no public Rogue references or running-agent claims
- no public Bishop or Mission Control references; the Signal Room serial that carried them is retired

## routes that matter
- `/`
- `/writing/`
- `/lab/`
- `/about/` (includes the work record)
- `/contact/`

Old `/blog/`, `/work/`, `/services/`, and `/now/` URLs must keep redirecting instead of 404ing.

## verification commands
Run these before pushing public-site changes:

```bash
npm run check
npm run build
npx vitest run
npx playwright test tests/mobile/mobile-nav.spec.ts tests/header.spec.ts tests/e2e/homepage.spec.ts --project=mobile-chrome --project=chromium
node .hermes/verifiers/public-surface-scan.mjs
node .hermes/verifiers/mobile-homepage.mjs
```

## visual quality gates
For homepage/header/mobile changes verify 320, 375, 390, and 414px widths:
- no horizontal scroll
- no wrapping wordmark
- all three nav links on the wordmark's row
- nav links remain tappable
- hero type does not swallow the first screen
- no mockup scaffolding labels

## git/deploy
- direct-to-main pushes are allowed for verified private repo/site work
- Cloudflare Workers Assets is the authoritative production runtime for `adrianlumley.co/*`
- `npm run deploy:cloudflare` builds and deploys `dist/` through `wrangler.toml`; `npm run deploy:cloudflare:www` deploys the separate `www.adrianlumley.co/*` redirect Worker; `npm run deploy:cloudflare:all` performs both
- pushes to `main` still trigger the active GitHub Pages workflow, but that pipeline is not the authoritative apex production release path
- never report done at commit or push only; after an authorized production deploy, wait for it to complete and verify the live URL in browser or via fetch before declaring live

## zero-context contribution
For fresh-agent contribution work, read `REVIEW.md` first, then this file, `CLAUDE.md`, and `docs/zero-context-contribution.md`. Before implementation, read `.agent/contribution-contract.json` and `.agent/architecture.json`.

The repo-owned contract lives at `.agent/contribution-contract.json`, and the local gate lives at `.agent/contribution_gate.py`.

The synchronized human architecture map lives at `docs/architecture.html` and works when opened directly from disk.

Zero-context contribution work should tighten doctrine, contracts, tests, and verification without changing the public site surface unless the task explicitly asks for site changes.
