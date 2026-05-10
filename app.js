const rollBtn = document.getElementById('rollBtn');
const resultSection = document.getElementById('result');
const classTag = document.getElementById('classTag');
const ascendancyValue = document.getElementById('ascendancyValue');
const skillValue = document.getElementById('skillValue');
const historySection = document.getElementById('historySection');
const historyList = document.getElementById('historyList');
const clearBtn = document.getElementById('clearBtn');

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function roll() {
  const ascendancy = getRandom(ascendancies);
  const skill = getRandom(skillGems);

  // Update result cards
  classTag.textContent = ascendancy.class;
  ascendancyValue.textContent = ascendancy.name;
  skillValue.textContent = skill;

  // Show result section
  resultSection.classList.remove('hidden');

  // Re-trigger animation
  document.querySelectorAll('.result-card').forEach(card => {
    card.style.animation = 'none';
    card.offsetHeight; // reflow
    card.style.animation = '';
  });

  // Add to history
  addToHistory(ascendancy, skill);
}

function addToHistory(ascendancy, skill) {
  historySection.classList.remove('hidden');

  const li = document.createElement('li');
  li.innerHTML = `
    <span class="history-ascendancy">${ascendancy.class} &mdash; ${ascendancy.name}</span>
    <span class="history-skill">${skill}</span>
  `;

  historyList.insertBefore(li, historyList.firstChild);
}

function clearHistory() {
  historyList.innerHTML = '';
  historySection.classList.add('hidden');
}

rollBtn.addEventListener('click', roll);
clearBtn.addEventListener('click', clearHistory);
