// Random encounters. Tone: edgy-but-deniable — the debauchery appears,
// the player's options wink at it.
//
// where: venue keys (omit = anywhere). when: [minHour, maxHour] extended clock.
// once: fires at most once per game. cond(s): extra availability check.
// tone 'bad' gets weighted up by sleep debt and late hours.

export const ENCOUNTERS = [
  {
    id: 'powder', tone: 'bad', weight: 8, once: true,
    where: ['gutter', 'martinez', 'yachtrow'], when: [22, 27],
    title: 'A Generous Offer',
    text: 'A wild-eyed creative director sidles up and offers you an unmarked bag of slightly off-white powder. "It’s a new sugar substitute," he says, not blinking. He has not blinked for some time.',
    options: [
      {
        label: 'Politely decline',
        run({ api }) {
          api.stat('network', 2);
          return 'He nods slowly. "Respect. Boundaries. That’s the whole campaign, really." He drifts off to pitch the bag to someone else.';
        },
      },
      {
        label: 'Ask if it’s oat-milk creamer',
        run({ api, rng }) {
          if (rng.chance(0.5)) {
            api.stat('network', 8); api.stat('joie', 4);
            return 'He laughs so hard he has to sit down. You are now his favourite person in Cannes. He introduces you to everyone as "the oat-milk guy" and the title, somehow, opens doors.';
          }
          api.stat('joie', -3);
          return 'He stares at you with infinite sadness. "This industry used to be fun." He leaves. The bag leaves with him.';
        },
      },
      {
        label: 'Slowly back away onto the nearest yacht',
        run({ api, rng }) {
          if (rng.chance(0.4)) {
            api.stat('network', 3); api.stat('joie', 3);
            return 'You reverse up a gangway into a party you weren’t invited to. The bouncer assumes anyone walking backwards must belong. New friends acquired.';
          }
          return 'You reverse directly into a waiter and a tray of twelve negronis. The creative director, watching, finally blinks.';
        },
      },
    ],
  },
  {
    id: 'foundbadge', tone: 'mixed', weight: 14, once: true,
    where: ['gutter', 'manolans', 'oldtown'], when: [18, 27],
    cond: (s) => !s.hasPass && s.badge === 'none',
    title: 'A Lanyard, Unattended',
    text: 'There, on a barstool: a festival badge. Full delegate. €4,000 of laminated access, just sitting there. The photo is a man named Henrik who looks almost, sort of, vaguely like you. If you squint. In the dark.',
    options: [
      {
        label: 'Keep it. You’re Henrik now.',
        run({ s }) {
          s.badge = 'kept';
          return 'You pocket the lanyard. Tomorrow, the Palais. Henrik’s lifestyle suits you already — though scanners have opinions, and you’ll find out the scanner’s opinion the first time you use it.';
        },
      },
      {
        label: 'Hand it in at the bar',
        run({ s, api, rng }) {
          s.badge = 'returned';
          if (rng.chance(0.5)) {
            const lead = api.lead(160_000, 1.2);
            api.stat('network', 10);
            return `Twenty minutes later a frantic Henrik returns — who turns out to be the ${lead.name}. He is pathetically, expensively grateful. ${lead.valueText} of pipeline, earned through basic decency. Disgusting, really.`;
          }
          api.stat('joie', 2);
          return 'The barman tosses it in a shoebox of seventeen other badges, four phones and a single shoe. Virtue is its own reward, which is to say: no reward.';
        },
      },
      {
        label: 'Leave it. Henrik’s journey is his own.',
        run({ api }) {
          api.stat('joie', 1);
          return 'You leave the badge to its fate. Somewhere out there, Henrik is having the worst night of his life, and it is not your problem.';
        },
      },
    ],
  },
  {
    id: 'influencer', tone: 'mixed', weight: 8, once: true, when: [10, 22],
    where: ['carlton', 'cabanas', 'stroll', 'yachtrow'],
    title: 'Reach, Guaranteed*',
    text: 'An influencer with 2.3M followers and sunglasses the size of satellite dishes offers to mention your brand in one (1) story. The price is €10,000. "My audience is basically all CMOs," she says. Her last post was a smoothie.',
    options: [
      {
        label: 'Pay the €10k', cost: 10_000,
        run({ api, rng }) {
          api.spend(10_000);
          if (rng.chance(0.3)) {
            api.stat('brand', 14);
            return 'Inexplicably, it works. The story gets screenshotted into nine group chats you’ll never see, and by Thursday people say your brand is "having a moment". Marketing!';
          }
          api.stat('brand', 1);
          return 'The story runs at 2am, lasts 24 hours, and earns 11 likes. Three are from accounts named variations of her own name. You frame the invoice as modern art.';
        },
      },
      {
        label: 'Decline politely',
        run({ api, rng }) {
          if (rng.chance(0.4)) { api.stat('brand', -2); return 'She posts a story about "brands that don’t GET it" from a vantage point suspiciously close to your hotel. No names. Everyone knows.'; }
          return 'She shrugs, already scanning the terrace for the next logo with a wallet. You feel briefly invisible, then free.';
        },
      },
      {
        label: 'Counter-offer: €40 and a tray of croissants',
        run({ api, rng }) {
          if (rng.chance(0.25)) {
            api.spend(40); api.stat('brand', 8); api.stat('joie', 5);
            return 'Incredibly, she accepts — "carbs are so back". The croissant story does numbers. Her agent calls it "raw". Your CFO calls it the best ROI of the quarter.';
          }
          api.stat('joie', 3);
          return 'She looks at you the way you’d look at a fax machine. But a nearby strategist overhears and buys you a drink for services to the industry.';
        },
      },
    ],
  },
  {
    id: 'ceocall', tone: 'bad', weight: 10, when: [8, 11], once: true,
    where: ['cafferoma', 'stroll', 'cabanas'],
    cond: (s) => s.sleepDebt >= 1 || s.flags.gutterNight,
    title: 'An Incoming Call',
    text: 'Your CEO is calling. It is 9am. You are — technically, legally — still out from last night. Behind you, a beach club is already soundchecking for a party that starts in eleven hours.',
    options: [
      {
        label: 'Answer: "Just at a breakfast networking event!"',
        run({ api, rng }) {
          if (rng.chance(0.5)) {
            api.stat('brand', 3);
            return 'Technically true — the bar does serve coffee now. He’s impressed by your hustle. "Love the energy. Don’t come back without pipeline." You won’t, boss. You won’t.';
          }
          api.stat('brand', -5); api.stat('joie', -3);
          return 'The soundcheck chooses this exact moment to test, at full volume, the chant "CANNES, MAKE SOME NOISE." A silence. "We’ll talk when you’re back," says your CEO, in the tone of a man updating a spreadsheet about you.';
        },
      },
      {
        label: 'Decline. Text "in a meeting, call you in 10"',
        run({ api }) {
          api.stat('joie', -2);
          return 'He replies "ok". Two letters. No full stop. You will think about this "ok" at random moments for the rest of the trip.';
        },
      },
      {
        label: 'Answer with unearned, total confidence',
        run({ api, rng, s }) {
          if (s.energy > 40 && rng.chance(0.7)) {
            api.stat('brand', 5);
            return 'You deliver a flawless pipeline update from memory while a man in last night’s sequinned jacket sleeps upright at the next table. Your CEO calls it "the best stand-up of the quarter". It was, in every sense.';
          }
          api.stat('brand', -4);
          return 'You confidently report numbers from the wrong quarter, possibly the wrong company. "Are you reading someone else’s deck?" You were, in a way. You were.';
        },
      },
    ],
  },
  {
    id: 'rosebill', tone: 'bad', weight: 10, once: true,
    where: ['carlton', 'martinez', 'yachtrow'], when: [12, 22],
    title: 'For The Table',
    text: '"Shall we get a couple of bottles for the table?" someone said, ninety minutes ago. The table has since grown to eleven people, four of whom you’ve met. The bill arrives. It is €4,200. Everyone is suddenly fascinated by their phones.',
    options: [
      {
        label: 'Take the hit. Power move.', cost: 4_200,
        run({ api, rng }) {
          api.spend(4_200); api.stat('network', 7);
          if (rng.chance(0.45)) {
            const lead = api.lead(90_000);
            return `You sign it without flinching. Eleven people now owe you, and one — the ${lead.name} — pays up immediately: ${lead.valueText} of pipeline. The most expensive flex of the week, and it worked.`;
          }
          return 'You sign it without flinching. A legend is born on the terrace. Whether legends convert to pipeline remains an open research question.';
        },
      },
      {
        label: 'Initiate The Awkward Split', cost: 2_100,
        run({ api }) {
          api.spend(2_100); api.stat('network', -2); api.stat('joie', -2);
          return 'Nine people transfer instantly. Two develop sudden connectivity issues. You cover the difference while everyone watches a boat. The friendship of the table dies by Revolut.';
        },
      },
      {
        label: 'Go to the bathroom. Never return.',
        run({ api, rng }) {
          api.stat('joie', 4);
          if (rng.chance(0.25)) {
            api.stat('network', -6);
            return 'A clean escape — almost. A strategist clocks you leaving via the kitchen and the story is told at every dinner for the rest of the week, with your name attached and embellishments.';
          }
          return 'You exit through the lobby with the serenity of a person whose conscience died years ago. Somewhere behind you, eleven people meet the bill. The sea air has never tasted sweeter.';
        },
      },
    ],
  },
  {
    id: 'competitor', tone: 'bad', weight: 8, once: true,
    where: ['cabanas', 'carlton', 'cafferoma'], when: [9, 18],
    title: 'A Familiar Logo',
    text: 'Twenty minutes into the best pitch of your life, you notice the tote bag at your prospect’s feet. Your main competitor’s logo. Lanyard too. This is their client. Their flagship client. They look delighted with your pitch.',
    options: [
      {
        label: 'Finish the pitch. All’s fair on the Croisette.',
        run({ api, rng }) {
          if (rng.chance(0.45)) {
            const lead = api.lead(140_000, 1.1);
            api.stat('network', 3);
            return `You close like it’s the final of something. "Honestly? This is better than what we have." The ${lead.name} slides you a card — ${lead.valueText} of gloriously poached pipeline.`;
          }
          api.stat('brand', -4);
          return 'They were never buying — they were benchmarking. Your entire pitch is now a slide in your competitor’s QBR titled "Competitive Noise".';
        },
      },
      {
        label: 'Abort gracefully: "…and that’s why the category is exciting!"',
        run({ api }) {
          api.stat('joie', 2); api.stat('network', 1);
          return 'A pivot so smooth it qualifies as figure skating. They never knew it was a pitch. You exchange warm nothings and part as industry acquaintances, the safest of all relationships.';
        },
      },
      {
        label: 'Ask how things are going with the competitor. Listen. Take notes.',
        run({ api, rng }) {
          api.stat('network', 2);
          if (rng.chance(0.5)) {
            api.stat('brand', 3); api.flag('intel');
            return 'Twenty minutes of unfiltered griping later, you possess a complete map of your competitor’s weaknesses. You buy the coffee. Cheapest market research ever conducted.';
          }
          return '"Honestly? Couldn’t be happier with them." Wonderful. Lovely. Great use of an hour.';
        },
      },
    ],
  },
  {
    id: 'awards', tone: 'mixed', weight: 8, once: true, when: [17, 22],
    where: ['carlton', 'martinez', 'yachtrow', 'palais'],
    cond: (s) => s.dayIdx >= 2,
    title: 'The Big Night',
    text: 'A spare ticket to tonight’s awards ceremony has materialised — €1,600 and it’s yours. Black tie, gold statues, a room containing every budget-holder at the festival, and an open bar with a body count.',
    options: [
      {
        label: 'Go. Stay sharp. Work the room.', cost: 1_600,
        run({ api, rng }) {
          api.spend(1_600); api.stat('brand', 6); api.stat('energy', -8);
          if (rng.chance(0.6)) {
            const lead = api.lead(100_000);
            return `You nurse one champagne for three hours like a sniper. Between categories you land the ${lead.name} — ${lead.valueText}. The discipline. The restraint. Unheard of in this town.`;
          }
          return 'You work the room impeccably. Unfortunately the room is mostly other people working the room. It’s networkers all the way down.';
        },
      },
      {
        label: 'Go. Surrender to the evening.', cost: 1_600,
        run({ api, s }) {
          api.spend(1_600); api.stat('joie', 12); api.stat('network', 5); api.stat('energy', -16);
          s.sleepDebt += 1;
          return 'You remember: a standing ovation, a conga line containing at least two global CMOs, and crying genuine tears at an ad for insurance. A perfect night. Tomorrow disagrees.';
        },
      },
      {
        label: 'Skip it. Awards are an ad for the awards.',
        run({ api }) {
          api.stat('energy', 5); api.stat('joie', -1);
          return 'You have a quiet dinner instead and watch the fireworks from a distance, feeling superior and, briefly, lonely. Both feelings are accurate.';
        },
      },
    ],
  },
  {
    id: 'eviction', tone: 'bad', weight: 12, once: true, when: [8, 11],
    cond: (s) => s.digs === 'yacht',
    title: 'A Polite Request',
    text: 'Your phone rings. The yacht’s owner, in a voice of linen-smooth apology: "Tiny thing. Actual clients aboard today — could you stay off the boat till six? Also maybe don’t mention you sleep there. Or that we’ve met."',
    options: [
      {
        label: 'Comply. Vanish like sea mist.',
        run({ api }) {
          api.time(1); api.stat('joie', -2);
          return 'You assemble your life into a tote bag and exit via the service pontoon. Homeless until six, but with your yacht privileges — and the fiction of belonging — intact.';
        },
      },
      {
        label: '"What if I’m useful in the meeting?"',
        run({ api, rng }) {
          if (rng.chance(0.5)) {
            const lead = api.lead(110_000);
            api.stat('network', 4);
            return `The owner narrows his eyes, then deals you in as "my strategic advisor". You say three smart things and acquire the ${lead.name} — ${lead.valueText}. Rent, paid in full.`;
          }
          api.stat('joie', -4); api.time(1);
          return 'The owner stares at you for four seconds, then has a crew member escort you to the tender garage, where you wait among the jet skis like contraband.';
        },
      },
    ],
  },
  {
    id: 'rooftop', tone: 'good', weight: 7, once: true,
    where: ['stroll', 'oldtown'], when: [21, 27],
    title: 'The Unmarked Door',
    text: 'A fire-escape staircase. A velvet rope. No sign, no list visible, one enormous man. From somewhere above: the unmistakable laugh of someone who controls a nine-figure media budget.',
    options: [
      {
        label: 'Blag it: walk up like you own the building',
        run({ api, rng, s }) {
          const odds = 0.35 + s.network / 200;
          if (rng.chance(odds)) {
            const lead = api.lead(150_000, 1.2);
            api.stat('network', 8); api.stat('joie', 6);
            return `The man unhooks the rope without a word — confidence is the only credential. Upstairs is the real Cannes: twelve people, no lanyards, infinite budget. You leave with the ${lead.name} — ${lead.valueText}.`;
          }
          api.stat('joie', -3); api.time(1);
          return '"Name?" You say a name. It is, unfortunately, your actual name. An hour of your life evaporates at the bottom of a staircase listening to other people’s laughter.';
        },
      },
      {
        label: 'Loiter nearby. Someone you know will show up.',
        run({ api, rng }) {
          api.time(1);
          if (rng.chance(0.5)) {
            api.stat('network', 5); api.stat('joie', 4);
            return 'Sure enough, a friendly face from your grad-scheme days arrives — on the list, plus one. "Come on then." The rope opens. Loyalty is a strategy.';
          }
          return 'You loiter for an hour with studied nonchalance. Nobody comes. The bouncer begins, very slowly, to feel sorry for you, which is somehow the worst outcome of all.';
        },
      },
      { label: 'Leave. Mystery intact.', run() { return 'Some doors are better unopened. You walk on. The laughter fades. You’ll wonder about that staircase for years, and it will always be better than whatever was actually up there.'; } },
    ],
  },
  {
    id: 'penguin', tone: 'mixed', weight: 7, once: true,
    where: ['carlton', 'martinez', 'cafferoma'],
    title: 'Mistaken Identity',
    text: 'A famous CMO grips your arm with both hands. "The penguin campaign. The PENGUIN campaign. That work changed how I think about everything." You have never worked on a penguin campaign. You are not entirely sure penguins have campaigns.',
    options: [
      {
        label: 'Play along. You are penguin person now.',
        run({ api, rng }) {
          if (rng.chance(0.55)) {
            const lead = api.lead(120_000);
            return `"The penguins taught us all something," you say, with depth. Forty glorious minutes later you have the ${lead.name}’s direct line — ${lead.valueText}. The penguins, whoever they are, provide.`;
          }
          api.stat('brand', -5); api.stat('joie', -2);
          return 'It goes magnificently for ten minutes — until the actual penguin person joins the table. The silence that follows has texture. You leave during a story about Antarctica.';
        },
      },
      {
        label: 'Gently correct her',
        run({ api }) {
          api.stat('network', 4); api.stat('brand', 2);
          return '"Not me — but I’d love to hear what made it work." She blinks. "God. An honest person. At Cannes." She buys the coffees and remembers your actual name, which beats Henrik’s.';
        },
      },
      {
        label: '"The penguins changed my life too."',
        run({ api }) {
          api.stat('joie', 5);
          return 'You both stand in reverent silence for the penguins. No business is discussed. It is somehow the most genuine moment of your week.';
        },
      },
    ],
  },
  {
    id: 'pickpocket', tone: 'bad', weight: 9, when: [8, 11],
    where: ['stroll', 'cafferoma'],
    cond: (s) => s.digs === 'antibes',
    title: 'The 08:42 from Antibes',
    text: 'The morning train is a sardine tin of lanyards. As you pour out at Cannes, you feel it: your pocket is lighter. You’ve been pickpocketed somewhere between Juan-les-Pins and your dignity.',
    options: [
      {
        label: 'Check the damage',
        run({ api, rng }) {
          if (rng.chance(0.5)) { api.spend(200); return 'They got €200 in cash. They did not get the phone, the cards, or the lanyard. A professional, merciful tax on commuter naivety.'; }
          api.stat('joie', 2);
          return 'They took the festival tote bag — which contained six other tote bags, a stress ball, and a white paper on attention metrics. Somewhere a thief is opening their haul with mounting despair. You feel weirdly avenged.';
        },
      },
      {
        label: 'Give chase along the platform',
        run({ api, rng }) {
          api.stat('energy', -8);
          if (rng.chance(0.3)) { api.stat('joie', 6); return 'You catch them at the escalator. They hand everything back with a shrug of professional respect. A platform of delegates applauds. Today, you are the keynote.'; }
          return 'You sprint thirty metres in festival footwear before pulling up like a injured racehorse. The thief vanishes. A teenager films the whole thing. Pray it stays off LinkedIn.';
        },
      },
    ],
  },
  {
    id: 'totes', tone: 'good', weight: 6, where: ['palais'],
    title: 'The Tote Singularity',
    text: 'You look down. You are carrying nine tote bags. Each contains brochures, a smaller tote bag, and a single branded item of confusing purpose. One bag simply says "DATA IS THE NEW STORYTELLING".',
    options: [
      { label: 'Keep them. They spark joy.', run({ api }) { api.stat('joie', 2); return 'You commit to the totes. You are a tote person now. Your arm hurts but your shelf back home will speak of this week for decades.'; } },
      { label: 'Abandon them on a bench like kittens', run({ api }) { api.stat('energy', 3); return 'You leave the totes in a neat row. Within four minutes, delegates have adopted them all. The circle of swag continues, eternal.'; } },
    ],
  },
  {
    id: 'speaker', tone: 'good', weight: 6, once: true, where: ['palais'], when: [10, 17],
    title: 'A Gap in the Programme',
    text: 'A producer with a headset and the eyes of a hostage scans the lobby and locks onto you. "Our 2pm dropped out. Stage Three. You know about AI, right? You look like you know about AI. Please. PLEASE."',
    options: [
      {
        label: '"Absolutely." (You can do this.)',
        run({ api, rng, s }) {
          api.time(1);
          if (s.energy > 35 && rng.chance(0.6)) {
            const lead = api.lead(90_000);
            api.stat('brand', 14); api.stat('network', 5);
            return `You wing twenty minutes on AI and audiences off pure adrenaline and it LANDS. Photos of your slide circulate. The ${lead.name} finds you afterwards — ${lead.valueText}. Career highlight, achieved by accident.`;
          }
          api.stat('brand', -6);
          return 'You say "synergy" eleven times and at one point call the audience "stakeholders". A man in row two films the lowlights. Stage Three will haunt you.';
        },
      },
      { label: 'Decline, but suggest your competitor by name', run({ api, rng }) { if (rng.chance(0.5)) { api.stat('joie', 6); return 'Your competitor takes the slot unprepared and dies on stage at 2pm before a full room. You watch from the back, eating an ice cream. You are not proud. You are not NOT proud.'; } api.stat('joie', -2); return 'Your competitor takes the slot and is, devastatingly, brilliant. They trend. You personally built this. An own goal for the ages.'; } },
      { label: 'Melt backwards into the crowd', run() { return 'You perform the festival dissolve: two steps back, a quarter-turn, gone. The producer locks onto a man holding a smoothie. Godspeed, smoothie man.'; } },
    ],
  },
  {
    id: 'journalist', tone: 'mixed', weight: 7, when: [9, 19],
    where: ['palais', 'carlton', 'cafferoma', 'stroll'],
    title: 'On The Record',
    text: 'A trade journalist materialises, recorder already running. "Quick comment on the state of creativity?" Behind her eyes: a deadline, three espressos, and the will to misquote.',
    options: [
      {
        label: 'Serve a spicy hot take',
        run({ api, rng }) {
          if (rng.chance(0.5)) { api.stat('brand', 8); return 'Your quote — sharp, quotable, only slightly reckless — leads the morning newsletter. Strangers nod at you on the Croisette. You ARE the discourse now.'; }
          api.stat('brand', -5);
          return 'Your nuanced 90-second answer is compressed to four words: "[Your brand] exec slams creativity". Your CMO texts a single question mark.';
        },
      },
      { label: 'Deploy the media-trained non-answer', run({ api }) { api.stat('brand', 1); return '"It’s an exciting time of change and we’re leaning in." Beautiful. Says nothing, offends no one, evaporates on contact. Communications gold.'; } },
      { label: '"Everything is an ad for something."', run({ api, rng }) { api.stat('joie', 3); if (rng.chance(0.3)) { api.stat('brand', 6); return 'She stares at you, then writes it down very slowly. By Friday it’s the headline of a think piece and two keynote slides. Accidental philosopher.'; } return 'She nods politely and leaves. Some pearls find no oyster. You whisper it again to yourself. Still bangs.'; } },
    ],
  },
  {
    id: 'cryptobros', tone: 'bad', weight: 7, where: ['yachtrow', 'gutter', 'carlton'],
    title: 'They’re Back',
    text: 'Three men in identical white linen materialise around you like a boy band of confidence. They want to put your brand "on-chain". They have a yacht, a deck (47 slides), and no discernible product. "It’s a flywheel," one says. The others nod at the sea.',
    options: [
      {
        label: 'Hear them out (one hour of your life)',
        run({ api, rng }) {
          api.time(1);
          if (rng.chance(0.2)) {
            const lead = api.lead(80_000);
            return `Astonishingly, behind the linen and the flywheel sits an actual budget. You redirect the meeting to things that exist, and extract the ${lead.name} — ${lead.valueText}. Even broken clocks own yachts.`;
          }
          api.stat('joie', -3);
          return 'One hour. Forty-seven slides. The word "ecosystem" used as noun, verb, and at one point a toast. You will never get this hour back, and neither will they, but they don’t know it.';
        },
      },
      { label: 'Decline: "We’re more of an off-chain brand"', run({ api }) { api.stat('joie', 3); return '"Off-chain," one repeats, shaken. They huddle. You have introduced doubt into the flywheel. You walk away taller.'; } },
      {
        label: 'Reverse-pitch them your product instead',
        run({ api, rng }) {
          if (rng.chance(0.35)) { const lead = api.lead(60_000); return `Audacity recognises audacity. The least linen of the three turns out to control real marketing spend for a real exchange — the ${lead.name}, ${lead.valueText}. The flywheel, at last, spins for you.`; }
          api.stat('joie', 2);
          return 'You pitch; they counter-pitch; everyone pitches; nothing lands. It’s pitches all the way down. You part with mutual, hollow promises to "build together".';
        },
      },
    ],
  },
  {
    id: 'queue_cmo', tone: 'good', weight: 9, where: ['gutter'], when: [23, 27],
    title: 'The Great Equaliser',
    text: 'The Gutter Bar queue does not care who you are. It does not care who anyone is. The CMO beside you — a name from the trade press — finds this hilarious. You have eleven minutes of forced intimacy ahead.',
    options: [
      {
        label: 'Talk shop. The clock is ticking.',
        run({ api, rng }) {
          if (rng.chance(0.55)) { const lead = api.lead(100_000); return `Queue chemistry is real. By minute nine you have the ${lead.name}’s personal number and a "call me Tuesday, not the office line". ${lead.valueText}, secured on a pavement.`; }
          api.stat('network', 2);
          return '"Mate. It’s 1am. If you mention attribution models again I’m getting back in the taxi." Noted. The queue inches forward in silence.';
        },
      },
      {
        label: 'Talk absolutely anything but shop',
        run({ api, rng }) {
          api.stat('network', 6); api.stat('joie', 5);
          if (rng.chance(0.3)) { const lead = api.lead(70_000); return `Eleven minutes on football, sea swimming and whether a hot dog is a sandwich. At the door she says "send me that thing you do, whatever it is" — ${lead.valueText} from the ${lead.name}, no pitch required.`; }
          return 'Eleven minutes of actual human conversation. No agenda survives the Gutter Bar queue, and that’s precisely its magic. You part as genuine acquaintances.';
        },
      },
      { label: 'Offer the bouncer €200 to jump the queue', cost: 200, run({ api, rng }) { api.spend(200); if (rng.chance(0.5)) { api.stat('network', 4); api.stat('joie', 3); return 'The rope opens. The CMO raises an eyebrow: "Efficient. I like efficient." She follows you in. Money CAN buy respect, in increments of two hundred.'; } api.stat('joie', -4); return 'The bouncer pockets the €200, looks through you like glass, and admits two interns instead. The CMO witnesses everything. The queue has rules, and you have learned them.'; } },
    ],
  },
  {
    id: 'droneshow', tone: 'good', weight: 6, where: ['stroll', 'cabanas'], when: [21, 25], once: true,
    title: 'Lights Over The Bay',
    text: 'A thousand drones rise over the water and assemble into a sneaker, then a QR code, then — briefly, wrongly — a shape no brand intended. The whole Croisette looks up as one.',
    options: [
      { label: 'Watch. Just watch.', run({ api }) { api.stat('joie', 5); api.stat('network', 2); return 'For four minutes nobody networks. A stranger says "we used to just have fireworks" with infinite sadness, and you both laugh. Sometimes Cannes is lovely.'; } },
      { label: 'Pitch the person next to you mid-show', run({ api }) { api.stat('network', -3); api.stat('joie', -2); return '"So speaking of audience segmentation—" "Mate. The drones." Never pitch during the drones. Everyone knows you never pitch during the drones.'; } },
    ],
  },
  {
    id: 'minibar', tone: 'mixed', weight: 8, when: [23, 27],
    where: ['stroll', 'carlton', 'martinez', 'gutter'],
    cond: (s) => s.digs === 'hotel',
    title: 'The Minibar Question',
    text: 'You nip back to your room between stops to change shoes. The minibar glows like a shrine. A tube of Pringles: €38. A miniature gin: €31. A "wellness bar" of unclear composition: €24. The prices are a hate crime. The hunger is real.',
    options: [
      { label: 'Eat the €38 Pringles', cost: 38, run({ api }) { api.spend(38); api.stat('joie', 4); api.stat('energy', 3); return 'Once you pop, the invoice is generated automatically. Worth it. At 1am, on the Croisette, the Pringle knows no rival.'; } },
      { label: 'Resist. Drink tap water like a monk.', run({ api }) { api.stat('joie', -2); api.stat('energy', 1); return 'You stand in the dark drinking bathroom-tap water, gazing at the glowing fridge of forbidden snacks. Discipline. The CFO would weep with pride, if the CFO ever wept.'; } },
      { label: 'Eat it AND expense it as "client entertainment"', cost: 38, run({ api, rng }) { api.spend(38); api.stat('joie', 5); api.stat('energy', 3); if (rng.chance(0.2)) { api.stat('brand', -3); return 'Delicious. Three weeks from now, an expense auditor named Carol will flag "PRINGLES — CLIENT ENT." and a meeting will be scheduled. The Pringles will not attend.'; } return 'Delicious, and the paperwork is — let’s say — defensible. Somewhere a client was entertained, spiritually.'; } },
    ],
  },
  {
    id: 'wrongyacht', tone: 'mixed', weight: 7, where: ['yachtrow'], when: [11, 19],
    title: 'Permission To Board',
    text: 'You stride up a gangway with total confidence and into the middle of a French family’s lunch. This is not the meeting yacht. This is the Garniers of Lyon, and they are having salade niçoise, and they are staring.',
    options: [
      { label: 'Apologise and reverse, with dignity', run({ api }) { api.stat('joie', -1); return 'You execute a 14-point turn on a gangway while a grandmother watches you the entire way down. "Bonne journée," she says, devastatingly.'; } },
      {
        label: 'Compliment the rosé. Stay twenty minutes.',
        run({ api, rng }) {
          api.stat('joie', 4);
          if (rng.chance(0.15)) { const lead = api.lead(50_000); return `Monsieur Garnier, it transpires, is CFO of a retail group and finds your accidental boarding "très startup". Lunch extends. ${lead.valueText} of pipeline from the ${lead.name}, plus the recipe for the dressing.`; }
          return 'The Garniers, after a wary moment, deal you in. You eat a magnificent lunch with strangers and learn nothing about advertising, which is its own kind of win.';
        },
      },
      { label: 'Dive overboard. Swim away.', run({ api, rng }) { api.stat('energy', -6); api.stat('joie', 6); if (rng.chance(0.5)) { api.stat('network', 5); return 'You surface to applause from three neighbouring yachts. By evening you are "the dive guy". People buy the dive guy drinks. The dive guy abides.'; } return 'A bold exit, marred only by your lanyard, phone and one shoe entering the Mediterranean with you. The Garniers will tell this story forever, and so will you.'; } },
    ],
  },
  {
    id: 'karaoke', tone: 'good', weight: 7, where: ['manolans', 'gutter'], when: [21, 27], once: true,
    title: 'The Back Room',
    text: 'An agency has hired the back room for karaoke. Through the door: the opening bars of a song you know dangerously well, and at least four people you’ve been failing to meet all week. Someone hands you the microphone. It is already on.',
    options: [
      {
        label: 'Sing. Fully commit.',
        run({ api, rng }) {
          api.stat('joie', 8); api.stat('energy', -5);
          if (rng.chance(0.6)) { api.stat('network', 8); const lead = api.lead(60_000); return `Your Wonderwall unites the industry. Agencies and clients, arm in arm. As the final chorus dies, the ${lead.name} grips your shoulder: "Whatever you’re selling, I’m in." ${lead.valueText}, won by voice alone.`; }
          return 'You commit so hard the key changes twice without your consent. The room is generous; the recording, which exists, is not. A character-building performance.';
        },
      },
      { label: 'Decline. Hand it to the nearest CEO.', run({ api, rng }) { api.stat('network', 3); if (rng.chance(0.5)) { api.stat('joie', 4); return 'The CEO performs a power ballad with terrifying sincerity. They will remember you as the person who gave them their moment. Strategic humility: the rarest Cannes skill.'; } return 'The CEO declines too. The mic passes down a chain of refusals to an intern, who is — naturally — incredible, and gets promoted by Friday.'; } },
    ],
  },
  {
    id: 'taxisurge', tone: 'bad', weight: 9, when: [25, 27],
    cond: (s) => s.digs !== 'hotel' && s.digs !== 'yacht',
    title: 'Surge Pricing',
    text: 'It’s deep into the night and the taxi app is showing a price with its own gravitational field: €290 for a journey you could almost throw a croissant along. The little car icons circle like sharks.',
    options: [
      { label: 'Pay it. Sleep is priceless.', cost: 290, run({ api }) { api.spend(290); return 'The driver, sensing apex pricing, offers water and a phone charger like an apology. You watch the meter the whole way home in respectful horror.'; } },
      { label: 'Walk it (50 minutes)', run({ api }) { api.time(1); api.stat('energy', -7); api.stat('joie', 2); return 'A fifty-minute walk along a silent Croisette, sea on your left, regrets on your right. Genuinely beautiful. Your feet file a formal complaint at minute forty.'; } },
      { label: 'Unlock one of those scooters', cost: 18, run({ api, rng }) { api.spend(18); if (rng.chance(0.5)) { api.stat('joie', 7); return 'Warm night air, empty promenade, 25km/h of pure illegal-feeling freedom. You arrive home grinning like an idiot. Ten out of ten, no notes.'; } api.stat('energy', -8); api.stat('joie', -3); return 'The Old Town cobbles defeat you at low speed in front of a closing restaurant. Staff applaud. Only your dignity is bruised — and one knee. Mostly the dignity.'; } },
    ],
  },
  {
    id: 'cfotext', tone: 'mixed', weight: 8, when: [20, 26], cond: (s) => s.dayIdx >= 2,
    title: 'A Text From Finance',
    text: 'Your phone lights up. The CFO: "How’s pipeline looking? 👀" The eyes emoji does a lot of work. It is 11:43pm where you are and the CFO knows it.',
    options: [
      {
        label: 'Reply with actual numbers',
        run({ api, s }) {
          if (s.leadValue > s.spend) { api.stat('brand', 4); return 'You send the running total. A pause. Then: "ok good 👍". From this CFO, that thumbs-up is a standing ovation, a parade, a knighthood.'; }
          api.stat('joie', -3);
          return 'You send the running total. The typing indicator appears. Stops. Appears. Stops. No reply ever comes. The silence will outlive you.';
        },
      },
      { label: 'Reply "🦁"', run({ api, rng }) { api.stat('joie', 3); if (rng.chance(0.3)) { api.stat('joie', -2); return 'Three minutes later: "??" — then, an hour later, "is that a cat". Do not text the CFO emojis. This is now a documented learning.'; } return 'The CFO replies "🦁🦁". A bond has formed that neither of you will ever speak of again. Finance contains multitudes.'; } },
      { label: 'Leave it on read until morning', run({ api }) { api.stat('joie', 1); return 'Boundaries. The morning version of you can handle the CFO. The night version of you has important networking to do.'; } },
    ],
  },
  {
    id: 'mysterycabana', tone: 'mixed', weight: 6, where: ['cabanas'], once: true,
    title: 'The Unbranded Tent',
    text: 'Between the tech-platform pavilions stands a single, pristine, completely unbranded cabana. No logo. No signage. A queue of twelve senior marketers waits outside. Nobody in the queue knows what it’s for. The mystery IS the strategy.',
    options: [
      {
        label: 'Join the queue (one hour)',
        run({ api, rng }) {
          api.time(1);
          if (rng.chance(0.5)) { api.stat('network', 5); api.stat('joie', 3); return 'It is, of course, a stealth-mode AI startup’s "sensory cold-plunge experience". You emerge freezing, exhilarated, and bonded for life with the eleven executives who plunged beside you.'; }
          api.stat('brand', 2); api.stat('joie', 4);
          return 'It is empty. Completely empty. A single card on the floor reads "You waited. That’s the insight." Infuriatingly, you ARE going to use this in a deck.';
        },
      },
      { label: 'Refuse, loudly, on principle', run({ api }) { api.stat('joie', 2); return '"I will not queue for an unmarked tent," you announce. Two people leave the queue, liberated by your courage. The tent’s mystique grows regardless. The tent always wins.'; } },
    ],
  },
  {
    id: 'oldfriend', tone: 'good', weight: 8, where: ['manolans', 'cafferoma', 'carlton'],
    title: 'A Face From Before',
    text: 'Across the room: someone from your grad-scheme intake, fifteen years and several careers later. You shared a desk, a hangover or two, and the worst Christmas party in agency history. They are now, the lanyard says, a CEO.',
    options: [
      {
        label: 'Catch up properly. No agenda.',
        run({ api, rng }) {
          api.stat('joie', 6); api.stat('network', 4);
          if (rng.chance(0.4)) { const lead = api.lead(80_000); return `An hour of old stories and honest career talk. At the end, unprompted: "You know what, my team should see what you do — I’ll set it up." The ${lead.name}, ${lead.valueText}. Friendship: the original CRM.`; }
          return 'You laugh for an hour about the Christmas party (the fire alarm, the swan). No business changes hands. Your week is unmistakably better for it.';
        },
      },
      { label: 'Pitch them within ninety seconds', run({ api, rng }) { if (rng.chance(0.5)) { const lead = api.lead(70_000); return `Shameless — and effective. "Same old you," they grin, and take the meeting anyway. ${lead.valueText} from the ${lead.name}. Old friends forgive fast pitches. Once.`; } api.stat('network', -3); api.stat('joie', -3); return '"Wow. Ninety seconds. That’s a record, even for this place." The warmth drains from the reunion like rosé from an ice bucket. You made it weird.'; } },
      { label: 'Pretend you haven’t seen them', run({ api }) { api.stat('joie', -2); return 'You study the wall menu with the intensity of a code-breaker until they leave. Why did you do that? You don’t know. The festival makes ghosts of us all.'; } },
    ],
  },
  {
    id: 'petanque', tone: 'good', weight: 6, where: ['oldtown'], when: [10, 19], once: true,
    title: 'Boules',
    text: 'In a dusty square up the hill, four old men are playing pétanque with the gravity of a UN summit. One of them catches your eye and holds up a spare boule. An invitation. A test. Possibly both.',
    options: [
      {
        label: 'Play',
        run({ api, rng }) {
          api.time(1); api.stat('joie', 7); api.stat('energy', 4);
          if (rng.chance(0.2)) { const lead = api.lead(90_000); return `You play for an hour and lose magnificently. Afterwards, over pastis, the quiet one mentions his daughter runs marketing for a hotel group — "she should meet you". The ${lead.name}, ${lead.valueText}. The boules provide.`; }
          return 'An hour of pétanque, pastis and ferocious tutting. You learn three French words, all of them about your throwing technique. The festival feels very far away. Perfect.';
        },
      },
      { label: 'Watch respectfully from the wall', run({ api }) { api.stat('joie', 3); api.stat('energy', 2); return 'Twenty minutes of pure theatre. A disputed measurement nearly ends a sixty-year friendship, then doesn’t. Better than any keynote.'; } },
    ],
  },
  {
    id: 'pitboss', tone: 'mixed', weight: 8, where: ['casino'], once: true,
    title: 'Monsieur Is Too Kind',
    text: 'The floor manager glides over, all cufflinks and discretion. "Monsieur. Your usual table is ready. The Krug is already on ice." You have never been here before. He has mistaken you for someone who loses heroically.',
    options: [
      {
        label: 'Accept your usual table',
        run({ api, rng }) {
          if (rng.chance(0.5)) {
            const lead = api.lead(110_000);
            api.stat('network', 6); api.stat('joie', 6);
            return `The "usual table" comes with complimentary champagne and two actual whales, one of whom — the ${lead.name} — assumes anyone seated here is worth knowing. ${lead.valueText}, won without placing a bet.`;
          }
          api.stat('joie', -3);
          return 'Twenty minutes of bluffing later, the REAL regular arrives — same haircut, better watch. You are escorted, gently but unmistakably, back to general population. The Krug stays.';
        },
      },
      { label: '"I think you have me confused with someone."', run({ api }) { api.stat('joie', 2); api.stat('network', 1); return '"Of course, Monsieur. My apologies." A pause. "Should Monsieur ever wish to BECOME that someone, we open at two." Genuinely the best sales technique you’ve seen all week, and you’ve seen four thousand.'; } },
    ],
  },
  {
    id: 'cmoblackjack', tone: 'mixed', weight: 9, where: ['casino'], once: true,
    title: 'Down Bad',
    text: 'At the blackjack table: the CMO you’ve been chasing all week. They are losing — properly losing — with the grim focus of someone whose Q3 numbers are also a gamble. The seat beside them is open.',
    options: [
      {
        label: 'Sit down. Lose alongside them.', cost: 800,
        run({ api, rng }) {
          api.spend(800); api.stat('joie', 2);
          if (rng.chance(0.6)) {
            const lead = api.lead(120_000);
            api.stat('network', 6);
            return `You lose €800 in respectful solidarity, and somewhere around the fourth bad hand the walls come down. "Nobody pitches me at a blackjack table," they say. "I like that." Monday call booked — the ${lead.name}, ${lead.valueText}.`;
          }
          return 'You lose €800 together in companionable silence. They nod at you on departure — the nod of shared ruin. Not pipeline, but not nothing.';
        },
      },
      { label: 'Quietly suggest they walk away', run({ api, rng }) { if (rng.chance(0.5)) { api.stat('network', 8); const lead = api.lead(80_000); return `They stare at you, then at the table, then push back their chair. "You’re the only person this week who’s told me to spend LESS." The ${lead.name} owes you one — ${lead.valueText} worth, it turns out.`; } api.stat('network', -4); return '"I’m sorry — do you work for my wife?" They double down out of spite, win, and point at you while collecting. The story will not be told in your favour.'; } },
      { label: 'Leave them their dignity', run({ api }) { api.stat('joie', 1); return 'Some moments aren’t networking opportunities. You drift past, unseen. Tomorrow they’ll be a CMO again; tonight they’re just a person versus mathematics.'; } },
    ],
  },
  {
    id: 'luckychip', tone: 'good', weight: 7, where: ['casino'], once: true,
    title: 'A Chip on the Carpet',
    text: 'Under your shoe: a €100 chip, abandoned to the carpet like a startup’s second pivot. Nobody is looking. Everybody, in a casino, is technically always looking.',
    options: [
      {
        label: 'Straight onto zero. Fate demands it.',
        run({ s, api, rng }) {
          if (rng.chance(1 / 37)) {
            api.win(3_500); api.stat('joie', 12);
            return 'ZERO. THE FOUND CHIP HITS ZERO. €3,500 of pure cosmic comedy. The croupier allows himself one eyebrow. You will tell this story at every dinner until you die.';
          }
          api.stat('joie', 2);
          return 'It lands on 23. The universe gave you a free chip and took it back in nine seconds — the full Cannes experience in miniature. Still a great story.';
        },
      },
      { label: 'Cash it in like a coward', run({ api }) { api.win(100); return 'One hundred euros, laundered into your pocket via window. The most honest money you’ll make all week, in that nobody had to sit through a deck for it.'; } },
      { label: 'Hand it to the croupier', run({ api }) { api.stat('joie', 1); api.stat('network', 1); return '"Monsieur." The croupier inclines his head four degrees — the casino equivalent of a standing ovation. Several gamblers regard you as either a saint or an idiot. In here, same thing.'; } },
    ],
  },
  {
    id: 'procurement', tone: 'bad', weight: 7, where: ['casino'], when: [20, 27], once: true,
    title: 'A Familiar Face at the Roulette Table',
    text: 'At the far roulette table, hunched and sweating: your company’s Head of Procurement. The man who rejected your €40 taxi receipt in March. In front of him: a stack of chips that looks suspiciously like the Q3 events budget.',
    options: [
      { label: 'Make eye contact. Hold it. Say nothing.', run({ api }) { api.stat('joie', 7); api.flag('procurementLeverage'); return 'His face does something complicated. You nod — the slow nod of a person whose expense reports will never be questioned again — and glide away. Power has changed hands tonight, silently, forever.'; } },
      {
        label: 'Pull up a chair: "What are we playing?"', cost: 500,
        run({ s, api, rng }) {
          api.spend(500); s.gambleNet -= 500;
          if (rng.chance(0.5)) {
            api.win(1_500); api.stat('joie', 6); api.stat('network', 3);
            return 'You win €1,500 together on a shared red and become, against every policy he has ever written, friends. "The taxi thing," he says at 1am, "that was petty of me." Healing.';
          }
          api.stat('joie', 3);
          return 'You lose together. Bonding through mutual destruction — the procurement way. He approves your next expense report from the table, on his phone, in full.';
        },
      },
      { label: 'Photograph nothing. You’re better than that.', run({ api }) { api.stat('joie', 2); return 'You walk away clean. Some leverage corrupts the soul, and besides — knowing is enough. Knowing is always enough.'; } },
    ],
  },
  {
    id: 'wifi', tone: 'good', weight: 5, where: ['palais'],
    title: 'Connectivity Issues',
    text: 'The Palais wifi collapses under the weight of four thousand people uploading the same photo of the same stage. Around you, demos die mid-sentence. A man whispers "it works on the conference network" to a screen that knows it doesn’t.',
    options: [
      { label: 'Offer your hotspot to a stranger in need', run({ api, rng }) { api.stat('network', 3); if (rng.chance(0.35)) { const lead = api.lead(45_000); return `Your hotspot saves a drowning product demo. Its owner — the ${lead.name} — owes you their quarter. ${lead.valueText} of gratitude-based pipeline. Infrastructure is the ultimate icebreaker.`; } return 'You save three strangers’ demos with your hotspot. They form a small, devoted cult around you until the wifi returns. Kindness at scale.'; } },
      { label: 'Enjoy the silence', run({ api }) { api.stat('joie', 3); return 'For eleven beautiful minutes, nobody can show anyone a dashboard. People talk. Eye contact occurs. Then the wifi returns and the spell breaks. You were there. You remember.'; } },
    ],
  },
];
