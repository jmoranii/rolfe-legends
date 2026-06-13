// Rolfe Legends — card data, boss decks, presets, unlock schedule, coach lines.
// Pure data. See DESIGN.md for the locked design this encodes.

// ---- Effect vocabulary ----------------------------------------------------
// Effects: {kind, n, target}
//   kinds: damage | heal | draw | buff{a,h} | summon{token,count} | bounce
//        | debuffAtkAll | tempAtkAll | ignoreGuard
//   targets: pick-critter-enemy | any-enemy | all-enemy-critters | enemy-hero
//          | self-hero | pick-ally | all-allies | other-allies | random-ally

export const TOKENS = {
  chick:    { id: 'chick',    name: 'Chick',    type: 'critter', cost: 0, atk: 1, hp: 1, emoji: '🐤', flavor: 'Cheep cheep.', token: true },
  duckling: { id: 'duckling', name: 'Duckling', type: 'critter', cost: 0, atk: 1, hp: 1, emoji: '🐥', flavor: 'Follows you everywhere.', token: true },
};

const C = {}; // all card defs by id
function def(card) { C[card.id] = card; return card; }

// ---- Wyatt's pool: starter ------------------------------------------------
def({ id: 'barn_cat',     name: 'Barn Cat',          type: 'critter', cost: 1, atk: 2, hp: 1, emoji: '🐈', flavor: 'Employee of the month, every month.' });
def({ id: 'billy_goat',   name: 'Billy the Goat',    type: 'critter', cost: 2, atk: 3, hp: 2, emoji: '🐐', flavor: 'Will eat your homework AND your fence.' });
def({ id: 'shep',         name: 'Shep the Sheepdog', type: 'critter', cost: 2, atk: 2, hp: 3, guard: true, emoji: '🐕‍🦺', flavor: 'Nobody gets past Shep.' });
def({ id: 'striker',      name: 'Soccer Striker',    type: 'critter', cost: 3, atk: 3, hp: 2, fast: true, emoji: '⚽', flavor: 'Top corner. Every time.' });
def({ id: 'mama_hen',     name: 'Mama Hen',          type: 'critter', cost: 3, atk: 2, hp: 4, bc: { kind: 'summon', token: 'chick', count: 1 }, emoji: '🐔', flavor: 'Everyone counts as her chick.' });
def({ id: 'prize_pig',    name: 'Prize Pig',         type: 'critter', cost: 4, atk: 4, hp: 4, emoji: '🐖', flavor: 'Blue ribbon. Knows it.' });
def({ id: 'slide_tackle', name: 'Slide Tackle',      type: 'trick',   cost: 2, fx: { kind: 'damage', n: 3, target: 'pick-critter-enemy' }, emoji: '🥅', flavor: 'Clean. Mostly.' });
def({ id: 'ddg',          name: 'Duck, Duck, GOOSE!',type: 'trick',   cost: 3, fx: { kind: 'damage', n: 1, target: 'all-enemy-critters' }, emoji: '🪿', flavor: 'The goose chooses violence.' });
def({ id: 'blessing',     name: 'Blessing',          type: 'trick',   cost: 1, fx: { kind: 'heal', n: 4, target: 'self-hero' }, emoji: '🕊️', flavor: 'A little grace goes a long way.' });

