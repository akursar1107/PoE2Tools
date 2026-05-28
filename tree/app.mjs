const DATA_URL = 'https://raw.githubusercontent.com/grindinggear/poe2-skilltree-export/main/data.json';
const CACHE_KEY = 'poe2tree_v1';

// ── DOM refs ──────────────────────────────────────────────────────────────────
const loadingEl   = document.getElementById('loading');
const appEl       = document.getElementById('app');
const canvas      = document.getElementById('treeCanvas');
const ctx         = canvas.getContext('2d');
const tooltip     = document.getElementById('tooltip');
const panel       = document.getElementById('panel');
const panelClose  = document.getElementById('panelClose');
const panelType   = document.getElementById('panelType');
const panelName   = document.getElementById('panelName');
const panelAsc    = document.getElementById('panelAscendancy');
const panelStats  = document.getElementById('panelStats');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// ── State ─────────────────────────────────────────────────────────────────────
let nodes = [];          // processed flat array
let nodeById = {};       // skill id (string) -> node
let edgePairs = [];      // [{from, to}] with references resolved
let highlightIds = new Set();
let pinnedNode = null;

const camera = { x: 0, y: 0, scale: 0.018 };

// ── Coordinate transforms ─────────────────────────────────────────────────────
function worldToScreen(wx, wy) {
  return {
    x: (wx - camera.x) * camera.scale + canvas.width / 2,
    y: (wy - camera.y) * camera.scale + canvas.height / 2,
  };
}
function screenToWorld(sx, sy) {
  return {
    x: (sx - canvas.width / 2) / camera.scale + camera.x,
    y: (sy - canvas.height / 2) / camera.scale + camera.y,
  };
}

// ── Stat text cleanup ─────────────────────────────────────────────────────────
function formatStat(stat) {
  return stat
    .replace(/\[([^\]|]+)\|([^\]]+)\]/g, '$2')  // [id|display] → display
    .replace(/\[([^\]]+)\]/g, '$1')              // [word] → word
    .replace(/<[^>]+\{([^}]+)\}[^>]*>/g, '$1')  // <tag>{text} → text
    .replace(/<[^>]+>/g, '')                     // strip remaining tags
    .trim();
}

// ── Node type helpers ─────────────────────────────────────────────────────────
function nodeType(n) {
  if (n.isKeystone)        return 'keystone';
  if (n.isAscendancyStart) return 'ascendancy';
  if (n.ascendancyId)      return 'ascendancy';
  if (n.isNotable)         return 'notable';
  return 'normal';
}

const TYPE_COLORS = {
  normal:     '#4a5568',
  notable:    '#c89b3c',
  keystone:   '#9f7aea',
  ascendancy: '#48bb78',
};
const TYPE_RADII = {
  normal:     3,
  notable:    6,
  keystone:   10,
  ascendancy: 8,
};

// ── Data loading ──────────────────────────────────────────────────────────────
async function loadData() {
  let raw;
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) { raw = JSON.parse(cached); }
  } catch (_) { /* sessionStorage full or unavailable */ }

  if (!raw) {
    const res = await fetch(DATA_URL);
    raw = await res.json();
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(raw)); } catch (_) {}
  }

  // Build flat node array
  for (const [key, v] of Object.entries(raw.nodes)) {
    if (!('x' in v)) continue; // skip root
    const node = {
      id: key,
      skill: v.skill ?? key,
      name: v.name || '',
      stats: (v.stats || []).flatMap(s => s.split('\n')).map(formatStat).filter(Boolean),
      x: v.x,
      y: v.y,
      isNotable:        !!v.isNotable,
      isKeystone:       !!v.isKeystone,
      isAscendancyStart: !!v.isAscendancyStart,
      ascendancyId:     v.ascendancyId || null,
    };
    nodes.push(node);
    nodeById[key] = node;
  }

  // Resolve edges to node refs
  for (const e of (raw.edges || [])) {
    const from = nodeById[String(e.from)];
    const to   = nodeById[String(e.to)];
    if (from && to) edgePairs.push({ from, to });
  }
}

// ── Rendering ─────────────────────────────────────────────────────────────────
function resizeCanvas() {
  canvas.width  = canvas.clientWidth  * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
}

