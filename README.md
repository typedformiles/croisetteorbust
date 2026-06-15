# Croisette or Bust 🥐

*Survive the festival. Come home with ROI.*

A silly browser game for the run-up to Cannes. Spin the reels of corporate
fate (budget, dates, digs, badge — and one desperate appeal to Finance), then
work an illustrated map of the Croisette: the Palais, Yacht Row, the Carlton
terrace, the Gutter Bar, the casino. Build pipeline, dodge the €4,200 rosé
bill, decide whether you're Henrik now, and choose when to call it a night —
tired people attract bad encounters.

Your score is ROI — pipeline ÷ spend, graded fairly against your budget tier,
so a $5k shoestring can out-croissant a $2.5M yacht week. At the end you get
your **Neuralift segment**, and you will deserve it.

**Play:** https://croisetteorbust.com

## Stack

Plain HTML/CSS/JS (ES modules), no build step, no backend. The map is an
illustrated image (`assets/map-board.webp`) with HTML hotspots positioned by
percentage over it (see `js/map.js`). Hosted on GitHub Pages behind Cloudflare.

Deploys: push to `main`, then purge the Cloudflare cache (it caches CSS/JS
for 4h) — see `DESIGN.md` for the one-liner.

## Development

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

- `#dev-spin`, `#dev-trip`, `#dev-end` URL hashes jump straight to a screen.
- `node tools/sim.mjs 1000` plays 1000 random games through the engine and
  prints ROI/award/segment distributions — used to calibrate the per-tier
  `par` values in `js/data/spin.js`.

Game content lives in `js/data/` (reels, venues, encounters, segments);
mechanics in `js/engine.js`; design notes in `DESIGN.md`.

---

a silly game by [neuralift.ai](https://neuralift.ai)
