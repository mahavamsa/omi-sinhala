import {
  SEATS,
  chooseAiCard,
  chooseAiTrump,
  chooseTrump,
  createInitialMatch,
  formatTeamForLocale,
  getLegalCards,
  playCard,
  startNextHand
} from "./omiLogic.js";
import {
  DEFAULT_LOCALE,
  formatSeat,
  formatSuit,
  getPreferredLocale,
  getStrings,
  setPreferredLocale
} from "./i18n.js";

const CHARACTERS = [
  {
    id: "saffron",
    avatar: "🦁",
    className: "avatar-saffron",
    names: { si: "සැෆ්රන් සිංහයා", en: "Saffron Lion" },
    notes: { si: "විශ්වාසයෙන් ට්‍රම්ප් කියන නායකයා.", en: "A fearless trump-calling captain." }
  },
  {
    id: "lotus",
    avatar: "🌸",
    className: "avatar-lotus",
    names: { si: "ලෝටස් නන්ගි", en: "Lotus Nangi" },
    notes: { si: "ලස්සන vibe එකක් එක්ක අඩි දෙයි.", en: "Brings bright energy and sharp timing." }
  },
  {
    id: "mango",
    avatar: "🥭",
    className: "avatar-mango",
    names: { si: "මැන්ගෝ මල්ලි", en: "Mango Malli" },
    notes: { si: "කැඩුවොත් හිනාවෙන්ම කැඩේ.", en: "Playful, quick, and a little chaotic." }
  },
  {
    id: "kandyan",
    avatar: "🎭",
    className: "avatar-kandyan",
    names: { si: "කැන්ඩියන් නළුවා", en: "Kandyan Ace" },
    notes: { si: "මේසයම show එකක් කරන tactician.", en: "A dramatic tactician who owns the table." }
  }
];

const handNodes = {
  south: document.querySelector("#south-hand"),
  west: document.querySelector("#west-hand"),
  north: document.querySelector("#north-hand"),
  east: document.querySelector("#east-hand")
};

const seatStateNodes = {
  south: document.querySelector("#south-state"),
  west: document.querySelector("#west-state"),
  north: document.querySelector("#north-state"),
  east: document.querySelector("#east-state")
};

const playSlots = Object.fromEntries(
  Array.from(document.querySelectorAll("[data-seat-slot]")).map((node) => [node.dataset.seatSlot, node])
);

const dealerSeatNode = document.querySelector("#dealer-seat");
const trumpSuitNode = document.querySelector("#trump-suit");
const leadSeatNode = document.querySelector("#lead-seat");
const callerSeatNode = document.querySelector("#caller-seat");
const trickCountNode = document.querySelector("#trick-count");
const phaseLabelNode = document.querySelector("#phase-label");
const phaseCopyNode = document.querySelector("#phase-copy");
const turnBannerNode = document.querySelector("#turn-banner");
const teamHumanScoreNode = document.querySelector("#team-human-score");
const teamAiScoreNode = document.querySelector("#team-ai-score");
const teamHumanTricksNode = document.querySelector("#team-human-tricks");
const teamAiTricksNode = document.querySelector("#team-ai-tricks");
const carryBonusNode = document.querySelector("#carry-bonus");
const handResultNode = document.querySelector("#hand-result");
const trumpPickerNode = document.querySelector("#trump-picker");
const eventLogNode = document.querySelector("#event-log");
const newHandButton = document.querySelector("#new-hand-button");
const newMatchButton = document.querySelector("#new-match-button");
const localeButtons = document.querySelectorAll("[data-locale-switch]");
const translatableNodes = document.querySelectorAll("[data-i18n]");
const soundToggleButton = document.querySelector("#sound-toggle");
const characterGridNode = document.querySelector("#character-grid");
const selectedCharacterNameNode = document.querySelector("#selected-character-name");
const avatarNodes = {
  south: document.querySelector("#south-avatar"),
  west: document.querySelector("#west-avatar"),
  north: document.querySelector("#north-avatar"),
  east: document.querySelector("#east-avatar")
};
const reactionNodes = {
  south: document.querySelector("#south-reaction"),
  west: document.querySelector("#west-reaction"),
  north: document.querySelector("#north-reaction"),
  east: document.querySelector("#east-reaction")
};

let currentLocale = DEFAULT_LOCALE;
let matchState = createInitialMatch();
let soundEnabled = true;
let audioContext = null;
let selectedCharacterId = CHARACTERS[0].id;
const seatCharacters = {
  south: CHARACTERS[0],
  west: CHARACTERS[1],
  north: CHARACTERS[2],
  east: CHARACTERS[3]
};
const reactionTimers = {};

