# review

Fresh agents should read this file first, then `AGENTS.md`, `CLAUDE.md`, and `docs/zero-context-contribution.md`. Before implementation, read `.agent/contribution-contract.json` and `.agent/architecture.json`. Humans can open `docs/architecture.html` directly for the visual map.

## authority
- `AGENTS.md` sets public-site doctrine and verification requirements
- `CLAUDE.md` adds repo structure and deployment context
- `.agent/contribution-contract.json` defines the enforceable contribution contract
- `.agent/architecture.json` describes the implementation architecture; `docs/architecture.html` is its synchronized human map
- `docs/zero-context-contribution.md` explains how to apply the standard

Read order is for onboarding only, not authority precedence.

## boundaries
- this repo is Adrian's public site, not a general sandbox
- for zero-context contribution work, do not change public source/content/visuals, dependencies, lockfiles, workflows, deploy config, auth, or services
- keep portable files free of secrets, private logistics, channel ids, and local absolute paths

## classify the work
- `one_off_judgment`: review comment, not infrastructure by default
- `repeatable_defect`: encode a guardrail, test, or doc
- `missing_domain_knowledge`: tighten local doctrine
- `agent_behavior_failure`: harden the contribution path or verification flow

## verify
- static/context-only: `python3 .agent/contribution_gate.py audit`
- full public-site: `python3 .agent/contribution_gate.py verify`, using the exact command set defined in `.agent/contribution-contract.json` and `AGENTS.md`

## escalate
- instruction conflict that would change site behavior
- verification needs installs or secrets
- any action would trigger deploy or touch live state