// ---- Wyatt's pool: unlockables --------------------------------------------
def({ id: 'sprinter',      name: 'The Sprinter',   type: 'critter', cost: 1, atk: 2, hp: 1, fast: true, emoji: '🏃', flavor: 'Started running and simply did not stop.' });
def({ id: 'goat_stampede', name: 'Goat Stampede',  type: 'trick',   cost: 4, fx: { kind: 'damage', n: 2, target: 'all-enemy-critters' }, emoji: '🐐', flavor: 'You hear them before you see them.' });
def({ id: 'nutmeg',        name: 'Nutmeg',         type: 'trick',   cost: 1, fx: { kind: 'ignoreGuard' }, emoji: '🥎', flavor: 'Right between the legs. GOAL.' });
def({ id: 'math_whiz',     name: 'Math Whiz',      type: 'critter', cost: 2, atk: 2, hp: 3, bc: { kind: 'draw', n: 1 }, emoji: '🧮', flavor: 'Already calculated how this ends.' });
def({ id: 'magic_vanish',  name: 'Magic Vanish',   type: 'trick',   cost: 2, fx: { kind: 'bounce', target: 'pick-critter-enemy' }, emoji: '🎩', flavor: 'Nothing up my sleeve…' });
def({ id: 'trickster',     name: 'The Trickster',  type: 'critter', cost: 3, atk: 3, hp: 3, bc: { kind: 'draw', n: 1 }, emoji: '🪄', flavor: "Pulls one from his sleeve. Don't ask which sleeve." });
def({ id: 'maestro',       name: 'Piano Maestro',  type: 'critter', cost: 4, atk: 2, hp: 5, sot: { kind: 'buff', a: 1, h: 1, target: 'random-ally' }, emoji: '🎹', flavor: 'Every turn, the song builds.' });
def({ id: 'llama',         name: 'THE ONE LLAMA',  type: 'critter', cost: 5, atk: 6, hp: 6, legendary: true, bc: { kind: 'debuffAtkAll', n: 1 }, emoji: '🦙', flavor: 'The Llama says nothing. The Llama knows.' });
def({ id: 'dog_man',       name: 'Dog Man',        type: 'critter', cost: 3, atk: 3, hp: 3, legendary: true, secret: true, guard: true, fast: true, emoji: '🦸', flavor: 'Part dog. Part man. All hero.' });

// ---- Boss signature cards (Legendary, won on victory) ----------------------
def({ id: 'sig_rusty',   name: 'Rusty',             type: 'critter', cost: 2, atk: 2, hp: 3, legendary: true, guard: true, emoji: '🐕', flavor: 'Good boy. GREAT boy.' });
def({ id: 'sig_aaron',   name: 'Aaron, Lil Tornado',type: 'critter', cost: 2, atk: 2, hp: 2, legendary: true, bc: { kind: 'summon', token: 'duckling', count: 1 }, emoji: '🌪️', flavor: 'Has never once sat still.' });
def({ id: 'sig_jacob',   name: 'Dad',               type: 'critter', cost: 3, atk: 2, hp: 4, legendary: true, guard: true, bc: { kind: 'buff', a: 1, h: 1, target: 'pick-ally-other' }, emoji: '🧑‍🌾', flavor: 'Can fix anything with zip ties.' });
def({ id: 'sig_tory',    name: 'Mom',               type: 'critter', cost: 4, atk: 3, hp: 4, legendary: true, aura: { a: 1 }, emoji: '👩‍🌾', flavor: "Says 'be careful!' Makes you stronger anyway." });
def({ id: 'sig_brody',   name: 'Uncle Brody',       type: 'critter', cost: 4, atk: 5, hp: 2, legendary: true, fast: true, emoji: '🤠', flavor: 'REAL TALK.' });
def({ id: 'sig_chelsea', name: 'Aunt Chelsea',      type: 'critter', cost: 3, atk: 2, hp: 3, legendary: true, bc: { kind: 'heal', n: 4, target: 'self-hero' }, emoji: '🤗', flavor: 'Hugs that heal.' });
def({ id: 'sig_flaj',    name: 'Grampa Flaj',       type: 'critter', cost: 5, atk: 5, hp: 6, legendary: true, bc: { kind: 'buff', a: 0, h: 2, target: 'other-allies' }, emoji: '👴', flavor: 'Tough as old boots.' });
def({ id: 'sig_rocky',   name: 'Grandma Rockie',     type: 'critter', cost: 5, atk: 4, hp: 5, legendary: true, bc: { kind: 'damage', n: 2, target: 'all-enemy-critters' }, emoji: '👵', flavor: 'Final boss energy. Bakes cookies.' });

