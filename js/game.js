// Rolfe Legends — UI controller. All rules live in logic.js; this renders + narrates.
import {
  CARDS, TOKENS, STARTER_DECK, BOSSES, PRESETS, WYATT, COACH,
  collectionFor, presetsFor, deckBuilderUnlocked, validateDeck,
  DECK_MIN, DECK_MAX, cardCategory, CATEGORIES, deckStats,
} from './cards.js';
import {
  newGame, act, canPlay, playTargets, attackTargets, threat, effAtk, findCritter,
  ENERGY_CAP,
} from './logic.js';
import { chooseAction } from './ai.js';
import * as sfx from './sfx.js';
import * as music from './music.js';

const cardDef = (id) => CARDS[id] || TOKENS[id];

// ---------------- save ----------------
const SAVE_KEY = 'rolfeLegends.v1';
let save;
try { save = JSON.parse(localStorage.getItem(SAVE_KEY)) || null; } catch { save = null; }
if (!save || save.v !== 1) save = { v: 1, progress: 0, secrets: {}, customs: [null, null], deckId: 'starter', sound: true, music: true, crowned: false, seenTips: {} };
// migrate old single-custom saves to the two-slot model (one slot per couch-battler)
if (!save.customs) { save.customs = save.custom ? [[...save.custom], null] : [null, null]; delete save.custom; }
if (save.deckId === 'custom') save.deckId = 'custom1';
if (save.music === undefined) save.music = true;
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch { /* private mode */ } }
sfx.setEnabled(save.sound);
music.setEnabled(save.music);
// browser autoplay policy: music can only start after a user gesture.
// arm() keeps trying on every gesture until playback actually succeeds.
music.arm();

