import test from 'node:test';
import assert from 'node:assert/strict';

import { skillGems } from '../data/skills.mjs';
import { supports } from '../data/supports.mjs';
import { filterEntries, getSkillsForSupport, getSupportCriteria, getSupportsForSkill, groupEntries } from './wiki-data.mjs';

test('filterEntries matches query across name, summary, and tags', () => {
  const entries = [
    {
      id: 'infernalist',
      name: 'Infernalist',
      summary: 'Demon form fire caster ascendancy',
      tags: ['witch', 'fire', 'minion'],
    },
    {
      id: 'chronomancer',
      name: 'Chronomancer',
      summary: 'Time magic and cooldown manipulation',
      tags: ['sorceress', 'utility'],
    },
  ];

  const filtered = filterEntries(entries, 'demon', []);

  assert.deepEqual(filtered.map((entry) => entry.id), ['infernalist']);
});

test('groupEntries groups ascendancies by className', () => {
  const entries = [
    { id: 'infernalist', className: 'Witch' },
    { id: 'blood-mage', className: 'Witch' },
    { id: 'deadeye', className: 'Ranger' },
  ];

  assert.deepEqual(groupEntries(entries, 'className'), {
    Ranger: [{ id: 'deadeye', className: 'Ranger' }],
    Witch: [
      { id: 'infernalist', className: 'Witch' },
      { id: 'blood-mage', className: 'Witch' },
    ],
  });
});

test('groupEntries groups skill gems by kind', () => {
  const entries = [
    { id: 'fireball', kind: 'spell' },
    { id: 'spark', kind: 'spell' },
    { id: 'boneshatter', kind: 'attack' },
  ];

  assert.deepEqual(groupEntries(entries, 'kind'), {
    attack: [{ id: 'boneshatter', kind: 'attack' }],
    spell: [
      { id: 'fireball', kind: 'spell' },
      { id: 'spark', kind: 'spell' },
    ],
  });
});

test('groupEntries groups support gems by category', () => {
  const entries = [
    { id: 'controlled-destruction', category: 'damage' },
    { id: 'added-fire-damage', category: 'damage' },
    { id: 'arcane-tempo', category: 'speed' },
  ];

  assert.deepEqual(groupEntries(entries, 'category'), {
    damage: [
      { id: 'controlled-destruction', category: 'damage' },
      { id: 'added-fire-damage', category: 'damage' },
    ],
    speed: [{ id: 'arcane-tempo', category: 'speed' }],
  });
});

test('all skill gems have kind and themes fields', () => {
  skillGems.forEach((skill) => {
    assert.ok(typeof skill.kind === 'string' && skill.kind.length > 0, `${skill.id} is missing kind field`);
    assert.ok(Array.isArray(skill.themes), `${skill.id} is missing themes array`);
  });
});

test('all support gems have category field', () => {
  supports.forEach((support) => {
    assert.ok(
      typeof support.category === 'string' && support.category.length > 0,
      `${support.id} is missing category field`,
    );
  });
});

test('filterEntries keeps only entries containing every selected tag', () => {
  const entries = [
    { id: 'fireball', name: 'Fireball', summary: 'Projectile spell', tags: ['spell', 'fire', 'projectile'] },
    { id: 'comet', name: 'Comet', summary: 'Big cold spell', tags: ['spell', 'cold', 'aoe'] },
    { id: 'spark', name: 'Spark', summary: 'Lightning projectile spell', tags: ['spell', 'lightning', 'projectile'] },
  ];

  const filtered = filterEntries(entries, '', ['spell', 'projectile']);

  assert.deepEqual(filtered.map((entry) => entry.id), ['fireball', 'spark']);
});

test('filterEntries matches nested ascendancy passive details', () => {
  const entries = [
    {
      id: 'infernalist',
      name: 'Infernalist',
      summary: 'Fire caster ascendancy',
      tags: ['witch', 'fire'],
      minorPassives: ['12% increased Critical Hit Chance'],
      notables: [
        {
          name: 'Mastered Darkness',
          modifiers: ['Demonflame has no maximum'],
        },
      ],
    },
  ];

  const filtered = filterEntries(entries, 'demonflame', []);

  assert.deepEqual(filtered.map((entry) => entry.id), ['infernalist']);
});

