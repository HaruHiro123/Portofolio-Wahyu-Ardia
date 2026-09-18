'use strict';
/* Horizontal exhibition controller. Vertical wheel scrolling is never captured. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const t = window.portfolioText;

  function initGallery(room, legacy = false) {
    if (!room || room.dataset.galleryReady) return;
    room.dataset.galleryReady = 'true';
    const section = room.closest('.exhibition-room') || room.parentElement;
    const track = legacy ? document.getElementById('museumTrack') : room.querySelector('[data-gallery-track]');
    let artworks = track ? [...track.querySelectorAll('.museum-artwork')] : [];
    if (!track || !artworks.length) return;
    const visibleArtworks = () => artworks.filter(art => !art.hidden);
    const controls = legacy ? document.getElementById('museumControls') : section.querySelector('[data-gallery-controls]');
    const play = legacy ? document.getElementById('museumPlay') : section.querySelector('[data-gallery-play]');
    const prev = legacy ? document.getElementById('museumPrev') : section.querySelector('[data-gallery-prev]');
    const next = legacy ? document.getElementById('museumNext') : section.querySelector('[data-gallery-next]');
    const count = legacy ? document.getElementById('museumCount') : section.querySelector('[data-gallery-count]');
    const state = legacy ? document.getElementById('museumState') : section.querySelector('[data-gallery-state]');
    const progress = legacy ? document.getElementById('museumProgress') : section.querySelector('[data-gallery-progress]');
    if (!play || !prev || !next || !count || !state || !progress) return;

    let automatic = !reduced.matches;
    let inView = false;
    let modalOpen = !!document.getElementById('detailModal')?.open;
    let direction = 1, frame = 0, previousTime = 0, position = 0;
    if (!play.firstElementChild || !play.lastElementChild) play.innerHTML = '<i aria-hidden="true"></i><span></span>';

    const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);
    function currentIndex() {
      const visible = visibleArtworks();
      if (!visible.length) return 0;
      const offset = track.scrollLeft;
      let best = 0, distance = Infinity;
      visible.forEach((art, i) => {
        const target = Math.min(maxScroll(), art.offsetLeft - visible[0].offsetLeft);
        if (Math.abs(target - offset) < distance) { distance = Math.abs(target - offset); best = i; }
      });
      return best;
    }
    function updateProgress() {
      const visible = visibleArtworks();
      const index = currentIndex();
      count.textContent = visible.length ? `${String(index + 1).padStart(2, '0')} / ${String(visible.length).padStart(2, '0')}` : '00 / 00';
      progress.style.transform = `scaleX(${maxScroll() ? track.scrollLeft / maxScroll() : 1})`;
      prev.disabled = !visible.length || track.scrollLeft < 2;
      next.disabled = !visible.length || track.scrollLeft >= maxScroll() - 2;
    }
    function updateLabels() {
      play.setAttribute('aria-pressed', String(automatic));
      play.firstElementChild.className = `fa-solid fa-${automatic ? 'pause' : 'play'}`;
      play.lastElementChild.textContent = automatic ? t('Jeda otomatis', 'Pause autoplay') : t('Putar otomatis', 'Start autoplay');
      state.textContent = automatic
        ? (modalOpen ? t('Dijeda saat detail karya terbuka.', 'Paused while an artwork detail is open.') : t('Berjalan perlahan · geser untuk kendali manual.', 'Moving slowly · drag to take control.'))
        : t('Mode manual · geser bebas atau putar kembali.', 'Manual mode · explore freely or resume autoplay.');
      prev.setAttribute('aria-label', t('Karya sebelumnya', 'Previous artwork'));
      next.setAttribute('aria-label', t('Karya berikutnya', 'Next artwork'));
      track.setAttribute('aria-label', t('Galeri karya; geser kiri atau kanan', 'Artwork gallery; swipe left or right'));
      const visible = visibleArtworks();
      visible.forEach((art, i) => art.setAttribute('aria-label', t(`Karya ${i + 1} dari ${visible.length}`, `Artwork ${i + 1} of ${visible.length}`)));
    }
    const visibleRoom = () => !section?.hidden;
    const shouldRun = () => visibleRoom() && automatic && inView && !modalOpen && !document.hidden && visibleArtworks().length > 1 && maxScroll() > 0;
    function animate(time) {
      frame = 0;
      if (!shouldRun()) return;
      const dt = previousTime ? Math.min(48, time - previousTime) : 0;
      previousTime = time;
      position += direction * dt * 0.055;
      if (position >= maxScroll()) { position = maxScroll(); direction = -1; }
      if (position <= 0) { position = 0; direction = 1; }
      track.scrollLeft = position;
      updateProgress();
      frame = requestAnimationFrame(animate);
    }
    function sync() {
      // Scroll snap is useful for manual drag/swipe, but it fights the tiny
      // requestAnimationFrame steps used by autoplay. Disable snap only while
      // autoplay is active, then restore the stylesheet value in manual mode.
      track.style.scrollSnapType = automatic ? 'none' : '';
      cancelAnimationFrame(frame); frame = 0; previousTime = 0;
      if (track.scrollLeft > maxScroll()) track.scrollLeft = maxScroll();
      position = Math.min(track.scrollLeft, maxScroll());
      if (shouldRun()) frame = requestAnimationFrame(animate);
      updateLabels(); updateProgress();
    }
    function takeControl() { automatic = false; sync(); }
    function step(delta) {
      takeControl();
      const visible = visibleArtworks();
      if (!visible.length) return;
      const current = currentIndex();
      const index = Math.max(0, Math.min(visible.length - 1, current + delta));
      const target = visible[index].offsetLeft - visible[0].offsetLeft;
      track.scrollTo({ left: Math.min(target, maxScroll()), behavior: reduced.matches ? 'instant' : 'smooth' });
    }

    window.attachHorizontalDrag?.(track, takeControl);
    track.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse') takeControl(); });
    track.addEventListener('wheel', event => {
      const horizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey;
      if (!horizontalIntent) return; // Normal mouse wheel always scrolls the page vertically.
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      takeControl(); event.preventDefault();
      track.scrollLeft += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? track.clientWidth : 1);
    }, { passive:false });
    track.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'ArrowLeft') step(-1);
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'Home' || event.key === 'End') {
        takeControl(); track.scrollTo({ left:event.key === 'Home' ? 0 : maxScroll(), behavior: reduced.matches ? 'instant' : 'smooth' });
      }
    });
    track.addEventListener('scroll', updateProgress, { passive:true });
    prev.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    play.addEventListener('click', () => { automatic = !automatic; sync(); });
    document.addEventListener('visibilitychange', sync);
    document.addEventListener('portfolio:roomchange', sync);
    document.addEventListener('portfolio:galleryfilter', () => { artworks = [...track.querySelectorAll('.museum-artwork')]; sync(); });
    document.addEventListener('portfolio:languagechange', updateLabels);
    document.addEventListener('portfolio:modalchange', event => { modalOpen = event.detail.open; sync(); });
    reduced.addEventListener('change', () => { if (reduced.matches) automatic = false; sync(); });
    new IntersectionObserver(entries => { inView = entries[0].isIntersecting; sync(); }, { threshold:0.12 }).observe(room);
    new ResizeObserver(() => sync()).observe(track);
    controls.hidden = false;
    sync();
  }

  initGallery(document.getElementById('museumRoom'), true);
  document.querySelectorAll('[data-auto-gallery]').forEach(room => initGallery(room, false));
})();