// ---------------- tiny DOM helpers ----------------
const app = document.getElementById('app');
function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}
function clear() { app.innerHTML = ''; document.querySelectorAll('.coach, .overlay').forEach(n => n.remove()); }
function toast(msg) {
  document.querySelectorAll('.toast').forEach(n => n.remove());
  document.body.appendChild(el('div', 'toast', msg));
}
function confetti(n = 60) {
  const colors = ['#e8b94e', '#b5413a', '#5a8f4f', '#8ecae6', '#f1c40f', '#fdf6e3'];
  for (let i = 0; i < n; i++) {
    const c = el('div', 'confetto');
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = colors[i % colors.length];
    c.style.animationDuration = (2.2 + Math.random() * 2.5) + 's';
    c.style.animationDelay = (Math.random() * 0.8) + 's';
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 6000);
  }
}
function floatText(x, y, txt, cls) {
  const f = el('div', `float ${cls}`, txt);
  f.style.left = (x - 14) + 'px'; f.style.top = (y - 14) + 'px';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 900);
}
function centerOf(elem) {
  if (!elem) return { x: innerWidth / 2, y: innerHeight / 2 };
  const r = elem.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

// ---------------- art (drop-in PNGs with emoji fallback) ----------------
// Legends get painted portraits (assets/cards/<id>.png, assets/ui/*.png); everything
// missing falls back to its emoji — art can land incrementally with zero code changes.
const artCache = new Map(); // path -> true|false
function artImg(path, fallbackEmoji, cls = 'art') {
  const wrap = el('div', cls);
  if (artCache.get(path) === false) { wrap.textContent = fallbackEmoji; return wrap; }
  const img = document.createElement('img');
  img.src = path; img.alt = '';
  img.onload = () => artCache.set(path, true);
  img.onerror = () => { artCache.set(path, false); img.remove(); wrap.textContent = fallbackEmoji; };
  wrap.appendChild(img);
  return wrap;
}
const cardArt = (cardId, cls = 'art') => artImg(`assets/cards/${cardId}.png`, cardDef(cardId).emoji, cls);

// ---------------- battle backgrounds (per-boss painted stage, drop-in) ----------------
// Each fight loads assets/backgrounds/bg_<id>.png behind the board. Same spirit as the card
// art above: probe the file once, cache the result, and fall back silently to the body's
// green/blue gradient when it's absent (backgrounds can land incrementally). A tunable scrim
// (style.css .battle.has-bg) keeps the board, numbers, and card text legible on top.
const bgCache = new Map(); // path -> true | false
function applyBattleBg(battleEl, bgId) {
  if (!bgId) return; // no stage for this fight → generic gradient shows through
  const path = `assets/backgrounds/bg_${bgId}.png`;
  const show = () => { battleEl.style.setProperty('--battle-bg', `url("${path}")`); battleEl.classList.add('has-bg'); };
  const cached = bgCache.get(path);
  if (cached === true) { show(); return; }   // already loaded — apply instantly, no flicker
  if (cached === false) return;              // known-missing — leave the generic gradient
  const probe = new Image();                 // unknown — test it once, like artImg does
  probe.onload = () => { bgCache.set(path, true); if (battleEl.isConnected) show(); };
  probe.onerror = () => { bgCache.set(path, false); };
  probe.src = path;
}

// ---------------- screen backgrounds + blurred letterbox backdrop ----------------
// Every screen carries its own painted art: sharp inside the centered game column (#app),
// plus a scaled-up blurred copy filling the wide-screen margins (.screen-backdrop). Setting
// both per screen means the green/blue page gradient never bleeds. Drop-in like the rest —
// a missing file just leaves the warm dark body tone (a missing CSS bg url is silently empty,
// no console error). colUrl defaults to screenUrl; pass null to leave the column to a screen
// that paints its own (the battle draws the scrimmed boss bg itself).
const bossBgUrl = (id) => `assets/backgrounds/bg_${id}.png`;
function setScreenBg(screenUrl, colUrl = screenUrl) {
  if (!document.querySelector('.screen-backdrop')) {
    document.body.insertBefore(el('div', 'screen-backdrop'), document.body.firstChild);
  }
  const root = document.documentElement.style;
  root.setProperty('--screen-bg', screenUrl ? `url("${screenUrl}")` : 'none'); // blurred margins
  root.setProperty('--col-bg', colUrl ? `url("${colUrl}")` : 'none');           // sharp column
}

// ---------------- card text (generated from data — text always matches behavior) ----------------
function fxText(spec) {
  switch (spec.kind) {
    case 'damage':
      if (spec.target === 'all-enemy-critters') return `Deal ${spec.n} to all enemy critters`;
      if (spec.target === 'enemy-hero') return `Deal ${spec.n} to the enemy hero${spec.draw ? '. Draw a card' : ''}`;
      if (spec.target === 'any-enemy') return `Deal ${spec.n} to anything`;
      return `Deal ${spec.n} to a critter`;
    case 'heal': return `Heal your hero ${spec.n}${spec.draw ? '. Draw a card' : ''}`;
    case 'draw': return spec.n === 1 ? 'Draw a card' : `Draw ${spec.n} cards`;
    case 'buff': {
      const b = `+${spec.a || 0}/+${spec.h || 0}`;
      if (spec.target === 'all-allies') return `Give your critters ${b}`;
      if (spec.target === 'other-allies') return `Your other critters get ${b}`;
      if (spec.target === 'random-ally') return `a random ally gets ${b}`;
      if (spec.target === 'pick-ally-other') return `give another ally ${b}`;
      return `Give an ally ${b}`;
    }
    case 'summon': return `Summon ${spec.count > 1 ? spec.count + ' ' : 'a '}${TOKENS[spec.token].name}${spec.count > 1 ? 's' : ''}`;
    case 'bounce': return 'Return an enemy critter to its owner\'s hand';
    case 'debuffAtkAll': return `All enemy critters get -${spec.n} Attack`;
    case 'tempAtkAll': return `Your critters get +${spec.n} Attack this turn`;
    case 'ignoreGuard': return 'Your attacks ignore Guard this turn';
    default: return '';
  }
}
function cardText(d) {
  const parts = [];
  if (d.guard) parts.push('🛡️ Guard');
  if (d.fast) parts.push('⚡ Fast');
  if (d.bc) parts.push(`When played: ${fxText(d.bc)}`);
  if (d.aura) parts.push(`Your other critters have +${d.aura.a} Attack`);
  if (d.sot) parts.push('Start of your turn: a random ally gets +1/+1');
  if (d.type === 'trick') parts.push(fxText(d.fx));
  return parts.join('. ');
}

function handCardEl(cardId, opts = {}) {
  const d = cardDef(cardId);
  const c = el('div', 'handcard' + (d.legendary ? ' legendary' : ''));
  c.appendChild(el('div', 'cost', d.cost));
  c.appendChild(cardArt(cardId));
  c.appendChild(el('div', 'cnm', d.name));
  c.appendChild(el('div', 'ctx', cardText(d) || `<i>${d.flavor}</i>`));
  if (d.type === 'critter') {
    c.appendChild(el('div', 'stats', `<span class="a">⚔️${d.atk}</span><span class="h">❤${d.hp}</span>`));
  } else {
    c.appendChild(el('div', 'stats', `<span style="margin:0 auto;font-size:10px;opacity:.7">✨ Trick</span>`));
  }
  return c;
}
function critterEl(state, p, inst) {
  const d = cardDef(inst.cardId);
  const c = el('div', 'critter');
  c.dataset.iid = inst.iid;
  const a = effAtk(state, p, inst);
  c.appendChild(cardArt(inst.cardId));
  c.appendChild(el('div', 'cnm', d.name));
  c.appendChild(el('div', 'stats',
    `<span class="a">⚔️${a}${a > inst.atk ? '✨' : ''}</span><span class="h">❤${inst.hp}</span>`));
  if (inst.guard) c.appendChild(el('div', 'badge', '🛡️'));
  else if (inst.fast && inst.canAttack) c.appendChild(el('div', 'badge', '⚡'));
  if (inst.sick) c.classList.add('sick');
  return c;
}

// ---------------- coach ----------------
function coachSay(text, sticky = false) {
  document.querySelectorAll('.coach').forEach(n => n.remove());
  const c = el('div', 'coach' + (document.querySelector('.battle') ? ' high' : ''));
  c.appendChild(artImg('assets/ui/portrait_coach.png', COACH.emoji, 'cap'));
  c.appendChild(el('div', 'say', `<span class="who">${COACH.name}</span>${text}`));
  c.onclick = () => c.remove();
  document.body.appendChild(c);
  sfx.coach();
  if (!sticky) setTimeout(() => c.remove(), 9000);
}
function tipOnce(key, text) {
  if (save.seenTips[key]) return false;
  save.seenTips[key] = true; persist();
  coachSay(text, true);
  return true; // signals "a tip was shown this turn" to the one-per-turn gate
}

// ================= SCREENS =================

// ---------------- title ----------------
function titleScreen() {
  clear();
  music.play('title');
  setScreenBg('assets/ui/title_bg.png');
  const s = el('div', 'screen title-screen');
  const sign = el('div', 'game-sign');
  sign.appendChild(el('div', 't1', 'ROLFE<br>LEGENDS'));
  sign.appendChild(el('div', 't2', '⭐ Made for Wyatt\'s 10th Birthday ⭐'));
  s.appendChild(sign);
  s.appendChild(el('div', 'title-balloon', save.crowned ? '👑 The 10th Legend of Rolfe 👑' : '9 legends came before you. Become the 10th.'));
  const btns = el('div', 'title-btns');
  const play = el('button', 'primary', save.progress === 0 ? '▶ START' : '▶ CONTINUE');
  play.onclick = () => { sfx.tap(); save.progress === 0 ? prefightScreen(0) : mapScreen(); };
  btns.appendChild(play);
  const vs = el('button', '', '🛋️ COUCH BATTLE');
  vs.onclick = () => { sfx.tap(); vsSetupScreen(); };
  btns.appendChild(vs);
  if (deckBuilderUnlocked(save.progress)) {
    const col = el('button', '', '🃏 MY CARDS');
    col.onclick = () => { sfx.tap(); builderScreen(); };
    btns.appendChild(col);
  }
  const set = el('button', 'quiet', '⚙️ Settings');
  set.onclick = () => { sfx.tap(); settingsScreen(); };
  btns.appendChild(set);
  s.appendChild(btns);
  // the llama knows things
  const llama = el('div', 'title-llama', '🦙');
  let taps = 0;
  llama.onclick = () => {
    taps++;
    sfx.tap();
    llama.style.transform = `rotate(${taps * -8}deg) scale(${1 + taps * 0.1})`;
    setTimeout(() => llama.style.transform = '', 200);
    if (taps >= 3) {
      taps = 0;
      if (!save.secrets.dogMan) {
        save.secrets.dogMan = true; persist();
        sfx.unlock(); confetti(40);
        toast('🤫 SECRET FOUND: DOG MAN joins your collection!');
      } else {
        toast('🦙 The llama stares at you approvingly.');
      }
    }
  };
  s.appendChild(llama);
  app.appendChild(s);
}

// ---------------- map ----------------
function mapScreen() {
  clear();
  music.play('title');
  setScreenBg('assets/backgrounds/bg_map.png');
  const s = el('div', 'screen');
  s.appendChild(el('h2', '', '🗺️ The Road to Legend'));
  const crown = el('div', 'map-crown' + (save.crowned ? ' earned' : ''), '👑');
  const path = el('div', 'map-path');
  BOSSES.forEach((b, i) => {
    const n = el('div', 'map-node');
    const secret = i > save.progress; // who's coming is a mystery until you reach them
    n.appendChild(secret ? el('div', 'face mystery', '❓') : artImg(`assets/cards/sig_${b.id}.png`, b.emoji, 'face'));
    const who = el('div', 'who');
    who.appendChild(el('div', 'nm', secret ? '???' : b.name));
    who.appendChild(el('div', 'tt', secret ? 'A mystery challenger…' : b.title));
    n.appendChild(who);
    if (i < save.progress) { n.classList.add('beaten'); n.appendChild(el('div', 'st', '✅')); n.onclick = () => { sfx.tap(); prefightScreen(i); }; n.style.cursor = 'pointer'; }
    else if (i === save.progress) { n.classList.add('current'); n.appendChild(el('div', 'st', '⚔️')); n.onclick = () => { sfx.tap(); prefightScreen(i); }; }
    else { n.classList.add('locked'); n.appendChild(el('div', 'st', '🔒')); }
    path.appendChild(n);
  });
  s.appendChild(crown);
  s.appendChild(path);
  const bar = el('div', 'map-bar');
  const home = el('button', 'quiet', '🏠 Title');
  home.onclick = () => { sfx.tap(); titleScreen(); };
  bar.appendChild(home);
  if (deckBuilderUnlocked(save.progress)) {
    const col = el('button', 'quiet', '🃏 My Cards');
    col.onclick = () => { sfx.tap(); builderScreen(); };
    bar.appendChild(col);
  }
  const vs = el('button', 'quiet', '🛋️ Couch Battle');
  vs.onclick = () => { sfx.tap(); vsSetupScreen(); };
  bar.appendChild(vs);
  s.appendChild(bar);
  app.appendChild(s);
}

// ---------------- deck helpers ----------------
function ownedSet() { return collectionFor(save.progress, save.secrets); }
function availableDecks() {
  const list = presetsFor(save.progress).map(id => ({ id, name: PRESETS[id].name, emoji: PRESETS[id].emoji, cards: PRESETS[id].cards }));
  save.customs.forEach((c, i) => {
    if (c) list.push({ id: 'custom' + (i + 1), name: `My Deck ${i + 1}`, emoji: i ? '📝' : '✏️', cards: c });
  });
  return list;
}
function currentDeck() {
  const d = availableDecks().find(x => x.id === save.deckId);
  return d || { id: 'starter', name: PRESETS.starter.name, emoji: '🌱', cards: STARTER_DECK };
}

// ---------------- prefight ----------------
function prefightScreen(bossIdx) {
  clear();
  const b = BOSSES[bossIdx];
  setScreenBg(bossBgUrl(b.id)); // the boss's own stage behind their intro
  const s = el('div', 'screen');
  s.appendChild(el('h2', '', `Fight ${bossIdx + 1} of ${BOSSES.length}`));
  const panel = el('div', 'panel');
  panel.appendChild(artImg(`assets/cards/sig_${b.id}.png`, b.emoji, 'big-art'));
  panel.appendChild(el('h2', '', `${b.name}`));
  panel.appendChild(el('div', '', `<i>${b.title} · ${b.hp} ❤</i>`));
  panel.appendChild(el('p', '', `<br>${b.intro}<br><br>`));
  // scout report: the boss's style vs yours — pick your counter
  const deck = currentDeck();
  const bs = deckStats(b.deck), ys = deckStats(deck.cards);
  const scout = el('div', 'scout');
  scout.innerHTML = `
    <div class="scout-title">🔎 SCOUT REPORT</div>
    <table>
      <tr><th></th><th>${b.emoji} ${b.name}</th><th>🧒 You</th></tr>
      <tr><td>💥 Punch</td><td class="strs">${stars(bs.punch)}</td><td class="strs">${stars(ys.punch)}</td></tr>
      <tr><td>🛡️ Toughness</td><td class="strs">${stars(bs.tough)}</td><td class="strs">${stars(ys.tough)}</td></tr>
      <tr><td>✨ Tricks</td><td class="strs">${stars(bs.tricks)}</td><td class="strs">${stars(ys.tricks)}</td></tr>
    </table>`;
  panel.appendChild(scout);
  const deckline = el('div', '', `Your deck: <b>${deck.emoji} ${deck.name}</b>`);
  panel.appendChild(deckline);
  if (deckBuilderUnlocked(save.progress)) {
    const change = el('button', 'quiet', 'Change deck');
    change.style.marginTop = '8px';
    change.onclick = () => { sfx.tap(); builderScreen(() => prefightScreen(bossIdx)); };
    panel.appendChild(change);
  }
  const btns = el('div', 'btns');
  const go = el('button', 'primary', '⚔️ BATTLE!');
  go.onclick = () => { sfx.tap(); startCampaignBattle(bossIdx); };
  const back = el('button', 'quiet', '← Map');
  back.onclick = () => { sfx.tap(); mapScreen(); };
  btns.appendChild(back); btns.appendChild(go);
  panel.appendChild(btns);
  s.appendChild(panel);
  app.appendChild(s);
  coachSay(b.tip, true);
}

// ================= BATTLE =================
let B = null; // battle context

function startCampaignBattle(bossIdx) {
  const boss = BOSSES[bossIdx];
  const state = newGame({
    deckA: currentDeck().cards, deckB: boss.deck,
    heroA: { name: 'Wyatt', emoji: WYATT.emoji, hp: WYATT.hp },
    heroB: { name: boss.name, emoji: boss.emoji, hp: boss.hp },
    seed: (Date.now() & 0xffffff) ^ (bossIdx << 20),
  });
  B = { mode: 'campaign', bossIdx, boss, bgId: boss.id, state, sel: null, busy: false, names: {}, log: [], pnames: ['Wyatt', boss.name] };
  music.play(boss.id === 'rocky' ? 'boss' : 'battle');
  setScreenBg(bossBgUrl(boss.id), null); // backdrop = boss stage; column drawn by .battle (scrimmed) itself
  renderBattle();
  runEvents(state.bootEvents || [], () => { playerTurnBegins(); });
}

function startVsBattle(deckA, deckB, nameA, nameB) {
  const state = newGame({
    deckA: deckA.cards, deckB: deckB.cards,
    heroA: { name: nameA, emoji: '🧒', hp: 20 },
    heroB: { name: nameB, emoji: '🧑', hp: 20 },
    seed: Date.now() & 0xffffff,
  });
  // Couch Battle: reuse Rusty's open field as a neutral stage (falls back to the warm tone if absent)
  B = { mode: 'vs', bgId: 'rusty', state, sel: null, busy: false, names: {}, log: [], pnames: [nameA, nameB], passPending: true };
  music.play('battle');
  setScreenBg(bossBgUrl('rusty'), null); // neutral stage; column drawn by .battle itself
  renderBattle();
  showPassOverlay(() => runEvents(state.bootEvents || [], () => {}));
}

const meIdx = () => (B.mode === 'vs' ? B.state.active : 0);
const foeIdx = () => 1 - meIdx();

function renderBattle() {
  clear();
  const s = el('div', 'battle');
  applyBattleBg(s, B.bgId); // per-boss painted stage; no-op → generic gradient
  const state = B.state, me = meIdx(), foe = foeIdx();
  const pm = state.players[me], pf = state.players[foe];

  // foe hero bar + their hand as backs
  const fbar = el('div', 'hero-bar foe');
  fbar.dataset.hero = foe;
  fbar.appendChild(B.mode === 'campaign'
    ? artImg(`assets/cards/sig_${B.boss.id}.png`, pf.hero.emoji, 'face')
    : el('div', 'face', pf.hero.emoji));
  const fnm = el('div', 'nm', `${pf.hero.name}${B.mode === 'campaign' ? `<span class="sub">${B.boss.title}</span>` : ''}`);
  fbar.appendChild(fnm);
  const th = threat(state, me);
  if (state.active === foe) fbar.appendChild(el('div', 'energychip', `⚡ ${pf.energy}`));
  fbar.appendChild(el('div', 'threat', `⚔️ ${th.incoming} incoming · ⚡${th.nextEnergy} next`));
  fbar.appendChild(el('div', 'hp', `❤ ${Math.max(0, pf.hero.hp)}`));
  fbar.onclick = () => onTargetTap({ kind: 'hero', p: foe });
  s.appendChild(fbar);
  // their hand: little face-down cards + a count (so it never reads as an energy bar)
  const oppHand = el('div', 'opp-hand');
  oppHand.dataset.opphand = '1';
  for (let i = 0; i < pf.hand.length; i++) oppHand.appendChild(el('div', 'back', '✦'));
  if (pf.hand.length) oppHand.appendChild(el('div', 'backcount', `🃏×${pf.hand.length}`));
  s.appendChild(oppHand);

  // foe board
  const fb = el('div', 'boardrow foe');
  for (const inst of pf.board) {
    const c = critterEl(state, foe, inst);
    c.onclick = () => onTargetTap({ kind: 'critter', p: foe, iid: inst.iid });
    fb.appendChild(c);
  }
  if (!pf.board.length) fb.appendChild(el('div', '', '<span style="opacity:.4;font-size:13px">— empty field —</span>'));
  s.appendChild(fb);

  // my board
  const mb = el('div', 'boardrow mine');
  mb.dataset.mine = '1';
  for (const inst of pm.board) {
    const c = critterEl(state, me, inst);
    if (!B.busy && state.active === me && inst.canAttack && !inst.sick && effAtk(state, me, inst) > 0 && attackTargets(state, inst.iid).length) c.classList.add('ready');
    c.onclick = () => onMyCritterTap(inst.iid);
    mb.appendChild(c);
  }
  if (!pm.board.length) mb.appendChild(el('div', '', '<span style="opacity:.4;font-size:13px">— your field —</span>'));
  s.appendChild(mb);

  // midbar: energy + end turn
  const mid = el('div', 'midbar');
  const en = el('div', 'energy');
  for (let i = 1; i <= ENERGY_CAP; i++) en.appendChild(el('span', 'pip' + (i <= pm.energy ? ' on' : ''), '⚡'));
  en.appendChild(el('span', '', ` <b>${pm.energy}</b>`));
  mid.appendChild(en);
  mid.appendChild(el('div', 'turnlabel', state.active === me ? 'Your turn' : `${pf.hero.name} is thinking…`));
  const end = el('button', 'endturn', 'END TURN ➤');
  end.disabled = B.busy || state.active !== me;
  end.onclick = () => { sfx.tap(); doAction({ type: 'end' }); };
  mid.appendChild(end);
  s.appendChild(mid);

  // my hero bar
  const mbar = el('div', 'hero-bar me');
  mbar.dataset.hero = me;
  mbar.appendChild(B.mode === 'campaign'
    ? artImg('assets/ui/portrait_wyatt.png', pm.hero.emoji, 'face')
    : el('div', 'face', pm.hero.emoji));
  mbar.appendChild(el('div', 'nm', pm.hero.name));
  mbar.appendChild(el('div', 'hp', `❤ ${Math.max(0, pm.hero.hp)}`));
  s.appendChild(mbar);

  // hand (hidden in VS mode while waiting for the device pass — no peeking)
  const hand = el('div', 'hand');
  if (B.hideHand) {
    for (let i = 0; i < pm.hand.length; i++) {
      const back = el('div', 'handcard', '<div class="art" style="margin:auto;font-size:38px">🂠</div>');
      back.style.background = 'var(--barn)';
      hand.appendChild(back);
    }
  } else {
    pm.hand.forEach((cardId, i) => {
      const c = handCardEl(cardId);
      const playable = !B.busy && state.active === me && canPlay(state, i);
      if (!playable) c.classList.add('unplayable');
      c.onclick = () => onHandTap(i);
      c.dataset.hand = i;
      hand.appendChild(c);
    });
  }
  if (!pm.hand.length) hand.appendChild(el('div', '', '<span style="opacity:.4;font-size:13px">— no cards —</span>'));
  s.appendChild(hand);

  // quit + battle log buttons (small, top corners)
  const quit = el('button', 'quiet', '✕');
  quit.style.cssText = 'position:absolute;top:8px;left:8px;padding:4px 10px;font-size:13px;z-index:10;';
  quit.onclick = () => {
    sfx.tap();
    confirmPanel('Leave this battle?', () => { B = null; save.progress === 0 ? titleScreen() : mapScreen(); });
  };
  app.appendChild(quit);
  const logBtn = el('button', 'quiet', '📜');
  logBtn.style.cssText = 'position:absolute;top:8px;left:52px;padding:4px 10px;font-size:13px;z-index:10;';
  logBtn.onclick = () => { sfx.tap(); showLogOverlay(); };
  app.appendChild(logBtn);
  app.appendChild(s);
  applySelectionHighlights();
}

// ---------- selection / input ----------
function onHandTap(i) {
  if (B.busy || B.state.active !== meIdx()) return;
  const state = B.state, me = meIdx();
  const cardId = state.players[me].hand[i];
  if (!canPlay(state, i)) {
    const d = cardDef(cardId);
    if (d.cost > state.players[me].energy) toast(`Not enough ⚡ for ${d.name} (needs ${d.cost})`);
    else if (d.type === 'critter') toast('Your field is full! (max 4)');
    else toast('No target for that right now.');
    return;
  }
  sfx.tap();
  if (B.sel && B.sel.kind === 'hand' && B.sel.idx === i) {
    // second tap on same card: play if untargeted, cancel if targeted
    const targets = playTargets(state, i);
    const d = cardDef(cardId);
    const needsPick = targets && targets.length > 0;
    if (!needsPick) { B.sel = null; doAction({ type: 'play', hand: i }); }
    else if (d.type === 'critter') { B.sel = null; doAction({ type: 'play', hand: i }); } // battlecry skipped if you tap twice — only when no targets... keep: critters with targets require pick or play plain? simplest: play plain.
    else { B.sel = null; applySelectionHighlights(); }
    return;
  }
  B.sel = { kind: 'hand', idx: i };
  applySelectionHighlights();
}

function onMyCritterTap(iid) {
  if (B.busy || B.state.active !== meIdx()) return;
  const state = B.state, me = meIdx();
  // if a hand card with ally-targeting is selected, allies are targets
  if (B.sel && B.sel.kind === 'hand') {
    const targets = playTargets(state, B.sel.idx) || [];
    const t = targets.find(t => t.kind === 'critter' && t.p === me && t.iid === iid);
    if (t) { const idx = B.sel.idx; B.sel = null; sfx.tap(); doAction({ type: 'play', hand: idx, target: t }); return; }
  }
  const inst = findCritter(state, me, iid);
  if (!inst) return;
  if (B.sel && B.sel.kind === 'critter' && B.sel.iid === iid) { B.sel = null; applySelectionHighlights(); sfx.tap(); return; }
  if (inst.sick) { toast('💤 Just arrived — ready next turn!'); return; }
  if (!inst.canAttack) { toast('Already attacked this turn.'); return; }
  if (effAtk(state, me, inst) <= 0) { toast('0 attack — it can\'t fight (yet).'); return; }
  if (!attackTargets(state, iid).length) return;
  sfx.tap();
  B.sel = { kind: 'critter', iid };
  applySelectionHighlights();
}

function onTargetTap(target) {
  if (B.busy || !B.sel || B.state.active !== meIdx()) return;
  const state = B.state;
  if (B.sel.kind === 'hand') {
    const targets = playTargets(state, B.sel.idx) || [];
    const ok = targets.find(t => t.kind === target.kind && t.p === target.p && t.iid === target.iid);
    if (ok) { const idx = B.sel.idx; B.sel = null; sfx.tap(); doAction({ type: 'play', hand: idx, target: ok }); }
    return;
  }
  if (B.sel.kind === 'critter') {
    const ts = attackTargets(state, B.sel.iid);
    const ok = ts.find(t => t.kind === target.kind && t.p === target.p && t.iid === target.iid);
    if (ok) { const iid = B.sel.iid; B.sel = null; sfx.tap(); doAction({ type: 'attack', iid, target: ok }); return; }
    // blocked by a Guard wall? say so — this is THE confusing moment for new players
    const foe = foeIdx();
    if (target.p === foe && state.players[foe].board.some(c => c.guard && c.hp > 0) && !state.players[meIdx()].flags.ignoreGuard) {
      toast('🛡️ A Guard is in the way — you must attack the 🛡️ critter first!');
    }
    return;
  }
}

function applySelectionHighlights() {
  const state = B.state, me = meIdx(), foe = foeIdx();
  document.querySelectorAll('.handcard.selected, .critter.selected, .critter.targetable, .hero-bar.targetable, .boardrow.playable-zone')
    .forEach(n => n.classList.remove('selected', 'targetable', 'playable-zone'));
  if (!B.sel) return;
  if (B.sel.kind === 'hand') {
    const cardEl = document.querySelector(`.handcard[data-hand="${B.sel.idx}"]`);
    if (cardEl) cardEl.classList.add('selected');
    const targets = playTargets(state, B.sel.idx);
    if (targets && targets.length) {
      for (const t of targets) {
        if (t.kind === 'hero') document.querySelector(`.hero-bar[data-hero="${t.p}"]`)?.classList.add('targetable');
        else document.querySelector(`.critter[data-iid="${t.iid}"]`)?.classList.add('targetable');
      }
      coachHint('hint_target', 'Now tap a glowing target! (or tap the card again to cancel)');
    } else {
      document.querySelector('.boardrow.mine')?.classList.add('playable-zone');
      coachHint('hint_play', 'Tap the card again to play it!');
    }
  } else if (B.sel.kind === 'critter') {
    document.querySelector(`.critter[data-iid="${B.sel.iid}"]`)?.classList.add('selected');
    for (const t of attackTargets(state, B.sel.iid)) {
      if (t.kind === 'hero') document.querySelector(`.hero-bar[data-hero="${t.p}"]`)?.classList.add('targetable');
      else document.querySelector(`.critter[data-iid="${t.iid}"]`)?.classList.add('targetable');
    }
  }
}
let hintTimer = null;
function coachHint(key, text) {
  // light inline hint — once each, only during the first two campaign fights
  if (B.mode !== 'campaign' || B.bossIdx > 1 || save.seenTips[key]) return;
  save.seenTips[key] = true; persist();
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => coachSay(text, true), 220);
}

