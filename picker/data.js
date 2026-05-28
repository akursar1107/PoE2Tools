const ascendancies = [
  { class: "Warrior",    name: "Titan" },
  { class: "Warrior",    name: "Warbringer" },
  { class: "Ranger",     name: "Deadeye" },
  { class: "Ranger",     name: "Pathfinder" },
  { class: "Witch",      name: "Infernalist" },
  { class: "Witch",      name: "Blood Mage" },
  { class: "Sorceress",  name: "Stormweaver" },
  { class: "Sorceress",  name: "Chronomancer" },
  { class: "Mercenary",  name: "Witchhunter" },
  { class: "Mercenary",  name: "Gemling Legionnaire" },
  { class: "Monk",       name: "Invoker" },
  { class: "Monk",       name: "Acolyte of Chayula" },
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
