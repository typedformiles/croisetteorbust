// App bootstrap & screen router.

import { newTrip } from './engine.js';
import { renderMap } from './map.js';
import { modal } from './ui.js';
import { spinScreen } from './screens/spin.js';
import { tripScreen } from './screens/trip.js';
import { reckoningScreen } from './screens/reckoning.js';

const app = document.getElementById('app');

function showTitle() {
  app.innerHTML = `
    <div class="screen title-screen">
      <div class="title-map" id="title-map" aria-hidden="true"></div>
      <div class="title-overlay">
        <h1 class="logo pixel-h">CROISETTE<br><span>OR BUST</span></h1>
        <p class="tagline">Survive the festival. Come home with ROI.<br>One week in Cannes. One spin of corporate fate.</p>
        <div class="title-actions">
          <button class="btn big gold" id="btn-play">PLAY</button>
          <button class="btn ghost" id="btn-how">HOW IT WORKS</button>
        </div>
        <a class="brand-lockup" href="https://neuralift.ai" target="_blank" rel="noopener">
          <canvas id="nl-pixel-icon" width="64" height="64" aria-hidden="true"></canvas>
          <span class="brand-words">
            <span class="brand-by">a silly game by</span>
            <span class="brand-name">NEURALIFT.AI</span>
          </span>
        </a>
      </div>
    </div>`;
  renderMap(document.getElementById('title-map'));
  drawPixelLogo(document.getElementById('nl-pixel-icon'));
  document.getElementById('btn-play').addEventListener('click', showSpin);
  document.getElementById('btn-how').addEventListener('click', showHow);
}

// Downsample the real Neuralift logo into chunky pixels (same trick as liftgames).
function drawPixelLogo(canvas) {
  if (!canvas) return;
  const img = new Image();
  img.onload = () => {
    const grid = 16;
    const tmp = document.createElement('canvas');
    tmp.width = grid; tmp.height = grid;
    const tctx = tmp.getContext('2d');
    tctx.drawImage(img, 0, 0, grid, grid);
    const data = tctx.getImageData(0, 0, grid, grid).data;
    const ctx = canvas.getContext('2d');
    const px = canvas.width / grid;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < grid; y++) {
      for (let x = 0; x < grid; x++) {
        const i = (y * grid + x) * 4;
        if (data[i + 3] < 80) continue;
        ctx.fillStyle = `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`;
        ctx.fillRect(x * px, y * px, px, px);
      }
    }
  };
  img.src = 'assets/neuralift-icon.png';
}

async function showHow() {
  await modal({
    kicker: 'THE RULES', title: 'How It Works',
    body: `
      <p><b>1. The Spin.</b> Five reels decide your budget, your dates, your digs and whether you even get a festival badge. You get one appeal to Finance — a full re-spin, minus 10% of whatever budget lands.</p>
      <p><b>2. The Trip.</b> Move around the map. Every move and every action costs an hour. Venues open and close. Meetings make pipeline; rosé makes friends; the Gutter Bar makes both, at a price. Choose when to call it a night — tired people attract bad encounters.</p>
      <p><b>3. The Reckoning.</b> Your score is ROI: pipeline ÷ spend, graded fairly against your budget tier. A $5k shoestring can beat a $2.5M yacht week. At the end you get your Neuralift segment — and you'll deserve it.</p>`,
    options: [{ label: 'Got it' }],
  });
}

function showSpin() {
  spinScreen(app, {
    onDone(spinResult) {
      const s = newTrip(spinResult);
      tripScreen(app, s, { onEnd: () => showReckoning(s) });
    },
  });
}

function showReckoning(s) {
  reckoningScreen(app, s, { onReplay: showSpin });
}

// dev shortcuts: #dev-trip / #dev-spin / #dev-end jump straight to a screen
if (location.hash === '#dev-trip' || location.hash === '#dev-end') {
  import('./data/spin.js').then(({ BUDGET_REEL, DIGS_REEL }) => {
    const b = BUDGET_REEL[1], digs = DIGS_REEL[0];
    const s = newTrip({
      budget: b.value, par: b.par, flight: b.flight,
      arrivalIdx: 1, departureIdx: 6, digs: digs.value, digsInfo: digs,
      hasPass: false, respun: false,
    });
    if (location.hash === '#dev-end') {
      s.leads = [{ name: 'Head of CRM of a budget airline', value: 120000, valueText: '$120k' }];
      s.leadValue = 320000; s.spend = 9400; s.network = 55; s.brand = 30; s.joie = 62;
      showReckoning(s);
    } else {
      tripScreen(app, s, { onEnd: () => showReckoning(s) });
      setTimeout(() => document.querySelector('.modal-options .btn')?.click(), 600);
    }
  });
} else if (location.hash === '#dev-spin' || location.hash === '#dev-spin-auto') {
  showSpin();
  if (location.hash === '#dev-spin-auto') setTimeout(() => document.querySelector('#pull')?.click(), 300);
} else {
  showTitle();
}
