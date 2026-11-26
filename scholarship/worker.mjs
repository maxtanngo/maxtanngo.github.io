import { boundedText, MAX_BYTES, validSnapshot } from "../hoc-tap/san-hoc-bong/model.mjs";

const readSQL = "SELECT body FROM public_snapshot WHERE id = 1";
const writeSQL = `INSERT INTO public_snapshot (id, generated_at, body) VALUES (1, ?, ?)
  ON CONFLICT(id) DO UPDATE SET generated_at = excluded.generated_at, body = excluded.body
  WHERE excluded.generated_at > public_snapshot.generated_at`;
const publicKeys = new Set([
  "id", "title", "provider", "country", "level", "funding", "url", "description",
  "signal", "checkedAt", "opensAt", "closesAt", "deadlineOn", "cycle",
]);

async function authorized(auth, secret) {
  if (typeof secret !== "string" || secret.length < 32 || !auth || auth.length > 512) return false;
  const encoder = new TextEncoder();
  const [actual, expected] = await Promise.all([auth, `Bearer ${secret}`].map(
    (value) => crypto.subtle.digest("SHA-256", encoder.encode(value))));
  const a = new Uint8Array(actual);
  const b = new Uint8Array(expected);
  let difference = 0;
  for (let index = 0; index < a.length; index++) difference |= a[index] ^ b[index];
  return difference === 0;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const cors = origin === env.SITE_ORIGIN && origin ? { "Access-Control-Allow-Origin": origin } : {};
    const headers = { "Vary": "Origin", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
    const reply = (message, status) => Response.json({ message }, { status, headers: { ...headers, ...cors } });
    if (url.pathname === "/health" && request.method === "GET") {
      return reply("Worker reachable", 200);
    }
    if (url.pathname !== "/api/scholarships") return reply("Not found", 404);
    if (origin && origin !== env.SITE_ORIGIN) return reply("Origin denied", 403);
    if (env.CLOUDFLARE_TIER !== "workers-free" || !env.DB) return reply("Database paused", 503);
    if (request.method === "GET") {
      try {
        const row = await env.DB.prepare(readSQL).first();
        if (!row || !validSnapshot(JSON.parse(row.body))) return reply("No usable snapshot", 503);
        return new Response(row.body, { headers: { ...headers, ...cors,
          "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=60" } });
      } catch {
        return reply("Database temporarily unavailable", 503);
      }
    }
    if (request.method !== "PUT") return reply("Method not allowed", 405);
    if (!(await authorized(request.headers.get("Authorization"), env.INGEST_TOKEN))) return reply("Unauthorized", 401);
    if (!/^application\/json(?:;|$)/i.test(request.headers.get("Content-Type") || "")) {
      return reply("Expected JSON", 415);
    }
    let snapshot;
    let body;
    try {
      if (Number(request.headers.get("Content-Length")) > MAX_BYTES) return reply("Snapshot too large", 413);
      body = await boundedText(request);
      snapshot = JSON.parse(body);
      if (!validSnapshot(snapshot) || Date.parse(snapshot.generatedAt) > Date.now() + 60_000
          || Object.keys(snapshot).some((key) => !["schema", "generatedAt", "items"].includes(key))
          || snapshot.items.some((item) => Object.keys(item).some((key) => !publicKeys.has(key)))) {
        return reply("Invalid snapshot", 422);
      }
    } catch {
      return reply("Unreadable snapshot", 400);
    }
    try {
      await env.DB.prepare(writeSQL).bind(snapshot.generatedAt, body).run();
      return reply("Snapshot processed", 200);
    } catch {
      return reply("Database temporarily unavailable", 503);
    }
  },
};
