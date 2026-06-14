# Rolfe Legends — Locked Design v1

*The taste document. Every number here is a starting point that selfplay + playtesting may tune, but the SHAPE is locked.*

## Core rules (Hearthstone-lite, tuned for a 10-year-old first-timer)

- Two heroes face off. **Hero HP: 20** (Rusty 12, Grandma Rockie 25).
- **Energy ⚡:** you start your turn with energy = number of your turns so far, **capped at 5** (1, 2, 3, 4, 5, 5, …). Spend it to play cards; unspent energy is lost. The math of "what can I afford" is the first strategy layer.
- **Decks: 12–24 cards** player-built (boss decks are 12), max 2 copies of a card (Legendary cards max 1). *(Briefly tried 3 copies — too consistent, reverted.)* Small decks are reliable, big decks are surprising — a real strategy tradeoff. Start of game: player going first draws 4, second draws 5. **Draw 1/turn.** Hand cap 7 (draw skipped with a "Hand full!" toast — no card burning, gentle).
- **Decks recycle:** played tricks and fallen critters go to a discard pile; when your deck runs dry it auto-reshuffles (♻️ toast). You never run out of cards. Tokens evaporate instead.
- **Board: max 4 critters per side.**
- **Two card types only:**
  - **Critter** — has Attack/Health, sits on the board, fights.
  - **Trick** — one-shot effect (the word doubles as magic-trick flavor).
- **Summoning sickness:** critters sleep (💤) the turn they're played, attack from next turn. Keyword **Fast** ignores this.
- Keyword **Guard 🛡️:** enemies must attack Guards first. (Protect your squishy pieces; teaches focus-fire.)
- **Attacking:** tap a ready critter → tap target. Attacking a critter = **simultaneous damage both ways** (trading math!). Attacking a hero = hero takes damage, attacker takes none.
- **Threat meter (the intuitiveness keystone):** always-visible "⚔️ Incoming next turn: N" = total attack of enemy board, plus the enemy's next-turn energy. Every turn is a solvable puzzle: block, Guard, heal, remove, or race.
- **Win:** enemy hero at 0 HP. Frictionless instant rematch on loss + a targeted Coach tip about what killed you.
- **Anti-stall:** from turn 22, heroes take growing damage at their turn start ("Past bedtime!" 1, 2, 3…). With recycling decks this is what guarantees games end; keeps everything ≤~12 rounds average.
- No mulligans, no fatigue damage, no hand-burning, ≤2-line card text, numbers 0–7. If a rule needs a paragraph, it's out.

## Effect vocabulary (everything in the game is built from these)