// ---- Boss-only cards -------------------------------------------------------
// Rusty
def({ id: 'puppy',        name: 'Puppy',         type: 'critter', cost: 1, atk: 1, hp: 1, emoji: '🐶', flavor: 'A menace to socks everywhere.' });
def({ id: 'big_puppy',    name: 'Big Puppy',     type: 'critter', cost: 2, atk: 2, hp: 2, emoji: '🐩', flavor: 'Still thinks he fits on your lap.' });
def({ id: 'loyal_friend', name: 'Loyal Friend',  type: 'critter', cost: 3, atk: 2, hp: 3, emoji: '🦴', flavor: 'Never misses a welcome-home.' });
// Aaron
def({ id: 'duckling_c',   name: 'Duckling',      type: 'critter', cost: 1, atk: 1, hp: 1, emoji: '🐥', flavor: 'Follows you everywhere.' });
def({ id: 'pond_pal',     name: 'Pond Pal',      type: 'critter', cost: 1, atk: 1, hp: 2, emoji: '🐸', flavor: 'Croaks at exactly the wrong moment.' });
def({ id: 'lil_goat',     name: 'Lil Goat',      type: 'critter', cost: 2, atk: 2, hp: 2, emoji: '🐐', flavor: 'Practicing headbutts on the fence.' });
def({ id: 'big_duck',     name: 'Big Duck',      type: 'critter', cost: 3, atk: 3, hp: 3, emoji: '🦆', flavor: 'The pond is HIS.' });
def({ id: 'duck_flock',   name: 'Duck Flock',    type: 'trick',   cost: 3, fx: { kind: 'summon', token: 'duckling', count: 3 }, emoji: '🦆', flavor: 'They arrive all at once.' });
def({ id: 'quack_attack', name: 'QUACK ATTACK!', type: 'trick',   cost: 2, fx: { kind: 'tempAtkAll', n: 1 }, emoji: '📣', flavor: 'It is deafening.' });
// Jacob
def({ id: 'fence',        name: 'Fence',         type: 'critter', cost: 1, atk: 0, hp: 3, guard: true, emoji: '🚧', flavor: 'Freshly fixed. Again.' });
def({ id: 'barn_door',    name: 'Barn Door',     type: 'critter', cost: 3, atk: 1, hp: 6, guard: true, emoji: '🚪', flavor: 'Were you raised in a barn? Close it.' });
def({ id: 'old_reliable', name: 'Old Reliable',  type: 'critter', cost: 4, atk: 3, hp: 5, emoji: '🔨', flavor: 'Three owners. Zero complaints.' });
def({ id: 'zip_ties',     name: 'Zip Ties',      type: 'trick',   cost: 2, fx: { kind: 'buff', a: 2, h: 2, target: 'pick-ally' }, emoji: '🔗', flavor: 'The fix for 90% of farm problems.' });
// Tory
def({ id: 'garden_helper', name: 'Garden Helper', type: 'critter', cost: 1, atk: 1, hp: 2, emoji: '🌻', flavor: 'Waters everything, including the dog.' });
def({ id: 'pep_talk',      name: 'Pep Talk',      type: 'trick',   cost: 1, fx: { kind: 'buff', a: 1, h: 1, target: 'pick-ally' }, emoji: '💬', flavor: 'You can DO this.' });
def({ id: 'casserole',     name: 'Casserole',     type: 'trick',   cost: 2, fx: { kind: 'heal', n: 3, target: 'self-hero' }, emoji: '🥘', flavor: 'Fixes more than hunger.' });
def({ id: 'sunday_dinner', name: 'Sunday Dinner', type: 'trick',   cost: 4, fx: { kind: 'buff', a: 1, h: 1, target: 'all-allies' }, emoji: '🍗', flavor: 'Everybody leaves stronger.' });
// Brody
def({ id: 'wild_card',    name: 'Wild Card',    type: 'critter', cost: 1, atk: 2, hp: 1, emoji: '🃏', flavor: 'Nobody knows. Not even him.' });
def({ id: 'real_talk',    name: 'REAL TALK',    type: 'trick',   cost: 2, fx: { kind: 'damage', n: 3, target: 'any-enemy' }, emoji: '💥', flavor: 'Delivered at full volume.' });
def({ id: 'rune_sword',   name: 'Rune Sword',   type: 'trick',   cost: 2, fx: { kind: 'buff', a: 2, h: 0, target: 'pick-ally' }, emoji: '⚔️', flavor: 'Earned through hard work. In a video game.' });
def({ id: 'speed_demon',  name: 'Ruby',         type: 'critter', cost: 3, atk: 3, hp: 2, fast: true, emoji: '🐩', flavor: "Brody's goldendoodle. Zoomies at maximum volume." });
def({ id: 'loud_music',   name: 'Loud Music',   type: 'trick',   cost: 3, fx: { kind: 'damage', n: 2, target: 'enemy-hero', draw: 1 }, emoji: '🔊', flavor: 'You feel it in your teeth.' });
def({ id: 'big_rig',      name: 'Monster Truck', type: 'critter', cost: 4, atk: 4, hp: 3, fast: true, emoji: '🛻', flavor: 'Has never once parked between the lines.' });
// Chelsea
def({ id: 'tea_time',     name: 'Tea Time',     type: 'trick',   cost: 1, fx: { kind: 'heal', n: 2, target: 'self-hero', draw: 1 }, emoji: '🍵', flavor: 'Sit. Breathe. Sip.' });
def({ id: 'cozy_blanket', name: 'Cozy Blanket', type: 'trick',   cost: 2, fx: { kind: 'heal', n: 4, target: 'self-hero' }, emoji: '🧶', flavor: 'Handmade. Weaponized comfort.' });
def({ id: 'gentle_goat',  name: 'Gentle Goat',  type: 'critter', cost: 2, atk: 1, hp: 4, guard: true, emoji: '🐐', flavor: 'The one goat that never headbutts.' });
def({ id: 'time_out',     name: 'Time Out',     type: 'trick',   cost: 3, fx: { kind: 'bounce', target: 'pick-critter-enemy' }, emoji: '⏰', flavor: 'Go think about what you did.' });
def({ id: 'guard_cat',    name: 'Lily',         type: 'critter', cost: 3, atk: 2, hp: 5, guard: true, emoji: '🐈‍⬛', flavor: "Chelsea's cat. Sees everything. Judges everything." });
def({ id: 'big_hug',      name: 'Rig',          type: 'critter', cost: 5, atk: 4, hp: 6, emoji: '🦮', flavor: "Chelsea's VERY big dog. Hugs you whether you like it or not." });
// Grampa Flaj
def({ id: 'barn_owl',      name: 'Barn Owl',      type: 'critter', cost: 1, atk: 1, hp: 2, emoji: '🦉', flavor: 'Saw you sneak that cookie.' });
def({ id: 'haybale',       name: 'Haybale',       type: 'critter', cost: 2, atk: 0, hp: 4, guard: true, emoji: '🌾', flavor: 'Surprisingly hard to move.' });
def({ id: 'stubborn_mule', name: 'Stubborn Mule', type: 'critter', cost: 3, atk: 2, hp: 5, guard: true, emoji: '🫏', flavor: 'Has decided. Will not be re-deciding.' });
def({ id: 'iron_skillet',  name: 'Iron Skillet',  type: 'trick',   cost: 2, fx: { kind: 'buff', a: 0, h: 3, target: 'pick-ally' }, emoji: '🍳', flavor: 'Older than your parents. Works better too.' });
def({ id: 'prize_bull',    name: 'Prize Bull',    type: 'critter', cost: 4, atk: 5, hp: 4, emoji: '🐂', flavor: 'The fence is a suggestion.' });
def({ id: 'old_tractor',   name: 'Old Tractor',   type: 'critter', cost: 5, atk: 4, hp: 7, emoji: '🚜', flavor: 'Starts on the third try. Every time. For 40 years.' });
// Grandma Rockie
def({ id: 'knitting_needles', name: 'Knitting Needles', type: 'trick',   cost: 1, fx: { kind: 'damage', n: 2, target: 'pick-critter-enemy' }, emoji: '🪡', flavor: 'Click. Click. Doom.' });
def({ id: 'yarn_beast',       name: 'Yarn Beast',       type: 'critter', cost: 4, atk: 4, hp: 4, emoji: '🧶', flavor: 'It was a sweater. It evolved.' });
def({ id: 'garden_gnome',     name: 'Garden Gnome',     type: 'critter', cost: 2, atk: 2, hp: 3, emoji: '🧙', flavor: 'Moves when you blink.' });
def({ id: 'wise_owl',         name: 'Wise Owl',         type: 'critter', cost: 2, atk: 1, hp: 3, emoji: '🦉', flavor: 'Knows what you did. Knows what you WILL do.' });
def({ id: 'cookie_batch',     name: 'Cookie Batch',     type: 'trick',   cost: 2, fx: { kind: 'heal', n: 4, target: 'self-hero' }, emoji: '🍪', flavor: 'Fresh from the oven. Non-negotiable.' });
def({ id: 'secret_recipe',    name: 'Secret Recipe',    type: 'trick',   cost: 3, fx: { kind: 'buff', a: 1, h: 1, target: 'all-allies' }, emoji: '📜', flavor: 'Written nowhere. Remembered perfectly.' });
def({ id: 'watch_dog',        name: 'Watch Dog',        type: 'critter', cost: 3, atk: 3, hp: 3, guard: true, emoji: '🐕‍🦺', flavor: 'Grandma trained him. Be afraid.' });
def({ id: 'rolling_pin',      name: 'Rolling Pin',      type: 'trick',   cost: 4, fx: { kind: 'damage', n: 2, target: 'all-enemy-critters' }, emoji: '🥖', flavor: 'For dough. Mostly.' });
def({ id: 'grand_finale',     name: 'Smidgen',          type: 'critter', cost: 5, atk: 5, hp: 5, fast: true, legendary: true, emoji: '🐾', flavor: "Rockie's little white lap dog. Six pounds of pure doom." });

