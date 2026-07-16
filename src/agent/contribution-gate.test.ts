import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const gatePath = resolve(repoRoot, '.agent/contribution_gate.py');
const python = process.env.PYTHON ?? 'python3';
const tempRoots: string[] = [];

function runGate(args: string[], cwd = repoRoot) {
  const result = spawnSync(python, [gatePath, ...args], {
    cwd,
    encoding: 'utf-8',
  });

  if (result.error) {
    throw result.error;
  }

  return result;
}

function makeTempRepo(name: string) {
  const root = mkdtempSync(resolve(tmpdir(), `${name}-`));
  tempRoots.push(root);
  mkdirSync(resolve(root, '.agent'), { recursive: true });
  return root;
}

function writeContract(root: string, contract: Record<string, unknown>) {
  writeFileSync(resolve(root, '.agent/contribution-contract.json'), `${JSON.stringify(contract, null, 2)}\n`);
}

afterEach(() => {
  while (tempRoots.length > 0) {
    rmSync(tempRoots.pop()!, { recursive: true, force: true });
  }
});

function makeBaseContract(commands: Array<Record<string, unknown>>): Record<string, unknown> {
  return {
    version: 1,
    repo: 'temp',
    canonical_doctrine: 'doctrine.md',
    source_of_truth: ['doctrine.md'],
    required_files: ['doctrine.md'],
    boundaries: {
      portable_paths: ['.agent/', 'scripts/', 'src/agent/', 'doctrine.md'],
      protected_paths: ['src/'],
      forbidden_actions: ['deploy'],
    },
    review: {
      rules: ['keep it local'],
      classification: {
        one_off_judgment: 'review only',
        repeatable_defect: 'guardrail',
        missing_domain_knowledge: 'doc gap',
        agent_behavior_failure: 'process bug',
      },
    },
    escalate_if: ['conflict'],
    verification: {
      commands,
    },
  };
}

