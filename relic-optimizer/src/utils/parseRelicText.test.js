import test from 'node:test'
import assert from 'node:assert/strict'

import { parseRelicText } from './parseRelicText.js'

const MAGIC_SEAL = `Item Class: Relics
Rarity: Magic
Honourable Seal Relic of Merit
--------
Item Level: 80
--------
25% increased maximum Honour
+20% to Honour Resistance
--------`

const UNIQUE_LAST_FLAME = `Item Class: Relics
Rarity: Unique
The Last Flame
Incense Relic
--------
Item Level: 80
--------
Zarokh, the Temporal drops Temporalis
Maximum Honour is 1
Damage taken cannot be Absorbed
Cannot be used with Trials below level 80
This item is destroyed when applied to a Trial
--------`

test('returns null for non-relic item text', () => {
  const text = `Item Class: Body Armours\nRarity: Rare\nDoom Wrap\n--------`
  assert.equal(parseRelicText(text), null)
})

test('returns null when Item Class line is missing', () => {
  assert.equal(parseRelicText('Rarity: Magic\nSeal Relic'), null)
})

test('returns null when Rarity line is missing', () => {
  assert.equal(parseRelicText('Item Class: Relics\nSeal Relic\n--------'), null)
})

test('parses a magic relic with base type and resolved mods', () => {
  const { relic, warnings } = parseRelicText(MAGIC_SEAL)

  assert.equal(relic.rarity, 'magic')
  assert.equal(relic.isUnique, false)
  assert.equal(relic.baseId, 'seal')
  assert.equal(relic.width, 2)
  assert.equal(relic.height, 1)
  assert.equal(relic.tier, 'small')

  assert.deepEqual(warnings, [])
  assert.equal(relic.mods.length, 2)
  assert.deepEqual(relic.mods[0], {
    stat: 'max_honor', label: 'Maximum Honour', value: 25, unit: '%',
  })
  assert.deepEqual(relic.mods[1], {
    stat: 'honor_resistance', label: 'Honour Resistance', value: 20, unit: '%',
  })
})

test('matches American spelling of Honor', () => {
  const text = `Item Class: Relics
Rarity: Magic
Moral Urn Relic
--------
Item Level: 45
--------
14% increased maximum Honor
+11% to Honor Resistance
--------`
  const { relic, warnings } = parseRelicText(text)

  assert.deepEqual(warnings, [])
  assert.equal(relic.baseId, 'urn')
  assert.equal(relic.mods[0].stat, 'max_honor')
  assert.equal(relic.mods[1].stat, 'honor_resistance')
})

test('parses decimal values (Dodge Roll distance)', () => {
  const text = `Item Class: Relics
Rarity: Magic
Seal Relic of Lunging
--------
Item Level: 20
--------
+0.4 metres to Dodge Roll distance
--------`
  const { relic } = parseRelicText(text)
  assert.equal(relic.mods[0].stat, 'dodge_roll_distance')
  assert.equal(relic.mods[0].value, 0.4)
})

test('Maximum Honour Resistance is not misread as Honour Resistance', () => {
  const text = `Item Class: Relics
Rarity: Magic
Coffer Relic of Excellence
--------
Item Level: 70
--------
+3% to Maximum Honour Resistance
--------`
  const { relic, warnings } = parseRelicText(text)
  assert.deepEqual(warnings, [])
  assert.equal(relic.mods[0].stat, 'max_honor_resistance')
})

test('Rare Monsters take is not misread as Monsters take', () => {
  const text = `Item Class: Relics
Rarity: Magic
Transgressor's Tapestry Relic
--------
Item Level: 30
--------
Rare Monsters take 14% increased Damage
--------`
  const { relic, warnings } = parseRelicText(text)
  assert.deepEqual(warnings, [])
  assert.equal(relic.mods[0].stat, 'rare_damage_taken')
})

test('flags unrecognised mods with a warning', () => {
  const text = `Item Class: Relics
Rarity: Magic
Seal Relic
--------
Item Level: 10
--------
5% increased Movement Speed
--------`
  const { relic, warnings } = parseRelicText(text)
  assert.equal(warnings.length, 1)
  assert.match(warnings[0], /Unrecognised mod/)
  assert.equal(relic.mods[0].unknown, true)
  assert.equal(relic.mods[0].stat, null)
})

test('parses a known unique relic', () => {
  const { relic, warnings } = parseRelicText(UNIQUE_LAST_FLAME)

  assert.deepEqual(warnings, [])
  assert.equal(relic.isUnique, true)
  assert.equal(relic.name, 'The Last Flame')
  assert.equal(relic.uniqueId, 'last_flame')
  assert.equal(relic.baseId, 'incense')
  assert.equal(relic.width, 4)
  assert.equal(relic.height, 1)
  assert.equal(relic.mods.length, 0)
  assert.ok(relic.effects.some(e => e.includes('Temporalis')))
})

test('unknown unique falls back with a warning', () => {
  const text = `Item Class: Relics
Rarity: Unique
Some New Relic
Coffer Relic
--------
Item Level: 80
--------`
  const { relic, warnings } = parseRelicText(text)
  assert.equal(warnings.length, 1)
  assert.match(warnings[0], /not recognised/)
  assert.equal(relic.isUnique, true)
})

test('ignores the Item Level block when extracting mods', () => {
  const text = `Item Class: Relics
Rarity: Magic
Seal Relic
--------
Item Level: 82
--------
10% increased Honour restored
--------`
  const { relic, warnings } = parseRelicText(text)
  assert.deepEqual(warnings, [])
  assert.equal(relic.mods.length, 1)
  assert.equal(relic.mods[0].stat, 'honor_restored')
  assert.equal(relic.mods[0].value, 10)
})
