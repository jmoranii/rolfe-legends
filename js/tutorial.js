// Rolfe Legends — Backyard Practice: the scripted first-five-minutes warm-up.
// Pure data + pure helpers (NO DOM) so test/test.mjs can replay the whole script
// through logic.js and prove it's legal, winnable, and conceptually clean.
// The UI driver lives in game.js (practice mode); this file is the single source
// of truth for what the script allows at each step.

import { newGame, attackTargets, effAtk } from './logic.js';

// The practice dummy. Deliberately NOT in BOSSES — selfplay/campaign-curve and the
// boss data-integrity tests never see him. He has no deck, no persona, and never
// acts: the driver plays {type:'end'} for him. He just… stands there. Menacingly.
export const SCARECROW = {
  id: 'scarecrow', name: 'Old Scarecrow', title: 'Stands there. Menacingly.',
  emoji: '🌾', hp: 6, deck: [],
  beatLine: '*flop* …the scarecrow tips right over. The crow applauds. 👏',
};

// Deterministic rigged state — same pattern as test.mjs rig(): newGame, then override.
// No RNG dependence: hands/decks are replaced outright after setup.
// p0 hero gets extraDraw:1 (an existing engine field) so turn 2 draws BOTH
// Billy the Goat and Prize Pig together — the affordable-vs-not choice beat.
export function practiceState() {
  let s = newGame({
    deckA: ['barn_cat', 'billy_goat', 'prize_pig'], deckB: ['puppy'],
    heroA: { name: 'Wyatt', emoji: '🧒', hp: 20, extraDraw: 1 },
    heroB: { name: SCARECROW.name, emoji: SCARECROW.emoji, hp: SCARECROW.hp },
    seed: 1,
  });
  s = structuredClone(s);
  delete s.bootEvents;
  const p0 = s.players[0], p1 = s.players[1];
  p0.hand = ['barn_cat'];
  p0.deck = ['billy_goat', 'prize_pig'];
  p0.discard = []; p0.board = [];
  p0.energy = 1; p0.turnsTaken = 1;
  p1.hand = []; p1.deck = []; p1.discard = []; p1.board = [];
  p1.energy = 0; p1.turnsTaken = 0;
  s.active = 0;
  return s;
}

// Script step schema:
//   id                 stable key
//   who                'player' (waits for a tap/action) | 'foe' (driver ends the scarecrow's turn)
//   coach              Coach James's line for the step (sticky bubble)
//   spotlight          {type:'hand'|'critter'|'ready'|'field'|'foeHero'|'endturn', card?}
//   thenSpotlight      spotlight swap once the player has selected (B.sel set)
//   annotate           true → anatomy chips on the spotlit hand card (cost/punch/toughness)
//   advance:'tap'      no action required — any tap moves on
//   allow              the ONLY action doAction will accept: {type, card?, target?}
//   repeat             stay on this step until the battle ends (the finishing attacks)
export const PRACTICE_STEPS = [
  { id: 'anatomy',  who: 'player', coach: '<b>Meet Barn Cat!</b> ⚡ cost, ⚔️ punch, ❤ toughness.',
    spotlight: { type: 'hand', card: 'barn_cat' }, annotate: true, advance: 'tap' },
  { id: 'play_cat', who: 'player', coach: '<b>Tap the card</b>, then tap your field! 🐈',
    spotlight: { type: 'hand', card: 'barn_cat' }, thenSpotlight: { type: 'field' },
    allow: { type: 'play', card: 'barn_cat' } },
  { id: 'sleepy',   who: 'player', coach: 'See the 💤? New animals <b>nap</b> one turn. 😴',
    spotlight: { type: 'critter', card: 'barn_cat' }, advance: 'tap' },
  { id: 'end_1',    who: 'player', coach: '<b>Tap END TURN</b> — see what he does. ➤',
    spotlight: { type: 'endturn' }, allow: { type: 'end' } },
  { id: 'foe_1',    who: 'foe',    coach: 'The scarecrow… <b>does nothing</b>. Menacingly. 🌾' },
  { id: 'attack',   who: 'player', coach: 'Your cat\'s awake! <b>Tap it</b>, then tap the scarecrow! ⚔️',
    spotlight: { type: 'critter', card: 'barn_cat' }, thenSpotlight: { type: 'foeHero' },
    allow: { type: 'attack', target: { kind: 'hero', p: 1 } } },
  { id: 'energy',   who: 'player', coach: 'Two ⚡ now! Which card can you <b>afford</b>? 🤔',
    spotlight: { type: 'hand', card: 'billy_goat' }, thenSpotlight: { type: 'field' },
    allow: { type: 'play', card: 'billy_goat' } },
  { id: 'end_2',    who: 'player', coach: 'Nice! <b>End your turn</b> — the goat needs a nap. ➤',
    spotlight: { type: 'endturn' }, allow: { type: 'end' } },
  { id: 'foe_2',    who: 'foe',    coach: 'Still standing there. Menacingly. A crow <b>lands on him</b>. 🐦‍⬛' },
  { id: 'finish',   who: 'player', coach: 'Everyone\'s awake — <b>attack with both</b>! Knock him down! ⚔️',
    spotlight: { type: 'ready' }, thenSpotlight: { type: 'foeHero' },
    allow: { type: 'attack', target: { kind: 'hero', p: 1 } }, repeat: true },
];

// Does this concrete action satisfy the step's allowlist? Shared by the game
// driver (gating taps) and the test replay (proving the script is playable).
export function actionMatches(state, step, action) {
  const a = step.allow;
  if (!a || !action || action.type !== a.type) return false;
  if (a.type === 'play') {
    return state.players[state.active].hand[action.hand] === a.card;
  }
  if (a.type === 'attack') {
    return !!action.target && action.target.kind === a.target.kind && action.target.p === a.target.p;
  }
  return true; // 'end' — type match is enough
}

// Build the concrete legal action for a step from the current state (test replay).
export function scriptedAction(state, step) {
  const a = step.allow;
  if (!a) return null;
  if (a.type === 'play') {
    const i = state.players[state.active].hand.indexOf(a.card);
    return i === -1 ? null : { type: 'play', hand: i };
  }
  if (a.type === 'attack') {
    for (const c of state.players[state.active].board) {
      if (c.sick || !c.canAttack || effAtk(state, state.active, c) <= 0) continue;
      const t = attackTargets(state, c.iid).find(t => t.kind === a.target.kind && t.p === a.target.p);
      if (t) return { type: 'attack', iid: c.iid, target: t };
    }
    return null;
  }
  return { type: 'end' };
}
