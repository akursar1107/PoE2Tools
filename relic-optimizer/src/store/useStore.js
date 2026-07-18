import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { canPlace, optimizePlacements, tryRotate } from '../utils/altarLogic'

// Re-exported so components can import placement logic from the store.
export { canPlace }

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

    rotateRelic: (relicId) =>
      set(s => ({ altar: tryRotate(relicId, s.altar, s.inventory, s.blockedCells) })),

    clearAltar: () => set({ altar: [] }),

    optimizeForStat: (statKey) =>
      set(s => {
        const { altar, placed } = optimizePlacements(statKey, s.inventory, s.altar, s.blockedCells)
        return { altar, lastOptimizePlaced: placed }
      }),
  }),
  {
    name: 'poe2-relic-optimizer',
    // v1: relic data overhaul (real game mods replaced placeholder stats) —
    // v0 persisted inventories hold obsolete stats and are discarded.
    version: 1,
    partialize: (s) => ({ inventory: s.inventory, altar: s.altar }),
  }
))

export default useStore
