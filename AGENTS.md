# AGENTS.md — PoE2 Tools

A collection of Path of Exile 2 web tools deployed as a static site to GitHub Pages.
Live site: `https://akursar1107.github.io/PoE2Tools/`

## Structure

| Path | What it is |
|---|---|
| `index.html` | Hub landing page linking to all apps |
| `picker/` | Build Randomizer — vanilla HTML/CSS/ESM, no build step |
| `wiki/` | Quick Reference Wiki — vanilla HTML/CSS/ESM, no build step |
| `tree/` | Passive skill tree viewer — vanilla HTML/CSS/ESM + canvas |
| `relic-optimizer/` | Relic Altar Optimizer — **React 19 + Vite** (the only app with a build step) |
| `data/*.mjs` | Canonical data layer (ascendancies, skills, supports) shared by picker + wiki via relative imports |
| `shared/tokens.css` | Shared design tokens (`@import`-ed by the plain apps; the relic optimizer keeps its own copy in `src/index.css` because of the Vite dev-server root) |
| `tools/` | Data maintenance scripts (gem data generator, wiki data validator) |
| `build.mjs` | Site assembler: copies apps into `_site/` and injects the shared nav |
| `_site/` | Build output — gitignored |

## Commands

Run from the repo root (Node ≥ 22 required):

```bash
npm test           # all tests + wiki data validation — run this before committing
npm run build      # Vite-build relic-optimizer, then assemble _site/
npm run dev        # relic-optimizer hot-reload dev server
npm run validate:data
```

## Conventions

- **No framework** outside `relic-optimizer/` — keep the plain apps dependency-free vanilla ESM.
- **Escape before `innerHTML`** — always interpolate with an `escapeHtml()` helper (see `wiki/app.mjs`), or use `textContent`/`createElement`. Runtime-fetched and `localStorage` data count as untrusted.
- **Tests** use the built-in `node --test` runner (no test framework). Relic-optimizer tests live next to the pure logic they cover (`src/utils/`, `src/data/`); keep React components thin and logic in dependency-free modules so it stays testable without a DOM.
- **JSON imports** in files covered by tests need the import attribute: `import data from './x.json' with { type: 'json' }` (Vite supports it too).
- **Commits** use Conventional Commits (`feat(wiki): ...`, `fix(picker): ...`).
- **Deployment** is fully automatic: push to `main` → GitHub Actions runs `npm test`, builds, deploys `_site/` to Pages. Don't edit `.github/workflows/deploy.yml` without checking `build.mjs` assumptions.

## Updating data

- Gem/ascendancy data: see `CONTRIBUTING.md` (`node tools/generate-gem-data.mjs` after patches).
- Relic data: `relic-optimizer/src/data/relics.json`, hand-maintained from poe2wiki.net / poe2db.tw.
  Adding a modifier requires keeping `parseRelicText.js` keywords in sync — the data tests fail otherwise.

## Notes

- The tree viewer fetches GGG's skill-tree export JSON at runtime (sessionStorage-cached) — it's intentionally not vendored into the repo.
- `docs/plans/` and the root "Project Document" are historical design docs, not living documentation; this file and the README/CONTRIBUTING are authoritative.
