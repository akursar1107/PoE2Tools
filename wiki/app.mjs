import { ascendancies } from './data/ascendancies.mjs';
import { skillGems } from './data/skills.mjs';
import { supports } from './data/supports.mjs';
import {
  buildSidebarGroups,
  collectPopularTags,
  filterEntries,
  getSkillsForSupport,
  getSupportCriteria,
  getSupportsForSkill,
} from './lib/wiki-data.mjs';

const sections = [
  {
    id: 'ascendancies',
    label: 'Ascendancies',
    entries: ascendancies,
    emptyMessage: 'No ascendancies match the current search.',
    renderCard: renderAscendancyCard,
  },
  {
    id: 'skills',
    label: 'Skill Gems',
    entries: skillGems,
    emptyMessage: 'No skill gems match the current search.',
    renderCard: renderSkillCard,
  },
  {
    id: 'supports',
    label: 'Support Gems',
    entries: supports,
    emptyMessage: 'No support gems match the current search.',
    renderCard: renderSupportCard,
  },
];

const state = {
  activeSection: 'ascendancies',
  activeGroup: null,
  activeEntryId: null,
  query: '',
  selectedTags: [],
};

const sectionNav = document.getElementById('sectionNav');
const groupNav = document.getElementById('groupNav');
const itemNav = document.getElementById('itemNav');
const groupMeta = document.getElementById('groupMeta');
const itemMeta = document.getElementById('itemMeta');
const paneEyebrow = document.getElementById('paneEyebrow');
const paneTitle = document.getElementById('paneTitle');
const paneDescription = document.getElementById('paneDescription');
const tagBarElement = document.getElementById('tagBar');
const searchInput = document.getElementById('searchInput');
const resultsMeta = document.getElementById('resultsMeta');
const resultsElement = document.getElementById('results');

searchInput.addEventListener('input', (event) => {
  state.query = event.target.value;
  render();
});

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getActiveSection() {
  return sections.find((section) => section.id === state.activeSection) ?? sections[0];
}

function getSectionGroups(section = getActiveSection()) {
  return buildSidebarGroups(section.id, section.entries);
}

function getFilteredEntries(entries) {
  return filterEntries(entries, state.query, state.selectedTags);
}

function setActiveSection(sectionId) {
  const nextSection = sections.find((section) => section.id === sectionId) ?? sections[0];
  const nextGroups = getSectionGroups(nextSection);
  const [firstGroup] = Object.keys(nextGroups);

  state.activeSection = nextSection.id;
  state.activeGroup = firstGroup ?? null;
  state.activeEntryId = nextGroups[firstGroup]?.[0]?.id ?? null;
  state.query = '';
  state.selectedTags = [];
  searchInput.value = '';
  render();
}

function setActiveGroup(groupName) {
  state.activeGroup = groupName;
  const section = getActiveSection();
  const groups = getSectionGroups(section);
  const visibleEntries = getFilteredEntries(groups[groupName] ?? []);
  state.activeEntryId = visibleEntries[0]?.id ?? null;
  render();
}

function setActiveEntry(entryId) {
  state.activeEntryId = entryId;
  render();
}

function toggleTag(tag) {
  state.selectedTags = state.selectedTags.includes(tag)
    ? state.selectedTags.filter((activeTag) => activeTag !== tag)
    : [...state.selectedTags, tag];
  render();
}

function syncState() {
  const section = getActiveSection();
  const groups = getSectionGroups(section);
  const groupNames = Object.keys(groups);

  if (!groupNames.includes(state.activeGroup)) {
    state.activeGroup = groupNames[0] ?? null;
  }

  const groupedEntries = state.activeGroup ? (groups[state.activeGroup] ?? []) : [];
  const visibleEntries = getFilteredEntries(groupedEntries);

  if (!visibleEntries.some((entry) => entry.id === state.activeEntryId)) {
    state.activeEntryId = visibleEntries[0]?.id ?? null;
  }

  const selectedEntry = visibleEntries.find((entry) => entry.id === state.activeEntryId) ?? null;

  return {
    section,
    groups,
    groupedEntries,
    visibleEntries,
    selectedEntry,
  };
}

function renderSectionNav(activeSection) {
  sectionNav.innerHTML = sections
    .map((section) => `
      <button class="section-button ${section.id === activeSection.id ? 'active' : ''}" type="button" data-section-id="${section.id}">
        <span>${escapeHtml(section.label)}</span>
        <span class="count-pill">${section.entries.length}</span>
      </button>
    `)
    .join('');

  sectionNav.querySelectorAll('[data-section-id]').forEach((button) => {
    button.addEventListener('click', () => setActiveSection(button.dataset.sectionId));
  });
}

