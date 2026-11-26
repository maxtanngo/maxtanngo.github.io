"""Verify the configured free-tier providers and an isolated staging D1."""
from datetime import datetime, timezone
import json
import os
from pathlib import Path
from tempfile import TemporaryDirectory

from crawl import ROOT, failure, gemini_call, read_json, request, run, workers_ai_call, write_json
from publish import publish


def check_translation(call, row, env):
    raw = call(row, env)
    result = json.loads(raw) if isinstance(raw, str) else raw
    if not isinstance(result.get("translation"), str) or not result["translation"].strip():
        raise ValueError("Empty translation")


def check_worker(snapshot, env):
    with TemporaryDirectory() as folder:
        path = Path(folder) / "snapshot.json"
        write_json(path, snapshot)
        if publish(path, env) != "ok":
            raise ValueError("Staging write disabled")
    result = json.loads(request(env["SCHOLARSHIP_WORKER_URL"], limit=96_000))
    if result != snapshot:
        raise ValueError("Readback differs from the submitted snapshot")


def main(env):
    prerequisites = {
        "separate Worker URL": bool(env.get("SCHOLARSHIP_WORKER_URL"))
        and env.get("SCHOLARSHIP_WORKER_URL") != env.get("SCHOLARSHIP_PRODUCTION_WORKER_URL"),
        "staging enabled": env.get("SCHOLARSHIP_STAGING_ENABLED") == "true",
        "Gemini verified free": env.get("GEMINI_TIER") == "free-unbilled",
        "Cloudflare verified free": env.get("CLOUDFLARE_TIER") == "workers-free",
        **{key: bool(env.get(key)) for key in (
            "GEMINI_API_KEY", "CF_ACCOUNT_ID", "CF_AI_TOKEN",
            "SCHOLARSHIP_WORKER_URL", "SCHOLARSHIP_INGEST_TOKEN",
        )},
    }
    for name, present in prerequisites.items():
        print(f"- {name}: {'ready' if present else 'missing'}")
    if not all(prerequisites.values()):
        print("Live calls skipped. Confirm the staging configuration.")
        return 1

    registry = read_json(ROOT / "sources.json", [])
    now = datetime.now(timezone.utc)
    state = {}
    snapshot = run(registry, state, now, {})
    for source, data in state["sources"].items():
        print(f"- Source {source}: {data['health']}")

    passed = True
    for label, operation in (
        ("Gemini", lambda: check_translation(gemini_call, registry[0], env)),
        ("Workers AI", lambda: check_translation(workers_ai_call, registry[0], env)),
        ("Worker and D1", lambda: check_worker(snapshot, env)),
    ):
        try:
            operation()
            print(f"- {label}: PASS")
        except (OSError, ValueError, KeyError, TypeError, AttributeError, IndexError) as exc:
            print(f"- {label}: FAIL ({failure(exc)})")
            passed = False
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main(os.environ))
