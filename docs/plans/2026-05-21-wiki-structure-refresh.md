# Wiki Structure Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the PoE2 quick reference wiki into a two-pane quick-reference layout with stronger grouping, cleaner data organization, and lightweight maintenance tooling.

**Architecture:** Keep `wiki/` as a static HTML/CSS/JS app. Move navigation state into a sidebar-driven model, add grouping helpers in `wiki/lib/wiki-data.mjs`, and reshape `wiki/data/skills.mjs` plus `wiki/data/supports.mjs` so the UI can group entries intentionally instead of inferring structure from loose tags. Add one small maintenance script for data validation rather than a full scraper.

**Tech Stack:** Static HTML, CSS, ES modules, Node built-in test runner, GitHub Pages

---

### Task 1: Add grouping helpers for sidebar navigation

**Files:**
- Modify: `wiki/lib/wiki-data.mjs`
- Modify: `wiki/lib/wiki-data.test.mjs`

**Step 1: Write the failing test**

Add tests for:
- grouping ascendancies by `className`
- grouping skill gems by `kind`
- grouping support gems by `category`

Example test shape:

```js
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
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd /var/home/akursar/Documents/Projects/PoE2Random/.worktrees/wiki-structure-refresh
node --test wiki/lib/wiki-data.test.mjs
```

Expected: FAIL because the new grouping helper does not exist yet.

**Step 3: Write minimal implementation**

Add a helper such as:

```js
export function groupEntries(entries, field) {
  return entries.reduce((groups, entry) => {
    const key = entry[field] ?? 'other';
    groups[key] ??= [];
    groups[key].push(entry);
    return groups;
  }, {});
}
```

Keep sorting and normalization minimal. Do not redesign existing filter behavior in this step.

**Step 4: Run test to verify it passes**

Run:

```bash
cd /var/home/akursar/Documents/Projects/PoE2Random/.worktrees/wiki-structure-refresh
node --test wiki/lib/wiki-data.test.mjs
```

Expected: PASS

**Step 5: Commit**

```bash
cd /var/home/akursar/Documents/Projects/PoE2Random/.worktrees/wiki-structure-refresh
git add wiki/lib/wiki-data.mjs wiki/lib/wiki-data.test.mjs
git commit -m "refactor(wiki): add grouping helpers"
```

### Task 2: Normalize skill and support datasets for navigation

**Files:**
- Modify: `wiki/data/skills.mjs`
- Modify: `wiki/data/supports.mjs`
- Modify: `wiki/lib/wiki-data.test.mjs`

**Step 1: Write the failing test**

Add tests that assert:
- skill entries expose `kind`
- skill entries expose `themes` where relevant
- support entries expose `category`

Example:

```js
test('skill gems expose navigation fields', () => {
  assert.equal(skillGems.find((entry) => entry.id === 'fireball').kind, 'spell');
  assert.deepEqual(skillGems.find((entry) => entry.id === 'fireball').themes, ['fire', 'projectile']);
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd /var/home/akursar/Documents/Projects/PoE2Random/.worktrees/wiki-structure-refresh
node --test wiki/lib/wiki-data.test.mjs
```

Expected: FAIL because the new fields are missing.

**Step 3: Write minimal implementation**

Update data files so:
- skill entries add `kind: 'attack' | 'spell' | 'minion' | 'utility'`
- skill entries add `themes: []`
- support entries add `category`

Keep existing `tags`, `supportIds`, `worksWith`, and `matchAll`. Do not remove current fields.

**Step 4: Run test to verify it passes**

Run:

```bash
cd /var/home/akursar/Documents/Projects/PoE2Random/.worktrees/wiki-structure-refresh
node --test wiki/lib/wiki-data.test.mjs
```

Expected: PASS

**Step 5: Commit**

```bash
cd /var/home/akursar/Documents/Projects/PoE2Random/.worktrees/wiki-structure-refresh
git add wiki/data/skills.mjs wiki/data/supports.mjs wiki/lib/wiki-data.test.mjs
git commit -m "refactor(wiki): normalize navigation metadata"
```

### Task 3: Rebuild the wiki UI into a two-pane layout

**Files:**
- Modify: `wiki/index.html`
- Modify: `wiki/style.css`
- Modify: `wiki/app.mjs`

**Step 1: Write the failing test**

Because the UI is static and DOM-light, write a helper-focused test for the new navigation state shape instead of a DOM test. Add a helper test for computing sidebar groups from the active section.

Example:

