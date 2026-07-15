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

// Ease out back physics curve (rebound at the end of scroll)
function easeOutBack(t) {
  const c1 = 1.25; // overshoot multiplier
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
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
    for (let i = 0; i < this.stopIndex + 3; i++) {
      if (i === this.stopIndex) {
        this.sequence.push(targetItem);
      } else {
        this.sequence.push(getRandom(this.items));
      }
    }

    this.strip.innerHTML = '';
    this.sequence.forEach(item => {
      const div = document.createElement('div');
      div.className = 'spinner-item';
      div.textContent = item.name;
      if (item.className) {
        div.setAttribute('data-class', item.className);
      }
      this.strip.appendChild(div);
    });

    this.y = 0;
    this.targetY = (this.stopIndex - 1) * this.itemHeight;
    this.lastTickIndex = -1;
    this.updatePosition(0);
    this.viewport.classList.add('spinning');
  }

  snapTo(targetItem) {
    this.setup(targetItem);
    this.updatePosition(this.targetY);
    this.viewport.classList.remove('spinning');
  }

  updatePosition(y) {
    this.y = y;
    this.strip.style.transform = `translateY(${-y}px)`;

    const children = this.strip.children;
    const centerOffset = y + this.viewportHeight / 2;

    for (let idx = 0; idx < children.length; idx++) {
      const item = children[idx];
      const itemCenter = idx * this.itemHeight + this.itemHeight / 2;
      const dist = Math.abs(itemCenter - centerOffset);

      const scale = Math.max(0.8, 1.25 - (dist / 140) * 0.45);
      const opacity = Math.max(0.3, 1.0 - (dist / 110) * 0.7);

      item.style.transform = `scale(${scale})`;
      item.style.opacity = opacity;

      if (dist < 30) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    }

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

      const progress = easeOutBack(t);
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

  classTag.textContent = '';
  classTag.style.opacity = 0;
  skillTags.innerHTML = '';
  skillTags.style.opacity = 0;

  const targetAscendancy = getRandom(ascendancies);
  const targetSkill = getRandom(skillGems);
  currentRoll = { ascendancy: targetAscendancy, skill: targetSkill };

  ascendancyReel.setup(targetAscendancy);
  skillReel.setup(targetSkill);

  let doneCount = 0;
  const onReelDone = () => {
    doneCount++;
    if (doneCount === 1) {
      classTag.textContent = targetAscendancy.className;
      classTag.setAttribute('data-class', targetAscendancy.className);
      classTag.style.opacity = 1;
      classTag.style.transition = 'opacity 0.3s ease';
    } else if (doneCount === 2) {
      renderTags(targetSkill);
      skillTags.style.opacity = 1;
      skillTags.style.transition = 'opacity 0.3s ease';

      rollBtn.disabled = false;
      rollBtn.textContent = 'Roll Build';
      downloadBtn.classList.remove('hidden');

      addToHistory(targetAscendancy, targetSkill);
    }
  };

  ascendancyReel.spin(2000, onReelDone);
  skillReel.spin(2800, onReelDone);
}

// Load a clicked historic build with a quick transition spin
function loadHistoricBuild(entry) {
  const ascendancy = ascendancies.find(a => a.name === entry.ascendancy);
  const skill = skillGems.find(s => s.name === entry.skill);
  if (!ascendancy || !skill) return;

  currentRoll = { ascendancy, skill };

  rollBtn.disabled = true;
  rollBtn.textContent = 'Loading...';
  downloadBtn.classList.add('hidden');

  classTag.textContent = '';
  classTag.style.opacity = 0;
  skillTags.innerHTML = '';
  skillTags.style.opacity = 0;

  ascendancyReel.setup(ascendancy);
  skillReel.setup(skill);

  let doneCount = 0;
  const onReelDone = () => {
    doneCount++;
    if (doneCount === 2) {
      classTag.textContent = ascendancy.className;
      classTag.setAttribute('data-class', ascendancy.className);
      classTag.style.opacity = 1;

      renderTags(skill);
      skillTags.style.opacity = 1;

      rollBtn.disabled = false;
      rollBtn.textContent = 'Roll Build';
      downloadBtn.classList.remove('hidden');
    }
  };

  ascendancyReel.spin(600, onReelDone);
  skillReel.spin(800, onReelDone);
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
    <span class="history-ascendancy" data-class="${entry.className}">${entry.className} &mdash; ${entry.ascendancy}</span>
    <span class="history-skill">${entry.skill}</span>
  `;
  li.addEventListener('click', () => {
    if (rollBtn.disabled) return;
    loadHistoricBuild(entry);
  });
  if (prepend) {
    historyList.insertBefore(li, historyList.firstChild);
  } else {
    historyList.appendChild(li);
  }
}

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
  spinnerContainer.classList.remove('hidden');

  if (history.length > 0) {
    history.forEach(entry => renderHistoryItem(entry));
    historySection.classList.remove('hidden');

    // Snap to the most recent history item on load
    const lastRoll = history[0];
    const ascendancy = ascendancies.find(a => a.name === lastRoll.ascendancy);
    const skill = skillGems.find(s => s.name === lastRoll.skill);
    if (ascendancy && skill) {
      currentRoll = { ascendancy, skill };
      ascendancyReel.snapTo(ascendancy);
      skillReel.snapTo(skill);
      classTag.textContent = ascendancy.className;
      classTag.setAttribute('data-class', ascendancy.className);
      classTag.style.opacity = 1;
      renderTags(skill);
      skillTags.style.opacity = 1;
      downloadBtn.classList.remove('hidden');
    }
  } else {
    // Snap to default placeholder on load (Titan + Fireball)
    const defaultAsc = ascendancies[0];
    const defaultSkill = skillGems[0];
    ascendancyReel.snapTo(defaultAsc);
    skillReel.snapTo(defaultSkill);
    classTag.textContent = defaultAsc.className;
    classTag.setAttribute('data-class', defaultAsc.className);
    classTag.style.opacity = 1;
    renderTags(defaultSkill);
    skillTags.style.opacity = 1;
  }
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

// Global hotkeys (Spacebar rolls)
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !rollBtn.disabled) {
    // Avoid double roll if button is activeElement and already triggers on click/space
    if (document.activeElement === rollBtn) return;
    e.preventDefault();
    roll();
  }
});

// Initialize
restoreHistory();
