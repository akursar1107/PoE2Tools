# PoE2 Tools

A lightweight collection of **Path of Exile 2** web tools hosted together on GitHub Pages.

## Included Apps
- **Build Randomizer** (`picker/`) — rolls a random ascendancy and skill gem
- **Quick Reference Wiki** (`wiki/`) — browse ascendancies, skill gems, and support gems
- **Relic Altar Optimizer** (`relic-optimizer/`) — plan and optimize Trial of the Sekhemas relic layouts

## Features
- Random ascendancy (all 12 across 6 classes)
- Random active skill gem
- Session roll history with clear button
- Clean, modern UI — mobile friendly

## Run Locally

Just open `index.html` in your browser. No build step required.

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to **Deploy from branch → main → / (root)**
4. Your app will be live at `https://<your-username>.github.io/<repo-name>/`

## Updating Data

- **Build Randomizer**: edit `picker/data.js`
- **Quick Reference Wiki**: edit `wiki/data/*.mjs`

### Validate wiki updates

After patch-note edits to `wiki/data/*.mjs`, run `node --test wiki/lib/wiki-data.test.mjs` and `node tools/validate-wiki-data.mjs`.
