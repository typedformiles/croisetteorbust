// The Croisette board — an illustrated map of Cannes used as the game surface.
// Hotspots, beacon, sponsor badge and digs marker are plain HTML elements
// positioned with percentage left/top inside the background-image container,
// so a point at (x/1280, y/853) always lands on the same spot of the picture
// regardless of screen size. One coordinate set covers every device.

import { VENUES } from './data/venues.js';

const W = 1280, H = 853;
const pctX = (x) => (x / W * 100).toFixed(3) + '%';
const pctY = (y) => (y / H * 100).toFixed(3) + '%';

// Venue key → [x, y] on the 1280×853 board, sat on the label/building.
export const VENUE_POS = {
  oldtown:   [131, 146],
  cafferoma: [407, 291],
  manolans:  [608, 251],
  casino:    [798, 222],
  palais:    [174, 433],
  cabanas:   [567, 470],
  carlton:   [875, 431],
  martinez:  [1171, 545],
  gutter:    [960, 631],
  yachtrow:  [237, 676],
  stroll:    [684, 687],
};

// Where "home" sits for each digs choice (small marker).
const DIGS_POS = {
  antibes:  [1200, 470],
  carnot:   [560, 560],
  villa:    [1080, 175],
  hotel:    [900, 520],
  yacht:    [300, 720],
  ownyacht: [300, 720],
};

// The empty Vallauris / Super-Cannes hills — sponsor real estate.
const SPONSOR_POS = [870, 165];

function hotspotEl(v) {
  const [x, y] = VENUE_POS[v.key];
  return `
  <button class="hotspot" type="button" data-venue="${v.key}"
          style="left:${pctX(x)};top:${pctY(y)}">
    <span class="state-dot"></span>
    <span class="closed-ico" aria-hidden="true">🌙</span>
    <span class="hs-name">${v.mapLabel}</span>
  </button>`;
}

export function renderMap(container) {
  const hotspots = VENUES.map(hotspotEl).join('');
  container.innerHTML = `
  <div class="board" style="background-image:url('assets/map-board.webp')">
    ${hotspots}
    <button class="hills-hint" type="button" aria-label="Sponsor the hills">🤙</button>
    <div class="digs-marker" hidden>
      <span class="dm-core">⌂</span>
    </div>
    <div id="player"><span class="p-glow"></span><span class="p-ring"></span><span class="p-core"></span></div>
  </div>`;
}

export function updateMap(s, DAY_END) {
  const board = document.querySelector('.board');
  if (!board) return;

  const [px, py] = VENUE_POS[s.location] || VENUE_POS.stroll;
  const player = board.querySelector('#player');
  player.style.left = pctX(px);
  player.style.top = pctY(py);

  const dm = board.querySelector('.digs-marker');
  const dp = DIGS_POS[s.digs];
  if (dp) {
    dm.hidden = false;
    dm.style.left = pctX(dp[0]);
    dm.style.top = pctY(dp[1]);
  }

  for (const g of board.querySelectorAll('.hotspot')) {
    const key = g.dataset.venue;
    const v = VENUES.find((x) => x.key === key);
    // Judge "open" by when you'd ARRIVE (30 min travel) for places you'd
    // travel to, so a venue about to open doesn't flash a confusing moon —
    // and one about to close (you'd arrive after it shuts) reads as closed.
    const at = key === s.location ? s.hour : s.hour + 0.5;
    const open = at >= v.open[0] && at <= Math.min(v.open[1], DAY_END - 1);
    g.classList.toggle('closed', !open);
    g.classList.toggle('current', key === s.location);
    g.classList.toggle('locked', key === 'palais' && !s.hasPass && s.badge !== 'borrowed');
  }
}