```js
test('buildSidebarGroups returns class-based groups for ascendancies', () => {
  const groups = buildSidebarGroups('ascendancies', ascendancies);
  assert.ok(groups.Witch);
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd /var/home/akursar/Documents/Projects/PoE2Random/.worktrees/wiki-structure-refresh
node --test wiki/lib/wiki-data.test.mjs
```

Expected: FAIL because the helper does not exist yet.

**Step 3: Write minimal implementation**

Update the app to:
- replace the top toolbar-centric layout with a sidebar + content shell
- keep top-level sections in the sidebar
- show section-specific subgroups in the sidebar
- update the right pane when a group or item is selected
- keep search and theme filters in the right pane

Preserve the existing static deployment model and existing data imports.

**Step 4: Run test to verify it passes**

Run:

```bash
cd /var/home/akursar/Documents/Projects/PoE2Random/.worktrees/wiki-structure-refresh
node --test wiki/lib/wiki-data.test.mjs
node --check wiki/app.mjs
```

Expected: PASS

**Step 5: Run build and smoke verification**

Run:

```bash
cd /var/home/akursar/Documents/Projects/PoE2Random/.worktrees/wiki-structure-refresh
node --check wiki/lib/wiki-data.mjs
node --check wiki/data/ascendancies.mjs
node --check wiki/data/skills.mjs
node --check wiki/data/supports.mjs
cd relic-optimizer && npm run build
```

Expected: PASS

**Step 6: Commit**

```bash
cd /var/home/akursar/Documents/Projects/PoE2Random/.worktrees/wiki-structure-refresh
git add wiki/index.html wiki/style.css wiki/app.mjs wiki/lib/wiki-data.mjs wiki/lib/wiki-data.test.mjs
git commit -m "feat(wiki): add sidebar reference layout"
```

### Task 4: Add lightweight wiki maintenance tooling

**Files:**
- Create: `tools/validate-wiki-data.mjs`
- Modify: `wiki/lib/wiki-data.test.mjs`
- Modify: `README.md`

**Step 1: Write the failing test**

Add a small script-level test or helper test that validates required navigation fields.

Example:

```js
test('wiki skills include required navigation metadata', () => {
  for (const skill of skillGems) {
    assert.ok(skill.kind);
    assert.ok(Array.isArray(skill.themes));
  }
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd /var/home/akursar/Documents/Projects/PoE2Random/.worktrees/wiki-structure-refresh
node --test wiki/lib/wiki-data.test.mjs
```

Expected: FAIL until the dataset and validator agree on the required shape.

**Step 3: Write minimal implementation**

Create `tools/validate-wiki-data.mjs` that:
- imports wiki datasets
- checks required fields for skills and supports
- exits non-zero on missing metadata

Update `README.md` with one short section describing how to run the validator during patch-note updates.

**Step 4: Run test to verify it passes**

Run:

```bash
cd /var/home/akursar/Documents/Projects/PoE2Random/.worktrees/wiki-structure-refresh
node --test wiki/lib/wiki-data.test.mjs
node tools/validate-wiki-data.mjs
```

Expected: PASS

**Step 5: Commit**

```bash
cd /var/home/akursar/Documents/Projects/PoE2Random/.worktrees/wiki-structure-refresh
git add tools/validate-wiki-data.mjs wiki/lib/wiki-data.test.mjs README.md
git commit -m "chore(wiki): add data validation tooling"
```

### Task 5: Final verification and handoff

**Files:**
- Review only

**Step 1: Run full verification**

Run:

```bash
cd /var/home/akursar/Documents/Projects/PoE2Random/.worktrees/wiki-structure-refresh
node --test wiki/lib/wiki-data.test.mjs
node --check wiki/app.mjs
node --check wiki/lib/wiki-data.mjs
node --check wiki/data/ascendancies.mjs
node --check wiki/data/skills.mjs
node --check wiki/data/supports.mjs
node tools/validate-wiki-data.mjs
cd relic-optimizer && npm run build
```

Expected: PASS

**Step 2: Review git status**

Run:

```bash
cd /var/home/akursar/Documents/Projects/PoE2Random/.worktrees/wiki-structure-refresh
git status --short
```

Expected: clean working tree

**Step 3: Commit remaining docs if needed**

```bash
cd /var/home/akursar/Documents/Projects/PoE2Random/.worktrees/wiki-structure-refresh
git add docs/plans/
git commit -m "docs(wiki): add structure refresh design and plan"
```

If already committed earlier, skip.
