import test from 'node:test'
import assert from 'node:assert/strict'

import { canPlace, optimizePlacements, tryRotate, effectiveDims, COLS, ROWS } from './altarLogic.js'

const BLOCKED = [{ col: 0, row: 3 }, { col: 4, row: 0 }]

const seal = (id, mods = []) => ({ id, width: 2, height: 1, mods })
const coffer = (id, mods = []) => ({ id, width: 2, height: 2, mods })
const vase = (id, mods = []) => ({ id, width: 1, height: 4, mods })
const incense = (id, mods = []) => ({ id, width: 4, height: 1, mods })

test('grid is 5x4 as in-game', () => {
  assert.equal(COLS, 5)
  assert.equal(ROWS, 4)
})

test('canPlace accepts a relic on an empty altar', () => {
  assert.equal(canPlace(seal('a'), 0, 0, [], [], BLOCKED), true)
})

test('canPlace rejects out-of-bounds placements', () => {
  assert.equal(canPlace(incense('a'), 2, 0, [], [], BLOCKED), false) // 2+4 > 5 cols
  assert.equal(canPlace(vase('a'), 0, 1, [], [], BLOCKED), false)    // 1+4 > 4 rows
  assert.equal(canPlace(seal('a'), -1, 0, [], [], BLOCKED), false)
  assert.equal(canPlace(seal('a'), 0, -1, [], [], BLOCKED), false)
})

test('canPlace rejects blocked corner cells', () => {
  assert.equal(canPlace(seal('a'), 0, 3, [], [], BLOCKED), false) // covers (0,3)
  assert.equal(canPlace(seal('a'), 3, 0, [], [], BLOCKED), false) // covers (4,0)
  assert.equal(canPlace(seal('a'), 1, 3, [], [], BLOCKED), true)  // (1,3),(2,3) free
})

test('canPlace rejects overlap with placed relics but allows adjacency', () => {
  const inv = [coffer('big'), seal('s')]
  const altar = [{ relicId: 'big', col: 0, row: 0 }]

  assert.equal(canPlace(seal('s'), 1, 1, altar, inv, BLOCKED), false) // inside coffer
  assert.equal(canPlace(seal('s'), 0, 0, altar, inv, BLOCKED), false) // shared corner
  assert.equal(canPlace(seal('s'), 2, 0, altar, inv, BLOCKED), true)  // alongside
  assert.equal(canPlace(seal('s'), 0, 2, altar, inv, BLOCKED), true)  // below
})

test('canPlace ignores the relic being moved (currentRelicId)', () => {
  const inv = [seal('a'), seal('b')]
  const altar = [{ relicId: 'a', col: 0, row: 0 }]

  // Re-placing 'a' over its own cells is fine (e.g. drag onto itself)
  assert.equal(canPlace(inv[0], 0, 0, altar, inv, BLOCKED, 'a'), true)
  // ...but it still cannot overlap another relic
  assert.equal(canPlace(inv[0], 0, 0, [{ relicId: 'b', col: 0, row: 0 }], inv, BLOCKED, 'a'), false)
})

test('canPlace skips altar entries whose relic is gone from inventory', () => {
  const altar = [{ relicId: 'ghost', col: 0, row: 0 }]
  assert.equal(canPlace(seal('a'), 0, 0, altar, [], BLOCKED), true)
})

test('optimizePlacements places highest-value candidates first', () => {
  const mod = v => [{ stat: 'honor_resistance', value: v }]
  const inv = [seal('low', mod(8)), seal('high', mod(22)), seal('mid', mod(15))]
  const { altar, placed } = optimizePlacements('honor_resistance', inv, [], BLOCKED)

  assert.equal(placed, 3)
  assert.deepEqual(altar[0], { relicId: 'high', col: 0, row: 0 })
  assert.deepEqual(altar[1], { relicId: 'mid', col: 2, row: 0 })
  assert.deepEqual(altar[2], { relicId: 'low', col: 0, row: 1 })
})

test('optimizePlacements ignores relics without the stat and already placed', () => {
  const inv = [
    seal('has-stat', [{ stat: 'honor_resistance', value: 10 }]),
    seal('no-stat', [{ stat: 'max_honor', value: 50 }]),
    seal('placed', [{ stat: 'honor_resistance', value: 20 }]),
  ]
  const altar = [{ relicId: 'placed', col: 2, row: 0 }]
  const { altar: result, placed } = optimizePlacements('honor_resistance', inv, altar, BLOCKED)

  assert.equal(placed, 1)
  assert.equal(result.length, 2)
  assert.deepEqual(result[1], { relicId: 'has-stat', col: 0, row: 0 })
})

test('optimizePlacements returns 0 when nothing fits', () => {
  // Fill the grid with seals so only scattered single cells remain
  const inv = [seal('s1'), seal('s2'), seal('s3'), seal('s4'), seal('s5'), seal('s6'), seal('s7')]
  const altar = [
    { relicId: 's1', col: 0, row: 0 }, { relicId: 's2', col: 2, row: 0 },
    { relicId: 's3', col: 0, row: 1 }, { relicId: 's4', col: 2, row: 1 },
    { relicId: 's5', col: 0, row: 2 }, { relicId: 's6', col: 2, row: 2 },
    { relicId: 's7', col: 2, row: 3 },
  ]
  inv.push(coffer('too-big', [{ stat: 'max_honor', value: 10 }]))

  const { placed } = optimizePlacements('max_honor', inv, altar, BLOCKED)
  assert.equal(placed, 0)
})

