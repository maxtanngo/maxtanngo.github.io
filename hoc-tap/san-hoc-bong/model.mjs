export const FRESH_MS = 72 * 60 * 60 * 1000;
export const MAX_BYTES = 96_000;
export const labels = {
  open: "Đang mở",
  upcoming: "Sắp mở",
  closed: "Đã đóng",
  expired: "Đã qua hạn",
  unknown: "Chưa xác nhận",
};
const fields = ["title", "provider", "country", "level", "funding", "description"];
const signals = new Set(["window", "closed", "unknown"]);
const timestamp = (value) => typeof value === "string"
  && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)
  && Number.isFinite(Date.parse(value));

function validItem(item) {
  if (!item || typeof item.id !== "string" || !/^[a-z0-9-]{1,100}$/.test(item.id)
      || !fields.every((field) => typeof item[field] === "string" && item[field].trim() && item[field].length <= 500)
      || !signals.has(item.signal) || !timestamp(item.checkedAt)
      || (item.cycle !== undefined && (typeof item.cycle !== "string" || item.cycle.length > 100))
      || (item.closesAt !== undefined && !timestamp(item.closesAt))
      || (item.opensAt !== undefined && (!timestamp(item.opensAt) || !item.closesAt || item.opensAt >= item.closesAt))
      || (item.deadlineOn !== undefined && (typeof item.deadlineOn !== "string"
        || !timestamp(item.deadlineOn + "T00:00:00Z")))
      || (item.signal === "window" && !item.closesAt)) return false;
  try {
    const url = new URL(item.url);
    return url.protocol === "https:" && !url.username && !url.password && !url.port
      && !url.search && !url.hash && item.url.length <= 500;
  } catch {
    return false;
  }
}

export function validSnapshot(snapshot) {
  return snapshot?.schema === 1 && timestamp(snapshot.generatedAt) && Array.isArray(snapshot.items)
    && snapshot.items.length > 0 && snapshot.items.length <= 100
    && snapshot.items.every((item) => validItem(item) && item.checkedAt <= snapshot.generatedAt)
    && new Set(snapshot.items.map((item) => item.id)).size === snapshot.items.length;
}

export function isFresh(value, now = Date.now()) {
  const age = now - Date.parse(value);
  return age >= 0 && age <= FRESH_MS;
}

export function statusOf(item, now = Date.now()) {
  if (item.closesAt && now >= Date.parse(item.closesAt) && item.signal !== "closed") return "expired";
  if (!isFresh(item.checkedAt, now)) return "unknown";
  if (item.signal === "closed") return "closed";
  if (item.signal !== "window") return "unknown";
  return item.opensAt && now < Date.parse(item.opensAt) ? "upcoming" : "open";
}

export function folded(text) {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replaceAll("đ", "d").trim();
}

export async function boundedText(response) {
  if (!response.body) throw new Error("Missing response body");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return text + decoder.decode();
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) {
        await reader.cancel();
        throw new Error("Snapshot exceeds size limit");
      }
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}

export async function loadSnapshot(config, fetcher = fetch, now = Date.now()) {
  const candidates = [
    ["live", config.workerUrl],
    ["snapshot", config.snapshotUrl],
    ["seed", "./snapshot.json"],
  ].filter(([, url]) => url);
  const settled = await Promise.allSettled(candidates.map(async ([source, url]) => {
    const response = await fetcher(url, {
      signal: AbortSignal.timeout(4500), credentials: "omit", redirect: "error",
      referrerPolicy: "no-referrer",
    });
    if (!response.ok) throw new Error("Snapshot HTTP error");
    const data = JSON.parse(await boundedText(response));
    if (!validSnapshot(data) || Date.parse(data.generatedAt) > now + 60_000) throw new Error("Invalid snapshot");
    return { source, data };
  }));
  const valid = settled.filter((entry) => entry.status === "fulfilled").map((entry) => entry.value);
  valid.sort((a, b) => b.data.generatedAt.localeCompare(a.data.generatedAt));
  if (!valid.length) throw new Error("No snapshot available");
  return valid[0];
}
