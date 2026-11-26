"""Publish a public snapshot via the authenticated Worker ingestion route."""
import argparse
import os
from pathlib import Path
import re
from urllib.parse import urlsplit

from crawl import failure, read_json, request


def publish(path, env):
    url = env.get("SCHOLARSHIP_WORKER_URL", "")
    token = env.get("SCHOLARSHIP_INGEST_TOKEN", "")
    if env.get("CLOUDFLARE_TIER") != "workers-free" or not url or not token:
        return "disabled"
    host = urlsplit(url).hostname or ""
    if (not re.fullmatch(r"https://[a-z0-9.-]+\.workers\.dev/api/scholarships", url)
            or not host.endswith(".workers.dev") or not 32 <= len(token) <= 500):
        raise ValueError("Invalid Worker URL or ingestion secret")
    payload = read_json(path, None)
    if not payload:
        raise ValueError("Missing snapshot")
    request(url, payload, {"Authorization": f"Bearer {token}"}, limit=4_000, method="PUT")
    return "ok"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("snapshot", type=Path)
    args = parser.parse_args()
    try:
        status = publish(args.snapshot, os.environ)
    except (OSError, ValueError) as exc:
        print(f"D1 sync failed: {failure(exc)}. JSON and queue remain on the data branch.")
        return 1
    print(f"D1 sync: {status}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
