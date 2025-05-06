/**
 * Toggles team-member fields when “Full Team” is selected.
 */
document.addEventListener('DOMContentLoaded', () => {
  const radios     = document.querySelectorAll('input[name="type"]');
  const teamFields = document.getElementById('team-fields');

  radios.forEach(radio =>
    radio.addEventListener('change', () => {
      if (radio.value === 'team' && radio.checked) {
        teamFields.hidden = false;
      } else if (radio.value === 'individual' && radio.checked) {
        teamFields.hidden = true;
      }
    })
  );
});
