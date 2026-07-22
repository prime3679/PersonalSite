#!/usr/bin/env python3
"""Static and executable zero-context contribution gate."""

from __future__ import annotations

import argparse
import fnmatch
import hashlib
import json
import os
import re
import signal
import subprocess
import sys
import threading
import time
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Dict, List, Sequence, Tuple


REQUIRED_CLASSIFICATION_KEYS = (
    "one_off_judgment",
    "repeatable_defect",
    "missing_domain_knowledge",
    "agent_behavior_failure",
)
SHELL_INLINE_EXECUTORS = {"sh", "bash", "zsh", "fish", "cmd", "powershell", "pwsh"}
SHELL_INLINE_FLAGS = {"-c", "/c", "-command", "-encodedcommand"}
INLINE_CODE_FLAGS = {"-c", "-e"}
NETWORK_EXECUTORS = {"curl", "wget", "scp", "ssh"}
PACKAGE_MANAGERS = {
    "apt",
    "apt-get",
    "brew",
    "bun",
    "cargo",
    "conda",
    "gem",
    "go",
    "mamba",
    "npm",
    "pip",
    "pip3",
    "pipenv",
    "pipx",
    "pnpm",
    "poetry",
    "uv",
    "yarn",
}
INSTALL_SUBCOMMANDS = {
    "install",
    "add",
    "sync",
    "bootstrap",
    "setup",
    "restore",
    "ensurepip",
    "ci",
    "i",
    "update",
    "upgrade",
}
PACKAGE_FETCH_EXECUTORS = {"bunx", "npx", "pnpx"}
PACKAGE_FETCH_SUBCOMMANDS = {"dlx", "exec", "x"}
TRUSTED_RUN_SUBCOMMANDS = {"npm", "pnpm", "yarn", "bun"}
EXECUTABLE_BLOCKED_SUBCOMMANDS = {
    "cargo": {"install"},
    "conda": {"create", "install", "update", "upgrade"},
    "gem": {"install", "update", "upgrade"},
    "go": {"get", "install"},
    "mamba": {"create", "install", "update", "upgrade"},
    "pipenv": {"install", "sync", "update", "upgrade"},
    "pipx": {"ensurepath", "inject", "install", "reinstall", "upgrade"},
}
PYTHON_MODULE_PACKAGE_MANAGERS = {"pip", "ensurepip", "uv", "pipx", "pipenv"}
DEFAULT_TIMEOUT_SECONDS = 30
MAX_TIMEOUT_SECONDS = 300
DEFAULT_OUTPUT_LIMIT_BYTES = 16 * 1024
MAX_OUTPUT_LIMIT_BYTES = 64 * 1024
PROCESS_TERMINATION_GRACE_SECONDS = 0.5
COLLECTOR_JOIN_TIMEOUT_SECONDS = 1.0
CHILD_ENV_PASSTHROUGH = (
    "PATH",
    "SYSTEMROOT",
    "COMSPEC",
    "PATHEXT",
    "TMPDIR",
    "TEMP",
    "TMP",
    "LANG",
    "LC_ALL",
)
INLINE_CODE_EXECUTOR_RE = re.compile(r"^python(?:\d+(?:\.\d+)*)?$")
ENV_ASSIGNMENT_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*=.*$")
ARCHITECTURE_SCHEMA = "personal-site.architecture"
ARCHITECTURE_FINGERPRINT_ALGORITHM = "sha256-path-null-length-null-crlf-to-lf-bytes-null-v2"
ARCHITECTURE_CONTRACT_META_NAME = "architecture-contract-sha256"
ARCHITECTURE_REQUIRED_KEYS = (
    "schema",
    "version",
    "repo_identity",
    "provenance",
    "architecture",
    "source_fingerprint",
    "components",
    "interfaces",
    "data_flows",
    "dependencies",
    "invariants",
    "protected_boundaries",
    "verification",
    "escalation_conditions",
    "doctrine",
)


class ArchitectureHTMLParser(HTMLParser):
    """Collect synchronization markers and asset references from the human map."""

    ASSET_ATTRIBUTES = {
        "img": ("src", "srcset"),
        "link": ("href",),
        "script": ("src",),
        "source": ("src", "srcset"),
        "video": ("poster",),
    }

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: List[str] = []
        self.components: List[str] = []
        self.routes: List[str] = []
        self.contract_digests: List[str] = []
        self.asset_references: List[str] = []
        self._inside_style = False
        self.style_text: List[str] = []

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, str | None]]) -> None:
        values = {name: value for name, value in attrs}
        if values.get("id"):
            self.ids.append(values["id"] or "")
        if values.get("data-architecture-component"):
            self.components.append(values["data-architecture-component"] or "")
        if values.get("data-architecture-route"):
            self.routes.append(values["data-architecture-route"] or "")
        if tag == "meta" and values.get("name") == ARCHITECTURE_CONTRACT_META_NAME:
            self.contract_digests.append(values.get("content") or "")
        for attribute in self.ASSET_ATTRIBUTES.get(tag, ()):
            if values.get(attribute):
                self.asset_references.append(f"{tag}[{attribute}]={values[attribute]!r}")
        if tag == "style":
            self._inside_style = True

    def handle_endtag(self, tag: str) -> None:
        if tag == "style":
            self._inside_style = False

    def handle_data(self, data: str) -> None:
        if self._inside_style:
            self.style_text.append(data)


