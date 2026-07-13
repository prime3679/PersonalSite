const EPSILON = 8;
const STORAGE_KEY = 'fork.v1';
const SVG_NS = 'http://www.w3.org/2000/svg';

const COLORS = {
  paper: '#f7f3ea',
  ink: '#1c1814',
  graphite: '#574f44',
  hairline: '#e4decf',
  strongHairline: '#d3cbb8',
  rust: '#a8472c',
};

const DEFAULT_STATE = Object.freeze({
  v: 1,
  step: 'cover',
  decision: '',
  futures: ['', '', ''],
  marks: [
    { pull: 50, sting: 50, reversibility: '', pullSet: false, stingSet: false },
    { pull: 50, sting: 50, reversibility: '', pullSet: false, stingSet: false },
    { pull: 50, sting: 50, reversibility: '', pullSet: false, stingSet: false },
  ],
});

function clampInt(value, fallback = 50) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.min(100, parsed));
}

function cleanText(value, limit) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);
}

function normalizeMark(mark) {
  return {
    pull: clampInt(mark && mark.pull),
    sting: clampInt(mark && mark.sting),
    reversibility: mark && mark.reversibility === 'ink' ? 'ink' : mark && mark.reversibility === 'pencil' ? 'pencil' : '',
    pullSet: Boolean(mark && mark.pullSet),
    stingSet: Boolean(mark && mark.stingSet),
  };
}

export function normalizeState(input = {}) {
  const allowedSteps = new Set(['cover', 'decision', 'futures', 'rate0', 'rate1', 'rate2', 'map']);
  const step = allowedSteps.has(input.step) ? input.step : DEFAULT_STATE.step;
  const futures = Array.from({ length: 3 }, (_, index) => cleanText(input.futures && input.futures[index], 18));
  const marks = Array.from({ length: 3 }, (_, index) => normalizeMark(input.marks && input.marks[index]));
  return {
    v: 1,
    step,
    decision: cleanText(input.decision, 80),
    futures,
    marks,
  };
}

export function readMap(input) {
  const state = normalizeState(input);
  const entries = state.futures.map((name, index) => ({
    name: name || `future ${index + 1}`,
    pull: state.marks[index].pull,
    sting: state.marks[index].sting,
    reversibility: state.marks[index].reversibility,
  }));

  const pulls = entries.map((entry) => entry.pull);
  const stings = entries.map((entry) => entry.sting);
  if (Math.max(...pulls) - Math.min(...pulls) <= EPSILON && Math.max(...stings) - Math.min(...stings) <= EPSILON) {
    return ['the map came out flat. either these futures are truly even, or the fork you are standing at is not the one you wrote down.'];
  }

  const pullWinner = clearWinner(entries, 'pull');
  const stingWinner = clearWinner(entries, 'sting');
  const observations = [];

  if (pullWinner && stingWinner && pullWinner.index !== stingWinner.index) {
    observations.push(`${pullWinner.entry.name} pulls hardest today. ${stingWinner.entry.name} would sting most to lose at ten years. those are two different futures.`);
  }

  if (pullWinner && stingWinner && pullWinner.index === stingWinner.index) {
    observations.push('want and mourning point at the same future. whatever keeps you standing at this fork, it is not on this map.');
  }

  if (stingWinner && stingWinner.entry.reversibility === 'pencil') {
    observations.push(`${stingWinner.entry.name} would sting most to lose, and it is written in pencil. it is a future you could test and still return from.`);
  }

  if (pullWinner && pullWinner.entry.reversibility === 'ink') {
    observations.push(`${pullWinner.entry.name} pulls hardest, and it is the one you cannot walk back.`);
  }

  const inkEntries = entries.map((entry, index) => ({ entry, index })).filter((item) => item.entry.reversibility === 'ink');
  if (inkEntries.length === 1) {
    const onlyInk = inkEntries[0];
    const minPull = Math.min(...pulls);
    const minSting = Math.min(...stings);
    if (onlyInk.entry.pull === minPull && onlyInk.entry.sting === minSting) {
      observations.push(`${onlyInk.entry.name} is the only branch in ink, and the one you would miss least.`);
    }
  }

  if (entries.every((entry) => entry.reversibility === 'ink')) {
    observations.push('all three are in ink. standing still is starting to look like a fourth branch.');
  }

  if (entries.every((entry) => entry.reversibility === 'pencil')) {
    observations.push('all three are in pencil. whatever this decision costs, it is not permanence.');
  }

  const byPull = entries.map((entry, index) => ({ entry, index })).sort((a, b) => b.entry.pull - a.entry.pull);
  if (Math.abs(byPull[0].entry.pull - byPull[1].entry.pull) <= EPSILON && Math.abs(byPull[0].entry.sting - byPull[1].entry.sting) > EPSILON) {
    observations.push(`today cannot tell ${byPull[0].entry.name} from ${byPull[1].entry.name}. ten years from now can.`);
  }

  return observations.length ? observations.slice(0, 2) : ['the marks do not point to one answer. that is the map, not a failure of it.'];
}

