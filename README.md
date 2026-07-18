# PoE2 Tools

A lightweight collection of **Path of Exile 2** web tools hosted together on GitHub Pages.

Live site: `https://akursar1107.github.io/PoE2Tools/`

## Included Apps
- **Build Randomizer** (`picker/`) — rolls a random ascendancy and skill gem
- **Quick Reference Wiki** (`wiki/`) — browse ascendancies, skill gems, and support gems
- **Passive Tree Viewer** (`tree/`) — interactive passive skill tree built on GGG's tree export data
- **Relic Altar Optimizer** (`relic-optimizer/`) — plan and optimize Trial of the Sekhemas relic layouts

## Features
- Random ascendancy (all 12 across 6 classes)
- Random active skill gem
- Session roll history with clear button
- Drag-and-drop relic altar with auto-optimizer and paste-from-game import
- Clean, modern UI — mobile friendly

## Run Locally

The picker, wiki, and tree apps are plain HTML/JS — no build step, just serve the repo root (e.g. `npx serve .`).

The **relic optimizer** is a React/Vite app and needs a build first:

```bash
cd relic-optimizer
npm install
npm run dev    # hot-reload dev server
# or
npm run build  # production build to relic-optimizer/dist
```

To assemble the full site exactly as deployed:

```bash
npm run build        # from the repo root: builds relic-optimizer, then runs build.mjs
npx serve _site      # serve the assembled site
```

## Testing

```bash
npm test
```

This runs three things:
1. Wiki data unit tests (`node --test wiki/lib/wiki-data.test.mjs`)
2. Relic optimizer logic tests — altar placement, optimizer, clipboard parser (`relic-optimizer/src/utils/*.test.js`)
3. Wiki data validator (`node tools/validate-wiki-data.mjs`)

Tests also run in CI before every deploy.

## Deployment

Deployment is fully automated via GitHub Actions (`.github/workflows/deploy.yml`):
every push to `main` runs the tests, builds the relic optimizer with Vite,
assembles `_site/` with `build.mjs`, and publishes it to GitHub Pages.
You can also trigger a deploy manually from the **Actions** tab.

## Updating Data

- **Build Randomizer**: edit `data/ascendancies.mjs` (gems come from `data/skills.mjs`)
- **Quick Reference Wiki**: edit `wiki/data/*.mjs`
- **Relic Optimizer**: edit `relic-optimizer/src/data/relics.json`

See [CONTRIBUTING.md](CONTRIBUTING.md) for regenerating gem data after a patch and
for the relic data sources.

### Validate wiki updates

After patch-note edits to `wiki/data/*.mjs`, run `node --test wiki/lib/wiki-data.test.mjs` and `node tools/validate-wiki-data.mjs` (or just `npm test`).
