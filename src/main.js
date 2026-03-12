import {
  SEATS,
  SUITS,
  TEAMS,
  chooseAiCard,
  chooseAiTrump,
  chooseTrump,
  createInitialMatch,
  getLegalCards,
  playCard,
  startNextHand,
  teamLabel
} from "./omiLogic.js";

const seatNames = {
  south: "You",
  west: "West",
  north: "North",
  east: "East"
};

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

let matchState = createInitialMatch();

function addEvent(message) {
  matchState.events = [message, ...matchState.events].slice(0, 14);
}

function render() {
  const hand = matchState.hand;

  dealerSeatNode.textContent = seatNames[matchState.dealerSeat];
  trumpSuitNode.textContent = hand.trumpSuit ? titleCase(hand.trumpSuit) : "Pending";
  leadSeatNode.textContent = seatNames[hand.currentTurn];
  callerSeatNode.textContent = seatNames[hand.declarerSeat];
  trickCountNode.textContent = `${hand.trickCount} / 8`;
  teamHumanScoreNode.textContent = String(hand.matchScore.human);
  teamAiScoreNode.textContent = String(hand.matchScore.ai);
  teamHumanTricksNode.textContent = `${hand.trickWins.human} tricks this hand`;
  teamAiTricksNode.textContent = `${hand.trickWins.ai} tricks this hand`;
  carryBonusNode.textContent = `Carry bonus: ${hand.carryBonus}`;
  handResultNode.textContent = hand.handResult ? hand.handResult.resultLabel : "No hand scored yet.";

  if (hand.stage === "choose-trump") {
    phaseLabelNode.textContent = hand.declarerSeat === "south" ? "Choose trump" : "AI is choosing trump";
    phaseCopyNode.textContent =
      hand.declarerSeat === "south"
        ? "You have seen your first four cards. Commit to a trump suit."
        : `${seatNames[hand.declarerSeat]} is selecting trump from the first four cards.`;
  } else if (hand.stage === "playing") {
    phaseLabelNode.textContent = hand.currentTurn === "south" ? "Your move" : `${seatNames[hand.currentTurn]} to play`;
    phaseCopyNode.textContent = hand.leadSuit
      ? `Lead suit is ${titleCase(hand.leadSuit)}. Follow suit if you can.`
      : `${seatNames[hand.currentTurn]} leads this trick.`;
  } else {
    phaseLabelNode.textContent = hand.winningTeam ? `${teamLabel(hand.winningTeam)} win the match` : "Hand complete";
    phaseCopyNode.textContent = hand.handResult?.resultLabel ?? "Ready for the next hand.";
  }

  turnBannerNode.textContent =
    hand.stage === "hand-over"
      ? hand.handResult?.resultLabel ?? "Hand complete."
      : `${seatNames[hand.currentTurn]} ${hand.currentTurn === "south" ? "are" : "is"} on turn.`;

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
  for (const seat of SEATS) {
    if (matchState.hand.stage === "hand-over") {
      seatStateNodes[seat].textContent = seat === matchState.hand.lastTrickWinner ? "Last trick" : "Waiting";
    } else if (matchState.hand.currentTurn === seat) {
      seatStateNodes[seat].textContent = "On turn";
    } else if (matchState.hand.trickCards.some((entry) => entry.seat === seat)) {
      seatStateNodes[seat].textContent = "Played";
    } else {
      seatStateNodes[seat].textContent = "Waiting";
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

function handlePlayerCard(cardId) {
  if (matchState.hand.currentTurn !== "south" || matchState.hand.stage !== "playing") {
    return;
  }

  const card = matchState.hand.hands.south.find((entry) => entry.id === cardId);
  if (!card) {
    return;
  }

  addEvent(`You played ${card.rank}${card.symbol}.`);
  matchState.hand = playCard(matchState.hand, "south", cardId);
  render();
  queueAiTurns();
}

function handleAiTrumpIfNeeded() {
  if (matchState.hand.stage === "choose-trump" && matchState.hand.declarerSeat !== "south") {
    const trumpSuit = chooseAiTrump(matchState.hand.hands[matchState.hand.declarerSeat]);
    addEvent(`${seatNames[matchState.hand.declarerSeat]} chose ${titleCase(trumpSuit)} as trump.`);
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
    addEvent(`${seatNames[seat]} played ${card.rank}${card.symbol}.`);
    matchState.hand = playCard(matchState.hand, seat, card.id);
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
  addEvent(`New hand started. Dealer moved to ${seatNames[matchState.dealerSeat]}.`);
  render();
  handleAiTrumpIfNeeded();
  queueAiTurns();
}

function restartMatch() {
  matchState = createInitialMatch();
  addEvent("New match started. First to 10 tokens wins.");
  render();
  handleAiTrumpIfNeeded();
  queueAiTurns();
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

document.querySelectorAll("[data-trump]").forEach((button) => {
  button.addEventListener("click", () => {
    const trumpSuit = button.dataset.trump;
    addEvent(`You chose ${titleCase(trumpSuit)} as trump.`);
    matchState.hand = chooseTrump(matchState.hand, trumpSuit);
    render();
    queueAiTurns();
  });
});

newHandButton.addEventListener("click", () => {
  if (matchState.hand.stage === "hand-over") {
    startNewHand();
  }
});

newMatchButton.addEventListener("click", restartMatch);

addEvent("Welcome to Omi. Dealer starts at your seat, and the player to dealer's left calls trump.");
render();
handleAiTrumpIfNeeded();
