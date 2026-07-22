# self-briefing architecture

## outcome

Make the repository explain its current architecture through two synchronized, repo-owned artifacts:

- `docs/architecture.html` for humans, as a polished standalone file with no external assets
- `.agent/architecture.json` for fresh coding agents and deterministic tooling

This is contribution infrastructure only. It must not change the public site, dependencies, workflows, deployment configuration, or live state.

## observed architecture

- Astro and TypeScript build a static editorial personal site; Tailwind and global CSS provide styling.
- File routes live under `src/pages/`; `Base.astro` owns the shared document shell and composes the header, main slot, footer, metadata, and delight layer.
- `src/data/nav.ts` is the public navigation source of truth; `src/data/siteMetadata.ts` supplies site and SEO metadata.
- Astro content collections are defined in `src/content/config.ts`, with separate blog and Signal Room schemas. `src/lib/content.ts` centralizes published-content queries, ordering, and route helpers.
- Writing, Signal Room, RSS, sitemap, and generated OG endpoints consume the shared content/query layer. Legacy `/blog/` routes remain compatibility redirects.
- Cloudflare Workers Assets is the authoritative production runtime: `npm run deploy:cloudflare` builds and deploys `dist/` through `wrangler.toml` to `adrianlumley.co/*`; the separate `deploy:cloudflare:www` command deploys the `www.adrianlumley.co/*` redirect Worker through `wrangler.www.toml`; `deploy:cloudflare:all` performs both. The active GitHub Actions workflow still builds and publishes `main` to GitHub Pages, but it is not the authoritative apex release path. Repo-owned Vitest, Playwright, and `.hermes/verifiers/` checks cover code and public-surface invariants.
- Contribution doctrine and enforcement live in `REVIEW.md`, `AGENTS.md`, `CLAUDE.md`, `docs/zero-context-contribution.md`, `.agent/contribution-contract.json`, and `.agent/contribution_gate.py`.

## implementation

1. Define `.agent/architecture.json` with explicit schema/version, repository identity, provenance, scope, core components, routes/interfaces, flows, dependencies, invariants, protected boundaries, verification, escalation conditions, and doctrine pointers.
2. Define an explicit architecture-source path set that includes structural source, schemas, route implementations, relevant configuration, deployment workflows, verifiers, and contribution infrastructure while excluding the architecture artifacts themselves and volatile content bodies.
3. Fingerprint that set deterministically using lexicographically sorted repo-relative paths and a documented byte framing algorithm. Store only the resulting SHA-256 digest in the architecture contract.
4. Build `docs/architecture.html` as a responsive editorial map with embedded CSS only. Give required sections stable IDs and give each core component and route a machine-readable `data-architecture-*` marker so synchronization is deterministic.
5. Extend `.agent/contribution_gate.py` so `audit` and `verify` fail before commands run when architecture configuration, artifacts, JSON structure, HTML sections, cross-artifact component/route names, local-only HTML requirements, or source fingerprint are invalid.
6. Register the architecture artifacts and validator configuration in `.agent/contribution-contract.json`.
7. Add Python standard-library tests beside the gate for valid, malformed, missing-section/artifact, disagreement, and stale-fingerprint cases without changing protected public-site paths.
8. Update the onboarding read path without changing authority precedence: fresh agents read `.agent/architecture.json` before implementation, and humans are pointed to `docs/architecture.html`.

## verification

- Run the focused Python architecture validator tests.
- Run `python3 .agent/contribution_gate.py audit` and confirm the architecture audit appears and passes.
- Exercise at least one direct gate failure fixture to confirm fail-closed behavior before command execution.
- If reusable `node_modules` exists locally or in a documented sibling location, run the broader existing checks through a temporary untracked symlink and remove it afterward. Do not install dependencies.
- Review `git diff --check`, the complete diff, portable path values, protected-path scope, and repository status.
- Commit all changes on `chore/self-briefing-architecture` and leave the worktree clean.

## acceptance notes

- Core names and route paths must match exactly between JSON and HTML.
- The fingerprint must not include `.agent/architecture.json` or `docs/architecture.html`, preventing self-reference.
- Content bodies under `src/content/blog/` and `src/content/signal-room/` stay outside the fingerprint; their schemas and shared query/routing code remain inside it.
- Any ambiguity about a public route, deployment boundary, or protected source change is an escalation, not an invitation to guess.
