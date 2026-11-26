"""Fetch registered official pages and produce a public snapshot plus operator state."""
import argparse
from datetime import datetime, timedelta, timezone
from hashlib import sha256
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import sys
import tempfile
from urllib.error import HTTPError
from urllib.parse import urljoin, urlsplit
from urllib.request import Request, build_opener, HTTPRedirectHandler
from urllib.robotparser import RobotFileParser

ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT.parent / "hoc-tap" / "san-hoc-bong" / "snapshot.json"
USER_AGENT = "MaxNgoScholarship"
LIMIT = 1_500_000
MAX_AI_CALLS = 4
GEMINI = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent"
WORKERS_AI = "https://api.cloudflare.com/client/v4/accounts/{account}/ai/run/@cf/meta/llama-3.1-8b-instruct-fast"
PUBLIC_FIELDS = ("id", "title", "provider", "country", "level", "funding", "url", "description")
DATE = r"[0-9]{1,2} [A-Za-z]+ [0-9]{4}"


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def request(url, payload=None, headers=None, limit=LIMIT, method=None):
    if urlsplit(url).scheme != "https":
        raise ValueError("HTTPS required")
    body = json.dumps(payload).encode() if payload is not None else None
    req = Request(url, data=body, method=method, headers={
        "User-Agent": USER_AGENT, "Content-Type": "application/json", **(headers or {})
    })
    with build_opener(NoRedirect()).open(req, timeout=15) as response:
        data = response.read(limit + 1)
        if len(data) > limit:
            raise ValueError("Response exceeds limit")
        return data.decode("utf-8", errors="replace")


def fetch_source(url):
    parts = urlsplit(url)
    robots_url = f"{parts.scheme}://{parts.netloc}/robots.txt"
    robots = RobotFileParser(robots_url)
    try:
        robots.parse(request(robots_url, limit=128_000).splitlines())
    except HTTPError as exc:
        if exc.code != 404:
            raise
    else:
        if not robots.can_fetch(USER_AGENT, url):
            raise ValueError("robots.txt disallows crawling")
    return request(url)


