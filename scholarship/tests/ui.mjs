import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { once } from "node:events";

const base = (process.argv[2] || "http://127.0.0.1:8000").replace(/\/$/, "");
const browser = process.env.CHROME_BIN || (process.platform === "darwin"
  ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "google-chrome");
const profile = await mkdtemp(join(tmpdir(), "maxngo-scholarship-ui-"));
const chrome = spawn(browser, ["--headless", "--disable-gpu", "--disable-background-networking",
  "--no-first-run", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
let spawnError;
chrome.on("error", (error) => { spawnError = error; });
let socket;

async function eventually(check, message) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const result = await check();
    if (result) return result;
    await delay(100);
  }
  throw new Error(message);
}

try {
  const port = await eventually(async () => {
    if (spawnError) throw spawnError;
    if (chrome.exitCode !== null || chrome.signalCode !== null) throw new Error("Chrome exited before opening DevTools");
    try {
      return (await readFile(join(profile, "DevToolsActivePort"), "utf8")).split("\n")[0];
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      return undefined;
    }
  }, "Chrome DevTools did not open");
  const [page] = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await once(socket, "open");
  let sequence = 0;
  const pending = new Map();
  const errors = [];
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.text);
    const settle = pending.get(message.id);
    if (settle) {
      pending.delete(message.id);
      if (message.error) settle.reject(new Error(message.error.message));
      else settle.resolve(message.result);
    }
  });
  async function send(method, params = {}) {
    const id = ++sequence;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`DevTools timed out: ${method}`));
      }, 10_000);
      pending.set(id, {
        resolve: (value) => { clearTimeout(timeout); resolve(value); },
        reject: (error) => { clearTimeout(timeout); reject(error); },
      });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async function evaluate(expression) {
    const response = await send("Runtime.evaluate", { expression, returnByValue: true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description);
    return response.result.value;
  }
  const setControl = (id, value, event = "change") => evaluate(
    `(() => { const control = document.getElementById(${JSON.stringify(id)}); control.value = ${JSON.stringify(value)}; control.dispatchEvent(new Event(${JSON.stringify(event)})); })()`);
  const count = () => evaluate("document.querySelectorAll('#results li').length");
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { mobile: false, width: 1365, height: 900, deviceScaleFactor: 1 });
  await send("Page.navigate", { url: base + "/hoc-tap/" });
  await eventually(() => evaluate("location.pathname === '/hoc-tap/' && document.querySelector('#study-filter-count')?.textContent"), "Study page did not load");
  assert(await evaluate("document.querySelector('a[href*=maxngo-edu]') !== null"));
  const originalCount = await evaluate("document.querySelectorAll('#study-courses > li').length");
  await evaluate("document.querySelector('#study-filter input[value=toan]').click()");
  assert(await evaluate("document.querySelectorAll('#study-courses > li:not([hidden])').length") < originalCount);
  await evaluate("document.querySelector('a[href=\"./san-hoc-bong/\"]').click()");
  await eventually(async () => (await count()) === 4, "Scholarship seed did not render");
  assert.equal(await evaluate("document.querySelectorAll('#results a[href^=\"https://\"]').length"), 4);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('#results')).gridTemplateColumns.split(' ').length"), 2);
  console.log("PASS desktop entry, existing study filter, four official links and two-column layout");

  await setControl("search", "vuong quoc anh", "input");
  assert.equal(await count(), 1);
  assert.match(await evaluate("document.querySelector('#results h3').textContent"), /Chevening/);
  await evaluate("document.getElementById('reset').click()");
  await setControl("country", "Canada");
  await setControl("level", "Đại học");
  await setControl("funding", "Theo nhu cầu tài chính");
  assert.equal(await count(), 1);
  await evaluate("document.getElementById('reset').click()");
  await setControl("status", "expired");
  assert(await count() >= 1);
  await evaluate("document.getElementById('reset').click()");
  await setControl("search", "khong-co-ket-qua", "input");
  assert.equal(await count(), 0);
  assert.equal(await evaluate("document.getElementById('empty').hidden"), false);
  await evaluate("document.getElementById('reset').click()");
  console.log("PASS search, combined filters, deadline filter, reset and empty state");

  await evaluate("document.querySelector('[data-save=ubc-international-scholars]').click()");
  assert.equal(await evaluate("document.querySelector('[data-save=ubc-international-scholars]').getAttribute('aria-pressed')"), "true");
  await send("Page.reload");
  await eventually(() => evaluate("document.querySelector('[data-save=ubc-international-scholars]')?.getAttribute('aria-pressed') === 'true'"), "Saved item did not survive reload");
  await evaluate("document.getElementById('saved').click()");
  assert.equal(await count(), 1);
  await evaluate("document.querySelector('[data-save=ubc-international-scholars]').click()");
  assert.equal(await count(), 0);
  await evaluate("document.getElementById('reset').click()");
  console.log("PASS save, reload persistence, saved-only and remove");

  await send("Emulation.setDeviceMetricsOverride", { mobile: true, width: 360, height: 780, deviceScaleFactor: 2 });
  assert.equal(await evaluate("getComputedStyle(document.querySelector('#results')).gridTemplateColumns.split(' ').length"), 1);
  assert.equal(await evaluate("document.documentElement.scrollWidth <= window.innerWidth"), true);
  assert.deepEqual(errors, []);
  console.log("PASS mobile 360 px layout, no horizontal overflow or JavaScript exceptions");
} finally {
  socket?.close();
  if (chrome.pid && chrome.exitCode === null && chrome.signalCode === null) {
    chrome.kill();
    await Promise.race([once(chrome, "exit"), delay(2000)]);
  }
  await rm(profile, { recursive: true, force: true, maxRetries: 3 });
}
