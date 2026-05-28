import { ascendancies } from '../data/ascendancies.mjs';
import { skillGems } from '../data/skills.mjs';

const rollBtn        = document.getElementById('rollBtn');
const resultSection  = document.getElementById('result');
const classTag       = document.getElementById('classTag');
const ascendancyValue = document.getElementById('ascendancyValue');
const skillValue     = document.getElementById('skillValue');
const downloadBtn    = document.getElementById('downloadBtn');
const historySection = document.getElementById('historySection');
const historyList    = document.getElementById('historyList');
const clearBtn       = document.getElementById('clearBtn');

let currentRoll = null;

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function roll() {
  const ascendancy = getRandom(ascendancies);
  const skill = getRandom(skillGems);
  currentRoll = { ascendancy, skill };

  classTag.textContent = ascendancy.className;
  ascendancyValue.textContent = ascendancy.name;
  skillValue.textContent = skill.name;

  resultSection.classList.remove('hidden');
  downloadBtn.classList.remove('hidden');

  document.querySelectorAll('.result-card').forEach(card => {
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = '';
  });

  addToHistory(ascendancy, skill);
}

function addToHistory(ascendancy, skill) {
  historySection.classList.remove('hidden');

  const li = document.createElement('li');
  li.innerHTML = `
    <span class="history-ascendancy">${ascendancy.className} &mdash; ${ascendancy.name}</span>
    <span class="history-skill">${skill.name}</span>
  `;

  historyList.insertBefore(li, historyList.firstChild);
}

function clearHistory() {
  historyList.innerHTML = '';
  historySection.classList.add('hidden');
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

rollBtn.addEventListener('click', roll);
clearBtn.addEventListener('click', clearHistory);
downloadBtn.addEventListener('click', downloadBuild);