test('optimizePlacements packs mixed sizes around each other', () => {
  const mod = v => [{ stat: 'boss_damage_taken', value: v }]
  const inv = [vase('v', mod(10)), coffer('c', mod(20))]
  const { altar, placed } = optimizePlacements('boss_damage_taken', inv, [], BLOCKED)

  assert.equal(placed, 2)
  assert.deepEqual(altar[0], { relicId: 'c', col: 0, row: 0 }) // higher value first
  // coffer covers cols 0-1 rows 0-1; vase (1x4) first fits in col 2
  assert.deepEqual(altar[1], { relicId: 'v', col: 2, row: 0 })
})

test('optimizePlacements does not mutate the input altar', () => {
  const inv = [seal('a', [{ stat: 'max_honor', value: 10 }])]
  const altar = [{ relicId: 'keep', col: 0, row: 0 }]
  const before = JSON.stringify(altar)

  optimizePlacements('max_honor', inv, altar, BLOCKED)
  assert.equal(JSON.stringify(altar), before)
})

// ── Rotation ──────────────────────────────────────────────────────────────────

test('effectiveDims swaps width/height only when rotated', () => {
  const relic = { width: 2, height: 1 }
  assert.deepEqual(effectiveDims(relic, false), { width: 2, height: 1 })
  assert.deepEqual(effectiveDims(relic, true), { width: 1, height: 2 })
})

test('canPlace honours candidate rotation', () => {
  const inv = [coffer('big'), seal('s')]
  const altar = [{ relicId: 'big', col: 0, row: 0 }] // covers cols 0-1, rows 0-1

  // Unrotated 2x1 at (4,1) sticks out of the grid; rotated 1x2 fits
  assert.equal(canPlace(seal('s'), 4, 1, altar, inv, BLOCKED, null, false), false)
  assert.equal(canPlace(seal('s'), 4, 1, altar, inv, BLOCKED, null, true), true)
})

test('canPlace honours the rotated footprint of placed relics', () => {
  const inv = [seal('a'), seal('b')]
  // 'a' placed rotated at (4,1): covers (4,1) and (4,2), not (5,1)
  const rotatedAltar = [{ relicId: 'a', col: 4, row: 1, rotated: true }]
  assert.equal(canPlace(seal('b'), 3, 2, rotatedAltar, inv, BLOCKED), false) // clips (4,2)

  const flatAltar = [{ relicId: 'a', col: 4, row: 1 }] // covers (4,1),(5,1)
  assert.equal(canPlace(seal('b'), 3, 2, flatAltar, inv, BLOCKED), true)
})

test('tryRotate rotates a placed relic when the new footprint fits', () => {
  const inv = [seal('s')]
  const altar = [{ relicId: 's', col: 0, row: 0 }]
  const result = tryRotate('s', altar, inv, BLOCKED)
  assert.deepEqual(result, [{ relicId: 's', col: 0, row: 0, rotated: true }])
})

test('tryRotate is a no-op when the rotated footprint would collide', () => {
  const inv = [seal('a'), seal('b')]
  // 'a' at (3,1) flat covers (3,1),(4,1); rotating would cover (3,1),(3,2)
  // but 'b' already covers (3,2),(4,2)
  const altar = [
    { relicId: 'a', col: 3, row: 1 },
    { relicId: 'b', col: 3, row: 2 },
  ]
  assert.equal(tryRotate('a', altar, inv, BLOCKED), altar) // same reference = no change
})

test('tryRotate is a no-op for square relics and unknown ids', () => {
  const inv = [coffer('c')]
  const altar = [{ relicId: 'c', col: 0, row: 0 }]
  assert.equal(tryRotate('c', altar, inv, BLOCKED), altar)
  assert.equal(tryRotate('ghost', altar, inv, BLOCKED), altar)
})

test('tryRotate toggles back to the original orientation', () => {
  const inv = [seal('s')]
  const once = tryRotate('s', [{ relicId: 's', col: 0, row: 0 }], inv, BLOCKED)
  const twice = tryRotate('s', once, inv, BLOCKED)
  assert.deepEqual(twice, [{ relicId: 's', col: 0, row: 0, rotated: false }])
})

test('optimizePlacements rotates a relic when only that orientation fits', () => {
  const mod = [{ stat: 'honor_resistance', value: 10 }]
  const inv = [
    coffer('c1'), coffer('c2'),
    seal('s1'), seal('s2'), seal('s3'),
    seal('target', mod),
  ]
  // Fill the grid so the only free cells are the vertical strip (4,1)-(4,3)
  // plus the isolated cell (1,3) — a flat 2x1 fits nowhere.
  const altar = [
    { relicId: 'c1', col: 0, row: 0 }, { relicId: 'c2', col: 2, row: 0 },
    { relicId: 's1', col: 0, row: 2 }, { relicId: 's2', col: 2, row: 2 },
    { relicId: 's3', col: 2, row: 3 },
  ]
  const { altar: result, placed } = optimizePlacements('honor_resistance', inv, altar, BLOCKED)

  assert.equal(placed, 1)
  assert.deepEqual(result[result.length - 1], { relicId: 'target', col: 4, row: 1, rotated: true })
})
