// Ascendancy data extracted from https://github.com/grindinggear/poe2-skilltree-export
// passiveNodes: skill tree node IDs for all notables + ascendancy start node.
// Included in .build file so the Build Planner highlights them in-game.
const ascendancies = [
  { class: "Druid",      name: "Oracle",               passiveNodes: [42761, 5571, 34313, 52374, 30904, 32905, 55135, 4197, 37782] },
  { class: "Druid",      name: "Shaman",               passiveNodes: [35535, 16204, 42253, 58646, 35762, 56933, 61983, 28745, 62523] },
  { class: "Huntress",   name: "Amazon",               passiveNodes: [35187, 41008, 42441, 55796, 9294, 7979, 41736, 3065, 63254, 47312] },
  { class: "Huntress",   name: "Spirit Walker",        passiveNodes: [41401, 27773, 62743, 765, 46070, 4367, 39887, 56489, 28254, 63493] },
  { class: "Huntress",   name: "Ritualist",            passiveNodes: [7068, 34785, 18280, 62804, 36365, 4891, 37046, 30233] },
  { class: "Mercenary",  name: "Tactician",            passiveNodes: [16249, 10371, 15044, 54838, 44746, 36252, 32637, 44371, 1988, 37523, 4086] },
  { class: "Mercenary",  name: "Witchhunter",          passiveNodes: [8272, 17646, 61973, 38601, 7120, 46535, 3704, 6935, 37078] },
  { class: "Mercenary",  name: "Gemling Legionnaire",  passiveNodes: [60287, 14429, 11641, 55536, 57819, 30996, 53108, 36728, 58591] },
  { class: "Monk",       name: "Martial Artist",       passiveNodes: [41751, 61586, 19370, 17356, 39552, 51546, 1739, 39595, 11495] },
  { class: "Monk",       name: "Invoker",              passiveNodes: [8143, 65173, 7621, 23587, 64031, 63713, 52448, 12876, 63236, 9994] },
  { class: "Monk",       name: "Acolyte of Chayula",   passiveNodes: [18826, 3781, 25781, 59759, 50098, 52395, 41076, 31116, 34817, 74] },
  { class: "Ranger",     name: "Deadeye",              passiveNodes: [24226, 12033, 42416, 46990, 30, 59913, 5817, 23508, 37336] },
  { class: "Ranger",     name: "Pathfinder",           passiveNodes: [61991, 24868, 29074, 1583, 57141, 41619, 16433, 46454, 40] },
  { class: "Sorceress",  name: "Stormweaver",          passiveNodes: [8867, 42522, 39204, 12882, 38578, 2857, 39640, 61985, 18849, 49189, 40721] },
  { class: "Sorceress",  name: "Chronomancer",         passiveNodes: [10731, 28153, 26638, 42035, 10987, 22147, 58747, 3605, 49049] },
  { class: "Sorceress",  name: "Disciple of Varashta", passiveNodes: [56857, 10561, 43426, 45602, 23265, 25653, 36109, 64591, 25683, 14131, 46091, 2810, 20701, 36891, 32705, 13289, 34207, 8305] },
  { class: "Warrior",    name: "Titan",                passiveNodes: [24807, 42275, 3762, 59540, 30115, 60634, 32534, 12000, 59372] },
  { class: "Warrior",    name: "Warbringer",           passiveNodes: [58704, 36659, 6127, 40915, 39411, 33812, 47097, 23005, 52068] },
  { class: "Warrior",    name: "Smith of Kitava",      passiveNodes: [22541, 57959, 60298, 47184, 64962, 110, 22908, 48537, 8525, 9997, 13772, 5852, 9988, 25438, 49340, 60913, 61039, 20195, 16276] },
  { class: "Witch",      name: "Infernalist",          passiveNodes: [18158, 36564, 17754, 24039, 46644, 18348, 25239, 61267, 13174, 34419, 32699, 10694] },
  { class: "Witch",      name: "Blood Mage",           passiveNodes: [52703, 26383, 8415, 26282, 27667, 23416, 56162, 65518, 59822, 31223] },
  { class: "Witch",      name: "Lich",                 passiveNodes: [58932, 17788, 23352, 26085, 2877, 33570, 28431, 59, 23710, 2516] },
];