test('getSupportsForSkill returns alphabetized support gems for a skill', () => {
  const skill = {
    id: 'fireball',
    supportIds: ['controlled-destruction', 'arcane-tempo', 'added-fire-damage'],
  };

  const supports = [
    { id: 'arcane-tempo', name: 'Arcane Tempo' },
    { id: 'added-fire-damage', name: 'Added Fire Damage' },
    { id: 'controlled-destruction', name: 'Controlled Destruction' },
    { id: 'concentrated-effect', name: 'Concentrated Effect' },
  ];

  const related = getSupportsForSkill(skill, supports);

  assert.deepEqual(
    related.map((support) => support.id),
    ['added-fire-damage', 'arcane-tempo', 'controlled-destruction'],
  );
});

test('getSupportsForSkill falls back to tag-based compatibility when supportIds are absent', () => {
  const skill = {
    id: 'frost-bomb',
    name: 'Frost Bomb',
    tags: ['spell', 'cold', 'aoe'],
  };

  const supports = [
    { id: 'arcane-tempo', name: 'Arcane Tempo', worksWith: ['spell'] },
    { id: 'controlled-destruction', name: 'Controlled Destruction', worksWith: ['spell'] },
    { id: 'concentrated-effect', name: 'Concentrated Effect', worksWith: ['aoe'] },
    { id: 'added-lightning-damage', name: 'Added Lightning Damage', worksWith: ['lightning'] },
  ];

  const related = getSupportsForSkill(skill, supports);

  assert.deepEqual(
    related.map((support) => support.id),
    ['arcane-tempo', 'concentrated-effect', 'controlled-destruction'],
  );
});

test('getSkillsForSupport returns alphabetized compatible skills for a support gem', () => {
  const support = {
    id: 'arcane-tempo',
    name: 'Arcane Tempo',
    worksWith: ['spell'],
  };

  const skills = [
    { id: 'spark', name: 'Spark', tags: ['spell', 'projectile', 'lightning'] },
    { id: 'fireball', name: 'Fireball', supportIds: ['arcane-tempo'], tags: ['spell', 'projectile', 'fire'] },
    { id: 'boneshatter', name: 'Boneshatter', tags: ['attack', 'melee', 'physical'] },
    { id: 'comet', name: 'Comet', tags: ['spell', 'cold', 'aoe'] },
  ];

  const related = getSkillsForSupport(support, skills, [
    support,
    { id: 'heft', name: 'Heft', worksWith: ['attack', 'melee'] },
  ]);

  assert.deepEqual(
    related.map((skill) => skill.id),
    ['comet', 'fireball', 'spark'],
  );
});

test('getSupportsForSkill respects matchAll tags for tighter compatibility', () => {
  const skill = {
    id: 'fragmentation-rounds',
    name: 'Fragmentation Rounds',
    tags: ['attack', 'projectile', 'crossbow'],
  };

  const supports = [
    { id: 'scattershot', name: 'Scattershot', matchAll: ['projectile', 'bow'] },
    { id: 'pierce', name: 'Pierce', worksWith: ['projectile'] },
    { id: 'crossbow-tempo', name: 'Crossbow Tempo', matchAll: ['attack', 'crossbow'] },
  ];

  const related = getSupportsForSkill(skill, supports);

  assert.deepEqual(
    related.map((support) => support.id),
    ['crossbow-tempo', 'pierce'],
  );
});

test('getSupportsForSkill merges curated and inferred supports without duplicates', () => {
  const skill = {
    id: 'fireball',
    name: 'Fireball',
    tags: ['spell', 'projectile', 'fire'],
    supportIds: ['arcane-tempo', 'added-fire-damage'],
  };

  const supports = [
    { id: 'arcane-tempo', name: 'Arcane Tempo', worksWith: ['spell'] },
    { id: 'added-fire-damage', name: 'Added Fire Damage', worksWith: ['fire'] },
    { id: 'controlled-destruction', name: 'Controlled Destruction', worksWith: ['spell'] },
    { id: 'fire-penetration', name: 'Fire Penetration', worksWith: ['fire'] },
  ];

  const related = getSupportsForSkill(skill, supports);

  assert.deepEqual(
    related.map((support) => support.id),
    ['added-fire-damage', 'arcane-tempo', 'controlled-destruction', 'fire-penetration'],
  );
});

test('getSupportCriteria prefers matchAll criteria when present', () => {
  const support = {
    id: 'scattershot',
    name: 'Scattershot',
    worksWith: ['projectile'],
    matchAll: ['projectile', 'bow'],
  };

  assert.deepEqual(getSupportCriteria(support), ['projectile', 'bow']);
});
