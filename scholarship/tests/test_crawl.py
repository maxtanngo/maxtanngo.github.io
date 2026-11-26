from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
from urllib.error import HTTPError

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import crawl
import publish
import monitor

NOW = datetime(2026, 11, 26, 5, tzinfo=timezone.utc)
ROWS = crawl.read_json(crawl.ROOT / "sources.json", [])
PAGES = {
    ROWS[3]["feedUrl"]: "<main>No newer announcements.</main>",
    ROWS[0]["url"]: "<main><h1>International Scholars</h1><p>We have extended the deadline to apply, and you now have until December 2nd, 2026, at 12:00PM PCT (Pacific Time) to apply to UBC and submit your International Scholars Program application.</p><p>Applications for the September 2027 are now open.</p></main>",
    ROWS[1]["url"]: "<main><h1>Chevening in Vietnam</h1><p>Applications for 202 7-202 8 Chevening Scholarships are now closed.</p><p>Read the eligibility criteria for the next scholarship cycle.</p></main>",
    ROWS[2]["url"]: "<main><h1>Australia Awards opening and closing dates</h1><table><tr><td>Vietnam</td><td>1 February 2026 0900 AEDT</td><td>30 April 2026 1400 AEST</td></tr></table></main>",
    ROWS[3]["url"]: "<main>ASEAN Scholarship for Vietnam. Read the official scholarship application guidelines for eligible students. Contact the programme for application dates.</main>",
}
ENV = {
    "GEMINI_TIER": "free-unbilled", "GEMINI_API_KEY": "test",
    "CLOUDFLARE_TIER": "workers-free", "CF_ACCOUNT_ID": "f" * 32, "CF_AI_TOKEN": "test",
}


def over_quota():
    return HTTPError("https://example.test", 429, "Quota", {}, None)


