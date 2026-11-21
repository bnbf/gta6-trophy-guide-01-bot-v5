// Filtering, search and the spoiler rule.

// A trophy is masked while the spoiler setting is on, it is not earned yet,
// and it is a story trophy — or the platinum itself.
export function isMasked(trophy, state) {
  if (!state.spoiler) return false;
  if (state.earned.includes(trophy.name)) return false;
  return trophy.kind === 'story' || trophy.grade === 'platinum';
}

export const MASKED_NAME = 'Hidden story trophy';
export const MASKED_TEXT = 'Hidden until earned — turn the spoiler setting off, or earn it, to see the details.';

// The checklist filter: kind ('missable' is a flag, not a kind), grade,
// hide-earned, and a search over name, description and guide.
export function applyFilters(trophies, state, { q, kind, grade, hideEarned }) {
  const needle = (q || '').trim().toLowerCase();
  return trophies.filter((t) => {
    if (kind === 'missable') {
      if (!t.missable) return false;
    } else if (kind !== 'all' && t.kind !== kind) {
      return false;
    }
    if (grade !== 'all' && t.grade !== grade) return false;
    if (hideEarned && state.earned.includes(t.name)) return false;
    if (needle) {
      const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}

// The Next-up planner: the next unearned trophies in roadmap order
// (stage first, then list order), up to `count`.
export function nextUp(trophies, state, count = 5) {
  return trophies
    .filter((t) => !state.earned.includes(t.name))
    .sort((a, b) => a.stage - b.stage || a.id - b.id)
    .slice(0, count);
}
