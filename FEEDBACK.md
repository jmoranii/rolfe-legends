# Rolfe Legends — Feedback & Fix Log

A running backlog of playtest feedback and things to improve. We triage and work
through these over time — not all at once. Check items off as they ship, then move
them to **Shipped** at the bottom with the date + commit.

New items: add under **Open** with a `_(source, YYYY-MM-DD)_` tag. Newest batch on top.

## Open

### Deck builder
- [ ] **Make the copy limits obvious.** It isn't clear you can run **2 copies of every
  card except legendaries** (legendaries are limited to **1**). Surface the rule in the
  builder UI — e.g. a per-card "×2 max" / "Legendary ×1" indicator and clear feedback
  when a card is maxed out. _(playtest, 2026-06-18)_

## Shipped

### Onboarding & the Rusty tutorial — _shipped 2026-06-25_
Front-loaded a **"How your cards work" primer** (a labeled sample card — Cost / Punch /
Toughness / Powers — shown once before the first Rusty fight, re-openable via the ❓ button)
and **reworked Coach James** to teach the missing mechanics in a clean, action-triggered sequence:
- [x] **Attack the enemy hero directly** — now its own Coach beat that pulses Rusty's bar.
- [x] **Mutual-trade combat** — both animals take damage when they fight (the big gap Chelsea hit).
- [x] **General Rusty-tutorial clarity pass** — the primer + reordered, plain-language tips.
- [x] Bonus: **Fast is now explained** (new Coach tip), and the ⚡ icon collision is fixed — **Fast = 🚀**, ⚡ stays energy-only.