export const CARDS = C;

// ---- Decks -----------------------------------------------------------------
export const STARTER_DECK = [
  'barn_cat', 'barn_cat', 'billy_goat', 'billy_goat', 'shep', 'striker', 'striker',
  'mama_hen', 'prize_pig', 'slide_tackle', 'ddg', 'blessing',
];

// Boss decks may break the 2-copy player rule (Rusty's all-puppy deck is the joke).
export const BOSSES = [
  {
    id: 'rusty', name: 'Rusty', title: 'The Goodest Boy', emoji: '🐕', hp: 12,
    deck: ['puppy', 'puppy', 'puppy', 'puppy', 'puppy', 'big_puppy', 'big_puppy', 'big_puppy', 'big_puppy', 'loyal_friend', 'loyal_friend', 'loyal_friend'],
    persona: { aggression: 0.2, tradeCare: 0.0, healAt: 0, smart: 0, neverLethal: true, curve: 'wide' },
    intro: 'Rusty wags. Rusty is ready. Rusty has no idea what a card game is.',
    tip: 'Drag a critter onto the field, then tap it to attack. Rusty mostly wants belly rubs.',
    lossTip: 'Play a critter every turn if you can — an empty field means Rusty gets to chew on YOU.',
    reward: ['sig_rusty', 'sprinter'],
  },
  {
    id: 'aaron', name: 'Aaron', title: 'The Lil Tornado', emoji: '🌪️', hp: 20,
    deck: ['duckling_c', 'duckling_c', 'pond_pal', 'pond_pal', 'lil_goat', 'lil_goat', 'duck_flock', 'duck_flock', 'quack_attack', 'quack_attack', 'big_duck', 'sig_aaron'],
    persona: { aggression: 0.85, tradeCare: 0.2, healAt: 0, smart: 0, curve: 'wide' },
    intro: 'Your little brother cracks his knuckles. The ducks assemble behind him.',
    tip: 'Little brothers come in waves. Duck, Duck, GOOSE! hits ALL his critters at once.',
    lossTip: 'When he floods the field with ducklings, that is EXACTLY when Duck, Duck, GOOSE! wins you the game.',
    reward: ['sig_aaron', 'goat_stampede', 'nutmeg'],
    unlocks: { deckBuilder: true, presets: ['farm_friends'] },
  },
  {
    id: 'jacob', name: 'Dad', title: 'The Wall', emoji: '🧑‍🌾', hp: 16,
    deck: ['fence', 'fence', 'shep', 'shep', 'barn_door', 'zip_ties', 'old_reliable', 'old_reliable', 'garden_helper', 'garden_helper', 'prize_pig', 'sig_jacob'],
    persona: { aggression: 0.35, tradeCare: 0.7, healAt: 0, smart: 0, curve: 'mid' },
    intro: 'Dad nods once, and builds a wall of fences, doors, and pure patience.',
    tip: 'Your dad guards everything. Nutmeg slips right past Guards — very soccer, very sneaky.',
    lossTip: 'You cannot punch through a Barn Door with ducklings. Go around Guards (Nutmeg!) or bring bigger critters.',
    reward: ['sig_jacob', 'math_whiz'],
  },
  {
    id: 'tory', name: 'Mom', title: 'The Team Mom', emoji: '👩‍🌾', hp: 20,
    deck: ['garden_helper', 'garden_helper', 'pep_talk', 'pep_talk', 'lil_goat', 'lil_goat', 'mama_hen', 'mama_hen', 'sunday_dinner', 'sunday_dinner', 'prize_pig', 'sig_tory'],
    persona: { aggression: 0.5, tradeCare: 0.5, healAt: 8, smart: 0, curve: 'mid' },
    intro: 'Mom smiles sweetly. Her critters are doing push-ups.',
    tip: 'Your mom makes everyone around her stronger. Take out the helpers before the muscle.',
    lossTip: 'Her little critters become BIG critters if you let them sit there. Slide Tackle the buffed ones early.',
    reward: ['sig_tory', 'magic_vanish'],
  },
  {
    id: 'brody', name: 'Uncle Brody', title: 'The Hurricane', emoji: '🤠', hp: 20,
    deck: ['wild_card', 'wild_card', 'real_talk', 'real_talk', 'rune_sword', 'rune_sword', 'speed_demon', 'speed_demon', 'loud_music', 'loud_music', 'big_rig', 'sig_brody'],
    persona: { aggression: 0.95, tradeCare: 0.1, healAt: 0, smart: 0, curve: 'big' },
    intro: '"REAL TALK," says Uncle Brody, "I have never lost at anything." (He has.)',
    tip: 'Brody goes FAST and loud. Heal up, put up Guards, survive the storm — then win.',
    lossTip: 'He is racing your hero, not your critters. Guards force him to stop — and Blessing undoes his work.',
    reward: ['sig_brody', 'trickster'],
    unlocks: { presets: ['speed_demons', 'magic_show'] },
  },
  {
    id: 'chelsea', name: 'Aunt Chelsea', title: 'The Healer', emoji: '🤗', hp: 20,
    deck: ['tea_time', 'cozy_blanket', 'cozy_blanket', 'gentle_goat', 'gentle_goat', 'time_out', 'time_out', 'guard_cat', 'guard_cat', 'big_hug', 'big_hug', 'sig_chelsea'],
    persona: { aggression: 0.3, tradeCare: 0.8, healAt: 14, smart: 0, curve: 'mid' },
    intro: 'Aunt Chelsea has tea, blankets, and all the time in the world.',
    tip: 'Chelsea heals everything. Little pokes won\'t cut it — save up for one BIG turn.',
    lossTip: 'Chip damage gets healed right back. Build a big field first, then hit her with everything at once.',
    reward: ['sig_chelsea', 'maestro', 'llama'],
  },
  {
    id: 'flaj', name: 'Grampa Flaj', title: 'The Mountain', emoji: '👴', hp: 20,
    deck: ['barn_owl', 'barn_owl', 'haybale', 'haybale', 'stubborn_mule', 'stubborn_mule', 'prize_bull', 'prize_bull', 'old_tractor', 'old_tractor', 'iron_skillet', 'sig_flaj'],
    persona: { aggression: 0.5, tradeCare: 0.6, healAt: 0, smart: 0, curve: 'big' },
    intro: 'Grampa Flaj fires up the old tractor. It takes three tries. It always takes three tries.',
    tip: 'Grampa\'s slow but his critters are TOUGH as old boots. Hit fast, or pack a vanishing act.',
    lossTip: 'His giants arrive late — punish him early, or Magic Vanish a tractor back to his hand (he has to pay for it AGAIN).',
    reward: ['sig_flaj'],
    unlocks: { presets: ['big_barn'] },
  },
  {
    id: 'rocky', name: 'Grandma Rockie', title: 'The Legend', emoji: '👵', hp: 25,
    deck: ['knitting_needles', 'knitting_needles', 'garden_gnome', 'garden_gnome', 'watch_dog', 'watch_dog', 'yarn_beast', 'yarn_beast', 'cookie_batch', 'rolling_pin', 'grand_finale', 'sig_rocky'],
    persona: { aggression: 0.6, tradeCare: 0.9, healAt: 10, smart: 1, curve: 'mid' },
    intro: 'Grandma Rockie sets down her knitting. "Oh sweetheart. I INVENTED this game."',
    tip: 'Grandma Rockie\'s seen every trick in this game — most of them are hers. Use EVERYTHING you\'ve learned.',
    lossTip: 'She punishes greed. Don\'t overfill the field into her Rolling Pin — and whatever you do, do NOT ignore the little white dog.',
    reward: ['sig_rocky'],
    unlocks: { crown: true, goldenBack: true },
  },
];

