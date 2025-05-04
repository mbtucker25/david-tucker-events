// script.js
console.log("David Tucker Memorial Site Loaded");

const toggleBtn = document.getElementById("darkModeToggle");
const body = document.body;

// Apply saved theme on load
if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark-mode");
}

// Toggle theme
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    localStorage.setItem("theme", body.classList.contains("dark-mode") ? "dark" : "light");
  });
}

// Dynamic player name fields (register.html only)
const playerSelect = document.getElementById("players");
const playerFields = document.getElementById("playerFields");

function updatePlayerFields() {
  if (!playerFields || !playerSelect) return;

  const count = parseInt(playerSelect.value, 10);
  playerFields.innerHTML = "";

  for (let i = 1; i <= count; i++) {
    const label = document.createElement("label");
    label.setAttribute("for", `player${i}`);
    label.textContent = `Player ${i} Name`;

    const input = document.createElement("input");
    input.type = "text";
    input.id = `player${i}`;
    input.name = `player${i}`;
    input.required = true;

    playerFields.appendChild(label);
    playerFields.appendChild(input);
  }
}

if (playerSelect) {
  playerSelect.addEventListener("change", updatePlayerFields);
  window.addEventListener("DOMContentLoaded", updatePlayerFields);
}