damage (pick critter / any target / all enemy critters / enemy hero), heal (your hero / pick ally), draw N, buff (+A/+H, pick ally / all allies / random ally / other allies), temp-turn flags (your critters +1 atk this turn; your attacks ignore Guard this turn), summon tokens, bounce (return enemy critter to its owner's hand), debuff (all enemy critters −1 atk, min 0), aura (other allies +1 atk while this lives), start-of-turn trigger (random ally +1/+1), battlecry = "When played:".

## The boss ladder — each fight teaches ONE thing

| # | Boss | HP | Deck archetype | The lesson | Coach's pre-fight tip (voice: warm, brief) |
|---|------|----|----------------|------------|--------------------------------------------|
| 1 | **Rusty** 🐕 | 12 | Puppy Pack (vanilla 1/1s, 2/2s — cannot really win) | Play critters, attack, win | "Drag a critter onto the field, then tap it to attack. Rusty mostly wants belly rubs." |
| 2 | **Aaron** 🦆 | 20 | **Swarm** — cheap ducks, token floods | Wide boards need wide answers (AoE) | "Little brothers come in waves. Duck, Duck, GOOSE! hits ALL his critters at once." |
| 3 | **Dad** (Jacob) 🔧 | 16 | **The Wall** — Guards + buffs | Breaking through defenses (HP 16: your early lead must be able to CLOSE against a recycling wall) | "Your dad guards everything. Nutmeg slips right past Guards — very soccer, very sneaky." |
| 4 | **Mom** (Tory) 💪 | 20 | **Buffs/support** — makes her team huge | Kill the support first (priority targets) | "Your mom makes everyone around her stronger. Take out the helpers before the muscle." |
| 5 | **Uncle Brody** 🔥 | 20 | **Aggro burn** — Fast critters, face damage | Racing vs healing; when to defend | "Brody goes FAST and loud. Heal up, put up Guards, survive the storm — then win." |
| 6 | **Aunt Chelsea** 💖 | 20 | **Heal/control** — removal + heals, outlasts you | Burst damage; don't overextend into removal | "Chelsea heals everything. Little pokes won't cut it — save up for one BIG turn." |
| 7 | **Grampa Flaj** 🚜 | 20 | **Big tanks** — slow giants | Answer big threats (or race them) | "Grampa's slow but his critters are TOUGH as old boots. Hit fast, or pack a vanishing act." |
| 8 | **Grandma Rockie** 👑 | 25 | **Everything** — smart mixed deck, best AI | The final exam | "Grandma Rockie's seen every trick in this game — most of them are hers. Use EVERYTHING you've learned." |

Boss AI personalities: per-boss heuristic weights (aggression, trade-care, heal threshold, curve priority). All bosses lethal-check except Rusty. Rockie additionally prioritizes killing your aura/snowball pieces and holds AoE for value.

**Difficulty intent (selfplay-verified):** Rusty ~unloseable → Aaron easy → mid bosses occasionally need a retry → Rockie typically takes 2–3 attempts with a tuned deck. Losing is part of the strategy lesson; rematch is instant.

## The campaign arc — the 10th Legend

Map = a farm path with 8 portrait nodes + a crown. **Bosses you haven't reached yet are a mystery** (`???` + ❓, no portrait/name) — you only find out who's next when you beat the one before them, so every rung is a reveal. Beaten + current bosses show their portrait/name. Beat a boss → **win their signature card** (pack-opening reveal moment) + scheduled unlocks. Beat Grandma Rockie → crown screen: **"WYATT — THE 10TH LEGEND OF ROLFE"** — 9 legends came before (the 8 bosses + Coach James); on his 10th birthday he completes the ten. Confetti, golden card back unlocked, signed *"Happy 10th Birthday, Wyatt — love, Uncle James."*

## Unlock schedule

| After beating | New cards | Other unlocks |
|---|---|---|
| Rusty | **Rusty** (sig), The Sprinter | — |
| Aaron | **Aaron, Lil Tornado** (sig), Goat Stampede, **Nutmeg** | **Deck Builder** + preset *Farm Friends* |
| Dad (Jacob) | **Dad** (sig), Math Whiz | — |

*(Nutmeg deliberately precedes Dad — Coach's wall-fight tip references it; the tool must come before the lesson.)*
| Mom (Tory) | **Mom** (sig), Magic Vanish | — |
| Brody | **Uncle Brody** (sig), The Trickster | preset *Speed Demons*, *Magic Show* |
| Chelsea | **Aunt Chelsea** (sig), Piano Maestro, **THE ONE LLAMA** | — |
| Grampa Flaj | **Grampa Flaj** (sig) | preset *Big Barn Energy* |
| Grandma Rockie | **Grandma Rockie** (sig) | Crown, golden card back, Dog Man hint, **champion's reward: every card from every boss deck joins the collection** |
| 🤫 Secret | **Dog Man** | Tap the llama on the title screen 3× |

Boss decks become playable in **VS Mode** once beaten (replay value + "play AS mom").

## Wyatt's card pool

### Starter deck (12) — teaches every basic, multi-archetype seeds
| Card | Cost | Stats | Text | Flavor |
|---|---|---|---|---|
| Barn Cat ×2 | 1 | 2/1 | — | "Employee of the month, every month." |
| Billy the Goat ×2 | 2 | 3/2 | — | "Will eat your homework AND your fence." |
| Shep the Sheepdog | 2 | 2/3 | Guard | "Nobody gets past Shep." |
| Soccer Striker ×2 | 3 | 3/2 | Fast | "Top corner. Every time." |
| Mama Hen | 3 | 2/4 | When played: summon a 1/1 Chick | "Everyone counts as her chick." |
| Prize Pig | 4 | 4/4 | — | "Blue ribbon. Knows it." |
| Slide Tackle | 2 | Trick | Deal 3 to a critter | "Clean. Mostly." |
| Duck, Duck, GOOSE! | 3 | Trick | Deal 1 to all enemy critters | "The goose chooses violence." |
| Blessing | 1 | Trick | Heal your hero 4 | "A little grace goes a long way." |

### Unlockables
| Card | Cost | Stats | Text | Flavor |
|---|---|---|---|---|
| The Sprinter | 1 | 2/1 | Fast | "Started running and simply did not stop." |
| Goat Stampede | 4 | Trick | Deal 2 to all enemy critters | "You hear them before you see them." |
| Nutmeg | 1 | Trick | Your attacks ignore Guard this turn | "Right between the legs. GOAL." |
| Math Whiz | 2 | 1/3 | When played: draw a card | "Already calculated how this ends." |
| Magic Vanish | 2 | Trick | Return an enemy critter to its owner's hand | "Nothing up my sleeve…" |
| The Trickster | 3 | 3/3 | When played: draw a card | "Pulls one from his sleeve. Don't ask which sleeve." |
| Piano Maestro | 4 | 2/5 | At the start of your turn, a random ally gets +1/+1 | "Every turn, the song builds." |
| **THE ONE LLAMA** 🦙 | 5 | 6/6 | Legendary. When played: all enemy critters get −1 Attack | "The Llama says nothing. The Llama knows." |
| **Dog Man** 🤫 | 3 | 3/3 | Legendary, secret. Guard, Fast | "Part dog. Part man. All hero." |

### Boss signature cards (Legendary, won on victory)
| Card | Cost | Stats | Text | Flavor |
|---|---|---|---|---|
| Rusty | 2 | 2/3 | Guard | "Good boy. GREAT boy." |
| Aaron, Lil Tornado | 2 | 2/2 | When played: summon a 1/1 Duckling | "Has never once sat still." |
| Dad | 3 | 2/4 | Guard. When played: give another ally +1/+1 | "Can fix anything with zip ties." |
| Mom | 4 | 3/4 | Your other critters have +1 Attack | "Says 'be careful!' Makes you stronger anyway." |
| Uncle Brody | 4 | 5/2 | Fast | "REAL TALK." |
| Aunt Chelsea | 3 | 2/3 | When played: heal your hero 4 | "Hugs that heal." |
| Grampa Flaj | 5 | 5/6 | When played: your other critters get +0/+2 | "Tough as old boots." |
| Grandma Rockie | 5 | 4/5 | When played: deal 2 to all enemy critters | "Final boss energy. Bakes cookies." |

### Preset decks (Coach's Picks — one-tap good decks, freeform builder for when he's ready)
- **Farm Friends** (post-Aaron): go-wide farm core — Barn Cat ×2, Billy ×2, Shep, Mama Hen ×2, Prize Pig, Rusty, Aaron Lil Tornado, Goat Stampede, Duck Duck GOOSE!
- **Speed Demons** (post-Brody): Sprinter ×2, Barn Cat ×2, Striker ×2, Billy ×2, Uncle Brody, Nutmeg, Slide Tackle, Blessing
- **Magic Show** (post-Brody): Math Whiz ×2, Trickster ×2, Magic Vanish ×2, Nutmeg, Slide Tackle, Shep ×2, Mom, Prize Pig
- **Big Barn Energy** (post-Flaj): Prize Pig ×2, Grampa Flaj, The One Llama, Mama Hen ×2, Shep ×2, Billy ×2, Blessing, Slide Tackle

## Readability layer (playtest rounds 1–2, Jun 10–11)

- **AI plays pause the game:** the boss's card appears big, center-screen, until tapped ("👆 tap to continue") — paced for a reader, not a speedrunner. (`#autoplay` auto-dismisses.)
- **Battle log:** 📜 button in battle opens a full play-by-play (newest first), narrated kid-plain ("⚔️ Puppy attacked Wyatt", "♻️ deck reshuffled"). Catch up anytime.
- **Attack lunges + telegraphs:** attackers slide at their target; AI attacks pre-announce (gold ring attacker / red ring victim).
- **One scorecard language everywhere:** 💥 Punch / 🛡️ Toughness / ✨ Tricks (1–5 stars, computed from deck composition — `deckStats()`). Live in the deck builder as you build; **prefight Scout Report** shows boss stars vs yours (counter-building teaches itself); preset chips + VS picker show mini-stats.
- **Builder shelves:** collection grouped ⚔️ Attackers / 🛡️ Defenders / ✨ Tricks / 🌟 Legends.

## Music (Suno, Fri 2026-06-13)

Five looping tracks in `assets/audio/` (`js/music.js` — loop + 600ms crossfade on screen change, `--autoplay`-safe via first-tap unlock, music toggle in Settings separate from SFX). **First Suno variation of each used** (James's call). Drop-in like art: a missing track just no-ops.

| Track | File | When | Style |
|---|---|---|---|
| Main theme | `title.mp3` | Title, Map, menus | warm Americana folk adventure (banjo/fiddle/whistle), instrumental |
| Battle | `battle.mp3` | Bosses 1–7, Couch Battle | upbeat bluegrass hoedown, instrumental |
| Final boss | `boss.mp3` | Grandma Rockie fight | music-box intro → epic orchestral folk menace, instrumental |
| **Crown anthem** | `anthem.mp3` | Win/crown screen | **"The 10th Legend of Rolfe" — Wyatt's birthday song, custom lyrics, gang-vocal hoedown** |
| Deck builder | `deckbuild.mp3` | Deck builder | relaxed porch bluegrass thinking music, instrumental |

Full lyrics + clip IDs logged in [`media/songs/index.md`](../../second-brain/media/songs/index.md) (vault). SFX stay procedural WebAudio (`js/sfx.js`).

## Modes

- **Campaign** — the 8-boss ladder, Coach James tips, unlocks, the crown.
- **Couch Battle (VS)** — pass-and-play on one tablet, two humans (built for Aaron). Pick any two unlocked decks (incl. beaten boss decks). "Pass to Player 2!" hand-hide between turns. No netcode ever.

## Screens

Title (wooden sign "ROLFE LEGENDS", farm sunset, llama 👀, "Made for Wyatt's 10th Birthday ❤") → Map (farm path) → Pre-fight (boss intro + tip) → Battle → Victory (card reveal) → Collection / Deck Builder → VS setup → Settings (sound, reset, credits "Made with love by Uncle James").

## Look & feel

Warm farm palette (barn red `#b5413a`, hay gold `#e8b94e`, sky `#8ecae6`, grass `#5a8f4f`, cream `#fdf6e3`), chunky rounded cards with cost gem (top-left) and ATK/HP badges (bottom corners), big friendly display font (Fredoka / Baloo 2 via Google Fonts with system fallback), emoji art v1 → GPT-image stylized cartoon art later (drop-in via `assets/cards/<id>.png`). Juice: drag-lift + shadow, hit shake, floating damage numbers, death poof, victory confetti, WebAudio synth SFX (whoosh, thock, chime, poof, fanfare, and a square-wave QUACK).

## Art direction (locked Thu 2026-06-11)

**Two-tier art system: "Legends get portraits; commons stay emoji."** Painted art goes only to the named/legendary cards (family sigs, the four pets, the llama, Dog Man), hero portraits, the coach, and the title screen — ~17 images. Commons keep emoji deliberately: it makes legendaries feel legendary, keeps the matched-series consistency problem small, and the emoji look is charming and tested.

**Style: "Storybook Gouache Trading Card."** Warm hand-painted storybook gouache, friendly caricature (gently exaggerated proportions, expressive faces), bold silhouettes, golden-hour farm light with warm rim light, simple painterly farm-vignette backgrounds, matched-series consistency, no text/frames in the art (the game draws its own frames). Chosen over photoreal (uncanny, inconsistent), flat vector (cold next to the cream/barn-red UI), and 3D (hardest to keep consistent). Generated from real reference photos via ChatGPT Images 2.0 (exact ratios supported; cards 1:1 1024×1024, title 2:3 1024×1536).

**Pipeline:** the full copy-paste prompt kit lives in [`assets/PROMPTS.md`](assets/PROMPTS.md) — style block, per-image prompts with pose/personality notes, reference-photo shot list, exact filenames, QA checklist. Files drop into `assets/cards/<cardId>.png` + `assets/ui/` and are picked up automatically with emoji fallback (zero code changes; incremental landing). Note: some filenames are internal ids (Lily = `guard_cat.png`, Smidgen = `grand_finale.png`) — the kit's table is the source of truth. Test trio first: Rockie, Smidgen, title bg.

## Battle backgrounds (wired Sat 2026-06-13)

Each boss fights on their own painted "place" — climbing the ladder feels like traveling through the farm and the family. Eight landscape stages (`assets/backgrounds/bg_<bossId>.png`, ~1536×1024, style-matched to the card series) sit behind the board: Rusty's open field, Aaron's farmyard, Dad's barn-door wall, Mom's sunflower field, Brody's dusty driveway, Chelsea's firelit room, Grampa's pasture, Rockie's golden-hour porch. Each is painted as a *quiet stage* — soft-focus, a calm open lower-center where the board sits, an edge vignette, unpopulated (the cards are the characters).

**Drop-in, same spirit as the card art:** `applyBattleBg()` (`js/game.js`) probes `bg_<id>.png` once, caches the result, and applies it via CSS only after it loads — a missing PNG silently leaves the warm dark fallback tone, with no console errors (they can land incrementally). Couch Battle reuses Rusty's neutral field. **Legibility is protected by a tunable scrim** (`.battle.has-bg` in `style.css`): a `--scrim` dark wash (locked at `0.42`) + a vignette tame every scene, and the exposed midbar (energy/turn label) gets a chip + light text so it reads on any photo. The board, HP/energy, card text, and hero bars keep their opaque cream backings, so they stay crisp on top. If a stage ever reads too busy, dial `--scrim` up or re-roll that one muted (`./assets/generate-art.sh bg_<id>`) rather than darkening it destructively in code.

## Screen backgrounds + wide-screen backdrop (Sat 2026-06-13)

The map (`bg_map.png` — a road climbing to a glowing horizon) and My Cards (`bg_cards.png` — a quiet warm farmhouse tabletop) screens get their own painted full-screen backgrounds too, both portrait 1024×1536 and muted for overlaid UI. Wide-screen (PC) testing also exposed that the game is portrait-first, so the old flat green→blue page gradient leaked as bars beside the centered column on any non-portrait viewport.

**One system handles both** (`setScreenBg()` in `js/game.js`, called on entry to every screen): each screen sets its own art sharp inside the 520px column (`#app`'s `--col-bg`, fixed — `#app` doesn't scroll, the `.screen` inside it does) **and** a scaled-up blurred copy in the margins (`.screen-backdrop`, a fixed `z-index:-1` layer reading `--screen-bg`, `blur(40px) brightness(.55)`). The green→blue body gradient is **gone**, replaced by a warm dusk tone (`#2a1d14`) that is now the single fallback everywhere (a missing image just shows it — CSS bg, no console error). Per-screen art: Title → `title_bg`, Map → `bg_map`, My Cards → `bg_cards`, Battle → the current `bg_<boss>` (column drawn by the scrimmed `.battle` itself), prefight → the boss's stage, VS/Settings → `bg_map`. **Acceptance test (verified at 414px and 1440px): no green or blue is visible on any screen at any window size.** Legibility for text that floats directly on the art (screen titles, the builder's category labels, the deck-meta) is handled on the *text* side — cream + soft shadow — never by darkening the art; map node panels were nudged to `0.7` opacity so upcoming bosses read over the road.
