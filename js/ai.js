// Rolfe Legends — boss AI. Pure, deterministic given state. No DOM.
// chooseAction(state, persona) returns the next action for state.active, or {type:'end'}.
// Personas: {aggression 0..1, tradeCare 0..1, healAt, smart 0|1, neverLethal?, curve:'wide'|'mid'|'big'}

import { CARDS, TOKENS } from './cards.js';
import { effAtk, findCritter, attackTargets, playTargets, legalActions, BOARD_CAP } from './logic.js';

function cardDef(id) { return CARDS[id] || TOKENS[id]; }

const PRIORITY_TAGS = new Set(['sig_tory', 'maestro', 'mama_hen', 'sig_jacob']); // smart AI kills these first

export function chooseAction(state, persona) {
  if (state.over) return null;
  const p = state.active, opp = 1 - p;
  const pl = state.players[p], po = state.players[opp];

  // ---- 1. Lethal check ------------------------------------------------------
  if (!persona.neverLethal) {
    const lethal = findLethal(state, p);
    if (lethal) return lethal;
  }

  // ---- 2. Emergency heal ----------------------------------------------------
  if (persona.healAt && pl.hero.hp <= persona.healAt) {
    const heal = bestHealPlay(state, pl);
    if (heal) return heal;
  }

  // ---- 3. Play phase --------------------------------------------------------
  const play = bestPlay(state, persona);
  if (play) return play;

  // ---- 4. Attack phase ------------------------------------------------------
  const atk = bestAttack(state, persona);
  if (atk) return atk;

  return { type: 'end' };
}

// Total face damage available right now: ready attackers (if no guard wall) + direct-damage tricks.
function findLethal(state, p) {
  const opp = 1 - p, pl = state.players[p], po = state.players[opp];
  const guards = po.board.some(c => c.guard && c.hp > 0) && !pl.flags.ignoreGuard;
  let faceDmg = 0;
  if (!guards) {
    for (const c of pl.board) {
      if (c.canAttack && !c.sick) faceDmg += effAtk(state, p, c);
    }
  }
  let energy = pl.energy;
  let trickDmg = 0;
  const faceTricks = [];
  pl.hand.forEach((cardId, i) => {
    const d = cardDef(cardId);
    if (d.type !== 'trick' || !d.fx) return;
    const facey = d.fx.kind === 'damage' && (d.fx.target === 'enemy-hero' || d.fx.target === 'any-enemy');
    if (facey && d.cost <= energy) {
      energy -= d.cost; trickDmg += d.fx.n; faceTricks.push(i);
    }
  });
  if (faceDmg + trickDmg < po.hero.hp) return null;
  // Execute: tricks first (energy is use-it-or-lose-it), then attacks.
  if (faceTricks.length) {
    const i = faceTricks[0];
    const d = cardDef(state.players[p].hand[i]);
    if (d.fx.target === 'any-enemy') return { type: 'play', hand: i, target: { kind: 'hero', p: opp } };
    return { type: 'play', hand: i };
  }
  for (const c of pl.board) {
    if (c.canAttack && !c.sick && effAtk(state, p, c) > 0) {
      const ts = attackTargets(state, c.iid);
      const face = ts.find(t => t.kind === 'hero');
      if (face) return { type: 'attack', iid: c.iid, target: face };
    }
  }
  return null;
}

function bestHealPlay(state, pl) {
  let best = null, bestN = 0;
  pl.hand.forEach((cardId, i) => {
    const d = cardDef(cardId);
    const heals = (d.type === 'trick' && d.fx?.kind === 'heal') || (d.type === 'critter' && d.bc?.kind === 'heal');
    if (heals && d.cost <= pl.energy) {
      const n = (d.fx?.n || d.bc?.n || 0);
      if (n > bestN && (d.type === 'trick' || pl.board.length < BOARD_CAP)) { bestN = n; best = { type: 'play', hand: i }; }
    }
  });
  return best;
}