function clearWinner(entries, key) {
  const ranked = entries.map((entry, index) => ({ entry, index })).sort((a, b) => b.entry[key] - a.entry[key]);
  return ranked[0].entry[key] - ranked[1].entry[key] > EPSILON ? ranked[0] : null;
}

function vertical(value, top, bottom) {
  return top + ((100 - clampInt(value)) / 100) * (bottom - top);
}

function seedForName(name, index) {
  let seed = 2166136261 + index * 101;
  for (let i = 0; i < name.length; i += 1) {
    seed ^= name.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }
  return seed >>> 0;
}

function waver(seed, point) {
  const n = Math.sin((seed + point * 97) * 12.9898) * 43758.5453;
  return (n - Math.floor(n) - 0.5) * 4;
}

function pathForBranch(name, index, leftX, rightX, leftY, rightY) {
  const seed = seedForName(name, index);
  const midX = leftX + (rightX - leftX) * 0.5;
  const c1X = leftX + (rightX - leftX) * 0.25;
  const c2X = leftX + (rightX - leftX) * 0.75;
  const c1Y = leftY + (rightY - leftY) * 0.2 + waver(seed, 1);
  const c2Y = leftY + (rightY - leftY) * 0.82 + waver(seed, 2);
  const midY = (leftY + rightY) / 2 + waver(seed, 3);
  return `M ${leftX} ${leftY.toFixed(1)} C ${c1X} ${c1Y.toFixed(1)} ${midX - 34} ${midY.toFixed(1)} ${midX} ${midY.toFixed(1)} C ${midX + 34} ${midY.toFixed(1)} ${c2X} ${c2Y.toFixed(1)} ${rightX} ${rightY.toFixed(1)}`;
}

function firstCrossing(entries) {
  for (let a = 0; a < entries.length; a += 1) {
    for (let b = a + 1; b < entries.length; b += 1) {
      const leftOrder = Math.sign(entries[a].leftY - entries[b].leftY);
      const rightOrder = Math.sign(entries[a].rightY - entries[b].rightY);
      if (leftOrder !== 0 && rightOrder !== 0 && leftOrder !== rightOrder) {
        return [entries[a], entries[b]];
      }
    }
  }
  return null;
}

function truncateLabel(text, limit) {
  const clean = cleanText(text, 80);
  return clean.length > limit ? `${clean.slice(0, limit - 1)}.` : clean;
}

function makeSvgElement(tag, attrs = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => {
    element.setAttribute(key, String(value));
  });
  return element;
}

function appendSvgText(parent, text, x, y, attrs = {}) {
  const element = makeSvgElement('text', { x, y, ...attrs });
  element.textContent = text;
  parent.append(element);
  return element;
}

