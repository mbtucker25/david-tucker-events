// --- Constants ---
const SHIRT_PRICE = 15;

// --- Phone Formatter ---
function formatPhoneInput() {
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', e => {
      let val = e.target.value.replace(/\D/g, '').slice(0, 10);
      if (val.length >= 6) {
        e.target.value = `(${val.slice(0, 3)}) ${val.slice(3, 6)}-${val.slice(6)}`;
      } else if (val.length >= 3) {
        e.target.value = `(${val.slice(0, 3)}) ${val.slice(3)}`;
      } else {
        e.target.value = val;
      }
    });
  });
}

// --- Populate Team Dropdown ---
function populateTeamDropdown() {
  fetch('https://bgarkbbnfdrvtjrtkiam.functions.supabase.co/get-teams')
    .then(res => res.json())
    .then(teams => {
      const select = document.getElementById('team-select');
      if (!select) return;
      select.dataset.teams = JSON.stringify(teams);
    })
    .catch(err => console.error("Team fetch failed:", err));
}

// --- Generate Golfer Fieldsets (2–4) ---
function generateGolferFieldsets() {
  const container = document.getElementById('golfer-fieldsets');
  if (!container) return;

  const sizes = ['Small', 'Medium', 'Large', 'X-Large', 'XX-Large'];
  const options = sizes.map(s => `<option value="${s}">${s.toUpperCase()}</option>`).join('');
  container.innerHTML = '';

  for (let i = 2; i <= 4; i++) {
    container.innerHTML += `
      <div class="card neumorphic">
        <div class="section-heading-wrapper">
          <div class="section-heading">
            <div class="section-heading-main">
              <i class="fa-solid fa-address-card icon-spacing"></i>Golfer ${i}
            </div>
          </div>
        </div>
        <fieldset class="golfer-fieldset" id="golfer${i}">
          <div class="form-grid-two">
            <div class="form-field">
              <input type="text" id="player${i}-first" placeholder="First Name" />
            </div>
            <div class="form-field">
              <input type="text" id="player${i}-last" placeholder="Last Name" />
            </div>
          </div>
          <div class="form-grid-email-phone">
            <div class="form-field">
              <input type="email" id="player${i}-email" placeholder="Email" />
            </div>
            <div class="form-field">
              <input type="tel" id="player${i}-phone" placeholder="Phone #" />
            </div>
            <div class="form-field">
              <select id="golfer${i}-shirt-size">
                <option value="">-- T-Shirt Size --</option>
                ${options}
              </select>
            </div>
          </div>
        </fieldset>
      </div>
    `;
  }
}

// --- Gather Shirt Size Info ---
function getShirtSize(i) {
  return document.getElementById(`golfer${i}-shirt-size`)?.value || '';
}

// --- Inline Team Name Validation ---
function validateTeamName() {
  const input = document.getElementById('team-name');
  const warning = document.getElementById('team-name-warning');
  const teams = JSON.parse(document.getElementById('team-select')?.dataset.teams || '[]');
  const entered = input?.value.trim().toLowerCase();

  const exists = teams.some(t => t.name.toLowerCase() === entered);
  if (exists) {
    warning.style.display = 'inline';
    return false;
  } else {
    warning.style.display = 'none';
    return true;
  }
}

// --- Handle Form Submit ---
function handleFormSubmit() {
  const form = document.getElementById('team-registration-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Validate team name
    const validTeam = validateTeamName();
    const teamName = document.getElementById('team-name')?.value.trim();

    const captain = {
      first: document.getElementById('captain-first')?.value.trim(),
      last: document.getElementById('captain-last')?.value.trim(),
      email: document.getElementById('captain-email')?.value.trim(),
      phone: document.getElementById('captain-phone')?.value.trim(),
      shirtSize: document.getElementById('captain-shirt-size')?.value
    };

    const golfer2First = document.getElementById('player2-first')?.value.trim();
    const golfer2Last = document.getElementById('player2-last')?.value.trim();

    // Basic validation
    if (!teamName || !validTeam) {
      alert("Please enter a valid, unique team name.");
      return;
    }
    if (!captain.first || !captain.last || !captain.email || !captain.phone) {
      alert("Please complete all required Team Captain fields.");
      return;
    }
    if (!golfer2First && !golfer2Last) {
      alert("Golfer #2 is required.");
      return;
    }

    // Collect golfers (including captain as Golfer #1)
    const golfers = [
      {
        first: captain.first,
        last: captain.last,
        email: captain.email,
        phone: captain.phone,
        shirtSize: captain.shirtSize
      }
    ];

    for (let i = 2; i <= 4; i++) {
      const first = document.getElementById(`player${i}-first`)?.value.trim();
      const last = document.getElementById(`player${i}-last`)?.value.trim();
      const email = document.getElementById(`player${i}-email`)?.value.trim();
      const phone = document.getElementById(`player${i}-phone`)?.value.trim();
      const shirtSize = getShirtSize(i);

      if (first || last || email || phone || shirtSize) {
        golfers.push({ first, last, email, phone, shirtSize });
      }
    }

    // ✅ Submit to Supabase
    try {
      const res = await fetch('https://bgarkbbnfdrvtjrtkiam.supabase.co/functions/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newTeamName: teamName,
          golfer1: golfers[0],
          golfer2: golfers[1],
          golfer3: golfers[2],
          golfer4: golfers[3]
        })
      });
    const json = await res.json();
    const messageBox = document.getElementById('form-message');

    if (messageBox) {
      if (res.ok) {
        messageBox.innerText = `✅ Successfully registered ${json.golfers} golfer(s)!`;
        messageBox.className = 'form-message success';
        form.reset();
      } else {
        messageBox.innerText = `❌ ${json.error || 'Something went wrong'}`;
        messageBox.className = 'form-message error';
      }

      messageBox.removeAttribute('hidden');
      setTimeout(() => {
        messageBox.setAttribute('hidden', true);
      }, 6000);
    }
    } catch (err) {
      console.error(err);
      const messageBox = document.getElementById('form-message');
      if (messageBox) {
        messageBox.innerText = `❌ Submission failed. Please try again later.`;
        messageBox.className = 'form-message error';
        messageBox.removeAttribute('hidden');
        setTimeout(() => {
          messageBox.setAttribute('hidden', true);
        }, 6000);
      }
    }
  });
}
// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  generateGolferFieldsets();
  formatPhoneInput();
  populateTeamDropdown();
  handleFormSubmit();

  document.getElementById('team-name')?.addEventListener('input', validateTeamName);

  // --- Modal Open (Register Button) ---
document.querySelectorAll('.cta-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const modalId = btn.dataset.modal;
    const modal = document.getElementById(modalId);
    if (modal) modal.removeAttribute('hidden');
  });
});

// --- Modal Close Button ---
document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.modal-overlay')?.setAttribute('hidden', true);
  });
});

// --- Modal Background Click to Close ---
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.setAttribute('hidden', true);
  });
});

});