// ---- Presets (Coach's Picks) ------------------------------------------------
export const PRESETS = {
  starter: { id: 'starter', name: 'Starter Deck', emoji: '🌱', cards: STARTER_DECK,
    blurb: 'Where every legend begins.' },
  farm_friends: {
    id: 'farm_friends', name: 'Farm Friends', emoji: '🐄',
    cards: ['barn_cat', 'barn_cat', 'billy_goat', 'billy_goat', 'shep', 'mama_hen', 'prize_pig', 'sig_rusty', 'sig_aaron', 'goat_stampede', 'ddg', 'nutmeg'],
    blurb: 'Go wide. The farm fights together.' },
  speed_demons: {
    id: 'speed_demons', name: 'Speed Demons', emoji: '⚡',
    cards: ['sprinter', 'sprinter', 'barn_cat', 'barn_cat', 'striker', 'striker', 'billy_goat', 'billy_goat', 'sig_brody', 'nutmeg', 'slide_tackle', 'blessing'],
    blurb: 'Hit first. Hit fast. Win before they wake up.' },
  magic_show: {
    id: 'magic_show', name: 'Magic Show', emoji: '🎩',
    cards: ['trickster', 'trickster', 'magic_vanish', 'slide_tackle', 'slide_tackle', 'barn_cat', 'barn_cat', 'billy_goat', 'billy_goat', 'striker', 'striker', 'sig_brody'],
    blurb: 'Vanish their best. Tackle the rest. Ta-da.' },
  big_barn: {
    id: 'big_barn', name: 'Big Barn Energy', emoji: '🚜',
    cards: ['prize_pig', 'sig_flaj', 'llama', 'mama_hen', 'shep', 'shep', 'barn_cat', 'barn_cat', 'billy_goat', 'billy_goat', 'blessing', 'slide_tackle'],
    blurb: 'Slow. Huge. Inevitable.' },
};

