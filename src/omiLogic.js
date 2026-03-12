export const SUITS = ["spades", "hearts", "clubs", "diamonds"];
export const SEATS = ["south", "west", "north", "east"];
export const TEAMS = {
  south: "human",
  north: "human",
  west: "ai",
  east: "ai"
};
export const RANKS = ["A", "K", "Q", "J", "10", "9", "8", "7"];

const SUIT_SYMBOLS = {
  spades: "♠",
  hearts: "♥",
  clubs: "♣",
  diamonds: "♦"
};

const SUIT_COLORS = {
  spades: "black",
  clubs: "black",
  hearts: "red",
  diamonds: "red"
};

export function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${rank}-${suit}`,
        suit,
        rank,
        value: RANKS.indexOf(rank),
        symbol: SUIT_SYMBOLS[suit],
        color: SUIT_COLORS[suit]
      });
    }
  }
  return deck;
}

export function shuffleDeck(deck, random = Math.random) {
  const copy = [...deck];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function nextSeat(seat) {
  return SEATS[(SEATS.indexOf(seat) + 1) % SEATS.length];
}

export function seatRightOfDealer(dealerSeat) {
  return nextSeat(dealerSeat);
}

export function createInitialMatch(random = Math.random) {
  return {
    dealerSeat: "south",
    score: { human: 0, ai: 0 },
    carryBonus: 0,
    winningTeam: null,
    hand: createNewHand("south", { human: 0, ai: 0 }, 0, random),
    events: []
  };
}

export function createNewHand(dealerSeat, matchScore, carryBonus, random = Math.random) {
  const declarerSeat = seatRightOfDealer(dealerSeat);
  const shuffled = shuffleDeck(createDeck(), random);
  const firstFour = dealRound(shuffled, 0, 4);
  return {
    dealerSeat,
    declarerSeat,
    trumpSuit: null,
    talon: shuffled,
    hands: firstFour,
    stage: "choose-trump",
    currentTurn: declarerSeat,
    leadSuit: null,
    trickCards: [],
    trickCount: 0,
    trickWins: { human: 0, ai: 0 },
    matchScore,
    carryBonus,
    handResult: null
  };
}

function dealRound(deck, startIndex, count) {
  const hands = Object.fromEntries(SEATS.map((seat) => [seat, []]));
  let cursor = startIndex;
  for (const seat of SEATS) {
    hands[seat] = deck.slice(cursor, cursor + count).sort(compareCards);
    cursor += count;
  }
  return hands;
}

export function finalizeHands(handState) {
  const extraCards = dealRound(handState.talon, 16, 4);
  const hands = {};
  for (const seat of SEATS) {
    hands[seat] = [...handState.hands[seat], ...extraCards[seat]].sort(compareCards);
  }
  return {
    ...handState,
    hands,
    stage: "playing"
  };
}

export function compareCards(left, right) {
  if (left.suit === right.suit) {
    return left.value - right.value;
  }
  return SUITS.indexOf(left.suit) - SUITS.indexOf(right.suit);
}

export function chooseTrump(handState, trumpSuit) {
  if (handState.stage !== "choose-trump") {
    return handState;
  }

  return finalizeHands({
    ...handState,
    trumpSuit,
    stage: "playing",
    currentTurn: handState.declarerSeat
  });
}

export function getLegalCards(hand, leadSuit) {
  if (!leadSuit) {
    return hand;
  }
  const suited = hand.filter((card) => card.suit === leadSuit);
  return suited.length > 0 ? suited : hand;
}

export function playCard(handState, seat, cardId) {
  const hand = handState.hands[seat];
  const card = hand.find((entry) => entry.id === cardId);
  if (!card) {
    return handState;
  }

  const legalCards = getLegalCards(hand, handState.leadSuit);
  if (!legalCards.some((entry) => entry.id === cardId)) {
    return handState;
  }

  const nextHands = {
    ...handState.hands,
    [seat]: hand.filter((entry) => entry.id !== cardId)
  };
  const trickCards = [...handState.trickCards, { seat, card }];
  const leadSuit = handState.leadSuit ?? card.suit;

  if (trickCards.length < 4) {
    return {
      ...handState,
      hands: nextHands,
      trickCards,
      leadSuit,
      currentTurn: nextSeat(seat)
    };
  }

  const winnerSeat = resolveTrickWinner(trickCards, handState.trumpSuit, leadSuit);
  const winningTeam = TEAMS[winnerSeat];
  const trickWins = {
    ...handState.trickWins,
    [winningTeam]: handState.trickWins[winningTeam] + 1
  };
  const trickCount = handState.trickCount + 1;

  const updated = {
    ...handState,
    hands: nextHands,
    trickCards,
    leadSuit,
    trickWins,
    trickCount,
    currentTurn: winnerSeat,
    lastTrickWinner: winnerSeat
  };

  if (trickCount === 8) {
    return scoreHand(updated);
  }

  return {
    ...updated,
    trickCards: [],
    leadSuit: null
  };
}

export function resolveTrickWinner(trickCards, trumpSuit, leadSuit) {
  return [...trickCards].sort((left, right) => comparePlayedCards(left.card, right.card, trumpSuit, leadSuit))[0].seat;
}

function comparePlayedCards(left, right, trumpSuit, leadSuit) {
  const leftTrump = left.suit === trumpSuit;
  const rightTrump = right.suit === trumpSuit;
  if (leftTrump !== rightTrump) {
    return leftTrump ? -1 : 1;
  }

  const leftLead = left.suit === leadSuit;
  const rightLead = right.suit === leadSuit;
  if (leftLead !== rightLead) {
    return leftLead ? -1 : 1;
  }

  return left.value - right.value;
}

export function scoreHand(handState) {
  const callerTeam = TEAMS[handState.declarerSeat];
  const defenderTeam = callerTeam === "human" ? "ai" : "human";
  const callerTricks = handState.trickWins[callerTeam];
  const defenderTricks = handState.trickWins[defenderTeam];
  let awardedTeam = null;
  let awardedTokens = 0;
  let resultLabel = "";
  let carryBonus = handState.carryBonus;

  if (callerTricks === 4 && defenderTricks === 4) {
    resultLabel = "4-4 split. The next winning hand gets an extra token.";
    carryBonus += 1;
  } else {
    awardedTeam = callerTricks > defenderTricks ? callerTeam : defenderTeam;
    if (callerTricks === 8 || defenderTricks === 8) {
      awardedTokens = 3;
      resultLabel = `${teamLabel(awardedTeam)} pulled a kapothi and won all 8 tricks.`;
    } else if (awardedTeam === callerTeam) {
      awardedTokens = 1;
      resultLabel = `${teamLabel(awardedTeam)} defended their trump call.`;
    } else {
      awardedTokens = 2;
      resultLabel = `${teamLabel(awardedTeam)} broke the trump caller and earned a defender bonus.`;
    }
    if (carryBonus > 0) {
      awardedTokens += carryBonus;
      resultLabel += ` Carry bonus applied: +${carryBonus}.`;
      carryBonus = 0;
    }
  }

  const score = {
    ...handState.matchScore
  };
  if (awardedTeam) {
    score[awardedTeam] += awardedTokens;
  }

  return {
    ...handState,
    stage: "hand-over",
    handResult: {
      awardedTeam,
      awardedTokens,
      resultLabel
    },
    carryBonus,
    matchScore: score,
    winningTeam: score.human >= 10 ? "human" : score.ai >= 10 ? "ai" : null
  };
}

export function startNextHand(matchState, random = Math.random) {
  const nextDealer = nextSeat(matchState.dealerSeat);
  return {
    ...matchState,
    dealerSeat: nextDealer,
    winningTeam: matchState.hand.winningTeam ?? matchState.winningTeam,
    hand: createNewHand(nextDealer, matchState.hand.matchScore, matchState.hand.carryBonus, random)
  };
}

export function chooseAiTrump(firstFourCards) {
  const counts = Object.fromEntries(SUITS.map((suit) => [suit, 0]));
  const weights = Object.fromEntries(SUITS.map((suit) => [suit, 0]));
  firstFourCards.forEach((card) => {
    counts[card.suit] += 1;
    weights[card.suit] += 8 - card.value;
  });
  return SUITS.slice().sort((left, right) => {
    if (counts[right] !== counts[left]) {
      return counts[right] - counts[left];
    }
    return weights[right] - weights[left];
  })[0];
}

export function chooseAiCard(handState, seat) {
  const hand = handState.hands[seat];
  const legalCards = getLegalCards(hand, handState.leadSuit);
  const trick = handState.trickCards;

  if (!handState.leadSuit) {
    return legalCards[0];
  }

  const currentWinningSeat =
    trick.length > 0
      ? resolveTrickWinner(trick, handState.trumpSuit, handState.leadSuit)
      : null;
  const currentWinningTeam = currentWinningSeat ? TEAMS[currentWinningSeat] : null;

  if (currentWinningTeam === TEAMS[seat]) {
    return legalCards[legalCards.length - 1];
  }

  const winningOptions = legalCards.filter((candidate) => {
    const winner = resolveTrickWinner(
      [...trick, { seat, card: candidate }],
      handState.trumpSuit,
      handState.leadSuit
    );
    return winner === seat;
  });

  return winningOptions[winningOptions.length - 1] ?? legalCards[0];
}

export function teamLabel(team) {
  return team === "human" ? "Your team" : "Opponents";
}