// buildId is the official Metadata path used by the PoE2 Build Planner file format.
// null means the gem exists in PoE2 but we could not confirm its exact metadata ID.
const skillGems = [
  // Warrior
  { name: "Boneshatter",      buildId: "Metadata/Items/Gems/SkillGemBoneshatter" },
  { name: "Sunder",           buildId: "Metadata/Items/Gems/SkillGemSunder" },
  { name: "Stampede",         buildId: "Metadata/Items/Gem/SkillGemStampede" },
  { name: "Rolling Slam",     buildId: "Metadata/Items/Gems/SkillGemRollingSlam" },
  { name: "Infernal Cry",     buildId: "Metadata/Items/Gems/SkillGemInfernalCry" },
  { name: "Shockwave Totem",  buildId: "Metadata/Items/Gems/SkillGemShockwaveTotem" },
  { name: "Shield Charge",    buildId: "Metadata/Items/Gems/SkillGemShieldCharge" },
  { name: "Leap Slam",        buildId: "Metadata/Items/Gems/SkillGemLeapSlam" },

  // Ranger
  { name: "Ice Shot",         buildId: "Metadata/Items/Gem/SkillGemIceShot" },
  { name: "Explosive Shot",   buildId: "Metadata/Items/Gem/SkillGemExplosiveShot" },
  { name: "Galvanic Shards",  buildId: "Metadata/Items/Gem/SkillGemGalvanicShards" },
  { name: "Lightning Arrow",  buildId: "Metadata/Items/Gems/SkillGemLightningArrow" },
  { name: "Barrage",          buildId: "Metadata/Items/Gems/SkillGemBarrage" },
  { name: "Tornado Shot",     buildId: "Metadata/Items/Gem/SkillGemTornadoShot" },
  { name: "Rapid Shot",       buildId: "Metadata/Items/Gem/SkillGemRapidShot" },
  { name: "Rain of Arrows",   buildId: "Metadata/Items/Gems/SkillGemRainOfArrows" },
  { name: "Gas Arrow",        buildId: "Metadata/Items/Gem/SkillGemGasArrow" },

  // Witch
  { name: "Detonate Dead",    buildId: "Metadata/Items/Gems/SkillGemDetonateDead" },
  { name: "Raise Zombie",     buildId: "Metadata/Items/Gems/SkillGemRaiseZombie" },
  { name: "Skeletal Warrior", buildId: "Metadata/Items/Gems/SkillGemSkeletalWarriorWeaponSkill" },
  { name: "Raging Spirits",   buildId: "Metadata/Items/Gem/SkillGemRagingSpirits" },
  { name: "Bonestorm",        buildId: "Metadata/Items/Gem/SkillGemBonestorm" },
  { name: "Unearth",          buildId: "Metadata/Items/Gem/SkillGemUnearth" },
  { name: "Essence Drain",    buildId: "Metadata/Items/Gems/SkillGemEssenceDrain" },
  { name: "Contagion",        buildId: "Metadata/Items/Gems/SkillGemContagion" },
  { name: "Pain Offering",    buildId: "Metadata/Items/Gems/SkillGemPainOffering" },

  // Sorceress
  { name: "Fireball",         buildId: "Metadata/Items/Gem/SkillGemFireball" },
  { name: "Lightning Bolt",   buildId: "Metadata/Items/Gems/SkillGemLightningBolt" },
  { name: "Freezing Shards",  buildId: "Metadata/Items/Gems/SkillGemFreezingShards" },
  { name: "Comet",            buildId: "Metadata/Items/Gems/SkillGemComet" },
  { name: "Arc",              buildId: "Metadata/Items/Gems/SkillGemArc" },
  { name: "Glacial Cascade",  buildId: "Metadata/Items/Gems/SkillGemGlacialCascade" },
  { name: "Orb of Storms",    buildId: "Metadata/Items/Gems/SkillGemOrbOfStorms" },
  { name: "Flameblast",       buildId: "Metadata/Items/Gems/SkillGemFlameblast" },
  { name: "Volcanic Fissure", buildId: "Metadata/Items/Gems/SkillGemVolcanicFissure" },
  { name: "Ball Lightning",   buildId: "Metadata/Items/Gems/SkillGemBallLightning" },
  { name: "Spark",            buildId: "Metadata/Items/Gems/SkillGemSpark" },
  { name: "Frost Bomb",       buildId: "Metadata/Items/Gems/SkillGemFrostBomb" },
  { name: "Ice Nova",         buildId: "Metadata/Items/Gems/SkillGemIceNova" },

  // Monk
  { name: "Ice Strike",       buildId: "Metadata/Items/Gems/SkillGemIceStrike" },
  { name: "Tempest Bell",     buildId: "Metadata/Items/Gem/SkillGemTempestBell" },
  { name: "Falling Thunder",  buildId: "Metadata/Items/Gems/SkillGemFallingThunder" },
  { name: "Hand of Chayula",  buildId: "Metadata/Items/Gem/SkillGemHandOfChayula" },
  { name: "Killing Palm",     buildId: "Metadata/Items/Gems/SkillGemKillingPalm" },
  { name: "Whirling Assault", buildId: "Metadata/Items/Gems/SkillGemWhirlingAssault" },
  { name: "Herald of Thunder",buildId: "Metadata/Items/Gems/UniqueSkillGemHeraldOfThunder" },
  { name: "Staggering Palm",  buildId: "Metadata/Items/Gems/SkillGemStaggeringPalm" },
  { name: "Flicker Strike",   buildId: "Metadata/Items/Gems/SkillGemFlickerStrike" },

  // Mercenary
  { name: "Fragmentation Rounds", buildId: "Metadata/Items/Gem/SkillGemFragmentationRounds" },
  { name: "Explosive Grenade",    buildId: "Metadata/Items/Gem/SkillGemExplosiveGrenade" },
  { name: "Gas Grenade",          buildId: "Metadata/Items/Gem/SkillGemGasGrenade" },
  { name: "Flash Grenade",        buildId: "Metadata/Items/Gem/SkillGemFlashGrenade" },
  { name: "Incendiary Shot",      buildId: "Metadata/Items/Gem/SkillGemIncendiaryShot" },
  { name: "Glacial Bolt",         buildId: "Metadata/Items/Gem/SkillGemGlacialBolt" },
  { name: "Voltaic Grenade",      buildId: "Metadata/Items/Gems/SkillGemVoltaicGrenade" },

  // General / Cross-class
  { name: "Flame Wall",     buildId: "Metadata/Items/Gems/SkillGemFlameWall" },
  { name: "Sniper's Mark",  buildId: "Metadata/Items/Gems/SkillGemSnipersMark" },
  { name: "Conductivity",   buildId: "Metadata/Items/Gems/SkillGemConductivity" },
  { name: "Flammability",   buildId: "Metadata/Items/Gems/SkillGemFlammability" },
];
