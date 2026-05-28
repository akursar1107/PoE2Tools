// Unified ascendancy data for PoE2 Tools.
// Merges rich wiki data (notables, minorPassives, summary, tags) with
// passiveNodes from the GGG skill tree export (used by the .build file format).
//
// passiveNodes source: https://github.com/grindinggear/poe2-skilltree-export
// wiki data source: https://www.poe2wiki.net

export const ascendancies = [
  // ── Warrior ──────────────────────────────────────────────────────────────

  {
    id: 'titan',
    name: 'Titan',
    className: 'Warrior',
    sourceUrl: 'https://www.poe2wiki.net/wiki/Titan',
    summary: 'A might-focused Warrior ascendancy that empowers slam skills with aftershocks and ancestral boosts, enhances heavy stuns, and grants exceptional life and armour scalability.',
    tags: ['slam', 'stun', 'armour', 'life', 'strength'],
    passiveNodes: [24807, 42275, 3762, 59540, 30115, 60634, 32534, 12000, 59372],
    minorPassives: [
      '20% increased Armour',
      'Regenerate 0.5% of maximum Life per second',
      'Slam Skills have 8% increased Area of Effect',
      '4% increased Strength',
      '18% increased Stun Buildup',
    ],
    notables: [
      { name: 'Stone Skin', modifiers: ['50% more Armour from Equipped Body Armour'] },
      { name: 'Earthbreaker', modifiers: ['25% chance for Slam Skills you use yourself to cause an additional Aftershock'] },
      { name: 'Ancestral Empowerment', modifiers: ['Every second Slam Skill you use yourself is Ancestrally Boosted'] },
      { name: 'Colossal Capacity', modifiers: ['Carry a Chest which adds 20 Inventory Slots'] },
      { name: 'Hulking Form', modifiers: ['50% increased effect of Small Passive Skills'] },
      { name: 'Mysterious Lineage', modifiers: ['15% more Maximum Life'] },
      { name: 'Crushing Impacts', modifiers: ['Your Hits are Crushing Blows', '25% more Damage against Heavy Stunned Enemies'] },
      { name: 'Mountain Splitter', modifiers: ["Every Third Slam skill that doesn't create Fissures which you use yourself causes 3 additional Aftershocks ahead and to each side of the initial area"] },
    ],
  },

  {
    id: 'warbringer',
    name: 'Warbringer',
    className: 'Warrior',
    sourceUrl: 'https://www.poe2wiki.net/wiki/Warbringer',
    summary: 'A warcry Warrior that thrives on shouts, rage, and overwhelming physical burst — turning enemy deaths and exerted attacks into mounting power.',
    tags: ['warcry', 'rage', 'physical', 'attack'],
    passiveNodes: [58704, 36659, 6127, 40915, 39411, 33812, 47097, 23005, 52068],
    minorPassives: [
      '4% increased Attack Speed',
      '10% increased Physical Damage',
      '20% increased Warcry Speed',
      '10% increased Warcry Duration',
      '6% increased Rage generation',
    ],
    notables: [
      { name: 'Tempered by War', modifiers: ['Enemies you kill while you have Rage have a 20% chance to Explode dealing 10% of their maximum Life as Physical Damage'] },
      { name: 'Warlord\'s Fervor', modifiers: ['Exerted Attacks deal 100% more Damage', 'Warcries Exert 2 additional Attacks'] },
      { name: 'Battle Hardened', modifiers: ['Gain 25% of Physical Damage as extra Chaos Damage while at maximum Rage'] },
      { name: 'Unstoppable Force', modifiers: ['Immune to Stun while you have Rage', 'Gain 1 Rage when Stunned'] },
      { name: 'Berserking', modifiers: ['Maximum Rage is 50', 'Gain 5 Rage on Kill'] },
      { name: 'Primal Roar', modifiers: ['Your Warcries grant 10 Rage'] },
    ],
  },

  {
    id: 'smith-of-kitava',
    name: 'Smith of Kitava',
    className: 'Warrior',
    sourceUrl: 'https://www.poe2wiki.net/wiki/Smith_of_Kitava',
    summary: 'A forge-and-fire Warrior who tempers weapons with Kitava\'s flame, empowering ignite and fire-damage builds with powerful heat-based passive bonuses.',
    tags: ['fire', 'ignite', 'weapon', 'strength'],
    passiveNodes: [22541, 57959, 60298, 47184, 64962, 110, 22908, 48537, 8525, 9997, 13772, 5852, 9988, 25438, 49340, 60913, 61039, 20195, 16276],
    minorPassives: [
      '10% increased Fire Damage',
      '5% increased Attack Speed with Two Handed Weapons',
      '10% increased Ignite Duration',
    ],
    notables: [
      { name: 'Kitava\'s Thirst', modifiers: ['Ignites you inflict deal 50% more Damage'] },
      { name: 'Tempered Steel', modifiers: ['Weapons you use are Tempered', 'Tempered Weapons deal 30% increased Damage'] },
    ],
  },

  // ── Ranger ───────────────────────────────────────────────────────────────

  {
    id: 'deadeye',
    name: 'Deadeye',
    className: 'Ranger',
    sourceUrl: 'https://www.poe2wiki.net/wiki/Deadeye',
    summary: 'A high-mobility Ranger ascendancy built around rapid bow attacks, projectile enhancements, and reliable hit-stacking for consistent ranged output.',
    tags: ['bow', 'projectile', 'attack', 'dexterity', 'speed'],
    passiveNodes: [24226, 12033, 42416, 46990, 30, 59913, 5817, 23508, 37336],
    minorPassives: [
      '8% increased Projectile Speed',
      '4% increased Attack Speed',
      '10% increased Damage with Bow Skills',
      '5% increased Evasion Rating',
    ],
    notables: [
      { name: 'Tailwind', modifiers: ['You gain Tailwind on Hit with Bow Skills', 'Tailwind grants 10% increased Action Speed'] },
      { name: 'Far Shot', modifiers: ['Projectiles deal up to 60% more Damage the further they travel'] },
      { name: 'Rupturing', modifiers: ['Hits with Bow Skills cause Bleeding'] },
      { name: 'Focal Point', modifiers: ['Mark a target you hit with a Bow Skill', 'Deal 40% more Damage to your Marked target'] },
      { name: 'Gathering Winds', modifiers: ['10% more Projectile Speed per Tailwind stack', 'Maximum 5 Tailwind stacks'] },
      { name: 'Eagle Eyes', modifiers: ['Bow Skills have +2 to Projectile Count', 'Your Projectiles Pierce all Targets'] },
    ],
  },

  {
    id: 'pathfinder',
    name: 'Pathfinder',
    className: 'Ranger',
    sourceUrl: 'https://www.poe2wiki.net/wiki/Pathfinder',
    summary: 'A nature-and-flask Ranger who amplifies flask effects, applies poisons and ailments, and converts nature\'s power into relentless sustained damage.',
    tags: ['flask', 'poison', 'nature', 'dexterity', 'ailment'],
    passiveNodes: [61991, 24868, 29074, 1583, 57141, 41619, 16433, 46454, 40],
    minorPassives: [
      '8% increased Flask Effect Duration',
      '10% increased Damage with Poison',
      '8% increased Evasion Rating',
    ],
    notables: [
      { name: 'Nature\'s Boon', modifiers: ['Your Flasks gain 3 Charges every 3 seconds', 'Flasks gain 1 extra charge on Hit'] },
      { name: 'Master Toxicist', modifiers: ['Poisons you inflict deal 40% more Damage', 'Hits against Poisoned Enemies have 10% increased Critical Strike Chance'] },
      { name: 'Nature\'s Reprisal', modifiers: ['Wither is applied by your Hits and Skills as though dealing Chaos Damage', '15% increased Wither Effect'] },
      { name: 'Veteran Bowyer', modifiers: ['Bow Skills fire an additional arrow'] },
    ],
  },

  // ── Witch ─────────────────────────────────────────────────────────────────

  {
    id: 'infernalist',
    name: 'Infernalist',
    className: 'Witch',
    sourceUrl: 'https://www.poe2wiki.net/wiki/Infernalist',
    summary: 'A demonic Witch who sacrifices life for power, transforms into a demonic form, and channels devastating fire spells with her minion Horus.',
    tags: ['fire', 'spell', 'minion', 'life', 'chaos'],
    passiveNodes: [18158, 36564, 17754, 24039, 46644, 18348, 25239, 61267, 13174, 34419, 32699, 10694],
    minorPassives: [
      '10% increased Fire Damage',
      '5% increased Spell Damage',
      'Regenerate 0.5% of maximum Life per second',
      '8% increased Maximum Mana',
    ],
    notables: [
      { name: 'Demonic Possession', modifiers: ['You can transform into a Demon, gaining immense power temporarily'] },
      { name: 'Bringer of Flame', modifiers: ['Fire Skills deal 30% more Damage'] },
      { name: 'Dark Pact', modifiers: ['Skills cost Life instead of Mana', '20% more Skill Effect Duration'] },
      { name: 'Horus', modifiers: ['Summon Horus, a powerful fire-breathing minion that fights alongside you'] },
      { name: 'Infernal Flame', modifiers: ['Your Ignites spread to nearby Enemies'] },
    ],
  },

  {
    id: 'blood-mage',
    name: 'Blood Mage',
    className: 'Witch',
    sourceUrl: 'https://www.poe2wiki.net/wiki/Blood_Mage',
    summary: 'A Witch who draws power from her own blood, converting life into mana and spell power, enabling extreme spell scaling through life sacrifice.',
    tags: ['life', 'spell', 'critical', 'physical', 'chaos'],
    passiveNodes: [52703, 26383, 8415, 26282, 27667, 23416, 56162, 65518, 59822, 31223],
    minorPassives: [
      '8% increased Maximum Life',
      '5% increased Spell Damage',
      '10% increased Critical Strike Multiplier',
      'Regenerate 1% of Life per second',
    ],
    notables: [
      { name: 'Blood Magic', modifiers: ['Spend Life instead of Mana for Skill Costs', 'Maximum Life is increased by 50%'] },
      { name: 'Crimson Power', modifiers: ['Gain Spell Damage proportional to missing Life', 'Maximum bonus: 100% more Spell Damage'] },
      { name: 'Gore Spike', modifiers: ['Critical Strikes inflict Bleeding', 'Bleeding Enemies take 25% more Damage from you'] },
      { name: 'Exsanguinate', modifiers: ['Recover 5% of Maximum Life on Kill'] },
    ],
  },

  {
    id: 'lich',
    name: 'Lich',
    className: 'Witch',
    sourceUrl: 'https://www.poe2wiki.net/wiki/Lich',
    summary: 'An undead Witch who wields the power of death itself, fuelling chaos and cold spells with corpse consumption and a persistent phylactery.',
    tags: ['chaos', 'cold', 'minion', 'curse', 'undead'],
    passiveNodes: [58932, 17788, 23352, 26085, 2877, 33570, 28431, 59, 23710, 2516],
    minorPassives: [
      '10% increased Chaos Damage',
      '8% increased Cold Damage',
      '5% increased Effect of Curses',
      'Regenerate 0.3% of Energy Shield per second',
    ],
    notables: [
      { name: 'Phylactery', modifiers: ['On Death, become temporarily immortal as your soul returns to your phylactery'] },
      { name: 'Grave Robber', modifiers: ['Consuming Corpses grants power charges and restores Mana'] },
      { name: 'Necrotic Touch', modifiers: ['Hits apply Withered for 4 seconds', 'Withered increases Chaos Damage taken by 6%'] },
    ],
  },

  // ── Sorceress ─────────────────────────────────────────────────────────────

  {
    id: 'stormweaver',
    name: 'Stormweaver',
    className: 'Sorceress',
    sourceUrl: 'https://www.poe2wiki.net/wiki/Stormweaver',
    summary: 'A storm-conjuring Sorceress who supercharges lightning and cold spells through critical strikes, crit multiplier scaling, and storm-summoning.',
    tags: ['lightning', 'cold', 'spell', 'critical', 'intelligence'],
    passiveNodes: [8867, 42522, 39204, 12882, 38578, 2857, 39640, 61985, 18849, 49189, 40721],
    minorPassives: [
      '10% increased Lightning Damage',
      '8% increased Cold Damage',
      '5% increased Critical Strike Chance',
      '15% increased Critical Strike Multiplier',
    ],
    notables: [
      { name: 'Shaper of Storms', modifiers: ['Elemental Ailments on Enemies expire 25% faster', 'Your Critical Strikes cause Shocked ground'] },
      { name: 'Shaper of Winter', modifiers: ['Enemies you Freeze are permanently Frozen until you or the freeze expires', 'You can Shatter Enemies that are Frozen'] },
      { name: 'Focal Point', modifiers: ['Every 5th Spell you cast is Intensified, dealing 40% more Damage'] },
      { name: 'Crackling Speed', modifiers: ['10% more Cast Speed', 'Lightning Spells chain once more'] },
    ],
  },

  {
    id: 'chronomancer',
    name: 'Chronomancer',
    className: 'Sorceress',
    sourceUrl: 'https://www.poe2wiki.net/wiki/Chronomancer',
    summary: 'A Sorceress who bends time itself — rewinding her own state, pausing enemies, and extending the duration of her powerful effects.',
    tags: ['spell', 'duration', 'temporal', 'intelligence', 'utility'],
    passiveNodes: [10731, 28153, 26638, 42035, 10987, 22147, 58747, 3605, 49049],
    minorPassives: [
      '8% increased Skill Effect Duration',
      '5% increased Cast Speed',
      '8% increased Maximum Mana',
    ],
    notables: [
      { name: 'Rewind', modifiers: ['Once per 10 seconds, revert to your state 4 seconds ago, restoring Life and Mana'] },
      { name: 'Temporal Rift', modifiers: ['Create a temporal anomaly that slows Enemies in range by 50%'] },
      { name: 'Perpetual Motion', modifiers: ['Skill Effect Duration is extended by 30%'] },
      { name: 'Stop Time', modifiers: ['Freeze all nearby enemies in time for 2 seconds, once per 20 seconds'] },
    ],
  },

  {
    id: 'disciple-of-varashta',
    name: 'Disciple of Varashta',
    className: 'Sorceress',
    sourceUrl: 'https://www.poe2wiki.net/wiki/Disciple_of_Varashta',
    summary: 'A Sorceress devoted to Varashta, harnessing chaotic storm energy to overload spells with unpredictable massive hits.',
    tags: ['lightning', 'chaos', 'spell', 'critical', 'intelligence'],
    passiveNodes: [56857, 10561, 43426, 45602, 23265, 25653, 36109, 64591, 25683, 14131, 46091, 2810, 20701, 36891, 32705, 13289, 34207, 8305],
    minorPassives: [
      '10% increased Lightning Damage',
      '10% increased Chaos Damage',
      '5% increased Spell Damage',
    ],
    notables: [
      { name: 'Varashta\'s Curse', modifiers: ['Every 5th Spell you cast is empowered, dealing 200% more Damage'] },
      { name: 'Storm Surge', modifiers: ['Lightning Spells generate Storm Charges', 'Discharge Storm Charges for massive bursts'] },
    ],
  },

  // ── Mercenary ─────────────────────────────────────────────────────────────

  {
    id: 'tactician',
    name: 'Tactician',
    className: 'Mercenary',
    sourceUrl: 'https://www.poe2wiki.net/wiki/Tactician',
    summary: 'A calculating Mercenary who coordinates debuffs, exploits enemy vulnerabilities, and rewards methodical play with massive conditional bonuses.',
    tags: ['crossbow', 'debuff', 'projectile', 'dexterity', 'utility'],
    passiveNodes: [16249, 10371, 15044, 54838, 44746, 36252, 32637, 44371, 1988, 37523, 4086],
    minorPassives: [
      '5% increased Attack Speed with Crossbows',
      '8% increased Physical Damage',
      '5% increased Projectile Damage',
    ],
    notables: [
      { name: 'Calculated Shot', modifiers: ['First hit on an Enemy deals 80% more Damage'] },
      { name: 'Coordinated Strike', modifiers: ['Your Grenades and Skills count as coordinated', 'Coordinated attacks deal 30% more Damage'] },
      { name: 'Exploit Weakness', modifiers: ['Hits against Debuffed Enemies deal 40% more Damage'] },
    ],
  },

  {
    id: 'witchhunter',
    name: 'Witchhunter',
    className: 'Mercenary',
    sourceUrl: 'https://www.poe2wiki.net/wiki/Witchhunter',
    summary: 'A zealous Mercenary with strong anti-chaos and anti-magic capabilities, amplifying attacks against spellcasters with powerful execution effects.',
    tags: ['crossbow', 'attack', 'dexterity', 'execute', 'anti-magic'],
    passiveNodes: [8272, 17646, 61973, 38601, 7120, 46535, 3704, 6935, 37078],
    minorPassives: [
      '8% increased Attack Speed',
      '10% increased Physical Damage',
      '8% increased Effect of non-Damaging Ailments',
    ],
    notables: [
      { name: 'Zealot\'s Oath', modifiers: ['Gain life regeneration equal to 30% of Energy Shield Recharge Rate'] },
      { name: 'Purge the Wicked', modifiers: ['Enemies you kill with a Critical Strike have a 20% chance to explode, dealing 10% of their Life as Fire Damage'] },
      { name: 'Holy Conviction', modifiers: ['You take 30% reduced Damage from Hexes', 'Remove Hexes from yourself every 4 seconds'] },
      { name: 'Ritual Execution', modifiers: ['Execute Enemies below 15% Life', 'Executing an Enemy grants a Power Charge'] },
    ],
  },

  {
    id: 'gemling-legionnaire',
    name: 'Gemling Legionnaire',
    className: 'Mercenary',
    sourceUrl: 'https://www.poe2wiki.net/wiki/Gemling_Legionnaire',
    summary: 'A gem-augmented Mercenary who overclocks socketed skills, builds synergies between gems, and amplifies active gem effects.',
    tags: ['gem', 'attack', 'spell', 'dexterity', 'utility'],
    passiveNodes: [60287, 14429, 11641, 55536, 57819, 30996, 53108, 36728, 58591],
    minorPassives: [
      '4% increased Gem Level',
      '6% increased Effect of Support Gems',
      '8% increased Attack and Cast Speed',
    ],
    notables: [
      { name: 'Gem Mastery', modifiers: ['Active Skill Gems in your equipment have +2 Level'] },
      { name: 'Multistrike Expertise', modifiers: ['Attacks repeat an additional time', 'Repeated Attacks deal 30% more Damage'] },
      { name: 'Infused Strikes', modifiers: ['Weapon attacks apply Infusion on Enemies', 'Infused Enemies take 15% increased Damage from Gems'] },
    ],
  },

  // ── Monk ──────────────────────────────────────────────────────────────────

  {
    id: 'martial-artist',
    name: 'Martial Artist',
    className: 'Monk',
    sourceUrl: 'https://www.poe2wiki.net/wiki/Martial_Artist',
    summary: 'A disciplined Monk who trains in unarmed combat and weapon arts to deliver powerful combo-driven melee strikes.',
    tags: ['melee', 'attack', 'unarmed', 'dexterity', 'combo'],
    passiveNodes: [41751, 61586, 19370, 17356, 39552, 51546, 1739, 39595, 11495],
    minorPassives: [
      '5% increased Attack Speed',
      '10% increased Melee Damage',
      '8% increased Evasion Rating',
    ],
    notables: [
      { name: 'Iron Fist', modifiers: ['Unarmed Attacks deal 60% more Damage', 'Unarmed Attacks have 30% chance to Stun'] },
      { name: 'Fluid Motion', modifiers: ['20% increased Movement Speed while not stationary', 'Attacks after movement deal 30% more Damage'] },
      { name: 'Combo Mastery', modifiers: ['Every 3rd consecutive Hit against the same enemy deals 100% more Damage'] },
      { name: 'Inner Peace', modifiers: ['Take 20% reduced Damage while stationary', 'Regenerate 2% Life per second while stationary'] },
    ],
  },

  {
    id: 'invoker',
    name: 'Invoker',
    className: 'Monk',
    sourceUrl: 'https://www.poe2wiki.net/wiki/Invoker',
    summary: 'A spiritual Monk who channels elemental forces through martial discipline, blending melee attacks with elemental spells.',
    tags: ['melee', 'spell', 'lightning', 'cold', 'dexterity'],
    passiveNodes: [8143, 65173, 7621, 23587, 64031, 63713, 52448, 12876, 63236, 9994],
    minorPassives: [
      '8% increased Elemental Damage',
      '4% increased Attack Speed',
      '5% increased Cast Speed',
      '8% increased Evasion Rating',
    ],
    notables: [
      { name: 'Elemental Attunement', modifiers: ['Your Melee Attacks also count as Spell Casts of the corresponding Element'] },
      { name: 'Static Palm', modifiers: ['Melee Strikes deal additional Lightning Damage', 'Hits Shock Enemies'] },
      { name: 'Ice Step', modifiers: ['Dash Freezes Enemies in your path', 'Frozen Enemies take 30% increased Damage'] },
      { name: 'Transcendence', modifiers: ['Convert Mana to Energy Shield', 'No longer require Mana for Skills'] },
    ],
  },

  {
    id: 'acolyte-of-chayula',
    name: 'Acolyte of Chayula',
    className: 'Monk',
    sourceUrl: 'https://www.poe2wiki.net/wiki/Acolyte_of_Chayula',
    summary: 'A void-touched Monk devoted to Chayula, wielding chaos energy and dream-powers to devastate enemies with unpredictable chaos-melee.',
    tags: ['chaos', 'melee', 'void', 'dexterity', 'energy-shield'],
    passiveNodes: [18826, 3781, 25781, 59759, 50098, 52395, 41076, 31116, 34817, 74],
    minorPassives: [
      '10% increased Chaos Damage',
      '8% increased Maximum Energy Shield',
      '4% increased Attack Speed',
    ],
    notables: [
      { name: 'Void Touched', modifiers: ['Your Hits gain 20% of Physical Damage as extra Chaos Damage'] },
      { name: 'Dream Devourer', modifiers: ['Gain 5% of Damage dealt as Energy Shield'] },
      { name: 'Shaper of Nightmares', modifiers: ['Chaos Damage can Freeze, Shock, and Ignite', 'Chaos Ailments deal 30% more Damage'] },
      { name: 'Beyond the Veil', modifiers: ['Phase through Enemies', 'Deal 40% more Damage to Phased-through Enemies'] },
    ],
  },

  // ── Druid ─────────────────────────────────────────────────────────────────

  {
    id: 'oracle',
    name: 'Oracle',
    className: 'Druid',
    sourceUrl: 'https://www.poe2wiki.net/wiki/Oracle',
    summary: 'A storm-channelling Druid who shapes the battlefield with elemental forces, empowering lightning and fire through shapeshifted forms.',
    tags: ['lightning', 'fire', 'spell', 'shapeshift', 'elemental'],
    passiveNodes: [42761, 5571, 34313, 52374, 30904, 32905, 55135, 4197, 37782],
    minorPassives: [
      '10% increased Lightning Damage',
      '8% increased Fire Damage',
      '5% increased Spell Damage',
    ],
    notables: [
      { name: 'Storm Oracle', modifiers: ['Lightning Spells have 30% more Damage', 'Your Storms deal increased Damage'] },
      { name: 'Fire Caller', modifiers: ['Fire Spells have 25% more Damage', 'Fire Skills Ignite on Hit'] },
    ],
  },

  {
    id: 'shaman',
    name: 'Shaman',
    className: 'Druid',
    sourceUrl: 'https://www.poe2wiki.net/wiki/Shaman',
    summary: 'A nature-calling Druid who communes with totems and spirits, channelling poisons and nature energies through ancient shamanic power.',
    tags: ['totem', 'poison', 'nature', 'chaos', 'spell'],
    passiveNodes: [35535, 16204, 42253, 58646, 35762, 56933, 61983, 28745, 62523],
    minorPassives: [
      '8% increased Totem Damage',
      '10% increased Chaos Damage',
      '5% increased Poison Duration',
    ],
    notables: [
      { name: 'Ancestor\'s Blessing', modifiers: ['Totems you place also buff you', 'Totem Damage bonus also applies to you'] },
      { name: 'Toxic Ritual', modifiers: ['Poison Stacks you inflict deal 40% more Damage'] },
    ],
  },

  // ── Huntress ──────────────────────────────────────────────────────────────

  {
    id: 'amazon',
    name: 'Amazon',
    className: 'Huntress',
    sourceUrl: 'https://www.poe2wiki.net/wiki/Amazon',
    summary: 'A fierce Huntress who masters the spear with aggressive mobility and lethal burst attacks.',
    tags: ['spear', 'attack', 'melee', 'dexterity', 'speed'],
    passiveNodes: [35187, 41008, 42441, 55796, 9294, 7979, 41736, 3065, 63254, 47312],
    minorPassives: [
      '5% increased Attack Speed with Spears',
      '10% increased Physical Damage',
      '8% increased Movement Speed',
    ],
    notables: [
      { name: 'Warrior\'s Path', modifiers: ['Attacks have 20% chance to deal Double Damage', 'Movement Skills have no cooldown'] },
      { name: 'Overwhelming Force', modifiers: ['Spear Attacks deal 40% more Damage if you have moved in the last second'] },
    ],
  },

  {
    id: 'spirit-walker',
    name: 'Spirit Walker',
    className: 'Huntress',
    sourceUrl: 'https://www.poe2wiki.net/wiki/Spirit_Walker',
    summary: 'A spiritual Huntress who channels ancestral power, summoning spirit companions and empowering attacks with ethereal force.',
    tags: ['spirit', 'minion', 'spear', 'dexterity', 'buff'],
    passiveNodes: [41401, 27773, 62743, 765, 46070, 4367, 39887, 56489, 28254, 63493],
    minorPassives: [
      '8% increased Spirit Damage',
      '5% increased Attack Speed',
      '10% increased Minion Damage',
    ],
    notables: [
      { name: 'Spirit Form', modifiers: ['Become ethereal for 3 seconds every 10 seconds, taking no Physical Damage'] },
      { name: 'Ancestral Guidance', modifiers: ['Your Minions deal 40% more Damage', 'Minions inherit 15% of your Resistances'] },
    ],
  },

  {
    id: 'ritualist',
    name: 'Ritualist',
    className: 'Huntress',
    sourceUrl: 'https://www.poe2wiki.net/wiki/Ritualist',
    summary: 'A blood-ritual Huntress who consecrates the ground, buffs allies, and empowers attacks through ceremonial sacrifice.',
    tags: ['ritual', 'consecrated', 'attack', 'dexterity', 'buff'],
    passiveNodes: [7068, 34785, 18280, 62804, 36365, 4891, 37046, 30233],
    minorPassives: [
      '8% increased Damage on Consecrated Ground',
      '5% increased Attack Speed',
      '10% increased Effect of Buffs on you',
    ],
    notables: [
      { name: 'Blood Ritual', modifiers: ['Consecrate Ground on Kill', 'Regenerate 3% Life per second on Consecrated Ground'] },
      { name: 'Sacred Ground', modifiers: ['You and nearby allies deal 30% more Damage on Consecrated Ground'] },
    ],
  },
];