function strings() {
  return getStrings(currentLocale);
}

function addEvent(message) {
  matchState.events = [message, ...matchState.events].slice(0, 14);
}

function applyStaticTranslations() {
  const localeStrings = strings();
  document.documentElement.lang = currentLocale;
  document.title = localeStrings.pageTitle;

  translatableNodes.forEach((node) => {
    const key = node.dataset.i18n;
    node.textContent = localeStrings.static[key];
  });

  document.querySelectorAll("[data-trump]").forEach((button) => {
    button.textContent = formatSuit(button.dataset.trump, currentLocale);
  });

  localeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.localeSwitch === currentLocale);
  });

  soundToggleButton.textContent = soundEnabled ? localeStrings.static.soundOn : localeStrings.static.soundOff;
  selectedCharacterNameNode.textContent = currentCharacter().names[currentLocale];
  renderCharacterPicker();
}

function render() {
  const hand = matchState.hand;
  const localeStrings = strings();

  dealerSeatNode.textContent = formatSeat(matchState.dealerSeat, currentLocale);
  trumpSuitNode.textContent = hand.trumpSuit ? formatSuit(hand.trumpSuit, currentLocale) : localeStrings.dynamic.pending;
  leadSeatNode.textContent = formatSeat(hand.currentTurn, currentLocale);
  callerSeatNode.textContent = formatSeat(hand.declarerSeat, currentLocale);
  trickCountNode.textContent = `${hand.trickCount} / 8`;
  teamHumanScoreNode.textContent = String(hand.matchScore.human);
  teamAiScoreNode.textContent = String(hand.matchScore.ai);
  teamHumanTricksNode.textContent = localeStrings.dynamic.tricksThisHand(hand.trickWins.human);
  teamAiTricksNode.textContent = localeStrings.dynamic.tricksThisHand(hand.trickWins.ai);
  carryBonusNode.textContent = localeStrings.dynamic.carryBonus(hand.carryBonus);
  handResultNode.textContent = hand.handResult ? hand.handResult.resultLabel : localeStrings.dynamic.noHandResult;

  if (hand.stage === "choose-trump") {
    phaseLabelNode.textContent =
      hand.declarerSeat === "south" ? localeStrings.dynamic.phaseChooseTrump : localeStrings.dynamic.phaseAiChoosingTrump;
    phaseCopyNode.textContent =
      hand.declarerSeat === "south"
        ? localeStrings.dynamic.phaseChooseTrumpCopy
        : localeStrings.dynamic.phaseAiChoosingTrumpCopy(formatSeat(hand.declarerSeat, currentLocale));
  } else if (hand.stage === "playing") {
    phaseLabelNode.textContent =
      hand.currentTurn === "south"
        ? localeStrings.dynamic.yourMove
        : localeStrings.dynamic.seatToPlay(formatSeat(hand.currentTurn, currentLocale));
    phaseCopyNode.textContent = hand.leadSuit
      ? localeStrings.dynamic.followSuitCopy(formatSuit(hand.leadSuit, currentLocale))
      : localeStrings.dynamic.leadCopy(formatSeat(hand.currentTurn, currentLocale));
  } else {
    phaseLabelNode.textContent = hand.winningTeam
      ? localeStrings.dynamic.teamWinsMatch(formatTeamForLocale(hand.winningTeam, currentLocale))
      : localeStrings.dynamic.handComplete;
    phaseCopyNode.textContent = hand.handResult?.resultLabel ?? localeStrings.dynamic.readyNextHand;
  }

  turnBannerNode.textContent =
    hand.stage === "hand-over"
      ? hand.handResult?.resultLabel ?? localeStrings.dynamic.handComplete
      : localeStrings.dynamic.turnBanner(formatSeat(hand.currentTurn, currentLocale), hand.currentTurn === "south");

  renderHands();
  renderTrick();
  renderSeatStates();
  renderTrumpPicker();
  renderLog();
  renderAvatars();
}

function renderHands() {
  for (const seat of SEATS) {
    const node = handNodes[seat];
    const cards = matchState.hand.hands[seat];
    node.innerHTML = "";

    const legalIds =
      seat === "south" && matchState.hand.stage === "playing" && matchState.hand.currentTurn === "south"
        ? new Set(getLegalCards(cards, matchState.hand.leadSuit).map((card) => card.id))
        : new Set();

    cards.forEach((card) => {
      const hidden = seat !== "south";
      node.append(createCardElement(card, {
        hidden,
        played: false,
        playable: legalIds.has(card.id)
      }));
    });
  }
}

