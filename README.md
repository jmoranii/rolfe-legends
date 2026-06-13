# 🦙 Rolfe Legends

A personalized farm card-battler, built as a birthday gift for my 10-year-old nephew Wyatt.

**▶ Play: https://jmoranii.github.io/rolfe-legends/**

Wyatt loves strategy, Pokémon, and math, and lives on a farm in Rolfe, Iowa. So this is a deck-battling card game where his whole family is the boss ladder, the farm animals are the cards, and beating everyone on his 10th birthday crowns him **the 10th Legend of Rolfe**.

## What it is

A simplified, intuitive Hearthstone-style card battler designed for a kid who'd never played one:

- **8-boss campaign** — climb from the family dog up through the grandparents, each fight teaching one strategy concept (going wide, breaking walls, racing vs. healing, focus-fire…). Win each boss's signature card.
- **Build your own deck** — four preset archetypes plus a full deck builder with a live ⭐ scorecard (💥 Punch / 🛡️ Toughness / ✨ Tricks). Beat the game to unlock every card.
- **Couch Battle** — pass-and-play on one tablet, for Wyatt and his little brother.
- **Made to teach itself** — enemy-threat telegraphing, a prefight "scout report," a battle log, and a coach who explains one new idea at a time.

## How it was built

This is also a demonstration of building a complete, polished product with AI:

- **Code:** hand-built with [Claude Code](https://claude.com/claude-code) — a pure, dependency-free game engine (vanilla JS, no build step), separated from rendering so it's fully unit-testable.
- **Quality:** 500+ unit tests, a 300-game fuzzer, and an **AI-vs-AI self-play balance harness** that tunes the difficulty curve (the final boss is calibrated to a real challenge, not a pushover) — all green.
- **Art:** stylized storybook portraits of the real family, generated from reference photos via OpenAI's image model and dropped in over an emoji-fallback system.
- **Music:** an original soundtrack — title theme, battle music, a final-boss theme, deck-builder music, and a custom birthday anthem with Wyatt's name in it — generated with [Suno](https://suno.com).
- **Verification:** end-to-end tested with Playwright (real browser, real clicks).

## Tech

HTML5 + CSS3 + vanilla JavaScript (ES modules), zero dependencies, no build step, `localStorage` saves, procedural WebAudio sound effects, deployed on GitHub Pages. Designed tablet-first; installable to the home screen as a web app.

## Running locally

```bash
python3 -m http.server 8123    # then open http://localhost:8123
node test/test.mjs             # unit tests
node test/selfplay.mjs         # balance harness
```

---

*Made with love (and a lot of Claude Code) by Uncle James. The llama knows.* 🦙
