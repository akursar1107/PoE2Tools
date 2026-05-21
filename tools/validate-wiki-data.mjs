import { fileURLToPath } from 'node:url';

import { skillGems } from '../wiki/data/skills.mjs';
import { supports } from '../wiki/data/supports.mjs';

function hasText(value) {
  return typeof value === 'string' && value.length > 0;
}

function hasArray(value) {
  return Array.isArray(value);
}

export function validateWikiData({
  skillGems: skills = skillGems,
  supports: supportGems = supports,
} = {}) {
  const errors = [];

  skills.forEach((skill, index) => {
    if (!skill || typeof skill !== 'object') {
      errors.push(`skill at index ${index + 1} is not a valid object`);
      return;
    }

    const id = skill.id ?? `#${index + 1}`;

    if (!hasText(skill.kind)) {
      errors.push(`skill ${id} is missing kind`);
    }

    if (!hasArray(skill.themes)) {
      errors.push(`skill ${id} is missing themes array`);
    }
  });

  supportGems.forEach((support, index) => {
    if (!support || typeof support !== 'object') {
      errors.push(`support at index ${index + 1} is not a valid object`);
      return;
    }

    const id = support.id ?? `#${index + 1}`;

    if (!hasText(support.category)) {
      errors.push(`support ${id} is missing category`);
    }

    if (!hasArray(support.worksWith) && !hasArray(support.matchAll)) {
      errors.push(`support ${id} is missing worksWith or matchAll metadata`);
    }
  });

  return errors;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const errors = validateWikiData();

  if (errors.length > 0) {
    console.error('Wiki data validation failed:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
  } else {
    console.log('Wiki data validation passed.');
  }
}
