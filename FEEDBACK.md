# Rolfe Legends — Feedback & Fix Log

A running backlog of playtest feedback and things to improve. We triage and work
through these over time — not all at once. Check items off as they ship, then move
them to **Shipped** at the bottom with the date + commit.

New items: add under **Open** with a `_(source, YYYY-MM-DD)_` tag. Newest batch on top.

## Open

_Nothing open right now — caught up on playtest feedback. New items go here (newest batch on top)._

## Shipped

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
