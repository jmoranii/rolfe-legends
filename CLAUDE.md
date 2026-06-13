# Rolfe Legends

A personalized card-battler built by James (Uncle James) as a gift for his nephew **Wyatt Rittgers' 10th birthday — Sun 2026-06-28**. Wyatt lives on a farm in Rolfe, Iowa with his brother Aaron (8), parents Tory & Jacob, dog Rusty, goats, ducks, and one llama.

## The one-sentence vision

A kid who has never played a card game picks up a tablet, and within 60 seconds is having fun; within 8 fights he's building synergistic decks and outthinking the final boss — and the whole game is unmistakably *his*: his family, his farm, his interests.

## Design pillars (check every decision against these)

1. **Intuitive over deep.** Wyatt has never played a deckbuilder. Tiny numbers, two card types, plain words on cards, no jargon, no manual. One new concept per fight. If a feature needs explaining, redesign it.
2. **Strategy is the fun.** Wyatt loves strategy, math, Pokémon. Turn-based, fully visible math, threat telegraphing. Every turn should be a solvable puzzle. No twitch, no randomness beyond card draw (one comedic exception allowed).
3. **It's HIS game.** Family as bosses, farm animals as cards, his interests (soccer, running, piano, magic, math, church) as mechanics. The llama is legendary. Personal touches beat generic polish.
4. **Durable + frictionless.** Vanilla HTML/CSS/JS, no build step, no server, no install. Runs from a static page on a tablet. localStorage saves. Works in 5 years.
5. **Tested, not hoped.** Pure logic layer with unit tests; AI-vs-AI selfplay for balance and crash-hunting. A 10-year-old will find every bug — find them first.

## Cast (real family — handle with care)

- **Wyatt** (10) — the player. The campaign crowns him the **10th Legend of Rolfe** (9 family legends precede him; he completes the ten on his 10th birthday).
- **Coach James** (Uncle James) — in-game mentor. Tips between fights, tutorial voice. NOT a boss.
- Boss ladder (in order): **Rusty** (dog, tutorial) → **Aaron** (little brother, 8) → **Dad** (Jacob) → **Mom** (Tory) → **Uncle Brody** → **Aunt Chelsea** → **Grampa Flaj** (Sean Moran, maternal grandpa) → **Grandma Rockie** (Kim Moran, maternal grandma, final boss).
- **Everything is from Wyatt's POV:** his parents are **"Mom"** and **"Dad"** in all game copy (boss names, cards, tips) — never "Tory"/"Jacob". (Internal card ids stay `sig_tory`/`sig_jacob`.)
- First names / family nicknames ONLY in game copy. Never surnames, never birthdates beyond "10th birthday."

## Privacy & publishing

Do NOT push this repo to a public remote or deploy to GitHub Pages without James's explicit go — the publish decision (public vs unlisted vs local-only) happens at ship time. Cartoon likenesses of real family members are a new exposure type vs. prior projects. Local git only until then.

## Conventions

- Stack: HTML5 + CSS3 + vanilla JS (ES modules where helpful), zero dependencies, no build.
- `js/logic.js` and `js/ai.js` are **pure** (no DOM). All rules live there. `js/game.js` renders state + plays event queues. `js/cards.js` is data.
- Tests: `node test/test.mjs` (rules + every card effect), `node test/selfplay.mjs` (balance matrix, fuzz, difficulty curve). Run both after any logic/cards change.
- SFX: procedural WebAudio only (`js/sfx.js`) — no audio files. Music (Suno) may be added later as files in `assets/`.
- Art: v1 ships emoji + CSS card frames. GPT-image stylized art drops into `assets/cards/<cardId>.png` + `assets/ui/` later WITHOUT code changes (manifest-driven; falls back to emoji if file missing).
- See `DESIGN.md` for the full locked design: rules, card roster, boss decks, teaching curve, unlock schedule.

## Timeline

Core playable (Jun 10–12) → James playtests → full ladder + polish (by ~Jun 20) → art/music pass (Jun 20–25) → ship before **Sun 2026-06-28**.