class CrawlerTest(unittest.TestCase):
    def test_extracts_only_verified_signals_and_normalizes_timezones(self):
        snapshot = crawl.run(ROWS, {}, NOW, {}, fetch=PAGES.__getitem__)
        ubc, chevening, australia, singapore = snapshot["items"]
        self.assertEqual(ubc["closesAt"], "2026-12-02T19:00:00Z")
        self.assertEqual(chevening["cycle"], "2027–2028")
        self.assertEqual(chevening["signal"], "closed")
        self.assertEqual(australia["opensAt"], "2026-01-31T22:00:00Z")
        self.assertEqual(australia["closesAt"], "2026-04-30T04:00:00Z")
        self.assertEqual(singapore["signal"], "unknown")
        self.assertNotIn("translationInput", ubc)

    def test_discovers_new_embassy_announcement_on_official_host(self):
        source = ROWS[3]
        newer = "https://hanoi.mfa.gov.sg/mission-updates/new-round/"
        feed = (
            '<a href="https://unofficial.test/mission-updates/latest/">'
            'Application for ASEAN Scholarship for Vietnam Academic Year 2099</a>'
            '<a href="/mission-updates/new-round/">'
            'Application for ASEAN Scholarship for Vietnam Academic Year 2028</a>'
        )
        pages = {**PAGES, source["feedUrl"]: feed, newer:
                 "<h1>Application for ASEAN Scholarship for Vietnam Academic Year 2028</h1>"
                 "<p>Application for ASEAN Scholarship for Vietnam is now open from now till 27 February 2027.</p>"}
        snapshot = crawl.run(ROWS, {}, NOW, {}, fetch=pages.__getitem__)
        self.assertEqual(snapshot["items"][-1]["url"], newer)
        self.assertEqual(snapshot["items"][-1]["deadlineOn"], "2027-02-27")
        self.assertEqual(snapshot["items"][-1]["signal"], "unknown")

    def test_conflicting_or_missing_open_evidence(self):
        source = ROWS[0]
        text = crawl.page_text(PAGES[source["url"]])
        for unsafe in [text + " Applications are closed.", text + " " + text.replace("December 2nd", "December 4th"),
                       text.replace("are now open", "may open later")]:
            self.assertEqual(crawl.extract(source, unsafe), {"signal": "unknown"})

    def test_change_detection_and_dedup(self):
        duplicate_url = {**ROWS[0], "id": "same-program", "title": "Different title"}
        duplicate_program = {**ROWS[0], "id": "same-name", "url": ROWS[0]["url"] + "other/"}
        state = {}
        first = crawl.run([*ROWS, duplicate_url, duplicate_program], state, NOW, {}, fetch=PAGES.__getitem__)
        self.assertEqual(len(first["items"]), 4)
        first_changed = state["sources"][ROWS[0]["id"]]["changedAt"]
        crawl.run(ROWS, state, NOW + timedelta(hours=1), {}, fetch=PAGES.__getitem__)
        self.assertEqual(state["sources"][ROWS[0]["id"]]["changedAt"], first_changed)
        crawl.run(ROWS, state, NOW + timedelta(hours=2), {},
                  fetch=lambda url: PAGES[url] + "<p>Updated advertised dates.</p>")
        self.assertNotEqual(state["sources"][ROWS[0]["id"]]["changedAt"], first_changed)

    def test_validation_rejects_non_https_and_impossible_windows(self):
        for bad in [{**ROWS[0], "url": "http://fake.test"}, {**ROWS[0], "reviewed": {
                    "signal": "window", "opensAt": "2026-12-02T21:00:00Z", "closesAt": "2026-12-02T19:00:00Z"}}]:
            with self.assertRaises(ValueError):
                crawl.validate_registry([bad])

    def test_source_failure_keeps_previous_evidence_and_isolates_other_sources(self):
        state = {}
        crawl.run(ROWS, state, NOW, {}, fetch=PAGES.__getitem__)

        def fetch(url):
            if url == ROWS[0]["url"]:
                raise OSError("Source unavailable")
            return PAGES[url]

        second = crawl.run(ROWS, state, NOW + timedelta(hours=12), {}, fetch=fetch)["items"]
        self.assertEqual(second[0]["signal"], "unknown")
        self.assertEqual(second[0]["checkedAt"], crawl.iso(NOW))
        self.assertEqual(second[1]["signal"], "closed")
        self.assertEqual(state["sources"][ROWS[0]["id"]]["health"], "OSError")

    def test_operator_view_escapes_untrusted_draft(self):
        content = monitor.render({"translations": {"source": {
            "provider": "gemini", "draft": "<script>draft</script>"}}})
        self.assertIn("&lt;script&gt;", content)
        self.assertNotIn("<script>", content)

    def test_robots_rule_blocks_page_fetch(self):
        with patch.object(crawl, "request", return_value="User-agent: *\nDisallow: /") as req:
            with self.assertRaises(ValueError):
                crawl.fetch_source(ROWS[0]["url"])
        self.assertEqual(req.call_count, 1)

    @patch.object(crawl, "gemini_call", side_effect=over_quota())
    @patch.object(crawl, "workers_ai_call", return_value={"translation": "Bản nháp tiếng Việt."})
    def test_gemini_429_falls_back_and_caps_calls(self, workers, gemini):
        state = {}
        crawl.run(ROWS, state, NOW, ENV, fetch=PAGES.__getitem__)
        self.assertEqual(gemini.call_count, 1)
        self.assertEqual(workers.call_count, 3)
        self.assertEqual(len(state["queue"]), 1)
        self.assertEqual(state["translations"][ROWS[0]["id"]]["provider"], "workers-ai")

    @patch.object(crawl, "gemini_call", side_effect=over_quota())
    @patch.object(crawl, "workers_ai_call", side_effect=over_quota())
    def test_dual_429_persists_and_retries(self, workers, gemini):
        state = {}
        crawl.run(ROWS, state, NOW, ENV, fetch=PAGES.__getitem__)
        self.assertEqual((gemini.call_count, workers.call_count), (1, 1))
        self.assertEqual(len(state["queue"]), 4)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "state.json"
            crawl.write_json(path, state)
            restored = crawl.read_json(path, None)
        gemini.side_effect = None
        gemini.return_value = '{"translation":"Bản dịch"}'
        crawl.run(ROWS, restored, NOW + timedelta(days=1), ENV, fetch=PAGES.__getitem__)
        self.assertEqual(len(restored["queue"]), 0)
        self.assertEqual(len(restored["translations"]), 4)
        self.assertEqual(workers.call_count, 1)

    @patch.object(crawl, "request")
    def test_real_adapter_response_shapes_and_server_only_keys(self, req):
        req.side_effect = [
            json.dumps({"candidates":[{"content":{"parts":[{"text":"{\"translation\":\"Bản dịch\"}"}]}}]}),
            json.dumps({"result":{"response":{"translation":"Bản dịch"}}}),
        ]
        self.assertEqual(json.loads(crawl.gemini_call(ROWS[0], ENV))["translation"], "Bản dịch")
        self.assertEqual(crawl.workers_ai_call(ROWS[0], ENV)["translation"], "Bản dịch")
        self.assertEqual(req.call_args_list[0].args[2], {"x-goog-api-key": "test"})
        self.assertEqual(req.call_args_list[1].args[2], {"Authorization": "Bearer test"})

    @patch.object(crawl, "gemini_call")
    @patch.object(crawl, "workers_ai_call")
    @patch.object(publish, "request")
    def test_uncertain_or_paid_configuration_disables_external_calls(self, request, workers, gemini):
        env = {**ENV, "GEMINI_TIER": "paid", "CLOUDFLARE_TIER": "unverified",
               "SCHOLARSHIP_WORKER_URL": "https://staging.example.workers.dev/api/scholarships",
               "SCHOLARSHIP_INGEST_TOKEN": "a" * 32}
        state = {}
        crawl.run(ROWS, state, NOW, env, fetch=PAGES.__getitem__)
        self.assertEqual(len(state["queue"]), 4)
        self.assertEqual(publish.publish(Path("unused.json"), env), "disabled")
        for service in (request, workers, gemini):
            service.assert_not_called()

    @patch.object(publish, "request", side_effect=HTTPError("https://example.test", 503, "D1 error", {}, None))
    def test_worker_sync_error_leaves_snapshot_on_disk(self, request):
        env = {**ENV, "SCHOLARSHIP_WORKER_URL": "https://staging.example.workers.dev/api/scholarships",
               "SCHOLARSHIP_INGEST_TOKEN": "a" * 32}
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "snapshot.json"
            snapshot = crawl.run(ROWS, {}, NOW, {}, fetch=PAGES.__getitem__)
            crawl.write_json(path, snapshot)
            with self.assertRaises(HTTPError):
                publish.publish(path, env)
            self.assertEqual(crawl.read_json(path, None), snapshot)
        self.assertEqual(request.call_args.kwargs["method"], "PUT")


if __name__ == "__main__":
    unittest.main()
