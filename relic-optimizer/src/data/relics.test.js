import test from 'node:test'
import assert from 'node:assert/strict'

import relicsData from './relics.json' with { type: 'json' }
import { MOD_KEYWORDS } from '../utils/parseRelicText.js'

const TIERS = ['small', 'medium', 'large']

test('base tiers are well-formed and unique', () => {
  const ids = new Set()
  for (const base of relicsData.baseTiers) {
    assert.ok(base.id && !ids.has(base.id), `duplicate or missing base id: ${base.id}`)
    ids.add(base.id)
    assert.ok(base.width >= 1 && base.height >= 1, `${base.id}: bad dimensions`)
    assert.ok(TIERS.includes(base.tier), `${base.id}: bad tier ${base.tier}`)
  }
})

test('unique relics reference valid bases and have effects', () => {
  for (const unique of relicsData.uniqueRelics) {
    const base = relicsData.baseTiers.find(b => b.id === unique.baseId)
    assert.ok(base, `${unique.id}: unknown baseId ${unique.baseId}`)
    assert.equal(unique.width, base.width, `${unique.id}: width differs from base`)
    assert.equal(unique.height, base.height, `${unique.id}: height differs from base`)
    assert.ok(unique.effects.length > 0, `${unique.id}: no effects`)
    assert.equal(unique.destroyedOnUse, true, `${unique.id}: uniques are destroyed on use`)
  }
})

test('modifier pool entries are well-formed with unique ids per tier', () => {
  for (const tier of TIERS) {
    const pool = relicsData.modifierPool[tier]
    assert.ok(Array.isArray(pool) && pool.length > 0, `tier ${tier} is empty`)
    const ids = new Set()
    for (const mod of pool) {
      assert.ok(mod.id && !ids.has(mod.id), `${tier}: duplicate or missing mod id ${mod.id}`)
      ids.add(mod.id)
      assert.ok(mod.label && mod.text && mod.stat, `${tier}/${mod.id}: missing label/text/stat`)
      assert.ok(typeof mod.unit === 'string', `${tier}/${mod.id}: missing unit`)
      assert.ok(mod.min <= mod.max, `${tier}/${mod.id}: min > max`)
    }
  }
})

test('every pool mod is recognised by the paste parser', () => {
  const keywordIds = new Set(MOD_KEYWORDS.map(k => k.id))
  for (const tier of TIERS) {
    for (const mod of relicsData.modifierPool[tier]) {
      assert.ok(
        keywordIds.has(mod.id),
        `${tier} mod "${mod.id}" has no MOD_KEYWORDS entry — paste import will flag it unknown`,
      )
    }
  }
})

test('every parser keyword resolves to a pool mod', () => {
  const poolIds = new Set(TIERS.flatMap(t => relicsData.modifierPool[t].map(m => m.id)))
  for (const { id } of MOD_KEYWORDS) {
    assert.ok(poolIds.has(id), `MOD_KEYWORDS entry "${id}" matches no modifier in the pool`)
  }
})

test('keyword patterns have no duplicate ids', () => {
  const ids = MOD_KEYWORDS.map(k => k.id)
  assert.equal(new Set(ids).size, ids.length)
})
