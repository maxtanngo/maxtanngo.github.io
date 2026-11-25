import { practice, practices, findPractice } from './data.mjs';
import { grade, submit, remaining, filterSources, tutor, summarizeProgress } from './core.mjs';

const publicRelease = document.querySelector('meta[name="maxngo-edition"]')?.content === 'public';
const volatileStorage = new Map();
const view = document.querySelector('#view');
const sessionKey = 'maxngo-edu-attempt-v1';
const historyKey = 'maxngo-edu-history-v1';
const reviewKey = 'maxngo-edu-review-v1';
function read(key, fallback) {
  try { return JSON.parse(volatileStorage.get(key) ?? localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function save(key, value) {
  const encoded = JSON.stringify(value);
  try {
    localStorage.setItem(key, encoded);
    volatileStorage.delete(key);
  } catch {
    volatileStorage.set(key, encoded);
  }
}
let state = read(sessionKey, null);
let selectedPractice = findPractice(state?.practiceId) ?? practice;
let sourceError = false;
const sources = await fetch('./sources.json').then(response => {
  if (!response.ok) throw Error('catalogue');
  return response.json();
}).catch(() => { sourceError = true; return []; });

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function button(text, action, secondary = false) {
  const node = element('button', text, secondary ? 'secondary' : undefined);
  node.type = 'button';
  node.onclick = action;
  return node;
}
function link(text, href) {
  const node = element('a', text);
  node.href = href;
  if (href.startsWith('https://')) {
    node.target = '_blank';
    node.rel = 'noopener noreferrer';
  }
  return node;
}
function heading(title, description) {
  view.append(element('h1', title), element('p', description, 'status'));
}
function library() {
  view.append(document.querySelector('#library').content.cloneNode(true));
  const choices = view.querySelector('#practice-list');
  for (const paper of practices) {
    const card = element('article', undefined, 'card');
    const start = link('Mở bài luyện', '#thi');
    start.onclick = () => { selectedPractice = paper; if (location.hash === '#thi') render(); };
    card.append(element('h3', paper.title), element('p', paper.questions.length + ' câu · ' + paper.duration / 60 + ' phút'), start);
    choices.append(card);
  }
  const query = view.querySelector('#query');
  const year = view.querySelector('#year');
  const kind = view.querySelector('#kind');
  const subject = view.querySelector('#subject');
  for (const value of new Set(sources.map(source => source.subject).filter(Boolean))) subject.add(new Option(value, value));
  const list = view.querySelector('#sources');
  for (let number = 2026; number >= 2017; number--) year.add(new Option(number, number));
  for (const value of new Set(sources.map(source => source.kind))) kind.add(new Option(value, value));
  function update() {
    const matches = filterSources(sources, query.value, year.value, kind.value, subject.value);
    view.querySelector('#count').textContent = sourceError ? 'Chưa tải được danh mục nguồn.' : matches.length + ' nguồn phù hợp';
    list.replaceChildren(...matches.map(source => {
      const card = element('article', undefined, 'card');
      card.append(element('p', [source.year, source.kind].filter(Boolean).join(' · '), 'eyebrow'),
        element('h3', source.title), element('p', source.owner), link('Mở trang nguồn ↗', source.url));
      if (source.rights === 'link-only') card.append(element('p', 'Đang chờ giấy phép sử dụng · Chỉ dẫn nguồn', 'status'));
      if (source.paperMatches?.length) {
        card.append(element('p', 'Mã đề đã ghép nguồn đáp án · ' + source.paperMatches.map(paper => paper.code).join(', ')),
          link('Mở bảng đáp án chính thức ↗', source.answerCandidate));
      }
      return card;
    }));
  }
  query.oninput = year.onchange = kind.onchange = subject.onchange = update;
  update();
}

function updateAttempt() { save(sessionKey, state); }
function finish() {
  selectedPractice = findPractice(state.practiceId);
  state = submit(state, selectedPractice.questions);
  const history = read(historyKey, []);
  if (!history.some(attempt => attempt.id === state.id)) save(historyKey, [...history, state]);
  updateAttempt();
}
function begin(mode) {
  state = {
    id: crypto.randomUUID(), practiceId: selectedPractice.id, mode, index: 0, answers: {}, flags: {},
    deadline: mode === 'exam' ? Date.now() + selectedPractice.duration * 1000 : null,
  };
  updateAttempt();
  render();
}
function setAnswer(index, answer) {
  if (remaining(state) === 0) { finish(); render(); return; }
  state.answers[index] = answer;
  updateAttempt();
}
function questionFields(question, index) {
  const fieldset = element('fieldset');
  fieldset.append(element('legend', question.prompt));
  const answer = state.answers[index];
  function radio(label, name, checked, onChange) {
    const row = element('label', undefined, 'option');
    const input = element('input');
    input.type = 'radio';
    input.name = name;
    input.checked = checked;
    input.onchange = onChange;
    row.append(input, document.createTextNode(label));
    return row;
  }
  if (question.type === 'choice') {
    question.options.forEach((option, optionIndex) => {
      fieldset.append(radio(option, 'choice', answer === optionIndex, () => setAnswer(index, optionIndex)));
    });
  } else if (question.type === 'boolean') {
    question.options.forEach((option, optionIndex) => {
      const group = element('fieldset');
      group.append(element('legend', option));
      for (const value of [true, false]) {
        group.append(radio(value ? 'Đúng' : 'Sai', 'boolean-' + optionIndex, answer?.[optionIndex] === value,
          () => setAnswer(index, { ...state.answers[index], [optionIndex]: value })));
      }
      fieldset.append(group);
    });
  } else {
    const input = element(question.type === 'essay' ? 'textarea' : 'input');
    input.setAttribute('aria-label', 'Câu trả lời');
    if (question.type === 'number') input.inputMode = 'decimal';
    input.value = answer ?? '';
    input.oninput = () => setAnswer(index, input.value);
    fieldset.append(input);
  }
  return fieldset;
}
function answered(answer) {
  return typeof answer === 'string' ? Boolean(answer.trim()) : answer !== undefined;
}
function questionReview(question, index, state) {
  const article = element('article', undefined, 'card');
  const answer = state.answers[index];
  let display = 'Bỏ trống';
  if (answered(answer)) {
    if (question.type === 'choice') display = question.options[answer];
    else if (question.type === 'boolean') {
      display = question.options.map((_, item) => answer[item] === undefined ? '—' : answer[item] ? 'Đúng' : 'Sai').join(' / ');
    } else display = answer;
  }
  const mark = grade(question, answer);
  article.append(element('h3', 'Câu ' + (index + 1) + ' · ' + question.topic),
    element('p', question.prompt), element('p', 'Bài làm của bạn · ' + display),
    element('p', mark === null ? 'Tự luận · Tự đối chiếu lời giải' : mark + '/' + question.max + ' điểm'),
    element('p', question.explanation));
  return article;
}
function practiceSelect(current, onChange) {
  const select = element('select');
  for (const paper of practices) select.add(new Option(paper.title, paper.id));
  select.value = current.id;
  select.onchange = () => onChange(findPractice(select.value));
  const label = element('label', 'Bài luyện');
  label.append(select);
  return label;
}

function exam() {
  const active = state && !state.result;
  const practice = active ? findPractice(state.practiceId) : selectedPractice;
  heading(practice.title, 'Bài luyện tự biên soạn · Thang điểm của bài luyện');
  const actions = element('div', undefined, 'actions');
  if (!active) {
    view.append(practiceSelect(practice, paper => { selectedPractice = paper; render(); }));
    actions.append(button('Luyện tập', () => begin('practice')),
      button('Thi thử · ' + practice.duration / 60 + ' phút', () => begin('exam'), true));
    view.append(actions);
    if (!state || findPractice(state.practiceId) !== practice) return;
    const result = state.result;
    const review = element('div', undefined, 'stack');
    view.append(element('h2', 'Kết quả · ' + result.points + '/' + result.max),
      element('p', 'Điểm tính trên các câu chấm tự động. Câu tự luận xem lời giải để tự đối chiếu.'), review);
    practice.questions.forEach((question, index) => review.append(questionReview(question, index, state)));
    return;
  }
  const panel = element('section', undefined, 'panel');
  const timed = state.mode === 'exam';
  if (timed) {
    const timer = element('p', '', 'timer');
    timer.id = 'timer';
    panel.append(timer);
  }
  const nav = element('div', undefined, 'exam-nav');
  practice.questions.forEach((_, index) => {
    const item = button('Câu ' + (index + 1) + (state.flags[index] ? ' ★' : '') + (answered(state.answers[index]) ? ' ✓' : ''), () => {
      state.index = index;
      updateAttempt();
      render();
    }, true);
    item.setAttribute('aria-current', String(index === state.index));
    nav.append(item);
  });
  const index = state.index;
  const question = practice.questions[index];
  actions.append(button(state.flags[index] ? 'Bỏ đánh dấu' : 'Đánh dấu câu', () => {
    state.flags[index] = !state.flags[index];
    updateAttempt();
    render();
  }, true));
  const help = element('p');
  help.setAttribute('role', 'status');
  if (!timed) {
    actions.append(button('Gợi ý', () => { help.textContent = tutor(question, 'hint'); }, true),
      button('Xem lời giải', () => { help.textContent = tutor(question, 'solution'); }, true));
  }
  actions.append(button('Nộp bài', () => {
    if (!window.confirm('Nộp bài và xem kết quả?')) return;
    finish();
    render();
  }));
  panel.append(nav, questionFields(question, index), actions, help);
  view.append(panel);
}
function progress() {
  heading('Tiến độ học tập', 'Tổng hợp từ các bài đã nộp trên trình duyệt này.');
  const { attempts, completed, mistakes } = summarizeProgress(read(historyKey, []), findPractice);
  const metrics = element('div', undefined, 'grid');
  for (const [label, value] of [
    ['Lần nộp bài', attempts.length],
    ['Bài luyện đã làm', completed + '/' + practices.length],
    ['Câu cần ôn lại', mistakes.length],
  ]) {
    const card = element('section', undefined, 'card');
    card.append(element('h2', label), element('p', String(value), 'metric-value'));
    metrics.append(card);
  }
  view.append(metrics);
  const actions = element('div', undefined, 'actions');
  const practiceLink = link(state && !state.result ? 'Tiếp tục bài đang làm' : 'Chọn bài luyện', '#thi');
  practiceLink.className = 'button';
  actions.append(practiceLink);
  if (mistakes.length) {
    const review = link('Mở sổ câu sai', '#sai');
    review.className = 'button secondary';
    actions.append(review);
  }
  view.append(actions);
  if (!attempts.length) {
    view.append(element('p', 'Sau khi nộp bài, điểm và số câu cần ôn sẽ hiện ở đây.'));
    return;
  }
  const history = element('ul', undefined, 'stack progress-history');
  const dateFormat = new Intl.DateTimeFormat('vi-VN', { dateStyle:'medium', timeStyle:'short', timeZone:'Asia/Ho_Chi_Minh' });
  const numberFormat = new Intl.NumberFormat('vi-VN');
  for (const { paper, attempt } of attempts.slice(0, 10)) {
    const item = element('li', undefined, 'card');
    const result = attempt.result;
    item.append(element('h3', paper.title),
      element('p', numberFormat.format(result.points) + '/' + numberFormat.format(result.max) + ' điểm · ' +
        (attempt.mode === 'exam' ? 'Thi thử' : 'Luyện tập') + ' · ' + dateFormat.format(attempt.submittedAt)));
    history.append(item);
  }
  view.append(element('h2', 'Bài đã nộp gần đây'), history);
}
function mistakes() {
  heading('Sổ câu sai', 'Xem câu làm thiếu hoặc mất điểm trong các bài đã nộp.');
  const { mistakes: latest } = summarizeProgress(read(historyKey, []), findPractice);
  if (!latest.length) {
    view.append(element('p', 'Chưa có câu cần ôn lại.'), link('Vào phòng thi', '#thi'));
    return;
  }
  const stack = element('div', undefined, 'stack');
  for (const { paper, index, attempt } of latest) {
    const card = questionReview(paper.questions[index], index, attempt);
    card.prepend(element('p', paper.title, 'eyebrow'));
    stack.append(card);
  }
  view.append(stack);
}
function tutorView() {
  heading('Gia sư luyện tập', 'Gợi ý và lời giải cho các bài luyện MaxNgo EDU.');
  if (state?.mode === 'exam' && !state.result) {
    view.append(element('p', 'Gia sư mở lại sau khi bạn nộp bài thi thử.'), link('Quay lại bài thi', '#thi'));
    return;
  }
  const select = element('select');
  select.setAttribute('aria-label', 'Chọn câu hỏi');
  let paper = selectedPractice;
  const panel = element('section', undefined, 'panel');
  const prompt = element('p');
  const answer = element('p');
  answer.setAttribute('role', 'status');
  const selected = () => paper.questions[Number(select.value)];
  function update() { prompt.textContent = selected().prompt; answer.textContent = ''; }
  select.onchange = update;
  let request = 0;
  function choosePaper(next) {
    request++;
    paper = next;
    select.replaceChildren(...paper.questions.map((question, index) => new Option(question.topic, index)));
    update();
  }
  const paperPicker = practiceSelect(paper, choosePaper);
  choosePaper(paper);
  const actions = element('div', undefined, 'actions');
  select.addEventListener('change', () => { request++; });
  async function ask(action) {
    const token = ++request;
    const question = selected();
    if (publicRelease) {
      answer.textContent = 'Biên soạn · ' + tutor(question, action);
      return;
    }
    answer.textContent = 'Đang lấy hướng dẫn…';
    try {
      const response = await fetch('/api/tutor?question=' + select.value + '&mode=' + action + '&paper=' + paper.id);
      if (!response.ok) throw Error('tutor');
      const result = await response.json();
      if (token === request) answer.textContent = (result.mode === 'model' ? 'AI · ' : 'Biên soạn · ') + result.text;
    } catch {
      if (token === request) answer.textContent = 'Biên soạn · ' + tutor(question, action);
    }
  }
  actions.append(button('Gợi ý', () => ask('hint')),
    button('Xem lời giải', () => ask('solution'), true));
  panel.append(paperPicker, select, prompt, actions, answer);
  view.append(panel);
}
const reviewStatuses = {
  pending: 'Chờ rà soát', reviewed: 'Đã rà soát nguồn',
  matched: 'Đã đối chiếu đề và đáp án', 'rights-documented': 'Đã ghi nhận căn cứ quyền',
};

async function reviewRequest(url, record) {
  const response = await fetch(url, record ? {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record),
  } : undefined);
  const result = await response.json();
  if (!response.ok) throw Error(result.error);
  return result;
}

function admin() {
  heading('Kiểm kê nguồn', 'Theo dõi nguồn đề, đáp án và căn cứ quyền sử dụng. Hồ sơ lưu trên máy này.');
  const summary = element('p');
  const filter = element('input');
  filter.placeholder = 'Tìm theo năm, môn hoặc đơn vị';
  const filterLabel = element('label', 'Tìm hồ sơ');
  filterLabel.append(filter);
  const pending = element('input');
  pending.type = 'checkbox';
  const pendingLabel = element('label', undefined, 'option');
  pendingLabel.append(pending, document.createTextNode('Chỉ xem nguồn cần rà tiếp'));
  const list = element('select');
  const listLabel = element('label', 'Chọn nguồn');
  listLabel.append(list);
  const detail = element('section', undefined, 'stack');
  view.append(summary, filterLabel, pendingLabel, listLabel, detail);
  const legacy = read(reviewKey, {});
  let records = {};
  function updateSummary() {
    const reviewed = Object.values(records).filter(record => record.status !== 'pending').length;
    summary.textContent = sources.length + ' nguồn tham chiếu · ' + reviewed + ' hồ sơ đã rà soát · ' + sources.filter(source => source.followUp).length + ' nguồn cần rà tiếp';
  }
  function show() {
    const source = sources.find(row => row.id === list.value);
    if (!source) { detail.replaceChildren(element('p', 'Không có hồ sơ phù hợp.')); return; }
    const record = records[source.id] ?? legacy[source.id];
    const row = element('section', undefined, 'panel admin-row');
    const status = element('select');
    for (const [value, label] of Object.entries(reviewStatuses)) status.add(new Option(label, value));
    status.value = record?.status ?? 'pending';
    const statusLabel = element('label', 'Trạng thái');
    statusLabel.append(status);
    row.append(element('h3', source.title), link('Mở trang đề ↗', source.url),
      element('p', source.rightsNote), element('p', source.sourceCheck, 'status'));
    if (source.followUp) {
      row.append(element('h4', 'Cần rà tiếp'),
        element('p', source.followUp.reason), element('p', source.followUp.nextStep));
    }
    if (source.answerCandidate) row.append(link('Mở tệp đáp án công bố ↗', source.answerCandidate));
    if (source.paperMatches?.length) {
      const papers = element('ul');
      papers.append(...source.paperMatches.map(paper => element('li',
        'Mã ' + paper.code + ' · ' + paper.minutes + ' phút · ' + paper.questionCount +
        ' mục trong bảng đáp án · Trang ' + paper.answerPage)));
      row.append(element('h4', 'Mã đề đã ghép nguồn đáp án'), papers);
    }
    if (!records[source.id] && legacy[source.id]) {
      row.append(element('p', 'Đã điền lại ghi chú cũ từ trình duyệt. Bấm Lưu hồ sơ để chuyển vào kho trên máy.'));
    }
    row.append(statusLabel);
    const fields = {};
    for (const [key, label, tag] of [
      ['evidence', 'Ghi chú rà soát', 'textarea'], ['paperCode', 'Mã hoặc phiên bản đề', 'input'],
      ['answerUrl', 'Liên kết đáp án đã đối chiếu', 'input'],
      ['rightsEvidence', 'Căn cứ quyền, phạm vi và nơi lưu bằng chứng', 'textarea'],
    ]) {
      const field = element(tag);
      field.maxLength = 3000;
      field.value = record?.[key] ?? '';
      const group = element('label', label);
      group.append(field);
      row.append(group);
      fields[key] = field;
    }
    const feedback = element('p');
    feedback.setAttribute('role', 'status');
    const url = '/api/reviews/' + source.id;
    const history = element('ul');
    const historyPanel = element('details');
    historyPanel.append(element('summary', 'Lịch sử chỉnh sửa'), history);
    async function updateHistory() {
      try {
        const revisions = await reviewRequest(url);
        history.replaceChildren(...revisions.map(revision => element('li',
          new Date(revision.at).toLocaleString('vi-VN') + ' · ' + reviewStatuses[revision.status] +
          (revision.paperCode ? ' · ' + revision.paperCode : '') +
          (revision.evidence ? ' · ' + revision.evidence : ''))));
        if (!revisions.length) history.append(element('li', 'Chưa có phiên bản đã lưu.'));
      } catch { history.replaceChildren(element('li', 'Chưa tải được lịch sử.')); }
    }
    historyPanel.ontoggle = () => { if (historyPanel.open) updateHistory(); };
    const saveButton = button('Lưu hồ sơ', async () => {
      saveButton.disabled = true;
      feedback.textContent = "Đang lưu hồ sơ…";

      try {
        const payload = Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value]));
        records[source.id] = await reviewRequest(url, { ...payload, status: status.value });
        updateSummary();
        feedback.textContent = 'Đã lưu hồ sơ. Tài liệu vẫn ở chế độ dẫn liên kết.';
        if (historyPanel.open) await updateHistory();
      } catch (error) { feedback.textContent = error.message; }
      finally { saveButton.disabled = false; }
    });
    row.append(saveButton, feedback, historyPanel);
    detail.replaceChildren(row);
  }
  function updateList() {
    const selected = list.value;
    const matches = filterSources(sources, filter.value, '', '').filter(source => !pending.checked || source.followUp);
    list.replaceChildren(...matches.map(source => new Option(source.title, source.id)));
    if (matches.some(source => source.id === selected)) list.value = selected;
    show();
  }
  filter.oninput = pending.onchange = updateList;
  list.onchange = show;
  summary.textContent = 'Đang tải hồ sơ…';
  reviewRequest('/api/reviews').then(result => {
    records = result;
    updateSummary();
    updateList();
  }).catch(() => { summary.textContent = 'Chưa tải được hồ sơ. Hãy kiểm tra ứng dụng đang chạy phiên bản mới.'; });
}
const pages = { 'tien-do': progress, kho: library, thi: exam, sai: mistakes, 'gia-su': tutorView, ...(publicRelease ? {} : { admin }) };
function render() {
  const requested = location.hash.slice(1);
  const page = Object.hasOwn(pages, requested) ? requested : 'kho';
  if (state && !state.result && remaining(state) === 0) finish();
  document.querySelectorAll('nav a').forEach(item => {
    if (item.hash === '#' + page) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });
  view.replaceChildren();
  pages[page]();
  tick();
}
function tick() {
  if (!state || state.result || state.deadline === null) return;
  const seconds = remaining(state);
  if (seconds === 0) { finish(); render(); return; }
  const timer = document.querySelector('#timer');
  if (timer) timer.textContent = 'Còn lại ' + Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
}
window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
setInterval(tick, 250);
render();
