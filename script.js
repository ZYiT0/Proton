// Elements
const tabs = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

const gameListEl = document.getElementById("game-list");
const addGameNameInput = document.getElementById("add-game-name");
const addGameUrlInput = document.getElementById("add-game-url");
const addGameImageInput = document.getElementById("add-game-image");
const addGameBtn = document.getElementById("add-game-btn");

const accentColorPicker = document.getElementById("accent-color-picker");
const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importInput = document.getElementById("import-input");
const resetBtn = document.getElementById("reset-btn");

const loaderUrlInput = document.getElementById("loader-url-input");
const loaderLoadBtn = document.getElementById("loader-load-btn");
const loaderFullscreenBtn = document.getElementById("loader-fullscreen-btn");
const loaderIframe = document.getElementById("loader-iframe");

let games = [];

// --- TAB SWITCHING ---
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    // Remove active from all
    tabs.forEach(t => t.classList.remove("active"));
    tabContents.forEach(tc => tc.classList.remove("active"));

    // Add active to clicked tab and corresponding content
    tab.classList.add("active");
    const tabName = tab.dataset.tab;
    document.getElementById(tabName).classList.add("active");

    // Save last active tab
    localStorage.setItem("proton-last-tab", tabName);
  });
});

// Load last active tab on page load
window.addEventListener("DOMContentLoaded", () => {
  const lastTab = localStorage.getItem("proton-last-tab");
  if (lastTab) {
    tabs.forEach(t => t.classList.remove("active"));
    tabContents.forEach(tc => tc.classList.remove("active"));
    const tabBtn = [...tabs].find(t => t.dataset.tab === lastTab);
    if (tabBtn) tabBtn.classList.add("active");
    const tabContent = document.getElementById(lastTab);
    if (tabContent) tabContent.classList.add("active");
  }

  loadAccentColor();
  loadGames();
});

// --- ACCENT COLOR ---

function updateAccentColor(color) {
  document.documentElement.style.setProperty("--accent-color", color);
  document.documentElement.style.setProperty("--btn-hover-bg", color);
  // Save to localStorage
  localStorage.setItem("proton-accent-color", color);
}

accentColorPicker.addEventListener("input", e => {
  updateAccentColor(e.target.value);
});

// Load accent color from localStorage
function loadAccentColor() {
  const savedColor = localStorage.getItem("proton-accent-color");
  if (savedColor) {
    accentColorPicker.value = savedColor;
    updateAccentColor(savedColor);
  } else {
    accentColorPicker.value = getComputedStyle(document.documentElement).getPropertyValue("--accent-color").trim();
  }
}

// --- GAMES LIST ---

function renderGames() {
  gameListEl.innerHTML = "";
  games.forEach((game, index) => {
    const btn = document.createElement("button");
    btn.className = "game-btn";
    btn.title = game.name;

    // Game image (optional)
    if (game.image && game.image.trim() !== "") {
      const img = document.createElement("img");
      img.src = game.image;
      img.alt = game.name;
      btn.appendChild(img);
    }

    // Game name span
    const span = document.createElement("span");
    span.textContent = game.name;
    btn.appendChild(span);

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.title = "Remove game";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeGame(index);
    });
    btn.appendChild(removeBtn);

    // On click open game URL in new tab
    btn.addEventListener("click", () => {
      if (game.url && game.url.trim() !== "") {
        window.open(game.url, "_blank");
      }
    });

    gameListEl.appendChild(btn);
  });
}

function addGame() {
  const name = addGameNameInput.value.trim();
  const url = addGameUrlInput.value.trim();
  const image = addGameImageInput.value.trim();

  if (!name || !url) {
    alert("Please enter both game name and URL.");
    return;
  }

  games.push({ name, url, image });
  saveGames();
  renderGames();

  addGameNameInput.value = "";
  addGameUrlInput.value = "";
  addGameImageInput.value = "";
}

function removeGame(index) {
  games.splice(index, 1);
  saveGames();
  renderGames();
}

function saveGames() {
  localStorage.setItem("proton-games", JSON.stringify(games));
}

function loadGames() {
  const saved = localStorage.getItem("proton-games");
  if (saved) {
    try {
      games = JSON.parse(saved);
    } catch {
      games = [];
    }
  }
  renderGames();
}

addGameBtn.addEventListener("click", addGame);

// --- SETTINGS EXPORT/IMPORT/RESET ---

exportBtn.addEventListener("click", () => {
  const settings = {
    accentColor: localStorage.getItem("proton-accent-color") || "",
    games,
  };
  const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "proton-settings.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

importBtn.addEventListener("click", () => {
  importInput.click();
});

importInput.addEventListener("change", () => {
  const file = importInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.accentColor) {
        accentColorPicker.value = data.accentColor;
        updateAccentColor(data.accentColor);
      }
      if (Array.isArray(data.games)) {
        games = data.games;
        saveGames();
        renderGames();
      }
      alert("Settings imported successfully!");
    } catch {
      alert("Invalid settings file.");
    }
  };
  reader.readAsText(file);
  importInput.value = "";
});

resetBtn.addEventListener("click", () => {
  if (!confirm("Are you sure you want to reset all settings?")) return;

  // Reset accent color to default
  accentColorPicker.value = "#4caf50";
  updateAccentColor("#4caf50");

  // Clear games list
  games = [];
  saveGames();
  renderGames();

  // Remove stored last tab
  localStorage.removeItem("proton-last-tab");

  alert("Settings reset.");
});

// --- LOADER TAB ---

loaderLoadBtn.addEventListener("click", () => {
  const url = loaderUrlInput.value.trim();
  if (!url) {
    alert("Please enter a URL to load.");
    return;
  }
  loaderIframe.src = url;
});

loaderFullscreenBtn.addEventListener("click", () => {
  if (!loaderIframe.src) {
    alert("Please load a URL first.");
    return;
  }

  if (!document.fullscreenElement) {
    loaderIframe.requestFullscreen().catch(() => {
      alert("Fullscreen not supported or denied.");
    });
  } else {
    document.exitFullscreen();
  }
});
