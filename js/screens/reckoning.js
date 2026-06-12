// The Reckoning — scores, the Neuralift segment, and the share card.

import { money, esc } from '../util.js';
import { toast, confetti } from '../ui.js';
import { finalReport } from '../engine.js';
import { TRIP_DAYS } from '../data/spin.js';

const GAME_URL = 'https://croisetteorbust.com/';

export function reckoningScreen(root, s, { onReplay }) {
  const { m, segment, award } = finalReport(s);
  const roiText = m.roi >= 10 ? Math.round(m.roi) + 'x' : m.roi.toFixed(1) + 'x';
  const nights = s.departureIdx - s.arrivalIdx;
  const passEmoji = s.hasPass ? '🎫' : s.badge === 'borrowed' ? '🪪😬' : '🚫🎫';
  const topLeads = [...s.leads].sort((a, b) => b.value - a.value).slice(0, 5);

  const casinoLine = Math.abs(m.gambleNet) >= 1000
    ? `🎰 casino: ${m.gambleNet > 0 ? '+' : '−'}${money(Math.abs(m.gambleNet))}`
    : null;
  const shareText = [
    'CROISETTE OR BUST 🥐',
    `${money(s.budget)} budget · ${nights} nights · ${s.digsInfo.label} ${passEmoji}`,
    `${money(m.leadValue)} pipeline on ${money(m.spend)} spend → ${roiText} ROI`,
    casinoLine,
    `${award.icon} ${award.name}`,
    `🧠 My Neuralift segment: ${segment.name}`,
    `▶ ${GAME_URL}`,
  ].filter(Boolean).join('\n');

  root.innerHTML = `
    <div class="screen reckoning">
      <div class="reck-award">
        <div class="award-icon">${award.icon}</div>
        <h2 class="pixel-h">${esc(award.name)}</h2>
        <p class="award-line">${esc(award.line)}</p>
      </div>

      <div class="reck-roi">
        <div class="roi-big">${roiText}</div>
        <div class="roi-sub">${money(m.leadValue)} pipeline on ${money(m.spend)} total spend</div>
      </div>

      <div class="segment-card">
        <div class="seg-kicker">YOUR NEURALIFT SEGMENT</div>
        <h3 class="pixel-h">${esc(segment.name)}</h3>
        <p>${esc(segment.desc)}</p>
        <p class="seg-tip">${esc(segment.tip)}</p>
      </div>

      <div class="reck-stats">
        <div><label>BUDGET</label><b>${money(s.budget)}</b></div>
        <div><label>SPENT</label><b>${money(m.spend)}</b></div>
        <div><label>LEADS</label><b>${m.leadCount}</b></div>
        <div><label>NIGHTS</label><b>${nights}</b></div>
        <div><label>BRAND</label><b>${m.brand}</b></div>
        <div><label>NETWORK</label><b>${m.network}</b></div>
        <div><label>JOIE</label><b>${m.joie}</b></div>
        <div><label>${Math.abs(m.gambleNet) >= 1000 ? 'CASINO' : 'ROSÉ BILL'}</label><b>${Math.abs(m.gambleNet) >= 1000 ? (m.gambleNet > 0 ? '+' : '−') + money(Math.abs(m.gambleNet)) : money(m.drinkSpend)}</b></div>
      </div>

      ${topLeads.length ? `
      <div class="reck-leads">
        <h4 class="pixel-h">PIPELINE HIGHLIGHTS</h4>
        ${topLeads.map((l) => `<p><b>${money(l.value)}</b> — ${esc(l.name)}</p>`).join('')}
        ${s.leads.length > 5 ? `<p class="more">…and ${s.leads.length - 5} more in the CRM, optimistically.</p>` : ''}
      </div>` : `
      <div class="reck-leads"><h4 class="pixel-h">PIPELINE HIGHLIGHTS</h4><p>There were no highlights. There was no pipeline. There was, however, a tan.</p></div>`}

      <div class="share-box">
        <pre id="share-text">${esc(shareText)}</pre>
        <div class="share-actions">
          <button class="btn gold" id="btn-copy">COPY RESULT</button>
          ${navigator.share ? '<button class="btn" id="btn-share">SHARE</button>' : ''}
          <button class="btn ghost" id="btn-replay">SPIN AGAIN</button>
        </div>
      </div>

      <footer class="credit">a silly game by <a href="https://neuralift.ai" target="_blank" rel="noopener">Neuralift.ai</a> — turnkey deep learning on your 1st party data that lifts your KPIs!</footer>
    </div>`;

  if (m.perf >= 1.5) confetti(120);

  root.querySelector('#btn-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast('Copied. Go forth and gloat.');
    } catch {
      toast('Copy blocked — select and copy the text above.');
    }
  });
  const shareBtn = root.querySelector('#btn-share');
  if (shareBtn) shareBtn.addEventListener('click', () =>
    navigator.share({ text: shareText }).catch(() => {}));
  root.querySelector('#btn-replay').addEventListener('click', onReplay);
}
