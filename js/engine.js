// Game engine: state, time, travel gates, actions, encounters, sleep, scoring.

import { clamp, rnd, chance, pick, pickWeighted, money } from './util.js';
import { TRIP_DAYS } from './data/spin.js';
import { VENUE_MAP, LEAD_POOL } from './data/venues.js';
import { ENCOUNTERS } from './data/encounters.js';
import { pickSegment, pickAward } from './data/segments.js';

export const DAY_END = 28;       // 4am hard stop
export const DEPART_HOUR = 12;   // departure-day noon checkout

export function newTrip(spin) {
  const s = {
    // fate
    budget: spin.budget, par: spin.par,
    flight: spin.flight, respun: spin.respun,
    arrivalIdx: spin.arrivalIdx, departureIdx: spin.departureIdx,
    digs: spin.digs, digsInfo: spin.digsInfo, hasPass: spin.hasPass,
    // wallet & pipeline
    spend: spin.flight.cost, drinkSpend: 0, leadValue: 0, leads: [],
    // meters
    brand: 5, network: 5, joie: 20, energy: 80, sleepDebt: 0,
    // clock & place
    dayIdx: spin.arrivalIdx, hour: 15, location: 'stroll',
    // badge saga
    badge: 'none', palaisFlagged: false,
    // bookkeeping
    flags: {}, onceFired: {}, dayFired: {}, visits: {}, collapsed: false,
    over: false, log: [],
  };
  return s;
}

export const cash = (s) => s.budget - s.spend;
export const dayInfo = (s) => TRIP_DAYS[s.dayIdx];
export const isFinalDay = (s) => s.dayIdx === s.departureIdx;

function netMult(s) { return 1 + s.network / 60; }
function energyFactor(s) { return s.energy >= 60 ? 1 : s.energy >= 30 ? 0.85 : 0.6; }
function debtFactor(s) { return Math.max(0.5, 1 - 0.07 * s.sleepDebt); }
// Arriving on a shoestring makes whales harder to land — mild, not fatal.
function credFactor(s) { return 0.6 + 0.4 * Math.min(1, s.budget / 250_000); }

function makeApi(s) {
  return {
    stat(name, d) {
      if (name === 'energy') s.energy = clamp(s.energy + d, 0, 100);
      else s[name] = clamp(s[name] + d, 0, 100);
    },
    spend(amt, opts = {}) {
      s.spend += amt;
      if (opts.drink) s.drinkSpend += amt;
    },
    time(n) { s.hour += n; s.energy = clamp(s.energy - 2 * n, 0, 100); },
    flag(k) { s.flags[k] = true; },
    lead(base, mult = 1) {
      const raw = base * mult * netMult(s) * energyFactor(s) * debtFactor(s) * credFactor(s) * rnd(0.75, 1.4);
      const value = Math.max(5000, Math.round(raw / 1000) * 1000);
      const [title, co] = pick(LEAD_POOL);
      const lead = { name: `${title} of ${co}`, title, co, value, valueText: money(value) };
      s.leads.push(lead);
      s.leadValue += value;
      return lead;
    },
  };
}

const rngApi = { chance, pick, rnd };

export function addLog(s, text, cls = '') {
  s.log.push({ day: dayInfo(s).name, hour: s.hour, text, cls });
}

// ---- clock --------------------------------------------------------------

function advance(s, n = 1) {
  s.hour += n;
  s.energy = clamp(s.energy - 2 * n, 0, 100);
}

// Returns 'collapse' | 'forcedNight' | 'depart' | null after any time passes.
export function checkClock(s) {
  if (isFinalDay(s) && s.hour >= DEPART_HOUR) return 'depart';
  if (s.energy <= 0 && !s.over) return 'collapse';
  if (s.hour >= DAY_END) return 'forcedNight';
  return null;
}

// ---- travel & gates ------------------------------------------------------

// Returns { ok, gate?, text? }. Gate types are resolved by the UI via the
// follow-up functions below.
export function travel(s, key) {
  advance(s, 1);
  const v = VENUE_MAP[key];

  if (key === 'palais') {
    if (!s.hasPass && s.badge !== 'borrowed') {
      if (s.badge === 'kept' && !s.flags.badgeTried) return { ok: false, gate: 'badgeScan' };
      return { ok: false, gate: 'noPass' };
    }
  }
  if (key === 'yachtrow') {
    const aboard = s.digs === 'yacht' || s.network >= 40 || chance(0.45);
    if (!aboard) {
      s.location = 'stroll';
      s.joie = clamp(s.joie - 2, 0, 100);
      addLog(s, 'Yacht-blocked. A clipboard reviews you, finds you wanting, and suggests "the public beach is lovely". You retreat along the boardwalk.', 'bad');
      return { ok: false, text: 'yachtblocked' };
    }
  }

  s.location = key;
  s.visits[key] = (s.visits[key] || 0) + 1;
  addLog(s, `→ ${v.name}`, 'move');
  return { ok: true };
}

