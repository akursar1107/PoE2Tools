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

## Local development

The project is a static site — no framework, no server required.

```bash
# Build the site (outputs to _site/)
node build.mjs

# Serve _site/ locally (any static server works)
npx serve _site
```

The relic optimizer uses Vite:

```bash
cd relic-optimizer
npm install
npm run dev
```

## Deployment

Pushing to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`), which
builds the relic optimizer, runs `node build.mjs`, and deploys to GitHub Pages automatically.
