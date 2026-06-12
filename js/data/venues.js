// Venues, their actions, and the lead pool.
// Hours run on an extended clock: 8 = 8am … 24 = midnight … 27 = 3am.
// Every action takes one hour. api is provided by the engine.

export const LEAD_POOL = [
  ['Head of CRM', 'a budget airline'],
  ['Director of Loyalty', 'a casino group'],
  ['VP Growth', 'an oat-milk challenger brand'],
  ['Chief Data Officer', 'a legacy broadcaster'],
  ['Head of Retention', 'a meal-kit empire'],
  ['SVP Retail Media', 'a supermarket giant'],
  ['Director of Performance Marketing', 'a fast-fashion app'],
  ['Head of Data Science', 'a sports streaming service'],
  ['Chief Customer Officer', 'an airline alliance'],
  ['VP Audiences', 'a news conglomerate'],
  ['Head of Lifecycle', 'a fintech unicorn'],
  ['Director of Insight', 'a theme-park dynasty'],
  ['Head of Personalisation', 'a hotel group'],
  ['SVP Advertising', 'a telco'],
  ['Director of CRM', 'a cinema chain'],
  ['VP Partnerships', 'a ticketing platform'],
  ['Head of Growth', 'the dating app du jour'],
  ['CMO', 'a regional bank with national ambitions'],
  ['Head of Audience Strategy', 'a gaming publisher'],
  ['Director of Subscriber Growth', 'a streaming bundle nobody understands'],
];

