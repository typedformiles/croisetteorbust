// The Trip — map, HUD, a focused venue sheet, encounters, nights.
//
// Interaction model: tapping a place opens a venue SHEET (bottom-sheet on
// mobile, floating card on desktop). If you're not there it offers
// "Travel here"; once there it lists the venue's actions and shows each
// outcome inline, on-screen, the moment it happens. The log below is a
// scrollable history, no longer the primary feedback channel.
//
// Resolution order is explicit: the thing you click (travel or an action)
// resolves and shows its outcome FIRST; only then does a random encounter
// fire, as its own modal step.

import { money, hourLabel, esc } from '../util.js';
import { modal, toast } from '../ui.js';
import { renderMap, updateMap } from '../map.js';
import { VENUE_MAP } from '../data/venues.js';
import {
  cash, roiOf, dayInfo, isFinalDay, availableActions, act, travel, rollEncounter,
  resolveEncounter, resolveBadgeScan, attemptConfidentWalk, startNight,
  finishNight, collapse, checkClock, addLog, rollMishap, DAY_END,
} from '../engine.js';

export function tripScreen(root, s, { onEnd }) {
  let busy = false;
  let sheetKey = null;     // venue currently shown in the sheet, or null
  let sheetOutcome = null; // { text, cls } shown prominently in the open sheet

  root.innerHTML = `
    <div class="screen trip-screen">
      <header class="hud">
        <div class="hud-left">
          <span class="hud-day pixel-h" id="hud-day"></span>
          <span class="hud-zzz" id="hud-zzz" title="sleep debt"></span>
        </div>
        <div class="hud-mid">
          <div class="hud-stat"><label>CASH</label><b id="hud-cash"></b></div>
          <div class="hud-stat"><label>PIPELINE</label><b id="hud-pipe"></b></div>
          <div class="hud-stat roi"><label>ROI</label><b id="hud-roi"></b></div>
        </div>
        <div class="hud-meters">
          <div class="meter"><label>ENERGY</label><div class="bar"><i id="m-energy"></i></div></div>
          <div class="meter"><label>NETWORK</label><div class="bar net"><i id="m-network"></i></div></div>
          <div class="meter"><label>BRAND</label><div class="bar brand"><i id="m-brand"></i></div></div>
          <div class="meter"><label>JOIE</label><div class="bar joie"><i id="m-joie"></i></div></div>
        </div>
      </header>

      <div class="map-wrap" id="map-wrap"></div>

      <div class="trip-bar">
        <span class="tb-hint" id="tb-hint">Tap a place on the map to go there.</span>
        <div class="tb-controls">
          <button class="btn night" id="btn-night">🛏 CALL IT A NIGHT</button>
          <button class="btn gold" id="btn-airport" hidden>✈ TO THE AIRPORT</button>
        </div>
      </div>

      <details class="logwrap" id="logwrap">
        <summary>Trip log</summary>
        <section class="logfeed" id="logfeed"></section>
      </details>

      <!-- venue sheet -->
      <div class="venue-sheet" id="sheet" hidden>
        <div class="vs-scrim" id="vs-scrim"></div>
        <div class="vs-card">
          <button class="vs-close" id="vs-close" aria-label="Close">✕</button>
          <h3 class="vs-name pixel-h" id="vs-name"></h3>
          <p class="vs-blurb" id="vs-blurb"></p>
          <div class="vs-outcome" id="vs-outcome" hidden></div>
          <div class="vs-body" id="vs-body"></div>
        </div>
      </div>
    </div>`;

  renderMap(root.querySelector('#map-wrap'));

  const $ = (sel) => root.querySelector(sel);

  // ---- HUD / map / log ----

  function render() {
    const d = dayInfo(s);
    $('#hud-day').textContent = `${d.name} · ${hourLabel(s.hour)}`;
    $('#hud-zzz').textContent = s.sleepDebt >= 1 ? '💤'.repeat(Math.min(4, Math.ceil(s.sleepDebt))) : '';
    $('#hud-cash').textContent = money(cash(s));
    $('#hud-pipe').textContent = money(s.leadValue);
    const roi = roiOf(s);
    $('#hud-roi').textContent = `${roi >= 10 ? Math.round(roi) : roi.toFixed(1)}x`;
    $('#m-energy').style.width = s.energy + '%';
    $('#m-energy').parentElement.classList.toggle('low', s.energy < 30);
    $('#m-network').style.width = s.network + '%';
    $('#m-brand').style.width = s.brand + '%';
    $('#m-joie').style.width = s.joie + '%';

    $('#tb-hint').textContent = `📍 You're at ${VENUE_MAP[s.location].name}. Tap a place to go there.`;
    $('#btn-night').hidden = isFinalDay(s);
    $('#btn-airport').hidden = !isFinalDay(s);

    const feed = $('#logfeed');
    feed.innerHTML = s.log.slice(-40).map((l) =>
      `<p class="log ${l.cls}"><span class="log-t">${l.day} ${hourLabel(l.hour)}</span> ${esc(l.text)}</p>`).reverse().join('');

    updateMap(s, DAY_END);
  }

  // ---- venue sheet ----

  function venueOpenAt(v, hour) {
    return hour >= v.open[0] && hour <= Math.min(v.open[1], DAY_END - 1);
  }

  function openSheet(key, outcome = null) {
    sheetKey = key;
    if (outcome) sheetOutcome = outcome;
    renderSheet();
    $('#sheet').hidden = false;
  }

  function closeSheet() {
    sheetKey = null; sheetOutcome = null;
    $('#sheet').hidden = true;
  }

  function renderSheet() {
    if (!sheetKey) return;
    const v = VENUE_MAP[sheetKey];
    const here = sheetKey === s.location;
    $('#vs-name').textContent = v.name;
    $('#vs-blurb').textContent = v.blurb;

    const outEl = $('#vs-outcome');
    if (sheetOutcome) {
      outEl.hidden = false;
      outEl.className = `vs-outcome ${sheetOutcome.cls || ''}`;
      outEl.textContent = sheetOutcome.text;
    } else {
      outEl.hidden = true;
    }

    const body = $('#vs-body');
    if (here) {
      // action list for the venue you're at
      const acts = availableActions(s);
      body.innerHTML = acts.map((a, i) => `
        <button class="btn action" data-i="${i}" ${a.enabled ? '' : 'disabled'}>
          <span class="a-label">${esc(a.label)}</span>
          <span class="a-meta">${a.cost ? money(a.cost) : 'free'} · 1h${!a.hourOk ? ' · not now' : ''}${!a.cashOk ? ' · can’t afford' : ''}${!a.onceOk ? ' · done today' : ''}</span>
          <span class="a-desc">${esc(a.desc)}</span>
        </button>`).join('')
        + `<button class="btn ghost vs-leave" id="vs-leave">← Back to the map</button>`;
      body.querySelectorAll('.btn.action').forEach((b) =>
        b.addEventListener('click', () => onAct(acts[Number(b.dataset.i)])));
      body.querySelector('#vs-leave').addEventListener('click', closeSheet);
    } else {
      // travel prospect
      const arriveHour = s.hour + 1;
      const openOnArrival = venueOpenAt(v, arriveHour);
      if (openOnArrival) {
        body.innerHTML = `
          <button class="btn gold vs-travel" id="vs-travel">
            <span class="a-label">Travel here</span>
            <span class="a-meta">costs 1 hour</span>
          </button>
          <button class="btn ghost vs-leave" id="vs-leave">Cancel</button>`;
        body.querySelector('#vs-travel').addEventListener('click', () => onTravel(sheetKey));
      } else {
        body.innerHTML = `
          <p class="vs-closed">Closed right now — opens ${hourLabel(v.open[0])}.</p>
          <button class="btn ghost vs-leave" id="vs-leave">Cancel</button>`;
      }
      body.querySelector('#vs-leave').addEventListener('click', closeSheet);
    }
  }

  function setOutcome(text, cls = '') {
    sheetOutcome = { text, cls };
    if (sheetKey) renderSheet();
  }

  // ---- flows ----

  async function maybeEncounter(enc) {
    if (!enc) return;
    const idx = await modal({
      kicker: 'A WILD ENCOUNTER', title: enc.title,
      body: `<p>${esc(typeof enc.text === 'function' ? enc.text(s) : enc.text)}</p>`,
      options: enc.options.map((o) => {
        const broke = o.cost && o.cost > cash(s);
        return { label: o.label, disabled: broke, sub: broke ? 'you cannot afford this' : undefined };
      }),
      cls: 'encounter',
    });
    const text = resolveEncounter(s, enc, idx);
    render();
    await modal({ kicker: enc.title, title: '…', body: `<p>${esc(text)}</p>`, options: [{ label: 'Continue' }], cls: 'outcome' });
  }

  async function maybeMishap() {
    const m = rollMishap(s);
    if (!m) return;
    render();
    await modal({
      kicker: 'RUNNING ON EMPTY', title: m.title,
      body: `<p>${esc(m.text)}</p>`, options: [{ label: 'Ugh.' }], cls: 'bad',
    });
  }

  // returns true if the trip ended
  async function postMove() {
    render();
    const c = checkClock(s);
    if (c === 'depart') { endTrip('Noon on departure day. A taxi, an airport, a window seat, a feeling.'); return true; }
    if (c === 'collapse') {
      const r = collapse(s);
      closeSheet();
      await modal({ kicker: 'SYSTEM FAILURE', title: 'Lights Out', body: `<p>${esc(r.text)}</p>`, options: [{ label: 'Ow.' }], cls: 'bad' });
      if (s.dayIdx > s.departureIdx) { endTrip('You technically missed your flight. The airline, for a fee that haunts you, found another.'); return true; }
      render();
      return false;
    }
    if (c === 'forcedNight') { await doNight(true); return s.over; }
    return false;
  }

  async function onTravel(key) {
    if (busy || s.over) return;
    busy = true;
    const v = VENUE_MAP[key];
    const res = travel(s, key); // advances 1h, sets location or returns a gate

    let arrived = res.ok;
    if (res.gate === 'badgeScan') {
      const choice = await modal({
        kicker: 'THE PALAIS', title: 'Henrik’s Moment of Truth',
        body: '<p>The badge scanners loom. Henrik’s laminated face dangles against your chest. The security guard is already reaching out an expectant hand. Last chance to walk away.</p>',
        options: [{ label: 'Scan it. You ARE Henrik.' }, { label: 'Abort. Walk past casually.' }],
      });
      if (choice === 0) {
        const r = resolveBadgeScan(s);
        render();
        await modal({ kicker: 'THE SCANNER', title: r.ok ? 'Green Light' : 'Red Light', body: `<p>${esc(r.text)}</p>`, options: [{ label: r.ok ? 'Welcome back, Henrik' : 'A windowless room' }], cls: r.ok ? 'good' : 'bad' });
        arrived = r.ok;
      } else {
        addLog(s, 'You veer off at the last second and inspect a palm tree with great interest. Henrik lives to scan another day.', 'sys');
        arrived = false;
      }
    } else if (res.gate === 'noPass') {
      const choice = await modal({
        kicker: 'THE PALAIS', title: 'No Badge, No Entry',
        body: `<p>${s.palaisFlagged
          ? 'The security team know your face now. One of them gives you a small, almost affectionate shake of the head from thirty metres.'
          : 'The scanners stand between you and the official festival. You have no badge. The staff have seen every trick ever attempted, and rated them.'}</p>`,
        options: s.palaisFlagged
          ? [{ label: 'Accept your exile' }]
          : [{ label: 'Try the confident walk', sub: 'long odds, eternal glory' }, { label: 'Leave it — the fringe is free' }],
      });
      if (!s.palaisFlagged && choice === 0) {
        const r = attemptConfidentWalk(s);
        render();
        await modal({ kicker: 'SECURITY', title: r.ok ? 'In.' : 'Denied.', body: `<p>${esc(r.text)}</p>`, options: [{ label: 'Continue' }], cls: r.ok ? 'good' : 'bad' });
        arrived = r.ok;
      } else {
        addLog(s, 'You admire the Palais from a respectful, badgeless distance.', 'sys');
        arrived = false;
      }
    } else if (res.text === 'yachtblocked') {
      arrived = false;
      render();
      await modal({
        kicker: 'YACHT ROW', title: 'Yacht-Blocked',
        body: '<p>A clipboard reviews you, finds you wanting, and suggests "the public beach is lovely" — at gangway volume, in front of a deck party that briefly stops to enjoy it. You retreat along the boardwalk.</p>',
        options: [{ label: 'The indignity' }], cls: 'bad',
      });
    }

    render();

    if (arrived) {
      // 1) the click resolves first: you're here.
      openSheet(s.location, { text: `You make your way over to ${VENUE_MAP[s.location].name}.`, cls: 'arrive' });
      // 2) then a random encounter may fire.
      await maybeEncounter(rollEncounter(s));
      await maybeMishap();
      const ended = await postMove();
      if (!ended) { sheetKey = s.location; renderSheet(); render(); }
    } else {
      // didn't get in — show what happened, stay put
      closeSheet();
      await maybeMishap();
      await postMove();
    }
    busy = false;
  }

  async function onAct(action) {
    if (busy || s.over || !action.enabled) return;
    busy = true;
    const { text, encounter } = act(s, action.key);
    // 1) the action you clicked resolves and is shown, in view, first.
    setOutcome(text, 'act');
    render();
    // 2) then a random encounter, if any, as its own step.
    await maybeEncounter(encounter);
    await maybeMishap();
    const ended = await postMove();
    if (!ended && sheetKey) renderSheet();
    busy = false;
  }

  async function doNight(forced = false) {
    closeSheet();
    const { missedTrain } = startNight(s, { forced });
    let choice = null;
    if (missedTrain) {
      const i = await modal({
        kicker: 'GARE DE CANNES', title: 'The Last Train Left at 00:50',
        body: '<p>The departures board is a wall of red CANCELLED and one mocking SERVICE TERMINÉ. Antibes might as well be Marseille. A lone taxi idles outside, its driver already doing the maths on your desperation.</p>',
        options: [
          { label: 'Pay the €160 taxi', sub: 'sleep is an investment' },
          { label: 'Sleep on the beach', sub: 'free. spiritually expensive' },
        ],
      });
      choice = i === 0 ? 'taxi' : 'beach';
    }
    const { slept, nightText } = finishNight(s, choice);
    if (s.dayIdx > s.departureIdx) return endTrip('The trip ends as all Cannes trips end: abruptly, at an airport, squinting.');
    const d = dayInfo(s);
    await modal({
      kicker: 'A NEW DAY', title: `${d.name} ${d.date}`,
      body: `<p>${nightText ? esc(nightText) + ' ' : ''}You got ${Math.max(0, Math.round(slept))} hours of sleep.${s.sleepDebt >= 2 ? ' The sleep debt is becoming structural — bad things find tired people.' : ''}${isFinalDay(s) ? ' <b>Checkout is at noon.</b> Make the morning count.' : ''}</p>`,
      options: [{ label: 'Allez.' }],
    });
    render();
  }

  function endTrip(text) {
    addLog(s, text, 'sys');
    onEnd();
  }

  // ---- sponsor ----

  async function showSponsorPitch() {
    const i = await modal({
      kicker: 'PRIME HILLSIDE · AVAILABLE NOW', title: 'Own the Hills',
      body: `<p>The villa-party hills above Cannes — where the real deals happen, behind gates, out of sight — could carry YOUR brand for the festival. Your logo on the hillside. A branded in-game day. Custom encounters starring your brand, while your competitor gets mysteriously yacht-blocked.</p>
             <p>The highest-altitude ad placement in advertising.</p>
             <p class="sponsor-email">Enquiries, serious and otherwise:<br>
             <a href="mailto:tim@neuralift.ai?subject=${encodeURIComponent('Sponsoring the hills in Croisette or Bust 🥐')}"><b>tim@neuralift.ai</b></a></p>`,
      options: [{ label: '📋 Copy the email address' }, { label: 'Back to the Croisette' }],
    });
    if (i === 0) {
      try { await navigator.clipboard.writeText('tim@neuralift.ai'); toast('tim@neuralift.ai copied — we await your logo.'); }
      catch { toast('Copy blocked — it’s tim@neuralift.ai'); }
    }
  }

  // ---- wire up ----

  function onVenueTap(key) {
    if (busy || s.over) return;
    sheetOutcome = null;
    openSheet(key);
  }

  $('#map-wrap').addEventListener('click', (e) => {
    if (e.target.closest('.sponsor-spot')) { showSponsorPitch(); return; }
    const g = e.target.closest('.hotspot');
    if (g) onVenueTap(g.dataset.venue);
  });
  $('#vs-close').addEventListener('click', closeSheet);
  $('#vs-scrim').addEventListener('click', closeSheet);
  $('#btn-night').addEventListener('click', () => { if (!busy && !s.over) doNight(false); });
  $('#btn-airport').addEventListener('click', async () => {
    if (busy || s.over) return;
    const i = await modal({
      kicker: 'DEPARTURE DAY', title: 'Leave Early?',
      body: '<p>You could squeeze in one more hour of hustle… or get ahead of the airport scrum with your dignity and your duty-free intact.</p>',
      options: [{ label: 'Go now. It’s done.' }, { label: 'One more hour' }],
    });
    if (i === 0) endTrip('You leave on your own terms — the rarest Cannes exit of all.');
  });

  // arrival interstitial → then open the starting venue so first-timers see what to do
  render();
  (async () => {
    const d = dayInfo(s);
    await modal({
      kicker: `${d.name} ${d.date} · 3PM`, title: 'Bienvenue à Cannes',
      body: `${s.company ? `<p><b>${esc(s.company)}</b></p>` : ''}
             <p>You land via ${esc(s.flight.label)} and step into the Riviera heat. Home for the week: ${esc(s.digsInfo.name)}. ${esc(s.digsInfo.flavour)}</p>
             <p>${s.hasPass ? 'Your delegate badge swings proudly from your neck.' : 'You have no badge — the Palais is enemy territory. Everything else is fair game.'}
             The Croisette glitters. Pipeline awaits. ${money(cash(s))} to play with.</p>
             <p class="how-hint">Tap any place on the map to travel there or take actions. Watch the clock — and your energy.</p>`,
      options: [{ label: 'Let’s build some ROI' }],
    });
    addLog(s, `Touched down in Cannes. ${money(cash(s))} in the war chest, ${s.departureIdx - s.dayIdx} nights to make it count.`, 'day');
    render();
    openSheet(s.location, { text: `You start on the Croisette. Tap an action below, or close this and pick a place on the map.`, cls: 'arrive' });
  })();
}