class BoundedStreamCollector(threading.Thread):
    """Read a pipe without letting captured output grow unbounded."""

    def __init__(self, stream: Any, limit_bytes: int) -> None:
        super().__init__(daemon=True)
        self._stream = stream
        self._limit_bytes = limit_bytes
        self._buffer = bytearray()
        self.total_bytes = 0
        self.truncated = False

    def run(self) -> None:
        try:
            while True:
                chunk = self._stream.read(4096)
                if not chunk:
                    break
                self.total_bytes += len(chunk)
                remaining = self._limit_bytes - len(self._buffer)
                if remaining > 0:
                    self._buffer.extend(chunk[:remaining])
                if len(chunk) > remaining:
                    self.truncated = True
        finally:
            self._stream.close()

    def text(self) -> str:
        return self._buffer.decode("utf-8", errors="replace")


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=("audit", "verify"), help="Gate mode to run.")
    parser.add_argument("--repo-root", default=".", help="Repo root to audit or verify.")
    parser.add_argument(
        "--contract",
        default=".agent/contribution-contract.json",
        help="Contract path relative to repo root unless absolute.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        dest="json_output",
        help="Emit machine-readable JSON.",
    )
    return parser.parse_args(list(argv))


def is_relative_to(path: Path, root: Path) -> bool:
    try:
        path.relative_to(root)
        return True
    except ValueError:
        return False


def safe_rel_path(raw: Any, label: str, errors: List[str]) -> str | None:
    if not isinstance(raw, str) or not raw.strip():
        errors.append(f"{label} must be a non-empty string.")
        return None
    candidate = raw.strip()
    path = Path(candidate)
    if path.is_absolute():
        errors.append(f"{label} must be relative, got absolute path {candidate!r}.")
        return None
    if any(part == ".." for part in path.parts):
        errors.append(f"{label} must not escape the repo root: {candidate!r}.")
        return None
    return candidate


def load_contract(repo_root: Path, contract_arg: str) -> Tuple[Dict[str, Any] | None, Path, List[str]]:
    errors: List[str] = []
    contract_path = Path(contract_arg)
    if not contract_path.is_absolute():
        contract_path = repo_root / contract_path
    contract_path = contract_path.resolve()

    if not is_relative_to(contract_path, repo_root):
        errors.append("contract path must stay inside the repo root.")
        return None, contract_path, errors
    if not contract_path.is_file():
        errors.append(f"contract file is missing: {contract_path.relative_to(repo_root)}")
        return None, contract_path, errors

    try:
        contract = json.loads(contract_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        errors.append(f"contract JSON is malformed: {exc}")
        return None, contract_path, errors

    if not isinstance(contract, dict):
        errors.append("contract root must be a JSON object.")
        return None, contract_path, errors
    return contract, contract_path, errors


def ensure_string_list(
    value: Any,
    label: str,
    errors: List[str],
    *,
    allow_empty: bool = False,
) -> List[str]:
    if not isinstance(value, list):
        errors.append(f"{label} must be a list.")
        return []
    result: List[str] = []
    for index, item in enumerate(value):
        if not isinstance(item, str) or not item.strip():
            errors.append(f"{label}[{index}] must be a non-empty string.")
            continue
        result.append(item.strip())
    if not allow_empty and not result:
        errors.append(f"{label} must not be empty.")
    return result


def validate_optional_int(
    raw: Any,
    label: str,
    errors: List[str],
    *,
    default: int,
    maximum: int,
) -> Tuple[int, int]:
    if raw is None:
        return default, default
    if isinstance(raw, bool) or not isinstance(raw, int):
        errors.append(f"{label} must be a positive integer.")
        return default, default
    if raw <= 0:
        errors.append(f"{label} must be a positive integer.")
        return default, default
    return min(raw, maximum), raw


def validate_command_env(raw: Any, label: str, errors: List[str]) -> Dict[str, str]:
    if raw is None:
        return {}
    if not isinstance(raw, dict):
        errors.append(f"{label} must be an object mapping environment variable names to string values.")
        return {}
    result: Dict[str, str] = {}
    for key, value in raw.items():
        if not isinstance(key, str) or not key or "=" in key:
            errors.append(f"{label} keys must be non-empty strings without '='.")
            continue
        if any(char in key for char in ("\x00", "\n", "\r")):
            errors.append(f"{label} keys contain disallowed control characters.")
            continue
        if not isinstance(value, str):
            errors.append(f"{label}.{key} must be a string.")
            continue
        if any(char in value for char in ("\x00", "\n", "\r")):
            errors.append(f"{label}.{key} contains disallowed control characters.")
            continue
        result[key] = value
    return result


def unwrap_env_command(argv: Sequence[str]) -> List[str]:
    if not argv:
        return []
    executable = os.path.basename(argv[0]).lower()
    if executable != "env":
        return list(argv)

    index = 1
    while index < len(argv):
        token = argv[index]
        lowered = token.lower()
        if token == "--":
            index += 1
            break
        if ENV_ASSIGNMENT_RE.match(token):
            index += 1
            continue
        if lowered in {"-i", "--ignore-environment"}:
            index += 1
            continue
        if lowered in {"-u", "--unset"}:
            index += 2
            continue
        if lowered.startswith("--unset="):
            index += 1
            continue
        break
    return list(argv[index:])


def is_inline_code_executor(executable: str) -> bool:
    return bool(INLINE_CODE_EXECUTOR_RE.fullmatch(executable)) or executable in {"node", "nodejs", "ruby", "perl"}


def has_blocked_package_manager_tokens(executable: str, lowered: Sequence[str]) -> bool:
    package_tokens = lowered[1:]
    if executable == "uv" and len(package_tokens) >= 2 and package_tokens[0] == "pip":
        return any(token in INSTALL_SUBCOMMANDS for token in package_tokens[1:])
    if executable == "poetry" and len(package_tokens) >= 2 and package_tokens[0] == "self":
        return any(token in INSTALL_SUBCOMMANDS for token in package_tokens[1:])
    if executable in EXECUTABLE_BLOCKED_SUBCOMMANDS:
        return any(token in EXECUTABLE_BLOCKED_SUBCOMMANDS[executable] for token in package_tokens)
    return any(token in INSTALL_SUBCOMMANDS or token in PACKAGE_FETCH_SUBCOMMANDS for token in package_tokens)


def is_forbidden_package_manager_command(executable: str, lowered: Sequence[str]) -> bool:
    if executable in PACKAGE_FETCH_EXECUTORS:
        return True
    if executable == "yarn" and len(lowered) == 1:
        return True
    if executable in TRUSTED_RUN_SUBCOMMANDS and len(lowered) >= 2 and lowered[1] == "run":
        return False
    if executable == "bun":
        if len(lowered) == 1:
            return True
        if has_blocked_package_manager_tokens(executable, lowered):
            return True
        return False
    if executable not in PACKAGE_MANAGERS:
        return False
    if has_blocked_package_manager_tokens(executable, lowered):
        return True
    return False


def is_forbidden_python_module_package_manager_command(executable: str, lowered: Sequence[str]) -> bool:
    if not executable.startswith("python") or len(lowered) < 3 or lowered[1] != "-m":
        return False

    module_name = lowered[2]
    if module_name not in PYTHON_MODULE_PACKAGE_MANAGERS:
        return False

    module_tokens = lowered[3:]
    if module_name == "uv" and len(module_tokens) >= 2 and module_tokens[0] == "pip":
        return any(token in INSTALL_SUBCOMMANDS for token in module_tokens[1:])
    if module_name == "ensurepip":
        return True
    if module_name == "pip":
        return any(token in INSTALL_SUBCOMMANDS for token in module_tokens)
    if module_name in EXECUTABLE_BLOCKED_SUBCOMMANDS:
        return any(token in EXECUTABLE_BLOCKED_SUBCOMMANDS[module_name] for token in module_tokens)
    return False


def build_child_env(overrides: Dict[str, str]) -> Dict[str, str]:
    env = {
        key: value
        for key in CHILD_ENV_PASSTHROUGH
        if (value := os.environ.get(key))
    }
    env["PYTHONIOENCODING"] = "utf-8"
    env["PYTHONUNBUFFERED"] = "1"
    env.update(overrides)
    return env


def popen_session_kwargs() -> Dict[str, Any]:
    if os.name == "nt":
        creationflags = getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0)
        return {"creationflags": creationflags}
    return {"start_new_session": True}


