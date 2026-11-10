# agents guide for adrianlumley.co

Adrian Lumley's public personal site, live at https://adrianlumley.co. Treat it as a premium editorial/product-leader surface with subtle systems cues, not a terminal dashboard. This file is the single source of agent guidance; `CLAUDE.md` imports it.

## who owns what
Adrian owns the public surface: copy, navigation, typography, layout, and what appears on the record. Change those only as far as the task asks, following the rules below. Tests, build config, verification scripts, and internal code structure are yours to improve when you're working nearby.

## stack
- Astro + TypeScript + Tailwind CSS
- pages and routes: `src/pages/`
- content: `src/content/` (`src/content/blog/` holds the writing posts)
- global tokens, typography, layout, reduced-motion rules: `src/styles/global.css`
- tests: Vitest and Playwright; repo verifiers in `scripts/verify/`

## key files
- `src/layouts/Base.astro`: shared head/OG shell, skip link, `<Header />`, `<main>`, footer. `chrome={false}` drops header and footer (the homepage uses it)
- `src/components/Header.astro`: wordmark and the three-item nav on one row at every width; no menu toggle
- `src/components/Redirect.astro`: meta-refresh stub for moved routes
- `src/data/nav.ts`: single source of truth for the public nav, rendered by header and footer
- `src/data/siteMetadata.ts`: title, description, social links, OG defaults
- `src/lib/content.ts`: collection queries and route path helpers
- `src/lib/format.ts`: shared date formatting
- `src/lib/og-image.ts` and `src/pages/og/`: generated 1200x630 OG cards
- `public/lab/<slug>/`: self-contained HTML demos and toys

## canonical public nav
The only public nav labels, in order:

```text
writing · lab · about
```

Three items fit on one row at 320px, so there is no hamburger or mobile menu. The `adrian lumley` wordmark must not wrap. Contact is the `email` link in the footer and on about. Don't hardcode alternate nav labels in pages.

## homepage
The homepage is the record, not an app shell. It renders through `Base` with `chrome={false}`: no header, wordmark, or site footer. Dark ink on light paper from the first paint, with no fade-in; dark mode follows the system setting (`prefers-color-scheme` in `tokens.css`), remaps paper and ink together, and must never leave light ink on light ground. No theme toggle, no easter-egg script. Order: one lede line, the featured essay with date and dek, currently/past, writing, lab, then the four footer links. No name-hero, no contact pitch.

## record type on every page
Inner pages share the homepage's type system:
- one sans (Geist) at `--text-body`, weight 400, `--ink` on flat `--paper`; no `--ink-soft` text, no gradient
- the page title is the only size jump (`--text-feature`)
- section names and keys are italic `.label`s at body size; nothing uppercase, tracked, or mono outside code
- keyed content uses `.rows` / `.row` tables
- no reveal or fade-in, no view-transition crossfade, no hover lift
- one link style; internal hrefs carry the trailing slash so no click pays the canonical 308

Essays (`/writing/<slug>/`) are the one other language: Newsreader title and prose inside record chrome, via `src/styles/essay.css`, the only route that loads the serif. The writing index stays a record table with tag chips and `?tag=` deep links, no reading-time lines. Never mix the two on one page. Lab tools in `public/lab/` keep their own look.

## public-surface rules
These exist because the site is for people evaluating Adrian's work, and retired projects or invented claims would mislead them.
- UI copy is lowercase unless a proper noun requires otherwise
- no em dashes in shipped public source/content
- no mockup scaffold labels such as `homepage / hero`, `lab / flagship card`, or `signal room / episode log`
- retired, so never public: OpenClaw, Operator Stack, FamilyOS, bishop-bench, Mission Control, Rogue (and running-agent claims), Bishop, the Signal Room serial, and the Past the Pilot offer pages (no paid offer, checkout link, or advisory pitch). The lab's past the pilot ledger is separate and stays
- Hyperscience is not listed in the career record
- keep family details generic
- do not invent metrics or work outcomes

## lab
`src/pages/lab.astro` is intentionally lean, in this order: one flagship section (past the pilot), then one short section per surviving tool: fork, meeting price tag (linking its essay), ink field. No toy cards, stat tiles, or "also built" list. Homepage lab rows link to these three tools at live `public/lab/` pages. Every page under `public/lab/` carries a visible `back to lab` link in its own type and ink. Add a tool only if it says something about how Adrian builds or thinks.

## routes that matter
`/`, `/writing/`, `/lab/`, `/about/` (includes the work record; `/work/` redirects to `/about/#work`), `/contact/`, `/privacy/` (footer link), `/rss.xml`. Old `/blog/`, `/work/`, `/services/`, and `/now/` URLs must keep redirecting. Legacy or toy routes stay off the primary surface unless Adrian asks.

## verification
Run before pushing public-site changes:

```bash
npm run check
npm run build
npx vitest run
npx playwright test tests/mobile/mobile-nav.spec.ts tests/header.spec.ts tests/e2e/homepage.spec.ts --project=mobile-chrome --project=chromium
node scripts/verify/public-surface-scan.mjs
node scripts/verify/mobile-homepage.mjs
```

For homepage/header/mobile changes, check 320, 375, 390, and 414px: no horizontal scroll, no wrapping wordmark, all three nav links on the wordmark's row and tappable, hero type doesn't swallow the first screen, no scaffold labels. If a check can't run in your environment, say which one and why.

## steps that need no approval
- running and re-running any command above, and retrying one that failed or timed out
- `npm ci` to install the locked dependencies before verifying
- creating a branch, committing, pushing, and opening a pull request; direct pushes to `main` are allowed for verified work
- editing tests, verifiers, docs, and build config as the task needs

## the one step that needs Adrian's go-ahead, unless the task text gives it
A production deploy: `npm run deploy:cloudflare` (apex via `wrangler.toml`), `npm run deploy:cloudflare:www` (redirect Worker via `wrangler.www.toml`), or `npm run deploy:cloudflare:all`.

A push to `main` deploys nothing; it runs the Tests workflow (`.github/workflows/test.yml`), the same checks a pull request gets. After an authorized deploy, wait for it to finish and check the live URL before calling it live.

## zero-context contribution
For structural or contribution-infrastructure work, also read `REVIEW.md`, `docs/zero-context-contribution.md`, `.agent/contribution-contract.json`, and `.agent/architecture.json`. For copy, content, or small fixes, this file is enough. The local gate is `.agent/contribution_gate.py` (`audit`, `verify`); `docs/architecture.html` is the human architecture map and opens directly from disk.
