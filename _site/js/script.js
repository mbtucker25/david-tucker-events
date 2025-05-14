// --- Shared Constants ---
const SHIRT_PRICE = 15;
const SIZE_IDS = ['yxs', 'ys', 'ym', 'yl', 'as', 'am', 'al', 'axl', 'a2xl'];

// --- Sidebar ---
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebar?.classList.toggle('open');
}

// --- Phone Format ---
function formatPhoneInput() {
  const phoneInput = document.getElementById('phone');
  phoneInput?.addEventListener('input', e => {
    let input = e.target.value.replace(/\D/g, '').slice(0, 10);
    let formatted = input;
    if (input.length >= 6) formatted = `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6)}`;
    else if (input.length >= 3) formatted = `(${input.slice(0, 3)}) ${input.slice(3)}`;
    e.target.value = formatted;
  });
}

// --- Enable Fieldset ---
function setFieldsetEnabled(fieldset, enabled) {
  fieldset.querySelectorAll('input, select').forEach(input => {
    const isTshirtQty = input.closest('.golfer-tshirt-sizes');
    const checkbox = fieldset.querySelector('input[type="checkbox"][id*="order-tshirt"]');
    input.disabled = isTshirtQty ? !(checkbox?.checked) : !enabled;
  });
  fieldset.classList.toggle('fieldset-disabled', !enabled);
}

// --- Populate Teams ---
function populateTeamDropdown(callback) {
  fetch('https://script.google.com/macros/s/AKfycbxCasBkzP72rmrzVQdiO2TN08D_5v11m4lfJ8qUfsUwk0TtuYfhVGA30_EG_dSTRbHZrg/exec')
    .then(res => res.json())
    .then(teams => {
      const select = document.getElementById('team-select');
      if (!select) return;
      select.innerHTML = `
        <option value="" disabled selected>-- Please select or create a team --</option>
        <option value="__free_agent__">*️⃣ Free Agent (assign me to a Team)</option>
        ${teams.map(t => `<option value="${t.teamName}">${t.teamName}</option>`).join('')}
        <option value="__new__">🆕 Create New Team</option>
      `;
      select.dataset.teams = JSON.stringify(teams);
      if (typeof callback === 'function') callback(teams);
    });
}

// --- Handle Team Selection ---
function handleTeamSelection() {
  const select = document.getElementById('team-select');
  const newTeamRow = document.getElementById('new-team-name-row');
  const golferFieldsets = document.querySelectorAll('.golfer-fieldset');

  if (!select) return;

  function resetFieldsets() {
    golferFieldsets.forEach(fs => {
      fs.querySelectorAll('input').forEach(input => {
        input.value = '';
        input.disabled = true;
      });
      fs.classList.add('fieldset-disabled');
    });
  }

  resetFieldsets();

  select.addEventListener('change', function () {
    const teams = JSON.parse(select.dataset.teams || '[]');
    newTeamRow.style.display = this.value === '__new__' ? 'block' : 'none';
    resetFieldsets();

    if (this.value === '__free_agent__') return setFieldsetEnabled(golferFieldsets[0], true);
    if (this.value === '__new__') return golferFieldsets.forEach(fs => setFieldsetEnabled(fs, true));

    const team = teams.find(t => t.teamName === this.value);
    if (team) {
      team.roster.forEach((m, i) => {
        const fs = golferFieldsets[i];
        if (!fs) return;
        fs.querySelector('input[name$="first"]').value = m.firstName || '';
        fs.querySelector('input[name$="last"]').value = m.lastName || '';
        fs.querySelector('input[type="email"]').value = m.email || '';
        fs.querySelector('input[type="tel"]').value = m.phone || '';
        fs.querySelectorAll('input').forEach(input => input.disabled = true);
        fs.classList.add('fieldset-disabled');
      });
      for (let i = team.roster.length; i < golferFieldsets.length; i++) setFieldsetEnabled(golferFieldsets[i], true);
    }
  });
}

