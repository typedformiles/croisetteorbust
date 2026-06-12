// Modal, toast, confetti.

import { esc } from './util.js';

// Shows a modal; resolves with the index of the chosen option.
export function modal({ title, body, options, kicker = '', cls = '' }) {
  return new Promise((resolve) => {
    const root = document.getElementById('modal-root');
    root.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal ${cls}">
          ${kicker ? `<div class="modal-kicker">${esc(kicker)}</div>` : ''}
          <h3 class="modal-title">${esc(title)}</h3>
          <div class="modal-body">${body}</div>
          <div class="modal-options">
            ${options.map((o, i) => `
              <button class="btn opt ${o.cls || ''}" data-i="${i}" ${o.disabled ? 'disabled' : ''}>
                <span class="opt-label">${esc(o.label)}</span>
                ${o.sub ? `<span class="opt-sub">${esc(o.sub)}</span>` : ''}
              </button>`).join('')}
          </div>
        </div>
      </div>`;
    root.querySelectorAll('button.opt').forEach((b) =>
      b.addEventListener('click', () => {
        root.innerHTML = '';
        resolve(Number(b.dataset.i));
      }));
  });
}

export function toast(text) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = text;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2200);
}

const CONFETTI_COLORS = ['#E2725B', '#2E93A8', '#D8A24A', '#F25CA2', '#47B97E', '#FBF3E1'];

export function confetti(n = 80) {
  for (let i = 0; i < n; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    c.style.animationDelay = Math.random() * 0.8 + 's';
    c.style.animationDuration = 1.6 + Math.random() * 1.6 + 's';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4000);
  }
}