export const VENUES = [
  {
    key: 'palais', name: 'The Palais', open: [9, 19], encChance: 0.20,
    blurb: 'The big white bunker where the festival officially happens. Badge required. Air conditioning included.',
    gated: 'pass',
    mapLabel: 'PALAIS',
    actions: [
      {
        key: 'talk', label: 'Catch a main-stage talk', cost: 0,
        desc: 'A celebrity will say "authenticity". Twice.',
        run({ api }) {
          api.stat('brand', 5); api.stat('network', 1); api.stat('energy', -4);
          return 'You absorb a keynote. A film star says creativity is "like, a muscle". You nod. Your brand presence quietly grows.';
        },
      },
      {
        key: 'lobby', label: 'Prowl the badge-rich lobby', cost: 0,
        desc: 'Read lanyards. Hunt titles. Strike.',
        run({ api, rng }) {
          api.stat('network', 4);
          if (rng.chance(0.45)) {
            const lead = api.lead(35_000);
            return `Lanyard-scanning pays off: you corner the ${lead.name}. ${lead.valueText} of pipeline, born in a lobby.`;
          }
          return 'An hour of squinting at lanyards. Three "let’s circle back"s and a man who only does Web3 now.';
        },
      },
      {
        key: 'post', label: 'Post "thoughts from the Palais steps"', cost: 0, oncePerDay: true,
        desc: 'The annual LinkedIn pilgrimage photo.',
        run({ api }) {
          api.stat('brand', 4); api.stat('joie', 2);
          return '"Energised by the conversations here this week 🚀" — 84 likes and counting. The algorithm smiles upon you.';
        },
      },
    ],
  },
  {
    key: 'yachtrow', name: 'Yacht Row', open: [10, 26], encChance: 0.28,
    blurb: 'The jetée, where the real budgets float. Getting aboard is half the game.',
    gated: 'status',
    mapLabel: 'YACHT ROW',
    actions: [
      {
        key: 'meeting', label: 'Take the aft-deck meeting', cost: 0,
        desc: 'Where pipeline actually gets made.',
        run({ api, rng }) {
          api.stat('network', 2);
          if (rng.chance(0.75)) {
            const lead = api.lead(120_000);
            return `Champagne, a sea breeze, and a handshake. The ${lead.name} wants a proposal — ${lead.valueText} on the table.`;
          }
          return 'Great meeting, no budget. "We’re in a strategic pause." The yacht was nice though.';
        },
      },
      {
        key: 'rose', label: 'Rosé with the platform people', cost: 900, drink: true,
        desc: 'They have quotas. You have a glass.',
        run({ api, rng }) {
          api.stat('network', 5); api.stat('joie', 4); api.stat('energy', -5);
          if (rng.chance(0.4)) {
            const lead = api.lead(60_000);
            return `Two glasses in, the platform folks introduce you to the ${lead.name}. ${lead.valueText} of pipeline, lightly chilled.`;
          }
          return 'The platform people show you a roadmap slide on a phone. You nod at a sunset. Useful people to know.';
        },
      },
      {
        key: 'charter', label: 'Charter a yacht for a client day', cost: 45_000,
        desc: 'Stop borrowing boats. Become the boat.',
        run({ api }) {
          const a = api.lead(140_000); const b = api.lead(140_000); const c = api.lead(110_000);
          api.stat('network', 6); api.stat('brand', 5);
          return `For one day, YOU are Yacht Row. Clients materialise from every jetty. The ${a.name} (${a.valueText}), the ${b.name} (${b.valueText}) and the ${c.name} (${c.valueText}) all leave with proposals and sea legs.`;
        },
      },
      {
        key: 'party', label: 'Sunset deck party', cost: 0, open: [18, 26],
        desc: 'Invite-optional if you look confident enough.',
        run({ api, rng }) {
          api.stat('network', 7); api.stat('joie', 7); api.stat('energy', -10);
          if (rng.chance(0.3)) {
            const lead = api.lead(80_000);
            return `Golden hour does its thing. Somewhere between the DJ and the dessert boat you land the ${lead.name} — ${lead.valueText}.`;
          }
          return 'A saxophone appears at sunset, as is the law. You meet everyone and remember 40% of them.';
        },
      },
    ],
  },
  {
    key: 'carlton', name: 'Carlton Terrace', open: [9, 26], encChance: 0.24,
    blurb: 'The industry’s open-air boardroom. €42 rosé, priceless eavesdropping.',
    mapLabel: 'CARLTON',
    actions: [
      {
        key: 'rosetable', label: 'Order rosé for the table', cost: 2_400, drink: true,
        desc: 'The table will grow. So will the bill.',
        run({ api, rng }) {
          api.stat('network', 5); api.stat('joie', 4); api.stat('energy', -4);
          if (rng.chance(0.55)) {
            const lead = api.lead(70_000);
            return `The bottle works like a flare: people arrive. Among them, the ${lead.name}. ${lead.valueText} of pipeline for the price of a magnum.`;
          }
          return 'You host a lovely hour for people who are all, on reflection, also vendors.';
        },
      },
      {
        key: 'dinner', label: 'Host a private rooftop dinner', cost: 18_000, open: [19, 25],
        desc: 'Twelve seats. Tactical seating plan. One sommelier.',
        run({ api, rng }) {
          api.stat('network', 7); api.stat('joie', 3);
          const a = api.lead(95_000);
          if (rng.chance(0.6)) {
            const b = api.lead(85_000);
            return `Candlelight does what cabanas can’t. The ${a.name} (${a.valueText}) commits over the main course; the ${b.name} (${b.valueText}) over the digestifs. The seating plan was the strategy.`;
          }
          return `A magnificent evening. The ${a.name} leaves as ${a.valueText} of pipeline; the other eleven leave as expensive friends.`;
        },
      },
      {
        key: 'coffee', label: 'Coffee with a prospect', cost: 180, open: [9, 17],
        desc: 'Old-fashioned. Effective. €16 per flat white, it’s Lions week.',
        run({ api, rng }) {
          api.stat('network', 2);
          if (rng.chance(0.65)) {
            const lead = api.lead(45_000);
            return `Forty-five minutes, no theatrics. The ${lead.name} books a follow-up — ${lead.valueText} of honest pipeline.`;
          }
          return '"This is great but we’ve just signed a three-year deal with literally your competitor." The coffee was excellent.';
        },
      },
    ],
  },
  {
    key: 'martinez', name: 'The Martinez', open: [9, 27], encChance: 0.24,
    blurb: 'Lobby of champions. Everyone walks through eventually — position yourself accordingly.',
    mapLabel: 'MARTINEZ',
    actions: [
      {
        key: 'ambush', label: 'Run a lobby ambush', cost: 0,
        desc: 'Loiter with intent and a firm handshake.',
        run({ api, rng }) {
          api.stat('network', 2);
          if (rng.chance(0.5)) {
            const lead = api.lead(55_000);
            return `Patience rewarded: the ${lead.name} walks straight into your "oh hey, wild seeing you here!" — ${lead.valueText}.`;
          }
          api.stat('joie', -1);
          return 'An hour of decorative loitering. A concierge now watches you the way cats watch pigeons.';
        },
      },
      {
        key: 'nightcap', label: 'Nightcap at the bar', cost: 380, open: [20, 27], drink: true,
        desc: 'Where the day’s gossip gets settled.',
        run({ api, rng }) {
          api.stat('network', 4); api.stat('joie', 4); api.stat('energy', -5);
          if (rng.chance(0.3)) {
            const lead = api.lead(60_000);
            return `Last orders alchemy: the ${lead.name} pulls up a stool and basically sells themselves. ${lead.valueText}.`;
          }
          return 'You learn which CMO is leaving, which agency lost the pitch, and that the piano player knows everything.';
        },
      },
    ],
  },
  {
    key: 'cafferoma', name: 'Caffè Roma', open: [8, 22], encChance: 0.26,
    blurb: 'Opposite the Palais. The festival’s unofficial morning HQ and hangover clinic.',
    mapLabel: 'CAFFÈ ROMA',
    actions: [
      {
        key: 'espresso', label: 'Espresso & croissant', cost: 32,
        desc: 'Repair. Recover. Reload.',
        run({ api, rng, s }) {
          api.stat('energy', 10); api.stat('joie', 2);
          if (s.hour <= 11 && rng.chance(0.35)) {
            const lead = api.lead(35_000);
            return `Caffeine plus proximity: the next table is the ${lead.name}, equally broken, twice as friendly. ${lead.valueText}.`;
          }
          return 'Double espresso, flaky croissant, the slow return of hope. The Croisette can have you back now.';
        },
      },
      {
        key: 'court', label: 'Hold court at a sidewalk table', cost: 260,
        desc: 'Stay put. Let Cannes come to you.',
        run({ api, rng }) {
          api.stat('network', 4);
          if (rng.chance(0.4)) {
            const lead = api.lead(40_000);
            return `Everyone passes Caffè Roma eventually — including the ${lead.name}, who sits down uninvited and leaves as ${lead.valueText} of pipeline.`;
          }
          return 'You wave at fourteen vaguely familiar faces. Three wave back. One was waving at someone behind you.';
        },
      },
    ],
  },
  {
    key: 'cabanas', name: 'The Cabanas', open: [9, 18], encChance: 0.2,
    blurb: 'Branded beach tents where serious meetings cosplay as leisure.',
    mapLabel: 'CABANAS',
    actions: [
      {
        key: 'block', label: 'Book a cabana meeting block', cost: 6_500,
        desc: 'Back-to-backs with a sea view you won’t look at.',
        run({ api }) {
          const a = api.lead(60_000);
          const b = api.lead(60_000);
          api.stat('joie', -3); api.stat('network', 2);
          return `Two solid meetings: the ${a.name} (${a.valueText}) and the ${b.name} (${b.valueText}). You flew 900 miles to sit in a tent with a TV screen, and it worked.`;
        },
      },
      {
        key: 'sponsor', label: 'Sponsor tonight’s beach party', cost: 125_000,
        desc: 'Your logo. Their drinks. Everyone’s photos.',
        run({ api, rng }) {
          api.stat('brand', 18); api.stat('network', 8); api.stat('joie', 6);
          const a = api.lead(120_000);
          if (rng.chance(0.5)) {
            const b = api.lead(100_000);
            return `By 11pm your logo is in a thousand stories and on one inflatable flamingo. The ${a.name} (${a.valueText}) and the ${b.name} (${b.valueText}) both "love what you’re doing here". What you’re doing is an open bar.`;
          }
          return `The party is the talk of the Croisette and your brand is on every wristband. The ${a.name} signs up on the spot (${a.valueText}); the rest of the ROI arrives as "awareness", the CFO’s favourite word.`;
        },
      },
      {
        key: 'crash', label: 'Crash someone else’s cabana', cost: 0,
        desc: 'Walk in like you’re on the guest list.',
        run({ api, rng }) {
          if (rng.chance(0.5)) {
            api.stat('network', 4); api.stat('joie', 3);
            return 'You breeze past the clipboard with a nod. Free smoothies, new friends, a panel you weren’t invited to speak on (you spoke).';
          }
          api.stat('joie', -3);
          return '"Sorry, this is a closed session for Wave 2 partners." You are not a Wave 2 partner. You back out through the towels.';
        },
      },
    ],
  },
  {
    key: 'gutter', name: 'The Gutter Bar', open: [22, 27], encChance: 0.5,
    blurb: 'Officially a different bar every year. Spiritually eternal. Where the industry goes at 1am to be honest with itself.',
    mapLabel: 'GUTTER BAR',
    actions: [
      {
        key: 'onemore', label: '"One more, then bed. Obviously."', cost: 110, drink: true,
        desc: 'A lie, told nightly, by everyone.',
        run({ api, rng }) {
          api.stat('network', 4); api.stat('joie', 5); api.stat('energy', -6);
          if (rng.chance(0.25)) {
            const lead = api.lead(50_000);
            return `Pressed shoulder-to-shoulder with the entire industry, you somehow gain the ${lead.name}. ${lead.valueText}, agreed over a plastic cup.`;
          }
          return 'Someone’s global CEO is doing shots with someone’s intern. The org chart means nothing here. Beautiful.';
        },
      },
      {
        key: 'closedown', label: 'Close it down', cost: 420, drink: true,
        desc: 'Tomorrow is a problem for tomorrow-you.',
        run({ api, rng, s }) {
          api.stat('network', 8); api.stat('joie', 9); api.stat('energy', -14);
          s.sleepDebt += 1;
          if (rng.chance(0.4)) {
            const lead = api.lead(75_000);
            return `Deals get agreed at 3am that nobody remembers agreeing. Luckily you wrote this one down: the ${lead.name}, ${lead.valueText}.`;
          }
          return 'You closed the Gutter Bar. You know everyone now. You are also, in a very real sense, ruined for tomorrow.';
        },
      },
    ],
  },
  {
    key: 'manolans', name: 'Ma Nolan’s', open: [11, 26], encChance: 0.3,
    blurb: 'The Irish pub. Zero pretension, decent Guinness, surprisingly senior clientele hiding from the rosé.',
    mapLabel: 'MA NOLAN’S',
    actions: [
      {
        key: 'pint', label: 'An honest pint', cost: 16, drink: true,
        desc: 'No agenda. The radical move.',
        run({ api }) {
          api.stat('joie', 4); api.stat('energy', 2); api.stat('network', 2);
          return 'A pint, a stool, the football on mute. For one hour, nobody says "omnichannel". Restorative.';
        },
      },
      {
        key: 'chat', label: 'Talk to whoever’s next to you', cost: 70,
        desc: 'Everyone passes through Ma Nolan’s eventually.',
        run({ api, rng }) {
          api.stat('network', 4);
          if (rng.chance(0.3)) {
            const lead = api.lead(40_000);
            return `The bloke next to you in the rugby shirt turns out to be the ${lead.name}. ${lead.valueText}, sealed with a clink.`;
          }
          return 'Lovely chat with a man who claims he invented the QR code comeback. Probably didn’t. Good craic though.';
        },
      },
    ],
  },
  {
    key: 'oldtown', name: 'Old Town', open: [9, 26], encChance: 0.25,
    blurb: 'Le Suquet. Cobbles, candlelight, and the best deals happen above sea level.',
    mapLabel: 'OLD TOWN',
    actions: [
      {
        key: 'dinner', label: 'Long dinner up the hill', cost: 340, open: [18, 26],
        desc: 'Two hours of being a human being.',
        run({ api, rng }) {
          api.stat('energy', 8); api.stat('joie', 5); api.stat('network', 3);
          if (rng.chance(0.35)) {
            const lead = api.lead(50_000);
            return `Somewhere between the bouillabaisse and the second carafe, the ${lead.name} stops being a prospect and starts being a friend who happens to control ${lead.valueText}.`;
          }
          return 'Candlelight, cobbles, an old man playing accordion at a frankly aggressive volume. You remember why you like people.';
        },
      },
      {
        key: 'emails', label: 'Solo moules-frites & actually answer emails', cost: 110,
        desc: 'Heroic, in a sad sort of way.',
        run({ api }) {
          api.stat('energy', 6); api.stat('brand', 3); api.stat('joie', -2);
          return 'Inbox zero by candlelight. Your boss sees you online at 9pm Cannes time and assumes heroics. Correctly, for once.';
        },
      },
    ],
  },
  {
    key: 'stroll', name: 'La Croisette', open: [8, 27], encChance: 0.42,
    blurb: 'The promenade itself. Free, sunlit, and crawling with serendipity.',
    mapLabel: 'LA CROISETTE',
    actions: [
      {
        key: 'promenade', label: 'Promenade with intent', cost: 0,
        desc: 'See and be seen. Mostly be seen.',
        run({ api, rng }) {
          api.stat('joie', 2);
          if (rng.chance(0.12)) {
            const lead = api.lead(30_000);
            return `Pure pavement serendipity: you fall into step with the ${lead.name} and out of it with ${lead.valueText}.`;
          }
          return 'Palm trees, rollerbladers, four separate brand activations involving giant inflatable objects. The Croisette abides.';
        },
      },
      {
        key: 'swim', label: 'Sea swim reset', cost: 0, open: [8, 18], oncePerDay: true,
        desc: 'The sea has been right there the whole time.',
        run({ api, s }) {
          api.stat('energy', 14); api.stat('joie', 4);
          if (s.sleepDebt > 0) s.sleepDebt -= 1;
          return 'Ten minutes in the Mediterranean and you are a new person. Cheaper than therapy, colder than the rosé.';
        },
      },
    ],
  },
];

export const VENUE_MAP = Object.fromEntries(VENUES.map((v) => [v.key, v]));
