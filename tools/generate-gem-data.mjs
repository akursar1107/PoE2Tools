#!/usr/bin/env node
/**
 * Generates wiki/data/skills.mjs, wiki/data/supports.mjs, and updates
 * the skillGems array in picker/data.js from the repoe-fork/poe2 data.
 *
 * Usage: node tools/generate-gem-data.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_URL = 'https://raw.githubusercontent.com/repoe-fork/poe2/master/data/skill_gems.json';

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(name) {
  return name.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function stripTierSuffix(name) {
  return name.replace(/\s+[IVX]+$/, '').trim();
}

/** Map repoe crafting_type to canonical weapon-tag used in wiki */
const CRAFTING_TYPE_MAP = {
  Bow:          'bow',
  Crossbow:     'crossbow',
  Spear:        'spear',
  Quarterstaff: 'quarterstaff',
  Mace:         'mace',
  Flail:        'flail',
  Sword:        'sword',
  Axe:          'axe',
  Dagger:       'dagger',
  Claw:         'claw',
  Wand:         'wand',
  Sceptre:      'sceptre',
  Staff:        'staff',
  Shield:       'shield',
  // Broad categories
  Elemental:    'elemental',
  Occult:       'occult',
  Primal:       'primal',
};

const ELEMENT_TAGS = new Set(['fire', 'cold', 'lightning', 'chaos', 'physical', 'poison', 'bleed', 'storm', 'arcane']);
const SKILL_TYPE_TAGS = new Set(['attack', 'spell', 'melee', 'ranged', 'projectile', 'aoe', 'area', 'duration',
  'minion', 'totem', 'trap', 'mine', 'curse', 'mark', 'hex', 'aura', 'herald', 'banner',
  'warcry', 'movement', 'buff', 'persistent', 'shapeshift', 'channelling']);

/** Derive a `kind` string from repoe tags + crafting_types for an active gem */
function deriveKind(tags, craftingTypes) {
  const t = new Set(tags);
  if (t.has('warcry')) return 'warcry';
  if (t.has('mark') || t.has('hex') || t.has('curse')) return 'curse';
  if (t.has('banner')) return 'banner';
  if (t.has('herald')) return 'herald';
  if (t.has('aura') && t.has('persistent')) return 'aura';
  if (t.has('totem')) return 'totem';
  if (t.has('trap')) return 'trap';
  if (t.has('mine')) return 'mine';
  if (t.has('movement') && !t.has('attack')) return 'movement';
  if (t.has('shapeshift')) return 'shapeshift';
  if (t.has('minion') || t.has('summon')) return 'minion';
  if (t.has('attack') && t.has('melee')) return 'attack';
  if (t.has('attack')) return 'attack';
  if (t.has('spell') && t.has('channelling')) return 'spell';
  if (t.has('spell')) return 'spell';
  if (t.has('buff') && t.has('persistent')) return 'buff';
  return 'skill';
}

/** Derive `themes` (interesting flavour tags) from repoe tags */
function deriveThemes(tags, craftingTypes) {
  const themes = new Set();
  for (const t of tags) {
    if (ELEMENT_TAGS.has(t)) themes.add(t);
  }
  for (const ct of craftingTypes) {
    const mapped = CRAFTING_TYPE_MAP[ct];
    if (mapped && !['elemental','occult','primal'].includes(mapped)) themes.add(mapped);
  }
  return [...themes];
}

/** Derive `category` for a support gem */
function deriveSupportCategory(tags, craftingTypes) {
  const t = new Set(tags);
  if (t.has('damage')) return 'damage';
  if (['fire','cold','lightning','chaos','physical','poison','bleed'].some(e => t.has(e))) return 'damage';
  if (t.has('speed') || t.has('cast_speed') || t.has('attack_speed')) return 'speed';
  if (t.has('projectile') || t.has('fork') || t.has('chain') || t.has('pierce')) return 'projectile';
  if (t.has('area') || t.has('aoe')) return 'aoe';
  if (t.has('duration')) return 'duration';
  if (t.has('critical') || t.has('crit')) return 'crit';
  if (t.has('minion') || t.has('totem') || t.has('trap') || t.has('mine')) return 'summon';
  if (t.has('curse') || t.has('mark') || t.has('hex') || t.has('warcry')) return 'utility';
  if (t.has('life') || t.has('mana') || t.has('leech')) return 'sustain';
  return 'utility';
}