// ---------- actions & event animation ----------
function doAction(action) {
  if (B.busy) return;
  B.busy = true;
  B.sel = null;
  // VS: hide the incoming player's hand the moment the turn flips — no peeking during animations
  if (B.mode === 'vs' && action.type === 'end') B.hideHand = true;
  let res;
  try { res = act(B.state, action); }
  catch (e) { console.error(e); B.busy = false; return; }
  B.state = res.state;
  if (action.type !== 'attack') renderBattle(); // attacks animate against the pre-action DOM
  runEvents(res.events, () => {
    if (B.state.over) return endOfBattle();
    if (B.mode === 'campaign') {
      if (B.state.active === 1) aiLoop();
      else { B.busy = false; renderBattle(); playerTurnBegins(); }
    } else {
      // vs: if turn just ended, pass the device
      if (action.type === 'end') { B.busy = false; renderBattle(); showPassOverlay(() => {}); }
      else { B.busy = false; renderBattle(); }
    }
  });
}

function aiLoop() {
  B.busy = true;
  const persona = B.boss.persona;
  setTimeout(() => {
    const a = chooseAction(B.state, persona) || { type: 'end' };
    let res;
    try { res = act(B.state, a); }
    catch (e) { console.error(e); res = act(B.state, { type: 'end' }); }
    B.state = res.state;
    if (a.type !== 'attack') renderBattle(); // attacks animate against the pre-action DOM (lunge needs the attacker alive)
    runEvents(res.events, () => {
      if (B.state.over) return endOfBattle();
      if (a.type === 'end' || B.state.active === 0) { B.busy = false; renderBattle(); playerTurnBegins(); }
      else aiLoop();
    });
  }, 650);
}