function renderGroupNav(groups) {
  const entries = Object.entries(groups);
  groupMeta.textContent = entries.length === 1 ? '1 subgroup' : `${entries.length} subgroups`;

  groupNav.innerHTML = entries
    .map(([groupName, groupEntries]) => `
      <button class="group-button ${groupName === state.activeGroup ? 'active' : ''}" type="button" data-group-name="${escapeHtml(groupName)}">
        <span>${escapeHtml(groupName)}</span>
        <span class="count-pill">${groupEntries.length}</span>
      </button>
    `)
    .join('');

  groupNav.querySelectorAll('[data-group-name]').forEach((button) => {
    button.addEventListener('click', () => setActiveGroup(button.dataset.groupName));
  });
}

function renderItemNav(visibleEntries, groupedEntries) {
  itemMeta.textContent = `${visibleEntries.length}/${groupedEntries.length} shown`;

  if (groupedEntries.length === 0) {
    itemNav.innerHTML = '<p class="sidebar-empty">No entries in this group yet.</p>';
    return;
  }

  if (visibleEntries.length === 0) {
    itemNav.innerHTML = '<p class="sidebar-empty">No entries match the current filters.</p>';
    return;
  }

  itemNav.innerHTML = visibleEntries
    .map((entry) => `
      <button class="item-button ${entry.id === state.activeEntryId ? 'active' : ''}" type="button" data-entry-id="${entry.id}">
        <span class="item-button-name">${escapeHtml(entry.name)}</span>
        <span class="item-button-meta">${escapeHtml((entry.tags ?? []).slice(0, 2).join(' • '))}</span>
      </button>
    `)
    .join('');

  itemNav.querySelectorAll('[data-entry-id]').forEach((button) => {
    button.addEventListener('click', () => setActiveEntry(button.dataset.entryId));
  });
}

function renderTags(entries) {
  const popularTags = collectPopularTags(entries);

  if (popularTags.length === 0) {
    tagBarElement.innerHTML = '<p class="sidebar-empty">No theme filters available.</p>';
    return;
  }

  tagBarElement.innerHTML = popularTags
    .map((tag) => `
      <button class="tag-chip ${state.selectedTags.includes(tag) ? 'active' : ''}" type="button" data-tag="${tag}">
        ${escapeHtml(tag)}
      </button>
    `)
    .join('');

  tagBarElement.querySelectorAll('[data-tag]').forEach((button) => {
    button.addEventListener('click', () => toggleTag(button.dataset.tag));
  });
}

function renderPaneHeader(section, selectedEntry) {
  paneEyebrow.textContent = state.activeGroup ? `${section.label} / ${state.activeGroup}` : section.label;

  if (selectedEntry) {
    paneTitle.textContent = selectedEntry.name;
    paneDescription.textContent = selectedEntry.summary ?? 'Reference details for the selected entry.';
    return;
  }

  paneTitle.textContent = `Browse ${section.label}`;
  paneDescription.textContent = section.emptyMessage;
}

function renderAscendancyCard(entry) {
  return `
    <article class="entry-card">
      <div class="entry-header">
        <div>
          <h2 class="entry-title">${escapeHtml(entry.name)}</h2>
          <p class="entry-summary">${escapeHtml(entry.summary)}</p>
        </div>
        <span class="class-pill">${escapeHtml(entry.className)}</span>
      </div>
      ${renderTagsList(entry.tags)}
      <div>
        <p class="tag-label">Minor passives</p>
        <ul class="passive-list">
          ${(entry.minorPassives ?? []).map((passive) => `<li>${escapeHtml(passive)}</li>`).join('')}
        </ul>
      </div>
      <div>
        <p class="tag-label">Notable passives</p>
        <div class="notable-list">
          ${(entry.notables ?? []).map(renderNotableCard).join('')}
        </div>
      </div>
      <a class="source-link" href="${escapeHtml(entry.sourceUrl)}" target="_blank" rel="noreferrer">Source: poe2wiki.net</a>
    </article>
  `;
}