function isOnScreen(sx, sy, pad = 20) {
  return sx > -pad && sx < canvas.width + pad && sy > -pad && sy < canvas.height + pad;
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Edges (batched into one path for performance)
  ctx.beginPath();
  ctx.strokeStyle = '#252a3a';
  ctx.lineWidth = Math.max(0.5, camera.scale * 2);
  for (const { from, to } of edgePairs) {
    const a = worldToScreen(from.x, from.y);
    const b = worldToScreen(to.x, to.y);
    if (!isOnScreen(a.x, a.y) && !isOnScreen(b.x, b.y)) continue;
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
  }
  ctx.stroke();

  // Highlight rings (search matches) — behind nodes
  if (highlightIds.size > 0) {
    ctx.strokeStyle = 'rgba(224,184,78,0.7)';
    ctx.lineWidth = 2;
    for (const node of nodes) {
      if (!highlightIds.has(node.id)) continue;
      const { x, y } = worldToScreen(node.x, node.y);
      if (!isOnScreen(x, y)) continue;
      const type = nodeType(node);
      const r = TYPE_RADII[type] * camera.scale * devicePixelRatio + 4;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(4, r), 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Nodes grouped by type for fewer state changes
  const groups = { normal: [], notable: [], keystone: [], ascendancy: [] };
  for (const node of nodes) {
    const { x, y } = worldToScreen(node.x, node.y);
    if (!isOnScreen(x, y)) continue;
    groups[nodeType(node)].push({ node, x, y });
  }

  for (const [type, items] of Object.entries(groups)) {
    const baseR = TYPE_RADII[type] * camera.scale * devicePixelRatio;
    const r = Math.max(1.5, baseR);
    ctx.fillStyle = TYPE_COLORS[type];
    for (const { x, y } of items) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Border for notable/keystone/ascendancy
    if (type !== 'normal') {
      ctx.strokeStyle = TYPE_COLORS[type] + 'aa';
      ctx.lineWidth = Math.max(1, camera.scale * 3);
      for (const { x, y } of items) {
        ctx.beginPath();
        ctx.arc(x, y, r + 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  // Node labels at high zoom
  if (camera.scale > 0.045) {
    ctx.fillStyle = 'rgba(232,232,236,0.85)';
    ctx.font = `${Math.round(10 * camera.scale * devicePixelRatio)}px "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    for (const { node, x, y } of [...groups.notable, ...groups.keystone, ...groups.ascendancy]) {
      if (!node.name) continue;
      const r = TYPE_RADII[nodeType(node)] * camera.scale * devicePixelRatio;
      ctx.fillText(node.name, x, y + r + 11);
    }
  }
}

// ── Hit detection ─────────────────────────────────────────────────────────────
function findNodeAt(sx, sy) {
  const world = screenToWorld(sx / devicePixelRatio, sy / devicePixelRatio);
  const threshold = 18 / camera.scale;
  let closest = null;
  let closestDist = threshold;
  for (const node of nodes) {
    const dx = node.x - world.x;
    const dy = node.y - world.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < closestDist) { closestDist = dist; closest = node; }
  }
  return closest;
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
function showTooltip(node, clientX, clientY) {
  const lines = node.stats.slice(0, 4);
  tooltip.innerHTML = `<strong>${node.name || 'Unnamed node'}</strong>${lines.map(s => `<p>${s}</p>`).join('')}`;
  tooltip.classList.remove('hidden');
  positionTooltip(clientX, clientY);
}
function positionTooltip(cx, cy) {
  const tw = tooltip.offsetWidth, th = tooltip.offsetHeight;
  let x = cx + 16, y = cy - 8;
  if (x + tw > window.innerWidth - 8) x = cx - tw - 16;
  if (y + th > window.innerHeight - 8) y = window.innerHeight - th - 8;
  tooltip.style.left = x + 'px';
  tooltip.style.top  = y + 'px';
}
function hideTooltip() { tooltip.classList.add('hidden'); }

// ── Side panel ────────────────────────────────────────────────────────────────
function showPanel(node) {
  pinnedNode = node;
  const type = nodeType(node);
  panelType.textContent = type.charAt(0).toUpperCase() + type.slice(1);
  panelType.className = `panel-type ${type}`;
  panelName.textContent = node.name || 'Unnamed node';

  if (node.ascendancyId) {
    panelAsc.textContent = node.ascendancyId.replace(/(\d)/, ' $1');
    panelAsc.classList.remove('hidden');
  } else {
    panelAsc.classList.add('hidden');
  }

  panelStats.innerHTML = node.stats.length
    ? node.stats.map(s => `<li>${s}</li>`).join('')
    : '<li style="color:var(--text-muted)">No stats</li>';

  panel.classList.remove('hidden');
}

panelClose.addEventListener('click', () => {
  panel.classList.add('hidden');
  pinnedNode = null;
});

// ── Pan / Zoom ────────────────────────────────────────────────────────────────
let panning = false;
let panStart = { x: 0, y: 0 };
let cameraAtStart = { x: 0, y: 0 };
let lastHovered = null;
let moved = false;

canvas.addEventListener('mousedown', e => {
  panning = true;
  moved = false;
  panStart = { x: e.clientX, y: e.clientY };
  cameraAtStart = { x: camera.x, y: camera.y };
});

canvas.addEventListener('mousemove', e => {
  if (panning) {
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true;
    camera.x = cameraAtStart.x - dx / camera.scale;
    camera.y = cameraAtStart.y - dy / camera.scale;
    render();
    hideTooltip();
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const sx = (e.clientX - rect.left) * devicePixelRatio;
  const sy = (e.clientY - rect.top)  * devicePixelRatio;
  const node = findNodeAt(sx, sy);
  if (node && node !== lastHovered) {
    lastHovered = node;
    showTooltip(node, e.clientX, e.clientY);
  } else if (node) {
    positionTooltip(e.clientX, e.clientY);
  } else {
    lastHovered = null;
    hideTooltip();
  }
});

canvas.addEventListener('mouseup', e => {
  if (!moved) {
    const rect = canvas.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * devicePixelRatio;
    const sy = (e.clientY - rect.top)  * devicePixelRatio;
    const node = findNodeAt(sx, sy);
    if (node) showPanel(node);
  }
  panning = false;
});

canvas.addEventListener('mouseleave', () => { panning = false; hideTooltip(); lastHovered = null; });

canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const factor = e.deltaY > 0 ? 0.88 : 1.14;
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left);
  const my = (e.clientY - rect.top);
  const wBefore = screenToWorld(mx, my);
  camera.scale = Math.min(Math.max(camera.scale * factor, 0.008), 2);
  const wAfter = screenToWorld(mx, my);
  camera.x -= wAfter.x - wBefore.x;
  camera.y -= wAfter.y - wBefore.y;
  render();
}, { passive: false });

// Touch support
let touches = [];
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  touches = [...e.touches];
  panning = true;
  moved = false;
  if (touches.length === 1) {
    panStart = { x: touches[0].clientX, y: touches[0].clientY };
    cameraAtStart = { x: camera.x, y: camera.y };
  }
}, { passive: false });

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  if (e.touches.length === 2) {
    const prev = touches;
    const curr = [...e.touches];
    const prevDist = Math.hypot(prev[0].clientX - prev[1].clientX, prev[0].clientY - prev[1].clientY);
    const currDist = Math.hypot(curr[0].clientX - curr[1].clientX, curr[0].clientY - curr[1].clientY);
    if (prevDist > 0) {
      const midX = (curr[0].clientX + curr[1].clientX) / 2;
      const midY = (curr[0].clientY + curr[1].clientY) / 2;
      const wBefore = screenToWorld(midX, midY);
      camera.scale = Math.min(Math.max(camera.scale * (currDist / prevDist), 0.008), 2);
      const wAfter = screenToWorld(midX, midY);
      camera.x -= wAfter.x - wBefore.x;
      camera.y -= wAfter.y - wBefore.y;
    }
    touches = curr;
    render();
  } else if (e.touches.length === 1) {
    moved = true;
    camera.x = cameraAtStart.x - (e.touches[0].clientX - panStart.x) / camera.scale;
    camera.y = cameraAtStart.y - (e.touches[0].clientY - panStart.y) / camera.scale;
    render();
  }
}, { passive: false });

canvas.addEventListener('touchend', e => {
  if (!moved && e.changedTouches.length === 1) {
    const rect = canvas.getBoundingClientRect();
    const t = e.changedTouches[0];
    const sx = (t.clientX - rect.left) * devicePixelRatio;
    const sy = (t.clientY - rect.top)  * devicePixelRatio;
    const node = findNodeAt(sx, sy);
    if (node) showPanel(node);
  }
  panning = false;
});

// ── Search ────────────────────────────────────────────────────────────────────
function doSearch(query) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) { clearSearch(); return; }

  const matches = nodes.filter(n =>
    n.name.toLowerCase().includes(q) ||
    n.stats.some(s => s.toLowerCase().includes(q))
  ).slice(0, 8);

  highlightIds = new Set(matches.map(n => n.id));
  render();

  searchResults.innerHTML = matches.length
    ? matches.map(n => {
        const type = nodeType(n);
        return `<li data-id="${n.id}">${n.name || 'Unnamed'}<span class="result-type">${type}</span></li>`;
      }).join('')
    : '<li style="color:var(--text-muted);pointer-events:none">No results</li>';
  searchResults.classList.remove('hidden');
}

function clearSearch() {
  highlightIds.clear();
  searchResults.classList.add('hidden');
  render();
}

function jumpTo(node) {
  camera.x = node.x;
  camera.y = node.y;
  camera.scale = 0.12;
  render();
  showPanel(node);
}

searchInput.addEventListener('input', e => doSearch(e.target.value));
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Escape') { clearSearch(); searchInput.value = ''; searchInput.blur(); }
});

searchResults.addEventListener('click', e => {
  const li = e.target.closest('li[data-id]');
  if (!li) return;
  const node = nodeById[li.dataset.id];
  if (node) { jumpTo(node); clearSearch(); searchInput.value = node.name; }
});

document.addEventListener('click', e => {
  if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) clearSearch();
});

// ── Resize ────────────────────────────────────────────────────────────────────
const ro = new ResizeObserver(() => { resizeCanvas(); render(); });
ro.observe(canvas);

// ── Init ──────────────────────────────────────────────────────────────────────
(async () => {
  try {
    await loadData();
    resizeCanvas();
    loadingEl.classList.add('hidden');
    appEl.classList.remove('hidden');
    render();
  } catch (err) {
    loadingEl.innerHTML = `<p style="color:#fc8181">Failed to load tree data.<br>${err.message}</p>`;
  }
})();