function playerTurnBegins() {
  if (B.mode !== 'campaign') return;
  const state = B.state, pl = state.players[0];
  // One tutorial tip per turn, in priority order — coachSay replaces the previous
  // bubble, so firing several in one turn means only the last is ever seen. Gate to
  // the first unseen one so each tip actually gets read (and isn't marked seen unshown).
  let shown = false;
  const once = (key, text) => { if (!shown) shown = tipOnce(key, text); };

  if (B.bossIdx === 0) {
    if (pl.turnsTaken === 1) once('t_play', 'Tap a card, then tap it again to put your critter on the field. New critters are 💤 <b>sleepy</b> the turn you play them — they wake up and can attack on your NEXT turn!');
    // only fire the attack tip once there's a genuinely awake attacker — never call a sleeping critter "ready"
    const hasReady = pl.board.some(c => c.canAttack && !c.sick && effAtk(state, 0, c) > 0 && attackTargets(state, c.iid).length);
    if (hasReady) once('t_attack', 'Your critter woke up! ⚔️ <b>Tap it</b>, then <b>tap Rusty</b> to attack. Knock him to 0 ❤ to win!');
    if (pl.turnsTaken >= 3) once('t_threat', 'See "⚔️ incoming" up top? That\'s how hard Rusty can hit you next turn. Always check it before ending your turn!');
  }
  if (B.bossIdx === 1 && pl.hand.includes('ddg')) once('t_aoe', '<b>Duck, Duck, GOOSE!</b> hits ALL of Aaron\'s critters at once. Best when his field is crowded!');
  // first time a Guard is in play (either side), explain it
  if (state.players.some(p2 => p2.board.some(c => c.guard)) || pl.hand.some(c => cardDef(c).guard)) {
    once('t_guard', '🛡️ <b>Guard</b> critters protect their whole team — enemies MUST attack them first. Put one in front of your squishy friends!');
  }
  if (pl.hand.some(c => cardDef(c).type === 'trick') && B.bossIdx <= 1) once('t_trick', '✨ <b>Tricks</b> are one-time magic — play one and it happens right away!');
}