function bestPlay(state, persona) {
  const p = state.active, opp = 1 - p;
  const pl = state.players[p], po = state.players[opp];
  let best = null, bestScore = 1.5; // threshold: don't waste cards on nothing

  pl.hand.forEach((cardId, i) => {
    const d = cardDef(cardId);
    if (d.cost > pl.energy) return;

    if (d.type === 'critter') {
      if (pl.board.length >= BOARD_CAP) return;
      let s = d.atk + d.hp;
      if (d.guard) s += persona.tradeCare * 2;
      if (d.fast) s += persona.aggression * 2;
      if (d.bc) s += 1.5;
      if (d.aura || d.sot) s += 2;
      if (persona.curve === 'wide') s += (6 - d.cost) * 0.8;       // cheap first, flood
      else if (persona.curve === 'big') s += d.cost * 0.7;          // biggest first
      else s += d.cost * 0.3;                                       // mid: slight value lean
      // battlecry targets
      let target = null;
      if (d.bc && ['pick-ally', 'pick-ally-other'].includes(d.bc.target || '')) {
        target = bestAllyTarget(state, p, d.bc);
        if (!target && d.bc.kind === 'buff') s -= 1; // fizzling battlecry
      }
      if (s > bestScore) { bestScore = s; best = { type: 'play', hand: i, target }; }
      return;
    }

    // tricks
    const fx = d.fx;
    let s = 0, target = null;
    switch (fx.kind) {
      case 'damage': {
        if (fx.target === 'all-enemy-critters') {
          const hit = po.board.length;
          const kills = po.board.filter(c => c.hp <= fx.n).length;
          s = hit * 1.2 + kills * 2.5;
          if (persona.smart && hit < 3 && kills < 2) s = 0; // hold AoE for value
        } else if (fx.target === 'enemy-hero') {
          s = 2 + persona.aggression * 2 + (fx.draw ? 1 : 0);
        } else {
          // pick target: best enemy critter we can kill — but only if it's WORTH a card.
          // Efficiency matters: punish overkill (3 dmg on a 1hp critter) and skipping development.
          const kills = po.board.filter(c => c.hp <= fx.n);
          let kill = null, killScore = 0;
          for (const c of kills) {
            const v = 2.5 + score(state, opp, c) * 0.7 - (fx.n - c.hp) * 1.2 - (pl.board.length === 0 ? 2 : 0);
            if (v > killScore) { killScore = v; kill = c; }
          }
          const big = po.board.filter(c => effAtk(state, opp, c) >= 3)
            .sort((a, b) => effAtk(state, opp, b) - effAtk(state, opp, a))[0];
          if (kill) { s = killScore; target = { kind: 'critter', p: opp, iid: kill.iid }; }
          else if (big && fx.target === 'any-enemy') { s = 2 + persona.aggression * 3; target = { kind: 'hero', p: opp }; }
          else if (big) { s = 2; target = { kind: 'critter', p: opp, iid: big.iid }; }
        }
        break;
      }
      case 'heal': {
        const missing = pl.hero.maxHp - pl.hero.hp;
        s = missing >= fx.n ? 1 + (persona.healAt ? 1.5 : 0) + (fx.draw ? 1 : 0) : 0;
        break;
      }
      case 'draw': s = 2; break;
      case 'buff': {
        if (fx.target === 'all-allies') s = pl.board.length * 1.3;
        else {
          target = bestAllyTarget(state, p, fx);
          s = target ? 2.5 + (fx.a || 0) : 0;
        }
        break;
      }
      case 'summon': s = Math.min(fx.count, BOARD_CAP - pl.board.length) * 1.8; break;
      case 'bounce': {
        const big = [...po.board].sort((a, b) => score(state, opp, b) - score(state, opp, a))[0];
        if (big && (cardDef(big.cardId).cost >= 3 || effAtk(state, opp, big) >= 4)) {
          s = 4.5; target = { kind: 'critter', p: opp, iid: big.iid };
        }
        break;
      }
      case 'tempAtkAll': {
        const ready = pl.board.filter(c => c.canAttack && !c.sick).length;
        s = ready >= 2 ? ready * 1.5 + persona.aggression * 2 : 0;
        break;
      }
      case 'ignoreGuard': {
        const guards = po.board.filter(c => c.guard && c.hp > 0).length;
        const readyAtk = pl.board.filter(c => c.canAttack && !c.sick)
          .reduce((sum, c) => sum + effAtk(state, p, c), 0);
        // only worth it when there's real damage to sneak through
        s = guards && readyAtk >= 4 ? 4 + Math.min(readyAtk, 10) * 0.3 : 0;
        break;
      }
    }
    if (s > bestScore) { bestScore = s; best = { type: 'play', hand: i, target } }
  });
  return best;
}

