import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import worker from "../worker.mjs";
import { folded, loadSnapshot, statusOf, validSnapshot } from "../../hoc-tap/san-hoc-bong/model.mjs";

const seed = JSON.parse(readFileSync(new URL("../../hoc-tap/san-hoc-bong/snapshot.json", import.meta.url)));
const schema = readFileSync(new URL("../migrations/0001_public_snapshot.sql", import.meta.url), "utf8");
const secret = "unit-test-token-xxxxxxxxxxxxxxxx";
const origin = "http://127.0.0.1:8000";
const url = "https://maxngo.example.workers.dev/api/scholarships";
const headers = { "Content-Type": "application/json", Authorization: `Bearer ${secret}` };
const send = (data, env, credentials = headers) => worker.fetch(
  new Request(url, { method: "PUT", headers: credentials, body: JSON.stringify(data) }), env);

function database() {
  const sql = new DatabaseSync(":memory:");
  sql.exec(schema);
  return { prepare(query) {
    const stmt = sql.prepare(query);
    return { first: () => stmt.get(), bind: (...values) => ({ run: () => stmt.run(...values) }) };
  } };
}

const environment = () => ({ DB: database(), CLOUDFLARE_TIER: "workers-free",
  SITE_ORIGIN: origin, INGEST_TOKEN: secret });

test("date statuses, stale signals, and accent insensitive search", () => {
  assert(validSnapshot(seed));
  const [ubc, chevening, australia, singapore] = seed.items;
  const now = Date.parse("2026-11-26T05:00:00Z");
  assert.equal(statusOf(ubc, now), "open");
  assert.equal(statusOf(chevening, now), "closed");
  assert.equal(statusOf(australia, now), "expired");
  assert.equal(statusOf(singapore, now), "closed");
  assert.equal(statusOf({ ...ubc, opensAt: "2026-11-28T00:00:00Z" }, now), "upcoming");
  assert.equal(statusOf(ubc, Date.parse("2026-11-30T00:00:00Z")), "unknown");
  assert.equal(statusOf(ubc, Date.parse("2026-12-02T19:00:00Z")), "expired");
  assert.equal(folded("Đại học"), "dai hoc");
});

test("D1 migration, authenticated write, CORS read, idempotency and old-write guard", async () => {
  const env = environment();
  assert.equal((await worker.fetch(new Request(url), env)).status, 503);
  assert.equal((await send(seed, env)).status, 200);
  const newer = { ...seed, generatedAt: "2026-11-26T04:10:01Z" };
  assert.equal((await send(newer, env)).status, 200);
  assert.equal((await send(newer, env)).status, 200);
  assert.equal((await send(seed, env)).status, 200);
  const response = await worker.fetch(new Request(url, { headers: { Origin: origin } }), env);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), origin);
  assert.deepEqual(await response.json(), newer);
  assert.equal((await worker.fetch(new Request(url, { headers: { Origin: "https://other.test" } }), env)).status, 403);
});

test("write authentication, shape validation, and free-tier gate", async () => {
  const env = environment();
  assert.equal((await send(seed, env, { "Content-Type": "application/json" })).status, 401);
  assert.equal((await send({ ...seed, extra: "private" }, env)).status, 422);
  assert.equal((await send({ ...seed, items: [{ ...seed.items[0], url: "javascript:alert(1)" }] }, env)).status, 422);
  assert.equal((await send({ ...seed, items: [seed.items[0], seed.items[0]] }, env)).status, 422);
  assert.equal((await send(seed, { ...env, CLOUDFLARE_TIER: "paid" })).status, 503);
});

test("D1 outage falls back to remote JSON and then bundled JSON", async () => {
  const env = { ...environment(), DB: { prepare() { throw new Error("outage"); } } };
  assert.equal((await send(seed, env)).status, 503);
  const backup = { ...seed, generatedAt: "2026-11-26T04:10:01Z" };
  const options = { workerUrl: url, snapshotUrl: "https://backup.test/snapshot.json" };
  const fetchMock = (target) => target === url ? worker.fetch(new Request(url), env)
    : target === options.snapshotUrl ? Response.json(backup) : Response.json(seed);
  const now = Date.parse("2026-11-26T05:00:00Z");
  assert.deepEqual(await loadSnapshot(options, fetchMock, now), { source: "snapshot", data: backup });
  const withoutBackup = { ...options, snapshotUrl: "" };
  assert.deepEqual(await loadSnapshot(withoutBackup, fetchMock, now), { source: "seed", data: seed });
});

test("stale D1 backup reconciliation and invalid or oversized JSON fallback", async () => {
  const backup = { ...seed, generatedAt: "2026-11-26T04:10:01Z" };
  const options = { workerUrl: url, snapshotUrl: "https://backup.test/snapshot.json" };
  const now = Date.parse("2026-11-26T05:00:00Z");
  const response = (x) => x === url ? Response.json(seed) : Response.json(backup);
  assert.equal((await loadSnapshot(options, response, now)).source, "snapshot");
  const bad = (x) => x === url ? new Response("x".repeat(100_000)) : Response.json(seed);
  assert.equal((await loadSnapshot(options, bad, now)).source, "snapshot");
  await assert.rejects(loadSnapshot(options, () => new Response("bad"), now));
});