// ---- Campaign unlock schedule (computed from progress) -----------------------
// progress = number of bosses beaten (0..8). Returns full owned-card set.
export function collectionFor(progress, secrets = {}) {
  const owned = new Set(STARTER_DECK);
  for (let i = 0; i < progress && i < BOSSES.length; i++) {
    for (const c of BOSSES[i].reward) owned.add(c);
  }
  if (progress >= BOSSES.length) {
    // champion's reward: the WHOLE card pool — every card from every boss deck (except the secret)
    for (const [id, c] of Object.entries(CARDS)) if (!c.secret) owned.add(id);
  }
  if (secrets.dogMan) owned.add('dog_man');
  return owned;
}

export function presetsFor(progress) {
  const list = ['starter'];
  for (let i = 0; i < progress && i < BOSSES.length; i++) {
    const u = BOSSES[i].unlocks;
    if (u && u.presets) list.push(...u.presets);
  }
  return list;
}

export function deckBuilderUnlocked(progress) { return progress >= 2; }

// ---- Player hero ------------------------------------------------------------
export const WYATT = { id: 'wyatt', name: 'Wyatt', title: 'The 10th Legend', emoji: '🧒', hp: 20 };
export const COACH = { name: 'Coach James', emoji: '🧢' };

// ---- Deck validation (player-constructed decks) -------------------------------
export const DECK_MIN = 12, DECK_MAX = 24;
export function validateDeck(cardIds, owned) {
  if (cardIds.length < DECK_MIN || cardIds.length > DECK_MAX) {
    return `A deck needs ${DECK_MIN}–${DECK_MAX} cards (you have ${cardIds.length}).`;
  }
  const counts = {};
  for (const id of cardIds) {
    const c = CARDS[id];
    if (!c) return `Unknown card: ${id}`;
    if (owned && !owned.has(id)) return `${c.name} isn't in your collection yet.`;
    counts[id] = (counts[id] || 0) + 1;
    const max = c.legendary ? 1 : 2;
    if (counts[id] > max) return `Max ${max} cop${max === 1 ? 'y' : 'ies'} of ${c.name}.`;
  }
  return null; // valid
}

