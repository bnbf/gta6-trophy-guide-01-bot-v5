// Loads the trophy list and holds the list's shared facts.
// The official list: 55 trophies, 1 platinum, 2 gold, 6 silver, 46 bronze.
export async function loadTrophies() {
  const res = await fetch('data/trophies.json');
  if (!res.ok) throw new Error('could not load data/trophies.json');
  return res.json();
}

export const GRADE_POINTS = { platinum: 180, gold: 90, silver: 30, bronze: 15 };
export const TOTAL_POINTS = 1230;

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
};

export const STAGES = [
  { n: 1, title: 'Story — play the main missions', blurb: 'Chapters 1–4, the opening mission, the final mission and the named story missions. 12 trophies, all story.' },
  { n: 2, title: 'The wide world — 100% and the strands', blurb: 'A Long Road (100% completion), Master of None, Strangers & Freaks, and exploring all 52 areas of Leonida.' },
  { n: 3, title: 'The counted grinds', blurb: 'The big tracked totals: 250 stunts, 42 gold range challenges, 14 drone races, 100 WAiNK It, 100 vehicles, 50 challenges, 5 bank vaults, 18 meditation spots, $250,000 laundered, $100,000 spent.' },
  { n: 4, title: 'Strands and side work', blurb: 'The final missions for Andy, Kenton, Billy, Randy and Tyrone, plus Fair Game, Hot Together, Retail Therapy and Pest Control.' },
  { n: 5, title: 'Missable watch list — do these before the finale', blurb: '7 trophies that read as one-off moments. Our reading, and their triggers are unconfirmed — do them the first time they appear, before the final mission.' },
  { n: 6, title: 'Clean-up', blurb: 'The platinum plus the last loose ends: card sets, garages, Scooter Bros, Gunslinger, the Rhino tanks, the jewelry store, the armored truck, the bowling alley and the melee drive-by.' },
];