const DUCKY = /duck|quack|goose|ddg/;
// Big card preview when the AI plays something — stays up until tapped, so a
// not-super-fast reader can actually read it. The game waits.
function showCardPreview(cardId, onDone) {
  const wrap = el('div', 'showcard blocking');
  wrap.appendChild(handCardEl(cardId));
  wrap.appendChild(el('div', 'tapnote', '👆 tap to continue'));
  let doneCalled = false;
  const finish = () => { if (doneCalled) return; doneCalled = true; wrap.remove(); onDone(); };
  wrap.onclick = finish;
  document.body.appendChild(wrap);
  if (location.hash === '#autoplay') setTimeout(finish, 500); // attract mode has no reader
}
const foePlayed = (e) => B.mode === 'campaign' && e.p === 1;

// ---------- battle log ----------
const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
function logLine(txt) {
  if (!B) return;
  B.log.unshift(txt);
  if (B.log.length > 120) B.log.pop();
}
function heroName(p) { return B.state.players[p].hero.name; }
function cName(iid) { return (B.names && B.names[iid]) || 'a critter'; }
function narrate(e) {
  if (!B) return;
  switch (e.t) {
    case 'turnStart': logLine(`— ${heroName(e.p)}'s turn ${e.turnNo} · ⚡${e.energy} —`); break;
    case 'draw': logLine(`🃏 ${heroName(e.p)} drew a card`); break;
    case 'play': B.names[e.iid] = cardDef(e.cardId).name; logLine(`${cardDef(e.cardId).emoji} ${heroName(e.p)} played ${cardDef(e.cardId).name}`); break;
    case 'summon': B.names[e.iid] = cardDef(e.cardId).name; logLine(`${cardDef(e.cardId).emoji} ${cName(e.iid)} joined ${heroName(e.p)}'s side`); break;
    case 'trick': {
      const tgt = e.target ? (e.target.kind === 'hero' ? heroName(e.target.p) : cName(e.target.iid)) : '';
      logLine(`✨ ${heroName(e.p)} used ${cardDef(e.cardId).name}${tgt ? ' on ' + tgt : ''}`);
      break;
    }
    case 'attack': {
      const tgt = e.target.kind === 'hero' ? heroName(e.target.p) : cName(e.target.iid);
      logLine(`⚔️ ${cName(e.fromIid)} attacked ${tgt}`);
      break;
    }
    case 'dmg': logLine(`💥 ${e.n} damage to ${e.iid == null ? heroName(e.side) : cName(e.iid)} (${Math.max(0, e.hp)} ❤ left)`); break;
    case 'death': logLine(`💀 ${cName(e.iid)} is out!`); break;
    case 'heal': if (e.n > 0) logLine(`💚 ${heroName(e.side)} healed ${e.n} (${e.hp} ❤)`); break;
    case 'buff': logLine(`💪 ${cName(e.iid)} got +${e.a}/+${e.h}`); break;
    case 'debuff': logLine(`😵 ${cName(e.iid)} lost ${e.n} Attack`); break;
    case 'bounce': logLine(`🎩 ${cName(e.iid)} got sent back to ${heroName(e.side)}'s hand`); break;
    case 'recycle': logLine(`♻️ ${heroName(e.p)}'s deck reshuffled (${e.count} cards back)`); break;
    case 'bedtime': logLine(`🌙 Past bedtime! ${e.n} damage to ${heroName(e.p)}`); break;
    case 'handFull': logLine(`✋ ${heroName(e.p)}'s hand is full — draw skipped`); break;
    case 'tempAtk': logLine(`📣 ${heroName(e.p)}'s critters get +${e.n} Attack this turn`); break;
    case 'ignoreGuard': logLine(`🥎 ${heroName(e.p)}'s attacks ignore Guard this turn`); break;
    case 'win': logLine(`🏆 ${heroName(e.p)} WINS!`); break;
  }
}
function showLogOverlay() {
  const ov = el('div', 'overlay');
  const p = el('div', 'panel logpanel');
  p.appendChild(el('h2', '', '📜 Battle Log'));
  const list = el('div', 'loglist');
  if (!B.log.length) list.appendChild(el('div', 'logline', '<i>Nothing has happened yet!</i>'));
  for (const line of B.log) list.appendChild(el('div', 'logline', line));
  p.appendChild(list);
  const btn = el('button', 'primary', 'Back to battle');
  btn.onclick = () => { sfx.tap(); ov.remove(); };
  p.appendChild(btn);
  ov.appendChild(p);
  ov.onclick = (ev) => { if (ev.target === ov) ov.remove(); };
  document.body.appendChild(ov);
}

