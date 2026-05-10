import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const COLS = 5
const ROWS = 4

export function canPlace(relic, col, row, altar, inventory, blockedCells, currentRelicId = null) {
  const cells = []
  for (let c = col; c < col + relic.width; c++) {
    for (let r = row; r < row + relic.height; r++) {
      cells.push({ col: c, row: r })
    }
  }

  if (cells.some(c => c.col >= COLS || c.row >= ROWS || c.col < 0 || c.row < 0)) return false
  if (cells.some(c => blockedCells.some(b => b.col === c.col && b.row === c.row))) return false

  const otherPlacements = altar.filter(p => p.relicId !== currentRelicId)
  for (const placed of otherPlacements) {
    const placedRelic = inventory.find(r => r.id === placed.relicId)
    if (!placedRelic) continue
    for (let c = placed.col; c < placed.col + placedRelic.width; c++) {
      for (let r = placed.row; r < placed.row + placedRelic.height; r++) {
        if (cells.some(cell => cell.col === c && cell.row === r)) return false
      }
    }
  }
  return true
}

const useStore = create(persist(
  (set) => ({
    inventory: [],
    altar: [],
    blockedCells: [{ col: 0, row: 3 }, { col: 4, row: 0 }],
    lastOptimizePlaced: 0,

    addToInventory: (relic) =>
      set(s => ({ inventory: [...s.inventory, relic] })),

    removeFromInventory: (id) =>
      set(s => ({
        inventory: s.inventory.filter(r => r.id !== id),
        altar: s.altar.filter(p => p.relicId !== id),
      })),

    placeRelic: (relicId, col, row) =>
      set(s => ({
        altar: [...s.altar.filter(p => p.relicId !== relicId), { relicId, col, row }],
      })),

    removeFromAltar: (relicId) =>
      set(s => ({ altar: s.altar.filter(p => p.relicId !== relicId) })),

    clearAltar: () => set({ altar: [] }),

    optimizeForStat: (statKey) =>
      set(s => {
        const alreadyPlaced = new Set(s.altar.map(p => p.relicId))
        // Relics not on the altar that have the target stat
        const candidates = s.inventory
          .filter(r => !alreadyPlaced.has(r.id))
          .filter(r => r.mods?.some(m => m.stat === statKey))
          .sort((a, b) => {
            const aVal = a.mods.filter(m => m.stat === statKey).reduce((sum, m) => sum + (m.value || 0), 0)
            const bVal = b.mods.filter(m => m.stat === statKey).reduce((sum, m) => sum + (m.value || 0), 0)
            return bVal - aVal
          })

        const newAltar = [...s.altar]
        let placed = 0

        for (const relic of candidates) {
          let found = false
          for (let row = 0; row < ROWS && !found; row++) {
            for (let col = 0; col < COLS && !found; col++) {
              if (canPlace(relic, col, row, newAltar, s.inventory, s.blockedCells)) {
                newAltar.push({ relicId: relic.id, col, row })
                placed++
                found = true
              }
            }
          }
        }

        return { altar: newAltar, lastOptimizePlaced: placed }
      }),
  }),
  { name: 'poe2-relic-optimizer' }
))

export default useStore
