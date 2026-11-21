// Renders the three pages: tracker (checklist + Next-up + guide pane),
// roadmap (6 stages to the platinum) and missables (the 7 watch-list cards).
import { GRADE_POINTS, TOTAL_POINTS, KIND_LABELS, STAGES } from './data.js';
import { isEarned } from './store.js';
import { isMasked, MASKED_NAME, MASKED_TEXT, applyFilters, nextUp } from './filters.js';

export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function gradeBadge(t) {
  return `<span class="grade grade-${t.grade}">${t.grade}</span>`;
}

function kindTag(t) {
  return `<span class="kind">${KIND_LABELS[t.kind] ?? t.kind}</span>`;
}

function missBadge(t) {
  return t.missable ? '<span class="miss">Missable</span>' : '';
}

function sourcesList(t) {
  if (!t.sources || !t.sources.length) return '';
  return `<ul class="sources-list">${t.sources.map((s) => `<li>Source: ${esc(s)}</li>`).join('')}</ul>`;
}

// --- progress ---------------------------------------------------------------
export function updateProgress(doc, state) {
  const earned = doc.trophies.filter((t) => isEarned(state, t));
  const points = earned.reduce((sum, t) => sum + (GRADE_POINTS[t.grade] ?? 0), 0);
  const text = document.getElementById('progressText');
  if (text) text.textContent = `${earned.length} of ${doc.trophies.length} earned`;
  const bar = document.getElementById('progressBar');
  if (bar) bar.style.width = `${Math.round((earned.length / doc.trophies.length) * 100)}%`;
  const pts = document.getElementById('pointsText');
  if (pts) pts.textContent = `${points} / ${TOTAL_POINTS} PSN points`;
}

// --- tracker ----------------------------------------------------------------
function trophyRow(t, state) {
  const masked = isMasked(t, state);
  const earned = isEarned(state, t);
  const name = masked ? MASKED_NAME : esc(t.name);
  const desc = masked ? MASKED_TEXT : esc(t.description);
  const fact = masked ? '' : `<p class="fact">${esc(t.fact)}</p>`;
  const note = esc(state.notes[String(t.id)] ?? '');
  return `<li class="trophy${earned ? ' earned' : ''}" data-id="${t.id}">
    <div class="row-head">
      <input type="checkbox" ${earned ? 'checked' : ''} aria-label="Earned: ${masked ? 'hidden story trophy' : esc(t.name)}">
      <h3>${name}</h3>${gradeBadge(t)}${kindTag(t)}${missBadge(t)}
    </div>
    <p class="desc">${desc}</p>
    ${fact}
    <textarea data-note="${t.id}" rows="1" placeholder="Your note…" aria-label="Note for ${masked ? 'hidden story trophy' : esc(t.name)}">${note}</textarea>
  </li>`;
}

function renderNextUp(doc, state) {
  const box = document.getElementById('nextup');
  if (!box) return;
  const upcoming = nextUp(doc.trophies, state, 5);
  if (!upcoming.length) {
    box.innerHTML = '<h2>Next up</h2><p>Every trophy earned — Leonida Legend. The platinum is yours.</p>';
    return;
  }
  const items = upcoming.map((t) => {
    const masked = isMasked(t, state);
    const name = masked ? MASKED_NAME : esc(t.name);
    const fact = masked ? '' : ` <span class="fact">— ${esc(t.fact)}</span>`;
    return `<li><span class="stage-tag">Stage ${t.stage} ·</span> ${name}${fact}</li>`;
  }).join('');
  box.innerHTML = `<h2>Next up</h2><ol>${items}</ol>`;
}

export function renderTrackerList(doc, state, ui) {
  const list = document.getElementById('trophy-list');
  if (!list) return;
  const shown = applyFilters(doc.trophies, state, ui);
  list.innerHTML = shown.map((t) => trophyRow(t, state)).join('');
}

export function renderDetail(doc, state, selectedId) {
  const pane = document.getElementById('detail');
  if (!pane) return;
  const t = doc.trophies.find((x) => x.id === selectedId);
  if (!t) {
    pane.innerHTML = '<p class="empty">Select a trophy to see its full guide — what to do, where, and whether it can be missed.</p>';
    return;
  }
  const masked = isMasked(t, state);
  const name = masked ? MASKED_NAME : esc(t.name);
  const desc = masked ? MASKED_TEXT : esc(t.description);
  const guide = masked ? MASKED_TEXT : esc(t.guide);
  const fact = masked ? '' : `<p class="fact">${esc(t.fact)}</p>`;
  pane.innerHTML = `<h2>${name}</h2>
    <div class="meta">${gradeBadge(t)}${kindTag(t)}${missBadge(t)}<span class="kind">Stage ${t.stage}</span></div>
    <p class="desc">${desc}</p>
    ${fact}
    <p class="guide">${guide}</p>
    ${masked ? '' : sourcesList(t)}`;
}

export function renderTracker(doc, state, ui, selectedId) {
  const view = document.getElementById('view');
  view.innerHTML = `<section id="nextup" aria-label="Next up"></section>
    <div class="columns">
      <ul id="trophy-list" aria-label="Trophy checklist"></ul>
      <aside id="detail" aria-label="Trophy guide"></aside>
    </div>`;
  renderNextUp(doc, state);
  renderTrackerList(doc, state, ui);
  renderDetail(doc, state, selectedId);
  updateProgress(doc, state);
}

// --- roadmap ----------------------------------------------------------------
export function renderRoadmap(doc, state) {
  const view = document.getElementById('view');
  const stages = STAGES.map((s) => {
    const members = doc.trophies.filter((t) => t.stage === s.n);
    const done = members.filter((t) => isEarned(state, t)).length;
    const items = members.map((t) => {
      const masked = isMasked(t, state);
      const name = masked ? MASKED_NAME : esc(t.name);
      return `<li class="${isEarned(state, t) ? 'done' : ''}">${isEarned(state, t) ? '✓ ' : ''}${name} ${gradeBadge(t)}</li>`;
    }).join('');
    return `<section class="stage"><h2>Stage ${s.n} — ${esc(s.title)}</h2>
      <p>${esc(s.blurb)}</p>
      <p class="stage-count">${done} of ${members.length} earned</p>
      <ul>${items}</ul></section>`;
  }).join('');
  view.innerHTML = `<p class="page-intro">The road to the platinum, in order: story first, then the counted grinds, then the missable watch list, then clean-up. Stages follow the trophy data — each trophy's stage is listed in its guide.</p>${stages}`;
  updateProgress(doc, state);
}

// --- missables ---------------------------------------------------------------
export function renderMissables(doc, state) {
  const view = document.getElementById('view');
  const cards = doc.trophies.filter((t) => t.missable).map((t) => {
    const masked = isMasked(t, state);
    const name = masked ? MASKED_NAME : esc(t.name);
    const desc = masked ? MASKED_TEXT : esc(t.description);
    const guide = masked ? MASKED_TEXT : esc(t.guide);
    return `<article class="miss-card"><h3>${name}</h3>
      <div class="meta">${gradeBadge(t)}${kindTag(t)}<span class="kind">Stage ${t.stage}</span></div>
      <p class="desc">${desc}</p>
      <p class="guide">${guide}</p>
      ${masked ? '' : sourcesList(t)}</article>`;
  }).join('');
  view.innerHTML = `<p class="page-intro">Built from the official descriptions. These 7 read as one-off moments — our reading, and their triggers are unconfirmed (the game released 19 Nov 2026). Do them the first time the opportunity appears, before the final mission.</p>${cards}`;
  updateProgress(doc, state);
}
