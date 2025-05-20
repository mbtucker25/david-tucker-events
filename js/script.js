// --- Constants ---
const SHIRT_PRICE = 15;
const teamWarning = document.getElementById('team-name-warning');
const teamNameInput = document.getElementById('team-name');

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

// --- Shirt Size ---
function getShirtSize(i) {
  return document.getElementById(`golfer${i}-shirt-size`)?.value || '';
}

// --- Get Golfer Info ---
function getGolfer(i) {
  const first = document.getElementById(`player${i}-first`)?.value.trim();
  const last = document.getElementById(`player${i}-last`)?.value.trim();
  const email = document.getElementById(`player${i}-email`)?.value.trim();
  const phone = document.getElementById(`player${i}-phone`)?.value.trim();
  const shirtSize = getShirtSize(i);

  if (first || last || email || phone || shirtSize) {
    return { first, last, email, phone, shirtSize };
  }

  return null;
}

// --- Check if Team Name Exists ---
async function checkTeamNameExists(name) {
  if (!name) {
    teamWarning.classList.remove('visible');
    return false;
  }

  try {
    const res = await fetch('https://bgarkbbnfdrvtjrtkiam.functions.supabase.co/get-teams');
    const teams = await res.json();
    const exists = teams.some(team => team.name.toLowerCase() === name.toLowerCase());
    teamWarning.classList.toggle('visible', exists);
    return exists;
  } catch (err) {
    console.error('Team name check failed:', err);
    teamWarning.classList.remove('visible');
    return false;
  }
}

// --- Handle Form Submit ---
function handleFormSubmit() {
  const form = document.getElementById('team-registration-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const teamName = teamNameInput?.value.trim();
    const teamExists = await checkTeamNameExists(teamName);

    if (!teamName || teamExists) {
      alert("Please enter a valid, unique team name.");
      return;
    }

    const captain = {
      first: document.getElementById('captain-first')?.value.trim(),
      last: document.getElementById('captain-last')?.value.trim(),
      email: document.getElementById('captain-email')?.value.trim(),
      phone: document.getElementById('captain-phone')?.value.trim(),
      shirtSize: document.getElementById('captain-shirt-size')?.value
    };

    const golfer2First = document.getElementById('player2-first')?.value.trim();
    const golfer2Last = document.getElementById('player2-last')?.value.trim();

    if (!captain.first || !captain.last || !captain.email || !captain.phone) {
      alert("Please complete all required Team Captain fields.");
      return;
    }

    if (!golfer2First && !golfer2Last) {
      alert("Team Captain & Golfer #2 are required to register a team.");
      return;
    }

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
      const golfer = getGolfer(i);
      if (golfer) golfers.push(golfer);
    }

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
      const formModal = document.getElementById('modal-register-team');
      const successOverlay = document.getElementById('success-overlay');
      const successMsg = document.getElementById('success-message-text');

      if (res.ok) {
        form.reset();
        formModal.setAttribute('hidden', true);

        const golferNamesHtml = golfers
          .filter(g => g?.first || g?.last)
          .map(g => `
            <li>
              <i class="fa-solid fa-golf-ball-tee icon-spacing"></i> 
              ${g.first || ''} ${g.last || ''}
            </li>
          `)
          .join('');

        successMsg.innerHTML = `
          <h2><i class="fa-solid fa-circle-check icon-spacing"></i> "${teamName}" has been successfully registered!</h2>
          <p><strong>Registered Golfers:</strong></p>
          <ul class="success-golfer-list">${golferNamesHtml}</ul>
        `;

        successOverlay.removeAttribute('hidden');
      }
   else {
        if (messageBox) {
          messageBox.innerText = `❌ ${json.error || 'Something went wrong'}`;
          messageBox.className = 'form-message error';
          messageBox.removeAttribute('hidden');
        }
      }
    } catch (err) {
      console.error(err);
      const messageBox = document.getElementById('form-message');
      if (messageBox) {
        messageBox.innerText = `❌ Submission failed. Please try again later.`;
        messageBox.className = 'form-message error';
        messageBox.removeAttribute('hidden');
      }
    }
  });
}

// --- Debounce Utility ---
function debounce(func, delay = 500) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  generateGolferFieldsets();
  formatPhoneInput();
  populateTeamDropdown();
  handleFormSubmit();

  teamNameInput?.addEventListener('input', debounce(e => {
    const entered = e.target.value.trim();
    checkTeamNameExists(entered);
  }, 500));

  document.getElementById('success-ok-btn')?.addEventListener('click', () => {
    document.getElementById('success-overlay')?.setAttribute('hidden', true);
  });

  // Modal Open
  document.querySelectorAll('.cta-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.modal;
      const modal = document.getElementById(modalId);
      if (modal) modal.removeAttribute('hidden');
    });
  });

  // Modal Close
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-overlay')?.setAttribute('hidden', true);
    });
  });

  // Click outside modal to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.setAttribute('hidden', true);
    });
  });
  
  document.getElementById('test-success')?.addEventListener('click', () => {
  const dummyTeam = "Shady Pines Golden Golfers";
  const dummyGolfers = [
    { first: "Luke", last: "Skywalker" },
    { first: "Leia", last: "Organa" },
    { first: "Han", last: "Solo" },
    { first: "Chewbacca", last: "" }
  ];

        const golferNamesHtml = dummyGolfers
          .filter(g => g?.first || g?.last)
          .map(g => `
            <li><i class="fa-solid fa-golf-ball-tee icon-spacing"></i> ${g.first || ''} ${g.last || ''}</li>
          `)
          .join('');

  const successMsg = document.getElementById('success-message-text');
  const successOverlay = document.getElementById('success-overlay');

  successMsg.innerHTML = `
    <div class="success-icon-wrapper">
      <i class="fa-solid fa-circle-check success-check-icon"></i>
    </div>
    <h2>You have successfully registered:</h2>
    <div class="success-message-text team-name">${dummyTeam}</div>
    <p class="golfers-label"><strong>Registered Golfers:</strong></p>
    <ul class="success-golfer-list">${golferNamesHtml}</ul>
  `;

  successOverlay?.removeAttribute('hidden');
});

});