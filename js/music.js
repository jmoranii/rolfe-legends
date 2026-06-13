// Rolfe Legends — background music. Looping tracks with crossfade, separate from SFX.
// Tracks live at assets/audio/<name>.mp3. Missing files no-op gracefully (drop-in like art).
// Browser autoplay policy: nothing plays until unlock() is called from a user gesture.

const TRACKS = ['title', 'battle', 'boss', 'anthem', 'deckbuild'];
const VOL = 0.45;            // music sits under SFX
const FADE_MS = 600;

let enabled = true;
let unlocked = false;
let current = null;          // track name currently desired
const els = new Map();       // name -> {audio, ok}
const missing = new Set();   // names whose file 404'd — never retry

export function setEnabled(on) {
  enabled = on;
  if (!on) stopAll();
  else if (unlocked && current) play(current);
}
export function isEnabled() { return enabled; }

// Call once from the first user tap (satisfies autoplay policy).
export function unlock() {
  if (unlocked) return;
  unlocked = true;
  if (enabled && current) play(current);
}

function getEl(name) {
  if (missing.has(name)) return null;
  let e = els.get(name);
  if (!e) {
    const audio = new Audio(`assets/audio/${name}.mp3`);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    audio.dataset.track = name;
    audio.addEventListener('error', () => { missing.add(name); els.delete(name); audio.remove(); }, { once: true });
    if (document.body) document.body.appendChild(audio); // inspectable + helps some browsers
    e = { audio };
    els.set(name, e);
  }
  return e;
}

function fade(audio, to, ms, onDone) {
  const from = audio.volume;
  const start = performance.now ? performance.now() : 0;
  // performance.now is fine in browsers; tests don't import this module
  const step = (now) => {
    const t = Math.min(1, (now - start) / ms);
    audio.volume = Math.max(0, Math.min(1, from + (to - from) * t));
    if (t < 1) requestAnimationFrame(step);
    else if (onDone) onDone();
  };
  requestAnimationFrame(step);
}

// Public: request a track. Crossfades from whatever's playing. Unknown/missing → silence.
export function play(name) {
  if (!TRACKS.includes(name)) name = null;
  current = name;
  if (!enabled || !unlocked) return;     // remembered; starts on unlock
  // fade out everything that isn't the target
  for (const [n, e] of els) {
    if (n !== name && !e.audio.paused) fade(e.audio, 0, FADE_MS, () => e.audio.pause());
  }
  if (!name) return;
  const e = getEl(name);
  if (!e) return;                        // file missing → silence, no error
  const p = e.audio.play();
  if (p && p.catch) p.catch(() => {});   // autoplay rejection → wait for next unlock/gesture
  fade(e.audio, VOL, FADE_MS);
}

export function stopAll() {
  for (const [, e] of els) { if (!e.audio.paused) { e.audio.pause(); e.audio.volume = 0; } }
}
