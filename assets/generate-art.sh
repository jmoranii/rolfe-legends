#!/bin/bash
# generate-art.sh — Rolfe Legends art batch via the `gpt-image` CLI.
#
# Prompts are VERBATIM from assets/PROMPTS.md (the source of truth).
# Reference photos: drop into assets/ref-photos/ named per ref-photos/README.md
# (kim.jpg, smidgen.jpg, sean.jpg, ... any of jpg/jpeg/png/webp works).
#
# Usage:
#   ./generate-art.sh list            # show all card ids + ref-photo status
#   ./generate-art.sh trio            # ⭐ test trio: sig_rocky grand_finale title_bg
#   ./generate-art.sh all             # everything (skips cards missing ref photos)
#   ./generate-art.sh sig_brody ...   # specific cards
#
#   DRY=1 ./generate-art.sh all      # print plan only, no spend
#   QUALITY=medium ./generate-art.sh trio   # cheaper re-roll experiments
#
# Cards whose ref photo is missing are SKIPPED with a note (never silently).
set -uo pipefail
cd "$(dirname "$0")/.."

REF_DIR="${REF_DIR:-assets/ref-photos}"
QUALITY="${QUALITY:-high}"
EXTRA=""
[ "${DRY:-0}" = "1" ] && EXTRA="--dry-run"

STYLE='Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions (slightly larger head, expressive face), bold clean silhouette, soft golden-hour farm lighting with warm rim light, rich saturated colors on a simple painterly farm-vignette background, matched art series for a children'\''s trading-card game, centered subject framed chest-up, no text, no borders, no frames, no watermark.'

find_ref() { # subject -> echoes path, rc 1 if absent
  local ext
  for ext in jpg jpeg png webp JPG JPEG PNG WEBP; do
    if [ -f "$REF_DIR/$1.$ext" ]; then echo "$REF_DIR/$1.$ext"; return 0; fi
  done
  return 1
}

GENERATED=()
SKIPPED=()
FAILED=()

gen() { # id out size ref_subject("-"=none, "subject?"=optional) prompt
  local id="$1" out="$2" size="$3" refsub="$4" prompt="$5"
  local refargs=() ref=""
  if [ "$refsub" != "-" ]; then
    local optional=0 subject="$refsub"
    case "$refsub" in *\?) optional=1; subject="${refsub%\?}";; esac
    if ref=$(find_ref "$subject"); then
      refargs=(--ref "$ref")
    elif [ "$optional" = "1" ]; then
      echo ">>> $id: no $subject photo found — generating without (designed to work either way)"
    else
      echo ">>> SKIP $id — missing reference photo: $REF_DIR/$subject.{jpg,png,webp}"
      SKIPPED+=("$id")
      return 0
    fi
  fi
  echo "=== $id → $out (${size}, quality=$QUALITY${ref:+, ref=$ref})"
  if gpt-image "$prompt" ${refargs[@]+"${refargs[@]}"} --size "$size" --quality "$QUALITY" -o "$out" $EXTRA; then
    GENERATED+=("$id")
  else
    rc=$?
    echo ">>> FAILED: $id (exit $rc) — continuing; retry this one separately" >&2
    FAILED+=("$id")
  fi
}

# ---------------------------------------------------------------- prompts ---

