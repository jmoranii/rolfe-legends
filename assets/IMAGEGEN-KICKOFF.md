# Mission: Give Hugo image-generation hands (GPT-Image automation → skill)

## Why (context)

I'm building **Rolfe Legends** — a personalized card game for my nephew Wyatt's 10th birthday (**Sun 2026-06-28**, hard deadline). The game is done; the art pass needs **17 stylized images generated from family reference photos** via OpenAI's image model (ChatGPT Images 2.0 / `gpt-image-2`). The complete prompt kit already exists at `~/code/rolfe-legends/assets/PROMPTS.md` — every prompt is final, with exact output filenames, aspect ratios (1024×1024 cards, 1024×1536 title), and which reference photo to attach.

Instead of me hand-generating these in the ChatGPT UI, your mission: **build Hugo an automated image-generation capability**, use it for this batch, and package it as a durable skill (this is the same playbook as the existing `suno` skill — see `.claude/skills/suno/SKILL.md` + `reference/suno-cli.md` for the pattern that worked).

I have a paid ChatGPT account. Reference photos are being collected separately — **don't block on them**; build and validate the pipeline first.

## Goal, in preference order

1. **Through my ChatGPT account/subscription** (no per-image cost) — research the current (June 2026) state: is there a sanctioned automated path? (Official CLI with ChatGPT sign-in? Codex-style account auth with included usage? Anything that exposes image generation against a Plus/Pro plan?) Browser automation of chatgpt.com is a last resort — fragile and ToS-gray; weigh honestly and tell me.
2. **Fallback: official OpenAI API** (`gpt-image-2`) — pay-per-image; a 17-image batch + generous re-rolls should be trivially cheap (verify current pricing). If this path wins, pause when you need me to create the API key / set up billing, and tell me exactly where to click.

**Research before building** — the OpenAI account-vs-API landscape changes fast; verify against current docs/web, don't trust training data.

## Hard requirements

- **Reference-image input is non-negotiable** — likeness from family photos is the entire point. Verify `gpt-image-2` image-edit/reference support + exact size params (1024×1024, 1024×1536) before committing to a path.
- **Privacy:** the reference photos are my family, including kids. They go **only to OpenAI official endpoints** (my account or my API key) — never to third-party proxies/resellers (cheap gpt-image-2 resellers exist; not for family photos).
- **Secrets discipline (vault rule, Catastrophic tier):** API keys live in a local env/config **outside the vault and outside Drive** (match how the audit LaunchAgent keeps machine-local config). Never committed, never in markdown, never echoed into transcripts.

## Deliverables

1. **A working CLI/script** — shape it like suno-cli usage: `<tool> "prompt..." --ref path/to/photo.jpg --size 1024x1024 -o assets/cards/sig_rocky.png`. Existing community CLI is fine if it's official-endpoint-only and maintained; small custom script is fine too.
2. **Validate end-to-end cheaply:** one harmless non-family test image; then one ref-photo test **using a photo of me (James)** to prove likeness conditioning works. Show me both before any family batch.
3. **Package as a skill:** `.claude/skills/gpt-image/SKILL.md` (trigger on "generate an image", "make the card art", "image of X from this photo", etc.) + a living reference doc (`reference/gpt-image-cli.md`, modeled on `reference/suno-cli.md`), update `reference/index.md` + `log.md`, and save a memory pointing at the new capability.
4. **Prep the Rolfe batch (dry-run only):** read `~/code/rolfe-legends/assets/PROMPTS.md`, map all 17 prompts → ready-to-run commands with correct ref-photo placeholder paths and output filenames into `~/code/rolfe-legends/assets/cards/` + `assets/ui/`. **Do NOT run the family batch** until I've dropped reference photos into a folder (I'll confirm the folder + which photo is whom) and I say go. The ⭐ test trio runs first: Grandma Rockie, Smidgen, title background — then I eyeball them in the game before the rest.

## Working agreements

- Keep me in the loop at the decision points: account-path vs API-path, anything that costs money, anything ToS-gray.
- Small test before batch, always.
- The game picks up art automatically (drop-in PNGs, emoji fallback) — no game-code changes needed or wanted in this session.
