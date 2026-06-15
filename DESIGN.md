# Croisette or Bust — Design Spec

A darkly funny, lightly Neuralift-branded web game for the run-up to the 2026
Festival in Cannes (June 22–26). You spin for your fate, survive the Croisette,
and try to come home with the best ROI in adland.

Single-page web game. Mobile-first. No backend, no accounts. The writing is the
product.

---

## Game flow

```
THE SPIN  →  THE TRIP (day loop on the map)  →  THE RECKONING (scores + segment + share)
```

---

## Act 1 — The Spin

Five slot-machine reels decide your circumstances. Big lever-pull theatre,
each reel lands with flavour text. No negotiation — the reels ARE the
corporate satire (everyone knows the Cannes budget decision is arbitrary).

### Reels

**1. BUDGET** (spending money for the trip; flights nominal/flavour only)
| Result | Flavour |
|---|---|
| $5,000 | "Travel freeze. And that includes your flights." |
| $15,000 | "Marketing found some Q2 underspend." |
| $40,000 | "Approved, but the CFO wants 'a full debrief deck'." |
| $100,000 | "The CMO is coming too. This is her budget. Don't lose it." |
| $250,000 | "Finance had a good quarter." |
| $750,000 | "New CEO wants to 'make some noise'." |
| $2,500,000 | "The board saw a competitor's yacht on LinkedIn." |

Weighting: skew low-middle. The $2.5M result should feel like a jackpot
(lights, confetti).

**2. ARRIVAL** — Sun / Mon
**3. DEPARTURE** — Tue / Wed / Thu / Fri
(Festival days are Mon–Fri. Arrival day is half-usable; departure day ends at noon.)

**4. DIGS** (accommodation is pre-booked by the company — not paid from budget)
| Digs | Time effect | Other effects |
|---|---|---|
| Antibes Apartment | −1h/day (train in/out) | LAST TRAIN mechanic (see below) |
| Carnot Pad | baseline | — |
| Croix de Gardes Villa | baseline | quiet; +small energy recovery bonus |
| Downtown Hotel | +1h/day | — |
| The Yacht | +1h/day | +status (easier Yacht Row access); rare "owner needs the boat" eviction encounter |

**5. PASS** — Festival Pass / No Badge
- No Badge: cannot enter the Palais. Game remains fully winnable (fringe
  Cannes is real Cannes). Unlocks the FOUND BADGE encounter chain.

### Optional agency: "Appeal to Finance"
One full re-spin allowed, but whatever budget lands is docked 10%.
("Fine. But we're noting this.")

### Mode
**DECIDED: fully random.** Every spin is a true random roll — no daily seed,
no shared hand. Replay is the hook; the share card carries the bragging.

---

## Act 2 — The Trip

### Time model
- Each day runs 08:00 → 04:00. Actions cost 1h; **travel between venues costs
  30 min** (everything in Cannes is ~30 min apart) → the clock works in
  half-hour units (see `TRAVEL_HOURS` in engine.js, `hourLabel` for :30).
- Open/closed is judged by ARRIVAL time (now + 30 min travel) for places you'd
  travel to, so a venue about to open doesn't flash a confusing "closed" moon,
  and one you'd reach after it shuts reads as closed.
- Usable hours = baseline ± digs modifier − hangover/sleep-debt penalties.
- Each night you choose when to call it. Sleep < 6h adds SLEEP DEBT:
  shifts random-encounter rolls toward bad outcomes and dulls action yields
  the next day.
- **Exhaustion mishaps:** below 35 energy, bad things just HAPPEN — no choice,
  no visible dice (lost phone = −25% pipeline, falling asleep on a prospect,
  wrong-chat texts, card chaos, lost badge). Probability scales hard with
  lateness (×3 after 2am) and sleep debt. Public failures (Palais rejection,
  yacht-block, failed bribes) also cost Network — people SAW that.
- **Antibes LAST TRAIN:** out past 00:50 → choose €120 taxi (spend) or sleep
  on the beach (energy crash + guaranteed morning encounter roll).

### Meters
| Meter | What feeds it |
|---|---|
| **Lead Value ($)** | meetings, schmoozing, lucky encounters — the ROI numerator |
| **Brand Lift** | talks, panels, visibility stunts, press |
| **Network** | new relationships; multiplies later meeting odds/yields |
| **Joie de Vivre** | fun. Affects ending text; too low = burnout events, too high = liability events |
| **Energy** (semi-hidden) | sleep, food, rosé intake. Gates action effectiveness |
| **Spend** | running total — the ROI denominator |

### Venues (the map)
| Venue | Profile |
|---|---|
| **The Palais** | pass-gated. Brand lift, talks, badge-scan choke point |
| **Yacht Row** | highest lead value; status-gated (yacht digs, network, or blag roll). "Yacht-blocked" fail state |
| **Carlton Terrace** | client schmoozing, €38 rosé, high spend-to-lead conversion |
| **The Martinez** | lobby ambush meetings; expensive but reliable |
| **Caffe Roma** | morning hub. Recovery + serendipitous breakfast meetings |
| **Cabanas (beachfront)** | bookable meetings — solid leads, boring, costs money |
| **Gutter Bar** | late night only. Network + joie spikes, peak encounter danger |
| **Ma Nolan's** | the honest pint. Mid network, low spend, low risk |
| **Old Town (Le Suquet)** | cheap dinners, relationship-building, energy recovery |
| **The Casino** | roulette: red/black/zero at real odds. Stakes count as spend; winnings extend cash but never shrink the ROI denominator |
| **La Croisette (stroll)** | free, low yield, high serendipity encounter rate |