def terminate_command(process: subprocess.Popen[bytes]) -> None:
    if process.poll() is not None:
        return
    if os.name != "nt":
        try:
            os.killpg(process.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        except OSError:
            process.kill()
        return

    ctrl_break = getattr(signal, "CTRL_BREAK_EVENT", None)
    if ctrl_break is not None:
        try:
            process.send_signal(ctrl_break)
            process.wait(timeout=PROCESS_TERMINATION_GRACE_SECONDS)
            return
        except (OSError, subprocess.TimeoutExpired, ValueError):
            pass
    process.kill()


def finalize_collectors(
    collectors: Sequence[BoundedStreamCollector],
) -> bool:
    all_joined = True
    for collector in collectors:
        collector.join(timeout=COLLECTOR_JOIN_TIMEOUT_SECONDS)
        if collector.is_alive():
            all_joined = False
    return all_joined


def sanitize_command_for_output(command: Dict[str, Any]) -> Dict[str, Any]:
    result = dict(command)
    env = result.pop("env", {})
    result["env_keys"] = sorted(env)
    return result


def validate_command_shape(
    command: Any,
    index: int,
    errors: List[str],
    collection: str = "commands",
) -> Dict[str, Any] | None:
    label = f"verification.{collection}[{index}]"
    if not isinstance(command, dict):
        errors.append(f"{label} must be an object.")
        return None

    command_id = command.get("id")
    if not isinstance(command_id, str) or not command_id.strip():
        errors.append(f"{label}.id must be a non-empty string.")

    cwd = safe_rel_path(command.get("cwd", "."), f"{label}.cwd", errors)
    argv = command.get("argv")
    if not isinstance(argv, list) or not argv:
        errors.append(f"{label}.argv must be a non-empty argv array.")
        return None

    clean_argv: List[str] = []
    for arg_index, arg in enumerate(argv):
        if not isinstance(arg, str) or not arg:
            errors.append(f"{label}.argv[{arg_index}] must be a non-empty string.")
            continue
        if any(char in arg for char in ("\x00", "\n", "\r")):
            errors.append(f"{label}.argv[{arg_index}] contains disallowed control characters.")
            continue
        clean_argv.append(arg)
    if not clean_argv:
        errors.append(f"{label}.argv must contain at least one usable string.")
        return None

    effective_argv = unwrap_env_command(clean_argv)
    if not effective_argv:
        errors.append(f"{label} wraps env without naming an executable.")
        return None

    lowered = [item.lower() for item in effective_argv]
    executable = os.path.basename(lowered[0])
    timeout_seconds, requested_timeout_seconds = validate_optional_int(
        command.get("timeout_seconds"),
        f"{label}.timeout_seconds",
        errors,
        default=DEFAULT_TIMEOUT_SECONDS,
        maximum=MAX_TIMEOUT_SECONDS,
    )
    output_limit_bytes, requested_output_limit_bytes = validate_optional_int(
        command.get("output_limit_bytes"),
        f"{label}.output_limit_bytes",
        errors,
        default=DEFAULT_OUTPUT_LIMIT_BYTES,
        maximum=MAX_OUTPUT_LIMIT_BYTES,
    )
    command_env = validate_command_env(command.get("env"), f"{label}.env", errors)

    if executable in SHELL_INLINE_EXECUTORS and any(flag in lowered[1:] for flag in SHELL_INLINE_FLAGS):
        errors.append(f"{label} uses shell-inline execution, which is forbidden.")
    if is_inline_code_executor(executable) and any(flag in lowered[1:] for flag in INLINE_CODE_FLAGS):
        errors.append(f"{label} uses inline code execution, which is forbidden.")
    if executable in NETWORK_EXECUTORS:
        errors.append(f"{label} uses a network-oriented executable ({effective_argv[0]!r}), which is forbidden.")
    if is_forbidden_package_manager_command(executable, lowered):
        errors.append(f"{label} looks like setup/install or ephemeral package-fetch work, which is forbidden.")
    if is_forbidden_python_module_package_manager_command(executable, lowered):
        errors.append(f"{label} looks like setup/install or ephemeral package-fetch work, which is forbidden.")

    return {
        "id": command_id.strip() if isinstance(command_id, str) else "",
        "cwd": cwd or ".",
        "argv": clean_argv,
        "effective_argv": effective_argv,
        "description": command.get("description", ""),
        "timeout_seconds": timeout_seconds,
        "requested_timeout_seconds": requested_timeout_seconds,
        "output_limit_bytes": output_limit_bytes,
        "requested_output_limit_bytes": requested_output_limit_bytes,
        "env": command_env,
    }


def architecture_glob_matches(path: str, pattern: str) -> bool:
    if pattern.endswith("/**") and path.startswith(pattern[:-3].rstrip("/") + "/"):
        return True
    return fnmatch.fnmatchcase(path, pattern)


def expand_architecture_sources(
    repo_root: Path,
    include: Sequence[str],
    exclude: Sequence[str],
    errors: List[str],
) -> List[str]:
    matched: set[str] = set()
    for index, pattern in enumerate(include):
        clean = safe_rel_path(pattern, f"source_fingerprint.include[{index}]", errors)
        if not clean:
            continue
        try:
            candidates = list(repo_root.glob(clean)) if any(char in clean for char in "*?[") else [repo_root / clean]
        except (OSError, ValueError) as exc:
            errors.append(f"source_fingerprint.include[{index}] is not a usable path pattern: {exc}")
            continue
        files = []
        for candidate in candidates:
            resolved = candidate.resolve()
            if is_relative_to(resolved, repo_root) and resolved.is_file():
                files.append(resolved.relative_to(repo_root).as_posix())
        if not files:
            errors.append(f"source_fingerprint.include pattern matched no files: {clean}")
        matched.update(files)

    clean_excludes = []
    for index, pattern in enumerate(exclude):
        clean = safe_rel_path(pattern, f"source_fingerprint.exclude[{index}]", errors)
        if clean:
            clean_excludes.append(clean)

    return sorted(
        path
        for path in matched
        if not any(architecture_glob_matches(path, pattern) for pattern in clean_excludes)
    )


def compute_architecture_fingerprint(repo_root: Path, paths: Sequence[str]) -> str:
    """Hash sorted path/length/content frames after normalizing CRLF bytes to LF."""
    digest = hashlib.sha256()
    for path in sorted(paths):
        data = (repo_root / path).read_bytes().replace(b"\r\n", b"\n")
        digest.update(path.encode("utf-8"))
        digest.update(b"\0")
        digest.update(str(len(data)).encode("ascii"))
        digest.update(b"\0")
        digest.update(data)
        digest.update(b"\0")
    return digest.hexdigest()


def require_architecture_object(value: Any, label: str, errors: List[str]) -> Dict[str, Any]:
    if not isinstance(value, dict) or not value:
        errors.append(f"architecture.{label} must be a non-empty object.")
        return {}
    return value


def require_architecture_list(value: Any, label: str, errors: List[str]) -> List[Any]:
    if not isinstance(value, list) or not value:
        errors.append(f"architecture.{label} must be a non-empty list.")
        return []
    return value


def validate_architecture_document(
    document: Dict[str, Any],
    repo_root: Path,
    contract_rel: str,
    human_map_rel: str,
    errors: List[str],
) -> Dict[str, Any]:
    for key in ARCHITECTURE_REQUIRED_KEYS:
        if key not in document:
            errors.append(f"architecture JSON is missing required key: {key}")

    if document.get("schema") != ARCHITECTURE_SCHEMA:
        errors.append(f"architecture.schema must be {ARCHITECTURE_SCHEMA!r}.")
    version = document.get("version")
    if isinstance(version, bool) or not isinstance(version, int) or version < 1:
        errors.append("architecture.version must be a positive integer.")

    for key in (
        "repo_identity",
        "provenance",
        "architecture",
        "dependencies",
        "protected_boundaries",
        "verification",
        "doctrine",
    ):
        require_architecture_object(document.get(key), key, errors)
    for key in ("components", "data_flows", "invariants", "escalation_conditions"):
        require_architecture_list(document.get(key), key, errors)

    components = document.get("components") if isinstance(document.get("components"), list) else []
    core_components: List[str] = []
    component_ids: set[str] = set()
    for index, component in enumerate(components):
        label = f"architecture.components[{index}]"
        if not isinstance(component, dict):
            errors.append(f"{label} must be an object.")
            continue
        for key in ("id", "name", "responsibility"):
            if not isinstance(component.get(key), str) or not component[key].strip():
                errors.append(f"{label}.{key} must be a non-empty string.")
        component_id = component.get("id")
        if isinstance(component_id, str):
            if component_id in component_ids:
                errors.append(f"{label}.id must be unique.")
            component_ids.add(component_id)
        if not isinstance(component.get("core"), bool):
            errors.append(f"{label}.core must be a boolean.")
        paths = ensure_string_list(component.get("paths"), f"{label}.paths", errors)
        for path_index, raw in enumerate(paths):
            safe_rel_path(raw, f"{label}.paths[{path_index}]", errors)
        if component.get("core") is True and isinstance(component.get("name"), str):
            core_components.append(component["name"].strip())

    interfaces = document.get("interfaces")
    routes = interfaces.get("routes") if isinstance(interfaces, dict) else None
    if not isinstance(routes, list) or not routes:
        errors.append("architecture.interfaces.routes must be a non-empty list.")
        routes = []
    core_routes: List[str] = []
    route_ids: set[str] = set()
    for index, route in enumerate(routes):
        label = f"architecture.interfaces.routes[{index}]"
        if not isinstance(route, dict):
            errors.append(f"{label} must be an object.")
            continue
        for key in ("id", "path", "kind", "source"):
            if not isinstance(route.get(key), str) or not route[key].strip():
                errors.append(f"{label}.{key} must be a non-empty string.")
        route_id = route.get("id")
        if isinstance(route_id, str):
            if route_id in route_ids:
                errors.append(f"{label}.id must be unique.")
            route_ids.add(route_id)
        if not isinstance(route.get("core"), bool):
            errors.append(f"{label}.core must be a boolean.")
        if route.get("core") is True and isinstance(route.get("path"), str):
            core_routes.append(route["path"].strip())

    fingerprint = document.get("source_fingerprint")
    source_paths: List[str] = []
    computed_digest = None
    if not isinstance(fingerprint, dict):
        errors.append("architecture.source_fingerprint must be a non-empty object.")
    else:
        if fingerprint.get("algorithm") != ARCHITECTURE_FINGERPRINT_ALGORITHM:
            errors.append(
                f"architecture.source_fingerprint.algorithm must be {ARCHITECTURE_FINGERPRINT_ALGORITHM!r}."
            )
        include = ensure_string_list(
            fingerprint.get("include"),
            "architecture.source_fingerprint.include",
            errors,
        )
        exclude = ensure_string_list(
            fingerprint.get("exclude"),
            "architecture.source_fingerprint.exclude",
            errors,
        )
        declared_digest = fingerprint.get("digest")
        if not isinstance(declared_digest, str) or not re.fullmatch(r"[0-9a-f]{64}", declared_digest):
            errors.append("architecture.source_fingerprint.digest must be a lowercase SHA-256 hex digest.")
        source_paths = expand_architecture_sources(repo_root, include, exclude, errors)
        if contract_rel in source_paths or human_map_rel in source_paths:
            errors.append("architecture source fingerprint must not include either generated architecture artifact.")
        if source_paths:
            computed_digest = compute_architecture_fingerprint(repo_root, source_paths)
            if isinstance(declared_digest, str) and declared_digest != computed_digest:
                errors.append(
                    "architecture source fingerprint is stale: "
                    f"declared {declared_digest}, computed {computed_digest}."
                )

    return {
        "schema": document.get("schema"),
        "version": document.get("version"),
        "core_components": sorted(core_components),
        "core_routes": sorted(core_routes),
        "source_files": source_paths,
        "source_fingerprint": computed_digest,
    }


def validate_architecture(
    config: Any,
    repo_root: Path,
    required_files: Sequence[str],
) -> Tuple[List[str], Dict[str, Any]]:
    errors: List[str] = []
    report: Dict[str, Any] = {}
    if not isinstance(config, dict):
        return ["architecture must be an object."], report

    contract_rel = safe_rel_path(config.get("contract"), "architecture.contract", errors)
    human_map_rel = safe_rel_path(config.get("human_map"), "architecture.human_map", errors)
    sections = ensure_string_list(
        config.get("required_html_sections"),
        "architecture.required_html_sections",
        errors,
    )
    for artifact in (contract_rel, human_map_rel):
        if artifact and artifact not in required_files:
            errors.append(f"architecture artifact must appear in required_files: {artifact}")
    if not contract_rel or not human_map_rel:
        return errors, report

    contract_path = repo_root / contract_rel
    human_map_path = repo_root / human_map_rel
    if not contract_path.is_file():
        errors.append(f"architecture contract is missing: {contract_rel}")
    if not human_map_path.is_file():
        errors.append(f"architecture human map is missing: {human_map_rel}")
    if errors and (not contract_path.is_file() or not human_map_path.is_file()):
        return errors, report

    try:
        contract_bytes = contract_path.read_bytes()
        document = json.loads(contract_bytes.decode("utf-8"))
    except json.JSONDecodeError as exc:
        errors.append(f"architecture JSON is malformed: {exc}")
        return errors, report
    except UnicodeDecodeError as exc:
        errors.append(f"architecture JSON must be UTF-8: {exc}")
        return errors, report
    if not isinstance(document, dict):
        errors.append("architecture JSON root must be an object.")
        return errors, report

    report = validate_architecture_document(
        document,
        repo_root,
        contract_rel,
        human_map_rel,
        errors,
    )

    try:
        html = human_map_path.read_text(encoding="utf-8")
    except UnicodeDecodeError as exc:
        errors.append(f"architecture human map must be UTF-8: {exc}")
        return errors, report
    parser = ArchitectureHTMLParser()
    try:
        parser.feed(html)
        parser.close()
    except Exception as exc:
        errors.append(f"architecture human map could not be parsed: {exc}")
        return errors, report

    expected_contract_digest = hashlib.sha256(contract_bytes).hexdigest()
    if not parser.contract_digests:
        errors.append(
            f"architecture human map is missing the {ARCHITECTURE_CONTRACT_META_NAME!r} meta marker."
        )
    elif len(parser.contract_digests) > 1:
        errors.append(
            f"architecture human map must contain exactly one {ARCHITECTURE_CONTRACT_META_NAME!r} meta marker."
        )
    else:
        declared_contract_digest = parser.contract_digests[0]
        if not re.fullmatch(r"[0-9a-f]{64}", declared_contract_digest):
            errors.append(
                "architecture human map contract digest marker must be a lowercase SHA-256 hex digest."
            )
        elif declared_contract_digest != expected_contract_digest:
            errors.append(
                "architecture HTML contract digest is stale: "
                f"declared {declared_contract_digest}, computed {expected_contract_digest}."
            )

    for section in sections:
        if section not in parser.ids:
            errors.append(f"architecture human map is missing required section id: {section}")
    if len(parser.components) != len(set(parser.components)):
        errors.append("architecture human map contains duplicate core component markers.")
    if len(parser.routes) != len(set(parser.routes)):
        errors.append("architecture human map contains duplicate core route markers.")
    if set(parser.components) != set(report.get("core_components", [])):
        errors.append(
            "architecture HTML and JSON core component markers disagree: "
            f"HTML={sorted(set(parser.components))}, JSON={report.get('core_components', [])}."
        )
    if set(parser.routes) != set(report.get("core_routes", [])):
        errors.append(
            "architecture HTML and JSON core route markers disagree: "
            f"HTML={sorted(set(parser.routes))}, JSON={report.get('core_routes', [])}."
        )
    if parser.asset_references:
        errors.append(
            "architecture human map contains external asset reference(s): "
            + ", ".join(parser.asset_references)
        )
    if re.search(r"url\s*\(", "\n".join(parser.style_text), flags=re.IGNORECASE):
        errors.append("architecture human map CSS must not use url(), because the file must be self-contained.")

    report["human_map"] = human_map_rel
    report["contract_digest"] = expected_contract_digest
    report["required_sections"] = sections
    return errors, report


def validate_contract(
    contract: Dict[str, Any],
    repo_root: Path,
    contract_path: Path,
) -> Tuple[List[str], Dict[str, Any]]:
    errors: List[str] = []
    report: Dict[str, Any] = {
        "canonical_doctrine": None,
        "source_of_truth": [],
        "required_files": [],
        "architecture": {},
        "preflight_commands": [],
        "commands": [],
    }

    version = contract.get("version")
    if not isinstance(version, int) or version < 1:
        errors.append("version must be a positive integer.")

    repo = contract.get("repo")
    if not isinstance(repo, str) or not repo.strip():
        errors.append("repo must be a non-empty string.")

    canonical = safe_rel_path(contract.get("canonical_doctrine"), "canonical_doctrine", errors)
    source_of_truth = [
        item
        for index, raw in enumerate(ensure_string_list(contract.get("source_of_truth"), "source_of_truth", errors))
        if (item := safe_rel_path(raw, f"source_of_truth[{index}]", errors))
    ]
    required_files = [
        item
        for index, raw in enumerate(ensure_string_list(contract.get("required_files"), "required_files", errors))
        if (item := safe_rel_path(raw, f"required_files[{index}]", errors))
    ]

    if canonical and canonical not in source_of_truth:
        errors.append("canonical_doctrine must also appear in source_of_truth.")

    boundaries = contract.get("boundaries")
    if not isinstance(boundaries, dict):
        errors.append("boundaries must be an object.")
    else:
        for key in ("portable_paths", "protected_paths", "forbidden_actions"):
            items = ensure_string_list(boundaries.get(key), f"boundaries.{key}", errors)
            if key != "forbidden_actions":
                for index, raw in enumerate(items):
                    safe_rel_path(raw, f"boundaries.{key}[{index}]", errors)

    review = contract.get("review")
    if not isinstance(review, dict):
        errors.append("review must be an object.")
    else:
        ensure_string_list(review.get("rules"), "review.rules", errors)
        classification = review.get("classification")
        if not isinstance(classification, dict):
            errors.append("review.classification must be an object.")
        else:
            for key in REQUIRED_CLASSIFICATION_KEYS:
                value = classification.get(key)
                if not isinstance(value, str) or not value.strip():
                    errors.append(f"review.classification.{key} must be a non-empty string.")

    ensure_string_list(contract.get("escalate_if"), "escalate_if", errors)

    verification = contract.get("verification")
    validated_preflight_commands: List[Dict[str, Any]] = []
    validated_commands: List[Dict[str, Any]] = []
    if not isinstance(verification, dict):
        errors.append("verification must be an object.")
    else:
        seen_ids = set()
        preflight_commands = verification.get("preflight_commands", [])
        if not isinstance(preflight_commands, list):
            errors.append("verification.preflight_commands must be a list.")
        else:
            for index, command in enumerate(preflight_commands):
                validated = validate_command_shape(command, index, errors, "preflight_commands")
                if not validated:
                    continue
                if validated["id"] in seen_ids:
                    errors.append(f"verification.preflight_commands[{index}].id must be unique.")
                seen_ids.add(validated["id"])
                validated_preflight_commands.append(validated)
        commands = verification.get("commands")
        if not isinstance(commands, list) or not commands:
            errors.append("verification.commands must be a non-empty list.")
        else:
            for index, command in enumerate(commands):
                validated = validate_command_shape(command, index, errors)
                if not validated:
                    continue
                if validated["id"] in seen_ids:
                    errors.append(f"verification.commands[{index}].id must be unique.")
                seen_ids.add(validated["id"])
                validated_commands.append(validated)

    for path_label, collection in (
        ("source_of_truth", source_of_truth),
        ("required_files", required_files),
    ):
        for raw in collection:
            resolved = (repo_root / raw).resolve()
            if not is_relative_to(resolved, repo_root):
                errors.append(f"{path_label} entry escapes repo root: {raw!r}.")
                continue
            if not resolved.exists():
                errors.append(f"missing {path_label} entry: {raw}")
                continue
            if raw.endswith("/") and not resolved.is_dir():
                errors.append(f"{path_label} entry should be a directory: {raw}")
            if not raw.endswith("/") and resolved.is_dir() and path_label == "required_files":
                errors.append(f"required_files entry should name a file, not a directory: {raw}")

    architecture_config = contract.get("architecture")
    if architecture_config is not None:
        architecture_errors, architecture_report = validate_architecture(
            architecture_config,
            repo_root,
            required_files,
        )
        errors.extend(architecture_errors)
        report["architecture"] = architecture_report

    if contract_path.name != "contribution-contract.json":
        errors.append("contract file should be named contribution-contract.json.")

    report["canonical_doctrine"] = canonical
    report["source_of_truth"] = source_of_truth
    report["required_files"] = required_files
    report["preflight_commands"] = validated_preflight_commands
    report["commands"] = validated_commands
    return errors, report


def run_commands(repo_root: Path, commands: Sequence[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[str]]:
    results: List[Dict[str, Any]] = []
    errors: List[str] = []
    for command in commands:
        cwd = (repo_root / command["cwd"]).resolve()
        if not is_relative_to(cwd, repo_root):
            errors.append(f"command {command['id']!r} cwd escapes repo root: {command['cwd']}")
            continue
        if not cwd.is_dir():
            errors.append(f"command {command['id']!r} cwd does not exist: {command['cwd']}")
            continue
        try:
            started_at = time.monotonic()
            process = subprocess.Popen(
                command["argv"],
                cwd=str(cwd),
                stdin=subprocess.DEVNULL,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=False,
                env=build_child_env(command["env"]),
                **popen_session_kwargs(),
            )
        except FileNotFoundError as exc:
            errors.append(f"command {command['id']!r} could not start: {exc}")
            results.append(
                {
                    "id": command["id"],
                    "argv": command["argv"],
                    "cwd": command["cwd"],
                    "ok": False,
                    "returncode": None,
                    "timed_out": False,
                    "duration_seconds": 0.0,
                    "timeout_seconds": command["timeout_seconds"],
                    "output_limit_bytes": command["output_limit_bytes"],
                    "stdout": "",
                    "stderr": str(exc),
                    "stdout_truncated": False,
                    "stderr_truncated": False,
                    "stdout_bytes": 0,
                    "stderr_bytes": len(str(exc).encode("utf-8")),
                }
            )
            continue
        except OSError as exc:
            errors.append(f"command {command['id']!r} could not start: {exc}")
            results.append(
                {
                    "id": command["id"],
                    "argv": command["argv"],
                    "cwd": command["cwd"],
                    "ok": False,
                    "returncode": None,
                    "timed_out": False,
                    "duration_seconds": 0.0,
                    "timeout_seconds": command["timeout_seconds"],
                    "output_limit_bytes": command["output_limit_bytes"],
                    "stdout": "",
                    "stderr": str(exc),
                    "stdout_truncated": False,
                    "stderr_truncated": False,
                    "stdout_bytes": 0,
                    "stderr_bytes": len(str(exc).encode("utf-8")),
                }
            )
            continue

        stdout_collector = BoundedStreamCollector(process.stdout, command["output_limit_bytes"])
        stderr_collector = BoundedStreamCollector(process.stderr, command["output_limit_bytes"])
        stdout_collector.start()
        stderr_collector.start()

        timed_out = False
        collector_timeout = False
        try:
            returncode = process.wait(timeout=command["timeout_seconds"])
        except subprocess.TimeoutExpired:
            timed_out = True
            terminate_command(process)
            returncode = process.wait()

        collectors_joined = finalize_collectors(
            (stdout_collector, stderr_collector),
        )
        if not collectors_joined:
            collector_timeout = True
            timed_out = True
        duration_seconds = round(time.monotonic() - started_at, 3)

        result = {
            "id": command["id"],
            "argv": command["argv"],
            "cwd": command["cwd"],
            "ok": (returncode == 0) and not timed_out,
            "returncode": returncode,
            "timed_out": timed_out,
            "duration_seconds": duration_seconds,
            "timeout_seconds": command["timeout_seconds"],
            "output_limit_bytes": command["output_limit_bytes"],
            "stdout": stdout_collector.text(),
            "stderr": stderr_collector.text(),
            "stdout_truncated": stdout_collector.truncated,
            "stderr_truncated": stderr_collector.truncated,
            "stdout_bytes": stdout_collector.total_bytes,
            "stderr_bytes": stderr_collector.total_bytes,
        }
        results.append(result)
        if collector_timeout:
            errors.append(
                f"command {command['id']!r} timed out after {command['timeout_seconds']} seconds."
            )
        elif timed_out:
            errors.append(f"command {command['id']!r} timed out after {command['timeout_seconds']} seconds.")
        elif returncode != 0:
            errors.append(f"command {command['id']!r} failed with exit code {returncode}.")
    return results, errors


def build_output(
    mode: str,
    repo_root: Path,
    contract_path: Path,
    audit: Dict[str, Any],
    command_results: List[Dict[str, Any]],
    errors: List[str],
) -> Dict[str, Any]:
    return {
        "ok": not errors,
        "mode": mode,
        "repo_root": str(repo_root),
        "contract_path": str(contract_path),
        "audit": {
            **audit,
            "preflight_commands": [
                sanitize_command_for_output(command)
                for command in audit.get("preflight_commands", [])
            ],
            "commands": [sanitize_command_for_output(command) for command in audit.get("commands", [])],
        },
        "commands": command_results,
        "errors": errors,
    }


def render_text(payload: Dict[str, Any]) -> str:
    lines = []
    status = "PASS" if payload["ok"] else "FAIL"
    lines.append(f"{status} {payload['mode']}")
    audit = payload["audit"]
    if audit.get("canonical_doctrine"):
        lines.append(f"canonical doctrine: {audit['canonical_doctrine']}")
    if audit.get("source_of_truth"):
        lines.append(f"source_of_truth entries: {len(audit['source_of_truth'])}")
    if audit.get("required_files"):
        lines.append(f"required_files entries: {len(audit['required_files'])}")
    if audit.get("commands"):
        lines.append(f"verification commands: {len(audit['commands'])}")
    if audit.get("preflight_commands"):
        lines.append(f"preflight commands: {len(audit['preflight_commands'])}")
    for command in payload["commands"]:
        state = "ok" if command["ok"] else "failed"
        lines.append(
            f"command {command['id']}: {state} "
            f"(cwd={command['cwd']}, exit={command['returncode']}, "
            f"timeout={command['timeout_seconds']}s, duration={command['duration_seconds']:.3f}s)"
        )
        if command.get("timed_out"):
            lines.append("result: timed out and was terminated by the gate")
        if command["stdout"].strip():
            lines.append("stdout:")
            lines.extend(command["stdout"].rstrip().splitlines())
            if command.get("stdout_truncated"):
                lines.append(
                    f"[stdout truncated at {command['output_limit_bytes']} bytes; saw {command['stdout_bytes']} bytes total]"
                )
        if command["stderr"].strip():
            lines.append("stderr:")
            lines.extend(command["stderr"].rstrip().splitlines())
            if command.get("stderr_truncated"):
                lines.append(
                    f"[stderr truncated at {command['output_limit_bytes']} bytes; saw {command['stderr_bytes']} bytes total]"
                )
    if payload["errors"]:
        lines.append("errors:")
        for error in payload["errors"]:
            lines.append(f"- {error}")
    return "\n".join(lines)


def main(argv: Sequence[str]) -> int:
    args = parse_args(argv)
    repo_root = Path(args.repo_root).resolve()
    if not repo_root.is_dir():
        payload = {
            "ok": False,
            "mode": args.mode,
            "repo_root": str(repo_root),
            "contract_path": args.contract,
            "audit": {},
            "commands": [],
            "errors": ["repo root does not exist or is not a directory."],
        }
        print(json.dumps(payload, indent=2) if args.json_output else render_text(payload))
        return 1

    contract, contract_path, load_errors = load_contract(repo_root, args.contract)
    audit: Dict[str, Any] = {}
    errors = list(load_errors)
    command_results: List[Dict[str, Any]] = []

    if contract is not None:
        validation_errors, audit = validate_contract(contract, repo_root, contract_path)
        errors.extend(validation_errors)
        if args.mode == "verify" and not errors:
            command_results, command_errors = run_commands(
                repo_root,
                [*audit.get("preflight_commands", []), *audit["commands"]],
            )
            errors.extend(command_errors)

    payload = build_output(args.mode, repo_root, contract_path, audit, command_results, errors)
    if args.json_output:
        print(json.dumps(payload, indent=2, sort_keys=True))
    else:
        print(render_text(payload))
    return 0 if payload["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
