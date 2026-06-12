// The Trip — map, HUD, actions, encounters, nights.

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

      <div class="trip-main">
        <div class="map-wrap" id="map-wrap"></div>
        <aside class="panel">
          <div class="venue-head">
            <h3 id="v-name" class="pixel-h"></h3>
            <p id="v-blurb"></p>
          </div>
          <div class="actions" id="v-actions"></div>
          <div class="night-row">
            <button class="btn night" id="btn-night">🛏 CALL IT A NIGHT</button>
            <button class="btn gold" id="btn-airport" hidden>✈ TO THE AIRPORT</button>
          </div>
        </aside>
      </div>

      <section class="logfeed" id="logfeed"></section>
    </div>`;

  renderMap(root.querySelector('#map-wrap'));

  // ---- rendering ----

  function render() {
    const d = dayInfo(s);
    root.querySelector('#hud-day').textContent = `${d.name} · ${hourLabel(s.hour)}`;
    root.querySelector('#hud-zzz').textContent = s.sleepDebt >= 1 ? '💤'.repeat(Math.min(4, Math.ceil(s.sleepDebt))) : '';
    root.querySelector('#hud-cash').textContent = money(cash(s));
    root.querySelector('#hud-pipe').textContent = money(s.leadValue);
    const roi = roiOf(s);
    root.querySelector('#hud-roi').textContent = `${roi >= 10 ? Math.round(roi) : roi.toFixed(1)}x`;
    root.querySelector('#m-energy').style.width = s.energy + '%';
    root.querySelector('#m-energy').parentElement.classList.toggle('low', s.energy < 30);
    root.querySelector('#m-network').style.width = s.network + '%';
    root.querySelector('#m-brand').style.width = s.brand + '%';
    root.querySelector('#m-joie').style.width = s.joie + '%';

    const v = VENUE_MAP[s.location];
    root.querySelector('#v-name').textContent = v.name;
    root.querySelector('#v-blurb').textContent = v.blurb;

    const acts = availableActions(s);
    root.querySelector('#v-actions').innerHTML = acts.map((a, i) => `
      <button class="btn action" data-i="${i}" ${a.enabled ? '' : 'disabled'}>
        <span class="a-label">${esc(a.label)}</span>
        <span class="a-meta">${a.cost ? money(a.cost) : 'free'} · 1h${!a.hourOk ? ' · not now' : ''}${!a.cashOk ? ' · can’t afford' : ''}${!a.onceOk ? ' · done today' : ''}</span>
        <span class="a-desc">${esc(a.desc)}</span>
      </button>`).join('');
    root.querySelectorAll('.btn.action').forEach((b) =>
      b.addEventListener('click', () => onAct(acts[Number(b.dataset.i)])));

    root.querySelector('#btn-night').hidden = isFinalDay(s);
    root.querySelector('#btn-airport').hidden = !isFinalDay(s);

    const feed = root.querySelector('#logfeed');
    feed.innerHTML = s.log.slice(-40).map((l) =>
      `<p class="log ${l.cls}"><span class="log-t">${l.day} ${hourLabel(l.hour)}</span> ${esc(l.text)}</p>`).reverse().join('');

    updateMap(s, DAY_END);
  }

  // ---- flows ----

  async function maybeEncounter(enc) {
    if (!enc) return;
    const idx = await modal({
      kicker: 'ENCOUNTER',
      title: enc.title,
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
      body: `<p>${esc(m.text)}</p>`,
      options: [{ label: 'Ugh.' }], cls: 'bad',
    });
  }

  async function postMove() {
    render();
    const c = checkClock(s);
    if (c === 'depart') return endTrip('Noon on departure day. A taxi, an airport, a window seat, a feeling.');
    if (c === 'collapse') {
      const r = collapse(s);
      await modal({ kicker: 'SYSTEM FAILURE', title: 'Lights Out', body: `<p>${esc(r.text)}</p>`, options: [{ label: 'Ow.' }], cls: 'bad' });
      if (s.dayIdx > s.departureIdx) return endTrip('You technically missed your flight. The airline, for a fee that haunts you, found another.');
      render();
      return;
    }
    if (c === 'forcedNight') return doNight(true);
  }

  async function onVenueClick(key) {
    if (busy || s.over || key === s.location) return;
    const v = VENUE_MAP[key];
    const open = s.hour + 1 >= v.open[0] && s.hour + 1 <= Math.min(v.open[1], DAY_END - 1);
    if (!open) { toast(`${v.name} is closed at this hour.`); return; }
    busy = true;
    const res = travel(s, key);

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
      } else {
        addLog(s, 'You veer off at the last second and inspect a palm tree with great interest. Henrik lives to scan another day.', 'sys');
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
      } else {
        addLog(s, 'You admire the Palais from a respectful, badgeless distance.', 'sys');
      }
    } else if (res.ok) {
      render();
      await maybeEncounter(rollEncounter(s));
    }
    await maybeMishap();
    await postMove();
    render();
    busy = false;
  }

  async function onAct(action) {
    if (busy || s.over || !action.enabled) return;
    busy = true;
    const { encounter } = act(s, action.key);
    render();
    await maybeEncounter(encounter);
    await maybeMishap();
    await postMove();
    render();
    busy = false;
  }

  async function doNight(forced = false) {
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

  // ---- wire up ----

  async function showSponsorPitch() {
    const i = await modal({
      kicker: 'PRIME BEACHFRONT · AVAILABLE NOW', title: 'Sponsor This Plage',
      body: `<p>This pristine stretch of pixel sand could be YOURS for the festival. Your logo on the umbrellas. A branded in-game day. Custom encounters starring your brand — while your competitor gets mysteriously yacht-blocked.</p>
             <p>The first plage in advertising history with a verifiable 100% share of beach.</p>`,
      options: [
        { label: '📧 Enquire about sponsoring', sub: 'opens an email — serious and unserious enquiries welcome' },
        { label: 'Back to the Croisette' },
      ],
    });
    if (i === 0) {
      window.open('mailto:tim@neuralift.ai?subject=' + encodeURIComponent('Sponsoring a plage in Croisette or Bust 🥐'));
    }
  }

  root.querySelector('#map-wrap').addEventListener('click', (e) => {
    if (e.target.closest('.sponsor-spot')) { showSponsorPitch(); return; } // no game time spent — it's an ad
    const g = e.target.closest('.hotspot');
    if (g) onVenueClick(g.dataset.venue);
  });
  root.querySelector('#btn-night').addEventListener('click', () => { if (!busy && !s.over) doNight(false); });
  root.querySelector('#btn-airport').addEventListener('click', async () => {
    if (busy || s.over) return;
    const i = await modal({
      kicker: 'DEPARTURE DAY', title: 'Leave Early?',
      body: '<p>You could squeeze in one more hour of hustle… or get ahead of the airport scrum with your dignity and your duty-free intact.</p>',
      options: [{ label: 'Go now. It’s done.' }, { label: 'One more hour' }],
    });
    if (i === 0) endTrip('You leave on your own terms — the rarest Cannes exit of all.');
  });

  // arrival interstitial
  render();
  (async () => {
    const d = dayInfo(s);
    await modal({
      kicker: `${d.name} ${d.date} · 3PM`, title: 'Bienvenue à Cannes',
      body: `<p>You land via ${esc(s.flight.label)} and step into the Riviera heat. Home for the week: ${esc(s.digsInfo.name)}. ${esc(s.digsInfo.flavour)}</p>
             <p>${s.hasPass ? 'Your delegate badge swings proudly from your neck.' : 'You have no badge — the Palais is enemy territory. Everything else is fair game.'}
             The Croisette glitters. Pipeline awaits. ${money(cash(s))} to play with.</p>`,
      options: [{ label: 'Let’s build some ROI' }],
    });
    addLog(s, `Touched down in Cannes. ${money(cash(s))} in the war chest, ${s.departureIdx - s.dayIdx} nights to make it count.`, 'day');
    render();
  })();
}
