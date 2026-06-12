// The pixel Riviera. A procedurally drawn SVG scene of Cannes:
// lilac Esterel hills, cream town, the Palais, the grand hotels, the port.
// Integer coordinates + crispEdges = chunky pixel art that scales.

import { VENUES } from './data/venues.js';

const W = 360, H = 232;

// venue key → [x, y] anchor on the map
export const VENUE_POS = {
  oldtown:   [30, 100],
  cafferoma: [63, 121],
  casino:    [76, 92],
  palais:    [94, 137],
  manolans:  [137, 116],
  stroll:    [172, 133],
  carlton:   [207, 108],
  martinez:  [264, 110],
  gutter:    [291, 122],
  cabanas:   [218, 147],
  yachtrow:  [30, 165],
};

const DIGS_POS = {
  antibes: [338, 96],
  carnot:  [168, 72],
  villa:   [26, 47],
  hotel:   [236, 104],
  yacht:   [116, 188],
};

let P = [];
const px = (x, y, w, h, c) => P.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`);

function building(x, y, w, h, body, roof, win = '#8B9DBE') {
  px(x, y + 2, w, h - 2, body);
  px(x - 1, y, w + 2, 2, roof);
  for (let wy = y + 5; wy < y + h - 3; wy += 5) {
    for (let wx = x + 2; wx < x + w - 2; wx += 4) px(wx, wy, 2, 2, win);
  }
}

function palm(x, y, g = '#2F9E68', g2 = '#47B97E') {
  px(x, y - 7, 1, 7, '#8A6B4A');
  px(x - 3, y - 8, 3, 1, g); px(x + 1, y - 8, 3, 1, g);
  px(x - 2, y - 9, 2, 1, g2); px(x + 1, y - 9, 2, 1, g2);
  px(x - 1, y - 10, 3, 1, g);
}

function yacht(x, y, big = false) {
  const w = big ? 16 : 11;
  px(x, y, w, 3, '#FDFDF6');
  px(x + 1, y + 3, w - 2, 2, '#27496D');
  px(x + 3, y - 2, big ? 7 : 4, 2, '#EFEDE2');
  px(x + Math.floor(w / 2), y - (big ? 9 : 7), 1, big ? 7 : 5, '#9AA3AD');
  px(x + Math.floor(w / 2) + 1, y - (big ? 9 : 7), 2, 1, '#E2725B');
}

function umbrella(x, y, c1, c2) {
  px(x + 2, y, 1, 4, '#8A6B4A');
  px(x, y - 2, 5, 1, c1); px(x + 1, y - 3, 3, 1, c2); px(x + 2, y - 4, 1, 1, c1);
}

function lamp(x, y) { px(x, y - 5, 1, 5, '#27496D'); px(x - 1, y - 6, 3, 1, '#FFD166'); }

function flag(x, y, c) { px(x, y - 6, 1, 6, '#27496D'); px(x + 1, y - 6, 3, 2, c); }

function drawScene() {
  P = [];
  // sky — pastel sunset bands
  px(0, 0, W, 18, '#FFF1D8'); px(0, 18, W, 14, '#FFE5BD');
  px(0, 32, W, 12, '#FFD7A8'); px(0, 44, W, 10, '#FCCDA2');
  // sun
  px(296, 12, 10, 10, '#FFD166'); px(298, 10, 6, 14, '#FFD166'); px(294, 14, 14, 6, '#FFD166');
  px(298, 14, 6, 6, '#FFE49A');
  // gulls
  px(150, 20, 2, 1, '#9C8FA8'); px(153, 19, 2, 1, '#9C8FA8'); px(196, 28, 2, 1, '#9C8FA8');
  // Esterel — distant lilac range
  const ridge = [[0,46,40,10],[30,42,46,14],[66,46,38,10],[96,40,54,16],[140,46,40,10],[172,43,52,13],[216,47,40,9],[248,42,48,14],[288,46,72,10]];
  ridge.forEach(([x,y,w,h]) => px(x, y, w, h, '#CBB9DC'));
  ridge.forEach(([x,y,w]) => px(x + 4, y - 3, w - 12, 3, '#D8C9E6'));
  // near green hills, west (Croix de Gardes)
  px(0, 52, 120, 14, '#A9C98B'); px(0, 47, 76, 8, '#98BD7C'); px(8, 43, 44, 6, '#8DB371');
  px(120, 56, 70, 10, '#B5D097');
  // villa up the hill
  px(20, 42, 14, 8, '#FBF3E1'); px(19, 40, 16, 2, '#D97757'); px(23, 45, 2, 2, '#7C8FB0'); px(29, 45, 2, 2, '#7C8FB0');
  px(36, 44, 2, 6, '#3F7D52'); px(15, 44, 2, 6, '#3F7D52'); // cypress
  // town fill
  px(0, 62, W, 66, '#F6EBD4');
  // back row of town
  building(6, 70, 18, 22, '#F3E3C5', '#CE7A5B'); building(28, 74, 14, 18, '#EFDCBE', '#D98A66');
  building(46, 68, 20, 24, '#F7E9CC', '#C96A4E'); building(70, 76, 12, 16, '#F1DFC0', '#D97757');
  building(86, 70, 16, 20, '#F4E4C8', '#CE7A5B'); building(106, 74, 18, 18, '#EFDCBE', '#C96A4E');
  building(128, 70, 14, 20, '#F7E9CC', '#D98A66'); building(146, 74, 20, 18, '#F3E3C5', '#D97757');
  building(170, 70, 16, 22, '#EFDCBE', '#CE7A5B'); building(190, 74, 14, 18, '#F7E9CC', '#C96A4E');
  building(208, 70, 18, 20, '#F3E3C5', '#D98A66'); building(230, 74, 16, 18, '#F1DFC0', '#D97757');
  building(250, 70, 14, 22, '#F7E9CC', '#CE7A5B'); building(268, 74, 18, 18, '#F3E3C5', '#C96A4E');
  building(290, 70, 16, 20, '#EFDCBE', '#D98A66'); building(310, 74, 20, 18, '#F4E4C8', '#D97757');
  building(334, 70, 18, 20, '#F3E3C5', '#CE7A5B');
  // railway behind town (to Antibes)
  px(0, 64, W, 1, '#B9A98E'); for (let x = 2; x < W; x += 5) px(x, 65, 2, 1, '#A4937A');
  px(322, 58, 16, 6, '#E2725B'); px(324, 59, 3, 2, '#FFF1D8'); px(330, 59, 3, 2, '#FFF1D8'); // little train
  px(338, 60, 4, 4, '#C95B43');
  // THE CASINO — gilded deco pile above the Palais
  px(60, 80, 28, 22, '#FDF8EF'); px(59, 78, 30, 2, '#E8DAB8');
  px(68, 72, 12, 8, '#FDF8EF'); px(67, 70, 14, 2, '#E8DAB8');
  px(70, 66, 8, 4, '#D8A24A'); px(72, 64, 4, 2, '#D8A24A'); px(73, 62, 2, 2, '#FFD166'); // gold dome
  px(61, 83, 26, 3, '#F25CA2'); for (let x = 63; x < 86; x += 4) px(x, 84, 2, 1, '#FFE49A'); // marquee
  for (let wy = 89; wy < 99; wy += 5) for (let wx = 63; wx < 86; wx += 5) px(wx, wy, 2, 3, '#FFD166');
  px(71, 96, 6, 6, '#D33F49'); // red carpet step
  // Le Suquet — old town climbing the west hill
  px(0, 78, 56, 50, '#F0E0C2');
  building(2, 84, 12, 16, '#EFD9B4', '#C96A4E'); building(16, 80, 10, 20, '#F4E4C8', '#D97757');
  building(28, 86, 12, 14, '#EFDCBE', '#CE7A5B'); building(42, 82, 10, 18, '#F1DFC0', '#C96A4E');
  px(28, 70, 8, 14, '#EBD7B2'); px(27, 68, 10, 2, '#B98A5C'); px(31, 72, 2, 3, '#6B7FA3'); // tower
  flag(31, 68, '#E2725B');
  // mid row — the grand strip
  // Caffè Roma — cream front, striped awning (west end, by the old town)
  building(56, 104, 16, 24, '#F7E9CC', '#A14E3C');
  px(55, 112, 18, 3, '#D33F49'); for (let x = 56; x < 72; x += 4) px(x, 112, 2, 3, '#FBF3E1');
  // town filler where the Palais used to stand
  building(76, 100, 20, 28, '#F3E3C5', '#CE7A5B'); building(100, 104, 24, 24, '#EFDCBE', '#C96A4E');
  // MA NOLAN'S — the green pub
  building(128, 102, 18, 26, '#3F7D52', '#27496D', '#FFE49A');
  px(129, 110, 16, 2, '#FFD166');
  // mid filler blocks
  building(152, 100, 22, 28, '#F3E3C5', '#CE7A5B'); building(178, 104, 12, 24, '#EFDCBE', '#D97757');
  // THE CARLTON — white wedding cake, twin domes
  px(192, 96, 34, 32, '#FEFAF1'); px(191, 94, 36, 2, '#E8DAB8');
  px(193, 90, 6, 6, '#FEFAF1'); px(194, 88, 4, 2, '#444B57'); px(195, 86, 2, 2, '#444B57');
  px(219, 90, 6, 6, '#FEFAF1'); px(220, 88, 4, 2, '#444B57'); px(221, 86, 2, 2, '#444B57');
  for (let wy = 100; wy < 124; wy += 5) for (let wx = 195; wx < 224; wx += 4) px(wx, wy, 2, 2, '#9FB1CC');
  px(204, 122, 10, 6, '#C2D6E8');
  // hotel filler
  building(230, 102, 14, 26, '#F4E4C8', '#C96A4E');
  // THE MARTINEZ — cream deco slab, blue awnings
  px(248, 98, 32, 30, '#FBF4E4'); px(247, 96, 34, 2, '#E8DAB8');
  px(258, 90, 12, 8, '#FBF4E4'); px(257, 88, 14, 2, '#E8DAB8');
  for (let wy = 102; wy < 124; wy += 5) for (let wx = 250; wx < 278; wx += 4) { px(wx, wy, 2, 2, '#8B9DBE'); px(wx, wy - 1, 2, 1, '#2E93A8'); }
  // Gutter Bar — tiny, loud
  building(284, 110, 14, 18, '#EADBC0', '#A14E3C');
  px(285, 114, 12, 3, '#F25CA2'); px(287, 115, 8, 1, '#FFE49A'); // neon
  // east filler + breakwater
  building(302, 104, 16, 24, '#F3E3C5', '#D97757'); building(322, 108, 14, 20, '#EFDCBE', '#CE7A5B');
  building(340, 102, 14, 26, '#F7E9CC', '#C96A4E');
  // LA CROISETTE — the promenade
  px(0, 128, W, 10, '#F4E9CF');
  px(0, 128, W, 1, '#E3D4B0'); px(0, 137, W, 1, '#E3D4B0');
  for (let x = 10; x < W; x += 24) lamp(x, 137);
  for (let x = 22; x < W; x += 24) palm(x, 138);
  // beach
  px(0, 138, W, 18, '#F2DFAC');
  px(0, 138, W, 2, '#EAD49B');
  umbrella(196, 146, '#E2725B', '#FBF3E1'); umbrella(206, 144, '#2E93A8', '#FBF3E1');
  umbrella(216, 147, '#D8A24A', '#FBF3E1'); umbrella(226, 144, '#E2725B', '#FBF3E1');
  umbrella(236, 146, '#2E93A8', '#FBF3E1');
  px(246, 148, 6, 2, '#FBF3E1'); px(190, 149, 5, 2, '#F25CA2'); // towels
  // THE PALAIS — the white bunker on the waterfront, beside the old port
  px(70, 122, 48, 32, '#F9F1DE'); px(69, 120, 50, 2, '#E8DAB8');
  px(74, 114, 40, 8, '#F4EAD2'); px(73, 112, 42, 2, '#E8DAB8');
  for (let x = 76; x < 112; x += 6) px(x, 115, 3, 3, '#8B9DBE');
  for (let x = 74; x <= 112; x += 9) flag(x, 112, x % 2 ? '#E2725B' : '#2E93A8');
  for (let wy = 144; wy < 152; wy += 6) for (let wx = 74; wx < 106; wx += 6) px(wx, wy, 3, 3, '#9FB1CC');
  // red carpet steps down the east face
  px(106, 128, 10, 26, '#EDE2C5'); px(108, 130, 6, 24, '#D33F49'); px(109, 124, 4, 6, '#E25563');
  // sea
  px(0, 156, W, 14, '#9FE0DC'); px(0, 170, W, 16, '#66C7CC');
  px(0, 186, W, 20, '#46ABBE'); px(0, 206, W, 26, '#3490A8');
  // sparkle rows
  for (let x = 4; x < W; x += 13) px(x + ((x * 7) % 9), 158 + ((x * 5) % 3), 2, 1, '#E9FBF7');
  for (let x = 9; x < W; x += 17) px(x + ((x * 3) % 7), 173 + ((x * 11) % 4), 2, 1, '#D2F3EE');
  for (let x = 5; x < W; x += 21) px(x + ((x * 13) % 11), 192 + ((x * 7) % 5), 2, 1, '#BFE8E8');
  // the jetty + YACHT ROW (label/quay sit WEST of the jetty)
  px(58, 156, 5, 34, '#D9C9A4'); px(58, 156, 5, 1, '#C9B78F');
  px(6, 160, 52, 4, '#D9C9A4'); px(6, 160, 52, 1, '#C9B78F'); // west quay
  yacht(12, 155); yacht(34, 154, false);
  yacht(66, 168, true); yacht(86, 175); yacht(70, 186, false); yacht(92, 193, true);
  yacht(120, 182); // the digs yacht slot
  // distant boats
  yacht(220, 176); yacht(280, 190, true); yacht(180, 200);
  px(330, 168, 8, 2, '#FDFDF6'); px(333, 166, 2, 2, '#E2725B'); // dinghy
  return P.join('');
}

const closedIcon = '🌙';

function markerGroup(v) {
  const [x, y] = VENUE_POS[v.key];
  return `
  <g class="hotspot" data-venue="${v.key}" transform="translate(${x},${y})">
    <circle class="hit" r="13" cx="0" cy="-2"></circle>
    <g class="pin">
      <rect x="-3" y="-8" width="6" height="6" rx="0"></rect>
      <rect x="-1" y="-2" width="2" height="3"></rect>
    </g>
    <text class="vlabel" y="9" text-anchor="middle">${v.mapLabel}</text>
    <text class="closed-ico" y="-12" text-anchor="middle">${closedIcon}</text>
  </g>`;
}

export function renderMap(container) {
  const scene = drawScene();
  const markers = VENUES.map(markerGroup).join('');
  container.innerHTML = `
  <svg id="mapsvg" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges" role="img"
       aria-label="Pixel-art map of Cannes">
    <g class="scene">${scene}</g>
    <g class="digs-marker" hidden>
      <rect class="dm-roof" x="-4" y="-10" width="8" height="3"></rect>
      <rect class="dm-body" x="-3" y="-7" width="6" height="5"></rect>
      <text class="dm-label" y="-13" text-anchor="middle">HOME</text>
    </g>
    ${markers}
    <g id="player">
      <rect x="-2" y="-12" width="4" height="3" fill="#E8B88A"></rect>
      <rect x="-3" y="-9" width="6" height="5" fill="#E2725B"></rect>
      <rect x="-2" y="-4" width="2" height="3" fill="#27496D"></rect>
      <rect x="0" y="-4" width="2" height="3" fill="#27496D"></rect>
      <rect x="-3" y="-14" width="6" height="2" fill="#FBF3E1"></rect>
    </g>
  </svg>`;
}

export function updateMap(s, DAY_END) {
  const svg = document.getElementById('mapsvg');
  if (!svg) return;
  // player position
  const pos = VENUE_POS[s.location] || VENUE_POS.stroll;
  const player = svg.querySelector('#player');
  player.setAttribute('transform', `translate(${pos[0]},${pos[1] - 6})`);
  // digs marker
  const dm = svg.querySelector('.digs-marker');
  const dp = DIGS_POS[s.digs];
  if (dp) {
    dm.removeAttribute('hidden');
    dm.setAttribute('transform', `translate(${dp[0]},${dp[1]})`);
  }
  // venue open/closed/current states
  for (const g of svg.querySelectorAll('.hotspot')) {
    const key = g.dataset.venue;
    const v = VENUES.find((x) => x.key === key);
    const open = s.hour >= v.open[0] && s.hour <= Math.min(v.open[1], DAY_END - 1);
    g.classList.toggle('closed', !open);
    g.classList.toggle('current', key === s.location);
    g.classList.toggle('locked', key === 'palais' && !s.hasPass && s.badge !== 'borrowed');
  }
}
