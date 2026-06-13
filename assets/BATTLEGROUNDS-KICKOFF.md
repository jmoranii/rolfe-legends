# Mission: Wire painted backgrounds into Rolfe Legends (battles + map + My Cards + wide-screen)

## Context

Rolfe Legends (Wyatt's 10th-birthday card battler, `~/code/rolfe-legends/`) just finished its art pass: 17 painted card/portrait/title images, plus a 5-track Suno soundtrack, all wired and drop-in. **The one weak visual left:** the battle screen uses a single generic green-grass / blue-sky background for *every* fight. Now that every character is richly painted, that flat backdrop is the thing that breaks the spell.

**The decision:** each boss gets a **battleground that matches their legend card's "place,"** so climbing the ladder feels like traveling through the farm and the family. A parallel image-generation session has painted 8 battle-background PNGs (style-matched to the card series). **Your job: wire them in. Do not regenerate or edit art, and do not touch the card/portrait/title pipeline, game balance, or rules.** Additional background needs surfaced during wide-screen (PC) testing — the **map** and **My Cards** screens, and the **wide-screen letterbox** — see **Also in scope** below. Same session, same rules.

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

## Also in scope: map + My Cards backgrounds + wide-screen letterbox

Testing on a wide PC screen exposed that the game is **portrait-first**, so the flat green/blue page background leaks wherever the portrait content doesn't reach — the title's left/right margins, the campaign-map background, and the My Cards collection screen.

### A) Full-screen backgrounds for the map and My Cards screens

Two content screens get their own painted background (both portrait 1024×1536, already generated, muted for overlaid UI):

| Screen | Asset | Scene |
|---|---|---|
| Road to Legend (campaign map) | `assets/backgrounds/bg_map.png` | a dirt road climbing to a glowing horizon (the goal) |
| My Cards (collection) | `assets/backgrounds/bg_cards.png` | a calm warm farmhouse tabletop — a quiet surface so the cards pop |

- Wire each as a **fixed full-screen background** for its screen (stays put while content scrolls over it). Same drop-in + fallback rule as everything else (missing file → current gradient, no errors).
- Content sits on top: the map's node panels are translucent and My Cards is a card grid — verify text/cards stay readable over the center. If anything's marginal, adjust the **panel/card** side (opacity, a subtle backing), don't darken the art.

### B) Kill the green/blue everywhere on wide screens (the side-bleed) — DECIDED APPROACH

- **Root cause:** the `body`/page background is a flat green→blue gradient; the game is portrait-first, so on any viewport wider/taller than the portrait column it shows as bars (title sides, map/cards margins).
- **Do this — a blurred backdrop layer** (adaptive, no new asset; this is the chosen solution, not optional). Behind the centered game column, render a fixed full-viewport layer that reuses the *active screen's own* background image, scaled up + blurred + darkened, and **remove the green→blue body gradient entirely**:
  ```css
  .screen-backdrop {
    position: fixed; inset: 0; z-index: -1;
    background: var(--screen-bg) center / cover no-repeat;
    filter: blur(40px) brightness(0.55) saturate(0.9);
    transform: scale(1.1);            /* hide the blurred edges */
  }
  ```
- **Set `--screen-bg` per screen** to that screen's own art, so the margins are always a quiet blur of the same scene:

  | Screen | `--screen-bg` |
  |---|---|
  | Title | `title_bg.png` |
  | Road to Legend | `bg_map.png` |
  | My Cards | `bg_cards.png` |
  | Battle | `bg_<boss>.png` (the current fight) |
  | Anything else / fallback | `bg_map.png`, or a warm dark tone |

- **Acceptance test: no green or blue is visible on any screen at any window size.**
- Only if the blur is too heavy on a low-end tablet: fall back to a single warm dark body tone (e.g. deep dusk brown `#2a1d14`). Try the blur first.

## Test & verify

- **Test ONE first** behind the real UI — suggest `bg_rocky` (final boss, highest stakes + a golden glow that stress-tests the scrim). Confirm the board stays crisp, lock the scrim opacity, then roll out the other 7.
- Run the existing unit suite + Playwright e2e. The battle screen must stay green (zero console errors) **both** with and without the background PNGs present.
- If a background reads too busy behind the UI even with the scrim, **flag it back to the image session for a muted re-roll** rather than darkening it destructively in code — the generator can redo a single one: `./assets/generate-art.sh bg_<id>`.

## Out of scope

- Regenerating/editing the painted images (image session owns that).
- Any change to card art, portraits, title, map, soundtrack, game balance, or rules.
- New backgrounds beyond the 8 boss battlegrounds + the two screen backgrounds (`bg_map`, `bg_cards`). (The wide-screen letterbox fix is CSS, no new art.)

## Working agreements

- Drop-in art, gradient fallback — no asset is a hard dependency.
- The background serves the fight; it never fights it. When in doubt, dial the scrim up and the background back.
