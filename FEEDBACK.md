# Rolfe Legends — Feedback & Fix Log

A running backlog of playtest feedback and things to improve. We triage and work
through these over time — not all at once. Check items off as they ship, then move
them to **Shipped** at the bottom with the date + commit.

New items: add under **Open** with a `_(source, YYYY-MM-DD)_` tag. Newest batch on top.

## Open

_Nothing open right now — caught up on playtest feedback. New items go here (newest batch on top)._

## Shipped

### Just-in-time coaching in the Rusty/Aaron fights — _shipped 2026-07-04_
James: tips fired at turn start, "not always at the time that it makes the most sense"
(e.g. Guard explained because one sat in your hand, not when it mattered). Reworked as an
extension of the practice philosophy — concepts teach themselves at the action that makes
them real:
- [x] **Guard / Fast / Trick** → the moment YOU play one (in `doAction`'s completion, with
  the card's name: "🛡️ Shep guards — enemies must attack him first!").
- [x] **Mutual trade** → right after your first critter-vs-critter attack, when both damage
  numbers just flew ("See? Animals hit back — both got hurt.").
- [x] **Attack the hero** → the moment you select an attacker and his bar starts glowing.
- [x] **Threat meter** → the first time incoming damage is actually > 0 (was: turn 3).
- [x] **Meta buttons earn their intros**: 📜 after the log has ≥6 lines, 📖 only once a
  keyword icon has actually appeared, 🪿 AoE tip only when Aaron's field is crowded (≥2).
- [x] **Hesitation nudge**: idle ~9s on your turn (fights 1–2) → Coach softly offers the
  contextual next step (attack / play / end turn); once per turn, never over an existing
  bubble, cancelled the moment you act. Replaces the turn-1 "how to play" lecture entirely —
  turn 1 now opens quiet.
- [x] Rusty's prefight tip no longer says "Drag" (legacy copy from a pre-tap design).
  _(from James's live test, 2026-07-04)_

### Backyard Practice — the first-five-minutes overhaul — _shipped 2026-07-04_
Wyatt hadn't seen the game yet, so the whole learning path got a ground-up redesign around
**do-first, one-verb-per-beat, constrained choices, spotlight guidance, instant celebration**:
- [x] **Scripted practice fight vs Old Scarecrow** (fight 0): 3 choreographed beats — play /
  attack / energy-choice — unloseable, ~90s, spotlight-guided, allowlist-gated (only the
  scripted move goes through; wrong taps get a nudge). Script is pure data in `js/tutorial.js`,
  replay-verified through the engine by `test/test.mjs`. Skippable + replayable (🎓 on title).
- [x] **Anatomy taught on the real card** (chips pointing at ⚡/⚔️/❤ in beat 1) — the primer
  overlay no longer auto-gates the first fight; it survives as the ❓ prefight reference.
- [x] **Progressive HUD**: threat meter + 📜/🧢/📖 hidden until each one's tip introduces it
  (pop-in + pulse); veterans (progress ≥ 2) and Couch Battle see everything immediately.
- [x] **Tip diet**: every coach tip rewritten to ≤ ~12 words, one bold verb, one emoji; sleepy
  and can't-afford moved to teachable-moment shakes + toasts at the mis-tap.
- [x] **Recycle + Bedtime finally taught**: first-exposure tips (♻️ on the first reshuffle,
  🌙 at turn 12) + new glossary rows; ⚡ glossary row now carries the +1/turn cap detail.
  _(self-directed, 2026-07-04 — Wyatt gets access soon; make minute one seamless)_

### Deck builder — copy limits made obvious — _shipped 2026-06-25_
- [x] **Make the copy limits obvious.** Added a persistent rule banner ("2 of each card ·
  1 of each ⭐ Legend · tap a MAX card to clear it"), a gold **×N MAX** badge + gold outline
  when a card hits its cap (vs the green outline = in deck with room to add), and a toast when
  a max-tap clears a card (previously a silent surprise). The 2/1 cap already existed in the
  engine — this just surfaces it. _(from playtest, 2026-06-18)_

### Onboarding & the Rusty tutorial — _shipped 2026-06-25_
Front-loaded a **"How your cards work" primer** (a labeled sample card — Cost / Punch /
Toughness / Powers — shown once before the first Rusty fight, re-openable via the ❓ button)
and **reworked Coach James** to teach the missing mechanics in a clean, action-triggered sequence:
- [x] **Attack the enemy hero directly** — now its own Coach beat that pulses Rusty's bar.
- [x] **Mutual-trade combat** — both animals take damage when they fight (the big gap Chelsea hit).
- [x] **General Rusty-tutorial clarity pass** — the primer + reordered, plain-language tips.
- [x] Bonus: **Fast is now explained** (new Coach tip), and the ⚡ icon collision is fixed — **Fast = 🚀**, ⚡ stays energy-only.