// ---- Card categories (deck-builder shelves) -----------------------------------
export function cardCategory(id) {
  const c = CARDS[id];
  if (c.legendary) return 'legends';
  if (c.type === 'trick') return 'tricks';
  if (c.guard || c.hp > c.atk) return 'defenders';
  return 'attackers';
}
export const CATEGORIES = [
  { id: 'attackers', name: 'Attackers', emoji: '⚔️' },
  { id: 'defenders', name: 'Defenders', emoji: '🛡️' },
  { id: 'tricks',    name: 'Tricks',    emoji: '✨' },
  { id: 'legends',   name: 'Legends',   emoji: '🌟' },
];

// ---- Deck scorecard -------------------------------------------------------------
// One stat language for everything: your deck, the presets, and every boss.
// 💥 Punch = how hard it hits. 🛡️ Toughness = how well it survives. ✨ Tricks = how sneaky it is.
// Raw scores are per-card densities; star thresholds calibrated against the preset + boss spread.
export function deckStats(cardIds) {
  let punch = 0, tough = 0, tricks = 0;
  for (const id of cardIds) {
    const c = CARDS[id];
    if (!c) continue;
    if (c.type === 'critter') {
      punch += c.atk + (c.fast ? 1.5 : 0);
      tough += c.hp + (c.guard ? 2.5 : 0);
      if (c.bc || c.aura || c.sot) tricks += 1.2;
      if (c.bc?.kind === 'heal') tough += c.bc.n * 0.8;
      if (c.bc?.kind === 'damage') punch += c.bc.n * 0.8;
    } else {
      tricks += 2.0;
      const fx = c.fx;
      if (fx.kind === 'damage') punch += fx.n * (fx.target === 'all-enemy-critters' ? 1.1 : 0.5);
      if (fx.kind === 'heal') tough += fx.n * 0.9;
      if (fx.kind === 'buff') { punch += (fx.a || 0) * 0.7; tough += (fx.h || 0) * 0.7; }
      if (fx.kind === 'tempAtkAll' || fx.kind === 'ignoreGuard') punch += 1.2;
      if (fx.kind === 'bounce' || fx.kind === 'debuffAtkAll') tough += 1.2;
      if (fx.kind === 'summon') tough += fx.count * 0.8;
    }
  }
  const n = Math.max(1, cardIds.length);
  const star = (raw, lo, hi) => Math.max(1, Math.min(5, Math.round(((raw / n) - lo) / (hi - lo) * 4) + 1));
  return {
    punch: star(punch, 1.1, 3.1),
    tough: star(tough, 1.6, 4.2),
    tricks: star(tricks, 0.1, 1.05),
  };
}
