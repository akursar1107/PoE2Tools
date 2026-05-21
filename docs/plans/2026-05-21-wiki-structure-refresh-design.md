# Wiki Structure Refresh Design

## Goal

Turn the quick reference wiki into a faster, easier-to-maintain reference by reorganizing the UI around a persistent sidebar, reshaping data to support that navigation, and adding a lightweight update tool for future patch-note maintenance.

## Chosen direction

The wiki stays a static app. It should not become a multi-page application or require a backend. The main change is structural: move from a top-toolbar browsing model to a two-pane reference layout. The left pane becomes the stable navigation surface. The right pane becomes the active reading surface. This keeps the app fast on desktop, usable on mobile, and closer to how a personal reference wiki should feel.

Top-level navigation stays organized by content type: **Ascendancies**, **Skill Gems**, and **Support Gems**. Inside each section, the sidebar uses context-aware grouping. Ascendancies group by class. Skill gems group by type first, then use theme filters inside the main pane. Support gems group by purpose, such as damage, speed, projectile, elemental, minion, and utility. Clicking in the sidebar updates the right pane without hiding navigation.

## Data shape

The current flat data files are good enough for an MVP, but the next pass should make grouping explicit. Skill gems should have stable fields such as `kind` and `themes`. Support gems should gain a `category` field in addition to compatibility metadata like `worksWith` and `matchAll`. Ascendancies already have most of the needed structure.

This keeps the UI simple. Navigation groups come from first-class fields instead of ad hoc tag inference. Tags still matter for filtering, but not for all structure.

## Maintenance approach

Keep maintenance lightweight. Do not build a full scraper pipeline yet. Add a small script that validates data shape and reports missing grouping fields or suspicious compatibility entries. The patch-note workflow stays manual: review notes, cross-check source sites, update data files, run helper tests, and review the deployed site.

## Implementation order

1. Restructure the UI to the new two-pane layout.
2. Normalize data for explicit grouping fields.
3. Add minimal maintenance tooling and documentation.
