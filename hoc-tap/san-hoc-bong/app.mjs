import { config } from "./config.mjs";
import { folded, isFresh, labels, loadSnapshot, statusOf } from "./model.mjs";

const byId = (id) => document.getElementById(id);
const search = byId("search");
const dimensions = ["country", "level", "funding"].map((key) => byId(key));
const status = byId("status");
const savedOnly = byId("saved");
const results = byId("results");
const empty = byId("empty");
const count = byId("count");
const dataStatus = byId("data-status");
const storageKey = "maxngo.scholarship.saved.v1";
const dates = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh",
});
let saved = new Set();
let dataset;

try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
  if (Array.isArray(stored)) saved = new Set(stored.filter((id) => typeof id === "string"));
} catch {
  // Saving remains available for the current page when storage is blocked.
}

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function renderCard(item, state) {
  const card = element("li", null, "card");
  const badge = element("span", labels[state], "badge");
  badge.dataset.state = state;
  card.append(badge, element("h3", item.title),
    element("p", item.provider, "detail"),
    element("p", [item.country, item.level, item.funding].join(" · "), "detail"),
    element("p", item.description));
  if (item.cycle) card.append(element("p", item.cycle, "detail"));
  const deadline = item.closesAt
    ? `${item.signal === "unknown" ? "Hạn ghi nhận trước đó" : "Hạn nộp"} · ${dates.format(Date.parse(item.closesAt))} (giờ Việt Nam)`
    : item.deadlineOn
      ? `Hạn theo ngày do nguồn công bố · ${item.deadlineOn.split("-").reverse().join("/")}`
      : "Xem hạn nộp trên trang của chương trình.";
  card.append(element("p", deadline, "deadline"));
  card.append(element("p", `Mốc đối chiếu nguồn · ${dates.format(Date.parse(item.checkedAt))}`, "verified"));

  const actions = element("div", null, "card-actions");
  const link = element("a", "Xem nguồn chính thức ↗");
  link.href = item.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  const save = element("button", "Lưu học bổng");
  save.type = "button";
  save.dataset.save = item.id;
  save.setAttribute("aria-label", `Lưu học bổng ${item.title}`);
  const updateSave = () => {
    save.setAttribute("aria-pressed", String(saved.has(item.id)));
    save.textContent = saved.has(item.id) ? "Đã lưu" : "Lưu học bổng";
  };
  updateSave();
  save.addEventListener("click", () => {
    if (saved.has(item.id)) saved.delete(item.id);
    else saved.add(item.id);
    try {
      localStorage.setItem(storageKey, JSON.stringify([...saved]));
    } catch {
      byId("storage-note").hidden = false;
    }
    if (savedOnly.checked) {
      render();
      (results.querySelector("button") || savedOnly).focus();
    } else {
      updateSave();
    }
  });
  actions.append(link, save);
  card.append(actions);
  return card;
}

function render() {
  if (!dataset) return;
  const { source, data } = dataset;
  const now = Date.now();
  const mode = source === "live" ? "Cơ sở dữ liệu" : "Bản dữ liệu dự phòng";
  const old = !isFresh(data.generatedAt, now) || data.items.some((item) => !isFresh(item.checkedAt, now));
  dataStatus.textContent = `${mode} · Cập nhật ${dates.format(Date.parse(data.generatedAt))} (giờ Việt Nam).`
    + (old ? " Một số nguồn đã quá 72 giờ chưa đối chiếu. Hãy kiểm tra trực tiếp trước khi nộp." : "");
  const query = folded(search.value);
  const records = data.items.map((item) => ({ item, state: statusOf(item, now) })).filter(({ item, state }) =>
    (!query || folded([item.title, item.provider, item.country, item.description].join(" ")).includes(query))
    && dimensions.every((control) => !control.value || item[control.id] === control.value)
    && (!status.value || state === status.value)
    && (!savedOnly.checked || saved.has(item.id)));
  results.replaceChildren(...records.map(({ item, state }) => renderCard(item, state)));
  count.textContent = `${records.length} học bổng`;
  empty.hidden = records.length > 0;
  empty.textContent = "Không có học bổng phù hợp. Hãy đổi hoặc xóa bộ lọc.";
}

async function start() {
  try {
    dataset = await loadSnapshot(config);
  } catch {
    dataStatus.textContent = "Chưa tải được danh sách học bổng. Hãy tải lại trang sau.";
    return;
  }
  dimensions.forEach((control) => {
    const values = [...new Set(dataset.data.items.map((item) => item[control.id]))];
    values.sort((a, b) => a.localeCompare(b, "vi"));
    control.append(...values.map((value) => new Option(value, value)));
  });
  search.addEventListener("input", render);
  [...dimensions, status, savedOnly].forEach((control) => control.addEventListener("change", render));
  byId("reset").addEventListener("click", () => {
    [search, ...dimensions, status].forEach((control) => { control.value = ""; });
    savedOnly.checked = false;
    render();
  });
  render();
  // Keep deadlines current without interrupting a keyboard user inside a result.
  setInterval(() => { if (!results.contains(document.activeElement)) render(); }, 60_000);
}

start();
