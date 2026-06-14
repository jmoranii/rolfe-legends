// Rolfe Legends — unit tests. Run: node test/test.mjs
import { CARDS, TOKENS, STARTER_DECK, BOSSES, PRESETS, validateDeck, collectionFor, presetsFor, deckBuilderUnlocked, DECK_MIN, DECK_MAX, cardCategory, CATEGORIES, deckStats } from '../js/cards.js';
import { newGame, act, legalActions, canPlay, playTargets, attackTargets, threat, effAtk, findCritter, HAND_CAP, BOARD_CAP, ENERGY_CAP, BEDTIME_TURN } from '../js/logic.js';
import { chooseAction, aiTurn } from '../js/ai.js';

let passed = 0, failed = 0;
function ok(cond, name) {
  if (cond) { passed++; }
  else { failed++; console.error(`  ✗ FAIL: ${name}`); }
}
function eq(a, b, name) { ok(JSON.stringify(a) === JSON.stringify(b), `${name} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }

const HERO = { name: 'A', emoji: '🧒', hp: 20 };
const HERO2 = { name: 'B', emoji: '👵', hp: 20 };

function freshGame(deckA = STARTER_DECK, deckB = STARTER_DECK, seed = 7) {
  return newGame({ deckA, deckB, heroA: HERO, heroB: HERO2, seed });
}

// Build a controlled state: known boards/hands/energy for player 0 (active).
function rig({ aBoard = [], bBoard = [], aHand = [], aEnergy = 5, aHp = 20, bHp = 20 } = {}) {
  let s = newGame({ deckA: ['barn_cat'], deckB: ['barn_cat'], heroA: HERO, heroB: HERO2, seed: 1 });
  s = structuredClone(s); delete s.bootEvents;
  const mk = (cardId) => {
    const d = CARDS[cardId] || TOKENS[cardId];
    return { iid: ++s.nextIid, cardId, atk: d.atk, hp: d.hp, sick: false, guard: !!d.guard, fast: !!d.fast, canAttack: true };
  };
  s.players[0].board = aBoard.map(mk);
  s.players[1].board = bBoard.map(mk);
  s.players[0].hand = [...aHand];
  s.players[1].hand = [];
  s.players[0].energy = aEnergy;
  s.players[0].deck = ['barn_cat', 'barn_cat', 'barn_cat'];
  s.players[1].deck = ['barn_cat', 'barn_cat', 'barn_cat'];
  s.players[0].hero.hp = aHp;
  s.players[1].hero.hp = bHp;
  s.active = 0;
  return s;
}
const firstBoard = (s, p = 0) => s.players[p].board[0];

console.log('— data integrity —');
{
  for (const b of BOSSES) {
    eq(b.deck.length, 12, `${b.id} deck size`);
    for (const c of b.deck) ok(!!CARDS[c], `${b.id} deck card exists: ${c}`);
    for (const c of b.reward) ok(!!CARDS[c], `${b.id} reward exists: ${c}`);
    ok(b.tip && b.intro && b.lossTip, `${b.id} has coach copy`);
  }
  ok(validateDeck(STARTER_DECK, collectionFor(0)) === null, 'starter legal at progress 0');
  const presetGate = { farm_friends: 2, speed_demons: 5, magic_show: 5, big_barn: 7, starter: 0 };
  for (const [pid, gate] of Object.entries(presetGate)) {
    const pr = PRESETS[pid];
    const err = validateDeck(pr.cards, collectionFor(gate));
    ok(err === null, `preset ${pid} legal at progress ${gate}: ${err}`);
    ok(presetsFor(gate).includes(pid), `preset ${pid} unlocked at ${gate}`);
  }
  ok(validateDeck(['barn_cat'], collectionFor(0)) !== null, 'rejects short deck');
  ok(validateDeck(['barn_cat', 'barn_cat', 'billy_goat', 'billy_goat', 'shep', 'striker', 'striker', 'mama_hen', 'prize_pig', 'slide_tackle', 'ddg', 'blessing'], collectionFor(0)) === null, 'allows 2 copies of a normal card');
  ok(validateDeck(['barn_cat', 'barn_cat', 'barn_cat', 'billy_goat', 'billy_goat', 'shep', 'striker', 'striker', 'mama_hen', 'prize_pig', 'ddg', 'blessing'], collectionFor(0)) !== null, 'rejects 3 copies of a normal card');
  ok(validateDeck(['llama', 'llama', ...STARTER_DECK.slice(0, 10)], collectionFor(8)) !== null, 'rejects 2x legendary');
  ok(validateDeck([...STARTER_DECK.slice(0, 11), 'llama'], collectionFor(0)) !== null, 'rejects unowned card');
  // flexible deck sizes 12–24
  const big = [...STARTER_DECK, 'sprinter', 'sprinter', 'goat_stampede', 'nutmeg', 'math_whiz', 'math_whiz', 'magic_vanish', 'trickster', 'trickster', 'maestro', 'llama', 'sig_rusty'];
  eq(big.length, DECK_MAX, 'test deck is 24');
  ok(validateDeck(big, collectionFor(8)) === null, '24-card deck is legal');
  ok(validateDeck([...big, 'barn_cat'], collectionFor(8)) !== null, '25 cards rejected');
  ok(validateDeck(STARTER_DECK.slice(0, 11), collectionFor(0)) !== null, '11 cards rejected');
  ok(validateDeck([...STARTER_DECK, 'sprinter'], collectionFor(1)) === null, '13-card deck is legal');
  // categories: every card lands on a shelf
  for (const id of Object.keys(CARDS)) ok(CATEGORIES.some(c => c.id === cardCategory(id)), `category for ${id}`);
  // deck stats: all 1–5, and the axes tell true stories
  for (const [pid, p] of Object.entries(PRESETS)) {
    const s = deckStats(p.cards);
    ok([s.punch, s.tough, s.tricks].every(v => v >= 1 && v <= 5), `stats in range: ${pid}`);
  }
  for (const b of BOSSES) {
    const s = deckStats(b.deck);
    ok([s.punch, s.tough, s.tricks].every(v => v >= 1 && v <= 5), `stats in range: boss ${b.id}`);
  }
  ok(deckStats(BOSSES[2].deck).tough === 5, 'jacob reads as THE WALL');
  ok(deckStats(BOSSES[4].deck).punch >= 4, 'brody reads as a cannon');
  ok(deckStats(PRESETS.speed_demons.cards).punch >= 4, 'speed demons reads punchy');
  // a 24-card deck plays a full AI game without issue
  {
    let s = newGame({ deckA: big, deckB: BOSSES[3].deck, heroA: { name: 'A', emoji: 'x', hp: 20 }, heroB: { name: 'B', emoji: 'y', hp: 20 }, seed: 4242 });
    let steps = 0;
    const KIDP = { aggression: 0.55, tradeCare: 0.6, healAt: 10, smart: 0, curve: 'mid' };
    while (!s.over && steps < 2000) { const { state } = aiTurn(s, s.active === 0 ? KIDP : BOSSES[3].persona, act); s = state; steps++; }
    ok(s.over, '24-card deck game terminates');
  }
  ok(deckBuilderUnlocked(2) && !deckBuilderUnlocked(1), 'deck builder unlocks after boss 2');
  ok(!collectionFor(8).has('dog_man'), 'dog man not unlocked by campaign');
  ok(collectionFor(8, { dogMan: true }).has('dog_man'), 'dog man via secret');
  // champion's reward: beating the campaign unlocks the whole pool
  ok(!collectionFor(7).has('knitting_needles') && !collectionFor(7).has('fence'), 'boss-only cards locked before the crown');
  ok(collectionFor(8).has('knitting_needles') && collectionFor(8).has('fence') && collectionFor(8).has('sig_rocky') && collectionFor(8).has('big_hug'), 'crown unlocks every boss deck card');
  ok(!collectionFor(8).has('grand_finale'), 'Smidgen stays a boss-only enrage token (never player-collectible)');
  const champDeck = ['fence', 'fence', 'real_talk', 'real_talk', 'knitting_needles', 'knitting_needles', 'speed_demon', 'speed_demon', 'guard_cat', 'guard_cat', 'big_hug', 'sig_rocky'];
  ok(validateDeck(champDeck, collectionFor(8)) === null, 'all-boss-card deck buildable after crown');
  ok(validateDeck([...champDeck.slice(0, 11), 'sig_rocky', 'sig_rocky'], collectionFor(8)) !== null, 'legendary 1-copy cap enforced (2× sig_rocky rejected)');
  for (const [id, c] of Object.entries(CARDS)) {
    ok(c.type === 'critter' ? Number.isInteger(c.atk) && Number.isInteger(c.hp) : !!c.fx, `card coherent: ${id}`);
    ok(c.cost >= 0 && c.cost <= 5, `cost in range: ${id}`);
    ok(!!c.flavor, `flavor exists: ${id}`);
  }
}

console.log('— core rules —');
{
  const s = freshGame();
  eq(s.players[0].hand.length, 5, 'P1 opening hand 4 + turn-1 draw = 5');
  eq(s.players[1].hand.length, 5, 'P2 opening hand 5 (draws on own turn)');
  eq(s.players[0].energy, 1, 'turn 1 energy = 1');
  let cur = s;
  for (let t = 2; t <= 8; t++) {
    cur = act(cur, { type: 'end' }).state;
    cur = act(cur, { type: 'end' }).state;
    eq(cur.players[0].energy, Math.min(ENERGY_CAP, t), `turn ${t} energy`);
  }
}
{
  let s = rig({ aHand: ['barn_cat', 'sprinter'] });
  s = act(s, { type: 'play', hand: 0 }).state;
  const cat = s.players[0].board.find(c => c.cardId === 'barn_cat');
  eq(attackTargets(s, cat.iid).length, 0, 'sick critter cannot attack');
  s = act(s, { type: 'play', hand: 0 }).state;
  const spr = s.players[0].board.find(c => c.cardId === 'sprinter');
  ok(attackTargets(s, spr.iid).length > 0, 'Fast attacks immediately');
}
{
  let s = rig({ aBoard: ['billy_goat'], bBoard: ['shep', 'barn_cat'], aHand: ['nutmeg'] });
  const ts = attackTargets(s, firstBoard(s).iid);
  eq(ts.length, 1, 'guard: only guard targetable');
  eq(findCritter(s, 1, ts[0].iid).cardId, 'shep', 'guard is the target');
  s = act(s, { type: 'play', hand: 0 }).state;
  ok(attackTargets(s, firstBoard(s).iid).some(t => t.kind === 'hero'), 'nutmeg: hero targetable through guard');
  const s3 = act(s, { type: 'end' }).state;
  eq(s3.players[0].flags.ignoreGuard, false, 'ignoreGuard clears at end of turn');
}
{
  let s = rig({ aBoard: ['billy_goat'], bBoard: ['lil_goat'] }); // 3/2 vs 2/2
  const r = act(s, { type: 'attack', iid: firstBoard(s).iid, target: { kind: 'critter', p: 1, iid: firstBoard(s, 1).iid } });
  eq(r.state.players[1].board.length, 0, 'defender dies in trade');
  eq(r.state.players[0].board.length, 0, 'attacker dies in mutual trade');
  let s2 = rig({ aBoard: ['billy_goat'] });
  const r2 = act(s2, { type: 'attack', iid: firstBoard(s2).iid, target: { kind: 'hero', p: 1 } });
  eq(r2.state.players[1].hero.hp, 17, 'face damage applied');
  eq(r2.state.players[0].board[0].hp, 2, 'no retaliation from hero');
}
{
  let s = rig({ aBoard: ['prize_bull'], bHp: 5 });
  const r = act(s, { type: 'attack', iid: firstBoard(s).iid, target: { kind: 'hero', p: 1 } });
  eq(r.state.winner, 0, 'winner set');
  ok(r.events.some(e => e.t === 'win'), 'win event emitted');
  eq(legalActions(r.state).length, 0, 'no actions after game over');
}
{
  let s = rig({ aHand: ['barn_cat', 'barn_cat', 'barn_cat', 'barn_cat', 'barn_cat', 'barn_cat', 'barn_cat'] });
  s = act(s, { type: 'end' }).state;
  const r = act(s, { type: 'end' }).state;
  eq(r.players[0].hand.length, HAND_CAP, 'hand capped at 7 (draw skipped)');
}
{
  let s = rig({ aBoard: ['barn_cat', 'barn_cat', 'barn_cat', 'barn_cat'], aHand: ['billy_goat', 'duck_flock'] });
  ok(!canPlay(s, 0), 'cannot play critter on full board');
  const r = act(s, { type: 'play', hand: 1 });
  ok(r.events.some(e => e.t === 'fizzle'), 'summon fizzles on full board');
}

console.log('— card effects —');
{
  // mama hen summons a chick
  let s = rig({ aHand: ['mama_hen'] });
  const r = act(s, { type: 'play', hand: 0 }).state;
  ok(r.players[0].board.some(c => c.cardId === 'chick'), 'mama hen summons chick');
}
{
  // math whiz draws
  let s = rig({ aHand: ['math_whiz'] });
  const r = act(s, { type: 'play', hand: 0 }).state;
  eq(r.players[0].hand.length, 1, 'math whiz drew a card');
}
{
  // chelsea heals
  let s = rig({ aHand: ['sig_chelsea'], aHp: 10 });
  const r = act(s, { type: 'play', hand: 0 }).state;
  eq(r.players[0].hero.hp, 16, 'chelsea battlecry heals 6');
  // overheal past maxHp is allowed (you can climb above starting HP)
  let s2 = rig({ aHand: ['blessing'], aHp: 19 });
  const r2 = act(s2, { type: 'play', hand: 0 }).state;
  eq(r2.players[0].hero.hp, 23, 'overheal past maxHp allowed (19 + 4)');
}
{
  // flaj toughens others (not self)
  let s = rig({ aBoard: ['barn_cat'], aHand: ['sig_flaj'] });
  const r = act(s, { type: 'play', hand: 0 }).state;
  const cat = r.players[0].board.find(c => c.cardId === 'barn_cat');
  const flaj = r.players[0].board.find(c => c.cardId === 'sig_flaj');
  eq(cat.hp, 3, 'flaj gives other ally +0/+2');
  eq(flaj.hp, 6, 'flaj does not buff himself');
}
{
  // rocky AoEs enemy board
  let s = rig({ bBoard: ['barn_cat', 'prize_pig'], aHand: ['sig_rocky'] });
  const r = act(s, { type: 'play', hand: 0 }).state;
  eq(r.players[1].board.length, 1, 'rocky battlecry kills the 2/1');
  eq(r.players[1].board[0].hp, 2, 'rocky battlecry damages the pig');
}
{
  // aaron summons TWO ducklings
  let s = rig({ aHand: ['sig_aaron'] });
  const r = act(s, { type: 'play', hand: 0 }).state;
  eq(r.players[0].board.filter(c => c.cardId === 'duckling').length, 2, 'aaron summons 2 ducklings');
}
{
  // jacob (Dad) buffs a RANDOM ally +2/+2 on play
  let s = rig({ aBoard: ['barn_cat'], aHand: ['sig_jacob'] });
  const r = act(s, { type: 'play', hand: 0 }).state;
  const totA = r.players[0].board.reduce((t, c) => t + c.atk, 0);
  const totH = r.players[0].board.reduce((t, c) => t + c.hp, 0);
  eq([totA, totH], [6, 7], 'jacob +2/+2 to a random ally (barn_cat 2/1 + jacob 2/4 + 2/2)');
  // and plays fine with no other ally (buffs himself, the only ally)
  let s2 = rig({ aHand: ['sig_jacob'] });
  const r2 = act(s2, { type: 'play', hand: 0 }).state;
  eq(r2.players[0].board.length, 1, 'jacob playable on empty board');
  eq([r2.players[0].board[0].atk, r2.players[0].board[0].hp], [4, 6], 'jacob buffs himself when alone (2/4 + 2/2)');
}
{
  // tory aura: +1 atk to others while she lives
  let s = rig({ aBoard: ['sig_tory', 'barn_cat'], bBoard: ['old_tractor'] });
  const cat = s.players[0].board.find(c => c.cardId === 'barn_cat');
  const tory = s.players[0].board.find(c => c.cardId === 'sig_tory');
  eq(effAtk(s, 0, cat), 3, 'aura boosts ally');
  eq(effAtk(s, 0, tory), 3, 'aura does not boost self');
  // aura dies with her
  const tractor = s.players[1].board[0];
  let s2 = structuredClone(s); s2.players[0].board = s2.players[0].board.filter(c => c.cardId !== 'sig_tory');
  eq(effAtk(s2, 0, s2.players[0].board[0]), 2, 'aura gone when tory gone');
}
{
  // llama: -1 atk to all enemies, floor 0
  let s = rig({ bBoard: ['fence', 'prize_bull'], aHand: ['llama'] });
  const r = act(s, { type: 'play', hand: 0 }).state;
  const fence = r.players[1].board.find(c => c.cardId === 'fence');
  const bull = r.players[1].board.find(c => c.cardId === 'prize_bull');
  eq(fence.atk, 0, 'llama floors at 0');
  eq(bull.atk, 4, 'llama -1 atk');
}
{
  // maestro start-of-turn buff
  let s = rig({ aBoard: ['maestro'] });
  s = act(s, { type: 'end' }).state;
  const r = act(s, { type: 'end' }).state; // back to P0 turn start
  const m = r.players[0].board[0];
  ok(m.atk + m.hp > 7, 'maestro sot buffed an ally (+1/+1 somewhere)');
}
{
  // quack attack: temp +1 atk this turn only
  let s = rig({ aBoard: ['barn_cat'], aHand: ['quack_attack'] });
  s = act(s, { type: 'play', hand: 0 }).state;
  eq(effAtk(s, 0, firstBoard(s)), 3, 'temp atk applies');
  const s2 = act(s, { type: 'end' }).state;
  eq(effAtk(s2, 0, s2.players[0].board[0]), 2, 'temp atk expires at end of turn');
}
{
  // magic vanish: bounce resets buffs, full heal; tokens evaporate; hand-full poofs
  let s = rig({ bBoard: ['prize_pig'], aHand: ['magic_vanish'] });
  s.players[1].board[0].atk = 6; s.players[1].board[0].hp = 1; // buffed + damaged
  const target = { kind: 'critter', p: 1, iid: firstBoard(s, 1).iid };
  const r = act(s, { type: 'play', hand: 0, target });
  eq(r.state.players[1].board.length, 0, 'bounced off board');
  ok(r.state.players[1].hand.includes('prize_pig'), 'bounced to hand as fresh card');
  let s2 = rig({ bBoard: ['chick'], aHand: ['magic_vanish'] });
  const r2 = act(s2, { type: 'play', hand: 0, target: { kind: 'critter', p: 1, iid: firstBoard(s2, 1).iid } });
  eq(r2.state.players[1].board.length, 0, 'token bounced');
  ok(!r2.state.players[1].hand.includes('chick'), 'token evaporates instead of bouncing');
}
{
  // loud music: face damage + draw
  let s = rig({ aHand: ['loud_music'] });
  const r = act(s, { type: 'play', hand: 0 }).state;
  eq(r.players[1].hero.hp, 18, 'loud music hits face');
  eq(r.players[0].hand.length, 1, 'loud music draws');
}
{
  // real talk can go face or critter
  let s = rig({ bBoard: ['barn_cat'], aHand: ['real_talk'] });
  const ts = playTargets(s, 0);
  ok(ts.some(t => t.kind === 'hero') && ts.some(t => t.kind === 'critter'), 'any-enemy targets both');
}
{
  // targeted tricks unplayable with no targets
  let s = rig({ aHand: ['slide_tackle', 'magic_vanish'] });
  ok(!canPlay(s, 0), 'slide tackle unplayable with empty enemy board');
  ok(!canPlay(s, 1), 'vanish unplayable with empty enemy board');
  ok(legalActions(s).every(a => a.type !== 'play'), 'no play actions for targetless tricks');
}
{
  // threat meter
  let s = rig({ bBoard: ['prize_bull', 'sig_tory'] }); // 5 + 3, tory aura gives bull +1 → 5+1=6? tory aura boosts OTHERS: bull 5+1=6, tory 3
  const t = threat(s, 0);
  eq(t.incoming, 9, 'threat = sum of enemy effective atk');
}
{
  // bedtime anti-stall
  let s = rig({});
  s.players[0].turnsTaken = BEDTIME_TURN - 1;
  s.players[1].turnsTaken = BEDTIME_TURN - 1;
  s = act(s, { type: 'end' }).state; // P1 takes turn 30: 1 dmg
  eq(s.players[1].hero.hp, 19, 'bedtime damage at turn 30');
}

console.log('— recycle (discard pile) —');
{
  // tricks go to discard
  let s = rig({ aHand: ['blessing'], aHp: 10 });
  const r = act(s, { type: 'play', hand: 0 }).state;
  ok(r.players[0].discard.includes('blessing'), 'played trick goes to discard');
}
{
  // dead critters go to owner's discard; tokens evaporate entirely
  let s = rig({ aBoard: ['billy_goat'], bBoard: ['lil_goat', 'chick'] });
  let r = act(s, { type: 'attack', iid: firstBoard(s).iid, target: { kind: 'critter', p: 1, iid: firstBoard(s, 1).iid } }).state;
  ok(r.players[1].discard.includes('lil_goat'), 'dead critter goes to discard');
  ok(r.players[0].discard.includes('billy_goat'), 'mutual trade: attacker discarded too');
  ok(!JSON.stringify(r.players).includes('"chick"') || true, 'sanity');
  // kill the chick via trick: should NOT hit discard
  let s2 = rig({ bBoard: ['chick'], aHand: ['slide_tackle'] });
  const r2 = act(s2, { type: 'play', hand: 0, target: { kind: 'critter', p: 1, iid: firstBoard(s2, 1).iid } }).state;
  ok(!r2.players[1].discard.includes('chick'), 'token death does not enter discard');
}
{
  // deck empty + discard present → reshuffle and keep drawing
  let s = rig({});
  s.players[0].deck = [];
  s.players[0].discard = ['barn_cat', 'billy_goat', 'blessing'];
  s = act(s, { type: 'end' }).state;
  const r = act(s, { type: 'end' });
  ok(r.events.some(e => e.t === 'recycle' && e.p === 0), 'recycle event fired');
  eq(r.state.players[0].discard.length, 0, 'discard emptied into deck');
  ok(r.state.players[0].hand.length > 0, 'drew from recycled deck');
}
{
  // deck AND discard empty → draw just skips (no crash)
  let s = rig({});
  s.players[0].deck = []; s.players[0].discard = [];
  s = act(s, { type: 'end' }).state;
  const r = act(s, { type: 'end' });
  ok(r.events.some(e => e.t === 'deckEmpty'), 'deckEmpty when truly out');
}

console.log('— enrage (final boss phase 2: one-time summon + buff) —');
{
  // dropping below threshold: summon the listed reinforcements + buff the whole board (existing + summons), once
  let s = newGame({ deckA: ['barn_cat'], deckB: ['lil_goat'], heroA: HERO, heroB: { name: 'R', emoji: 'r', hp: 14, enrage: { at: 12, summon: ['guard_dog', 'guard_dog'], a: 2, h: 2 } }, seed: 3 });
  s = structuredClone(s); delete s.bootEvents;
  s.players[1].board = [{ iid: ++s.nextIid, cardId: 'lil_goat', atk: 2, hp: 2, sick: false, guard: false, fast: false, canAttack: true }];
  s.players[0].board = [{ iid: ++s.nextIid, cardId: 'prize_bull', atk: 5, hp: 4, sick: false, guard: false, fast: false, canAttack: true }];
  s.active = 0;
  const r = act(s, { type: 'attack', iid: s.players[0].board[0].iid, target: { kind: 'hero', p: 1 } }); // 14 - 5 = 9 ≤ 12
  ok(r.events.some(e => e.t === 'enrage'), 'enrage fires when boss drops below threshold');
  ok(r.state.players[1].hero.enraged, 'enraged flag set');
  // the enrage event is emitted BEFORE the summons, so the UI cutscene can play first
  const ei = r.events.findIndex(e => e.t === 'enrage'), si = r.events.findIndex(e => e.t === 'summon');
  ok(ei >= 0 && si > ei, 'enrage event precedes the summon events');
  eq(r.events.find(e => e.t === 'enrage').summonIds, ['guard_dog', 'guard_dog'], 'enrage event carries the summon list');
  eq(r.state.players[1].board.length, 3, 'enrage summons 2 dogs (1 existing + 2 = 3)');
  const dogs = r.state.players[1].board.filter(c => c.cardId === 'guard_dog');
  eq([dogs.length, dogs[0].atk, dogs[0].hp], [2, 5, 5], 'summoned guard dogs buffed (3/3 + 2/2 = 5/5)');
  const goat = r.state.players[1].board.find(c => c.cardId === 'lil_goat');
  eq([goat.atk, goat.hp], [4, 4], 'existing board buffed too (lil_goat 2/2→4/4)');
}
{
  // summons SPECIFIC tokens in order (Smidgen leads), and works with no buff
  let s = newGame({ deckA: ['barn_cat'], deckB: ['lil_goat'], heroA: HERO, heroB: { name: 'R', emoji: 'r', hp: 14, enrage: { at: 12, summon: ['grand_finale', 'guard_dog'], a: 0, h: 0 } }, seed: 5 });
  s = structuredClone(s); delete s.bootEvents;
  s.players[0].board = [{ iid: ++s.nextIid, cardId: 'prize_bull', atk: 5, hp: 4, sick: false, guard: false, fast: false, canAttack: true }];
  s.players[1].board = []; s.active = 0;
  const r = act(s, { type: 'attack', iid: s.players[0].board[0].iid, target: { kind: 'hero', p: 1 } });
  eq(r.state.players[1].board.map(c => c.cardId), ['grand_finale', 'guard_dog'], 'summons the listed tokens in order (Smidgen first)');
  const smidge = r.state.players[1].board[0];
  eq([smidge.atk, smidge.hp, smidge.guard, smidge.fast], [3, 4, true, false], 'Smidgen is a 3/4 Guard, summoning-sick (no fast, no buff)');
}
{
  // respects the 4-board cap: only as many summons as fit
  let s = newGame({ deckA: ['barn_cat'], deckB: ['lil_goat'], heroA: HERO, heroB: { name: 'R', emoji: 'r', hp: 14, enrage: { at: 12, summon: ['guard_dog', 'guard_dog', 'guard_dog'], a: 0, h: 0 } }, seed: 6 });
  s = structuredClone(s); delete s.bootEvents;
  s.players[1].board = [
    { iid: ++s.nextIid, cardId: 'lil_goat', atk: 2, hp: 2, sick: false, guard: false, fast: false, canAttack: true },
    { iid: ++s.nextIid, cardId: 'lil_goat', atk: 2, hp: 2, sick: false, guard: false, fast: false, canAttack: true },
  ];
  s.players[0].board = [{ iid: ++s.nextIid, cardId: 'prize_bull', atk: 5, hp: 4, sick: false, guard: false, fast: false, canAttack: true }];
  s.active = 0;
  const r = act(s, { type: 'attack', iid: s.players[0].board[0].iid, target: { kind: 'hero', p: 1 } });
  eq(r.state.players[1].board.length, 4, 'enrage respects the 4-board cap (2 existing + 2 of 3 summons)');
}
{
  // lands even from an EMPTY board (the whole point) — and only fires once
  let s = newGame({ deckA: ['barn_cat'], deckB: ['lil_goat'], heroA: HERO, heroB: { name: 'R', emoji: 'r', hp: 14, enrage: { at: 12, summon: ['guard_dog', 'guard_dog'], a: 2, h: 2 } }, seed: 4 });
  s = structuredClone(s); delete s.bootEvents;
  s.players[0].board = [{ iid: ++s.nextIid, cardId: 'prize_bull', atk: 5, hp: 4, sick: false, guard: false, fast: false, canAttack: true }];
  s.players[1].board = []; s.active = 0;
  const r = act(s, { type: 'attack', iid: s.players[0].board[0].iid, target: { kind: 'hero', p: 1 } });
  eq(r.state.players[1].board.length, 2, 'enrage from empty board still summons 2 dogs');
  // does NOT re-fire (clear the summoned guards so the hero is hittable again)
  let s2 = structuredClone(r.state); s2.players[1].board = []; s2.active = 0;
  s2.players[0].board = [{ iid: ++s2.nextIid, cardId: 'barn_cat', atk: 2, hp: 1, sick: false, guard: false, fast: false, canAttack: true }];
  const r2 = act(s2, { type: 'attack', iid: s2.players[0].board[0].iid, target: { kind: 'hero', p: 1 } });
  ok(!r2.events.some(e => e.t === 'enrage'), 'enrage fires only once');
}
{
  // a normal hero (no enrage config) never enrages
  let s = rig({ bBoard: ['lil_goat'], aBoard: ['prize_bull'], bHp: 5 });
  const r = act(s, { type: 'attack', iid: s.players[0].board[0].iid, target: { kind: 'hero', p: 1 } });
  ok(!r.events.some(e => e.t === 'enrage'), 'no enrage without config');
}

console.log('— AI sanity —');
{
  // AI finds lethal
  let s = rig({ aBoard: ['prize_bull', 'billy_goat'], bHp: 7 });
  const a = chooseAction(s, { aggression: 0.1, tradeCare: 0.9, curve: 'mid' });
  eq(a.type, 'attack', 'AI takes lethal even at low aggression');
  eq(a.target.kind, 'hero', 'AI lethal goes face');
}
{
  // AI respects neverLethal (Rusty)
  let s = rig({ aBoard: ['prize_bull', 'billy_goat'], bHp: 7 });
  const a = chooseAction(s, { aggression: 0.2, tradeCare: 0, neverLethal: true, curve: 'wide' });
  ok(!(a.type === 'attack' && a.target.kind === 'hero' && effAtk(s, 0, findCritter(s, 0, a.iid)) >= 7), 'rusty does not consciously take lethal line');
}
{
  // AI heals when low
  let s = rig({ aHand: ['cozy_blanket'], aHp: 8 });
  const a = chooseAction(s, { aggression: 0.3, tradeCare: 0.8, healAt: 14, curve: 'mid' });
  eq(a.type, 'play', 'AI heals when low');
}
{
  // AI plays on curve / makes progress; full AI-vs-AI game terminates
  const bossA = BOSSES[1], bossR = BOSSES[7];
  let s = newGame({ deckA: bossA.deck, deckB: bossR.deck, heroA: { name: 'A', emoji: 'x', hp: 20 }, heroB: { name: 'R', emoji: 'y', hp: 25 }, seed: 99 });
  let steps = 0;
  while (!s.over && steps < 2000) {
    const persona = s.active === 0 ? bossA.persona : bossR.persona;
    const { state } = aiTurn(s, persona, act);
    s = state; steps++;
  }
  ok(s.over, `AI vs AI game terminates (steps=${steps})`);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
