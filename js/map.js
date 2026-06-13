// The Croisette board — an illustrated map of Cannes used as the game surface,
// with invisible tap-targets, per-venue state dots and the player beacon
// overlaid in the image's own pixel space (1280×853).

import { VENUES } from './data/venues.js';

const W = 1280, H = 853;

// Venue key → [x, y] anchor on the illustrated board, sat on the building
// itself (the label is part of the art).
export const VENUE_POS = {
  oldtown:   [110, 92],
  cafferoma: [250, 168],
  manolans:  [605, 180],
  casino:    [740, 168],
  palais:    [110, 232],
  cabanas:   [565, 268],
  carlton:   [810, 318],
  martinez:  [1110, 368],
  gutter:    [830, 438],
  yachtrow:  [170, 368],
  stroll:    [665, 490],
};

// Where "home" sits for each digs choice (small marker).
const DIGS_POS = {
  antibes:  [1210, 250],
  carnot:   [470, 430],
  villa:    [1080, 150],
  hotel:    [780, 470],
  yacht:    [230, 650],
  ownyacht: [230, 650],
};

// The empty Vallauris / Super-Cannes hills — sponsor real estate.
const SPONSOR_POS = [1055, 140];

function hotspotGroup(v) {
  const [x, y] = VENUE_POS[v.key];
  return `
  <g class="hotspot" data-venue="${v.key}" transform="translate(${x},${y})">
    <circle class="hit" r="74"></circle>
    <circle class="state-dot" r="15" cx="0" cy="0"></circle>
    <text class="closed-ico" y="7" text-anchor="middle">🌙</text>
  </g>`;
}

export function renderMap(container) {
  const hotspots = VENUES.map(hotspotGroup).join('');
  // The board image is a CSS background on a container locked to its aspect
  // ratio; the overlay SVG uses preserveAspectRatio="none" so it stretches to
  // exactly the same box — coordinate (x,y) maps 1:1 to the image with no
  // letterbox drift (the bug with an embedded <image> + viewBox).
  container.innerHTML = `
  <div class="board" style="background-image:url('assets/map-board.webp')">
  <svg id="mapsvg" class="board-overlay" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Illustrated map of Cannes">
    <g class="digs-marker" hidden>
      <circle class="dm-glow" r="20"></circle>
      <circle class="dm-core" r="9"></circle>
      <text class="dm-label" y="4" text-anchor="middle">⌂</text>
    </g>
    ${hotspots}
    <g class="sponsor-spot" transform="translate(${SPONSOR_POS[0]},${SPONSOR_POS[1]})">
      <rect class="hit" x="-170" y="-66" width="340" height="132" rx="14"></rect>
      <g class="sp-badge">
        <rect class="sp-bg" x="-168" y="-56" width="336" height="112" rx="16"></rect>
        <text class="sp-label" y="-12" text-anchor="middle">YOUR BRAND HERE</text>
        <text class="sp-sub" y="30" text-anchor="middle">▸ tap to sponsor the hills</text>
      </g>
    </g>
    <g id="player">
      <circle class="p-glow" r="34"></circle>
      <circle class="p-ring" r="22"></circle>
      <circle class="p-core" r="12"></circle>
    </g>
  </svg>
  </div>`;
}

export function updateMap(s, DAY_END) {
  const svg = document.getElementById('mapsvg');
  if (!svg) return;
  const pos = VENUE_POS[s.location] || VENUE_POS.stroll;
  const player = svg.querySelector('#player');
  player.setAttribute('transform', `translate(${pos[0]},${pos[1]})`);

  const dm = svg.querySelector('.digs-marker');
  const dp = DIGS_POS[s.digs];
  if (dp) {
    dm.removeAttribute('hidden');
    dm.setAttribute('transform', `translate(${dp[0]},${dp[1]})`);
  }

  for (const g of svg.querySelectorAll('.hotspot')) {
    const key = g.dataset.venue;
    const v = VENUES.find((x) => x.key === key);
    const open = s.hour >= v.open[0] && s.hour <= Math.min(v.open[1], DAY_END - 1);
    g.classList.toggle('closed', !open);
    g.classList.toggle('current', key === s.location);
    g.classList.toggle('locked', key === 'palais' && !s.hasPass && s.badge !== 'borrowed');
  }
}
