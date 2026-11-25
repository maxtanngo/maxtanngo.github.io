export function grade(question, answer) {
  if (question.type === 'essay') return null;
  if (question.type === 'choice') return answer === question.key ? question.max : 0;
  if (question.type === 'boolean') {
    const correct = question.key.filter((value, index) => answer?.[index] === value).length;
    return question.scale[correct];
  }
  const normalized = String(answer ?? '').trim().replace(',', '.');
  return /^[-+]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(normalized)
    && Number(normalized) === question.key ? question.max : 0;
}

export function score(questions, answers) {
  const marks = questions.map((question, index) => grade(question, answers[index]));
  return {
    marks,
    points: marks.reduce((total, mark) => total + (mark ?? 0), 0),
    max: questions.reduce((total, question) => total + (question.max ?? 0), 0),
    mistakes: marks.flatMap((mark, index) => mark !== null && mark < questions[index].max ? [index] : []),
  };
}

export function submit(state, questions, now = Date.now()) {
  if (state.result) return state;
  return { ...state, result: score(questions, state.answers), submittedAt: now };
}

export function remaining(state, now = Date.now()) {
  return state.deadline === null ? null : Math.max(0, Math.ceil((state.deadline - now) / 1000));
}

export function normalize(value) {
  return value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replaceAll('đ', 'd');
}

export function filterSources(sources, query, year, kind, subject = '') {
  const terms = normalize(query.trim()).split(/\s+/).filter(Boolean);
  return sources.filter(source => (!year || String(source.year) === year)
    && (!kind || source.kind === kind)
    && (!subject || source.subject === subject)
    && matchesTerms(source, terms));
}

function matchesTerms(source, terms) {
  if (!terms.length) return true;
  const codes = (source.paperMatches ?? []).map(paper => paper.code);
  const text = normalize([source.title, source.owner, source.kind, source.subject, source.year, ...codes].join(' '));
  return terms.every(term => text.includes(term));
}

export function tutor(question, action) {
  return action === 'hint' ? question.hint : question.explanation;
}

export function summarizeProgress(history, findPractice) {
  const attempts = [];
  const latestMistakes = new Map();
  const completed = new Set();
  const ordered = [...history].sort((first, second) => first.submittedAt - second.submittedAt);
  for (const attempt of ordered) {
    const paper = findPractice(attempt.practiceId);
    if (!paper || !attempt.result) continue;
    attempts.push({ paper, attempt });
    completed.add(paper.id);
    for (const [index, question] of paper.questions.entries()) {
      if (question.type === 'essay') continue;
      const key = paper.id + '/' + index;
      if (attempt.result.mistakes.includes(index)) latestMistakes.set(key, { paper, index, attempt });
      else latestMistakes.delete(key);
    }
  }
  return { attempts: attempts.reverse(), completed: completed.size, mistakes: [...latestMistakes.values()] };
}
