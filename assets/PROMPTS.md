# Rolfe Legends — Art Generation Kit (ChatGPT Images 2.0)

Every prompt below is **fully standalone**: copy the whole gray block, paste it into ChatGPT, attach the listed reference photo, and generate. Then download the image, **rename it to the exact filename given**, and drop it into the folder shown. The game picks up art automatically — anything missing just shows its emoji, so art can land incrementally in any order.

**The two-tier rule (by design):** only Legends get painted portraits — family, pets, the llama, Dog Man, hero portraits, and the title screen (~17 images). Every common card stays emoji on purpose: it makes the legendary cards feel *legendary*.

## How to run the session

1. Work in **one sitting** if you can — and when an image comes out great, generate the next ones **in that same chat** ("Same painted style as above. Now: …"). Same-chat continuation is the single best consistency trick.
2. One prompt block per image. Attach the reference photo listed. If a result is off, re-roll in the same chat with a short correction ("less realistic, more storybook," "make her clearly recognizable from the photo").
3. Download → rename to the **exact filename** → drop into `assets/cards/` or `assets/ui/`.
4. Generate the **test trio first** (marked ⭐): Grandma Rockie, Smidgen, and the title background. Drop them in, look at the game, and tell Hugo if the style needs one adjustment — *before* generating the other fourteen.

