# zero-context contribution standard

This repo is self-briefing for fresh coding agents. Start here, then follow the repo-local doctrine in order.

## authority precedence
1. `AGENTS.md`
2. `CLAUDE.md`
3. `REVIEW.md`
4. `.agent/contribution-contract.json`
5. this document

`.agent/architecture.json` and `docs/architecture.html` are synchronized descriptive maps, not additional doctrine authorities.

If instructions conflict, the higher-precedence file wins. Read order is onboarding sequence, not authority precedence. Escalate instead of guessing when a conflict would change site behavior.

## what this repo is
- Adrian Lumley's public personal site
- a premium editorial and product-leader surface
- not a sandbox for visual experiments, dashboard sludge, or speculative product copy

## public-site boundaries
- preserve the canonical public nav and lowercase editorial voice already defined in `AGENTS.md`
- do not change public site source, content, visuals, dependencies, lockfiles, workflows, deploy config, auth, or services for zero-context contribution work unless the task explicitly requires it
- treat `src/`, `public/`, `.github/`, package manifests, and deploy/config files as protected by default
- contribution-only infrastructure under `src/agent/` is the discoverable exception for repo-owned gate tests; keep the rest of `src/` protected
- keep portable docs and contracts free of credentials, channel ids, family/logistics details, and local absolute paths
- honest boundary: gate `verify` runs trusted repo-owned commands with defense in depth, but it is not a sandbox

## review vs infrastructure
- `one_off_judgment`: editorial or product judgment that should stay in review comments unless asked to encode it
- `repeatable_defect`: a bug, missing guardrail, or flaky workflow that should become repo-owned infrastructure
- `missing_domain_knowledge`: important repo context missing from local docs or contracts; add or tighten doctrine
- `agent_behavior_failure`: an agent process failure such as skipped verification, unsafe commands, or ignored boundaries; fix the contract, docs, or tests

Bias toward infrastructure when the same mistake could recur for a fresh agent without more local guidance.

## required read order for a fresh agent
1. Read `REVIEW.md` for the short brief.
2. Read `AGENTS.md` and `CLAUDE.md` for site doctrine and stack context.
3. Read `.agent/contribution-contract.json` before changing contribution or verification behavior.
4. Read `.agent/architecture.json` before implementation for components, routes, flows, boundaries, and verification context.
5. Open `docs/architecture.html` directly from disk when a human-readable system map is useful.
6. Use `.agent/contribution_gate.py audit` before edits when touching the contribution standard.

## verification tiers
Static and context-only checks:
```bash
python3 .agent/contribution_gate.py audit
```

Full public-site verification:
```bash
python3 .agent/contribution_gate.py verify
node_modules/.bin/astro check
node_modules/.bin/astro build
node_modules/.bin/vitest run
node .hermes/verifiers/public-surface-scan.mjs
node .hermes/verifiers/mobile-homepage.mjs
node_modules/.bin/playwright test tests/mobile/mobile-nav.spec.ts tests/header.spec.ts tests/e2e/homepage.spec.ts --project=mobile-chrome --project=chromium
```

Notes:
- do not add automatic install, bootstrap, or dependency mutation commands to the contract
- `verification.profiles.static_context_only` documents the lighter check set, while the current gate `verify` command executes the full repo-owned verification command list
- if local `node_modules/` is absent and an already-installed sibling copy is available, a temporary untracked symlink is acceptable for verification only and must be removed afterward
- for Signal Room publishing, keep using the extra Playwright coverage already documented in `AGENTS.md`

## escalation conditions
Escalate before continuing if:
- repo instructions conflict materially and cannot be reconciled without changing site behavior
- full verification would require installing dependencies or accessing secrets
- any action would touch live state, trigger deploy, or leave this worktree

## expected contribution shape
- keep changes repo-local, minimal, and reversible
- prefer tightening doctrine, contracts, and tests over adding ceremony
- when done, report exact command evidence, changed files, commit SHA, and any unmet checks
