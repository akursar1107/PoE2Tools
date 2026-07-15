import { ascendancies } from '../data/ascendancies.mjs';
import { skillGems } from '../data/skills.mjs';

// DOM Elements
const rollBtn = document.getElementById('rollBtn');
const downloadBtn = document.getElementById('downloadBtn');
const muteBtn = document.getElementById('muteBtn');
const spinnerContainer = document.getElementById('spinnerContainer');
const historySection = document.getElementById('historySection');
const historyList = document.getElementById('historyList');
const clearBtn = document.getElementById('clearBtn');
const classTag = document.getElementById('classTag');
const skillTags = document.getElementById('skillTags');

const HISTORY_KEY = 'poe2_roll_history';
const HISTORY_MAX = 50;

let history = loadHistory();
let currentRoll = null;

// Sound System
let audioCtx = null;
let isMuted = localStorage.getItem('poe2_randomizer_muted') === 'true';
updateMuteIcon();

function updateMuteIcon() {
  muteBtn.textContent = isMuted ? '🔇' : '🔊';
}

muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  localStorage.setItem('poe2_randomizer_muted', isMuted);
  updateMuteIcon();
  // Resume context if needed
  if (!isMuted && !audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
});

function playTickSound() {
  if (isMuted) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    // High pitch, short decay triangle wave for click sound
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch (e) {
    console.warn('Audio tick failed:', e);
  }
}

// Reel Class
class Reel {
  constructor(viewportId, stripId, clickerId, items) {
    this.viewport = document.getElementById(viewportId);
    this.strip = document.getElementById(stripId);
    this.clicker = document.getElementById(clickerId);
    this.items = items;
    this.itemHeight = 60;
    this.viewportHeight = 180;
    this.y = 0;
    this.targetY = 0;
    this.animating = false;
    this.sequence = [];
    this.stopIndex = 30; // landing index in sequence
    this.lastTickIndex = -1;
  }

  setup(targetItem) {
    this.sequence = [];
    // Generate items. Fill with random selections, set sequence[stopIndex] to target
    for (let i = 0; i < this.stopIndex + 3; i++) {
      if (i === this.stopIndex) {
        this.sequence.push(targetItem);
      } else {
        this.sequence.push(getRandom(this.items));
      }
    }

    // Render elements inside strip
    this.strip.innerHTML = '';
    this.sequence.forEach(item => {
      const div = document.createElement('div');
      div.className = 'spinner-item';
      div.textContent = item.name;
      this.strip.appendChild(div);
    });

    this.y = 0;
    this.targetY = (this.stopIndex - 1) * this.itemHeight;
    this.lastTickIndex = -1;
    this.updatePosition(0);
    this.viewport.classList.add('spinning');
  }

  updatePosition(y) {
    this.y = y;
    this.strip.style.transform = `translateY(${-y}px)`;

    // Calculate scale, opacity, and active class for items
    const children = this.strip.children;
    const centerOffset = y + this.viewportHeight / 2;

    for (let idx = 0; idx < children.length; idx++) {
      const item = children[idx];
      const itemCenter = idx * this.itemHeight + this.itemHeight / 2;
      const dist = Math.abs(itemCenter - centerOffset);

      // Fish-eye scaling and opacity fading
      const scale = Math.max(0.8, 1.25 - (dist / 140) * 0.45);
      const opacity = Math.max(0.3, 1.0 - (dist / 110) * 0.7);

      item.style.transform = `scale(${scale})`;
      item.style.opacity = opacity;

      // Center active class (within 30px of center)
      if (dist < 30) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    }

    // Trigger clicker needle tick
    const currentTickIndex = Math.floor((y + this.itemHeight / 2) / this.itemHeight);
    if (currentTickIndex !== this.lastTickIndex) {
      if (this.lastTickIndex !== -1) {
        this.triggerClickerAnimation();
        playTickSound();
      }
      this.lastTickIndex = currentTickIndex;
    }
  }

  triggerClickerAnimation() {
    this.clicker.classList.remove('tick-down', 'tick-up');
    // Alternate direction of clicker bounce for variety
    const dirClass = Math.random() > 0.5 ? 'tick-down' : 'tick-up';
    this.clicker.classList.add(dirClass);
    setTimeout(() => {
      this.clicker.classList.remove(dirClass);
    }, 50);
  }

  spin(duration, onDone) {
    this.animating = true;
    const startTime = performance.now();

    const animate = (currentTime) => {
      if (!this.animating) return;
      const elapsed = currentTime - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Ease out quartic
      const progress = 1 - Math.pow(1 - t, 4);
      const currentY = progress * this.targetY;

      this.updatePosition(currentY);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        this.animating = false;
        this.viewport.classList.remove('spinning');
        onDone();
      }
    };

