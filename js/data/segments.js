// End-of-game segmentation — "Neura has segmented you."
// Rules are evaluated in order; first match wins. roi can be Infinity.

export const SEGMENTS = [
  {
    key: 'ghost', name: 'THE GHOST',
    match: (m) => m.leadCount === 0,
    desc: 'Attended everything. Connected with no one. Your badge photo is the only evidence you were here at all.',
    tip: 'Neura recommends: any interaction. Literally any.',
  },
  {
    key: 'burnout', name: 'THE CASUALTY',
    match: (m) => m.collapsed,
    desc: 'You flew too close to the rosé. Somewhere on day three your body filed for separation from your ambitions.',
    tip: 'Neura recommends: water. Retroactively.',
  },
  {
    key: 'goblin', name: 'GUTTER BAR GOBLIN',
    match: (m) => m.gutterVisits >= 3 && m.joie >= 50,
    desc: 'Technically a delegate, spiritually a creature of the night. You did your best work after midnight in a plastic cup.',
    tip: 'Neura notes: an improbable share of your pipeline has "agreed at 2am" in the notes field.',
  },
  {
    key: 'degenerate', name: 'THE DEGENERATE',
    match: (m) => m.gambleNet <= -Math.max(3_000, m.budget * 0.15),
    desc: 'You came for the festival and found the roulette table. A meaningful slice of your budget now belongs to a casino, and your expense report reads like a confession.',
    tip: 'Neura has reclassified your "client entertainment" line as "entertainment".',
  },
  {
    key: 'croupier', name: 'THE CROUPIER’S NIGHTMARE',
    match: (m) => m.gambleNet >= Math.max(6_000, m.budget * 0.2),
    desc: 'You beat the house. At Cannes. While sober enough to remember it. Your pipeline is real but your true ROI came off a wheel, and everyone at the table knows your name.',
    tip: 'Neura recommends: never returning. Legends don’t do sequels.',
  },
  {
    key: 'leech', name: 'YACHT LEECH',
    match: (m) => m.yachtVisits >= 3 && m.spend < m.budget * 0.25,
    desc: 'You spent the week aboard other people’s boats drinking other people’s champagne. Not one euro of hospitality was yours. Magnificent.',
    tip: 'Neura admires the unit economics.',
  },
  {
    key: 'rose', name: 'ROSÉ CASUALTY',
    match: (m) => m.drinkSpend > m.spend * 0.4 && m.perf < 0.5,
    desc: 'Your single biggest line item was wine. Your pipeline is mostly people you can’t fully remember meeting. The tan, however, is excellent.',
    tip: 'Neura has segmented your expenses under "Ambience".',
  },
  {
    key: 'fringe', name: 'FRINGE OPERATOR',
    match: (m) => !m.hasPass && m.perf >= 1,
    desc: 'No badge, no Palais, no problem. You ran the whole festival from terraces, queues and pavements — and out-earned the people inside.',
    tip: 'Neura confirms: the Palais was never where the leads were.',
  },
  {
    key: 'machine', name: 'ROI MACHINE',
    match: (m) => m.perf >= 2 && m.joie < 40,
    desc: 'Ruthless. Efficient. Joyless. You treated the world’s most glamorous festival like a sales floor with better lighting — and the numbers agree with you.',
    tip: 'Neura recommends: one (1) swim. As a treat.',
  },
  {
    key: 'cfofav', name: 'THE CFO’S FAVOURITE',
    match: (m) => m.perf >= 1.5,
    desc: 'Strong pipeline, defensible spend, receipts in order. Finance speaks of you warmly, which is deeply unsettling for everyone.',
    tip: 'Neura predicts: a bigger budget next year, and the curse that comes with it.',
  },
  {
    key: 'purist', name: 'PALAIS PURIST',
    match: (m) => m.hasPass && m.palaisVisits >= 3 && m.brand >= 40,
    desc: 'You actually attended the talks. All of them. You have notes. Nobody else has notes. The content was, you insist, "genuinely valuable".',
    tip: 'Neura has flagged you as a statistical anomaly.',
  },
  {
    key: 'tourist', name: 'THE TOURIST',
    match: (m) => m.joie >= 55 && m.perf < 0.5,
    desc: 'A wonderful week. Swimming, long dinners, drone shows, new friends. Almost no commercial activity of any kind. Your out-of-office said "networking".',
    tip: 'Neura has segmented this trip as "holiday" and respectfully suggests you tell payroll.',
  },
  {
    key: 'networker', name: 'THE CONNECTOR',
    match: (m) => m.network >= 70,
    desc: 'You know everyone now. Everyone knows you. The pipeline is decent, but the real asset is a phone full of first names that answer.',
    tip: 'Neura values your network at roughly 3x your pipeline. Collect accordingly.',
  },
  {
    key: 'respectable', name: 'MID-TABLE RESPECTABLE',
    match: () => true,
    desc: 'Solid leads, sensible spend, in bed by two most nights. You came back with pipeline, a tan and your dignity — which, by Cannes standards, is suspicious.',
    tip: 'Neura found nothing to flag, which has never happened before.',
  },
];

// Croissant scale — graded on perf*2 (perf 1.0 = par for your budget tier).
export const AWARDS = [
  { min: 6,   name: 'THE PLATINUM CROISSANT', icon: '🥐✨', line: 'A festival masterclass. They will study this trip.' },
  { min: 3.5, name: 'GOLDEN CROISSANT',       icon: '🥐🏆', line: 'Outstanding return. The CFO has printed the numbers and framed them.' },
  { min: 2,   name: 'SILVER CROISSANT',       icon: '🥐🥈', line: 'A genuinely good Cannes. Hold your head high at the airport.' },
  { min: 1,   name: 'BRONZE CROISSANT',       icon: '🥐🥉', line: 'You broke even-ish. In this town, that counts as discipline.' },
  { min: 0.4, name: 'DAY-OLD CROISSANT',      icon: '🥐😬', line: 'Some value. Some. The debrief deck will need its strongest adjectives.' },
  { min: 0,   name: 'BURNT CROISSANT',        icon: '🥐🔥', line: 'The trip cost more than it made by a distance. But what a distance it was.' },
];

export function pickSegment(metrics) {
  return SEGMENTS.find((s) => s.match(metrics));
}

export function pickAward(roi) {
  return AWARDS.find((a) => roi >= a.min) ?? AWARDS[AWARDS.length - 1];
}
