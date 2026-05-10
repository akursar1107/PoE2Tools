import relicsData from '../data/relics.json'

// Keywords to match in-game mod text → our mod id
// Keys are currency-type drops (keys, gold, etc.)
const MOD_KEYWORDS = [
  { id: 'honor_resistance', patterns: ['honour resistance', 'honor resistance'] },
  { id: 'max_honor',        patterns: ['maximum honour', 'maximum honor'] },
  { id: 'honor_regen',      patterns: ['honour regeneration', 'honor regeneration'] },
  { id: 'boon_effect',      patterns: ['boon effect'] },
  { id: 'affliction_reduction', patterns: ['affliction effect', 'affliction'] },
  { id: 'currency_quantity', patterns: ['currency quantity', 'quantity of keys', 'quantity of gold', 'quantity of currency'] },
  { id: 'unique_rarity',    patterns: ['unique item rarity'] },
  { id: 'boss_damage',      patterns: ['damage against bosses', 'boss damage'] },
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
