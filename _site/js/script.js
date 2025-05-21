// ─── Constants ───────────────────────────────────────────────
const SHIRT_PRICE = 15;

// ─── Utilities ────────────────────────────────────────────────

/**
 * Debounce utility to limit the rate of function execution.
 */
function debounce(func, delay = 500) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Formats phone inputs live into (XXX) XXX-XXXX format.
 */
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

/**
 * Dynamically populates team dropdown for single golfers.
 * "__free_agent__" will appear as "No Team (Free Agent)".
 */
// --- Populate Team Dropdown for Single Golfer ---
async function populateTeamDropdown() {
  const select = document.getElementById('golfer-team');
  if (!select) return;

  // Clear the select menu
  select.innerHTML = '';

  // Always include __free_agent__ first
  const freeAgentOption = document.createElement('option');
  freeAgentOption.value = '__free_agent__';
  freeAgentOption.textContent = 'No Team (Free Agent)';
  select.appendChild(freeAgentOption);

  try {
    const teamRes = await fetch('https://bgarkbbnfdrvtjrtkiam.functions.supabase.co/get-teams');
    const teams = await teamRes.json();

    for (const team of teams) {
      if (team.name === '__free_agent__') continue;

      const statusRes = await fetch(`https://bgarkbbnfdrvtjrtkiam.functions.supabase.co/get-team-status?team=${encodeURIComponent(team.name)}`, {
        headers: {
          'Authorization': `Bearer YOUR_PUBLIC_SUPABASE_ANON_KEY` // Optional if RLS allows public
        }
      });

      if (!statusRes.ok) {
        console.warn(`Status check failed for ${team.name}`);
        continue;
      }

      const status = await statusRes.json();

      if (!status.isFull) {
        const option = document.createElement('option');
        option.value = team.name;
        option.textContent = team.name;
        select.appendChild(option);
      }
    }
  } catch (err) {
    console.error('Error populating team dropdown:', err);
  }
}


/**
 * Checks if a team name already exists in the database.
 */
async function checkTeamNameExists(name) {
  const teamWarning = document.getElementById('team-name-warning');
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

/**
 * Retrieves individual golfer data from form inputs.
 */
function getGolfer(i) {
  const first = document.getElementById(`player${i}-first`)?.value.trim();
  const last = document.getElementById(`player${i}-last`)?.value.trim();
  const email = document.getElementById(`player${i}-email`)?.value.trim();
  const phone = document.getElementById(`player${i}-phone`)?.value.trim();
  const shirtSize = document.getElementById(`golfer${i}-shirt-size`)?.value || '';

  if (first || last || email || phone || shirtSize) {
    return { first, last, email, phone, shirtSize };
  }

  return null;
}

/**
 * Dynamically builds golfer fieldsets for golfers 2–4.
 */
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
        <div class="golfer-fieldsets" id="golfer${i}">
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
        </div>
      </div>
    `;
  }
}

// ─── Form Handlers ────────────────────────────────────────────

/**
 * Handles submission of the team registration form.
 */
function handleFormSubmit() {
  const form = document.getElementById('team-registration-form');
  const teamNameInput = document.getElementById('team-name');
  const teamWarning = document.getElementById('team-name-warning');

  if (!form || !teamNameInput) return;

  teamNameInput.addEventListener('input', debounce(e => {
    const entered = e.target.value.trim();
    checkTeamNameExists(entered);
  }, 500));

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const teamName = teamNameInput.value.trim();
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

    if (!captain.first || !captain.last || !captain.email || !captain.phone) {
      alert("Please complete all required Team Captain fields.");
      return;
    }

    const golfer2First = document.getElementById('player2-first')?.value.trim();
    const golfer2Last = document.getElementById('player2-last')?.value.trim();

    if (!golfer2First && !golfer2Last) {
      alert("Team Captain & Golfer #2 are required to register a team.");
      return;
    }

    const golfers = [captain];
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
            <li><i class="fa-solid fa-golf-ball-tee success-message-icons"></i> ${g.first || ''} ${g.last || ''}</li>
          `).join('');

        successMsg.innerHTML = `
          <div class="success-icon-wrapper">
            <i class="fa-solid fa-circle-check success-check-icon"></i>
          </div>
          <h2>You have successfully registered:</h2>
          <div class="success-message-text team-name">${teamName}</div>
          <p class="golfers-label"><strong>Registered Golfers:</strong></p>
          <ul class="success-golfer-list">${golferNamesHtml}</ul>
        `;
        successOverlay.removeAttribute('hidden');
      } else {
        messageBox.innerText = `❌ ${json.error || 'Something went wrong'}`;
        messageBox.className = 'form-message error';
        messageBox.removeAttribute('hidden');
      }
    } catch (err) {
      console.error(err);
      const messageBox = document.getElementById('form-message');
      messageBox.innerText = `❌ Submission failed. Please try again later.`;
      messageBox.className = 'form-message error';
      messageBox.removeAttribute('hidden');
    }
  });

  document.getElementById('cancel-form')?.addEventListener('click', () => {
    document.getElementById('modal-register-team')?.setAttribute('hidden', true);
  });
}

