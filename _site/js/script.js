// Sidebar toggle functionality
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('open');
}

// Format phone number input
function formatPhoneInput() {
  const phoneInput = document.getElementById('phone');
  phoneInput?.addEventListener('input', (e) => {
    let input = e.target.value.replace(/\D/g, '').slice(0, 10);
    let formatted = input;
    if (input.length >= 6) {
      formatted = `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6)}`;
    } else if (input.length >= 3) {
      formatted = `(${input.slice(0, 3)}) ${input.slice(3)}`;
    }
    e.target.value = formatted;
  });
}

// Enable or disable a fieldset's inputs
function setFieldsetEnabled(fieldset, enabled) {
  fieldset.querySelectorAll('input, select').forEach(input => {
    input.disabled = !enabled;
  });
  fieldset.classList.toggle('fieldset-disabled', !enabled);
}

// Populate team dropdown from teams.json
function populateTeamDropdown(callback) {
  fetch('teams.json')
    .then(res => res.json())
    .then(teams => {
      const select = document.getElementById('team-select');
      if (!select) return;
      select.innerHTML = `
        <option value="" disabled selected>-- Please select or create a team --</option>
        <option value="__free_agent__">*️⃣ Free Agent (assign me to a Team)</option>
        ${teams.map(team => `<option value="${team.teamName}">${team.teamName}</option>`).join('')}
        <option value="__new__">🆕 Create New Team</option>
      `;
      select.dataset.teams = JSON.stringify(teams); // Store for later use
      if (typeof callback === "function") callback(teams);
    });
}

// Handle team selection logic
function handleTeamSelection() {
  const select = document.getElementById('team-select');
  const newTeamRow = document.getElementById('new-team-name-row');
  const golferFieldsets = document.querySelectorAll('.golfer-fieldset');

  if (!select) return;

  // Helper to clear and disable all fieldsets
  function resetFieldsets() {
    golferFieldsets.forEach((fs) => {
      fs.querySelectorAll('input').forEach(input => {
        input.value = '';
        input.disabled = true;
      });
      fs.classList.add('fieldset-disabled');
    });
  }

  // On page load, disable all fieldsets
  resetFieldsets();

  select.addEventListener('change', function() {
    const teams = JSON.parse(select.dataset.teams || '[]');
    // Hide/show new team name input
    newTeamRow.style.display = (this.value === '__new__') ? 'block' : 'none';

    resetFieldsets();

    // Free Agent: enable only Golfer #1
    if (this.value === '__free_agent__') {
      setFieldsetEnabled(golferFieldsets[0], true);
      return;
    }

    // Create New Team: enable all fieldsets
    if (this.value === '__new__') {
      golferFieldsets.forEach(fs => setFieldsetEnabled(fs, true));
      return;
    }

    // Existing Team: show roster, enable only empty slots
    const team = teams.find(t => t.teamName === this.value);
    if (team) {
      // Fill in roster (read-only)
      team.roster.forEach((member, idx) => {
        const fs = golferFieldsets[idx];
        if (!fs) return;
        const first = fs.querySelector('input[name$="first"]');
        const last = fs.querySelector('input[name$="last"]');
        const email = fs.querySelector('input[type="email"]');
        const phone = fs.querySelector('input[type="tel"]');
        if (first) first.value = member.firstName || '';
        if (last) last.value = member.lastName || '';
        if (email) email.value = member.email || '';
        if (phone) phone.value = member.phone || '';
        fs.querySelectorAll('input').forEach(input => input.disabled = true);
        fs.classList.add('fieldset-disabled');
      });
      // Enable remaining slots
      for (let i = team.roster.length; i < golferFieldsets.length; i++) {
        setFieldsetEnabled(golferFieldsets[i], true);
      }
    }
  });
}

// --- Per-Golfer T-Shirt Order Section Logic ---
function setupShirtSummaryLiveUpdate(golferNum) {
  const PRICE_PER_SHIRT = 15;

  const container = document.querySelector(`#golfer${golferNum} .golfer-tshirt-sizes`);
  if (!container) return;

  const inputIDs = [
    'yxs', 'ys', 'ym', 'yl',
    'as', 'am', 'al', 'axl', 'a2xl'
  ];

  const inputs = inputIDs.map(id =>
    container.querySelector(`#golfer${golferNum}-tshirt-${id}`)
  ).filter(Boolean);

  const countDisplay = document.getElementById(`golfer${golferNum}-shirt-count`);
  const totalDisplay = document.getElementById(`golfer${golferNum}-shirt-total`);

  function updateSummary() {
    let totalQty = 0;

    inputs.forEach(input => {
      const qty = parseInt(input.value, 10);
      if (!isNaN(qty)) totalQty += qty;
    });

    const totalAmt = totalQty * PRICE_PER_SHIRT;

    if (countDisplay) countDisplay.textContent = totalQty;
    if (totalDisplay) totalDisplay.textContent = `$${totalAmt.toFixed(2)}`;
  }

  inputs.forEach(input => {
    input.addEventListener('input', updateSummary);
  });

  updateSummary(); // init
}