class PageText(HTMLParser):
    HIDDEN = {"script", "style", "template", "noscript", "svg"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.hidden = []
        self.chunks = []
        self.links = []
        self.link = None

    def handle_starttag(self, tag, attrs):
        if tag in self.HIDDEN:
            self.hidden.append(tag)
        if tag == "a" and not self.hidden:
            self.link = (dict(attrs).get("href"), [])

    def handle_endtag(self, tag):
        if self.hidden and self.hidden[-1] == tag:
            self.hidden.pop()
        if tag == "a" and self.link:
            href, chunks = self.link
            if href:
                self.links.append((href, " ".join(" ".join(chunks).split())))
            self.link = None

    def handle_data(self, data):
        if not self.hidden:
            self.chunks.append(data)
            if self.link:
                self.link[1].append(data)


def parse_html(html):
    parser = PageText()
    parser.feed(html)
    parser.close()
    return parser


def page_text(html):
    return " ".join(" ".join(parse_html(html).chunks).split())


def discover_asean(source, fetch, previous_url):
    feed = source["feedUrl"]
    candidates = []
    for href, label in parse_html(fetch(feed)).links:
        match = re.match(r"Application for ASEAN Scholarship for Vietnam Academic Year (20\d{2})\b", label, re.I)
        if not match:
            continue
        target = urlsplit(urljoin(feed, href))
        if (target.scheme == "https" and target.netloc == urlsplit(feed).netloc
                and re.fullmatch(r"/mission-updates/[a-z0-9-]+/", target.path)
                and not target.query and not target.fragment):
            candidates.append((int(match[1]), target.geturl()))
    return max(candidates)[1] if candidates else previous_url


def iso(date):
    return date.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def parse_date(value):
    date = datetime.fromisoformat(value)
    if date.utcoffset() is None:
        raise ValueError("Timestamp requires a timezone")
    return date


def extract(source, text, now=None):
    """Adapters use bounded institution-specific evidence. Missing evidence means unknown."""
    identifier = source["id"]
    if identifier == "chevening-vietnam" and re.search(r"Chevening in Vietnam", text, re.I):
        match = re.search(r"Applications for (20\s?\d\s?\d)\s*[-–]\s*(20\s?\d\s?\d) Chevening Scholarships are now closed", text, re.I)
        if match:
            return {"signal": "closed", "cycle": "–".join(value.replace(" ", "") for value in match.groups())}
    if identifier == "australia-awards-vietnam":
        matches = re.findall(rf"\bVietnam\s+({DATE})\s+(\d{{4}})\s+(AEDT|AEST)\s+({DATE})\s+(\d{{4}})\s+(AEDT|AEST)\b", text)
        if len(set(matches)) == 1:
            opening, open_time, open_zone, closing, close_time, close_zone = matches[0]

            def australian_date(date, clock, zone):
                offset = "+1100" if zone == "AEDT" else "+1000"
                return datetime.strptime(f"{date} {clock} {offset}", "%d %B %Y %H%M %z")

            starts = australian_date(opening, open_time, open_zone)
            ends = australian_date(closing, close_time, close_zone)
            return {"signal": "window", "opensAt": iso(starts), "closesAt": iso(ends),
                    "cycle": f"Đợt nộp hồ sơ {starts.year}"}
    if identifier == "asean-scholarship-vietnam":
        years = set(re.findall(r"ASEAN Scholarship for Vietnam Academic Year (20\d{2})", text, re.I))
        dates = set(re.findall(rf"ASEAN Scholarship for Vietnam is now open from now till ({DATE})", text, re.I))
        if len(years) == len(dates) == 1:
            deadline = datetime.strptime(dates.pop(), "%d %B %Y").date()
            year = int(years.pop())
            if deadline.year in {year - 1, year}:
                singapore_today = (now or datetime.now(timezone.utc)).astimezone(timezone(timedelta(hours=8))).date()
                return {"signal": "closed" if deadline < singapore_today else "unknown",
                        "cycle": f"Năm học {year}", "deadlineOn": deadline.isoformat()}
    if identifier == "ubc-international-scholars":
        open_years = set(re.findall(r"Applications for (?:the )?September (20\d{2}) are now open", text, re.I))
        deadlines = set(re.findall(
            r"until ([A-Za-z]+) (\d{1,2})(?:st|nd|rd|th)?,? (20\d{2}),? at (\d{1,2}:\d{2})\s*(AM|PM)\s+(PCT|PST|PDT|Pacific Time)(?: \([^)]*\))? to apply to UBC and submit your International Scholars Program application",
            text, re.I))
        if len(open_years) == len(deadlines) == 1 and not re.search(
            r"applications (?:are (?:now )?closed|have closed)|no longer accepting applications", text, re.I
        ):
            month, day, year, clock, meridiem, zone = deadlines.pop()
            intake = open_years.pop()
            end = datetime.strptime(f"{month} {day} {year} {clock} {meridiem}", "%B %d %Y %I:%M %p")
            if int(year) in {int(intake) - 1, int(intake)} and end >= datetime(2026, 3, 9):
                # British Columbia adopted Pacific Time (UTC-7) year-round in 2026.
                offset = -8 if zone.upper() == "PST" else -7
                return {"signal": "window", "closesAt": iso(end.replace(tzinfo=timezone(timedelta(hours=offset)))),
                        "cycle": f"Nhập học tháng 9/{intake}"}
    return {"signal": "unknown"}


def normalized(value):
    return " ".join(value.casefold().split())


def validate_registry(rows):
    unique = []
    ids, urls, programs = set(), set(), set()
    for row in rows:
        for key in PUBLIC_FIELDS + ("translationInput",):
            value = row[key]
            if not isinstance(value, str) or not value.strip() or len(value) > 500:
                raise ValueError(f"Invalid registry field: {key}")
        url = urlsplit(row["url"])
        if (url.scheme != "https" or not url.hostname or url.username or url.password
                or url.port or url.query or url.fragment or not re.fullmatch(r"[a-z0-9-]{1,100}", row["id"])):
            raise ValueError("Invalid official URL or source ID")
        canonical = (url.hostname.removeprefix("www."), url.path.rstrip("/"))
        program = tuple(normalized(row[key]) for key in ("title", "provider", "country"))
        if row["id"] in ids or canonical in urls or program in programs:
            continue
        if "feedUrl" in row and row["feedUrl"] != "https://hanoi.mfa.gov.sg/mission-updates/":
            raise ValueError("Unregistered discovery feed")
        validate_evidence(row["reviewed"])
        parse_date(row["reviewed"]["checkedAt"])
        ids.add(row["id"])
        urls.add(canonical)
        programs.add(program)
        unique.append(row)
    if not unique or len(unique) > 100:
        raise ValueError("Registry must contain 1–100 unique sources")
    return unique


def validate_evidence(evidence):
    if evidence["signal"] not in {"window", "closed", "unknown"}:
        raise ValueError("Invalid source signal")
    end = parse_date(evidence["closesAt"]) if "closesAt" in evidence else None
    start = parse_date(evidence["opensAt"]) if "opensAt" in evidence else None
    if evidence["signal"] == "window" and (end is None or (start and start >= end)):
        raise ValueError("Invalid application window")
    if "deadlineOn" in evidence:
        datetime.strptime(evidence["deadlineOn"], "%Y-%m-%d")
    if "checkedAt" in evidence:
        parse_date(evidence["checkedAt"])


def prompt(source):
    return ("Translate this approved public scholarship description into Vietnamese. "
            "Do not add claims. Return JSON with only the string key translation.\n"
            + source["translationInput"])


def gemini_call(source, env):
    data = json.loads(request(GEMINI, {
        "contents": [{"parts": [{"text": prompt(source)}]}],
        "generationConfig": {"responseMimeType": "application/json", "maxOutputTokens": 384,
                             "thinkingConfig": {"thinkingLevel": "MINIMAL"}}
    }, {"x-goog-api-key": env["GEMINI_API_KEY"]}, limit=20_000))
    return data["candidates"][0]["content"]["parts"][-1]["text"]


def workers_ai_call(source, env):
    account = env["CF_ACCOUNT_ID"]
    if not re.fullmatch(r"[0-9a-f]{32}", account):
        raise ValueError("Invalid Cloudflare account ID")
    data = json.loads(request(WORKERS_AI.format(account=account), {
        "messages": [{"role": "user", "content": prompt(source)}],
        "response_format": {"type": "json_object"}, "max_tokens": 256
    }, {"Authorization": f"Bearer {env['CF_AI_TOKEN']}"}, limit=20_000))
    return data["result"]["response"]


def failure(exc):
    return f"http-{exc.code}" if isinstance(exc, HTTPError) else type(exc).__name__


def process_queue(sources, state, env, now):
    providers = []
    if env.get("GEMINI_TIER") == "free-unbilled" and env.get("GEMINI_API_KEY"):
        providers.append(("gemini", gemini_call))
    if (env.get("CLOUDFLARE_TIER") == "workers-free" and env.get("CF_ACCOUNT_ID")
            and env.get("CF_AI_TOKEN")):
        providers.append(("workers-ai", workers_ai_call))
    state["ai"] = {"gemini": "disabled", "workers-ai": "disabled"}
    state["ai"].update({name: "available" for name, _ in providers})
    disabled = set()
    budget = MAX_AI_CALLS
    for identifier, job in list(state["queue"].items()):
        for name, call in providers:
            if not budget or name in disabled:
                continue
            budget -= 1
            try:
                raw = call(sources[identifier], env)
                value = json.loads(raw) if isinstance(raw, str) else raw
                result = value["translation"]
                if set(value) != {"translation"} or not isinstance(result, str) or not 1 <= len(result.strip()) <= 500:
                    raise ValueError("Invalid translation")
            except (OSError, ValueError, KeyError, TypeError, IndexError) as exc:
                reason = failure(exc)
                if isinstance(exc, (HTTPError, OSError)):
                    disabled.add(name)
                state["ai"][name] = reason
                job["lastError"] = reason
                job["attempts"] += 1
                job["lastAttemptAt"] = iso(now)
                continue
            state["translations"][identifier] = {"revision": job["revision"], "provider": name,
                                                     "draft": result.strip()}
            state["ai"][name] = "ok"
            del state["queue"][identifier]
            break


def run(registry, state, now, env, seed=False, fetch=fetch_source):
    sources = {row["id"]: row for row in validate_registry(registry)}
    for key in ("sources", "queue", "translations"):
        state[key] = {identifier: entry for identifier, entry in state.get(key, {}).items()
                      if identifier in sources}
    items = []
    for identifier, source in sources.items():
        record = state["sources"].setdefault(identifier, {})
        evidence = source["reviewed"].copy()
        public_url = source["url"]
        for key in ("checkedAt", "opensAt", "closesAt"):
            if key in evidence:
                evidence[key] = iso(parse_date(evidence[key]))
        if not seed:
            try:
                if identifier == "asean-scholarship-vietnam" and source.get("feedUrl"):
                    try:
                        public_url = discover_asean(source, fetch, record.get("url", public_url))
                        record.pop("feedError", None)
                    except (OSError, ValueError) as exc:
                        record["feedError"] = failure(exc)
                        public_url = record.get("url", public_url)
                text = page_text(fetch(public_url))
                if len(text) < 100 or re.search(r"verify that you're not a robot|just a moment|access denied", text[:300], re.I):
                    raise ValueError("Source body unavailable")
                evidence = extract(source, text, now)
                validate_evidence(evidence)
                evidence["checkedAt"] = iso(now)
                fingerprint = sha256((public_url + "\n" + text).encode()).hexdigest()
                if fingerprint != record.get("fingerprint"):
                    record["changedAt"] = iso(now)
                record.update(fingerprint=fingerprint, evidence=evidence, url=public_url,
                              health="unconfirmed" if evidence["signal"] == "unknown" else "ok")
            except (OSError, ValueError) as exc:
                evidence = {**record.get("evidence", evidence), "signal": "unknown"}
                record["health"] = failure(exc)
                public_url = record.get("url", source["url"])
            record["attemptedAt"] = iso(now)
            revision = sha256(source["translationInput"].encode()).hexdigest()
            if state["translations"].get(identifier, {}).get("revision") != revision:
                if state["queue"].get(identifier, {}).get("revision") != revision:
                    state["queue"][identifier] = {"revision": revision, "attempts": 0}
            else:
                state["queue"].pop(identifier, None)
        items.append({**{key: source[key] for key in PUBLIC_FIELDS}, **evidence, "url": public_url})
    if not seed:
        process_queue(sources, state, env, now)
    return {"schema": 1, "generatedAt": iso(now), "items": items}


def read_json(path, default):
    return json.loads(path.read_text()) if path.exists() else default


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent, delete=False) as output:
        json.dump(value, output, ensure_ascii=False, indent=2)
        output.write("\n")
    Path(output.name).replace(path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--state", type=Path, default=ROOT / ".local" / "state.json")
    parser.add_argument("--out", type=Path, help="Default: .local/snapshot.json, or bundled snapshot with --seed")
    parser.add_argument("--seed", action="store_true", help="Use manually verified registry evidence without network")
    args = parser.parse_args()
    registry = read_json(ROOT / "sources.json", [])
    state = {} if args.seed else read_json(args.state, {})
    now = max(parse_date(row["reviewed"]["checkedAt"]) for row in registry) if args.seed else datetime.now(timezone.utc)
    snapshot = run(registry, state, now, os.environ, seed=args.seed)
    write_json(args.out or (PUBLIC if args.seed else ROOT / ".local" / "snapshot.json"), snapshot)
    if not args.seed:
        write_json(args.state, state)
    health = {identifier: item.get("health", "reviewed") for identifier, item in state["sources"].items()}
    feed_errors = {identifier: item["feedError"] for identifier, item in state["sources"].items()
                   if "feedError" in item}
    print(json.dumps({"records": len(snapshot["items"]), "pending": len(state["queue"]),
                      "sources": health, "feedErrors": feed_errors, "ai": state.get("ai", {})}, ensure_ascii=False))


if __name__ == "__main__":
    sys.exit(main())