function renderTrick() {
  Object.values(playSlots).forEach((node) => {
    node.innerHTML = "";
  });
  matchState.hand.trickCards.forEach((entry) => {
    playSlots[entry.seat].append(
      createCardElement(entry.card, {
        hidden: false,
        played: true
      })
    );
  });
}

function renderSeatStates() {
  const localeStrings = strings();
  for (const seat of SEATS) {
    if (matchState.hand.stage === "hand-over") {
      seatStateNodes[seat].textContent =
        seat === matchState.hand.lastTrickWinner ? localeStrings.seatStates.lastTrick : localeStrings.seatStates.waiting;
    } else if (matchState.hand.currentTurn === seat) {
      seatStateNodes[seat].textContent = localeStrings.seatStates.onTurn;
    } else if (matchState.hand.trickCards.some((entry) => entry.seat === seat)) {
      seatStateNodes[seat].textContent = localeStrings.seatStates.played;
    } else {
      seatStateNodes[seat].textContent = localeStrings.seatStates.waiting;
    }
  }
}

function renderTrumpPicker() {
  const shouldShow = matchState.hand.stage === "choose-trump" && matchState.hand.declarerSeat === "south";
  trumpPickerNode.hidden = !shouldShow;
}

function renderLog() {
  eventLogNode.innerHTML = "";
  matchState.events.forEach((event) => {
    const item = document.createElement("li");
    item.textContent = event;
    eventLogNode.append(item);
  });
}

function renderCharacterPicker() {
  characterGridNode.innerHTML = "";
  CHARACTERS.forEach((character) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `character-tile ${character.id === selectedCharacterId ? "active" : ""}`;
    button.innerHTML = `
      <div class="character-avatar ${character.className}">${character.avatar}</div>
      <span class="character-title">${character.names[currentLocale]}</span>
      <span class="character-note">${character.notes[currentLocale]}</span>
    `;
    button.addEventListener("click", () => {
      selectedCharacterId = character.id;
      seatCharacters.south = character;
      selectedCharacterNameNode.textContent = character.names[currentLocale];
      renderCharacterPicker();
      renderAvatars();
      react("south", "lead");
      playTone("pick");
    });
    characterGridNode.append(button);
  });
}

function renderAvatars() {
  for (const seat of Object.keys(avatarNodes)) {
    const character = seatCharacters[seat];
    avatarNodes[seat].className = `avatar-shell ${character.className}`;
    avatarNodes[seat].textContent = character.avatar;
  }
}

function currentCharacter() {
  return seatCharacters.south;
}

function react(seat, type) {
  const localeStrings = strings();
  const pool = localeStrings.reactions[type];
  if (!pool || pool.length === 0) {
    return;
  }
  const node = reactionNodes[seat];
  node.textContent = pool[Math.floor(Math.random() * pool.length)];
  node.classList.add("visible");
  window.clearTimeout(reactionTimers[seat]);
  reactionTimers[seat] = window.setTimeout(() => {
    node.classList.remove("visible");
  }, 1500);
}

function getAudioContext() {
  if (!audioContext) {
    audioContext = new window.AudioContext();
  }
  return audioContext;
}

function playTone(type) {
  if (!soundEnabled) {
    return;
  }
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.connect(gain);
  gain.connect(context.destination);

  const now = context.currentTime;
  const settings = {
    card: { frequency: 520, duration: 0.08, type: "triangle", volume: 0.03 },
    win: { frequency: 740, duration: 0.18, type: "sine", volume: 0.04 },
    lose: { frequency: 220, duration: 0.2, type: "sawtooth", volume: 0.025 },
    pick: { frequency: 620, duration: 0.1, type: "triangle", volume: 0.03 },
    trump: { frequency: 660, duration: 0.16, type: "square", volume: 0.03 }
  }[type];

  oscillator.type = settings.type;
  oscillator.frequency.setValueAtTime(settings.frequency, now);
  gain.gain.setValueAtTime(settings.volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + settings.duration);
  oscillator.start(now);
  oscillator.stop(now + settings.duration);
}

function createCardElement(card, { hidden, playable, played }) {
  const button = document.createElement(hidden ? "div" : "button");
  button.className = `card ${hidden ? "back" : ""} ${card.color === "red" ? "red" : ""} ${playable ? "playable" : ""} ${played ? "played" : ""}`;

  if (hidden) {
    button.innerHTML = `<span class="card-rank">O</span><span class="card-center">මි</span><span class="card-suit">⟡</span>`;
    return button;
  }

  button.type = "button";
  button.dataset.cardId = card.id;
  button.innerHTML = `
    <span class="card-rank">${card.rank}</span>
    <span class="card-center">${card.symbol}</span>
    <span class="card-suit">${card.symbol}</span>
  `;

  if (playable) {
    button.addEventListener("click", () => handlePlayerCard(card.id));
  } else {
    button.disabled = true;
  }

  return button;
}

