export const DEFAULT_LOCALE = "si";
export const SUPPORTED_LOCALES = ["si", "en"];

const STRINGS = {
  si: {
    langTag: "si-LK",
    pageTitle: "ඔමි සිංහල කාඩ් ක්‍රීඩාව",
    static: {
      heroEyebrow: "ශ්‍රී ලාංකික ට්‍රික්-ටේකින්",
      heroTitle: "ඔමි, නවීන මේස අත්දැකීමක් ලෙස නැවත ගොඩනගා ඇත.",
      heroText:
        "ප්‍රභල ට්‍රම්ප් තේරීම, නිවැරදි ට්‍රික් නීති සහ උත්සවමය බවක් ඇති මේස සැලැස්මක් සමඟ සම්ප්‍රදායික සිංහල සහකාර කාඩ් ක්‍රීඩාව රඟපාන්න.",
      tagDeck: "කාඩ් 32 පැක්කුව",
      tagTrump: "කාඩ් 4කට පසු ට්‍රම්ප් තෝරන්න",
      tagScore: "ටෝකන් 10ට තරඟය",
      matchState: "තරඟ තත්ත්වය",
      dealer: "ඩීලර්",
      trump: "ට්‍රම්ප්",
      lead: "ඉදිරිපත් කරන අසුන",
      scoreToWin: "ජය සීමාව",
      coreRules: "මූලික නීති",
      rules1: "ක්‍රීඩකයන් හතර දෙනා දෙකේ කණ්ඩායම් දෙකක් ලෙස විරුද්ධ අසුනේ ඉඳී.",
      rules2: "සෑම ක්‍රීඩකයෙකුම කාඩ් 4ක් පමණක් දුටු පසු ට්‍රම්ප් තෝරයි.",
      rules3: "ඔබට ඇති නම් ඒ සූට් එකට පිළිතුරු දිය යුතුය.",
      rules4: "ට්‍රම්ප් කියූ පැත්ත 5 සිට 7 ට්‍රික් ගත්තොත් ටෝකන් 1යි, ප්‍රතිවාදීන් එම හෑන්ඩ් එක දිනුවොත් ටෝකන් 2යි.",
      rules5: "ට්‍රික් 8ම ගත්තොත් ටෝකන් 3යි. 4-4 බැඳුනොත් අමතර ටෝකනය ඊළඟ දිනන හෑන්ඩ් එකට යයි.",
      yourTeam: "ඔබගේ කණ්ඩායම",
      opponents: "ප්‍රතිවාදීන්",
      handStatus: "හෑන්ඩ් තත්ත්වය",
      trickCount: "ට්‍රික්",
      trumpCaller: "ට්‍රම්ප් කියූ අසුන",
      tableConsole: "මේස පාලකය",
      newHand: "නව හෑන්ඩ්",
      restartMatch: "තරඟය යළි අරඹන්න",
      whyOmiSpecial: "ඔමි විශේෂ වන්නේ ඇයි",
      special1Title: "හෑන්ඩ් මැද ට්‍රම්ප් තේරීම",
      special1Copy: "බොහෝ ට්‍රික්-ටේකින් ක්‍රීඩා වලට වඩා වෙනස්ව, ඔබ අඩක් පමණක් දැක ට්‍රම්ප් තීරණය කරයි.",
      special2Title: "ප්‍රතිවාදී පීඩනය",
      special2Copy: "ට්‍රම්ප් කියූ පාර්ශවය පැරදුනොත්, එය බිඳින පාර්ශවයට සාමාන්‍යයෙන් වැඩි ටෝකන් ලැබේ.",
      special3Title: "ගැටුම් උණුසුම",
      special3Copy: "4-4 බැඳීමක් අමතර ටෝකනය ඊළඟ හෑන්ඩ් එකට ගෙන යන නිසා තරඟය එකවර හැරවිය හැක.",
      chooseTrumpPrompt: "ඔබගේ පළමු කාඩ් 4 අනුව ට්‍රම්ප් තෝරන්න.",
      language: "භාෂාව",
      english: "English",
      sinhala: "සිංහල"
    },
    seats: {
      south: "ඔබ",
      west: "බටහිර",
      north: "උතුර",
      east: "නැගෙනහිර"
    },
    seatStates: {
      waiting: "බලාසිටී",
      onTurn: "වාරය",
      played: "කාඩ් දමා ඇත",
      lastTrick: "අවසාන ට්‍රික්"
    },
    dynamic: {
      pending: "බලාපොරොත්තුවෙන්",
      carryBonus: (count) => `ගෙනයන බෝනස්: ${count}`,
      noHandResult: "තවම හෑන්ඩ් එකක් ලකුණු නොවීය.",
      tricksThisHand: (count) => `මෙම හෑන්ඩ් එකේ ට්‍රික් ${count}`,
      phaseChooseTrump: "ට්‍රම්ප් තෝරන්න",
      phaseAiChoosingTrump: "AI ට්‍රම්ප් තෝරයි",
      phaseChooseTrumpCopy: "ඔබ ඔබගේ පළමු කාඩ් 4 දුටුවා. දැන් ට්‍රම්ප් සූට් එක තීරණය කරන්න.",
      phaseAiChoosingTrumpCopy: (seat) => `${seat} තම පළමු කාඩ් 4 අනුව ට්‍රම්ප් තෝරයි.`,
      yourMove: "ඔබේ වාරය",
      seatToPlay: (seat) => `${seat} කාඩ් දමයි`,
      followSuitCopy: (suit) => `ඉදිරියට ඇති සූට් එක ${suit} යි. ඔබට ඇත්නම් එයම දමන්න.`,
      leadCopy: (seat) => `${seat} මෙම ට්‍රික් එක ආරම්භ කරයි.`,
      handComplete: "හෑන්ඩ් එක අවසන්",
      teamWinsMatch: (team) => `${team} තරඟය ජය ගනී`,
      readyNextHand: "ඊළඟ හෑන්ඩ් එකට සූදානම්.",
      turnBanner: (seat, isYou) => `${seat} ${isYou ? "වෙතින්" : "වෙතින්"} වාරය.`,
      startMatch: "ඔමිට සාදරයෙන් පිළිගනිමු. පළමු ඩීලර් ඔබ වන අතර ඊළඟ අසුන ට්‍රම්ප් කියයි.",
      newHandStarted: (seat) => `නව හෑන්ඩ් එක ආරම්භ විය. ඩීලර් දැන් ${seat}.`,
      newMatchStarted: "නව තරඟයක් ආරම්භ විය. ටෝකන් 10ට මුලින්ම යන කණ්ඩායම ජය ගනී.",
      youPlayed: (card) => `ඔබ ${card} දමා ඇත.`,
      seatPlayed: (seat, card) => `${seat} ${card} දමා ඇත.`,
      youChoseTrump: (suit) => `ඔබ ${suit} ට්‍රම්ප් ලෙස තෝරා ඇත.`,
      seatChoseTrump: (seat, suit) => `${seat} ${suit} ට්‍රම්ප් ලෙස තෝරා ඇත.`,
      turnStateYou: "ඔබේ වාරය",
      preparing: "පළමු බෙදීම සූදානම් කරමින්...",
      chooseTrumpShort: "ට්‍රම්ප් තෝරන්න"
    },
    suits: {
      spades: "ඉස්කෝප්පු",
      hearts: "හර්ට්ස්",
      clubs: "ක්ලබ්ස්",
      diamonds: "ඩයමන්ඩ්ස්"
    },
    teams: {
      human: "ඔබගේ කණ්ඩායම",
      ai: "ප්‍රතිවාදීන්"
    },
    scoring: {
      split: "4-4 සමාන විය. ඊළඟ දිනන හෑන්ඩ් එකට අමතර ටෝකනයක් ලැබේ.",
      kapothi: (team) => `${team} කපෝති එකක් ගසා ට්‍රික් 8ම දිනා ගත්තා.`,
      defendedTrump: (team) => `${team} තම ට්‍රම්ප් කැඳවීම සාර්ථකව ආරක්ෂා කළා.`,
      brokeTrump: (team) => `${team} ට්‍රම්ප් කියූ පැත්ත බිඳ දමා ප්‍රතිවාදී බෝනස් එකත් ගත්තා.`,
      carryApplied: (count) => ` ගෙනයන බෝනස් +${count} යෙදුවා.`
    }
  },
  en: {
    langTag: "en-US",
    pageTitle: "Omi Sinhala Card Game",
    static: {
      heroEyebrow: "Sri Lankan Trick-Taking",
      heroTitle: "Omi, rebuilt as a modern table experience.",
      heroText:
        "Play the classic Sinhala partnership card game with smart trump choice, proper trick rules, and a table designed to feel ceremonial, tactile, and alive.",
      tagDeck: "32-card deck",
      tagTrump: "Choose trump after 4 cards",
      tagScore: "Race to 10 tokens",
      matchState: "Match state",
      dealer: "Dealer",
      trump: "Trump",
      lead: "Lead",
      scoreToWin: "Score to win",
      coreRules: "Core rules",
      rules1: "Four players in two teams, partners sitting opposite.",
      rules2: "Trump is chosen after each player sees only four cards.",
      rules3: "You must follow suit if you can.",
      rules4: "Five to seven tricks scores 1 token for trump callers, 2 for defenders.",
      rules5: "All 8 tricks scores 3 tokens, and a 4-4 tie carries a bonus token to the next winning hand.",
      yourTeam: "Your team",
      opponents: "Opponents",
      handStatus: "Hand status",
      trickCount: "Trick",
      trumpCaller: "Trump caller",
      tableConsole: "Table console",
      newHand: "New hand",
      restartMatch: "Restart match",
      whyOmiSpecial: "Why Omi is special",
      special1Title: "Mid-deal trump choice",
      special1Copy: "Unlike most trick-taking games, you commit to trump with only half your hand revealed.",
      special2Title: "Defender pressure",
      special2Copy: "If defenders win the hand, they score more than the trump-calling side for a normal hand.",
      special3Title: "Carry-over tension",
      special3Copy: "A 4-4 split pushes a bonus token into the next hand, which can swing a close match fast.",
      chooseTrumpPrompt: "Choose trump from your first four cards.",
      language: "Language",
      english: "English",
      sinhala: "Sinhala"
    },
    seats: {
      south: "You",
      west: "West",
      north: "North",
      east: "East"
    },
    seatStates: {
      waiting: "Waiting",
      onTurn: "On turn",
      played: "Played",
      lastTrick: "Last trick"
    },
    dynamic: {
      pending: "Pending",
      carryBonus: (count) => `Carry bonus: ${count}`,
      noHandResult: "No hand scored yet.",
      tricksThisHand: (count) => `${count} tricks this hand`,
      phaseChooseTrump: "Choose trump",
      phaseAiChoosingTrump: "AI is choosing trump",
      phaseChooseTrumpCopy: "You have seen your first four cards. Commit to a trump suit.",
      phaseAiChoosingTrumpCopy: (seat) => `${seat} is selecting trump from the first four cards.`,
      yourMove: "Your move",
      seatToPlay: (seat) => `${seat} to play`,
      followSuitCopy: (suit) => `Lead suit is ${suit}. Follow suit if you can.`,
      leadCopy: (seat) => `${seat} leads this trick.`,
      handComplete: "Hand complete",
      teamWinsMatch: (team) => `${team} win the match`,
      readyNextHand: "Ready for the next hand.",
      turnBanner: (seat) => `${seat} is on turn.`,
      startMatch: "Welcome to Omi. Dealer starts at your seat, and the next seat calls trump.",
      newHandStarted: (seat) => `New hand started. Dealer moved to ${seat}.`,
      newMatchStarted: "New match started. First to 10 tokens wins.",
      youPlayed: (card) => `You played ${card}.`,
      seatPlayed: (seat, card) => `${seat} played ${card}.`,
      youChoseTrump: (suit) => `You chose ${suit} as trump.`,
      seatChoseTrump: (seat, suit) => `${seat} chose ${suit} as trump.`,
      turnStateYou: "Your move",
      preparing: "Preparing the first deal...",
      chooseTrumpShort: "Choose trump"
    },
    suits: {
      spades: "Spades",
      hearts: "Hearts",
      clubs: "Clubs",
      diamonds: "Diamonds"
    },
    teams: {
      human: "Your team",
      ai: "Opponents"
    },
    scoring: {
      split: "4-4 split. The next winning hand gets an extra token.",
      kapothi: (team) => `${team} pulled a kapothi and won all 8 tricks.`,
      defendedTrump: (team) => `${team} defended their trump call.`,
      brokeTrump: (team) => `${team} broke the trump caller and earned a defender bonus.`,
      carryApplied: (count) => ` Carry bonus applied: +${count}.`
    }
  }
};

const STORAGE_KEY = "omi-sinhala-locale";

export function getStrings(locale = DEFAULT_LOCALE) {
  return STRINGS[locale] ?? STRINGS[DEFAULT_LOCALE];
}

export function formatSeat(seat, locale = DEFAULT_LOCALE) {
  return getStrings(locale).seats[seat];
}

export function formatSuit(suit, locale = DEFAULT_LOCALE) {
  return getStrings(locale).suits[suit];
}

export function formatTeam(team, locale = DEFAULT_LOCALE) {
  return getStrings(locale).teams[team];
}

export function getPreferredLocale() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LOCALES.includes(stored)) {
      return stored;
    }
  } catch (error) {
    // ignore storage access issues
  }
  return DEFAULT_LOCALE;
}

export function setPreferredLocale(locale) {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch (error) {
    // ignore storage access issues
  }
}