describe('contribution gate', () => {
  it('audits the PersonalSite contract successfully', () => {
    const result = runGate(['audit', '--repo-root', repoRoot, '--json']);

    expect(result.status).toBe(0);
    const payload = JSON.parse(result.stdout);
    expect(payload.ok).toBe(true);
    expect(payload.audit.canonical_doctrine).toBe('docs/zero-context-contribution.md');
    expect(payload.audit.commands.map((command: { id: string }) => command.id)).toEqual([
      'astro-check',
      'astro-build',
      'vitest',
      'public-surface-scan',
      'mobile-homepage',
      'playwright-targeted',
    ]);
  });

  it('fails closed before running commands when the contract is invalid', () => {
    const root = makeTempRepo('gate-invalid');
    writeFileSync(resolve(root, 'README.md'), 'temp repo\n');
    writeFileSync(resolve(root, 'doctrine.md'), 'doctrine\n');
    writeFileSync(resolve(root, 'runner.py'), 'from pathlib import Path\nPath("ran.txt").write_text("ran\\n", encoding="utf-8")\n');
    const contract = makeBaseContract([
      {
        id: 'runner',
        cwd: '.',
        argv: [python, 'runner.py'],
      },
    ]);
    writeContract(root, {
      ...contract,
      required_files: ['doctrine.md', 'missing.md'],
    });

    const result = runGate(['verify', '--repo-root', root, '--json']);

    expect(result.status).toBe(1);
    const payload = JSON.parse(result.stdout);
    expect(payload.ok).toBe(false);
    expect(payload.commands).toEqual([]);
    expect(payload.errors.some((error: string) => error.includes('missing required_files entry: missing.md'))).toBe(true);
    expect(() => readFileSync(resolve(root, 'ran.txt'), 'utf-8')).toThrow();
  });

  it('fails verify when a trusted repo command exits nonzero', () => {
    const root = makeTempRepo('gate-command-fail');
    mkdirSync(resolve(root, 'scripts'), { recursive: true });
    writeFileSync(resolve(root, 'README.md'), 'temp repo\n');
    writeFileSync(resolve(root, 'doctrine.md'), 'doctrine\n');
    writeFileSync(
      resolve(root, 'scripts/fail.py'),
      'raise SystemExit(7)\n',
    );
    writeContract(root, makeBaseContract([
      {
        id: 'fails',
        cwd: '.',
        argv: [python, 'scripts/fail.py'],
        timeout_seconds: 10,
        output_limit_bytes: 4096,
      },
    ]));

    const result = runGate(['verify', '--repo-root', root, '--json']);

    expect(result.status).toBe(1);
    const payload = JSON.parse(result.stdout);
    expect(payload.ok).toBe(false);
    expect(payload.commands).toHaveLength(1);
    expect(payload.commands[0].id).toBe('fails');
    expect(payload.commands[0].returncode).toBe(7);
    expect(payload.errors).toContain("command 'fails' failed with exit code 7.");
  });

  it('rejects shell-inline execution before verify runs commands', () => {
    const root = makeTempRepo('gate-shell-inline');
    writeFileSync(resolve(root, 'README.md'), 'temp repo\n');
    writeFileSync(resolve(root, 'doctrine.md'), 'doctrine\n');
    writeContract(root, makeBaseContract([
      {
        id: 'shell-inline',
        cwd: '.',
        argv: ['bash', '-c', 'echo unsafe'],
      },
    ]));

    const result = runGate(['verify', '--repo-root', root, '--json']);

    expect(result.status).toBe(1);
    const payload = JSON.parse(result.stdout);
    expect(payload.ok).toBe(false);
    expect(payload.commands).toEqual([]);
    expect(payload.errors).toContain(
      'verification.commands[0] uses shell-inline execution, which is forbidden.',
    );
  });

  it('rejects inline Python and Node execution before verify runs commands', () => {
    const root = makeTempRepo('gate-inline-code');
    writeFileSync(resolve(root, 'README.md'), 'temp repo\n');
    writeFileSync(resolve(root, 'doctrine.md'), 'doctrine\n');
    writeContract(root, makeBaseContract([
      {
        id: 'python-inline',
        cwd: '.',
        argv: ['python3', '-c', 'print("unsafe")'],
      },
      {
        id: 'node-inline',
        cwd: '.',
        argv: ['node', '-e', 'console.log("unsafe")'],
      },
    ]));

    const result = runGate(['verify', '--repo-root', root, '--json']);

    expect(result.status).toBe(1);
    const payload = JSON.parse(result.stdout);
    expect(payload.ok).toBe(false);
    expect(payload.commands).toEqual([]);
    expect(payload.errors).toContain(
      'verification.commands[0] uses inline code execution, which is forbidden.',
    );
    expect(payload.errors).toContain(
      'verification.commands[1] uses inline code execution, which is forbidden.',
    );
  });

  it('rejects network executors before verify runs commands', () => {
    const root = makeTempRepo('gate-network');
    writeFileSync(resolve(root, 'README.md'), 'temp repo\n');
    writeFileSync(resolve(root, 'doctrine.md'), 'doctrine\n');
    writeContract(root, makeBaseContract([
      {
        id: 'network',
        cwd: '.',
        argv: ['curl', 'https://example.com'],
      },
    ]));

    const result = runGate(['verify', '--repo-root', root, '--json']);

    expect(result.status).toBe(1);
    const payload = JSON.parse(result.stdout);
    expect(payload.ok).toBe(false);
    expect(payload.commands).toEqual([]);
    expect(payload.errors).toContain(
      "verification.commands[0] uses a network-oriented executable ('curl'), which is forbidden.",
    );
  });

  it('rejects package install commands before verify runs commands', () => {
    const root = makeTempRepo('gate-install');
    writeFileSync(resolve(root, 'README.md'), 'temp repo\n');
    writeFileSync(resolve(root, 'doctrine.md'), 'doctrine\n');
    writeContract(root, makeBaseContract([
      {
        id: 'npm-install',
        cwd: '.',
        argv: ['npm', 'install'],
      },
      {
        id: 'python-pip-install',
        cwd: '.',
        argv: ['python3', '-m', 'pip', 'install', 'pytest'],
      },
    ]));

    const result = runGate(['verify', '--repo-root', root, '--json']);

    expect(result.status).toBe(1);
    const payload = JSON.parse(result.stdout);
    expect(payload.ok).toBe(false);
    expect(payload.commands).toEqual([]);
    expect(payload.errors).toContain(
      'verification.commands[0] looks like setup/install or ephemeral package-fetch work, which is forbidden.',
    );
    expect(payload.errors).toContain(
      'verification.commands[1] looks like setup/install or ephemeral package-fetch work, which is forbidden.',
    );
  });

  it('rejects npm ci and env-wrapped npx fetch commands before verify runs commands', () => {
    const root = makeTempRepo('gate-package-fetch');
    writeFileSync(resolve(root, 'README.md'), 'temp repo\n');
    writeFileSync(resolve(root, 'doctrine.md'), 'doctrine\n');
    writeContract(root, makeBaseContract([
      {
        id: 'npm-ci',
        cwd: '.',
        argv: ['npm', 'ci'],
      },
      {
        id: 'env-npx',
        cwd: '.',
        argv: ['env', 'NODE_ENV=test', 'npx', 'tsx', '--version'],
      },
    ]));

    const result = runGate(['verify', '--repo-root', root, '--json']);

    expect(result.status).toBe(1);
    const payload = JSON.parse(result.stdout);
    expect(payload.ok).toBe(false);
    expect(payload.commands).toEqual([]);
    expect(payload.errors).toContain(
      'verification.commands[0] looks like setup/install or ephemeral package-fetch work, which is forbidden.',
    );
    expect(payload.errors).toContain(
      'verification.commands[1] looks like setup/install or ephemeral package-fetch work, which is forbidden.',
    );
  });

  it('allows trusted npm run commands to execute during verify', () => {
    const root = makeTempRepo('gate-npm-run');
    writeFileSync(resolve(root, 'README.md'), 'temp repo\n');
    writeFileSync(resolve(root, 'doctrine.md'), 'doctrine\n');
    writeFileSync(
      resolve(root, 'runner.py'),
      'from pathlib import Path\nPath("ran.txt").write_text("ran\\n", encoding="utf-8")\n',
    );
    writeFileSync(
      resolve(root, 'package.json'),
      JSON.stringify({
        name: 'temp-repo',
        private: true,
        scripts: {
          verify: `${python} runner.py`,
        },
      }, null, 2) + '\n',
    );
    writeContract(root, makeBaseContract([
      {
        id: 'npm-run',
        cwd: '.',
        argv: ['npm', 'run', 'verify'],
        timeout_seconds: 10,
        output_limit_bytes: 4096,
      },
    ]));

    const result = runGate(['verify', '--repo-root', root, '--json']);

    expect(result.status).toBe(0);
    const payload = JSON.parse(result.stdout);
    expect(payload.ok).toBe(true);
    expect(payload.errors).toEqual([]);
    expect(payload.commands).toHaveLength(1);
    expect(payload.commands[0].id).toBe('npm-run');
    expect(payload.commands[0].returncode).toBe(0);
    expect(readFileSync(resolve(root, 'ran.txt'), 'utf-8')).toBe('ran\n');
  });

  it('rejects env-wrapped package fetch commands even when they would otherwise look trusted', () => {
    const root = makeTempRepo('gate-env-package-fetch');
    writeFileSync(resolve(root, 'README.md'), 'temp repo\n');
    writeFileSync(resolve(root, 'doctrine.md'), 'doctrine\n');
    writeContract(root, makeBaseContract([
      {
        id: 'env-pnpx',
        cwd: '.',
        argv: ['env', 'CI=1', 'pnpx', 'vitest', '--version'],
      },
    ]));

    const result = runGate(['verify', '--repo-root', root, '--json']);

    expect(result.status).toBe(1);
    const payload = JSON.parse(result.stdout);
    expect(payload.ok).toBe(false);
    expect(payload.commands).toEqual([]);
    expect(payload.errors).toContain(
      'verification.commands[0] looks like setup/install or ephemeral package-fetch work, which is forbidden.',
    );
  });
});