function cardLabel(card) {
  return `${card.rank}${card.symbol}`;
}

function handlePlayerCard(cardId) {
  if (matchState.hand.currentTurn !== "south" || matchState.hand.stage !== "playing") {
    return;
  }

  const card = matchState.hand.hands.south.find((entry) => entry.id === cardId);
  if (!card) {
    return;
  }

  addEvent(strings().dynamic.youPlayed(cardLabel(card)));
  react("south", "lead");
  playTone("card");
  matchState.hand = playCard(matchState.hand, "south", cardId, currentLocale);
  render();
  queueAiTurns();
}

function handleAiTrumpIfNeeded() {
  if (matchState.hand.stage === "choose-trump" && matchState.hand.declarerSeat !== "south") {
    const trumpSuit = chooseAiTrump(matchState.hand.hands[matchState.hand.declarerSeat]);
    addEvent(strings().dynamic.seatChoseTrump(formatSeat(matchState.hand.declarerSeat, currentLocale), formatSuit(trumpSuit, currentLocale)));
    react(matchState.hand.declarerSeat, "trump");
    playTone("trump");
    matchState.hand = chooseTrump(matchState.hand, trumpSuit);
    render();
  }
}

function queueAiTurns() {
  if (matchState.hand.stage !== "playing") {
    return;
  }

  if (matchState.hand.currentTurn === "south") {
    return;
  }

  window.setTimeout(() => {
    const seat = matchState.hand.currentTurn;
    const card = chooseAiCard(matchState.hand, seat);
    addEvent(strings().dynamic.seatPlayed(formatSeat(seat, currentLocale), cardLabel(card)));
    react(seat, "lead");
    playTone("card");
    matchState.hand = playCard(matchState.hand, seat, card.id, currentLocale);
    render();

    if (matchState.hand.stage === "hand-over") {
      if (matchState.hand.handResult) {
        addEvent(matchState.hand.handResult.resultLabel);
        const winningSeat = matchState.hand.handResult.awardedTeam === "human" ? "south" : "west";
        react(winningSeat, "win");
        react(winningSeat === "south" ? "north" : "east", "win");
        react(winningSeat === "south" ? "west" : "south", "lose");
        react(winningSeat === "south" ? "east" : "north", "lose");
        playTone(matchState.hand.handResult.awardedTeam === "human" ? "win" : "lose");
      }
      return;
    }

    queueAiTurns();
  }, 520);
}

function startNewHand() {
  matchState = {
    ...matchState,
    hand: startNextHand(matchState)
  };
  addEvent(strings().dynamic.newHandStarted(formatSeat(matchState.dealerSeat, currentLocale)));
  render();
  handleAiTrumpIfNeeded();
  queueAiTurns();
}

function restartMatch() {
  matchState = createInitialMatch();
  addEvent(strings().dynamic.newMatchStarted);
  render();
  handleAiTrumpIfNeeded();
  queueAiTurns();
}

function setLocale(locale) {
  currentLocale = locale;
  setPreferredLocale(locale);
  applyStaticTranslations();
  render();
}

document.querySelectorAll("[data-trump]").forEach((button) => {
  button.addEventListener("click", () => {
    const trumpSuit = button.dataset.trump;
    addEvent(strings().dynamic.youChoseTrump(formatSuit(trumpSuit, currentLocale)));
    react("south", "trump");
    playTone("trump");
    matchState.hand = chooseTrump(matchState.hand, trumpSuit);
    render();
    queueAiTurns();
  });
});

localeButtons.forEach((button) => {
  button.addEventListener("click", () => setLocale(button.dataset.localeSwitch));
});

soundToggleButton.addEventListener("click", async () => {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    try {
      await getAudioContext().resume();
    } catch (error) {
      soundEnabled = false;
    }
  }
  soundToggleButton.textContent = soundEnabled ? strings().static.soundOn : strings().static.soundOff;
  if (soundEnabled) {
    playTone("pick");
  }
});

newHandButton.addEventListener("click", () => {
  if (matchState.hand.stage === "hand-over") {
    startNewHand();
  }
});

newMatchButton.addEventListener("click", restartMatch);

currentLocale = getPreferredLocale();
applyStaticTranslations();
addEvent(strings().dynamic.startMatch);
render();
handleAiTrumpIfNeeded();