function renderSkillCard(entry) {
  const relatedSupports = getSupportsForSkill(entry, supports);

  return `
    <article class="entry-card">
      <div class="entry-header">
        <div>
          <h2 class="entry-title">${escapeHtml(entry.name)}</h2>
          <p class="entry-summary">${escapeHtml(entry.summary)}</p>
        </div>
        <span class="class-pill">${escapeHtml(entry.kind)}</span>
      </div>
      ${renderTagsList(entry.tags)}
      <div>
        <p class="tag-label">Themes</p>
        <div class="support-list">
          ${(entry.themes ?? []).length > 0
            ? entry.themes.map((theme) => `<span class="support-chip">${escapeHtml(theme)}</span>`).join('')
            : '<span class="support-chip">General</span>'}
        </div>
      </div>
      <div>
        <p class="tag-label">Compatible support gems</p>
        <div class="support-list">
          ${relatedSupports.map((support) => `<span class="support-chip">${escapeHtml(support.name)}</span>`).join('')}
        </div>
      </div>
    </article>
  `;
}

function renderSupportCard(entry) {
  const relatedSkills = getSkillsForSupport(entry, skillGems, supports);
  const criteria = getSupportCriteria(entry);

  return `
    <article class="entry-card">
      <div class="entry-header">
        <div>
          <h2 class="entry-title">${escapeHtml(entry.name)}</h2>
          <p class="entry-summary">${escapeHtml(entry.summary)}</p>
        </div>
        <span class="class-pill">${escapeHtml(entry.category)}</span>
      </div>
      ${renderTagsList(entry.tags)}
      <div>
        <p class="tag-label">${entry.matchAll ? 'Requires all tags' : 'Works with'}</p>
        <div class="support-list">
          ${criteria.map((tag) => `<span class="support-chip">${escapeHtml(tag)}</span>`).join('')}
        </div>
      </div>
      <div>
        <p class="tag-label">Matching skill gems (${relatedSkills.length})</p>
        <div class="support-list">
          ${relatedSkills.map((skill) => `<span class="support-chip">${escapeHtml(skill.name)}</span>`).join('')}
        </div>
      </div>
    </article>
  `;
}

function renderNotableCard(notable) {
  return `
    <section class="notable-card">
      <h3 class="notable-title">${escapeHtml(notable.name)}</h3>
      <ul class="passive-list compact">
        ${(notable.modifiers ?? []).map((modifier) => `<li>${escapeHtml(modifier)}</li>`).join('')}
      </ul>
    </section>
  `;
}

function renderTagsList(tags = []) {
  return `
    <div>
      <p class="tag-label">Tags</p>
      <ul class="entry-tags">
        ${tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}
      </ul>
    </div>
  `;
}

function renderResults(section, selectedEntry, visibleEntries) {
  if (!selectedEntry) {
    resultsElement.innerHTML = `
      <div class="empty-state">
        <h2>No matches</h2>
        <p>${escapeHtml(section.emptyMessage)}</p>
      </div>
    `;
    return;
  }

  const secondaryEntries = visibleEntries.filter((entry) => entry.id !== selectedEntry.id);

  resultsElement.innerHTML = `
    ${section.renderCard(selectedEntry)}
    ${secondaryEntries.length > 0 ? `
      <section class="related-card">
        <div class="entry-header related-header">
          <div>
            <p class="tag-label">Also in ${escapeHtml(state.activeGroup ?? section.label)}</p>
            <h3 class="entry-title">Browse nearby entries</h3>
          </div>
          <span class="count-pill">${secondaryEntries.length}</span>
        </div>
        <div class="related-links">
          ${secondaryEntries.map((entry) => `
            <button class="related-link" type="button" data-entry-id="${entry.id}">${escapeHtml(entry.name)}</button>
          `).join('')}
        </div>
      </section>
    ` : ''}
  `;

  resultsElement.querySelectorAll('[data-entry-id]').forEach((button) => {
    button.addEventListener('click', () => setActiveEntry(button.dataset.entryId));
  });
}

function renderMeta(section, visibleEntries) {
  const tagText = state.selectedTags.length === 0
    ? 'all themes'
    : `themes: ${state.selectedTags.join(', ')}`;
  const scopeText = state.activeGroup ? `${section.label.toLowerCase()} in ${state.activeGroup}` : section.label.toLowerCase();

  resultsMeta.textContent = `${visibleEntries.length} ${scopeText} shown — ${tagText}`;
}

function render() {
  const { section, groups, groupedEntries, visibleEntries, selectedEntry } = syncState();

  renderSectionNav(section);
  renderGroupNav(groups);
  renderItemNav(visibleEntries, groupedEntries);
  renderPaneHeader(section, selectedEntry);
  renderTags(groupedEntries.length > 0 ? groupedEntries : section.entries);
  renderMeta(section, visibleEntries);
  renderResults(section, selectedEntry, visibleEntries);
}

setActiveSection(state.activeSection);
