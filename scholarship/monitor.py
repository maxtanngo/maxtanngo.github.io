"""Build a local operator view from the persisted crawl state."""
import argparse
from html import escape
from pathlib import Path

from crawl import ROOT, read_json


def table(headers, rows):
    heading = "".join(f"<th scope='col'>{escape(value)}</th>" for value in headers)
    body = "".join("<tr>" + "".join(f"<td>{escape(str(value))}</td>" for value in row) + "</tr>" for row in rows)
    return f"<table><thead><tr>{heading}</tr></thead><tbody>{body}</tbody></table>"


def render(state):
    sources = state.get("sources", {})
    queue = state.get("queue", {})
    drafts = state.get("translations", {})
    return """<!doctype html>
<html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">
<title>Vận hành MaxNgo Scholarship</title>
<style>
body{font:1rem/1.5 system-ui;margin:2rem auto;max-width:74rem;padding:0 1rem;color:#182742;background:#f4f7fc}
section{overflow:auto;margin-block:1.5rem}table{width:100%;background:white;border-collapse:collapse}
td,th{text-align:left;padding:.65rem;border:1px solid #d3deef;overflow-wrap:anywhere}
</style>
<h1>Vận hành MaxNgo Scholarship</h1>
<p>Thời gian trong bảng là UTC. Bản dịch nháp cần được duyệt trước khi dùng.</p>
""" + "<section><h2>Nguồn chính thức</h2>" + table(
        ["Nguồn", "Tình trạng", "Lỗi danh mục tin", "Lần thử gần nhất", "Thay đổi gần nhất"],
        ((name, row.get("health", "—"), row.get("feedError", "—"), row.get("attemptedAt", "—"), row.get("changedAt", "—"))
         for name, row in sources.items()),
    ) + "</section><section><h2>Dịch vụ AI</h2>" + table(
        ["Dịch vụ", "Trạng thái"], state.get("ai", {}).items(),
    ) + f"</section><section><h2>Hàng đợi ({len(queue)})</h2>" + table(
        ["Nguồn", "Số lần thử", "Lỗi gần nhất", "Lần thử gần nhất"],
        ((name, job["attempts"], job.get("lastError", "—"), job.get("lastAttemptAt", "—"))
         for name, job in queue.items()),
    ) + f"</section><section><h2>Bản dịch nháp ({len(drafts)})</h2>" + table(
        ["Nguồn", "Dịch vụ", "Bản nháp"],
        ((name, entry["provider"], entry["draft"]) for name, entry in drafts.items()),
    ) + "</section></html>"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--state", type=Path, default=ROOT / ".local" / "state.json")
    parser.add_argument("--out", type=Path, default=ROOT / ".local" / "status.html")
    args = parser.parse_args()
    state = read_json(args.state, None)
    if state is None:
        parser.error("State file not found. Run crawl.py or download state.json from the data branch.")
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(render(state), encoding="utf-8")
    print(args.out)


if __name__ == "__main__":
    main()