/** `worksWith` for a support gem (what skill tags it can support) */
function deriveWorksWith(tags, craftingTypes) {
  const works = new Set();
  // crafting_types define the weapon restriction
  for (const ct of craftingTypes) {
    const mapped = CRAFTING_TYPE_MAP[ct];
    if (mapped) works.add(mapped);
  }
  // Add relevant skill-type tags
  for (const t of tags) {
    if (SKILL_TYPE_TAGS.has(t)) works.add(t);
  }
  return [...works];
}

/** Generate a brief auto-summary for a gem */
function autoSummary(name, tags, craftingTypes, kind) {
  const typeLabel = craftingTypes.length ? craftingTypes.join('/') : '';
  const elements = tags.filter(t => ELEMENT_TAGS.has(t));
  const elementStr = elements.length ? ` ${elements.join('/')}` : '';
  const weaponStr = typeLabel ? ` ${typeLabel}` : '';
  return `${name} —${weaponStr}${elementStr} ${kind} skill.`;
}

function autoSupportSummary(name, tags, craftingTypes, category) {
  const typeLabel = craftingTypes.length ? craftingTypes.join('/') : '';
  const weaponStr = typeLabel ? ` for ${typeLabel}` : '';
  return `${name}${weaponStr} support (${category}).`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching repoe gem data…');
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.json();

  const entries = Object.entries(raw);

  // ── Active (craftable only) ───────────────────────────────────────────────
  const craftableActive = entries.filter(([, v]) =>
    v.gem_type === 'active' &&
    v.base_item?.release_state === 'released' &&
    v.crafting_types?.length > 0
  );

  // Deduplicate by display_name (keep first occurrence)
  const seenSkills = new Map();
  for (const [key, gem] of craftableActive) {
    const name = gem.base_item?.display_name ?? '';
    if (name && !seenSkills.has(name)) seenSkills.set(name, [key, gem]);
  }

  const skills = [...seenSkills.values()].sort(([, a], [, b]) =>
    (a.base_item?.display_name ?? '').localeCompare(b.base_item?.display_name ?? '')
  );

  // ── Supports (craftable only, dedupe by base name) ────────────────────────
  const craftableSupports = entries.filter(([, v]) =>
    v.gem_type === 'support' &&
    v.base_item?.release_state === 'released' &&
    v.crafting_types?.length > 0
  );

  const seenSupports = new Map();
  for (const [key, gem] of craftableSupports) {
    const name = gem.base_item?.display_name ?? '';
    const baseName = stripTierSuffix(name);
    if (baseName && !seenSupports.has(baseName)) seenSupports.set(baseName, [key, gem, baseName]);
  }

  const supports = [...seenSupports.values()].sort(([, , a], [, , b]) => a.localeCompare(b));

  console.log(`Active gems: ${skills.length}, Support gems: ${supports.length}`);

  // ── Write wiki/data/skills.mjs ────────────────────────────────────────────
  const skillLines = skills.map(([key, gem]) => {
    const name = gem.base_item?.display_name ?? '';
    const tags = gem.tags ?? [];
    const craftingTypes = gem.crafting_types ?? [];
    const kind = deriveKind(tags, craftingTypes);
    const themes = deriveThemes(tags, craftingTypes);
    const summary = autoSummary(name, tags, craftingTypes, kind);
    const id = slugify(name);
    const filteredTags = [...new Set([
      ...tags.filter(t => SKILL_TYPE_TAGS.has(t) || ELEMENT_TAGS.has(t)),
      ...craftingTypes.map(ct => CRAFTING_TYPE_MAP[ct]).filter(Boolean),
    ])];
    return `  {
    id: ${JSON.stringify(id)},
    name: ${JSON.stringify(name)},
    summary: ${JSON.stringify(summary)},
    kind: ${JSON.stringify(kind)},
    tags: ${JSON.stringify(filteredTags)},
    themes: ${JSON.stringify(themes)},
    supportIds: [],
  }`;
  });

  const skillsOutput = `// AUTO-GENERATED by tools/generate-gem-data.mjs — do not edit manually.
// Source: https://github.com/repoe-fork/poe2 skill_gems.json
export const skillGems = [
${skillLines.join(',\n')}
];
`;
  writeFileSync(join(ROOT, 'wiki/data/skills.mjs'), skillsOutput);
  console.log(`Wrote wiki/data/skills.mjs (${skills.length} gems)`);

  // ── Write wiki/data/supports.mjs ──────────────────────────────────────────
  const supportLines = supports.map(([key, gem, baseName]) => {
    const tags = gem.tags ?? [];
    const craftingTypes = gem.crafting_types ?? [];
    const category = deriveSupportCategory(tags, craftingTypes);
    const worksWith = deriveWorksWith(tags, craftingTypes);
    const summary = autoSupportSummary(baseName, tags, craftingTypes, category);
    const id = slugify(baseName);
    const filteredTags = [...new Set([
      ...tags.filter(t => SKILL_TYPE_TAGS.has(t) || ELEMENT_TAGS.has(t)),
      ...craftingTypes.map(ct => CRAFTING_TYPE_MAP[ct]).filter(Boolean),
    ])];
    return `  {
    id: ${JSON.stringify(id)},
    name: ${JSON.stringify(baseName)},
    summary: ${JSON.stringify(summary)},
    category: ${JSON.stringify(category)},
    tags: ${JSON.stringify(filteredTags)},
    worksWith: ${JSON.stringify(worksWith)},
  }`;
  });

  const supportsOutput = `// AUTO-GENERATED by tools/generate-gem-data.mjs — do not edit manually.
// Source: https://github.com/repoe-fork/poe2 skill_gems.json
export const supports = [
${supportLines.join(',\n')}
];
`;
  writeFileSync(join(ROOT, 'wiki/data/supports.mjs'), supportsOutput);
  console.log(`Wrote wiki/data/supports.mjs (${supports.length} gems)`);

  // ── Update picker/data.js skillGems section ───────────────────────────────
  const pickerGems = skills.map(([key, gem]) => {
    const name = gem.base_item?.display_name ?? '';
    // Normalize key to consistent Metadata path
    const buildId = key.startsWith('Metadata/') ? key : null;
    return `  { name: ${JSON.stringify(name)}, buildId: ${JSON.stringify(buildId)} }`;
  });

  const pickerDataPath = join(ROOT, 'picker/data.js');
  const pickerSource = readFileSync(pickerDataPath, 'utf8');

  // Replace the skillGems array (everything from "const skillGems = [" to the matching "];\n")
  const newPickerGems = `// AUTO-GENERATED by tools/generate-gem-data.mjs
const skillGems = [
${pickerGems.join(',\n')}
];`;

  const updated = pickerSource.replace(
    /(?:\/\/[^\n]*\n)*const skillGems = \[[\s\S]*?\];/,
    newPickerGems
  );

  if (updated === pickerSource) {
    console.warn('WARNING: Could not find skillGems array in picker/data.js — check regex');
  } else {
    writeFileSync(pickerDataPath, updated);
    console.log(`Updated picker/data.js skillGems (${skills.length} gems)`);
  }

  console.log('\nDone! Run: node tools/validate-wiki-data.mjs');
}

main().catch(err => { console.error(err); process.exit(1); });