function runEvents(events, done) {
  if (!events || !events.length) { done(); return; }
  const [e, ...rest] = events;
  narrate(e);
  const next = (ms) => setTimeout(() => runEvents(rest, done), ms);
  switch (e.t) {
    case 'turnStart': { sfx.energy(); renderBattle(); next(380); break; }
    case 'play': {
      DUCKY.test(e.cardId) ? sfx.quack() : sfx.play();
      renderBattle();
      if (foePlayed(e)) showCardPreview(e.cardId, () => runEvents(rest, done)); // waits for the reader
      else next(300);
      break;
    }
    case 'trick': {
      DUCKY.test(e.cardId) ? sfx.quack() : sfx.trick();
      const d = cardDef(e.cardId);
      // ring the trick's target so you can see who it's aimed at
      if (e.target && e.target.kind === 'critter') document.querySelector(`.critter[data-iid="${e.target.iid}"]`)?.classList.add('aim');
      if (e.target && e.target.kind === 'hero') document.querySelector(`.hero-bar[data-hero="${e.target.p}"]`)?.classList.add('aim');
      if (foePlayed(e)) showCardPreview(e.cardId, () => runEvents(rest, done)); // waits for the reader
      else { toast(`${d.emoji} ${d.name}!`); next(480); }
      break;
    }
    case 'summon': { sfx.play(); renderBattle(); next(220); break; }
    case 'attack': {
      const elFrom = document.querySelector(`.critter[data-iid="${e.fromIid}"]`);
      const elTo = e.target.kind === 'hero'
        ? document.querySelector(`.hero-bar[data-hero="${e.target.p}"]`)
        : document.querySelector(`.critter[data-iid="${e.target.iid}"]`);
      const telegraph = foePlayed(e) ? 420 : 90; // AI attacks announce themselves first
      elFrom?.classList.add('aim-from');
      elTo?.classList.add('aim');
      setTimeout(() => {
        // lunge: slide the attacker most of the way to its target
        if (elFrom && elTo) {
          const a = centerOf(elFrom), b = centerOf(elTo);
          elFrom.style.transition = 'transform .18s ease-in';
          elFrom.style.transform = `translate(${(b.x - a.x) * 0.6}px, ${(b.y - a.y) * 0.6}px) scale(1.12)`;
          elFrom.style.zIndex = 20;
          setTimeout(() => {
            elFrom.style.transition = 'transform .22s ease-out';
            elFrom.style.transform = '';
          }, 200);
        }
      }, telegraph);
      next(telegraph + 260); break;
    }
    case 'dmg': {
      const target = e.iid == null
        ? document.querySelector(`.hero-bar[data-hero="${e.side}"]`)
        : document.querySelector(`.critter[data-iid="${e.iid}"]`);
      const { x, y } = centerOf(target);
      floatText(x, y, `-${e.n}`, 'dmg');
      target?.classList.add('hurt');
      // update the HP number in place (full re-render would cancel the shake)
      const hpEl = target?.querySelector(e.iid == null ? '.hp' : '.stats .h');
      if (hpEl) hpEl.innerHTML = e.iid == null ? `❤ ${Math.max(0, e.hp)}` : `❤${e.hp}`;
      sfx.hit(e.n);
      next(330); break;
    }
    case 'recycle': {
      toast(`♻️ ${B.state.players[e.p].hero.name}'s deck reshuffled — ${e.count} cards back!`);
      sfx.unlock();
      next(520); break;
    }
    case 'death': {
      sfx.death();
      const t = document.querySelector(`.critter[data-iid="${e.iid}"]`);
      if (t) { t.style.transition = 'all .25s'; t.style.transform = 'scale(0)'; t.style.opacity = '0'; }
      setTimeout(() => { renderBattle(); runEvents(rest, done); }, 300); // re-render clears the corpse
      break;
    }
    case 'heal': { const t = document.querySelector(`.hero-bar[data-hero="${e.side}"]`); const { x, y } = centerOf(t); if (e.n > 0) floatText(x, y, `+${e.n}`, 'healtxt'); sfx.heal(); renderBattle(); next(300); break; }
    case 'buff': { const t = document.querySelector(`.critter[data-iid="${e.iid}"]`); t?.classList.add('buffed'); sfx.energy(); renderBattle(); next(240); break; }
    case 'debuff': { const t = document.querySelector(`.critter[data-iid="${e.iid}"]`); const { x, y } = centerOf(t); floatText(x, y, `-${e.n}⚔️`, 'dmg'); renderBattle(); next(240); break; }
    case 'bounce': { sfx.trick(); renderBattle(); next(260); break; }
    case 'draw': {
      if (e.p === meIdx()) sfx.draw();
      else { const oh = document.querySelector('.opp-hand'); if (oh) { const { x, y } = centerOf(oh); floatText(x, y, '+🃏', 'healtxt'); } }
      renderBattle(); next(e.p === meIdx() ? 110 : 240); break;
    }
    case 'handFull': { if (e.p === meIdx()) toast('✋ Hand full — draw skipped!'); next(220); break; }
    case 'deckEmpty': { next(60); break; }
    case 'bedtime': { toast(`🌙 Past bedtime! ${e.n} damage to ${B.state.players[e.p].hero.name}`); next(420); break; }
    case 'tempAtk': { renderBattle(); next(200); break; }
    case 'ignoreGuard': { toast('🥎 NUTMEG! Guards can\'t stop you this turn!'); next(380); break; }
    case 'fizzle': { if (e.reason === 'board-full') toast('No room on the field!'); next(200); break; }
    case 'win': { next(200); break; }
    default: next(40);
  }
}

// ---------- end of battle ----------
function endOfBattle() {
  B.busy = true;
  const won = B.mode === 'campaign' ? B.state.winner === 0 : true;
  if (B.mode === 'vs') {
    sfx.win(); confetti(50);
    const winnerName = B.pnames[B.state.winner];
    panelScreen(`🏆 ${winnerName} WINS!`, '🎉', `What a battle!`, [
      ['⚔️ Rematch', () => vsSetupScreen()],
      ['🏠 Home', () => titleScreen()],
    ]);
    return;
  }
  if (!won) {
    sfx.lose();
    const b = B.boss;
    panelScreen(`${b.name} wins this one…`, '😮', `<i>"${b.lossTip}"</i><br><span style="font-size:12px;opacity:.7">— Coach James</span>`, [
      ['🔁 REMATCH!', () => startCampaignBattle(B.bossIdx)],
      ['← Map', () => (save.progress === 0 ? titleScreen() : mapScreen())],
    ]);
    return;
  }
  // victory!
  sfx.win(); confetti(70);
  const bossIdx = B.bossIdx, b = B.boss;
  const firstWin = bossIdx === save.progress;
  if (firstWin) {
    save.progress = bossIdx + 1;
    persist();
    revealRewards(b, 0, () => afterVictory(bossIdx));
  } else {
    panelScreen(`You beat ${b.name} again!`, '💪', 'Just showing off now.', [
      ['← Map', () => mapScreen()],
    ]);
  }
}

