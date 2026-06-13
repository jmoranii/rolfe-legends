# Mission: Wire per-boss battle backgrounds into Rolfe Legends

## Context

Rolfe Legends (Wyatt's 10th-birthday card battler, `~/code/rolfe-legends/`) just finished its art pass: 17 painted card/portrait/title images, plus a 5-track Suno soundtrack, all wired and drop-in. **The one weak visual left:** the battle screen uses a single generic green-grass / blue-sky background for *every* fight. Now that every character is richly painted, that flat backdrop is the thing that breaks the spell.

**The decision:** each boss gets a **battleground that matches their legend card's "place,"** so climbing the ladder feels like traveling through the farm and the family. A parallel image-generation session has painted 8 battle-background PNGs (style-matched to the card series). **Your job: wire them in. Do not regenerate or edit art, and do not touch the card/portrait/title pipeline, game balance, or rules.**

## The assets (drop-in ready, painted to sit behind UI)

- **Location:** `assets/backgrounds/bg_<id>.png`
- **8 files**, ids matching the boss signature-card ids (so `sig_<id>.png` ↔ `bg_<id>.png`):

  | Boss (display) | Engine role | Background file |
  |---|---|---|
  | Rusty | tutorial | `bg_rusty.png` |
  | Aaron | boss 1 | `bg_aaron.png` |
  | Jacob | boss | `bg_jacob.png` |
  | Tory | boss | `bg_tory.png` |
  | Brody | boss | `bg_brody.png` |
  | Chelsea | boss | `bg_chelsea.png` |
  | Flaj (Sean) | boss | `bg_flaj.png` |
  | Rockie (Kim) | final boss | `bg_rocky.png` |

  > Id quirks that match the existing card filenames: **Grandma Rockie = `rocky`**, **Grampa Flaj = `flaj`**. Coach James is the mentor, **not** a boss — no background.

- **Format:** PNG, landscape ~**1536×1024** (3:2). Each is painted deliberately as a *quiet stage*: muted/slightly desaturated, soft-focus, detail kept to the upper area and edges, a **calm open lower-center** where the board sits, and a soft edge vignette. Unpopulated (no people/animals — the characters are the cards on top).

## What to build

1. **A battle-background slot** in the battle screen that loads `assets/backgrounds/bg_<bossId>.png` for the current fight, keyed off the boss being fought. Mirror how the existing pipeline picks up cards/portraits/title — same conventions, same spirit.
2. **Drop-in + graceful fallback** (non-negotiable, matches the rest of the game): if a PNG is missing, fall back to the current generic green/blue background. No console errors, no breakage. The image session may deliver the 8 incrementally — handle any subset present.
3. **CSS:** `background-size: cover; background-position: center;` fixed to the battle viewport so it fills any tablet/phone aspect by cropping gracefully.
4. **Legibility is the whole risk — protect it.** Kid-readability (tiny numbers, plain cards, visible math, threat telegraphs) is a core design pillar. Put a **tunable scrim** between the background and the board — a semi-transparent dark wash and/or vignette gradient — and tune its opacity so the scene reads but **never competes** with the board, HP/energy numbers, card text, hero bars, or the battle-log button. Verify legibility against the busiest scenes (`bg_tory`, `bg_brody`) and the glowy one (`bg_rocky` has a faint golden shimmer — check contrast there).
5. **Couch Battle (pass-and-play VS):** minor open question — either reuse a neutral background (`bg_rusty`'s open field reads well), pick by one of the two decks in play, or keep the generic backdrop. Your call; keep it simple.

## Test & verify

- **Test ONE first** behind the real UI — suggest `bg_rocky` (final boss, highest stakes + a golden glow that stress-tests the scrim). Confirm the board stays crisp, lock the scrim opacity, then roll out the other 7.
- Run the existing unit suite + Playwright e2e. The battle screen must stay green (zero console errors) **both** with and without the background PNGs present.
- If a background reads too busy behind the UI even with the scrim, **flag it back to the image session for a muted re-roll** rather than darkening it destructively in code — the generator can redo a single one: `./assets/generate-art.sh bg_<id>`.

## Out of scope

- Regenerating/editing the painted images (image session owns that).
- Any change to card art, portraits, title, map, soundtrack, game balance, or rules.
- New backgrounds beyond the 8 bosses.

## Working agreements

- Drop-in art, gradient fallback — no asset is a hard dependency.
- The background serves the fight; it never fights it. When in doubt, dial the scrim up and the background back.
