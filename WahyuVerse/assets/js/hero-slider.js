'use strict';
/* Lightweight homepage portrait rotation. Keeps only two image elements alive and preloads one next photo. */
(() => {
  const root = document.querySelector('[data-hero-slider]');
  if (!root) return;

  const layers = [root.querySelector('[data-hero-image="a"]'), root.querySelector('[data-hero-image="b"]')];
  const dotsWrap = root.querySelector('[data-hero-dots]');
  const counter = root.querySelector('[data-hero-count]');
  const prev = root.querySelector('[data-hero-prev]');
  const next = root.querySelector('[data-hero-next]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  const photos = [
    { src:'images/WhatsApp Image 2026-08-24 at 10.10.30 PM.jpeg', position:'50% 36%', altId:'Wahyu dengan latar pegunungan di Bali', altEn:'Wahyu with a mountain backdrop in Bali' },
    { src:'images/hero/hero-02.jpeg', position:'50% 42%', altId:'Potret Wahyu memakai blazer abu-abu', altEn:'Portrait of Wahyu wearing a grey blazer' },
    { src:'images/hero/hero-03.jpeg', position:'52% 40%', altId:'Wahyu dalam potret cermin dengan pakaian kampus', altEn:'Wahyu in a mirror portrait wearing campus attire' },
    { src:'images/hero/hero-04.jpeg', position:'50% 48%', altId:'Potret santai Wahyu memakai headphone', altEn:'A casual portrait of Wahyu wearing headphones' }
  ];

  let index = 0;
  let activeLayer = 0;
  let timer = 0;
  let resumeTimer = 0;
  let transitioning = false;
  let pointerStart = null;

  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'id';
  const altText = photo => lang() === 'en' ? photo.altEn : photo.altId;
  const labelText = i => lang() === 'en' ? `Show photo ${i + 1} of ${photos.length}` : `Tampilkan foto ${i + 1} dari ${photos.length}`;

  function updateChrome() {
    counter.textContent = `${String(index + 1).padStart(2,'0')} / ${String(photos.length).padStart(2,'0')}`;
    [...dotsWrap.children].forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
      dot.setAttribute('aria-pressed', String(i === index));
      dot.setAttribute('aria-label', labelText(i));
    });
    layers[activeLayer].alt = altText(photos[index]);
  }

  function preloadNext() {
    const upcoming = photos[(index + 1) % photos.length];
    const img = new Image();
    img.decoding = 'async';
    img.src = upcoming.src;
  }

  function applyPhoto(layer, photo) {
    layer.src = photo.src;
    layer.style.objectPosition = photo.position;
    layer.alt = altText(photo);
  }

  function show(target, userInitiated = false) {
    const normalized = (target + photos.length) % photos.length;
    if (normalized === index || transitioning) return;
    if (userInitiated) pauseTemporarily();

    const nextLayerIndex = 1 - activeLayer;
    const incoming = layers[nextLayerIndex];
    const outgoing = layers[activeLayer];
    const photo = photos[normalized];
    transitioning = true;
    applyPhoto(incoming, photo);

    const reveal = () => {
      incoming.classList.add('is-active');
      outgoing.classList.remove('is-active');
      index = normalized;
      activeLayer = nextLayerIndex;
      updateChrome();
      window.setTimeout(() => {
        transitioning = false;
        preloadNext();
      }, reduced.matches ? 40 : 1050);
    };

    if (incoming.complete) reveal();
    else incoming.addEventListener('load', reveal, { once:true });
  }

  function stopAuto() {
    clearInterval(timer);
    timer = 0;
  }

  function startAuto() {
    stopAuto();
    if (reduced.matches || document.hidden) return;
    timer = window.setInterval(() => show(index + 1, false), 5600);
  }

  function pauseTemporarily() {
    stopAuto();
    clearTimeout(resumeTimer);
    if (!reduced.matches) resumeTimer = window.setTimeout(startAuto, 12000);
  }

  dotsWrap.innerHTML = photos.map((_, i) => `<button type="button" class="hero-photo-dot${i === 0 ? ' is-active' : ''}" aria-pressed="${i === 0}" aria-label="${labelText(i)}" data-hero-dot="${i}"></button>`).join('');
  layers[0].style.objectPosition = photos[0].position;
  layers[0].alt = altText(photos[0]);
  layers[1].style.objectPosition = photos[1].position;
  updateChrome();
  preloadNext();

  dotsWrap.addEventListener('click', event => {
    const button = event.target.closest('[data-hero-dot]');
    if (!button) return;
    show(Number(button.dataset.heroDot), true);
  });
  prev.addEventListener('click', () => show(index - 1, true));
  next.addEventListener('click', () => show(index + 1, true));

  root.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse') return;
    pointerStart = { x:event.clientX, y:event.clientY };
  }, { passive:true });
  root.addEventListener('pointerup', event => {
    if (!pointerStart || event.pointerType === 'mouse') return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy)) return;
    show(index + (dx < 0 ? 1 : -1), true);
  }, { passive:true });

  document.addEventListener('visibilitychange', () => document.hidden ? stopAuto() : startAuto());
  document.addEventListener('portfolio:languagechange', updateChrome);
  reduced.addEventListener('change', () => {
    if (reduced.matches) stopAuto();
    else startAuto();
  });

  startAuto();
})();
