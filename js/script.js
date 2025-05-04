console.log("David Tucker Memorial Site Loaded");

const toggleBtn = document.getElementById("darkModeToggle");
const body = document.body;

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark-mode");
}

// Toggle and save preference
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    localStorage.setItem("theme", body.classList.contains("dark-mode") ? "dark" : "light");
  });
}

// Dynamic Player Fields (on register page)
const playerSelect = document.getElementById("players");
const playerFields = document.getElementById("playerFields");

function updatePlayerFields() {
  if (!playerFields) return;

  const count = parseInt(playerSelect.value);
  playerFields.innerHTML = "";

  for (let i = 1; i <= count; i++) {
    const label = document.createElement("label");
    label.textContent = `Player ${i} Name`;
    label.setAttribute("for", `player${i}`);

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
