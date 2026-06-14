// Rolfe Legends — pure game engine. No DOM. See DESIGN.md for rules.
// API: newGame(opts) -> state; legalActions(state) -> [action]; act(state, action) -> {state, events}
// Actions: {type:'play', hand:i, target?} | {type:'attack', iid, target} | {type:'end'}
// Targets: {kind:'critter', p, iid} | {kind:'hero', p}

import { CARDS, TOKENS } from './cards.js';

export const HAND_CAP = 7;
export const BOARD_CAP = 4;
export const ENERGY_CAP = 5;
export const BEDTIME_TURN = 16; // anti-stall: recycling decks never run dry, so bedtime is what guarantees games end (human playtest: games ran too many deck rotations at 22)

// ---- seeded rng (mulberry32) ----
function rand(state) {
  let t = (state.rngState += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function cardDef(id) {
  const c = CARDS[id] || TOKENS[id];
  if (!c) throw new Error(`Unknown card: ${id}`);
  return c;
}

function makeInst(state, cardId) {
  const d = cardDef(cardId);
  return {
    iid: ++state.nextIid, cardId, atk: d.atk, hp: d.hp,
    sick: true, guard: !!d.guard, fast: !!d.fast, canAttack: false,
  };
}

export function effAtk(state, p, inst) {
  let a = inst.atk;
  for (const other of state.players[p].board) {
    if (other.iid === inst.iid) continue;
    const d = cardDef(other.cardId);
    if (d.aura && d.aura.a) a += d.aura.a;
  }
  a += state.players[p].flags.tempAtk || 0;
  return Math.max(0, a);
}

export function newGame({ deckA, deckB, heroA, heroB, seed = 42, first = 0 }) {
  const state = {
    rngState: seed >>> 0, nextIid: 0, active: first, winner: null, over: false,
    players: [
      mkPlayer(heroA, deckA), mkPlayer(heroB, deckB),
    ],
  };
  for (const p of [0, 1]) shuffle(state, state.players[p].deck);
  // starting hands: first player 4, second player 5
  drawN(state, first, 4, []);
  drawN(state, 1 - first, 5, []);
  const events = [];
  startTurn(state, events); // first player's turn 1 (draws to 5)
  state.bootEvents = events; // UI may replay these
  return state;
}

function mkPlayer(hero, deck) {
  return {
    hero: { name: hero.name, emoji: hero.emoji, hp: hero.hp, maxHp: hero.hp, enrage: hero.enrage || null, enraged: false, extraDraw: hero.extraDraw || 0 },
    deck: [...deck], hand: [], board: [], discard: [],
    energy: 0, turnsTaken: 0, flags: { tempAtk: 0, ignoreGuard: false },
  };
}

function shuffle(state, arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand(state) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function drawN(state, p, n, events) {
  const pl = state.players[p];
  for (let i = 0; i < n; i++) {
    if (pl.deck.length === 0 && pl.discard.length > 0) {
      // recycle: played tricks + fallen critters shuffle back in — you never run dry
      pl.deck = [...pl.discard];
      pl.discard = [];
      shuffle(state, pl.deck);
      events.push({ t: 'recycle', p, count: pl.deck.length });
    }
    if (pl.deck.length === 0) { events.push({ t: 'deckEmpty', p }); return; }
    if (pl.hand.length >= HAND_CAP) { events.push({ t: 'handFull', p }); return; }
    const cardId = pl.deck.shift();
    pl.hand.push(cardId);
    events.push({ t: 'draw', p, cardId, handSize: pl.hand.length });
  }
}

function startTurn(state, events) {
  const p = state.active, pl = state.players[p];
  pl.turnsTaken += 1;
  pl.energy = Math.min(ENERGY_CAP, pl.turnsTaken);
  for (const c of pl.board) { c.sick = false; c.canAttack = true; }
  events.push({ t: 'turnStart', p, energy: pl.energy, turnNo: pl.turnsTaken });
  // anti-stall: past-bedtime damage
  if (pl.turnsTaken >= BEDTIME_TURN) {
    const n = pl.turnsTaken - BEDTIME_TURN + 1;
    events.push({ t: 'bedtime', p, n });
    damageHero(state, p, n, events);
    if (state.over) return;
  }
  drawN(state, p, 1 + (pl.hero.extraDraw || 0), events); // final boss draws extra (card advantage)
  // start-of-turn triggers (e.g., Piano Maestro)
  for (const c of [...pl.board]) {
    const d = cardDef(c.cardId);
    if (d.sot && d.sot.kind === 'buff') {
      const allies = pl.board.filter(x => x.hp > 0);
      if (allies.length) {
        const pick = allies[Math.floor(rand(state) * allies.length)];
        pick.atk += d.sot.a; pick.hp += d.sot.h;
        events.push({ t: 'buff', side: p, iid: pick.iid, a: d.sot.a, h: d.sot.h, src: c.cardId });
      }
    }
  }
}

function damageHero(state, p, n, events) {
  const h = state.players[p].hero;
  h.hp -= n;
  events.push({ t: 'dmg', side: p, iid: null, n, hp: h.hp });
  if (h.hp <= 0 && !state.over) {
    state.over = true; state.winner = 1 - p;
    events.push({ t: 'win', p: 1 - p });
    return;
  }
  // ENRAGE (final boss): the first time this hero drops to/below the threshold, a ONE-TIME burst —
  // summon specific reinforcement critters (Smidgen leads the dogs in), then rally her whole board
  // (existing + summons). Designed to land even from an empty field, so it never whiffs when ahead.
  // The `enrage` event is emitted FIRST (before the summons) so the UI can play its cutscene and
  // only THEN animate the dogs in — the engine has already applied everything; events are the replay.
  if (h.enrage && !h.enraged && h.hp <= h.enrage.at) {
    h.enraged = true;
    const pl = state.players[p];
    const ids = Array.isArray(h.enrage.summon) ? h.enrage.summon : [];
    const a = h.enrage.a || 0, hh = h.enrage.h || 0;
    events.push({ t: 'enrage', p, a, h: hh, name: h.name, summonIds: [...ids] });
    for (const tid of ids) {
      if (pl.board.length >= BOARD_CAP) break; // no room — the rest don't fit
      const inst = makeInst(state, tid);
      pl.board.push(inst); // summoning-sick like any summon (Guards still block immediately)
      events.push({ t: 'summon', p, iid: inst.iid, cardId: tid, fromEnrage: true });
    }
    if (a || hh) for (const c of pl.board) { c.atk += a; c.hp += hh; }
  }
}

function damageCritter(state, p, inst, n, events) {
  inst.hp -= n;
  events.push({ t: 'dmg', side: p, iid: inst.iid, n, hp: inst.hp });
}

function reap(state, events) {
  for (const p of [0, 1]) {
    const pl = state.players[p];
    const dead = pl.board.filter(c => c.hp <= 0);
    if (dead.length) {
      pl.board = pl.board.filter(c => c.hp > 0);
      for (const c of dead) {
        events.push({ t: 'death', side: p, iid: c.iid, cardId: c.cardId });
        if (!cardDef(c.cardId).token) pl.discard.push(c.cardId); // fallen critters recycle
      }
    }
  }
}

function hasGuard(state, p) {
  return state.players[p].board.some(c => c.guard && c.hp > 0);
}

export function findCritter(state, p, iid) {
  return state.players[p].board.find(c => c.iid === iid) || null;
}

// ---- targeting --------------------------------------------------------------
// Returns list of valid targets for a hand card (by index) or null if untargeted.
export function playTargets(state, handIdx) {
  const p = state.active, opp = 1 - p;
  const d = cardDef(state.players[p].hand[handIdx]);
  const spec = d.type === 'trick' ? d.fx : d.bc;
  if (!spec) return null;
  switch (spec.target) {
    case 'pick-critter-enemy':
      return state.players[opp].board.map(c => ({ kind: 'critter', p: opp, iid: c.iid }));
    case 'any-enemy': {
      const t = state.players[opp].board.map(c => ({ kind: 'critter', p: opp, iid: c.iid }));
      t.push({ kind: 'hero', p: opp });
      return t;
    }
    case 'pick-ally':
      return state.players[p].board.map(c => ({ kind: 'critter', p, iid: c.iid }));
    case 'pick-ally-other': // excludes the card being played (it isn't on board yet, so: all current allies)
      return state.players[p].board.map(c => ({ kind: 'critter', p, iid: c.iid }));
    default:
      return null; // untargeted effect
  }
}

function targetRequired(d) {
  const spec = d.type === 'trick' ? d.fx : d.bc;
  if (!spec) return false;
  return ['pick-critter-enemy', 'any-enemy', 'pick-ally', 'pick-ally-other'].includes(spec.target || '');
}

export function attackTargets(state, iid) {
  const p = state.active, opp = 1 - p;
  const me = findCritter(state, p, iid);
  if (!me || !me.canAttack || me.sick || effAtk(state, p, me) <= 0) return [];
  const ignore = state.players[p].flags.ignoreGuard;
  const guards = state.players[opp].board.filter(c => c.guard && c.hp > 0);
  if (guards.length && !ignore) {
    return guards.map(c => ({ kind: 'critter', p: opp, iid: c.iid }));
  }
  const t = state.players[opp].board.map(c => ({ kind: 'critter', p: opp, iid: c.iid }));
  t.push({ kind: 'hero', p: opp });
  return t;
}

// ---- legal actions ------------------------------------------------------------
export function legalActions(state) {
  if (state.over) return [];
  const p = state.active, pl = state.players[p];
  const actions = [];
  pl.hand.forEach((cardId, i) => {
    const d = cardDef(cardId);
    if (d.cost > pl.energy) return;
    if (d.type === 'critter' && pl.board.length >= BOARD_CAP) return;
    const targets = playTargets(state, i);
    if (targetRequired(d)) {
      if (d.type === 'trick') {
        // tricks that need a target are unplayable without one
        for (const t of (targets || [])) actions.push({ type: 'play', hand: i, target: t });
      } else {
        // battlecry critters can be played without a target (effect fizzles)
        if (targets && targets.length) for (const t of targets) actions.push({ type: 'play', hand: i, target: t });
        else actions.push({ type: 'play', hand: i });
      }
    } else {
      actions.push({ type: 'play', hand: i });
    }
  });
  for (const c of pl.board) {
    for (const t of attackTargets(state, c.iid)) actions.push({ type: 'attack', iid: c.iid, target: t });
  }
  actions.push({ type: 'end' });
  return actions;
}

// ---- effects -------------------------------------------------------------------
function resolveEffect(state, p, spec, target, events, srcCardId) {
  const opp = 1 - p;
  const pl = state.players[p];
  switch (spec.kind) {
    case 'damage': {
      if (spec.target === 'all-enemy-critters') {
        for (const c of [...state.players[opp].board]) damageCritter(state, opp, c, spec.n, events);
      } else if (spec.target === 'enemy-hero') {
        damageHero(state, opp, spec.n, events);
      } else if (target) {
        if (target.kind === 'hero') damageHero(state, target.p, spec.n, events);
        else {
          const c = findCritter(state, target.p, target.iid);
          if (c) damageCritter(state, target.p, c, spec.n, events);
        }
      }
      if (spec.draw) drawN(state, p, spec.draw, events);
      break;
    }
    case 'heal': {
      const h = pl.hero;
      h.hp += spec.n; // overheal allowed — you can climb above your starting HP
      events.push({ t: 'heal', side: p, n: spec.n, hp: h.hp });
      if (spec.draw) drawN(state, p, spec.draw, events);
      break;
    }
    case 'draw': drawN(state, p, spec.n, events); break;
    case 'buff': {
      let targets = [];
      if (spec.target === 'all-allies') targets = pl.board;
      else if (spec.target === 'other-allies') targets = pl.board.filter(c => c.iid !== state.lastPlayedIid);
      else if (spec.target === 'random-ally') {
        if (pl.board.length) targets = [pl.board[Math.floor(rand(state) * pl.board.length)]];
      } else if (target && target.kind === 'critter') {
        const c = findCritter(state, target.p, target.iid);
        if (c) targets = [c];
      }
      for (const c of targets) {
        c.atk += spec.a || 0; c.hp += spec.h || 0;
        events.push({ t: 'buff', side: p, iid: c.iid, a: spec.a || 0, h: spec.h || 0, src: srcCardId });
      }
      break;
    }
    case 'summon': {
      for (let i = 0; i < spec.count; i++) {
        if (pl.board.length >= BOARD_CAP) { events.push({ t: 'fizzle', reason: 'board-full' }); break; }
        const inst = makeInst(state, spec.token);
        pl.board.push(inst);
        events.push({ t: 'summon', p, iid: inst.iid, cardId: spec.token });
      }
      break;
    }
    case 'bounce': {
      if (target && target.kind === 'critter') {
        const tp = state.players[target.p];
        const c = findCritter(state, target.p, target.iid);
        if (c) {
          tp.board = tp.board.filter(x => x.iid !== c.iid);
          const d = cardDef(c.cardId);
          if (d.token) {
            events.push({ t: 'death', side: target.p, iid: c.iid, cardId: c.cardId }); // tokens evaporate
          } else if (tp.hand.length >= HAND_CAP) {
            events.push({ t: 'death', side: target.p, iid: c.iid, cardId: c.cardId });
            events.push({ t: 'fizzle', reason: 'hand-full-poof' });
            tp.discard.push(c.cardId); // no room — it heads for the recycle pile instead
          } else {
            tp.hand.push(c.cardId);
            events.push({ t: 'bounce', side: target.p, iid: c.iid, cardId: c.cardId });
          }
        }
      }
      break;
    }
    case 'debuffAtkAll': {
      for (const c of state.players[opp].board) {
        const before = c.atk;
        c.atk = Math.max(0, c.atk - spec.n);
        if (c.atk !== before) events.push({ t: 'debuff', side: opp, iid: c.iid, n: before - c.atk });
      }
      break;
    }
    case 'tempAtkAll': pl.flags.tempAtk += spec.n; events.push({ t: 'tempAtk', p, n: spec.n }); break;
    case 'ignoreGuard': pl.flags.ignoreGuard = true; events.push({ t: 'ignoreGuard', p }); break;
    default: throw new Error(`Unknown effect kind: ${spec.kind}`);
  }
}

// ---- act ------------------------------------------------------------------------
export function act(stateIn, action) {
  const state = structuredClone(stateIn);
  delete state.bootEvents;
  const events = [];
  if (state.over) return { state, events };
  const p = state.active, opp = 1 - p, pl = state.players[p];

  if (action.type === 'play') {
    const cardId = pl.hand[action.hand];
    if (!cardId) throw new Error('No card at hand index');
    const d = cardDef(cardId);
    if (d.cost > pl.energy) throw new Error(`Not enough energy for ${d.name}`);
    if (d.type === 'critter' && pl.board.length >= BOARD_CAP) throw new Error('Board full');
    pl.hand.splice(action.hand, 1);
    pl.energy -= d.cost;
    if (d.type === 'critter') {
      const inst = makeInst(state, cardId);
      if (d.fast) { inst.sick = false; inst.canAttack = true; }
      pl.board.push(inst);
      state.lastPlayedIid = inst.iid;
      events.push({ t: 'play', p, cardId, iid: inst.iid });
      if (d.bc) resolveEffect(state, p, d.bc, action.target || null, events, cardId);
    } else {
      events.push({ t: 'trick', p, cardId, target: action.target || null });
      pl.discard.push(cardId); // tricks recycle (discarded before resolving, so draw-tricks can even reshuffle themselves)
      resolveEffect(state, p, d.fx, action.target || null, events, cardId);
    }
    reap(state, events);
  } else if (action.type === 'attack') {
    const me = findCritter(state, p, action.iid);
    if (!me) throw new Error('Attacker not found');
    const legal = attackTargets(state, action.iid);
    const ok = legal.some(t => t.kind === action.target.kind && t.p === action.target.p && t.iid === action.target.iid);
    if (!ok) throw new Error('Illegal attack target');
    me.canAttack = false;
    const myAtk = effAtk(state, p, me);
    events.push({ t: 'attack', p, fromIid: me.iid, target: action.target });
    if (action.target.kind === 'hero') {
      damageHero(state, opp, myAtk, events);
    } else {
      const def = findCritter(state, opp, action.target.iid);
      const defAtk = effAtk(state, opp, def);
      damageCritter(state, opp, def, myAtk, events);
      if (defAtk > 0) damageCritter(state, p, me, defAtk, events);
      reap(state, events);
    }
  } else if (action.type === 'end') {
    pl.flags.tempAtk = 0;
    pl.flags.ignoreGuard = false;
    events.push({ t: 'turnEnd', p });
    state.active = opp;
    startTurn(state, events);
  } else {
    throw new Error(`Unknown action type: ${action.type}`);
  }
  return { state, events };
}

// Convenience for UI: can this hand card be played at all right now?
export function canPlay(state, handIdx) {
  const pl = state.players[state.active];
  const cardId = pl.hand[handIdx];
  if (!cardId) return false;
  const d = cardDef(cardId);
  if (d.cost > pl.energy) return false;
  if (d.type === 'critter' && pl.board.length >= BOARD_CAP) return false;
  if (d.type === 'trick' && targetRequired(d)) {
    const t = playTargets(state, handIdx);
    if (!t || !t.length) return false;
  }
  return true;
}

// Threat meter: total attack the enemy board can deliver next turn + their next energy.
export function threat(state, viewer) {
  const opp = 1 - viewer, po = state.players[opp];
  let total = 0;
  for (const c of po.board) total += effAtk(state, opp, c);
  return { incoming: total, nextEnergy: Math.min(ENERGY_CAP, po.turnsTaken + 1) };
}
