// The Spin — five reels of corporate fate.

import { pickWeighted, money, esc } from '../util.js';
import { confetti } from '../ui.js';
import {
  BUDGET_REEL, ARRIVAL_REEL, DEPARTURE_REEL, DIGS_REEL, PASS_REEL,
  OWN_YACHT_DIGS, TRIP_DAYS, RESPIN_PENALTY,
} from '../data/spin.js';

const REELS = [
  { key: 'budget', title: 'BUDGET', data: BUDGET_REEL },
  { key: 'arrival', title: 'ARRIVE', data: ARRIVAL_REEL },
  { key: 'departure', title: 'DEPART', data: DEPARTURE_REEL },
  { key: 'digs', title: 'DIGS', data: DIGS_REEL },
  { key: 'pass', title: 'BADGE', data: PASS_REEL },
];

export function spinScreen(root, { onDone }) {
  let respun = false;
  let results = null;
  let spinning = false;

  root.innerHTML = `
    <div class="screen spin-screen">
      <div class="spin-head">
        <h2 class="pixel-h">THE BUDGET MEETING</h2>
        <p class="spin-sub">Your company decides your Cannes. You watch. The machine knows.</p>
      </div>
      <div class="reels">
        ${REELS.map((r) => `
          <div class="reel" data-reel="${r.key}">
            <div class="reel-title">${r.title}</div>
            <div class="reel-window"><span class="reel-value">?</span></div>
            <div class="reel-flavour"></div>
          </div>`).join('')}
      </div>
      <div class="spin-controls">
        <button class="btn big gold" id="pull">PULL THE LEVER</button>
      </div>
      <div class="fate" id="fate" hidden></div>
    </div>`;

  const pull = root.querySelector('#pull');
  const fate = root.querySelector('#fate');

  function spinReel(reelEl, data, stopAfter, result) {
    return new Promise((resolve) => {
      const valEl = reelEl.querySelector('.reel-value');
      reelEl.classList.add('spinning');
      reelEl.classList.remove('landed');
      reelEl.querySelector('.reel-flavour').textContent = '';
      let i = 0;
      const tick = setInterval(() => {
        valEl.textContent = data[i++ % data.length].label;
      }, 65);
      setTimeout(() => {
        clearInterval(tick);
        valEl.textContent = result.label;
        reelEl.classList.remove('spinning');
        reelEl.classList.add('landed');
        if (result.jackpot) { reelEl.classList.add('jackpot'); confetti(); }
        reelEl.querySelector('.reel-flavour').textContent = result.flavour;
        resolve();
      }, stopAfter);
    });
  }

  async function spin() {
    if (spinning) return;
    spinning = true;
    fate.hidden = true;
    pull.disabled = true;
    pull.textContent = 'FATE IS DECIDING…';

    const budget = pickWeighted(BUDGET_REEL);
    results = {
      budget,
      arrival: pickWeighted(ARRIVAL_REEL),
      departure: pickWeighted(DEPARTURE_REEL),
      // jackpot overrides digs: the board already chartered your yacht
      digs: budget.jackpot ? OWN_YACHT_DIGS : pickWeighted(DIGS_REEL),
      pass: pickWeighted(PASS_REEL),
    };

    const els = REELS.map((r) => root.querySelector(`[data-reel="${r.key}"]`));
    await Promise.all([
      spinReel(els[0], BUDGET_REEL, 1100, results.budget),
      spinReel(els[1], ARRIVAL_REEL, 1800, results.arrival),
      spinReel(els[2], DEPARTURE_REEL, 2450, results.departure),
      spinReel(els[3], DIGS_REEL, 3100, results.digs),
      spinReel(els[4], PASS_REEL, 3750, results.pass),
    ]);

    spinning = false;
    showFate();
  }

  function effectiveBudget() {
    const raw = results.budget.value;
    return respun ? Math.round(raw * (1 - RESPIN_PENALTY) / 100) * 100 : raw;
  }

  function showFate() {
    const b = effectiveBudget();
    const arr = TRIP_DAYS[results.arrival.value];
    const dep = TRIP_DAYS[results.departure.value];
    const nights = results.departure.value - results.arrival.value;
    fate.hidden = false;
    fate.innerHTML = `
      <div class="fate-card">
        <div class="fate-kicker">YOUR FATE, AS DECIDED BY FORCES BEYOND YOUR CONTROL</div>
        <div class="fate-grid">
          <div><b>${money(b)}</b><span>total budget${respun ? ' (after the 10% “appeal fee”)' : ''}</span></div>
          <div><b>${arr.name} → ${dep.name}</b><span>${nights} night${nights === 1 ? '' : 's'} on the Croisette</span></div>
          <div><b>${esc(results.digs.label)}</b><span>${esc(results.digs.perks)}</span></div>
          <div><b>${results.pass.value ? 'FESTIVAL PASS' : 'NO BADGE'}</b><span>${results.pass.value ? 'the Palais is yours' : 'the Palais is not yours'}</span></div>
        </div>
        <p class="fate-flight">✈ Travel desk has booked you ${esc(results.budget.flight.label)} — ${money(results.budget.flight.cost)}, already off your budget. Non-negotiable.${results.digs.charter ? ` 🛥 Plus the yacht charter: ${money(results.digs.charter)}, pre-paid by the board. Also non-negotiable. Gloriously so.` : ''}</p>
        <div class="fate-actions">
          ${!respun ? `<button class="btn ghost" id="respin">APPEAL TO FINANCE<small>full re-spin, −10% of whatever budget lands</small></button>` : ''}
          <button class="btn big gold" id="go">PACK YOUR BAGS →</button>
        </div>
      </div>`;

    const respinBtn = fate.querySelector('#respin');
    if (respinBtn) respinBtn.addEventListener('click', () => {
      respun = true;
      pull.disabled = false;
      pull.textContent = 'PULL IT AGAIN';
      spin();
    });
    fate.querySelector('#go').addEventListener('click', () => {
      onDone({
        budget: effectiveBudget(),
        par: results.budget.par,
        company: results.budget.company,
        flight: results.budget.flight,
        arrivalIdx: results.arrival.value,
        departureIdx: results.departure.value,
        digs: results.digs.value,
        digsInfo: results.digs,
        hasPass: results.pass.value,
        respun,
      });
    });
    fate.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  pull.addEventListener('click', spin);
}
