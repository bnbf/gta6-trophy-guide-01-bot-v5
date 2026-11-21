// Boot, hash routing (#/tracker, #/roadmap, #/missables) and the toolbar.
// All list events are delegated from #view, wired once — re-renders never
// re-attach them, and a row click never eats a checkbox change.
import { loadTrophies } from './data.js';
import { loadState, saveState, toggleEarned, setNote, exportState, importStateFile } from './store.js';
import { renderTracker, renderTrackerList, renderDetail, renderRoadmap, renderMissables, updateProgress } from './views.js';

const state = loadState();
const ui = { q: '', kind: 'all', grade: 'all', hideEarned: false };
let selectedId = null;
let doc = null;

function route() {
  const hash = location.hash || '#/tracker';
  document.querySelectorAll('.tabs a').forEach((a) => {
    a.classList.toggle('active', `#/${a.dataset.route}` === hash.split('?')[0]);
  });
  if (!doc) return;
  if (hash.startsWith('#/roadmap')) renderRoadmap(doc, state);
  else if (hash.startsWith('#/missables')) renderMissables(doc, state);
  else renderTracker(doc, state, ui, selectedId);
}

function rerenderTracker() {
  if (!doc) return;
  renderTracker(doc, state, ui, selectedId);
}

function syncToolbar() {
  const spoiler = document.getElementById('spoilerToggle');
  if (spoiler) spoiler.checked = state.spoiler;
  document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c.dataset.kind === ui.kind));
}

async function boot() {
  doc = await loadTrophies();
  syncToolbar();

  // Toolbar: search, kind chips, grade filter, hide-earned, spoiler setting.
  const search = document.getElementById('search');
  search.addEventListener('input', () => {
    ui.q = search.value;
    if (location.hash.startsWith('#/roadmap') || location.hash.startsWith('#/missables')) {
      location.hash = '#/tracker';
    } else {
      renderTrackerList(doc, state, ui);
    }
  });
  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      ui.kind = chip.dataset.kind;
      syncToolbar();
      if (location.hash.startsWith('#/roadmap') || location.hash.startsWith('#/missables')) {
        location.hash = '#/tracker';
      } else {
        renderTrackerList(doc, state, ui);
      }
    });
  });
  document.getElementById('gradeFilter').addEventListener('change', (e) => {
    ui.grade = e.target.value;
    renderTrackerList(doc, state, ui);
  });
  document.getElementById('hideEarned').addEventListener('change', (e) => {
    ui.hideEarned = e.target.checked;
    renderTrackerList(doc, state, ui);
  });
  document.getElementById('spoilerToggle').addEventListener('change', (e) => {
    state.spoiler = e.target.checked;
    saveState(state);
    rerenderTracker();
  });

  // Export / import.
  document.getElementById('exportBtn').addEventListener('click', () => exportState(state));
  const importFile = document.getElementById('importFile');
  document.getElementById('importBtn').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', async () => {
    const file = importFile.files[0];
    if (!file) return;
    try {
      const imported = await importStateFile(file);
      state.earned = imported.earned;
      state.notes = imported.notes;
      state.spoiler = imported.spoiler;
      saveState(state);
      syncToolbar();
      rerenderTracker();
    } catch {
      alert('That file is not a Leonida Platinum progress file.');
    }
    importFile.value = '';
  });

  // Delegated list events, attached once to the persistent #view.
  const view = document.getElementById('view');
  view.addEventListener('click', (e) => {
    const row = e.target.closest('.trophy');
    if (!row) return;
    // Clicks on controls belong to the control, not to the row.
    if (e.target.closest('input, textarea, button, a, select, label')) return;
    selectedId = Number(row.dataset.id);
    document.querySelectorAll('.trophy').forEach((li) => li.classList.toggle('selected', Number(li.dataset.id) === selectedId));
    renderDetail(doc, state, selectedId);
  });
  view.addEventListener('change', (e) => {
    const box = e.target.closest('.trophy input[type="checkbox"]');
    if (!box) return;
    const row = box.closest('.trophy');
    const t = doc.trophies.find((x) => x.id === Number(row.dataset.id));
    if (!t) return;
    toggleEarned(state, t);
    // Re-render the tracker (hide-earned may drop the row, Next-up moves
    // on); the change event has already fired, so the checkbox is not
    // destroyed mid-event.
    route();
  });
  view.addEventListener('input', (e) => {
    const ta = e.target.closest('textarea[data-note]');
    if (!ta) return;
    setNote(state, Number(ta.dataset.note), ta.value);
  });

  window.addEventListener('hashchange', route);
  route();
}

boot().catch((err) => {
  document.getElementById('view').innerHTML = `<p class="page-intro">Could not load the trophy list: ${err.message}</p>`;
});
