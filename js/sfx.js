// Rolfe Legends — procedural WebAudio SFX. No audio files, ever.
let ctx = null;
let enabled = true;

export function setEnabled(on) { enabled = on; }
export function isEnabled() { return enabled; }

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// tiny synth helper: one oscillator note with envelope
function note({ freq = 440, end = freq, type = 'sine', dur = 0.15, vol = 0.25, when = 0 }) {
  if (!enabled) return;
  try {
    const a = ac(), t = a.currentTime + when;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (end !== freq) o.frequency.exponentialRampToValueAtTime(Math.max(40, end), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t); o.stop(t + dur + 0.05);
  } catch { /* audio is decorative */ }
}

function noiseBurst({ dur = 0.12, vol = 0.18, when = 0, freq = 800 }) {
  if (!enabled) return;
  try {
    const a = ac(), t = a.currentTime + when;
    const len = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = a.createBufferSource(); src.buffer = buf;
    const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq;
    const g = a.createGain(); g.gain.value = vol;
    src.connect(f).connect(g).connect(a.destination);
    src.start(t);
  } catch { /* shrug */ }
}

export const tap     = () => note({ freq: 600, end: 800, type: 'sine', dur: 0.06, vol: 0.12 });
export const play    = () => { note({ freq: 300, end: 600, type: 'triangle', dur: 0.12, vol: 0.2 }); noiseBurst({ dur: 0.08, freq: 1200, vol: 0.06 }); };
export const trick   = () => { note({ freq: 700, end: 1400, type: 'sine', dur: 0.18, vol: 0.18 }); note({ freq: 1050, end: 2100, type: 'sine', dur: 0.18, vol: 0.1, when: 0.05 }); };
export const hit     = (n = 2) => { noiseBurst({ dur: 0.1, freq: 500, vol: 0.22 }); note({ freq: 160 - n * 8, end: 80, type: 'square', dur: 0.12, vol: 0.12 }); };
export const death   = () => { noiseBurst({ dur: 0.2, freq: 300, vol: 0.18 }); note({ freq: 220, end: 60, type: 'sawtooth', dur: 0.25, vol: 0.1 }); };
export const heal    = () => { note({ freq: 523, type: 'sine', dur: 0.12, vol: 0.15 }); note({ freq: 659, type: 'sine', dur: 0.12, vol: 0.15, when: 0.08 }); note({ freq: 784, type: 'sine', dur: 0.18, vol: 0.15, when: 0.16 }); };
export const draw    = () => note({ freq: 880, end: 990, type: 'sine', dur: 0.05, vol: 0.08 });
export const energy  = () => note({ freq: 1175, type: 'sine', dur: 0.08, vol: 0.1 });
export const quack   = () => { note({ freq: 350, end: 200, type: 'square', dur: 0.12, vol: 0.14 }); note({ freq: 300, end: 170, type: 'square', dur: 0.1, vol: 0.12, when: 0.12 }); };
export const win     = () => [523, 659, 784, 1047].forEach((f, i) => note({ freq: f, type: 'triangle', dur: 0.22, vol: 0.2, when: i * 0.13 }));
export const lose    = () => [392, 330, 262, 196].forEach((f, i) => note({ freq: f, type: 'triangle', dur: 0.3, vol: 0.15, when: i * 0.18 }));
export const unlock  = () => [784, 988, 1175, 1568].forEach((f, i) => note({ freq: f, type: 'sine', dur: 0.15, vol: 0.15, when: i * 0.07 }));
export const coach   = () => note({ freq: 440, end: 520, type: 'triangle', dur: 0.1, vol: 0.1 });
export const fanfare = () => [523, 523, 523, 659, 784, 784, 1047].forEach((f, i) => note({ freq: f, type: 'triangle', dur: i === 6 ? 0.5 : 0.16, vol: 0.2, when: i * 0.15 }));
