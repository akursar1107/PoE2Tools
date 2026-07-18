import test from 'node:test'
import assert from 'node:assert/strict'

import { canPlace, optimizePlacements, COLS, ROWS } from './altarLogic.js'

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