export function mapGeometry(input, width = 760, height = 360) {
  const state = normalizeState(input);
  const top = 70;
  const bottom = height - 78;
  const leftX = 132;
  const rightX = width - 124;
  const entries = state.futures.map((future, index) => {
    const mark = state.marks[index];
    const leftY = vertical(mark.pull, top, bottom);
    const rightY = vertical(mark.sting, top, bottom);
    return {
      index,
      name: future || `future ${index + 1}`,
      reversibility: mark.reversibility,
      leftY,
      rightY,
      path: pathForBranch(future || `future ${index + 1}`, index, leftX, rightX, leftY, rightY),
    };
  });
  return { top, bottom, leftX, rightX, entries, crossing: firstCrossing(entries) };
}

export function renderMapSvg(svg, input) {
  const state = normalizeState(input);
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  const width = 760;
  const height = 360;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `fork map for ${state.decision || 'one decision'}`);

  const geometry = mapGeometry(state, width, height);
  svg.append(makeSvgElement('line', { x1: geometry.leftX, y1: geometry.top - 12, x2: geometry.leftX, y2: geometry.bottom + 12, stroke: COLORS.strongHairline, 'stroke-width': 1 }));
  svg.append(makeSvgElement('line', { x1: geometry.rightX, y1: geometry.top - 12, x2: geometry.rightX, y2: geometry.bottom + 12, stroke: COLORS.strongHairline, 'stroke-width': 1 }));
  appendSvgText(svg, 'pulls today', geometry.leftX, 34, { 'text-anchor': 'middle', class: 'map-label' });
  appendSvgText(svg, 'stings at ten years', geometry.rightX, 34, { 'text-anchor': 'middle', class: 'map-label' });

  const averagePullY = geometry.entries.reduce((sum, entry) => sum + entry.leftY, 0) / geometry.entries.length;
  svg.append(makeSvgElement('path', {
    d: `M 30 ${averagePullY.toFixed(1)} C 62 ${(averagePullY - 4).toFixed(1)} 88 ${(averagePullY + 3).toFixed(1)} ${geometry.leftX} ${averagePullY.toFixed(1)}`,
    fill: 'none',
    stroke: COLORS.ink,
    'stroke-linecap': 'round',
    'stroke-width': 2.5,
    class: 'map-trunk',
  }));

  geometry.entries.forEach((entry) => {
    const stroke = entry.reversibility === 'ink' ? COLORS.ink : COLORS.graphite;
    const strokeWidth = entry.reversibility === 'ink' ? 2.5 : 1.5;
    svg.append(makeSvgElement('path', {
      d: entry.path,
      fill: 'none',
      stroke,
      'stroke-linecap': 'round',
      'stroke-width': strokeWidth,
      class: 'map-branch',
      'data-branch': String(entry.index),
    }));
    appendSvgText(svg, truncateLabel(entry.name, 13), geometry.rightX + 18, entry.rightY + 4, { class: 'branch-label' });
  });

  if (geometry.crossing) {
    const [a, b] = geometry.crossing;
    const t = (a.leftY - b.leftY) / ((b.rightY - b.leftY) - (a.rightY - a.leftY));
    const x = geometry.leftX + (geometry.rightX - geometry.leftX) * Math.max(0.18, Math.min(0.82, t));
    const y = a.leftY + (a.rightY - a.leftY) * Math.max(0.18, Math.min(0.82, t));
    svg.append(makeSvgElement('path', {
      d: `M ${x - 7} ${y - 7} L ${x + 7} ${y + 7} M ${x + 7} ${y - 7} L ${x - 7} ${y + 7}`,
      fill: 'none',
      stroke: COLORS.rust,
      'stroke-linecap': 'round',
      'stroke-width': 2,
      class: 'crossing-mark',
    }));
  }
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 8) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((item, index) => ctx.fillText(item, x, y + index * lineHeight));
  return y + Math.min(lines.length, maxLines) * lineHeight;
}

