/**
 * Registers all interactive behaviors on DOM load
 */
document.addEventListener('DOMContentLoaded', () => {
  // TEAM TYPE TOGGLE
  const radios     = document.querySelectorAll('input[name="type"]');
  const teamFields = document.getElementById('team-fields');

  radios.forEach(radio =>
    radio.addEventListener('change', () => {
      teamFields.hidden = radio.value !== 'team';
    })
  );

  // GALLERY TOGGLE EXPANSION
  const galleryToggle = document.getElementById('js-toggle-gallery');
  const galleryGrid   = document.getElementById('js-gallery');

  if (galleryToggle && galleryGrid) {
    galleryToggle.addEventListener('click', () => {
      const expanded = galleryGrid.classList.toggle('expanded');
      galleryToggle.textContent = expanded ? 'Show less' : 'Show more';
    });
  }

  // LIGHTBOX FUNCTIONALITY
  const galleryImages   = [...document.querySelectorAll('.gallery__grid img')];
  const lightboxModal   = document.getElementById('lightbox-modal');
  const lightboxImg     = document.getElementById('lightbox-image');
  const lightboxClose   = document.getElementById('lightbox-close');
  const lightboxBackdrop= document.getElementById('lightbox-backdrop');
  const prevBtn         = document.getElementById('lightbox-prev');
  const nextBtn         = document.getElementById('lightbox-next');

  let currentIndex = 0;

  const openLightbox = (index) => {
    currentIndex = index;
    lightboxImg.src = galleryImages[currentIndex].src;
    lightboxModal.classList.remove('hidden');
  };

  const closeLightbox = () => lightboxModal.classList.add('hidden');

  const showNextImage = () => {
    currentIndex = (currentIndex + 1) % galleryImages.length;
    lightboxImg.src = galleryImages[currentIndex].src;
  };

  const showPrevImage = () => {
    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    lightboxImg.src = galleryImages[currentIndex].src;
  };

  galleryImages.forEach((img, index) => {
    img.addEventListener('click', () => openLightbox(index));
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxBackdrop?.addEventListener('click', closeLightbox);
  nextBtn?.addEventListener('click', showNextImage);
  prevBtn?.addEventListener('click', showPrevImage);

  // KEYBOARD NAVIGATION
  document.addEventListener('keydown', (e) => {
    if (lightboxModal.classList.contains('hidden')) return;
    if (e.key === 'ArrowRight') showNextImage();
    if (e.key === 'ArrowLeft') showPrevImage();
    if (e.key === 'Escape') closeLightbox();
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const regTypeInputs = document.querySelectorAll('input[name="registration-type"]');
  const teamInfo = document.getElementById('team-info');
  const shirtCheckbox = document.getElementById('shirt-checkbox');
  const shirtSizes = document.getElementById('shirt-sizes');

  const renderTeamFields = (type) => {
    teamInfo.innerHTML = '';
    if (type === 'partial') {
      const label = document.createElement('label');
      label.textContent = '# of Players (2-4):';
      const select = document.createElement('select');
      select.name = 'partial-count';
      select.id = 'partial-count';
      for (let i = 2; i <= 4; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = i;
        select.appendChild(opt);
      }
      teamInfo.appendChild(label);
      teamInfo.appendChild(select);
      select.addEventListener('change', () => {
        renderPlayerInputs(parseInt(select.value));
        if (shirtCheckbox.checked) renderShirtSizes(parseInt(select.value));
      });
      renderPlayerInputs(2);
    } else if (type === 'full') {
      renderPlayerInputs(4);
    } else {
      renderPlayerInputs(0);
    }
  };

  const renderPlayerInputs = (count) => {
    const existing = document.querySelectorAll('.player-field');
    existing.forEach(e => e.remove());

    for (let i = 2; i <= count; i++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.name = `player${i}`;
      input.placeholder = `Player ${i} Name`;
      input.classList.add('player-field');
      teamInfo.appendChild(input);
    }
  };

  const renderShirtSizes = (count) => {
    shirtSizes.innerHTML = '';
    for (let i = 1; i <= count; i++) {
      const label = document.createElement('label');
      label.textContent = `Player ${i} Shirt Size:`;
      const select = document.createElement('select');
      select.name = `shirt${i}`;
      ['S','M','L','XL','XXL'].forEach(size => {
        const opt = document.createElement('option');
        opt.value = size;
        opt.textContent = size;
        select.appendChild(opt);
      });
      select.classList.add('shirt-size-select');
      shirtSizes.appendChild(label);
      shirtSizes.appendChild(select);
    }
  };

  regTypeInputs.forEach(radio => {
    radio.addEventListener('change', (e) => {
      renderTeamFields(e.target.value);
    });
  });

  shirtCheckbox.addEventListener('change', () => {
    const regType = document.querySelector('input[name="registration-type"]:checked').value;
    const base = regType === 'full' ? 4 : regType === 'partial' ? parseInt(document.getElementById('partial-count')?.value || 2) : 1;
    shirtSizes.style.display = shirtCheckbox.checked ? 'block' : 'none';
    if (shirtCheckbox.checked) renderShirtSizes(base);
  });

  document.getElementById('registration-form').addEventListener('submit', e => {
    e.preventDefault();
    alert('Form submitted! 🏌️‍♂️');
  });

  renderTeamFields('individual');
});