// Henrik's badge meets the scanner. 50/50.
export function resolveBadgeScan(s) {
  s.flags.badgeTried = true;
  if (chance(0.5)) {
    s.badge = 'borrowed';
    s.location = 'palais';
    s.visits.palais = (s.visits.palais || 0) + 1;
    const text = 'The scanner beeps green. "Welcome back, Henrik." You ARE Henrik. The Palais opens before you like a laminated Narnia — full access for the rest of the trip.';
    addLog(s, text, 'good');
    return { ok: true, text };
  }
  s.badge = 'burned';
  s.palaisFlagged = true;
  advance(s, 2);
  s.brand = clamp(s.brand - 8, 0, 100);
  let text = 'The scanner flashes red. Henrik, it turns out, reported his badge missing — and Henrik is 5\'4". Two hours in a windowless room explaining yourself to festival security, who have heard it all and enjoyed none of it. You are now flagged at every Palais entrance.';
  if (chance(0.3)) {
    s.flags.bossHeard = true;
    text += ' Worse: someone from your industry WhatsApp group was in the queue behind you. Your boss knows by lunchtime.';
    s.brand = clamp(s.brand - 4, 0, 100);
  }
  addLog(s, text, 'bad');
  return { ok: false, text };
}

// The confident walk past security. Rarely works. Gloriously.
export function attemptConfidentWalk(s) {
  if (!s.palaisFlagged && chance(0.12)) {
    s.flags.sneakDay = s.dayIdx;
    s.location = 'palais';
    s.visits.palais = (s.visits.palais || 0) + 1;
    const text = 'You attach yourself to a passing group of Brazilian creatives mid-anecdote and sweep through security on pure momentum. You have until tonight. Walk like you belong, because today you do.';
    addLog(s, text, 'good');
    return { ok: true, text };
  }
  s.joie = clamp(s.joie - 2, 0, 100);
  const text = s.palaisFlagged
    ? 'The security guard recognises you before you finish your first confident stride. "Monsieur." Just that. Just "Monsieur." You about-face with whatever dignity remains on your person.'
    : 'You deploy the confident walk. Security deploys the outstretched arm. "Badge?" The single most expensive word in advertising. You rejoin the badgeless masses.';
  addLog(s, text, 'bad');
  return { ok: false, text };
}

// Palais access evaporates at day's end for sneaks.
function expireSneak(s) {
  if (s.flags.sneakDay !== undefined && s.location === 'palais') s.location = 'stroll';
  delete s.flags.sneakDay;
}

// ---- actions ---------------------------------------------------------------

export function availableActions(s) {
  const v = VENUE_MAP[s.location];
  if (!v) return [];
  return v.actions.map((a) => {
    const open = a.open ?? v.open;
    const hourOk = s.hour >= open[0] && s.hour <= Math.min(open[1], DAY_END - 1);
    const cashOk = cash(s) >= (a.cost || 0);
    const onceOk = !a.oncePerDay || s.dayFired[`${s.dayIdx}:${v.key}:${a.key}`] !== true;
    return { ...a, enabled: hourOk && cashOk && onceOk, hourOk, cashOk, onceOk };
  });
}

export function act(s, actionKey) {
  const v = VENUE_MAP[s.location];
  const a = v.actions.find((x) => x.key === actionKey);
  const api = makeApi(s);
  if (a.cost) api.spend(a.cost, { drink: !!a.drink });
  advance(s, 1);
  if (a.oncePerDay) s.dayFired[`${s.dayIdx}:${v.key}:${a.key}`] = true;
  const text = a.run({ s, api, rng: rngApi });
  addLog(s, text, 'act');
  return { text, encounter: rollEncounter(s) };
}

// ---- encounters --------------------------------------------------------------

export function rollEncounter(s) {
  const v = VENUE_MAP[s.location];
  if (!v || s.over) return null;
  let p = v.encChance + 0.05 * s.sleepDebt + (s.hour >= 23 ? 0.08 : 0);
  p = Math.min(0.7, p);
  if (!chance(p)) return null;

  const pool = ENCOUNTERS.filter((e) => {
    if (!e.weight) return false;
    if (e.once && s.onceFired[e.id]) return false;
    if (e.where && !e.where.includes(s.location)) return false;
    if (e.when && (s.hour < e.when[0] || s.hour > e.when[1])) return false;
    if (e.cond && !e.cond(s)) return false;
    return true;
  });
  if (!pool.length) return null;

  const badBias = 1 + 0.3 * s.sleepDebt + (s.hour >= 24 ? 0.4 : 0);
  const enc = pickWeighted(pool, (e) =>
    e.weight * (e.tone === 'bad' ? badBias : e.tone === 'good' && s.sleepDebt >= 3 ? 0.7 : 1));
  return enc;
}

