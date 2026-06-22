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
work · lab · writing · signal room · contact
```

Keep the mobile nav as a clean hamburger/toggle. The `adrian lumley` wordmark must not wrap.

## public-surface rules
- all UI copy should be lowercase unless proper nouns require otherwise
- no em dashes in shipped public source/content
- no mockup scaffold labels such as `homepage / hero`, `lab / flagship card`, or `signal room / episode log`
- no public OpenClaw references
- no public Operator Stack, FamilyOS, bishop-bench, or retired Mission Control cards/routes/stat tiles
- Rogue is the current agent surface
- Bishop and Mission Control may appear only as fictional/archive language inside Signal Room episodes, not as active product surfaces

## routes that matter
- `/`
- `/work/`
- `/about/`
- `/writing/`
- `/lab/`
- `/signal-room/`
- `/contact/`

Old `/blog/` URLs must keep redirecting/aliasing to writing instead of 404ing.

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

For Signal Room publishing also run:

```bash
npx playwright test tests/e2e/signal-room.spec.ts --project=chromium
```

## visual quality gates
For homepage/header/mobile changes verify 320, 375, 390, and 414px widths:
- no horizontal scroll
- no wrapping wordmark
- no orphaned nav items
- menu links remain tappable
- hero type does not swallow the first screen
- no mockup scaffolding labels

## git/deploy
- direct-to-main pushes are allowed for verified private repo/site work
- never report done at commit or push only
- wait for GitHub Pages deploy
- verify the live URL in browser or via fetch before declaring live

## loop artifacts
Rogue loop contracts and signal bus live outside this repo:

```text
~/.hermes/state/rogue-loops/contracts/
~/.hermes/state/rogue-loops/signals/
```

Coding agents should read those when working on loops, PR babysitting, Signal Room publishing, or personal-site health.
