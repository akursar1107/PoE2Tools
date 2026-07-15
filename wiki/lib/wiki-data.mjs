function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function flattenEntryParts(value) {
  if (Array.isArray(value)) {
    return value.flatMap(flattenEntryParts);
  }

  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(flattenEntryParts);
  }

  return [normalizeText(value)];
}

const sidebarGroupFields = {
  classes: 'className',
  skills: 'kind',
  supports: 'category',
};

export function getSupportCriteria(support) {
  return support.matchAll ?? support.worksWith ?? [];
}

const GROUP_TAGS = new Set([
  'bow', 'crossbow', 'spear', 'quarterstaff', 'mace', 'flail',
  'sword', 'axe', 'dagger', 'claw', 'wand', 'sceptre', 'staff', 'shield',
  'elemental', 'occult', 'primal'
]);

const BROAD_TAGS = new Set(['damage', 'utility', 'speed', 'sustain']);

export function supportMatchesSkill(skill, support) {
  const skillTags = new Set((skill.tags ?? []).map(normalizeText));

  if (support.matchAll) {
    return support.matchAll.map(normalizeText).every((tag) => skillTags.has(tag));
  }

  const supportTags = (support.tags ?? support.worksWith ?? []).map(normalizeText);
  if (supportTags.length === 0) return false;

  const groupRestrictions = supportTags.filter(t => GROUP_TAGS.has(t));
  const typeRestrictions = supportTags.filter(t => !GROUP_TAGS.has(t) && !BROAD_TAGS.has(t));

  if (groupRestrictions.length > 0) {
    const matchesGroup = groupRestrictions.some(tag => skillTags.has(tag));
    if (!matchesGroup) return false;
  }

  if (typeRestrictions.length > 0) {
    const matchesType = typeRestrictions.some(tag => skillTags.has(tag));
    if (!matchesType) return false;
  }

  return true;
}

export function groupEntries(entries, field) {
  const groups = entries.reduce((result, entry) => {
    const key = entry[field] ?? 'other';
    result[key] ??= [];
    result[key].push(entry);
    return result;
  }, {});

  return Object.fromEntries(
    Object.entries(groups).sort(([left], [right]) => String(left).localeCompare(String(right))),
  );
}

export function buildSidebarGroups(sectionId, entries) {
  const field = sidebarGroupFields[sectionId];

  if (!field) {
    return { all: [...entries].sort((left, right) => left.name.localeCompare(right.name)) };
  }

  return Object.fromEntries(
    Object.entries(groupEntries(entries, field)).map(([groupName, groupEntriesList]) => [
      groupName,
      [...groupEntriesList].sort((left, right) => left.name.localeCompare(right.name)),
    ]),
  );
}

export function filterEntries(entries, query = '', selectedTags = []) {
  const normalizedQuery = normalizeText(query);
  const requiredTags = selectedTags.map(normalizeText);

  return entries.filter((entry) => {
    const tags = (entry.tags ?? []).map(normalizeText);
    const haystack = flattenEntryParts(entry).join(' ');

    const matchesQuery = normalizedQuery === '' || haystack.includes(normalizedQuery);
    const matchesTags = requiredTags.every((tag) => tags.includes(tag));

    return matchesQuery && matchesTags;
  });
}

export function getSupportsForSkill(skill, supports) {
  const supportById = new Map(supports.map((support) => [support.id, support]));
  const explicitSupports = (skill.supportIds ?? [])
    .map((supportId) => supportById.get(supportId))
    .filter(Boolean);
  const inferredSupports = supports
    .filter((support) => supportMatchesSkill(skill, support))
    .sort((left, right) => left.name.localeCompare(right.name));

  const mergedSupports = new Map();

  [...explicitSupports, ...inferredSupports].forEach((support) => {
    mergedSupports.set(support.id, support);
  });

  return [...mergedSupports.values()]
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function getSkillsForSupport(support, skills, supports) {
  return skills
    .filter((skill) => getSupportsForSkill(skill, supports).some((candidate) => candidate.id === support.id))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function collectPopularTags(entries, limit = 10) {
  const counts = new Map();

  entries.forEach((entry) => {
    (entry.tags ?? []).forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([tag]) => tag);
}
