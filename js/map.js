// The Croisette board — an illustrated map of Cannes used as the game surface,
// with invisible tap-targets, per-venue state dots and the player beacon
// overlaid in the image's own pixel space (1280×853).

import { VENUES } from './data/venues.js';

const W = 1280, H = 853;

// Venue key → [x, y] anchor on the illustrated board, sat on the building
// itself (the label is part of the art).
export const VENUE_POS = {
  oldtown:   [130, 158],
  cafferoma: [255, 238],
  manolans:  [575, 235],
  casino:    [710, 188],
  palais:    [130, 318],
  cabanas:   [435, 340],
  carlton:   [820, 262],
  martinez:  [1135, 322],
  gutter:    [835, 338],
  yachtrow:  [188, 492],
  stroll:    [345, 458],
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
  container.innerHTML = `
  <svg id="mapsvg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Illustrated map of Cannes">
    <image href="assets/map-board.webp" x="0" y="0" width="${W}" height="${H}"></image>
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
  </svg>`;
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
