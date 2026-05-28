#!/usr/bin/env node
/**
 * PoE2 Tools — Site assembler
 *
 * Assembles _site/ from app manifests.
 * Injects shared nav into every index.html.
 * Excludes test files automatically.
 * Run: node build.mjs
 *
 * Called by .github/workflows/deploy.yml instead of the manual cp chain.
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SITE = join(ROOT, '_site');

// ── Shared nav ────────────────────────────────────────────────────────────────

const NAV_HTML = `
<nav class="site-nav" aria-label="PoE2 Tools navigation">
  <a href="../" class="nav-brand">⚔ PoE2 Tools</a>
  <ul>
    <li><a href="../picker/">Build Randomizer</a></li>
    <li><a href="../wiki/">Wiki</a></li>
    <li><a href="../tree/">Skill Tree</a></li>
    <li><a href="../relic-optimizer/">Relic Optimizer</a></li>
  </ul>
</nav>
`.trim();

// Nav CSS — inlined so it works without an extra request
const NAV_CSS = `
<style>
.site-nav {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.6rem 1.5rem;
  background: rgba(9, 11, 17, 0.9);
  border-bottom: 1px solid rgba(200, 155, 60, 0.2);
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 100;
  flex-wrap: wrap;
}
.site-nav .nav-brand {
  font-weight: 700;
  font-size: 1rem;
  color: #c89b3c;
  text-decoration: none;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.site-nav ul {
  list-style: none;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 0;
  padding: 0;
}
.site-nav a {
  color: #9ea7c0;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}
.site-nav a:hover { color: #f2eee6; }
</style>
`.trim();

/** Inject nav + nav CSS into an HTML string, right after <body> */
function injectNav(html) {
  return html.replace(/<body([^>]*)>/, (match) => `${match}\n${NAV_CSS}\n${NAV_HTML}`);
}

// ── Copy helpers ──────────────────────────────────────────────────────────────

const EXCLUDED = /\.(test|spec)\.[mc]?[jt]s$/i;

function copyDir(src, dest, opts = {}) {
  const { only, exclude = [] } = opts;
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    if (EXCLUDED.test(entry)) continue;
    if (exclude.includes(entry)) continue;
    if (only && !only.includes(entry) && !only.some(p => entry.startsWith(p))) continue;
    const s = join(src, entry);
    const d = join(dest, entry);
    if (statSync(s).isDirectory()) {
      copyDir(s, d);
    } else {
      copyFileSync(s, d);
    }
  }
}

function copyFile(src, dest) {
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
}

function copyHtml(src, dest, withNav = true) {
  mkdirSync(dirname(dest), { recursive: true });
  let html = readFileSync(src, 'utf8');
  if (withNav) html = injectNav(html);
  writeFileSync(dest, html);
}

// ── Apps manifest ─────────────────────────────────────────────────────────────

function build() {
  mkdirSync(SITE, { recursive: true });

  // Root landing page (no inner nav — it IS the hub)
  copyFile(join(ROOT, 'index.html'), join(SITE, 'index.html'));

  // Shared tokens (referenced by app CSS via @import)
  copyFile(join(ROOT, 'shared/tokens.css'), join(SITE, 'shared/tokens.css'));

  // Canonical data layer (imported by picker and wiki via relative paths)
  copyDir(join(ROOT, 'data'), join(SITE, 'data'));

  // ── picker ──────────────────────────────────────────────────────────────────
  {
    const src = join(ROOT, 'picker');
    const dest = join(SITE, 'picker');
    mkdirSync(dest, { recursive: true });
    copyHtml(join(src, 'index.html'), join(dest, 'index.html'));
    copyFile(join(src, 'style.css'), join(dest, 'style.css'));
    copyFile(join(src, 'app.mjs'), join(dest, 'app.mjs'));
    // Legacy files no longer needed — omit data.js and app.js
  }

  // ── wiki ────────────────────────────────────────────────────────────────────
  {
    const src = join(ROOT, 'wiki');
    const dest = join(SITE, 'wiki');
    mkdirSync(dest, { recursive: true });
    copyHtml(join(src, 'index.html'), join(dest, 'index.html'));
    copyFile(join(src, 'style.css'), join(dest, 'style.css'));
    copyFile(join(src, 'app.mjs'), join(dest, 'app.mjs'));
    // data/ — re-export stubs that point to ../../data/
    copyDir(join(src, 'data'), join(dest, 'data'));
    // lib/ — helpers (excluding test files, handled by EXCLUDED regex)
    copyDir(join(src, 'lib'), join(dest, 'lib'));
  }

  // ── tree ────────────────────────────────────────────────────────────────────
  {
    const src = join(ROOT, 'tree');
    const dest = join(SITE, 'tree');
    mkdirSync(dest, { recursive: true });
    copyHtml(join(src, 'index.html'), join(dest, 'index.html'));
    copyFile(join(src, 'style.css'), join(dest, 'style.css'));
    copyFile(join(src, 'app.mjs'), join(dest, 'app.mjs'));
  }

  // ── relic-optimizer (pre-built by Vite before build.mjs runs) ───────────────
  {
    const src = join(ROOT, 'relic-optimizer/dist');
    const dest = join(SITE, 'relic-optimizer');
    copyDir(src, dest);
    // Inject nav into the Vite-built index.html
    const indexPath = join(dest, 'index.html');
    const html = readFileSync(indexPath, 'utf8');
    writeFileSync(indexPath, injectNav(html));
  }

  const appCount = ['picker', 'wiki', 'tree', 'relic-optimizer'].length;
  console.log(`✔  Assembled _site/ — ${appCount} apps, nav injected`);
}

build();