function bestAllyTarget(state, p, spec) {
  const pl = state.players[p];
  const pool = pl.board.filter(c => c.hp > 0);
  if (!pool.length) return null;
  // buff the biggest attacker (most value from +atk), tank buffs to guards
  const pick = (spec.h || 0) > (spec.a || 0)
    ? pool.sort((a, b) => (b.guard ? 1 : 0) - (a.guard ? 1 : 0) || b.hp - a.hp)[0]
    : pool.sort((a, b) => b.atk - a.atk)[0];
  return { kind: 'critter', p, iid: pick.iid };
}

// rough value of an enemy critter (for kill prioritization)
function score(state, owner, inst) {
  const d = cardDef(inst.cardId);
  let s = effAtk(state, owner, inst) * 1.4 + inst.hp * 0.6;
  if (d.aura || d.sot) s += 4;
  if (PRIORITY_TAGS.has(inst.cardId)) s += 3;
  return s;
}

function bestAttack(state, persona) {
  const p = state.active, opp = 1 - p;
  const po = state.players[opp];
  for (const c of state.players[p].board) {
    if (!c.canAttack || c.sick) continue;
    const myAtk = effAtk(state, p, c);
    if (myAtk <= 0) continue;
    const ts = attackTargets(state, c.iid);
    if (!ts.length) continue;
    let bestT = null, bestV = 0.9; // skip attacks that accomplish nothing
    for (const t of ts) {
      let v;
      if (t.kind === 'hero') {
        v = 1 + persona.aggression * 3.5 + (po.hero.hp <= 10 ? 2 : 0);
        // ignoreGuard is live for one turn only — that's exactly what it's FOR
        if (state.players[p].flags.ignoreGuard && po.board.some(c => c.guard && c.hp > 0)) v += 5;
      } else {
        const def = findCritter(state, opp, t.iid);
        const defAtk = effAtk(state, opp, def);
        const kills = myAtk >= def.hp;
        const dies = defAtk >= c.hp;
        if (kills && !dies) v = 5 + score(state, opp, def) * 0.5;
        else if (kills && dies) v = score(state, opp, def) * 0.5 - (c.atk + c.hp) * 0.25 + persona.tradeCare * 2;
        else if (def.guard) v = 1.2; // chip the wall — it's the only way through
        else v = 0.3 + (persona.smart && PRIORITY_TAGS.has(def.cardId) ? 2 : 0);
        if (persona.smart && PRIORITY_TAGS.has(def.cardId) && kills) v += 3;
      }
      if (v > bestV) { bestV = v; bestT = t; }
    }
    if (bestT) return { type: 'attack', iid: c.iid, target: bestT };
  }
  return null;
}

// Run a full AI turn against the engine. Returns {state, allEvents}.
export function aiTurn(state, persona, actFn, maxSteps = 60) {
  let cur = state;
  const allEvents = [];
  for (let i = 0; i < maxSteps; i++) {
    const a = chooseAction(cur, persona) || { type: 'end' };
    const { state: next, events } = actFn(cur, a);
    allEvents.push(...events);
    cur = next;
    if (a.type === 'end' || cur.over) break;
  }
  return { state: cur, events: allEvents };
}
