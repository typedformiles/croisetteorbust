// The five reels of fate. Weights skew low-middle so the jackpot feels like one.

export const BUDGET_REEL = [
  { value: 5_000, par: 145,    label: '$5k',    weight: 16,
    flavour: 'Travel freeze. And yes, that includes your flights.',
    company: 'You represent a bootstrapped startup of five people, and the company’s entire marketing budget is currently in your pocket. The product is genuinely great. The runway is eleven weeks. No pressure.',
    flight: { cost: 480, label: 'a 6am budget flight from Luton, middle seat' } },
  { value: 15_000, par: 60,   label: '$15k',   weight: 22,
    flavour: 'Marketing found some Q2 underspend down the back of the sofa.',
    company: 'You represent a scrappy seed-stage outfit that describes itself as “the category leader” in a category it invented last quarter. Nobody at this festival has heard of you. By Friday, that’s your problem to fix.',
    flight: { cost: 1_100, label: 'economy, but you got an aisle' } },
  { value: 40_000, par: 39,   label: '$40k',   weight: 20,
    flavour: 'Approved — but the CFO wants "a full debrief deck" after.',
    company: 'You represent a Series A startup with a fresh rebrand, a confident deck, and a CEO who says “land and expand” in his sleep. The board wants logos. Recognisable ones. By Q3.',
    flight: { cost: 2_700, label: 'premium economy and a lounge pass' } },
  { value: 100_000, par: 29,  label: '$100k',  weight: 16,
    flavour: 'The CMO signed it off without reading it. Do not make her read it.',
    company: 'You represent a scale-up that just hired its first proper CFO — who personally reviewed this trip’s budget, line by line, while maintaining eye contact with you.',
    flight: { cost: 5_400, label: 'business class, warm nuts' } },
  { value: 250_000, par: 26,  label: '$250k',  weight: 13,
    flavour: 'Finance had a good quarter. Finance will not have a good quarter again.',
    company: 'You represent an established vendor defending its turf. The brand is known, the renewals are wobbly, and Cannes is traditionally where wobbles get fixed — or become public.',
    flight: { cost: 9_200, label: 'business class with a flat bed you won’t use' } },
  { value: 750_000, par: 16,  label: '$750k',  weight: 8,
    flavour: 'New CEO wants to "make some noise". You are the noise.',
    company: 'You represent a public company with a brand-new CEO who wants “noise”. You are the noise. Legal has pre-approved three jokes and would prefer you used none of them.',
    flight: { cost: 31_000, label: 'first class. The pyjamas are yours to keep' } },
  { value: 2_500_000, par: 2.5, label: '$2.5M', weight: 5, jackpot: true,
    flavour: 'The board saw a competitor’s yacht on LinkedIn. Go fix it.',
    company: 'You represent THE hottest AI startup at the festival — fresh off a nine-figure round and promising to change advertising forever. Nobody is entirely sure what the product does. Everyone wants on your yacht.',
    flight: { cost: 180_000, label: 'a private jet out of Farnborough' } },
];

// Festival week. Index into TRIP_DAYS.
export const TRIP_DAYS = [
  { name: 'SAT', date: 'Jun 20' },
  { name: 'SUN', date: 'Jun 21' },
  { name: 'MON', date: 'Jun 22' },
  { name: 'TUE', date: 'Jun 23' },
  { name: 'WED', date: 'Jun 24' },
  { name: 'THU', date: 'Jun 25' },
  { name: 'FRI', date: 'Jun 26' },
  { name: 'SAT', date: 'Jun 27' },
];

export const ARRIVAL_REEL = [
  { value: 1, label: 'SUN', weight: 45, flavour: 'Settling-in day. The rosé is already cold.' },
  { value: 2, label: 'MON', weight: 55, flavour: 'Straight off the plane and into it.' },
];

export const DEPARTURE_REEL = [
  { value: 3, label: 'TUE', weight: 14, flavour: 'A 48-hour smash-and-grab. Every hour has to earn its keep.' },
  { value: 4, label: 'WED', weight: 28, flavour: 'A flying visit. No second chances.' },
  { value: 5, label: 'THU', weight: 33, flavour: 'Out before the closing-night carnage.' },
  { value: 6, label: 'FRI', weight: 25, flavour: 'The full distance. Pace yourself.' },
];

export const DIGS_REEL = [
  { value: 'antibes', label: 'ANTIBES APT', weight: 24,
    name: 'an apartment in Antibes',
    flavour: 'Lovely place. Shame about the 25-minute train. Last one back is 00:50.',
    perks: 'Day starts late (train in). Miss the last train and it gets expensive.',
    startHour: 10 },
  { value: 'carnot', label: 'CARNOT PAD', weight: 21,
    name: 'a flat off Boulevard Carnot',
    flavour: 'Central-ish. The lift is broken. The fridge contains one (1) artisanal yoghurt.',
    perks: 'No bonuses, no penalties. The beige option.',
    startHour: 9 },
  { value: 'villa', label: 'GARDES VILLA', weight: 18,
    name: 'a shared villa up in Croix de Gardes',
    flavour: 'Pool, pines, and eleven colleagues from the Singapore office.',
    perks: 'Quiet nights — you sleep a little better up the hill.',
    startHour: 9, sleepBonus: true },
  { value: 'hotel', label: 'CROISETTE HOTEL', weight: 22,
    name: 'a hotel right on the Croisette',
    flavour: 'You can see the Palais from your window. The minibar can see your weaknesses.',
    perks: 'Roll out of bed into the action — extra usable hour every day.',
    startHour: 8 },
  { value: 'yacht', label: 'THE YACHT', weight: 15,
    name: 'a cabin on a yacht in the Vieux Port',
    flavour: 'A friend of a friend’s yacht. You sleep where the action is. Try not to mention it’s not yours.',
    perks: 'Extra hour daily, and Yacht Row treats you like one of their own.',
    startHour: 8, status: true },
];

// The $2.5M jackpot comes with a $500k yacht charter pre-charged — the DIGS
// reel is overridden and your home for the week IS Yacht Row.
export const OWN_YACHT_DIGS = {
  value: 'ownyacht', label: 'YOUR YACHT', charter: 500_000,
  name: 'your own 40-metre charter on the jetée',
  flavour: 'The board pre-approved a $500k yacht charter. "Optics," they said. It has a crew, a hot tub, and YOUR name on the welcome screen.',
  perks: 'Your home IS Yacht Row: extra hour daily, instant status, and you do the hosting now.',
  startHour: 8, status: true, sleepBonus: true,
};

export const PASS_REEL = [
  { value: true, label: 'FESTIVAL PASS', weight: 55,
    flavour: 'A delegate badge. Your face, laminated. The Palais is yours.' },
  { value: false, label: 'NO BADGE', weight: 45,
    flavour: 'No badge this year — "we’re focusing on the fringe." The Palais is NOT yours.' },
];

export const RESPIN_PENALTY = 0.10;