run_sig_rocky() { gen sig_rocky assets/cards/sig_rocky.png 1024x1024 kim "Square image, 1024×1024.
$STYLE

Subject: the grandmother from the attached reference photo, clearly recognizable. A sweet, kind grandma with a warm smile — but with an unmistakable final-boss glint in her eye. She holds two knitting needles crossed in front of her like a master swordsman. A faint golden aura glows around her. Cozy farmhouse porch behind her, fresh cookies cooling on a windowsill. She has clearly never lost at anything."; }

run_sig_flaj() { gen sig_flaj assets/cards/sig_flaj.png 1024x1024 sean "Square image, 1024×1024.
$STYLE

Subject: the grandfather from the attached reference photo, clearly recognizable. A tough, warm grandpa in well-worn overalls and a seed cap, arms crossed, with a proud \"tough as old boots\" grin. Behind him, a faithful old red tractor in golden evening light. Sturdy as a mountain, kind as can be."; }

run_sig_rusty() { gen sig_rusty assets/cards/sig_rusty.png 1024x1024 rusty "Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions, bold clean silhouette, soft golden-hour farm lighting with warm rim light, rich saturated colors on a simple painterly farm-vignette background, matched art series for a children's trading-card game, centered subject, no text, no borders, no frames, no watermark.

Subject: the farm dog from the attached reference photo, clearly recognizable. The happiest, goofiest, most loyal farm dog alive — tongue out, tail mid-wag, sitting proudly in a golden field with a well-loved tennis ball at his paws. The undisputed goodest boy."; }

run_sig_aaron() { gen sig_aaron assets/cards/sig_aaron.png 1024x1024 aaron "Square image, 1024×1024.
$STYLE

Subject: the 8-year-old boy from the attached reference photo, clearly recognizable. A grinning little whirlwind of mischief — hair wind-blown, mid-laugh, with a tiny swirling tornado of leaves around him and three little yellow ducklings caught up in the fun, following him like a flock. Pure little-brother chaos energy."; }

run_sig_jacob() { gen sig_jacob assets/cards/sig_jacob.png 1024x1024 jacob "Square image, 1024×1024.
$STYLE

Subject: the dad from the attached reference photo, clearly recognizable. A steady, dependable farm dad in a work cap with a calm capable smile, a toolbelt on, holding up a fistful of zip ties like they are the answer to everything. A sturdy barn door stands behind him. The human embodiment of \"I can fix that.\""; }

run_sig_tory() { gen sig_tory assets/cards/sig_tory.png 1024x1024 tory "Square image, 1024×1024.
$STYLE

Subject: the mom from the attached reference photo, clearly recognizable. A warm, proud farm mom in garden gloves with sunflowers behind her, one eyebrow raised in loving \"be careful!\" energy — while also clearly being the strongest person on the farm. Everyone around her stands a little taller."; }

run_sig_brody() { gen sig_brody assets/cards/sig_brody.png 1024x1024 brody "Square image, 1024×1024.
$STYLE

Subject: the uncle from the attached reference photo, clearly recognizable. Maximum fun-uncle energy: cowboy-hat swagger, mid-laugh, pointing straight at the viewer like he's about to say something legendary. Behind him, a pickup truck kicks up a little dust. Loud, fast, unstoppable."; }

run_sig_chelsea() { gen sig_chelsea assets/cards/sig_chelsea.png 1024x1024 chelsea "Square image, 1024×1024.
$STYLE

Subject: the aunt from the attached reference photo, clearly recognizable. Serene and impossible to rattle: wrapped in a hand-knit blanket, holding a steaming mug of tea with both hands, eyes closed in a peaceful smile, soft healing glow around her. The cozy fortress in human form."; }

run_grand_finale() { gen grand_finale assets/cards/grand_finale.png 1024x1024 smidgen "Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions, bold clean silhouette, dramatic golden lighting with warm rim light, rich saturated colors on a simple painterly background, matched art series for a children's trading-card game, centered subject, no text, no borders, no frames, no watermark.

Subject: the tiny white lap dog from the attached reference photo, clearly recognizable. She sits perfectly upright and regal on a hand-knitted cushion like a throne, dead serious expression, while an ominous golden glow radiates from her and tiny crackles of lightning spark around her fluffy fur. Storm clouds gather faintly behind. She is six pounds. She is the most dangerous creature on the farm. The contrast IS the joke — play it completely straight."; }

run_guard_cat() { gen guard_cat assets/cards/guard_cat.png 1024x1024 lily "Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions, bold clean silhouette, soft window lighting with warm rim light, rich saturated colors on a simple painterly cozy-home background, matched art series for a children's trading-card game, centered subject, no text, no borders, no frames, no watermark.

Subject: the cat from the attached reference photo, clearly recognizable. Loafed neatly on a windowsill in golden light, mid slow-blink, radiating absolute judgment of everyone and everything. Sees all. Approves of little. On guard duty whether you asked or not."; }

run_big_hug() { gen big_hug assets/cards/big_hug.png 1024x1024 rig "Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions, bold clean silhouette, soft golden-hour lighting with warm rim light, rich saturated colors on a simple painterly farm-vignette background, matched art series for a children's trading-card game, subject filling most of the frame, no text, no borders, no frames, no watermark.

Subject: the very large dog from the attached reference photo, clearly recognizable. He is ENORMOUS and knows nothing about it — leaning slightly toward the viewer with a gentle, devoted expression that says a giant inescapable hug is seconds away. A tiny sparkle in his eye. Pure loving doom."; }

run_speed_demon() { gen speed_demon assets/cards/speed_demon.png 1024x1024 ruby "Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions, bold clean silhouette, bright joyful lighting with warm rim light, rich saturated colors on a simple painterly farm-yard background with motion streaks, matched art series for a children's trading-card game, centered subject, no text, no borders, no frames, no watermark.

Subject: the goldendoodle from the attached reference photo, clearly recognizable. Captured at the absolute peak of the zoomies: ears flying, tongue out sideways, paws barely touching the ground, a curl of dust and motion-blur behind her. Joy at maximum velocity."; }

run_llama() { gen llama assets/cards/llama.png 1024x1024 "llama?" "Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions, bold clean silhouette, golden-hour lighting with warm rim light and a faint cosmic shimmer, rich saturated colors on a simple painterly farm-pasture background, matched art series for a children's trading-card game, centered subject framed chest-up, no text, no borders, no frames, no watermark.

Subject: a majestic farm llama staring DIRECTLY at the viewer, perfectly still, with an expression of unsettling, ancient wisdom. Behind it, an otherwise completely ordinary pasture at sunset — but tiny faint stars glimmer around its head, as if it knows something about the universe that nobody else does. Deadpan. Mysterious. Magnificent."; }

run_dog_man() { gen dog_man assets/cards/dog_man.png 1024x1024 - "Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions, bold clean silhouette, heroic sunset lighting with warm rim light, rich saturated colors on a simple painterly farm background, matched art series for a children's trading-card game, centered subject, no text, no borders, no frames, no watermark.

Subject: an entirely original heroic cartoon dog superhero — a sturdy, noble farm dog standing proudly on a barn roof at sunset, chest out, wearing a flowing red cape and a tiny gold star badge. Wind in his fur, eyes on the horizon. Part dog. All hero. (An original character — do not depict any existing copyrighted character.)"; }

run_portrait_wyatt() { gen portrait_wyatt assets/ui/portrait_wyatt.png 1024x1024 wyatt "Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions (slightly larger head, expressive face), bold clean silhouette, golden-hour lighting with warm rim light, rich saturated colors on a simple painterly farm background, matched art series for a children's trading-card game, centered subject framed chest-up, no text, no borders, no frames, no watermark.

Subject: the 10-year-old boy from the attached reference photo, clearly recognizable. The hero of the story: a bright, determined, clever smile — the look of a kid who is already three moves ahead. He holds up a single glowing trading card like it's a legendary sword. Confident, kind, ready for anything."; }

run_portrait_coach() { gen portrait_coach assets/ui/portrait_coach.png 1024x1024 james "Square image, 1024×1024.
Warm hand-painted storybook gouache illustration, friendly caricature with gently exaggerated proportions (slightly larger head, expressive face), bold clean silhouette, golden-hour lighting with warm rim light, rich saturated colors on a simple painterly farm background, matched art series for a children's trading-card game, centered subject framed chest-up, no text, no borders, no frames, no watermark.

Subject: the man from the attached reference photo, clearly recognizable. The world's most encouraging coach: baseball cap, whistle around his neck, clipboard tucked under one arm, giving a warm proud thumbs-up straight at the viewer. The uncle who believes in you completely."; }

run_title_bg() { gen title_bg assets/ui/title_bg.png 1024x1536 - "Vertical image, 2:3 ratio, 1024×1536.
Warm hand-painted storybook gouache illustration, rich saturated colors, soft golden-hour light, matched art series for a children's trading-card game, no text, no borders, no frames, no watermark.

Scene: a beautiful small Iowa family farm at golden hour, painted storybook-style. A classic red barn with white trim, golden crop fields, a long dirt road leading toward a glowing sunset horizon, a windmill, scattered ducks and goats grazing — and in the middle distance, one llama standing perfectly still, watching. The upper third of the image is mostly warm open sky with soft clouds (a wooden sign will be overlaid there). Cozy, epic, like the cover of a beloved children's book."; }

# --------------------------------------------------- battle backgrounds ---
# Per-boss battlegrounds that echo each legend card's "place," painted as a
# quiet muted stage to sit BEHIND the battle UI (calm lower-center, edge
# vignette, unpopulated). Landscape 1536x1024. Output: assets/backgrounds/.
# The backend session wires these in (see assets/BATTLEGROUNDS-KICKOFF.md).

BG_STYLE='Warm hand-painted storybook gouache illustration in the same children'\''s trading-card art series, soft golden-hour light, rich but gently muted and slightly desaturated colors, soft-focus depth-of-field, an open and calm lower-center foreground (simple painterly ground where game UI will sit), visual detail kept to the upper area and edges, a soft darker vignette around all edges, painted to sit quietly BEHIND a game interface, an unpopulated scene with no people and no foreground animals, no text, no borders, no frames, no watermark.'

run_bg_rusty() { gen bg_rusty assets/backgrounds/bg_rusty.png 1536x1024 - "Landscape image, 1536×1024.
$BG_STYLE

Scene: a sunny open golden farm field and pasture, a classic red barn soft-focus in the distance, tall grass and a weathered wooden fence line, warm and welcoming early-campaign light. The lower-center is calm open field."; }

run_bg_aaron() { gen bg_aaron assets/backgrounds/bg_aaron.png 1536x1024 - "Landscape image, 1536×1024.
$BG_STYLE

Scene: a breezy autumn farmyard, a few golden leaves drifting through the air, a windmill and barn softly out of focus in the distance, scattered hay, playful warm light. The lower-center is calm open yard."; }

run_bg_jacob() { gen bg_jacob assets/backgrounds/bg_jacob.png 1536x1024 - "Landscape image, 1536×1024.
$BG_STYLE

Scene: the yard in front of a sturdy weathered barn with big wooden doors, a workbench and hanging tools softly blurred off to one side, warm sawdust-gold light, a dependable workshop feel. The lower-center is calm open ground."; }

run_bg_tory() { gen bg_tory assets/backgrounds/bg_tory.png 1536x1024 - "Landscape image, 1536×1024.
$BG_STYLE

Scene: a lush sunflower and vegetable garden at golden hour, rows of sunflowers soft-focus behind a low garden fence, a farmhouse hinted in the distance, warm proud light. The lower-center is calm open garden path."; }

run_bg_brody() { gen bg_brody assets/backgrounds/bg_brody.png 1536x1024 - "Landscape image, 1536×1024.
$BG_STYLE

Scene: a wide dusty farm driveway and open field under a big open sky, a pickup truck softly blurred far in the background kicking faint dust, energetic warm late-afternoon light. The lower-center is calm open dirt drive."; }

run_bg_chelsea() { gen bg_chelsea assets/backgrounds/bg_chelsea.png 1536x1024 - "Landscape image, 1536×1024.
$BG_STYLE

Scene: a cozy warm farmhouse interior, a knitted-blanket armchair and a softly glowing hearth out of focus, a steaming kettle hinted on a side table, gentle amber lamplight, the coziest fortress. The lower-center is calm open wooden floor."; }

run_bg_flaj() { gen bg_flaj assets/backgrounds/bg_flaj.png 1536x1024 - "Landscape image, 1536×1024.
$BG_STYLE

Scene: an old red tractor and a weathered equipment shed in a golden evening field, soft-focus rolling farmland behind, sturdy and warm with long shadows. The lower-center is calm open ground."; }

run_bg_rocky() { gen bg_rocky assets/backgrounds/bg_rocky.png 1536x1024 - "Landscape image, 1536×1024.
$BG_STYLE

Scene: a cozy farmhouse front porch at dramatic golden hour, a porch railing and rocking chair softly out of focus to one side, warm lamplight glowing from the windows, a faint golden shimmer in the air, the climactic final-showdown stage. The lower-center is calm open porch floorboards."; }

# Screen backgrounds (full-screen, not per-boss). Portrait, painted to sit
# behind a centered column of translucent UI panels.
run_bg_map() { gen bg_map assets/backgrounds/bg_map.png 1024x1536 - "Vertical image, 1024×1536.
Warm hand-painted storybook gouache illustration in the same children's trading-card art series, soft golden-hour light, gently muted and slightly desaturated colors, soft-focus, low-contrast and calm so translucent UI panels can sit over the vertical center, a soft vignette at the edges, unpopulated, no text, no borders, no frames, no watermark.

Scene: a long dirt path winding through golden Iowa farm fields, seen from low at the bottom and receding upward into the distance, climbing toward a radiant warm sunrise glowing on the horizon at the very top like a destination to reach. A red barn, a windmill, wooden fences and soft open fields line the path. Hopeful and epic but cozy, a journey toward greatness. Keep the vertical center band soft and uncluttered for overlaid UI."; }

run_bg_cards() { gen bg_cards assets/backgrounds/bg_cards.png 1024x1536 - "Vertical image, 1024×1536.
Warm hand-painted storybook gouache illustration in the same children's trading-card art series, soft golden-hour window light, gently muted and low-contrast, a soft darker vignette at the edges, calm and simple, no people, NO playing cards, NO trading cards, NO illustrated cards anywhere in the image, no text, no borders, no frames, no watermark.

Scene: a cozy warm wooden farmhouse tabletop of smooth aged planks, viewed from slightly above, soft window light, a faint knitted placemat and a small pitcher of wildflowers pushed to the far edges. The entire center of the table is completely empty, clear, bare wood with nothing resting on it. Just a quiet warm surface."; }

# ------------------------------------------------------------------ driver ---

ALL_IDS="sig_rocky sig_flaj sig_rusty sig_aaron sig_jacob sig_tory sig_brody sig_chelsea grand_finale guard_cat big_hug speed_demon llama dog_man portrait_wyatt portrait_coach title_bg"
BG_IDS="bg_rusty bg_aaron bg_jacob bg_tory bg_brody bg_chelsea bg_flaj bg_rocky"
SCREEN_IDS="bg_map bg_cards"
TRIO="sig_rocky grand_finale title_bg"

ref_for() {
  case "$1" in
    sig_rocky) echo kim;; sig_flaj) echo sean;; sig_rusty) echo rusty;;
    sig_aaron) echo aaron;; sig_jacob) echo jacob;; sig_tory) echo tory;;
    sig_brody) echo brody;; sig_chelsea) echo chelsea;; grand_finale) echo smidgen;;
    guard_cat) echo lily;; big_hug) echo rig;; speed_demon) echo ruby;;
    llama) echo "llama (optional)";; dog_man) echo "(none)";;
    portrait_wyatt) echo wyatt;; portrait_coach) echo james;; title_bg) echo "(none)";;
  esac
}

list_cards() {
  echo "card id          ref photo            status"
  echo "---------------  -------------------  ------"
  for id in $ALL_IDS; do
    local_ref=$(ref_for "$id")
    subject="${local_ref%% *}"
    status="ready (no ref needed)"
    if [ "$local_ref" != "(none)" ]; then
      if find_ref "$subject" >/dev/null; then
        status="ready"
      elif [[ "$local_ref" == *optional* ]]; then
        status="ready (will gen without photo)"
      else
        status="WAITING for $REF_DIR/$subject.*"
      fi
    fi
    printf "%-16s %-20s %s\n" "$id" "$local_ref" "$status"
  done
}

case "${1:-list}" in
  list) list_cards ;;
  trio) for id in $TRIO; do "run_$id"; done ;;
  all)  for id in $ALL_IDS; do "run_$id"; done ;;
  bg)   for id in $BG_IDS; do "run_$id"; done ;;
  screens) for id in $SCREEN_IDS; do "run_$id"; done ;;
  *)    for id in "$@"; do
          case " $ALL_IDS $BG_IDS $SCREEN_IDS " in
            *" $id "*) "run_$id" ;;
            *) echo "unknown id: $id (try: ./generate-art.sh list)"; exit 2 ;;
          esac
        done ;;
esac

echo
[ ${#GENERATED[@]} -gt 0 ] 2>/dev/null && echo "generated: ${GENERATED[*]}"
[ ${#SKIPPED[@]} -gt 0 ] 2>/dev/null && echo "skipped (missing refs): ${SKIPPED[*]}"
[ ${#FAILED[@]} -gt 0 ] 2>/dev/null && echo "failed: ${FAILED[*]}"
exit 0