function drawCanvasBranch(ctx, entry) {
  const path = new Path2D(entry.path);
  ctx.strokeStyle = entry.reversibility === 'ink' ? COLORS.ink : COLORS.graphite;
  ctx.lineWidth = entry.reversibility === 'ink' ? 3.4 : 2.1;
  ctx.lineCap = 'round';
  ctx.stroke(path);
}

export function drawExportCanvas(canvas, input, now = new Date()) {
  const state = normalizeState(input);
  const ctx = canvas.getContext('2d');
  canvas.width = 1080;
  canvas.height = 1350;
  ctx.fillStyle = COLORS.paper;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = COLORS.ink;
  ctx.font = '48px Georgia, "Iowan Old Style", serif';
  ctx.fillText('fork', 88, 112);
  ctx.font = '24px ui-monospace, "SF Mono", Menlo, monospace';
  ctx.fillStyle = COLORS.graphite;
  ctx.fillText('adrianlumley.co/lab/fork', 88, 154);

  ctx.fillStyle = COLORS.ink;
  ctx.font = '34px Georgia, "Iowan Old Style", serif';
  let y = wrapCanvasText(ctx, state.decision, 88, 232, 904, 44, 3) + 34;

  const scale = 1.15;
  const offsetX = 82;
  const offsetY = y;
  const geometry = mapGeometry(state, 760, 360);
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  ctx.strokeStyle = COLORS.strongHairline;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(geometry.leftX, geometry.top - 12);
  ctx.lineTo(geometry.leftX, geometry.bottom + 12);
  ctx.moveTo(geometry.rightX, geometry.top - 12);
  ctx.lineTo(geometry.rightX, geometry.bottom + 12);
  ctx.stroke();
  ctx.font = '14px ui-monospace, "SF Mono", Menlo, monospace';
  ctx.fillStyle = COLORS.graphite;
  ctx.textAlign = 'center';
  ctx.fillText('pulls today', geometry.leftX, 34);
  ctx.fillText('stings at ten years', geometry.rightX, 34);
  ctx.textAlign = 'left';
  const averagePullY = geometry.entries.reduce((sum, entry) => sum + entry.leftY, 0) / geometry.entries.length;
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(30, averagePullY);
  ctx.bezierCurveTo(62, averagePullY - 4, 88, averagePullY + 3, geometry.leftX, averagePullY);
  ctx.stroke();
  geometry.entries.forEach((entry) => drawCanvasBranch(ctx, entry));
  if (geometry.crossing) {
    const [a, b] = geometry.crossing;
    const t = (a.leftY - b.leftY) / ((b.rightY - b.leftY) - (a.rightY - a.leftY));
    const x = geometry.leftX + (geometry.rightX - geometry.leftX) * Math.max(0.18, Math.min(0.82, t));
    const crossY = a.leftY + (a.rightY - a.leftY) * Math.max(0.18, Math.min(0.82, t));
    ctx.strokeStyle = COLORS.rust;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(x - 9, crossY - 9);
    ctx.lineTo(x + 9, crossY + 9);
    ctx.moveTo(x + 9, crossY - 9);
    ctx.lineTo(x - 9, crossY + 9);
    ctx.stroke();
  }
  ctx.restore();

  y += 500;
  ctx.fillStyle = COLORS.ink;
  ctx.font = '28px Georgia, "Iowan Old Style", serif';
  state.futures.forEach((future, index) => {
    const mark = state.marks[index];
    const line = `${future}: ${mark.reversibility === 'ink' ? 'ink' : 'pencil'}`;
    ctx.fillText(line, 88, y + index * 42);
  });
  y += 162;

  ctx.font = '28px Georgia, "Iowan Old Style", serif';
  readMap(state).forEach((observation) => {
    y = wrapCanvasText(ctx, observation, 88, y, 904, 38, 3) + 18;
  });

  ctx.strokeStyle = COLORS.strongHairline;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(88, 1142);
  ctx.lineTo(992, 1142);
  ctx.stroke();
  ctx.fillStyle = COLORS.ink;
  ctx.font = '27px Georgia, "Iowan Old Style", serif';
  wrapCanvasText(ctx, 'one question the map cannot hold: which of these doors is closing on its own, whether or not you choose?', 88, 1192, 904, 38, 3);
  ctx.fillStyle = COLORS.graphite;
  ctx.font = '22px ui-monospace, "SF Mono", Menlo, monospace';
  ctx.fillText(now.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase(), 88, 1292);
}

