document.addEventListener('DOMContentLoaded', () => {
  // --- TAB SWITCHING ---
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  function setActiveTab(tabId) {
    tabContents.forEach(tc => {
      if (tc.id === tabId) {
        tc.classList.add('active');
        tc.style.opacity = 0;
        // Animate fade in
        setTimeout(() => {
          tc.style.opacity = 1;
        }, 10);
      } else {
        tc.style.opacity = 0;
        setTimeout(() => tc.classList.remove('active'), 300);
      }
    });
    tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
    localStorage.setItem('activeTab', tabId);
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveTab(btn.dataset.tab);
    });
  });

  // Load last active tab or default to home
  setActiveTab(localStorage.getItem('activeTab') || 'home');


  // --- THEME & ACCENT COLOR ---
  const accentColorPicker = document.getElementById('accent-color-picker');
  const root = document.documentElement;

  // Load saved accent color or default
  let savedAccent = localStorage.getItem('accentColor') || '#4caf50';
  root.style.setProperty('--accent-color', savedAccent);
  if (accentColorPicker) accentColorPicker.value = savedAccent;

  if (accentColorPicker) {
    accentColorPicker.addEventListener('input', (e) => {
      const color = e.target.value;
      root.style.setProperty('--accent-color', color);
      localStorage.setItem('accentColor', color);
    });
  }


  // --- GAME LIST & STORAGE ---
  const gameList = document.getElementById('game-list');
  const addGameName = document.getElementById('add-game-name');
  const addGameURL = document.getElementById('add-game-url');
  const addGameImage = document.getElementById('add-game-image');
  const addGameBtn = document.getElementById('add-game-btn');

  // Default games with images
  const defaultGames = [
    {
      name: 'Game 1',
      url: 'https://example.com/game1',
      img: 'https://via.placeholder.com/64?text=G1',
    },
    {
      name: 'Game 2',
      url: 'https://example.com/game2',
      img: 'https://via.placeholder.com/64?text=G2',
    },
    {
      name: 'Game 3',
      url: 'https://example.com/game3',
      img: 'https://via.placeholder.com/64?text=G3',
    },
  ];

  // Load saved games from localStorage or default
  function loadGames() {
    const saved = localStorage.getItem('gameList');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [...defaultGames];
      }
    } else {
      return [...defaultGames];
    }
  }

  let games = loadGames();

  function saveGames() {
    localStorage.setItem('gameList', JSON.stringify(games));
  }

  // Create game button element with image, name, and remove button
  function createGameButton(game, index) {
    const btn = document.createElement('button');
    btn.className = 'game-btn';
    btn.draggable = true;
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.gap = '8px';
    btn.style.padding = '6px 10px';
    btn.style.minWidth = '80px';

    const img = document.createElement('img');
    img.src = game.img || 'https://via.placeholder.com/40?text=No+Img';
    img.alt = game.name;
    img.style.width = '40px';
    img.style.height = '40px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '6px';
    btn.appendChild(img);

    const span = document.createElement('span');
    span.textContent = game.name;
    span.style.flex = '1';
    span.style.textAlign = 'left';
    btn.appendChild(span);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✕';
    removeBtn.title = 'Remove Game';
    removeBtn.style.background = 'transparent';
    removeBtn.style.border = 'none';
    removeBtn.style.color = 'red';
    removeBtn.style.fontWeight = 'bold';
    removeBtn.style.cursor = 'pointer';
    removeBtn.style.marginLeft = '8px';
    removeBtn.style.padding = '0 6px';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      games.splice(index, 1);
      saveGames();
      renderGames();
    });
    btn.appendChild(removeBtn);

    // Clicking button navigates to game URL
    btn.addEventListener('click', () => {
      window.open(game.url, '_blank');
    });

    // Drag and Drop handlers
    btn.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', index);
      btn.style.opacity = '0.5';
    });
    btn.addEventListener('dragend', () => {
      btn.style.opacity = '1';
    });
    btn.addEventListener('dragover', (e) => {
      e.preventDefault();
      btn.style.border = '2px dashed var(--accent-color)';
    });
    btn.addEventListener('dragleave', () => {
      btn.style.border = 'none';
    });
    btn.addEventListener('drop', (e) => {
      e.preventDefault();
      const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
      const targetIndex = index;
      if (draggedIndex !== targetIndex) {
        const draggedGame = games[draggedIndex];
        games.splice(draggedIndex, 1);
        games.splice(targetIndex, 0, draggedGame);
        saveGames();
        renderGames();
      }
      btn.style.border = 'none';
    });

    return btn;
  }

  // Render all games
  function renderGames() {
    gameList.innerHTML = '';
    games.forEach((game, idx) => {
      gameList.appendChild(createGameButton(game, idx));
    });
  }

  // Add new game from inputs
  if (addGameBtn) {
    addGameBtn.addEventListener('click', () => {
      const name = addGameName.value.trim();
      const url = addGameURL.value.trim();
      let img = addGameImage.value.trim();

      if (!name || !url) {
        alert('Please enter game name and URL.');
        return;
      }
      if (img === '') img = 'https://via.placeholder.com/64?text=No+Img';

      games.push({ name, url, img });
      saveGames();
      renderGames();

      addGameName.value = '';
      addGameURL.value = '';
      addGameImage.value = '';
    });
  }

  renderGames();


  // --- EXPORT & IMPORT ---
  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const importInput = document.getElementById('import-input');

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const data = {
        games,
        accentColor: localStorage.getItem('accentColor') || '#4caf50',
        activeTab: localStorage.getItem('activeTab') || 'home',
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'proton-settings.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());

    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const imported = JSON.parse(evt.target.result);
          if (imported.games && Array.isArray(imported.games)) {
            games = imported.games;
            saveGames();
            renderGames();
          }
          if (imported.accentColor) {
            localStorage.setItem('accentColor', imported.accentColor);
            root.style.setProperty('--accent-color', imported.accentColor);
            if (accentColorPicker) accentColorPicker.value = imported.accentColor;
          }
          if (imported.activeTab) {
            setActiveTab(imported.activeTab);
          }
          alert('Import successful!');
        } catch {
          alert('Invalid JSON file.');
        }
      };
      reader.readAsText(file);
    });
  }


  // --- RESET SETTINGS ---
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (!confirm('Are you sure you want to reset all settings?')) return;
      localStorage.removeItem('gameList');
      localStorage.removeItem('accentColor');
      localStorage.removeItem('activeTab');
      games = [...defaultGames];
      saveGames();
      renderGames();
      root.style.setProperty('--accent-color', '#4caf50');
      if (accentColorPicker) accentColorPicker.value = '#4caf50';
      setActiveTab('home');
    });
  }
});