function revealRewards(boss, i, done) {
  if (i >= boss.reward.length) {
    // non-card unlocks
    const u = boss.unlocks;
    if (u && u.deckBuilder) {
      panelScreen('🃏 DECK BUILDER UNLOCKED!', '🛠️', 'You can now build your own deck from your collection. Coach left you a preset to try, too!', [['Sweet!', done]]);
      return;
    }
    if (u && u.presets && u.presets.length) {
      const names = u.presets.map(p => `${PRESETS[p].emoji} ${PRESETS[p].name}`).join(' & ');
      panelScreen('✨ NEW COACH\'S PICKS!', '📋', `New preset deck${u.presets.length > 1 ? 's' : ''}: <b>${names}</b>`, [['Nice!', done]]);
      return;
    }
    done();
    return;
  }
  const cardId = boss.reward[i];
  const d = cardDef(cardId);
  sfx.unlock();
  const ov = el('div', 'overlay');
  const p = el('div', 'panel');
  p.appendChild(el('h2', '', i === 0 ? '🎁 NEW CARD WON!' : '🎁 BONUS CARD!'));
  const rc = el('div', 'reveal-card');
  rc.appendChild(cardArt(cardId));
  rc.appendChild(el('div', 'cnm', d.name));
  rc.appendChild(el('div', 'ctx', cardText(d)));
  rc.appendChild(el('div', 'ctx', `<i>${d.flavor}</i>`));
  if (d.type === 'critter') rc.appendChild(el('div', 'stats', `<span class="a">⚔️${d.atk}</span><span style="font-size:11px;opacity:.6">${d.cost}⚡</span><span class="h">❤${d.hp}</span>`));
  p.appendChild(rc);
  const btn = el('button', 'primary', boss.reward.length - 1 === i ? 'Awesome!' : 'Next ➤');
  btn.onclick = () => { sfx.tap(); ov.remove(); revealRewards(boss, i + 1, done); };
  p.appendChild(btn);
  ov.appendChild(p);
  document.body.appendChild(ov);
}

function afterVictory(bossIdx) {
  if (bossIdx === BOSSES.length - 1) {
    // THE CROWN
    save.crowned = true; persist();
    sfx.fanfare(); confetti(140);
    music.play('anthem'); // Wyatt's birthday song over the crown
    const ov = el('div', 'overlay');
    const p = el('div', 'panel');
    p.appendChild(el('div', 'big-emoji', '👑'));
    p.appendChild(el('h2', '', 'WYATT'));
    p.appendChild(el('h2', '', 'THE 10TH LEGEND OF ROLFE'));
    p.appendChild(el('p', '', `<br>Rusty. Aaron. Dad. Mom. Uncle Brody. Aunt Chelsea. Grampa Flaj. Grandma Rockie. Coach James.<br><br><b>Nine legends came before you — and on your 10th birthday, you beat them all.</b><br><br>🎂 Happy 10th Birthday, Wyatt.<br>Love, Uncle James ❤️`));
    p.appendChild(el('div', 'golden-back-note', '✨ Golden card back · 🃏 EVERY card from EVERY deck is now in your Deck Builder · 🛋️ boss decks playable in Couch Battle'));
    const btn = el('button', 'primary', '👑');
    btn.onclick = () => {
      ov.remove();
      coachSay('Psst — champions hear rumors. They say the <b>llama on the title screen</b> keeps a secret. Maybe… pet it three times? 🦙', true);
      mapScreen();
    };
    p.appendChild(btn);
    ov.appendChild(p);
    document.body.appendChild(ov);
    return;
  }
  mapScreen();
}

function panelScreen(title, emoji, body, buttons) {
  document.querySelectorAll('.overlay').forEach(n => n.remove());
  const ov = el('div', 'overlay');
  const p = el('div', 'panel');
  p.appendChild(el('div', 'big-emoji', emoji));
  p.appendChild(el('h2', '', title));
  p.appendChild(el('p', '', body));
  const btns = el('div', 'btns');
  for (const [label, fn] of buttons) {
    const b = el('button', label.includes('REMATCH') || label.includes('BATTLE') ? 'primary' : '', label);
    b.onclick = () => { sfx.tap(); ov.remove(); fn(); };
    btns.appendChild(b);
  }
  p.appendChild(btns);
  ov.appendChild(p);
  document.body.appendChild(ov);
}

function confirmPanel(q, yes) {
  panelScreen(q, '🤔', '', [['Yes', yes], ['No', () => {}]]);
}

function showPassOverlay(then) {
  const name = B.pnames[B.state.active];
  const ov = el('div', 'overlay');
  const p = el('div', 'panel');
  p.appendChild(el('div', 'big-emoji', '🤝'));
  p.appendChild(el('h2', '', `Pass to ${name}!`));
  p.appendChild(el('p', '', 'No peeking at each other\'s cards. 👀'));
  const btn = el('button', 'primary', `I'm ${name} — GO!`);
  btn.onclick = () => { sfx.tap(); ov.remove(); B.hideHand = false; B.busy = false; renderBattle(); then(); };
  p.appendChild(btn);
  ov.appendChild(p);
  document.body.appendChild(ov);
}

