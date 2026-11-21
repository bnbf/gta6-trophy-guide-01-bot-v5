// Saved progress, per-trophy notes and the spoiler setting.
// One localStorage record: { earned: [trophy names], notes: { id: text }, spoiler: bool }.
export const KEY = 'leonida-platinum-v5';

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { earned: [], notes: {}, spoiler: false };
    const s = JSON.parse(raw);
    return {
      earned: Array.isArray(s.earned) ? s.earned.filter((x) => typeof x === 'string') : [],
      notes: s.notes && typeof s.notes === 'object' && !Array.isArray(s.notes) ? s.notes : {},
      spoiler: s.spoiler === true,
    };
  } catch {
    return { earned: [], notes: {}, spoiler: false };
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function isEarned(state, trophy) {
  return state.earned.includes(trophy.name);
}

export function toggleEarned(state, trophy) {
  const i = state.earned.indexOf(trophy.name);
  if (i === -1) state.earned.push(trophy.name);
  else state.earned.splice(i, 1);
  saveState(state);
}

export function setNote(state, id, text) {
  if (text) state.notes[String(id)] = text;
  else delete state.notes[String(id)];
  saveState(state);
}

// Download the saved state as a JSON file (export).
export function exportState(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-platinum-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Read a state file back (import). Resolves with the parsed state, or rejects.
export function importStateFile(file) {
  return file.text().then((text) => {
    const s = JSON.parse(text);
    if (!s || !Array.isArray(s.earned) || typeof s.notes !== 'object' || s.notes === null) {
      throw new Error('not a Leonida Platinum progress file');
    }
    return {
      earned: s.earned.filter((x) => typeof x === 'string'),
      notes: s.notes,
      spoiler: s.spoiler === true,
    };
  });
}
