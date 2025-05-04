console.log("🎯 David Tucker Memorial Golf Site JS Loaded");

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const toggleBtn = document.getElementById("darkModeToggle");

  // 🌗 DARK MODE: Persist via Local Storage
  const theme = localStorage.getItem("theme");
  if (theme === "dark") body.classList.add("dark-mode");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      body.classList.toggle("dark-mode");
      localStorage.setItem("theme", body.classList.contains("dark-mode") ? "dark" : "light");
    });
  }

  // 🧑‍🤝‍🧑 REGISTER PAGE: Add Player Fields Dynamically
  const playerSelect = document.getElementById("players");
  const playerFields = document.getElementById("playerFields");

  if (playerSelect && playerFields) {
    const updatePlayerFields = () => {
      const count = parseInt(playerSelect.value);
      playerFields.innerHTML = "";

      for (let i = 1; i <= count; i++) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("player-input");

        const label = document.createElement("label");
        label.setAttribute("for", `player${i}`);
        label.textContent = `Player ${i} Name`;

        const input = document.createElement("input");
        input.type = "text";
        input.id = `player${i}`;
        input.name = `player${i}`;
        input.required = true;

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        playerFields.appendChild(wrapper);
      }
    };

    updatePlayerFields(); // Initial call
    playerSelect.addEventListener("change", updatePlayerFields);
  }
});