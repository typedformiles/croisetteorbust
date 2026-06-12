// Headless balance simulator — plays N random games through the real engine.
// Run: node tools/sim.mjs [N]

import { pickWeighted, pick, chance } from '../js/util.js';
import {
  BUDGET_REEL, ARRIVAL_REEL, DEPARTURE_REEL, DIGS_REEL, PASS_REEL,
  OWN_YACHT_DIGS,
} from '../js/data/spin.js';
import { VENUES, VENUE_MAP } from '../js/data/venues.js';
import {
  newTrip, travel, act, availableActions, rollEncounter, resolveEncounter,
  resolveBadgeScan, attemptConfidentWalk, startNight, finishNight, collapse,
  checkClock, finalReport, rollMishap, DAY_END,
} from '../js/engine.js';

function randomSpin() {
  const b = pickWeighted(BUDGET_REEL);
  const digs = b.jackpot ? OWN_YACHT_DIGS : pickWeighted(DIGS_REEL);
  return {
    budget: b.value, par: b.par, flight: b.flight,
    arrivalIdx: pickWeighted(ARRIVAL_REEL).value,
    departureIdx: pickWeighted(DEPARTURE_REEL).value,
    digs: digs.value, digsInfo: digs,
    hasPass: pickWeighted(PASS_REEL).value, respun: false,
  };
}

function handleEncounter(s, enc) {
  if (!enc) return;
  const affordable = enc.options
    .map((o, i) => ({ o, i }))
    .filter(({ o }) => !o.cost || o.cost <= s.budget - s.spend);
  if (!affordable.length) return;
  resolveEncounter(s, enc, pick(affordable).i);
}

function playOne() {
  const s = newTrip(randomSpin());
  let guard = 0;
  while (!s.over && guard++ < 500) {
    const clock = checkClock(s);
    if (clock === 'depart') break;
    if (clock === 'collapse') {
      collapse(s);
      if (s.dayIdx > s.departureIdx) break;
      continue;
    }
    if (clock === 'forcedNight') {
      const { missedTrain } = startNight(s, { forced: true });
      finishNight(s, missedTrain ? (chance(0.5) ? 'taxi' : 'beach') : null);
      if (s.dayIdx > s.departureIdx) break;
      continue;
    }
    // bedtime policy: increasingly likely after midnight
    if (s.hour >= 23 && chance((s.hour - 22) * 0.25) && s.dayIdx !== s.departureIdx) {
      const { missedTrain } = startNight(s, {});
      finishNight(s, missedTrain ? (chance(0.5) ? 'taxi' : 'beach') : null);
      if (s.dayIdx > s.departureIdx) break;
      continue;
    }
    const acts = availableActions(s).filter((a) => a.enabled);
    if (acts.length && chance(0.62)) {
      const { encounter } = act(s, pick(acts).key);
      handleEncounter(s, encounter);
      rollMishap(s);
    } else {
      const open = VENUES.filter((v) =>
        v.key !== s.location && s.hour + 1 >= v.open[0] && s.hour + 1 <= Math.min(v.open[1], DAY_END - 1));
      if (!open.length) { s.hour += 1; continue; }
      const res = travel(s, pick(open).key);
      if (res.gate === 'badgeScan') { if (chance(0.7)) resolveBadgeScan(s); }
      else if (res.gate === 'noPass') { if (chance(0.4)) attemptConfidentWalk(s); }
      else if (res.ok) handleEncounter(s, rollEncounter(s));
      rollMishap(s);
    }
  }
  if (guard >= 500) throw new Error('runaway game loop');
  return finalReport(s);
}

const N = Number(process.argv[2] || 400);
const byTier = {}, awards = {}, segments = {};
let fails = 0;
for (let i = 0; i < N; i++) {
  try {
    const { m, segment, award } = playOne();
    const tier = m.budget;
    (byTier[tier] ??= []).push(m);
    awards[award.name] = (awards[award.name] || 0) + 1;
    segments[segment.name] = (segments[segment.name] || 0) + 1;
  } catch (e) {
    fails++;
    if (fails === 1) console.error('FIRST FAILURE:', e);
  }
}

const fmt = (n) => Math.round(n * 100) / 100;
console.log(`\n${N} games, ${fails} failures\n`);
console.log('tier        n    avgROI  avgPerf  avgLeads  avgSpend');
for (const tier of Object.keys(byTier).map(Number).sort((a, b) => a - b)) {
  const ms = byTier[tier];
  const avg = (f) => ms.reduce((a, m) => a + f(m), 0) / ms.length;
  console.log(
    `$${String(tier).padEnd(9)} ${String(ms.length).padEnd(4)} ${String(fmt(avg((m) => m.roi))).padEnd(7)} ${String(fmt(avg((m) => m.perf))).padEnd(8)} ${String(fmt(avg((m) => m.leadCount))).padEnd(9)} ${fmt(avg((m) => m.spend))}`);
}
console.log('\nAwards:'); Object.entries(awards).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
console.log('\nSegments:'); Object.entries(segments).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