function setupPerGolferShirtOrder(golferNum) {
  const checkbox = document.getElementById(`golfer${golferNum}-order-tshirt`);
  const fieldset = document.getElementById(`golfer${golferNum}`);
  const sizesDiv = fieldset ? fieldset.querySelector('.golfer-tshirt-sizes') : null;
  const sizeInputs = sizesDiv ? sizesDiv.querySelectorAll('input[type="number"]') : [];

  if (!checkbox || !sizesDiv) return;

  checkbox.addEventListener('change', function () {
    if (this.checked) {
      sizesDiv.classList.remove('hidden');
      sizeInputs.forEach(input => {
        input.disabled = false;
        input.value = 0;
      });
    } else {
      sizeInputs.forEach(input => {
        input.value = 0;
        input.disabled = true;
      });
      sizesDiv.classList.add('hidden');
    }

    // 🔁 Trigger summary logic if needed
    sizeInputs.forEach(input => input.dispatchEvent(new Event('input')));
  });
}

// Gather shirt order data per golfer for submission
function gatherGolferShirtOrderData(golferNum) {
  const PRICE_PER_SHIRT = 15;
  const sizeIDs = ['yxs', 'ys', 'ym', 'yl', 'as', 'am', 'al', 'axl', 'a2xl'];

  const order = sizeIDs.reduce((acc, id) => {
    const input = document.getElementById(id);
    const qty = input ? parseInt(input.value, 10) || 0 : 0;
    acc[id] = qty;
    return acc;
  }, {});

  const totalQty = Object.values(order).reduce((sum, qty) => sum + qty, 0);
  const totalAmt = totalQty * PRICE_PER_SHIRT;

  return {
    ...order,
    total: totalQty,
    amount: totalAmt
  };
}


// --- End Per-Golfer T-Shirt Section Logic ---

function handleFormSubmission() {
  const form = document.getElementById('registration-form');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Gather form data
    const data = {
      teamSelect: document.getElementById('team-select').value,
      newTeamName: document.getElementById('new-team-name')?.value,
      golfer1: {
        firstName: document.getElementById('first-name').value,
        lastName: document.getElementById('last-name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        shirtOrder: gatherGolferShirtOrderData(1)
      },
      golfer2: {
        firstName: document.getElementById('player2-first').value,
        lastName: document.getElementById('player2-last').value,
        email: document.getElementById('player2-email').value,
        phone: document.getElementById('player2-phone').value,
        shirtOrder: gatherGolferShirtOrderData(2)
      },
      golfer3: {
        firstName: document.getElementById('player3-first').value,
        lastName: document.getElementById('player3-last').value,
        email: document.getElementById('player3-email').value,
        phone: document.getElementById('player3-phone').value,
        shirtOrder: gatherGolferShirtOrderData(3)
      },
      golfer4: {
        firstName: document.getElementById('player4-first').value,
        lastName: document.getElementById('player4-last').value,
        email: document.getElementById('player4-email').value,
        phone: document.getElementById('player4-phone').value,
        shirtOrder: gatherGolferShirtOrderData(4)
      }
      // Additional fields can be added here
    };

    fetch('https://script.google.com/macros/s/AKfycbwuzT9r2dUjdQFt3TdpfEx4-ORqDJt9twKlJNnLwcF3hVaC6XF32Wb7VsLrxsRmyTWgbw/exec', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(response => {
      form.style.display = 'none';
      const successMsg = document.getElementById('success-message');
      if (successMsg) successMsg.hidden = false;
    })
    .catch(err => {
      alert('There was an error submitting your registration.');
    });
  });
}

// Main initialization function
function initialize() {
  // Sidebar toggle
  window.toggleSidebar = toggleSidebar;

  // Phone formatting
  formatPhoneInput();

  // Team dropdown and selection logic
  populateTeamDropdown(() => {
    handleTeamSelection();
  });

  // Disable all fieldsets on page load (before any selection)
  document.querySelectorAll('.golfer-fieldset').forEach(fs => {
    fs.querySelectorAll('input').forEach(input => input.disabled = true);
    fs.classList.add('fieldset-disabled');
  });

  handleFormSubmission();

  // Setup per-golfer t-shirt order logic
  [1, 2, 3, 4].forEach(setupPerGolferShirtOrder);
  // Setup shirt summary live update
  [1, 2, 3, 4].forEach(setupShirtSummaryLiveUpdate);

}

// Run the initialization function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initialize);