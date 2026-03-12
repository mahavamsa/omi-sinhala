import test from "node:test";
import assert from "node:assert/strict";

import {
  chooseAiTrump,
  chooseTrump,
  createDeck,
  createNewHand,
  getLegalCards,
  playCard,
  resolveTrickWinner,
  scoreHand
} from "../src/omiLogic.js";

test("deck contains 32 cards", () => {
  assert.equal(createDeck().length, 32);
});

test("players must follow suit when possible", () => {
  const hand = [
    { id: "A-spades", suit: "spades", value: 0 },
    { id: "K-hearts", suit: "hearts", value: 1 }
  ];
  const legal = getLegalCards(hand, "spades");
  assert.deepEqual(legal, [{ id: "A-spades", suit: "spades", value: 0 }]);
});

test("trump beats lead suit when resolving a trick", () => {
  const winner = resolveTrickWinner(
    [
      { seat: "south", card: { suit: "hearts", value: 3 } },
      { seat: "west", card: { suit: "spades", value: 7 } },
      { seat: "north", card: { suit: "hearts", value: 0 } },
      { seat: "east", card: { suit: "hearts", value: 1 } }
    ],
    "spades",
    "hearts"
  );
  assert.equal(winner, "west");
});

test("ai chooses the strongest suit from the opening four cards", () => {
  const trump = chooseAiTrump([
    { suit: "hearts", value: 0 },
    { suit: "hearts", value: 1 },
    { suit: "spades", value: 6 },
    { suit: "hearts", value: 2 }
  ]);
  assert.equal(trump, "hearts");
});

test("calling team gets one token for a normal hand win", () => {
  const hand = {
    declarerSeat: "south",
    trickWins: { human: 5, ai: 3 },
    carryBonus: 0,
    matchScore: { human: 0, ai: 0 }
  };
  const scored = scoreHand(hand);
  assert.equal(scored.matchScore.human, 1);
  assert.equal(scored.handResult.awardedTokens, 1);
});

test("defenders get two tokens plus carry bonus when they break trump", () => {
  const hand = {
    declarerSeat: "south",
    trickWins: { human: 3, ai: 5 },
    carryBonus: 1,
    matchScore: { human: 0, ai: 0 }
  };
  const scored = scoreHand(hand);
  assert.equal(scored.matchScore.ai, 3);
  assert.equal(scored.carryBonus, 0);
});

test("chooseTrump finalizes hands into full eight-card hands", () => {
  const hand = createNewHand("south", { human: 0, ai: 0 }, 0, () => 0);
  const next = chooseTrump(hand, "spades");
  assert.equal(next.hands.south.length, 8);
  assert.equal(next.stage, "playing");
});

test("playCard completes a trick and advances winner", () => {
  const hand = {
    stage: "playing",
    hands: {
      south: [{ id: "A-hearts", suit: "hearts", value: 0 }],
      west: [{ id: "K-hearts", suit: "hearts", value: 1 }],
      north: [{ id: "Q-hearts", suit: "hearts", value: 2 }],
      east: [{ id: "J-hearts", suit: "hearts", value: 3 }]
    },
    leadSuit: null,
    trickCards: [],
    currentTurn: "south",
    trumpSuit: "spades",
    trickWins: { human: 0, ai: 0 },
    trickCount: 0,
    declarerSeat: "south",
    matchScore: { human: 0, ai: 0 },
    carryBonus: 0
  };

  let next = playCard(hand, "south", "A-hearts");
  next = playCard(next, "west", "K-hearts");
  next = playCard(next, "north", "Q-hearts");
  next = playCard(next, "east", "J-hearts");

  assert.equal(next.trickWins.human, 1);
  assert.equal(next.currentTurn, "south");
});
