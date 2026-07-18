// Pure altar placement logic — no framework dependencies, unit-testable.

export const COLS = 5
export const ROWS = 4

/**
 * Effective footprint of a relic, accounting for 90° rotation.
 * Placements carry an optional `rotated` flag; inventory relics don't.
 */
export function effectiveDims(relic, rotated = false) {
  return rotated
    ? { width: relic.height, height: relic.width }
    : { width: relic.width, height: relic.height }
}

/**
 * Check whether `relic` can be placed at (col, row) on the altar.
 * Fails if any covered cell is out of bounds, blocked, or already covered
 * by another placed relic. `currentRelicId` ignores the relic being moved
 * so it can be re-placed over its own current cells. `rotated` applies a
 * 90° rotation to the candidate; existing placements honour their own flags.
 */
export function canPlace(relic, col, row, altar, inventory, blockedCells, currentRelicId = null, rotated = false) {
  const { width, height } = effectiveDims(relic, rotated)
  const cells = []
  for (let c = col; c < col + width; c++) {
    for (let r = row; r < row + height; r++) {
      cells.push({ col: c, row: r })
    }
  }

  if (cells.some(c => c.col >= COLS || c.row >= ROWS || c.col < 0 || c.row < 0)) return false
  if (cells.some(c => blockedCells.some(b => b.col === c.col && b.row === c.row))) return false

  const otherPlacements = altar.filter(p => p.relicId !== currentRelicId)
  for (const placed of otherPlacements) {
    const placedRelic = inventory.find(r => r.id === placed.relicId)
    if (!placedRelic) continue
    const dims = effectiveDims(placedRelic, placed.rotated)
    for (let c = placed.col; c < placed.col + dims.width; c++) {
      for (let r = placed.row; r < placed.row + dims.height; r++) {
        if (cells.some(cell => cell.col === c && cell.row === r)) return false
      }
    }
  }
  return true
}

/**
 * Toggle a placed relic's rotation in place. Pure — returns a NEW altar
 * array, or the same array unchanged when rotation isn't possible
 * (unknown relic, square relic, or rotated footprint wouldn't fit).
 */
export function tryRotate(relicId, altar, inventory, blockedCells) {
  const placement = altar.find(p => p.relicId === relicId)
  const relic = inventory.find(r => r.id === relicId)
  if (!placement || !relic || relic.width === relic.height) return altar

  const rotated = !placement.rotated
  if (!canPlace(relic, placement.col, placement.row, altar, inventory, blockedCells, relicId, rotated)) {
    return altar
  }
  return altar.map(p => (p.relicId === relicId ? { ...p, rotated } : p))
}

/**
 * Greedy auto-optimizer: among inventory relics not already on the altar
 * that carry `statKey`, place them highest-value-first into the first free
 * slot (top-left scan). Pure — takes state, returns new state.
 *
 * Returns { altar, placed } where `altar` is a NEW placements array
 * (existing + newly placed) and `placed` is how many were added.
 */
export function optimizePlacements(statKey, inventory, altar, blockedCells) {
  const alreadyPlaced = new Set(altar.map(p => p.relicId))
  const candidates = inventory
    .filter(r => !alreadyPlaced.has(r.id))
    .filter(r => r.mods?.some(m => m.stat === statKey))
    .sort((a, b) => {
      const aVal = a.mods.filter(m => m.stat === statKey).reduce((sum, m) => sum + (m.value || 0), 0)
      const bVal = b.mods.filter(m => m.stat === statKey).reduce((sum, m) => sum + (m.value || 0), 0)
      return bVal - aVal
    })

  const newAltar = [...altar]
  let placed = 0

  for (const relic of candidates) {
    let found = false
    for (let row = 0; row < ROWS && !found; row++) {
      for (let col = 0; col < COLS && !found; col++) {
        // Prefer the natural orientation; rotate only if it doesn't fit
        for (const rotated of [false, true]) {
          if (canPlace(relic, col, row, newAltar, inventory, blockedCells, null, rotated)) {
            newAltar.push({ relicId: relic.id, col, row, ...(rotated && { rotated: true }) })
            placed++
            found = true
            break
          }
        }
      }
    }
  }

  return { altar: newAltar, placed }
}
