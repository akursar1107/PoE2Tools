# Relic Altar Optimizer

Plan and optimize your **Trial of the Sekhemas** relic altar layout for Path of Exile 2.
Part of the [PoE2 Tools](../README.md) collection — this directory is a React + Vite app
that gets built and assembled into the site by the repo-root `build.mjs`.

## Features

- Drag-and-drop 5×4 relic altar with blocked corners and collision detection
- 90° rotation of placed relics (right-click), including rotation-aware optimizer
- Auto-optimizer: greedy placement maximizing a chosen stat
- Paste-from-game import (hover a relic in PoE2, Ctrl+C, paste)
- Real modifier pools for all size tiers + all 6 Zarokh challenge uniques
- Inventory and altar persist in `localStorage`

## Development

```bash
npm install
npm run dev      # hot-reload dev server
npm run build    # production build to dist/
npm run lint
```

From the repo root, `npm run build` builds this app and assembles `_site/`;
`npm test` runs the logic/data tests (`src/utils/*.test.js`, `src/data/*.test.js`).

## Data

`src/data/relics.json` is hand-maintained from poe2wiki.net and poe2db.tw —
see [CONTRIBUTING.md](../CONTRIBUTING.md#updating-relic-data) for the update
procedure, including the required parser-keyword sync in
`src/utils/parseRelicText.js`.
