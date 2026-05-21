import { ascendancies } from './data/ascendancies.mjs';
import { skillGems } from './data/skills.mjs';
import { supports } from './data/supports.mjs';
import { collectPopularTags, filterEntries, getSkillsForSupport, getSupportCriteria, getSupportsForSkill } from './lib/wiki-data.mjs';

const tabs = [
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
  activeTab: 'ascendancies',
  query: '',
  selectedTags: [],
};

const tabsElement = document.getElementById('tabs');
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

function getActiveTab() {
  return tabs.find((tab) => tab.id === state.activeTab) ?? tabs[0];
}

function toggleTag(tag) {
  state.selectedTags = state.selectedTags.includes(tag)
    ? state.selectedTags.filter((activeTag) => activeTag !== tag)
    : [...state.selectedTags, tag];
  render();
}

function setActiveTab(tabId) {
  state.activeTab = tabId;
  state.selectedTags = [];
  state.query = '';
  searchInput.value = '';
  render();
}

function renderTabs() {
  tabsElement.innerHTML = tabs
    .map((tab) => `
      <button class="tab ${tab.id === state.activeTab ? 'active' : ''}" type="button" data-tab-id="${tab.id}">
        ${escapeHtml(tab.label)}
      </button>
    `)
    .join('');

  tabsElement.querySelectorAll('[data-tab-id]').forEach((button) => {
    button.addEventListener('click', () => setActiveTab(button.dataset.tabId));
  });
}

function renderTags(entries) {
  const popularTags = collectPopularTags(entries);

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
      </div>
      ${renderTagsList(entry.tags)}
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

function renderTagsList(tags) {
  return `
    <div>
      <p class="tag-label">Tags</p>
      <ul class="entry-tags">
        ${tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}
      </ul>
    </div>
  `;
}

function renderResults(filteredEntries, activeTab) {
  if (filteredEntries.length === 0) {
    resultsElement.innerHTML = `
      <div class="empty-state">
        <h2>No matches</h2>
        <p>${escapeHtml(activeTab.emptyMessage)}</p>
      </div>
    `;
    return;
  }

  resultsElement.innerHTML = filteredEntries
    .map((entry) => activeTab.renderCard(entry))
    .join('');
}

function renderMeta(filteredEntries, activeTab) {
  const tagText = state.selectedTags.length === 0
    ? 'all tags'
    : `tags: ${state.selectedTags.join(', ')}`;

  resultsMeta.textContent = `${filteredEntries.length} ${activeTab.label.toLowerCase()} shown — ${tagText}`;
}

function render() {
  const activeTab = getActiveTab();
  const filteredEntries = filterEntries(activeTab.entries, state.query, state.selectedTags);

  renderTabs();
  renderTags(activeTab.entries);
  renderMeta(filteredEntries, activeTab);
  renderResults(filteredEntries, activeTab);
}

render();
