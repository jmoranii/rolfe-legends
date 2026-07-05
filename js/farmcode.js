// Rolfe Legends — the Secret Farm Code: a save backed up as a copyable string.
// Pure (no DOM) so tests can round-trip it. Encodes only the earned state
// (progress, crown, Dog Man, custom decks, chosen deck) — settings stay local.
// Format: FARM-<base64url payload>-<checksum> ; checksum catches paste typos.

import { CARDS, BOSSES, DECK_MIN, DECK_MAX } from './cards.js';

function checksum(s) {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 46655;
  return h.toString(36).padStart(3, '0');
}

export function encodeFarmCode(save) {
  const data = {
    v: 1,
    p: save.progress || 0,
    c: save.crowned ? 1 : 0,
    d: save.secrets && save.secrets.dogMan ? 1 : 0,
    k: save.customs || [null, null],
    x: (save.deckId && save.deckId !== 'coach') ? save.deckId : 'starter',
  };
  const b = btoa(unescape(encodeURIComponent(JSON.stringify(data))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `FARM-${b}-${checksum(b)}`;
}

// Returns {progress, crowned, dogMan, customs, deckId} or null if the code is bad.
export function decodeFarmCode(code) {
  try {
    const m = String(code).trim().toUpperCase().startsWith('FARM-') ? String(code).trim() : null;
    if (!m) return null;
    const parts = m.slice(5).split('-');
    if (parts.length !== 2) return null;
    const [b, sum] = parts;
    if (checksum(b) !== sum) return null;
    const json = decodeURIComponent(escape(atob(b.replace(/-/g, '+').replace(/_/g, '/'))));
    const d = JSON.parse(json);
    if (d.v !== 1) return null;
    const progress = Number(d.p);
    if (!Number.isInteger(progress) || progress < 0 || progress > BOSSES.length) return null;
    // sanitize custom decks: arrays of known card ids within size rules, else the slot resets
    const cleanDeck = (arr) => (Array.isArray(arr)
      && arr.length >= DECK_MIN && arr.length <= DECK_MAX
      && arr.every((id) => typeof id === 'string' && !!CARDS[id])) ? [...arr] : null;
    const rawCustoms = Array.isArray(d.k) ? d.k : [null, null];
    const customs = [cleanDeck(rawCustoms[0]), cleanDeck(rawCustoms[1])];
    const deckId = typeof d.x === 'string' ? d.x : 'starter';
    return { progress, crowned: !!d.c, dogMan: !!d.d, customs, deckId };
  } catch {
    return null;
  }
}
