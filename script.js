document.querySelectorAll('.tab-btn').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(button.dataset.tab).classList.add('active');
  });
});

// Accent and theme toggle
const accentSelect = document.getElementById('accentSelect');
accentSelect.addEventListener('change', () => {
  let val = accentSelect.value;
  document.body.classList.remove('rainbow');
  switch (val) {
    case 'blue':
      document.documentElement.style.setProperty('--accent-color', 'var(--accent-blue)');
      break;
    case 'green':
      document.documentElement.style.setProperty('--accent-color', 'var(--accent-green)');
      break;
    case 'red':
      document.documentElement.style.setProperty('--accent-color', 'var(--accent-red)');
      break;
    case 'purple':
      document.documentElement.style.setProperty('--accent-color', 'var(--accent-purple)');
      break;
    case 'rainbow':
      document.body.classList.add('rainbow');
      document.documentElement.style.setProperty('--accent-color', 'linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)');
      break;
  }
});

document.getElementById('themeSelect').addEventListener('change', (e) => {
  document.body.classList.toggle('dark', e.target.value === 'dark');
});

// Load iframe
document.getElementById('loadIframeBtn').addEventListener('click', () => {
  const url = document.getElementById('iframeURL').value;
  document.getElementById('loaderIframe').src = url;
});

document.getElementById('fullscreenBtn').addEventListener('click', () => {
  const iframe = document.getElementById('loaderIframe');
  if (iframe.requestFullscreen) iframe.requestFullscreen();
});

// Add game button
const gameList = document.getElementById('gameList');
const searchInput = document.getElementById('searchInput');

function createGameButton(name, url) {
  const btn = document.createElement('button');
  btn.textContent = name;
  btn.addEventListener('click', () => window.location.href = url);
  return btn;
}

document.getElementById('addGameBtn').addEventListener('click', () => {
  const name = document.getElementById('customName').value;
  const url = document.getElementById('customURL').value;
  if (name && url) {
    gameList.appendChild(createGameButton(name, url));
  }
});

// Search filter
searchInput.addEventListener('input', () => {
  const term = searchInput.value.toLowerCase();
  Array.from(gameList.children).forEach(button => {
    button.style.display = button.textContent.toLowerCase().includes(term) ? '' : 'none';
  });
});

// Pre-made games
const defaultGames = [
  { name: 'Game 1', url: 'https://example.com/game1' },
  { name: 'Game 2', url: 'https://example.com/game2' },
  { name: 'Game 3', url: 'https://example.com/game3' },
];

defaultGames.forEach(game => {
  gameList.appendChild(createGameButton(game.name, game.url));
});
