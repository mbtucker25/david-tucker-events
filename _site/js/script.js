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