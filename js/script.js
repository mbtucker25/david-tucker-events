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
    const nameLabel = document.createElement("label");
    nameLabel.setAttribute("for", `player${i}_name`);
    nameLabel.textContent = `Player ${i} Name`;

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = `player${i}_name`;
    nameInput.name = `player${i}_name`;
    nameInput.required = true;

    const emailLabel = document.createElement("label");
    emailLabel.setAttribute("for", `player${i}_email`);
    emailLabel.textContent = `Player ${i} Email`;

    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.id = `player${i}_email`;
    emailInput.name = `player${i}_email`;
    emailInput.required = true;

    playerFields.appendChild(nameLabel);
    playerFields.appendChild(nameInput);
    playerFields.appendChild(emailLabel);
    playerFields.appendChild(emailInput);
  }
}

if (playerSelect) {
  playerSelect.addEventListener("change", updatePlayerFields);
  window.addEventListener("DOMContentLoaded", updatePlayerFields);
}