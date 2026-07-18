# Contributing to PoE2 Tools

## Updating gem data after a patch

When Path of Exile 2 ships a patch that adds or changes skill/support gems, regenerate the data files:

```bash
node tools/generate-gem-data.mjs
```

This fetches the latest gem data from [repoe-fork/poe2](https://github.com/repoe-fork/poe2) and writes:
- `data/skills.mjs` — craftable active skill gems
- `data/supports.mjs` — support gems (tier variants deduped)

### Verification checklist

1. Run the wiki tests to make sure nothing broke:
   ```bash
   node wiki/lib/wiki-data.test.mjs
   ```
2. Spot-check the counts — skill count should be ≥ 220, supports ≥ 300.
3. Build the site locally and check the picker still loads:
   ```bash
   node build.mjs
   ```
4. Commit with a message like `chore: regenerate gem data for patch X.Y.Z`.

---

## Updating ascendancy data

Ascendancy data lives in `data/ascendancies.mjs` and is **manually maintained** (no generator).
Edit that file directly. Fields per entry:

| Field | Description |
|---|---|
| `id` | kebab-case unique ID |
| `name` | Ascendancy name |
| `className` | Base class name |
| `passiveNodes` | Array of passive node IDs (used in .build download) |
| `notables` | Named notable passives |
| `minorPassives` | Unnamed minor passive descriptions |
| `summary` | One-sentence description |
| `tags` | Keyword tags for wiki filtering |
| `sourceUrl` | Link to poe2wiki.net entry |

After editing, run the wiki tests to verify:

```bash
node wiki/lib/wiki-data.test.mjs
```

---

## Updating relic data

Relic data lives in `relic-optimizer/src/data/relics.json` and is **manually maintained** from:

- [poe2wiki.net relic modifier lists](https://www.poe2wiki.net/wiki/Relic) — small / medium / large modifier pages
- [poe2db.tw Relics](https://poe2db.tw/us/Relics) — unique relics and their effects

The file has three sections:

| Section | Contents |
|---|---|
| `baseTiers` | The 7 relic base types (dimensions + size tier) |
| `uniqueRelics` | The 6 Zarokh challenge uniques — all are destroyed on use |
| `modifierPool` | Magic relic modifiers per size tier (`small` / `medium` / `large`) |

Modifier entries use overall range across all in-game tiers: `{ id, label, text, stat, unit, min, max }`.
The `stat` key is what the stats panel and optimizer aggregate by.

**Important:** if you add or rename a modifier, also update the keyword patterns in
`relic-optimizer/src/utils/parseRelicText.js` (`MOD_KEYWORDS`) so paste-from-game import
recognises it — and the stat lists in `StatsPanel.jsx` / `OptimizePanel.jsx` if it's a new `stat`.
Then run the tests:

```bash
npm test
```

---

## Local development

The picker, wiki, and tree apps are plain HTML/JS — no build step. The relic
optimizer uses Vite, and `build.mjs` assembles everything into `_site/`:

```bash
# Full build: relic optimizer (Vite) + site assembly
npm run build

# Serve _site/ locally (any static server works)
npx serve _site
```

For hot-reload development on the relic optimizer:

```bash
cd relic-optimizer
npm install
npm run dev        # or: npm run dev (from the repo root)
```

## Deployment

Pushing to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`), which
runs `npm test`, builds the relic optimizer, runs `node build.mjs`, and deploys to GitHub Pages automatically.