**Privacy note:** reference photos (including the kids') are uploaded to OpenAI when attached. Established practice, your family, your call — just saying it out loud once.

## Reference-photo shot list

| # | Subject | What to grab | Likely source |
|---|---------|--------------|---------------|
| 1 | Kim (Grandma Rockie) ⭐ | Clear face, smiling | Your phone / family chat |
| 2 | Smidgen (her white lap dog) ⭐ | Any clear photo | Mom's phone — *ask for "recent pics of Smidgen!" — totally normal ask, no spoilers* |
| 3 | Sean (Grampa Flaj) | Clear face | Your phone |
| 4 | Jacob | Clear face | Family chat / Tory |
| 5 | Tory | Clear face | Your phone |
| 6 | Brody | Clear face (bonus: hat) | Your phone |
| 7 | Chelsea | Clear face | Your phone |
| 8 | Aaron | Clear face | Tory |
| 9 | Wyatt | Clear face | Tory |
| 10 | James (Coach) | Clear face | Any of your 16 website portraits |
| 11 | Rusty (Wyatt's dog) | Any clear photo | Tory — "pics of Rusty!" |
| 12 | Ruby (Brody's goldendoodle) | Any clear photo | Brody |
| 13 | Rig + Lily (Chelsea's dog + cat) | Any clear photos | Chelsea |
| 14 | The llama | Optional — generic llama works great | Tory, if a casual ask won't spoil |

Background and lighting in the photos don't matter — the painted style replaces everything except the face/likeness. Old photos are fine if they still look like the person.

---

## THE STYLE BLOCK

This exact paragraph appears in every prompt (already inlined below — nothing extra to do). For reference:

> Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions (slightly larger head, expressive face), bold clean silhouette, soft golden-hour farm lighting with warm rim light, rich saturated colors on a simple painterly farm-vignette background, matched art series for a children's trading-card game, centered subject framed chest-up, no text, no borders, no frames, no watermark.

---

## THE FAMILY (boss signature cards) — `assets/cards/`, square 1024×1024

### ⭐ 1. Grandma Rockie — `assets/cards/sig_rocky.png`
**Attach:** photo of Kim.

```
Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions (slightly larger head, expressive face), bold clean silhouette, soft golden-hour farm lighting with warm rim light, rich saturated colors on a simple painterly farm-vignette background, matched art series for a children's trading-card game, centered subject framed chest-up, no text, no borders, no frames, no watermark.

Subject: the grandmother from the attached reference photo, clearly recognizable. A sweet, kind grandma with a warm smile — but with an unmistakable final-boss glint in her eye. She holds two knitting needles crossed in front of her like a master swordsman. A faint golden aura glows around her. Cozy farmhouse porch behind her, fresh cookies cooling on a windowsill. She has clearly never lost at anything.
```

### 2. Grampa Flaj — `assets/cards/sig_flaj.png`
**Attach:** photo of Sean.

```
Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions (slightly larger head, expressive face), bold clean silhouette, soft golden-hour farm lighting with warm rim light, rich saturated colors on a simple painterly farm-vignette background, matched art series for a children's trading-card game, centered subject framed chest-up, no text, no borders, no frames, no watermark.

Subject: the grandfather from the attached reference photo, clearly recognizable. A tough, warm grandpa in well-worn overalls and a seed cap, arms crossed, with a proud "tough as old boots" grin. Behind him, a faithful old red tractor in golden evening light. Sturdy as a mountain, kind as can be.
```

### 3. Rusty (the goodest boy) — `assets/cards/sig_rusty.png`
**Attach:** photo of Rusty (Wyatt's dog).

```
Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions, bold clean silhouette, soft golden-hour farm lighting with warm rim light, rich saturated colors on a simple painterly farm-vignette background, matched art series for a children's trading-card game, centered subject, no text, no borders, no frames, no watermark.

Subject: the farm dog from the attached reference photo, clearly recognizable. The happiest, goofiest, most loyal farm dog alive — tongue out, tail mid-wag, sitting proudly in a golden field with a well-loved tennis ball at his paws. The undisputed goodest boy.
```

### 4. Aaron, Lil Tornado — `assets/cards/sig_aaron.png`
**Attach:** photo of Aaron.

```
Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions (slightly larger head, expressive face), bold clean silhouette, soft golden-hour farm lighting with warm rim light, rich saturated colors on a simple painterly farm-vignette background, matched art series for a children's trading-card game, centered subject framed chest-up, no text, no borders, no frames, no watermark.

Subject: the 8-year-old boy from the attached reference photo, clearly recognizable. A grinning little whirlwind of mischief — hair wind-blown, mid-laugh, with a tiny swirling tornado of leaves around him and three little yellow ducklings caught up in the fun, following him like a flock. Pure little-brother chaos energy.
```

### 5. Farmer Jacob — `assets/cards/sig_jacob.png`
**Attach:** photo of Jacob.

```
Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions (slightly larger head, expressive face), bold clean silhouette, soft golden-hour farm lighting with warm rim light, rich saturated colors on a simple painterly farm-vignette background, matched art series for a children's trading-card game, centered subject framed chest-up, no text, no borders, no frames, no watermark.

Subject: the dad from the attached reference photo, clearly recognizable. A steady, dependable farm dad in a work cap with a calm capable smile, a toolbelt on, holding up a fistful of zip ties like they are the answer to everything. A sturdy barn door stands behind him. The human embodiment of "I can fix that."
```

### 6. Mama Tory — `assets/cards/sig_tory.png`
**Attach:** photo of Tory.

```
Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions (slightly larger head, expressive face), bold clean silhouette, soft golden-hour farm lighting with warm rim light, rich saturated colors on a simple painterly farm-vignette background, matched art series for a children's trading-card game, centered subject framed chest-up, no text, no borders, no frames, no watermark.

Subject: the mom from the attached reference photo, clearly recognizable. A warm, proud farm mom in garden gloves with sunflowers behind her, one eyebrow raised in loving "be careful!" energy — while also clearly being the strongest person on the farm. Everyone around her stands a little taller.
```

### 7. Uncle Brody — `assets/cards/sig_brody.png`
**Attach:** photo of Brody (hat bonus points).

```
Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions (slightly larger head, expressive face), bold clean silhouette, soft golden-hour farm lighting with warm rim light, rich saturated colors on a simple painterly farm-vignette background, matched art series for a children's trading-card game, centered subject framed chest-up, no text, no borders, no frames, no watermark.

Subject: the uncle from the attached reference photo, clearly recognizable. Maximum fun-uncle energy: cowboy-hat swagger, mid-laugh, pointing straight at the viewer like he's about to say something legendary. Behind him, a pickup truck kicks up a little dust. Loud, fast, unstoppable.
```

### 8. Aunt Chelsea — `assets/cards/sig_chelsea.png`
**Attach:** photo of Chelsea.

```
Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions (slightly larger head, expressive face), bold clean silhouette, soft golden-hour farm lighting with warm rim light, rich saturated colors on a simple painterly farm-vignette background, matched art series for a children's trading-card game, centered subject framed chest-up, no text, no borders, no frames, no watermark.

Subject: the aunt from the attached reference photo, clearly recognizable. Serene and impossible to rattle: wrapped in a hand-knit blanket, holding a steaming mug of tea with both hands, eyes closed in a peaceful smile, soft healing glow around her. The cozy fortress in human form.
```

---

## THE PETS + LEGENDS — `assets/cards/`, square 1024×1024

*(Each pet prompt has a no-photo variant in case the photo is hard to get — swap the first Subject sentence.)*

### ⭐ 9. Smidgen — `assets/cards/grand_finale.png`
**Attach:** photo of Smidgen (Kim's little white lap dog).

```
Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions, bold clean silhouette, dramatic golden lighting with warm rim light, rich saturated colors on a simple painterly background, matched art series for a children's trading-card game, centered subject, no text, no borders, no frames, no watermark.

Subject: the tiny white lap dog from the attached reference photo, clearly recognizable. She sits perfectly upright and regal on a hand-knitted cushion like a throne, dead serious expression, while an ominous golden glow radiates from her and tiny crackles of lightning spark around her fluffy fur. Storm clouds gather faintly behind. She is six pounds. She is the most dangerous creature on the farm. The contrast IS the joke — play it completely straight.
```
*No-photo variant: "Subject: a tiny fluffy white lap dog (Maltese-like), clearly a beloved grandma's dog."*

### 10. Lily — `assets/cards/guard_cat.png`
**Attach:** photo of Lily (Chelsea's cat).

```
Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions, bold clean silhouette, soft window lighting with warm rim light, rich saturated colors on a simple painterly cozy-home background, matched art series for a children's trading-card game, centered subject, no text, no borders, no frames, no watermark.

Subject: the cat from the attached reference photo, clearly recognizable. Loafed neatly on a windowsill in golden light, mid slow-blink, radiating absolute judgment of everyone and everything. Sees all. Approves of little. On guard duty whether you asked or not.
```
*No-photo variant: "Subject: a dignified house cat."*

### 11. Rig — `assets/cards/big_hug.png`
**Attach:** photo of Rig (Chelsea's big dog).

```
Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions, bold clean silhouette, soft golden-hour lighting with warm rim light, rich saturated colors on a simple painterly farm-vignette background, matched art series for a children's trading-card game, subject filling most of the frame, no text, no borders, no frames, no watermark.

Subject: the very large dog from the attached reference photo, clearly recognizable. He is ENORMOUS and knows nothing about it — leaning slightly toward the viewer with a gentle, devoted expression that says a giant inescapable hug is seconds away. A tiny sparkle in his eye. Pure loving doom.
```
*No-photo variant: "Subject: a giant gentle farm dog, big as a couch."*

### 12. Ruby — `assets/cards/speed_demon.png`
**Attach:** photo of Ruby (Brody's goldendoodle).

```
Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions, bold clean silhouette, bright joyful lighting with warm rim light, rich saturated colors on a simple painterly farm-yard background with motion streaks, matched art series for a children's trading-card game, centered subject, no text, no borders, no frames, no watermark.

Subject: the goldendoodle from the attached reference photo, clearly recognizable. Captured at the absolute peak of the zoomies: ears flying, tongue out sideways, paws barely touching the ground, a curl of dust and motion-blur behind her. Joy at maximum velocity.
```
*No-photo variant: "Subject: a curly golden goldendoodle."*

### 13. THE ONE LLAMA — `assets/cards/llama.png`
**Attach:** photo of the actual farm llama if easy to get — otherwise generate without.

```
Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions, bold clean silhouette, golden-hour lighting with warm rim light and a faint cosmic shimmer, rich saturated colors on a simple painterly farm-pasture background, matched art series for a children's trading-card game, centered subject framed chest-up, no text, no borders, no frames, no watermark.

Subject: a majestic farm llama staring DIRECTLY at the viewer, perfectly still, with an expression of unsettling, ancient wisdom. Behind it, an otherwise completely ordinary pasture at sunset — but tiny faint stars glimmer around its head, as if it knows something about the universe that nobody else does. Deadpan. Mysterious. Magnificent.
```

### 14. Dog Man (the secret card) — `assets/cards/dog_man.png`
No reference photo. *(An original homage, not the book character.)*

```
Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions, bold clean silhouette, heroic sunset lighting with warm rim light, rich saturated colors on a simple painterly farm background, matched art series for a children's trading-card game, centered subject, no text, no borders, no frames, no watermark.

Subject: an entirely original heroic cartoon dog superhero — a sturdy, noble farm dog standing proudly on a barn roof at sunset, chest out, wearing a flowing red cape and a tiny gold star badge. Wind in his fur, eyes on the horizon. Part dog. All hero. (An original character — do not depict any existing copyrighted character.)
```

---

## HERO PORTRAITS — `assets/ui/`, square 1024×1024

### 15. Wyatt, the 10th Legend — `assets/ui/portrait_wyatt.png`
**Attach:** photo of Wyatt.

```
Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions (slightly larger head, expressive face), bold clean silhouette, golden-hour lighting with warm rim light, rich saturated colors on a simple painterly farm background, matched art series for a children's trading-card game, centered subject framed chest-up, no text, no borders, no frames, no watermark.

Subject: the 10-year-old boy from the attached reference photo, clearly recognizable. The hero of the story: a bright, determined, clever smile — the look of a kid who is already three moves ahead. He holds up a single glowing trading card like it's a legendary sword. Confident, kind, ready for anything.
```

### 16. Coach James — `assets/ui/portrait_coach.png`
**Attach:** photo of James.

```
Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions (slightly larger head, expressive face), bold clean silhouette, golden-hour lighting with warm rim light, rich saturated colors on a simple painterly farm background, matched art series for a children's trading-card game, centered subject framed chest-up, no text, no borders, no frames, no watermark.

Subject: the man from the attached reference photo, clearly recognizable. The world's most encouraging coach: baseball cap, whistle around his neck, clipboard tucked under one arm, giving a warm proud thumbs-up straight at the viewer. The uncle who believes in you completely.
```

---

## TITLE SCREEN — `assets/ui/`, vertical 2:3

### ⭐ 17. Rolfe at golden hour — `assets/ui/title_bg.png`
No reference photo needed.

```
Vertical image, 2:3 ratio, 1024×1536.
Warm hand-painted storybook gouache illustration, rich saturated colors, soft golden-hour light, matched art series for a children's trading-card game, no text, no borders, no frames, no watermark.

Scene: a beautiful small Iowa family farm at golden hour, painted storybook-style. A classic red barn with white trim, golden crop fields, a long dirt road leading toward a glowing sunset horizon, a windmill, scattered ducks and goats grazing — and in the middle distance, one llama standing perfectly still, watching. The upper third of the image is mostly warm open sky with soft clouds (a wooden sign will be overlaid there). Cozy, epic, like the cover of a beloved children's book.
```

---

## QA checklist (glance at each image before saving)

- **Recognizable?** The #1 test — would Wyatt say "that's Grandma!" instantly? If not: "make them more clearly recognizable from the photo, same painted style."
- **Style drift?** All should look like ONE artist painted them. If one goes 3D/photoreal/anime: re-roll with "hand-painted storybook gouache, matched series, same style as the others."
- **No text/frames** sneaked into the art (re-roll if so — the game draws its own frames).
- **Hands/needles/props** not mangled.
- **Kid-check:** nothing accidentally creepy (especially Smidgen's lightning — funny-ominous, not scary).
- Save as PNG with the **exact filename** — internal IDs don't always match names (Lily = `guard_cat.png`, Rig = `big_hug.png`, Ruby = `speed_demon.png`, Smidgen = `grand_finale.png`). The table above is the source of truth.
