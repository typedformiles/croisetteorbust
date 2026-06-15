// Small shared helpers — RNG, formatting, DOM.

export const rnd = (min, max) => min + Math.random() * (max - min);
export const rndInt = (min, max) => Math.floor(rnd(min, max + 1));
export const chance = (p) => Math.random() < p;
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Pick one entry from [{weight, ...}] (or plain array → uniform).
export function pickWeighted(items, weightFn) {
  const w = items.map((it) => (weightFn ? weightFn(it) : it.weight ?? 1));
  const total = w.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= w[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function money(n) {
  const v = Math.round(n);
  if (Math.abs(v) >= 1_000_000) {
    const m = v / 1_000_000;
    return `$${m % 1 === 0 ? m : m.toFixed(1)}M`;
  }
  if (Math.abs(v) >= 10_000) return `$${Math.round(v / 1000)}k`;
  return `$${v.toLocaleString('en-US')}`;
}

export function hourLabel(h) {
  const whole = Math.floor(h);
  const half = h - whole >= 0.5;
  const hh = ((whole % 24) + 24) % 24;
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}${half ? ':30' : ''}${ampm}`;
}

export const el = (sel) => document.querySelector(sel);

export function html(strings, ...vals) {
  return strings.reduce((out, s, i) => out + s + (vals[i] ?? ''), '');
}

export function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