export function saveMapPng(input, documentRef = document, now = new Date()) {
  const canvas = documentRef.createElement('canvas');
  drawExportCanvas(canvas, input, now);
  const link = documentRef.createElement('a');
  link.download = 'fork-map.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
  return link.href;
}

function initForkApp() {
  const root = document.querySelector('[data-fork-app]');
  if (!root) return;

  let state = restoreState();
  let confirmStart = false;
  let sliderId = 0;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const els = {
    shell: document.querySelector('[data-step-shell]'),
    title: document.getElementById('screen-title'),
    body: document.getElementById('screen-body'),
    back: document.getElementById('back-button'),
    startOver: document.getElementById('start-over-button'),
    live: document.getElementById('step-live'),
  };

  function restoreState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? normalizeState(JSON.parse(raw)) : normalizeState(DEFAULT_STATE);
    } catch {
      return normalizeState(DEFAULT_STATE);
    }
  }

  function persist() {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function setState(patch) {
    state = normalizeState({ ...state, ...patch });
    if (state.step === 'cover') {
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      persist();
    }
    confirmStart = false;
    render();
  }

  function setStep(step) {
    setState({ step });
  }

  function clearBody() {
    while (els.body.firstChild) els.body.removeChild(els.body.firstChild);
  }

  function button(text, handler, kind = 'primary') {
    const node = document.createElement('button');
    node.type = 'button';
    node.className = `control-button ${kind}`;
    node.textContent = text;
    node.addEventListener('click', handler);
    return node;
  }

  function paragraph(text, className = 'copy') {
    const node = document.createElement('p');
    node.className = className;
    node.textContent = text;
    return node;
  }

  function render() {
    clearBody();
    root.dataset.step = state.step;
    els.back.hidden = state.step === 'cover';
    els.startOver.hidden = state.step === 'cover';
    els.startOver.textContent = 'start over';
    els.shell.classList.remove('is-map');
    const announce = stepAnnouncement(state.step);
    els.live.textContent = announce;

    if (state.step === 'cover') renderCover();
    if (state.step === 'decision') renderDecision();
    if (state.step === 'futures') renderFutures();
    if (state.step.startsWith('rate')) renderRate(Number(state.step.replace('rate', '')));
    if (state.step === 'map') renderMap();

    if (reduceMotion) els.shell.classList.add('reduce-motion');
  }

  function stepAnnouncement(step) {
    if (step === 'cover') return 'fork cover';
    if (step === 'decision') return 'decision';
    if (step === 'futures') return 'three futures';
    if (step === 'map') return 'map';
    return `future ${Number(step.replace('rate', '')) + 1}`;
  }

  function renderCover() {
    els.title.textContent = 'fork';
    els.body.append(
      paragraph('one decision, three futures, and a map of what each would cost you.'),
      paragraph('no account, no ai, nothing leaves this page. the map is gone when you close the tab, unless you save it.'),
      paragraph('takes about three minutes.', 'copy small'),
      button('draw the fork', () => setStep('decision')),
    );
  }

  function renderDecision() {
    els.title.textContent = 'what are you deciding?';
    const form = document.createElement('form');
    form.className = 'stack';
    const label = document.createElement('label');
    label.className = 'writing-line';
    const input = document.createElement('input');
    input.name = 'decision';
    input.type = 'text';
    input.maxLength = 80;
    input.required = true;
    input.autocomplete = 'off';
    input.placeholder = 'leave the job, stay in the city, say it out loud';
    input.value = state.decision;
    const hint = paragraph('give it a name, even a rough one.', 'hint');
    input.addEventListener('input', () => {
      state = normalizeState({ ...state, decision: input.value });
      persist();
      hint.hidden = Boolean(state.decision);
    });
    hint.hidden = Boolean(state.decision);
    label.append(input);
    form.append(label, hint, button('next', () => {
      const decision = cleanText(input.value, 80);
      if (!decision) {
        hint.hidden = false;
        input.focus();
        return;
      }
      setState({ decision, step: 'futures' });
    }));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      form.querySelector('button').click();
    });
    els.body.append(form);
    input.focus({ preventScroll: true });
  }

  function renderFutures() {
    els.title.textContent = 'name three ways it could go.';
    els.body.append(paragraph('a few words each. short enough to fit on a branch.', 'copy small'));
    const form = document.createElement('form');
    form.className = 'stack';
    const placeholders = ['stay put', 'take the offer', 'start over'];
    const inputs = placeholders.map((placeholder, index) => {
      const label = document.createElement('label');
      label.className = 'writing-line';
      const input = document.createElement('input');
      input.name = `future-${index}`;
      input.type = 'text';
      input.maxLength = 18;
      input.required = true;
      input.autocomplete = 'off';
      input.placeholder = placeholder;
      input.value = state.futures[index];
      input.addEventListener('input', () => {
        const futures = [...state.futures];
        futures[index] = input.value;
        state = normalizeState({ ...state, futures });
        persist();
      });
      label.append(input);
      form.append(label);
      return input;
    });
    const hint = paragraph('give each branch a name.', 'hint');
    hint.hidden = true;
    form.append(hint, button('next', () => {
      const futures = inputs.map((input) => cleanText(input.value, 18));
      if (futures.some((future) => !future)) {
        hint.hidden = false;
        inputs.find((input) => !cleanText(input.value, 18)).focus();
        return;
      }
      setState({ futures, step: 'rate0' });
    }));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      form.querySelector('button').click();
    });
    els.body.append(form);
    inputs[0].focus({ preventScroll: true });
  }

  function renderRate(index) {
    els.title.textContent = state.futures[index] || `future ${index + 1}`;
    const mark = { ...state.marks[index] };
    const form = document.createElement('form');
    form.className = 'stack';
    const pull = sliderBlock('pull', 'how hard does it pull, today?', 'barely', 'hard', mark.pull, (value) => {
      mark.pull = value;
      mark.pullSet = true;
      saveMark(index, mark);
    });
    const sting = sliderBlock('sting', 'ten years from now, you chose something else. how much does losing this one sting?', 'a shrug', 'a scar', mark.sting, (value) => {
      mark.sting = value;
      mark.stingSet = true;
      saveMark(index, mark);
    });
    const radios = reversibilityBlock(index, mark, (value) => {
      mark.reversibility = value;
      saveMark(index, mark);
    });
    const hint = paragraph('mark both lines and choose pencil or ink.', 'hint');
    hint.hidden = hasCompleteMark(mark);
    const nextText = index === 2 ? 'draw the map' : 'next';
    const next = button(nextText, () => {
      if (!hasCompleteMark(mark)) {
        hint.hidden = false;
        const missing = form.querySelector('input:not([data-set="true"]), input[type="radio"]:not(:checked)');
        if (missing) missing.focus();
        return;
      }
      setStep(index === 2 ? 'map' : `rate${index + 1}`);
    });
    form.append(pull, sting, radios, hint, next);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      next.click();
    });
    els.body.append(form);
    form.querySelector('input').focus({ preventScroll: true });
  }

  function saveMark(index, mark) {
    const marks = state.marks.map((item, itemIndex) => (itemIndex === index ? normalizeMark(mark) : item));
    state = normalizeState({ ...state, marks });
    persist();
  }

  function hasCompleteMark(mark) {
    return Boolean(mark.pullSet && mark.stingSet && mark.reversibility);
  }

  function sliderBlock(name, question, low, high, value, onChange) {
    const group = document.createElement('div');
    group.className = 'slider-group';
    const label = document.createElement('label');
    sliderId += 1;
    const id = `${name}-${sliderId}`;
    label.setAttribute('for', id);
    label.textContent = question;
    const row = document.createElement('div');
    row.className = 'range-row';
    const lowNode = document.createElement('span');
    lowNode.textContent = low;
    const input = document.createElement('input');
    input.type = 'range';
    input.id = id;
    input.min = '0';
    input.max = '100';
    input.step = '1';
    input.value = String(value);
    input.setAttribute('aria-label', question);
    input.setAttribute('aria-valuetext', `${low} to ${high}`);
    input.dataset.set = 'false';
    const highNode = document.createElement('span');
    highNode.textContent = high;
    input.addEventListener('input', () => {
      input.dataset.set = 'true';
      onChange(clampInt(input.value));
    });
    row.append(lowNode, input, highNode);
    group.append(label, row);
    return group;
  }

  function reversibilityBlock(index, mark, onChange) {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'choice-group';
    const legend = document.createElement('legend');
    legend.textContent = 'if you take it and it goes wrong, can you walk it back?';
    fieldset.append(legend);
    [
      ['pencil', 'pencil. i could walk it back.'],
      ['ink', 'ink. it writes over the rest.'],
    ].forEach(([value, labelText]) => {
      const label = document.createElement('label');
      label.className = 'choice';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `reversibility-${index}`;
      input.value = value;
      input.checked = mark.reversibility === value;
      input.addEventListener('change', () => onChange(value));
      const span = document.createElement('span');
      span.textContent = labelText;
      label.append(input, span);
      fieldset.append(label);
    });
    return fieldset;
  }

  function renderMap() {
    els.shell.classList.add('is-map');
    els.title.textContent = state.decision || 'fork';
    const svg = makeSvgElement('svg', { class: 'fork-map' });
    renderMapSvg(svg, state);
    const hiddenList = document.createElement('ul');
    hiddenList.className = 'sr-only';
    state.futures.forEach((future, index) => {
      const item = document.createElement('li');
      item.textContent = `${future}, ${state.marks[index].reversibility}`;
      hiddenList.append(item);
    });
    const legend = paragraph('ink does not erase. pencil can.', 'legend');
    const observations = document.createElement('div');
    observations.className = 'observations';
    readMap(state).forEach((item) => observations.append(paragraph(item, 'observation')));
    const question = paragraph('one question the map cannot hold: which of these doors is closing on its own, whether or not you choose?', 'margin-question');
    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.append(
      button('save the map', () => saveMapPng(state)),
      button('change my marks', () => setStep('rate0'), 'secondary'),
    );
    els.body.append(svg, hiddenList, legend, observations, question, actions);
  }

  els.back.addEventListener('click', () => {
    if (state.step === 'decision') setStep('cover');
    else if (state.step === 'futures') setStep('decision');
    else if (state.step === 'rate0') setStep('futures');
    else if (state.step === 'rate1') setStep('rate0');
    else if (state.step === 'rate2') setStep('rate1');
    else if (state.step === 'map') setStep('rate2');
  });

  els.startOver.addEventListener('click', () => {
    if (!confirmStart) {
      confirmStart = true;
      els.startOver.textContent = 'this erases everything. start over.';
      els.startOver.focus();
      return;
    }
    sessionStorage.removeItem(STORAGE_KEY);
    state = normalizeState(DEFAULT_STATE);
    confirmStart = false;
    render();
  });

  render();
}

if (typeof window !== 'undefined') {
  window.ForkLogic = { readMap, normalizeState, mapGeometry, renderMapSvg, drawExportCanvas, saveMapPng };
  initForkApp();
}
