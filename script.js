console.log("David Tucker Memorial Site Loaded");
const toggleBtn = document.getElementById("darkModeToggle");
const body = document.body;

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark-mode");
}

// Toggle and save preference
toggleBtn.addEventListener("click", () => {
  body.classList.toggle("dark-mode");

  // Save to localStorage
  if (body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});