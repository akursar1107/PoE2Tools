import relicsData from '../data/relics.json' with { type: 'json' }

// Keywords to match in-game mod text → our mod id.
// Order matters: more specific patterns must come before broader ones they
// contain (e.g. 'maximum honour resistance' before 'honour resistance',
// 'rare monsters take' before 'monsters take').
// Exported for the data-sync test — every pool mod needs a keyword and vice versa.
export const MOD_KEYWORDS = [
  { id: 'max_honor_resistance', patterns: ['maximum honour resistance', 'maximum honor resistance'] },
  { id: 'honor_resistance',     patterns: ['to honour resistance', 'to honor resistance'] },
  { id: 'max_honor',            patterns: ['increased maximum honour', 'increased maximum honor'] },
  { id: 'defences',             patterns: ['increased defences', 'increased defenses'] },
  { id: 'starting_sacred_water', patterns: ['sacred water at the start'] },
  { id: 'honor_restored',       patterns: ['increased honour restored', 'increased honor restored'] },
  { id: 'relic_quantity',       patterns: ['quantity of relics'] },
  { id: 'double_sacred_water_monsters', patterns: ['to drop double sacred water'] },
  { id: 'double_sacred_water_fountains', patterns: ['to grant double sacred water'] },
  { id: 'slow_resistance',      patterns: ['slowing potency'] },
  { id: 'crit_damage_reduction', patterns: ['critical damage bonus'] },
  { id: 'key_quantity',         patterns: ['quantity of keys'] },
  { id: 'dodge_roll_distance',  patterns: ['dodge roll distance'] },
  { id: 'rare_damage_taken',    patterns: ['rare monsters take'] },
  { id: 'boss_damage_taken',    patterns: ['bosses take'] },
  { id: 'monster_damage_taken', patterns: ['monsters take'] },
  { id: 'monsters_reduced_damage', patterns: ['monsters deal'] },
  { id: 'monster_reduced_speed', patterns: ['reduced attack, cast and movement speed'] },
  { id: 'merchant_extra_choice', patterns: ['merchant has an additional choice'] },
  { id: 'merchant_prices',      patterns: ['merchant prices'] },
  { id: 'honor_on_boss_kill',   patterns: ['honour on killing a boss', 'honor on killing a boss'] },
  { id: 'honor_on_shrine',      patterns: ['maraketh shrine'] },
  { id: 'honor_on_key',         patterns: ['honour on picking up a key', 'honor on picking up a key'] },
  { id: 'honor_on_room_complete', patterns: ['honour on room completion', 'honor on room completion'] },
  { id: 'rooms_revealed',       patterns: ['room is revealed', 'rooms are revealed'] },
  { id: 'avoid_affliction',     patterns: ['avoid gaining an affliction'] },
  { id: 'key_upgrade_chance',   patterns: ['keys to upgrade'] },
  { id: 'extra_key_chance',     patterns: ['gain a key'] },
  { id: 'honor_death_cheat',    patterns: ['lose all your honour', 'lose all your honor'] },
  { id: 'sacred_water_on_room', patterns: ['sacred water when you complete'] },
]

function matchMod(line) {
  const lower = line.toLowerCase()
  for (const { id, patterns } of MOD_KEYWORDS) {
    if (patterns.some(p => lower.includes(p))) {
      return id
    }
  }
  return null
}

function extractNumber(line) {
  const match = line.match(/[-+]?(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : null
}

function matchBaseType(itemName) {
  const lower = itemName.toLowerCase()
  return relicsData.baseTiers.find(b => lower.includes(b.name.toLowerCase())) || relicsData.baseTiers[0]
}

function matchUnique(itemName) {
  const lower = itemName.toLowerCase()
  return relicsData.uniqueRelics.find(u => lower.includes(u.name.toLowerCase()))
}

/**
 * Parse PoE2 item clipboard text into a relic object.
 * Returns null if the text doesn't look like a relic.
 * Returns { relic, warnings } on success.
 */
export function parseRelicText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  const itemClassLine = lines.find(l => l.toLowerCase().startsWith('item class:'))
  if (!itemClassLine || !itemClassLine.toLowerCase().includes('relic')) {
    return null
  }

  const rarityLine = lines.find(l => l.toLowerCase().startsWith('rarity:'))
  if (!rarityLine) return null
  const rarity = rarityLine.split(':')[1].trim().toLowerCase()

  const rarityIdx = lines.indexOf(rarityLine)
  const itemName = lines[rarityIdx + 1] || ''

  // Mod lines sit between separator blocks (--------); skip Item Level line
  const separators = lines.reduce((acc, l, i) => l.startsWith('---') ? [...acc, i] : acc, [])

  let modLines = []
  if (separators.length >= 2) {
    const start = separators[1] + 1
    const end = separators[2] !== undefined ? separators[2] : lines.length
    modLines = lines.slice(start, end).filter(l => !l.toLowerCase().startsWith('item level'))
  }

  const warnings = []

  if (rarity === 'unique') {
    const unique = matchUnique(itemName)
    if (!unique) {
      warnings.push(`Unique "${itemName}" not recognised — added as first known unique.`)
      const fallback = relicsData.uniqueRelics[0]
      const base = relicsData.baseTiers.find(b => b.id === fallback.baseId)
      return {
        relic: {
          name: fallback.name, rarity: 'unique', isUnique: true,
          uniqueId: fallback.id, baseId: fallback.baseId,
          width: fallback.width, height: fallback.height,
          tier: base?.tier || 'large', effects: fallback.effects, mods: [],
        },
        warnings,
      }
    }
    const base = relicsData.baseTiers.find(b => b.id === unique.baseId)
    return {
      relic: {
        name: unique.name, rarity: 'unique', isUnique: true,
        uniqueId: unique.id, baseId: unique.baseId,
        width: unique.width, height: unique.height,
        tier: base?.tier || 'large', effects: unique.effects, mods: [],
      },
      warnings,
    }
  }

  // Magic relic
  const base = matchBaseType(itemName)
  const allMods = [
    ...relicsData.modifierPool.small,
    ...relicsData.modifierPool.medium,
    ...relicsData.modifierPool.large,
  ]

  const mods = modLines.map(line => {
    const modId = matchMod(line)
    const value = extractNumber(line)
    if (!modId) {
      warnings.push(`Unrecognised mod: "${line}"`)
      return { stat: null, label: line, value, unit: null, unknown: true }
    }
    const def = allMods.find(m => m.id === modId)
    return { stat: def.stat, label: def.label, value: value ?? 0, unit: def.unit }
  })

  return {
    relic: {
      name: itemName, rarity: 'magic', isUnique: false,
      baseId: base.id, width: base.width, height: base.height,
      tier: base.tier, mods, effects: [],
    },
    warnings,
  }
}
