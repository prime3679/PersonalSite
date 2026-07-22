#!/usr/bin/env python3
"""Focused tests for the architecture checks in the contribution gate."""

from __future__ import annotations

import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from typing import Any, Dict


GATE = Path(__file__).with_name("contribution_gate.py").resolve()
ALGORITHM = "sha256-path-null-length-null-bytes-null-v1"
SECTIONS = [
    "purpose",
    "stack",
    "routes",
    "components",
    "content-model",
    "data-flow",
    "deployment",
    "verification",
    "protected-boundaries",
    "contribution-path",
]


def framed_digest(path: str, data: bytes) -> str:
    digest = hashlib.sha256()
    digest.update(path.encode("utf-8"))
    digest.update(b"\0")
    digest.update(str(len(data)).encode("ascii"))
    digest.update(b"\0")
    digest.update(data)
    digest.update(b"\0")
    return digest.hexdigest()


class ArchitectureGateTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory(prefix="architecture-gate-")
        self.root = Path(self.temp_dir.name)
        (self.root / ".agent").mkdir()
        (self.root / "docs").mkdir()
        (self.root / "source.txt").write_text("architecture source\n", encoding="utf-8")
        self.write_fixture()

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def architecture(self) -> Dict[str, Any]:
        source = (self.root / "source.txt").read_bytes()
        return {
            "schema": "personal-site.architecture",
            "version": 1,
            "repo_identity": {
                "name": "fixture",
                "kind": "static site",
                "purpose": "validator fixture",
            },
            "provenance": {
                "documented_on": "2026-07-22",
                "basis": ["source.txt"],
            },
            "architecture": {
                "purpose": "fixture architecture",
                "stack": ["fixture"],
                "source_scope": ["source.txt"],
            },
            "source_fingerprint": {
                "algorithm": ALGORITHM,
                "include": ["source.txt"],
                "exclude": [".agent/architecture.json", "docs/architecture.html"],
                "digest": framed_digest("source.txt", source),
            },
            "components": [
                {
                    "id": "core",
                    "name": "core component",
                    "core": True,
                    "paths": ["source.txt"],
                    "responsibility": "fixture",
                }
            ],
            "interfaces": {
                "routes": [
                    {
                        "id": "home",
                        "path": "/",
                        "core": True,
                        "kind": "page",
                        "source": "source.txt",
                    }
                ]
            },
            "data_flows": [
                {"id": "render", "from": "source", "through": ["core"], "to": "output"}
            ],
            "dependencies": {
                "runtime": ["fixture"],
                "development": ["python standard library"],
                "external_services": [],
            },
            "invariants": ["fixture remains deterministic"],
            "protected_boundaries": {
                "paths": ["source.txt"],
                "rules": ["do not mutate fixture source during validation"],
            },
            "verification": {
                "commands": [
                    {"id": "audit", "argv": ["python3", ".agent/contribution_gate.py", "audit"]}
                ]
            },
            "escalation_conditions": ["the source boundary is ambiguous"],
            "doctrine": {
                "authority_precedence": ["doctrine.md"],
                "pointers": ["doctrine.md"],
            },
        }

    def html(self) -> str:
        sections = "\n".join(f'<section id="{section}"></section>' for section in SECTIONS)
        return f"""<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><style>body {{ color: #111; }}</style></head>
<body>
{sections}
<div data-architecture-component="core component"></div>
<div data-architecture-route="/"></div>
</body>
</html>
"""

    def contribution_contract(self) -> Dict[str, Any]:
        return {
            "version": 1,
            "repo": "fixture",
            "canonical_doctrine": "doctrine.md",
            "source_of_truth": ["doctrine.md"],
            "required_files": [
                "doctrine.md",
                ".agent/architecture.json",
                "docs/architecture.html",
            ],
            "architecture": {
                "contract": ".agent/architecture.json",
                "human_map": "docs/architecture.html",
                "required_html_sections": SECTIONS,
            },
            "boundaries": {
                "portable_paths": [".agent/", "docs/"],
                "protected_paths": ["source.txt"],
                "forbidden_actions": ["deploy"],
            },
            "review": {
                "rules": ["keep it local"],
                "classification": {
                    "one_off_judgment": "review",
                    "repeatable_defect": "guardrail",
                    "missing_domain_knowledge": "doctrine",
                    "agent_behavior_failure": "process",
                },
            },
            "escalate_if": ["conflict"],
            "verification": {
                "commands": [
                    {"id": "noop", "cwd": ".", "argv": [sys.executable, "noop.py"]}
                ]
            },
        }

    def write_fixture(self) -> None:
        (self.root / "doctrine.md").write_text("doctrine\n", encoding="utf-8")
        (self.root / "noop.py").write_text("raise SystemExit(0)\n", encoding="utf-8")
        (self.root / ".agent/architecture.json").write_text(
            json.dumps(self.architecture(), indent=2) + "\n",
            encoding="utf-8",
        )
        (self.root / "docs/architecture.html").write_text(self.html(), encoding="utf-8")
        (self.root / ".agent/contribution-contract.json").write_text(
            json.dumps(self.contribution_contract(), indent=2) + "\n",
            encoding="utf-8",
        )

    def run_audit(self) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, str(GATE), "audit", "--repo-root", str(self.root), "--json"],
            check=False,
            capture_output=True,
            text=True,
        )

    def errors(self, result: subprocess.CompletedProcess[str]) -> list[str]:
        return json.loads(result.stdout)["errors"]

    def test_valid_architecture_passes(self) -> None:
        result = self.run_audit()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        payload = json.loads(result.stdout)
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["audit"]["architecture"]["core_components"], ["core component"])
        self.assertEqual(payload["audit"]["architecture"]["core_routes"], ["/"])

    def test_malformed_architecture_json_fails_closed(self) -> None:
        (self.root / ".agent/architecture.json").write_text("{broken\n", encoding="utf-8")
        result = self.run_audit()
        self.assertEqual(result.returncode, 1)
        self.assertTrue(any("architecture JSON is malformed" in error for error in self.errors(result)))

    def test_missing_required_json_section_fails(self) -> None:
        architecture = self.architecture()
        del architecture["dependencies"]
        (self.root / ".agent/architecture.json").write_text(
            json.dumps(architecture, indent=2) + "\n",
            encoding="utf-8",
        )
        result = self.run_audit()
        self.assertEqual(result.returncode, 1)
        self.assertIn(
            "architecture JSON is missing required key: dependencies",
            self.errors(result),
        )

    def test_missing_artifact_and_html_section_fail(self) -> None:
        (self.root / "docs/architecture.html").write_text(
            self.html().replace('<section id="deployment"></section>', ""),
            encoding="utf-8",
        )
        result = self.run_audit()
        self.assertEqual(result.returncode, 1)
        self.assertTrue(any("missing required section id: deployment" in error for error in self.errors(result)))

        (self.root / "docs/architecture.html").unlink()
        result = self.run_audit()
        self.assertEqual(result.returncode, 1)
        self.assertTrue(any("architecture human map is missing" in error for error in self.errors(result)))

    def test_core_component_and_route_disagreement_fails(self) -> None:
        html = self.html().replace("core component", "different component").replace(
            'data-architecture-route="/"',
            'data-architecture-route="/different/"',
        )
        (self.root / "docs/architecture.html").write_text(html, encoding="utf-8")
        result = self.run_audit()
        self.assertEqual(result.returncode, 1)
        errors = self.errors(result)
        self.assertTrue(any("core component markers disagree" in error for error in errors))
        self.assertTrue(any("core route markers disagree" in error for error in errors))

    def test_stale_source_fingerprint_fails(self) -> None:
        (self.root / "source.txt").write_text("changed architecture source\n", encoding="utf-8")
        result = self.run_audit()
        self.assertEqual(result.returncode, 1)
        self.assertTrue(any("source fingerprint is stale" in error for error in self.errors(result)))

    def test_excluded_editorial_content_does_not_stale_fingerprint(self) -> None:
        content_dir = self.root / "content"
        content_dir.mkdir()
        content_path = content_dir / "post.md"
        content_path.write_text("first publication\n", encoding="utf-8")
        architecture = self.architecture()
        architecture["source_fingerprint"]["include"].append("content/**/*.md")
        architecture["source_fingerprint"]["exclude"].append("content/**")
        (self.root / ".agent/architecture.json").write_text(
            json.dumps(architecture, indent=2) + "\n",
            encoding="utf-8",
        )

        content_path.write_text("revised publication\n", encoding="utf-8")
        result = self.run_audit()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_external_asset_reference_fails(self) -> None:
        html = self.html().replace("</head>", '<link rel="stylesheet" href="https://example.com/x.css"></head>')
        (self.root / "docs/architecture.html").write_text(html, encoding="utf-8")
        result = self.run_audit()
        self.assertEqual(result.returncode, 1)
        self.assertTrue(any("external asset reference" in error for error in self.errors(result)))


if __name__ == "__main__":
    unittest.main()