### Random encounters
Rolled on arrival at a venue and after actions; table weighted by venue,
hour and sleep debt. Every encounter fires at most ONCE per game, and every
encounter is tied to venues where its text makes sense. Industry-twisted Dope Wars flavour. Starter list:

- A creative director offers you an unmarked bag of slightly off-white powder.
  (Options keep it winking, not indulgent — "ask if it's oat milk creamer.")
- **FOUND BADGE** (pass-less runs): a lanyard on a Gutter Bar barstool.
  - *Hand it in* → 50/50: belongs to nobody / belongs to a CMO who is
    pathetically grateful (instant lead + network bump).
  - *Keep it* → first Palais scan is 50/50: works (full access rest of trip)
    / security pulls you aside (lose 2h, brand hit, Palais-flagged forever,
    chance your boss hears).
- An influencer wants €10k for one story mentioning your brand.
- Your CEO calls at 9am. You are still at the Gutter Bar.
- A rosé lunch "for the table" ends in a €4,200 bill.
- You pitch brilliantly for 20 minutes — to your competitor's client.
- Awards-night invite: expensive, exhausting, big brand lift if you stay sober
  enough to network.
- Yacht eviction (yacht digs only): "the owner's clients are coming aboard."
  Homeless until 6pm.
- You find a quiet rooftop party where actual decisions are being made.
- Mistaken identity: a famous CMO thinks you're someone else. Play along?

(Target: ~40 encounters for launch; variety is replay value.)

---

## Act 3 — The Reckoning

- **Headline: ROI ratio** = Lead Value ÷ Spend. Shoestring runs can win big.
- Secondary: total Lead Value (so the $2.5M whale run has bragging rights too),
  Brand Lift, Network, Joie.
- **The Neuralift moment:** "**Your Neuralift segment**." Playstyle-derived
  audience persona — *Gutter Bar Goblin, Yacht Leech, Palais Purist, ROI
  Machine, Rosé Casualty, The CFO's Favourite, Fringe Operator…* This is the
  brand tie-in: the product does AI segmentation, the game ends by segmenting
  you. One quiet footer: "a silly game by Neuralift.ai".
- **Share:** Wordle-style emoji text block
  (`Croisette or Bust 🥐 Day 3 · ROI 4.2x · 🛥️🍾🍾 · Segment: Gutter Bar Goblin`)
  + canvas-generated result card image for LinkedIn.

---

## Tone & guardrails

- Edgy-but-deniable. Debauchery appears; the player's options wink at it.
- No official festival marks or lion imagery — "the Festival", "the Palais".
  Real venue names as cultural references only.
- Neuralift branding: footer + the segmentation end-screen. Nothing in-game.

## Tech

- Single HTML page, vanilla ES modules, all content as data (JSON). No build, no backend.
- **Map:** illustrated image (`assets/map-board.webp`, 1280×853) as a CSS
  background on a container locked to that aspect ratio; venue hotspots,
  player beacon and sponsor badge are HTML elements positioned by percentage
  `left`/`top` (`js/map.js`). NOT an SVG overlay — that drifted. Venue
  coordinates were derived by auto-detecting the white label pills in the art.
- **Type:** Fraunces (editorial serif) for spin values + headings, Space
  Grotesk for body, Press Start 2P for the logo/retro accents.
- Host: GitHub Pages behind Cloudflare (proxied). Live at croisetteorbust.com.
- **Deploy:** push → wait for origin HTML to update → purge Cloudflare cache
  (token in `~/.claude/cloudflare-purge.env`; CF caches CSS/JS 4h, HTML is
  always fresh): `curl -s -X POST ".../zones/$CF_ZONE_ID/purge_cache" -H
  "Authorization: Bearer $CF_PURGE_TOKEN" --data '{"purge_everything":true}'`

## Decisions

1. **Hosting:** GitHub Pages from Tim's personal account (`typedformiles`),
   repo `croisetteorbust`, custom domain **croisetteorbust.com** (Cloudflare
   DNS + proxy). Possible later move to a `croisetteorbust` GitHub org.
2. **Art:** illustrated Riviera map (a variant of the Adweek Cannes Atlas
   style), replacing the original procedural pixel map (2026-06-13). Spin
   screen uses "editorial glamour" styling — serif values, gold hairlines.
   Quality bar is HIGH — marketing-industry audience.
3. **Re-spin ("Appeal to Finance", −10% budget):** IN.
4. **Mode:** random spins only, no daily seed.
5. **Sponsor slot:** "YOUR BRAND HERE" badge in the top-right Vallauris hills
   (static, no pulse); pitch modal shows tim@neuralift.ai with a copy button.
