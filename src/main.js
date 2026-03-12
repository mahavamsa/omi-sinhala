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

let currentLocale = DEFAULT_LOCALE;
let matchState = createInitialMatch();

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
  matchState.hand = playCard(matchState.hand, "south", cardId, currentLocale);
  render();
  queueAiTurns();
}

function handleAiTrumpIfNeeded() {
  if (matchState.hand.stage === "choose-trump" && matchState.hand.declarerSeat !== "south") {
    const trumpSuit = chooseAiTrump(matchState.hand.hands[matchState.hand.declarerSeat]);
    addEvent(strings().dynamic.seatChoseTrump(formatSeat(matchState.hand.declarerSeat, currentLocale), formatSuit(trumpSuit, currentLocale)));
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
    matchState.hand = playCard(matchState.hand, seat, card.id, currentLocale);
    render();

    if (matchState.hand.stage === "hand-over") {
      if (matchState.hand.handResult) {
        addEvent(matchState.hand.handResult.resultLabel);
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
    matchState.hand = chooseTrump(matchState.hand, trumpSuit);
    render();
    queueAiTurns();
  });
});

localeButtons.forEach((button) => {
  button.addEventListener("click", () => setLocale(button.dataset.localeSwitch));
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