// --- Per-Golfer Shirt Logic ---
function gatherGolferShirtOrderData(gNum) {
  const order = SIZE_IDS.reduce((acc, id) => {
    const input = document.getElementById(`golfer${gNum}-tshirt-${id}`);
    const qty = input ? parseInt(input.value, 10) || 0 : 0;
    acc[id] = qty;
    return acc;
  }, {});

  const totalQty = Object.values(order).reduce((s, q) => s + q, 0);
  const totalAmt = totalQty * SHIRT_PRICE;

  return { ...order, total: totalQty, amount: totalAmt };
}

function setupShirtSummaryLiveUpdate(gNum) {
  const container = document.querySelector(`#golfer${gNum} .golfer-tshirt-sizes`);
  if (!container) return;

  const inputs = SIZE_IDS.map(id => container.querySelector(`#golfer${gNum}-tshirt-${id}`)).filter(Boolean);
  const countDisplay = document.getElementById(`golfer${gNum}-shirt-count`);
  const totalDisplay = document.getElementById(`golfer${gNum}-shirt-total`);

  function updateSummary() {
    const totalQty = inputs.reduce((s, input) => s + (parseInt(input.value, 10) || 0), 0);
    const totalAmt = totalQty * SHIRT_PRICE;
    countDisplay.textContent = totalQty;
    totalDisplay.textContent = `$${totalAmt.toFixed(2)}`;
  }

  inputs.forEach(input => input.addEventListener('input', updateSummary));
  updateSummary();
}

function setupPerGolferShirtOrder(gNum) {
  const checkbox = document.getElementById(`golfer${gNum}-order-tshirt`);
  const fieldset = document.getElementById(`golfer${gNum}`);
  const sizesDiv = fieldset?.querySelector('.golfer-tshirt-sizes');
  const sizeInputs = sizesDiv?.querySelectorAll('input[type="number"]') || [];

  if (!checkbox || !sizesDiv) return;

  checkbox.addEventListener('change', function () {
    const isChecked = this.checked;
    sizeInputs.forEach(input => {
      input.value = 0;
      input.disabled = !isChecked;
      input.dispatchEvent(new Event('input'));
    });
  });

  sizeInputs.forEach(input => {
    input.value = 0;
    input.disabled = true;
  });
}

// --- Form Submission ---
function handleFormSubmission() {
  const form = document.getElementById('registration-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = {
      teamSelect: document.getElementById('team-select').value,
      newTeamName: document.getElementById('new-team-name')?.value,
      golfer1: getGolferData(1),
      golfer2: getGolferData(2),
      golfer3: getGolferData(3),
      golfer4: getGolferData(4)
    };

    fetch('https://script.google.com/macros/s/AKfycbxCasBkzP72rmrzVQdiO2TN08D_5v11m4lfJ8qUfsUwk0TtuYfhVGA30_EG_dSTRbHZrg/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(() => {
        form.style.display = 'none';
        document.getElementById('success-message').hidden = false;
      })
      .catch(() => alert('There was an error submitting your registration.'));
  });
}

function getGolferData(num) {
  const prefix = num === 1 ? 'player1-' : `player${num}-`;
  return {
    firstName: document.getElementById(`${prefix}first`)?.value || '',
    lastName: document.getElementById(`${prefix}last`)?.value || '',
    email: document.getElementById(`${prefix}email`)?.value || '',
    phone: document.getElementById(`${prefix}phone`)?.value || '',
    shirtOrder: gatherGolferShirtOrderData(num)
  };
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  toggleSidebar();
  formatPhoneInput();
  populateTeamDropdown(handleTeamSelection);
  document.querySelectorAll('.golfer-fieldset').forEach(fs => {
    fs.querySelectorAll('input').forEach(i => i.disabled = true);
    fs.classList.add('fieldset-disabled');
  });
  handleFormSubmission();
  [1, 2, 3, 4].forEach(n => {
    setupPerGolferShirtOrder(n);
    setupShirtSummaryLiveUpdate(n);
  });
});