document.getElementById('golfer-team')?.addEventListener('change', async (e) => {
  const selectedTeam = e.target.value;
  const teamList = document.getElementById('team-members-list');
  const teamBox = document.getElementById('team-members-inline-display');

  if (selectedTeam === '__free_agent__') {
    teamBox.hidden = true;
    return;
  }

  try {
    const res = await fetch(`https://bgarkbbnfdrvtjrtkiam.supabase.co/functions/v1/get-team-members?team=${encodeURIComponent(selectedTeam)}`);
    const { golfers } = await res.json();

    if (golfers?.length) {
      teamList.innerHTML = golfers
        .map(g => `<li>⛳ ${g.first_name || ''} ${g.last_name || ''}</li>`)
        .join('');
      teamBox.hidden = false;
    } else {
      teamList.innerHTML = `<li>No golfers yet.</li>`;
      teamBox.hidden = false;
    }
  } catch (err) {
    console.error('Error fetching team members:', err);
    teamBox.hidden = true;
  }
});

function renderTeamMembers(members = []) {
  const container = document.getElementById('team-members-display');
  const list = document.getElementById('team-members-list');

  if (!container || !list) return;

  if (!members.length) {
    container.setAttribute('hidden', true);
    list.innerHTML = '';
    return;
  }

  container.removeAttribute('hidden');

  list.innerHTML = members
    .map(member => `
      <li>
        <i class="fa-solid fa-image-portrait"></i> ${member.first_name} ${member.last_name}
      </li>
    `)
    .join('');
}



/**
 * Handles submission of the single golfer form.
 */
function handleSingleGolferSubmit() {
  const form = document.getElementById('single-golfer-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const first = document.getElementById('golfer-first')?.value.trim();
    const last = document.getElementById('golfer-last')?.value.trim();
    const email = document.getElementById('golfer-email')?.value.trim();
    const phone = document.getElementById('golfer-phone')?.value.trim();
    const shirtSize = document.getElementById('golfer-shirt-size')?.value;
    const teamName = document.getElementById('golfer-team')?.value;

    if (!first || !last || !email || !phone || !teamName || !shirtSize) {
      alert("Please complete all fields.");
      return;
    }

    try {
      const res = await fetch('https://bgarkbbnfdrvtjrtkiam.supabase.co/functions/v1/register-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first, last, email, phone, shirtSize, teamName })
      });

      const json = await res.json();
      const successOverlay = document.getElementById('success-overlay');
      const successMsg = document.getElementById('success-message-text');

      if (res.ok) {
        form.reset();
        document.getElementById('modal-golfer')?.setAttribute('hidden', true);
        successMsg.innerHTML = `
          <div class="success-icon-wrapper">
            <i class="fa-solid fa-circle-check success-check-icon"></i>
          </div>
          <div class="success-message-text team-name">Successfully Registered!</div>
          <div class="success-message-text team-name">${first} ${last}</div>
          <h2>${
            teamName === "__free_agent__"
              ? "You’ve been registered as a free agent. You'll be notified of your team assignment upon check-in on the day of the event."
              : "You've been added to:"
          }</h2>
            ${
            teamName !== "__free_agent__"
              ? `<div class="success-message-text team-name">${teamName}</div>`
              : ""
          }
        `;
        successOverlay.removeAttribute('hidden');
      } else {
        const messageBox = document.getElementById('single-form-message');
        messageBox.innerText = `❌ ${json.error || 'Something went wrong'}`;
        messageBox.className = 'form-message error';
        messageBox.removeAttribute('hidden');
      }
    } catch (err) {
      console.error(err);
      const messageBox = document.getElementById('single-form-message');
      messageBox.innerText = `❌ Submission failed. Please try again later.`;
      messageBox.className = 'form-message error';
      messageBox.removeAttribute('hidden');
    }
  });

  document.getElementById('cancel-single-form')?.addEventListener('click', () => {
    document.getElementById('modal-golfer')?.setAttribute('hidden', true);
  });
}

// ─── Initialization ───────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  generateGolferFieldsets();
  formatPhoneInput();
  populateTeamDropdown();
  handleFormSubmit();
  handleSingleGolferSubmit();

  // Success overlay close
  document.getElementById('success-ok-btn')?.addEventListener('click', () => {
    document.getElementById('success-overlay')?.setAttribute('hidden', true);
  });

  // Modal open handlers
  document.querySelectorAll('.cta-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.modal;
      const modal = document.getElementById(modalId);
      if (modal) modal.removeAttribute('hidden');
    });
  });

  // Modal close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-overlay')?.setAttribute('hidden', true);
    });
  });

  // Click outside to close modal
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.setAttribute('hidden', true);
    });
  });
});