export function resolveEncounter(s, enc, optionIdx) {
  if (enc.once) s.onceFired[enc.id] = true;
  const api = makeApi(s);
  const text = enc.options[optionIdx].run({ s, api, rng: rngApi });
  addLog(s, `${enc.title}: ${text}`, 'enc');
  return text;
}

// ---- nights ---------------------------------------------------------------------

// Returns { missedTrain } — if true, UI must call finishNight with a choice.
export function startNight(s, { forced = false } = {}) {
  expireSneak(s);
  s.flags.gutterNight = s.hour >= 25; // out past 1am = fair game for the morning CEO call
  if (forced) addLog(s, 'The lights come up. A man with a mop looks at you with something close to compassion. 4am calls it, even if you don’t.', 'sys');
  if (s.digs === 'antibes' && s.hour >= 25) return { missedTrain: true };
  return { missedTrain: false };
}

// choice: 'taxi' | 'beach' | null (made the train / not applicable)
export function finishNight(s, choice = null) {
  const bedHour = s.hour;
  const nextStart = s.digsInfo.startHour;
  let slept = 24 + nextStart - bedHour;

  let nightText = '';
  if (choice === 'taxi') {
    s.spend += 120;
    nightText = 'A €120 taxi along a dark coast road, the driver’s playlist an unbroken hour of saxophone. Home. Bed. Salvation.';
  } else if (choice === 'beach') {
    slept = Math.min(slept, 4);
    s.sleepDebt += 1;
    s.joie = clamp(s.joie + 3, 0, 100);
    nightText = 'You sleep on the beach under a borrowed deckchair cushion. The sunrise over the bay is genuinely magnificent. The crick in your neck is genuinely permanent.';
  }

  if (slept < 7) s.sleepDebt += Math.round(7 - slept) * 0.5 + 0.5;
  if (slept >= 9) s.sleepDebt = Math.max(0, s.sleepDebt - 1);
  s.sleepDebt = Math.round(s.sleepDebt * 2) / 2;

  let recovery = slept * 9;
  if (s.digsInfo.sleepBonus) { recovery += 6; s.sleepDebt = Math.max(0, s.sleepDebt - 0.5); }
  if (choice === 'beach') recovery = slept * 5;
  s.energy = clamp(s.energy + recovery, 0, 100);

  s.dayIdx += 1;
  s.hour = nextStart;
  s.location = 'stroll';
  s.dayFired = {};
  // gutterNight stays set through the morning (CEO-call window); next
  // startNight() overwrites it.

  const d = dayInfo(s);
  addLog(s, `— ${d.name} ${d.date} — ${slept <= 4 ? 'You wake feeling like a press release: technically fine.' : slept >= 9 ? 'You wake almost suspiciously refreshed.' : 'You wake. That will have to do.'}${isFinalDay(s) ? ' Checkout is at noon. Last chances only.' : ''}`, 'day');
  return { slept, nightText };
}

export function collapse(s) {
  s.collapsed = true;
  expireSneak(s);
  const text = 'Your body, having submitted several unanswered complaints, escalates to a full shutdown. You wake up fourteen hours later in your own bed with no memory of getting there and a kebab of unknown provenance on the nightstand.';
  addLog(s, text, 'bad');
  s.hour = Math.max(s.hour, 24);
  const res = finishNight(s, null);
  s.energy = 55;
  s.flags.gutterNight = false;
  return { text, ...res };
}

// ---- scoring -----------------------------------------------------------------

export function metrics(s) {
  const roi = s.spend > 0 ? s.leadValue / s.spend : 0;
  const perf = roi / s.par;
  return {
    roi, perf, budget: s.budget, spend: s.spend, leadValue: s.leadValue,
    leadCount: s.leads.length, drinkSpend: s.drinkSpend,
    brand: s.brand, network: s.network, joie: s.joie,
    hasPass: s.hasPass, collapsed: s.collapsed,
    gutterVisits: s.visits.gutter || 0,
    yachtVisits: s.visits.yachtrow || 0,
    palaisVisits: s.visits.palais || 0,
  };
}

export function finalReport(s) {
  s.over = true;
  const m = metrics(s);
  const segment = pickSegment(m);
  // Award is graded against par for the budget tier, not raw ROI —
  // a $5k trip and a $2.5M trip compete fairly.
  const award = pickAward(m.perf * 2); // perf 1.0 (par) lands Silver
  return { m, segment, award };
}
