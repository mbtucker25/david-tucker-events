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

// Update form mode based on registration type
function updateFormMode(type, teamNameField, golferFieldsets, shirtCheckbox, shirtSizesContainer) {
  const isTeam = type === 'team';

  // Enable or disable team name input
  teamNameField.disabled = !isTeam;

  // Enable/disable additional golfer fieldsets (Golfer #2–4)
  golferFieldsets.forEach((fs, index) => {
    const inputs = fs.querySelectorAll('input, select');
    const isPrimary = index === 0;
    inputs.forEach(input => {
      if (!isPrimary) input.disabled = !isTeam;
    });
    if (!isPrimary) {
      fs.style.display = isTeam ? 'block' : 'none';
    }
  });

  // Update shirt size selectors if shirt checkbox is on
  if (shirtCheckbox.checked) renderShirtSizes(isTeam ? 4 : 1, shirtSizesContainer);
}

// Render shirt sizes dynamically
function renderShirtSizes(count, shirtSizesContainer) {
  shirtSizesContainer.innerHTML = '';
  for (let i = 1; i <= count; i++) {
    const label = document.createElement('label');
    label.setAttribute('for', `shirt${i}`);
    label.textContent = `Player ${i} Shirt Size:`;

    const select = document.createElement('select');
    select.id = `shirt${i}`;
    select.name = `shirt${i}`;
    ['Youth - XS', 'Youth - S', 'Youth - M', 'Youth - L', 'Youth - XL',
      'Adult - S', 'Adult - M', 'Adult - L', 'Adult - XL'].forEach(size => {
      const option = document.createElement('option');
      option.value = size;
      option.textContent = size;
      select.appendChild(option);
    });

    shirtSizesContainer.appendChild(label);
    shirtSizesContainer.appendChild(select);
  }
}

// Handle registration type change
function handleRegistrationTypeChange(regRadios, teamNameField, golferFieldsets, shirtCheckbox, shirtSizesContainer) {
  regRadios.forEach(input => {
    input.addEventListener('change', () => {
      updateFormMode(input.value, teamNameField, golferFieldsets, shirtCheckbox, shirtSizesContainer);
    });
  });
}

// Handle shirt checkbox toggle
function handleShirtCheckboxToggle(shirtCheckbox, shirtSizesContainer, regRadios) {
  shirtCheckbox?.addEventListener('change', () => {
    const selectedType = document.querySelector('input[name="registration-type"]:checked')?.value || 'individual';
    shirtSizesContainer.style.display = shirtCheckbox.checked ? 'block' : 'none';
    if (shirtCheckbox.checked) {
      updateFormMode(selectedType, teamNameField, golferFieldsets, shirtCheckbox, shirtSizesContainer);
    } else {
      shirtSizesContainer.innerHTML = '';
    }
  });
}

// Handle form submission
function handleFormSubmission() {
  const form = document.getElementById('registration-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const successMsg = document.getElementById('success-message');
    [...form.elements].forEach(el => el.style.display = 'none');
    successMsg.hidden = false;
  });
}

// Initialize the form state on page load
function initializeFormState(regRadios, teamNameField, golferFieldsets, shirtCheckbox, shirtSizesContainer) {
  const defaultType = document.querySelector('input[name="registration-type"]:checked')?.value || 'individual';
  updateFormMode(defaultType, teamNameField, golferFieldsets, shirtCheckbox, shirtSizesContainer);
  if (shirtCheckbox.checked) renderShirtSizes(defaultType === 'team' ? 4 : 1, shirtSizesContainer);
}

// Main initialization function
function initialize() {
  // Sidebar toggle
  window.toggleSidebar = toggleSidebar;

  // Phone formatting
  formatPhoneInput();

  // Form elements
  const regRadios = document.querySelectorAll('input[name="registration-type"]');
  const teamNameField = document.getElementById('team-name');
  const golferFieldsets = document.querySelectorAll('.golfer-fieldset');
  const shirtCheckbox = document.getElementById('shirt-checkbox');
  const shirtSizesContainer = document.getElementById('shirt-sizes');

  // Event handlers
  handleRegistrationTypeChange(regRadios, teamNameField, golferFieldsets, shirtCheckbox, shirtSizesContainer);
  handleShirtCheckboxToggle(shirtCheckbox, shirtSizesContainer, regRadios);
  handleFormSubmission();

  // Initialize form state
  initializeFormState(regRadios, teamNameField, golferFieldsets, shirtCheckbox, shirtSizesContainer);
}

// Run the initialization function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initialize);