    requestAnimationFrame(animate);
  }
}

// Instantiate Reels
const ascendancyReel = new Reel('ascendancyViewport', 'ascendancyStrip', 'ascendancyClicker', ascendancies);
const skillReel = new Reel('skillViewport', 'skillStrip', 'skillClicker', skillGems);

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function roll() {
  rollBtn.disabled = true;
  rollBtn.textContent = 'Rolling...';
  downloadBtn.classList.add('hidden');
  spinnerContainer.classList.remove('hidden');

  // Clear sub-tags during spin
  classTag.textContent = '';
  classTag.style.opacity = 0;
  skillTags.innerHTML = '';
  skillTags.style.opacity = 0;

  const targetAscendancy = getRandom(ascendancies);
  const targetSkill = getRandom(skillGems);
  currentRoll = { ascendancy: targetAscendancy, skill: targetSkill };

  // Setup reels with target
  ascendancyReel.setup(targetAscendancy);
  skillReel.setup(targetSkill);

  let doneCount = 0;
  const onReelDone = () => {
    doneCount++;
    if (doneCount === 1) {
      // Ascendancy finished first (shorter duration)
      classTag.textContent = targetAscendancy.className;
      classTag.style.opacity = 1;
      classTag.style.transition = 'opacity 0.3s ease';
    } else if (doneCount === 2) {
      // Both finished
      renderTags(targetSkill);
      skillTags.style.opacity = 1;
      skillTags.style.transition = 'opacity 0.3s ease';

      rollBtn.disabled = false;
      rollBtn.textContent = 'Roll Build';
      downloadBtn.classList.remove('hidden');

      addToHistory(targetAscendancy, targetSkill);
    }
  };

  // Spin with staggered durations: Ascendancy (2.0s), Skill Gem (2.8s)
  ascendancyReel.spin(2000, onReelDone);
  skillReel.spin(2800, onReelDone);
}

// Sub tags rendering
function renderTags(skill) {
  skillTags.innerHTML = '';
  const pills = [];
  if (skill.kind) pills.push({ text: skill.kind, primary: true });
  if (skill.tags?.length) skill.tags.slice(0, 4).forEach(t => pills.push({ text: t }));

  if (pills.length === 0) return;
  pills.forEach(({ text, primary }) => {
    const span = document.createElement('span');
    span.className = 'tag' + (primary ? ' tag--primary' : '');
    span.textContent = text;
    skillTags.appendChild(span);
  });
}

// History & Storage Helpers
function addToHistory(ascendancy, skill) {
  const entry = {
    className: ascendancy.className,
    ascendancy: ascendancy.name,
    skill: skill.name,
  };
  history.unshift(entry);
  if (history.length > HISTORY_MAX) history = history.slice(0, HISTORY_MAX);
  saveHistory();
  renderHistoryItem(entry, true);
  historySection.classList.remove('hidden');
}

function renderHistoryItem(entry, prepend = false) {
  const li = document.createElement('li');
  li.innerHTML = `
    <span class="history-ascendancy">${entry.className} &mdash; ${entry.ascendancy}</span>
    <span class="history-skill">${entry.skill}</span>
  `;
  if (prepend) {
    historyList.insertBefore(li, historyList.firstChild);
  } else {
    historyList.appendChild(li);
  }
}

// History Actions
function clearHistory() {
  history = [];
  saveHistory();
  historyList.innerHTML = '';
  historySection.classList.add('hidden');
}

function saveHistory() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (_) {}
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function restoreHistory() {
  if (history.length === 0) return;
  history.forEach(entry => renderHistoryItem(entry));
  historySection.classList.remove('hidden');
}

function downloadBuild() {
  if (!currentRoll) return;
  const { ascendancy, skill } = currentRoll;

  const build = {
    name: `Random Build: ${ascendancy.name} \u2014 ${skill.name}`,
    author: 'PoE2Tools',
    description: 'Randomly generated at PoE2Tools. Drop this file into Documents/My Games/Path of Exile 2/BuildPlanner/',
    ascendancy: ascendancy.name,
  };

  if (ascendancy.passiveNodes?.length) {
    build.passives = ascendancy.passiveNodes.map(id => String(id));
  }

  if (skill.buildId) {
    build.skills = [{ id: skill.buildId }];
  }

  const slug = `${ascendancy.name}-${skill.name}`
    .toLowerCase()
    .replace(/['\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  const blob = new Blob([JSON.stringify(build, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug}.build`;
  a.click();
  URL.revokeObjectURL(url);
}

// Event Listeners
rollBtn.addEventListener('click', roll);
clearBtn.addEventListener('click', clearHistory);
downloadBtn.addEventListener('click', downloadBuild);

// Initialize
restoreHistory();