// ---------------- deck builder ----------------
function builderScreen(onDone) {
  clear();
  music.play('deckbuild');
  setScreenBg('assets/backgrounds/bg_cards.png');
  const owned = ownedSet();
  const s = el('div', 'screen');
  const w = el('div', 'builder');
  w.appendChild(el('h2', '', '🃏 Your Cards'));

  // preset row
  const pr = el('div', 'presetrow');
  for (const dk of availableDecks()) {
    const pe = el('div', 'preset' + (save.deckId === dk.id ? ' active' : ''));
    pe.appendChild(el('div', 'pe', dk.emoji));
    pe.appendChild(el('div', 'pn', dk.name));
    const ps = deckStats(dk.cards);
    pe.appendChild(el('div', 'pstats', `💥${ps.punch} 🛡️${ps.tough} ✨${ps.tricks}`));
    pe.onclick = () => {
      sfx.tap();
      save.deckId = dk.id; persist();
      working = [...dk.cards];
      render();
      toast(`Using: ${dk.name}` + (PRESETS[dk.id] ? ` — "${PRESETS[dk.id].blurb}"` : ''));
    };
    pr.appendChild(pe);
  }
  w.appendChild(pr);

  let working = [...currentDeck().cards];
  const meta = el('div', 'deckmeta');
  const grid = el('div', 'shelves');
  w.appendChild(meta);
  w.appendChild(grid);

  function render() {
    // meta: count + live scorecard + buttons
    meta.innerHTML = '';
    const okSize = working.length >= DECK_MIN && working.length <= DECK_MAX;
    meta.appendChild(el('div', '', `<b style="${okSize ? '' : 'color:var(--bad)'}">${working.length}</b> cards <span style="opacity:.6;font-size:13px">(${DECK_MIN}–${DECK_MAX})</span>`));
    const st = deckStats(working);
    meta.appendChild(el('div', 'statrow',
      `💥<span class="strs">${stars(st.punch)}</span> 🛡️<span class="strs">${stars(st.tough)}</span> ✨<span class="strs">${stars(st.tricks)}</span>`));
    const saveSlot = (i) => {
      save.customs[i] = [...working];
      save.deckId = 'custom' + (i + 1);
      persist(); sfx.unlock();
      toast(`✅ Saved to My Deck ${i + 1}!`);
      if (onDone) onDone(); else mapScreen();
    };
    const useBtn = el('button', 'primary', '✔ SAVE & USE');
    useBtn.onclick = () => {
      const err = validateDeck(working, owned);
      if (err) { toast('🚫 ' + err); return; }
      // if it matches a preset exactly, just use that
      const match = availableDecks().find(d => !d.id.startsWith('custom') && JSON.stringify([...d.cards].sort()) === JSON.stringify([...working].sort()));
      if (match) { save.deckId = match.id; persist(); sfx.unlock(); toast(`✅ Using ${match.name}!`); if (onDone) onDone(); else mapScreen(); return; }
      // two slots — one each for couch battlers
      panelScreen('Save your deck', '💾', 'Two slots, so two people can each keep a custom deck for Couch Battle!', [
        [`✏️ My Deck 1${save.customs[0] ? ' (replace)' : ''}`, () => saveSlot(0)],
        [`📝 My Deck 2${save.customs[1] ? ' (replace)' : ''}`, () => saveSlot(1)],
        ['Cancel', () => {}],
      ]);
    };
    meta.appendChild(useBtn);
    const back = el('button', 'quiet', '← Back');
    back.onclick = () => { sfx.tap(); if (onDone) onDone(); else mapScreen(); };
    meta.appendChild(back);

    // grid: organized into shelves — Attackers / Defenders / Tricks / Legends
    grid.innerHTML = '';
    const ownedIds = Object.keys(CARDS).filter(id => owned.has(id));
    for (const cat of CATEGORIES) {
      const ids = ownedIds.filter(id => cardCategory(id) === cat.id);
      if (!ids.length) continue;
      ids.sort((a, b) => CARDS[a].cost - CARDS[b].cost || CARDS[a].name.localeCompare(CARDS[b].name));
      grid.appendChild(el('div', 'cathead', `${cat.emoji} ${cat.name}`));
      const row = el('div', 'cardgrid');
      for (const id of ids) {
        const d = CARDS[id];
        const c = handCardEl(id);
        const n = working.filter(x => x === id).length;
        const cap = d.legendary ? 1 : 2;
        if (n > 0) { c.classList.add('indeck'); c.appendChild(el('div', 'count', `×${n}`)); }
        c.onclick = () => {
          sfx.tap();
          if (n >= cap) { working = working.filter(x => x !== id); }           // cycle back to 0
          else if (working.length >= DECK_MAX) { toast(`That's the max (${DECK_MAX}) — tap a card with a ×number to remove it.`); return; }
          else { working.push(id); }
          render();
        };
        row.appendChild(c);
      }
      grid.appendChild(row);
    }
  }
  render();
  s.appendChild(w);
  app.appendChild(s);
  if (!save.seenTips.t_builder) tipOnce('t_builder', 'Tap a card to add it (tap again for a 2nd copy — then once more to remove). <b>12 to 24 cards</b> — small decks are reliable, big decks are full of surprises. Watch your 💥🛡️✨ stars change as you build!');
}

// ---------------- VS setup ----------------
function vsSetupScreen() {
  clear();
  setScreenBg('assets/backgrounds/bg_map.png');
  const s = el('div', 'screen');
  s.appendChild(el('h2', '', '🛋️ Couch Battle'));
  s.appendChild(el('p', '', 'Two players, one screen. Pass and play!'));
  const decks = [...availableDecks()];
  // beaten bosses' decks become playable
  BOSSES.slice(0, save.progress).forEach(b => decks.push({ id: 'boss_' + b.id, name: `${b.name}'s Deck`, emoji: b.emoji, cards: b.deck }));

  const wrap = el('div', 'vs-pick');
  const mkSide = (label, defName) => {
    const side = el('div', 'side');
    side.appendChild(el('b', '', label));
    const nm = el('input'); nm.value = defName; nm.maxLength = 12;
    const sel = el('select');
    decks.forEach((d, i) => {
      const ds = deckStats(d.cards);
      const o = el('option', '', `${d.emoji} ${d.name}  (💥${ds.punch} 🛡️${ds.tough} ✨${ds.tricks})`);
      o.value = i; sel.appendChild(o);
    });
    side.appendChild(nm); side.appendChild(sel);
    wrap.appendChild(side);
    return { nm, sel };
  };
  const p1 = mkSide('Player 1', 'Wyatt');
  const p2 = mkSide('Player 2', 'Aaron');
  s.appendChild(wrap);
  const btns = el('div', 'map-bar');
  const go = el('button', 'primary', '⚔️ BATTLE!');
  go.onclick = () => {
    sfx.tap();
    startVsBattle(decks[p1.sel.value], decks[p2.sel.value], p1.nm.value || 'Player 1', p2.nm.value || 'Player 2');
  };
  const back = el('button', 'quiet', '← Back');
  back.onclick = () => { sfx.tap(); titleScreen(); };
  btns.appendChild(back); btns.appendChild(go);
  s.appendChild(btns);
  app.appendChild(s);
}

// ---------------- settings ----------------
function settingsScreen() {
  clear();
  setScreenBg('assets/backgrounds/bg_map.png');
  const s = el('div', 'screen');
  s.appendChild(el('h2', '', '⚙️ Settings'));
  const p = el('div', 'panel');
  const snd = el('button', '', save.sound ? '🔊 Sound: ON' : '🔇 Sound: OFF');
  snd.onclick = () => { save.sound = !save.sound; sfx.setEnabled(save.sound); persist(); snd.innerHTML = save.sound ? '🔊 Sound: ON' : '🔇 Sound: OFF'; sfx.tap(); };
  p.appendChild(snd);
  p.appendChild(el('div', '', '<br>'));
  const mus = el('button', '', save.music ? '🎵 Music: ON' : '🎵 Music: OFF');
  mus.onclick = () => { save.music = !save.music; music.setEnabled(save.music); if (save.music) music.unlock(); persist(); mus.innerHTML = save.music ? '🎵 Music: ON' : '🎵 Music: OFF'; sfx.tap(); };
  p.appendChild(mus);
  p.appendChild(el('div', '', '<br>'));
  const reset = el('button', 'quiet', '🗑️ Start campaign over');
  reset.onclick = () => confirmPanel('Really erase ALL progress?', () => {
    save = { v: 1, progress: 0, secrets: {}, customs: [null, null], deckId: 'starter', sound: save.sound, music: save.music, crowned: false, seenTips: {} };
    persist(); toast('Fresh start!'); titleScreen();
  });
  p.appendChild(reset);
  p.appendChild(el('p', '', `<br><br>🎂 <b>Rolfe Legends</b><br>Made with ❤️ by Uncle James<br>for Wyatt's 10th birthday<br>Rolfe, Iowa · 2026<br><br><span style="opacity:.6;font-size:12px">All critters are based on real farm employees.<br>The llama knows. 🦙</span>`));
  const back = el('button', '', '← Back');
  back.onclick = () => { sfx.tap(); titleScreen(); };
  p.appendChild(back);
  s.appendChild(p);
  app.appendChild(s);
}

// ---------------- autoplay (testing attract mode) ----------------
function autoplay() {
  const bossIdx = Math.min(save.progress, BOSSES.length - 1);
  const boss = BOSSES[bossIdx];
  const KID = { aggression: 0.55, tradeCare: 0.6, healAt: 10, smart: 0, curve: 'mid' };
  startCampaignBattle(bossIdx);
  const step = () => {
    if (!B) return;
    if (B.state.over) { setTimeout(() => { document.querySelectorAll('.overlay').forEach(n => n.remove()); autoplay(); }, 1600); return; }
    if (B.state.active === 0 && !B.busy) {
      const a = chooseAction(B.state, KID) || { type: 'end' };
      doAction(a);
    }
    setTimeout(step, 600);
  };
  setTimeout(step, 1200);
}

// ---------------- boot ----------------
window.addEventListener('load', () => {
  if (location.hash === '#autoplay') autoplay();
  else titleScreen();
});
