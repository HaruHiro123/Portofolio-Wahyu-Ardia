'use strict';

// Fungsi bersama untuk seluruh halaman. Penyimpanan selalu memiliki fallback.
window.portfolioStorage = {
  get(key, fallback) {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); return true; } catch { return false; }
  }
};
const storage = window.portfolioStorage;
let currentLang = storage.get('wahyu-lang', 'id') === 'en' ? 'en' : 'id';
const languageButton = document.getElementById('langToggle');
const themeButton = document.getElementById('themeToggle');
const menuButton = document.getElementById('menuToggle');
const menu = document.getElementById('navMenu');
const modal = document.getElementById('detailModal');
let activeDetail = null;
let previousFocus = null;
let detailGallery = null;
let collectionNav = null;

function getDrawingSequence() {
  const track = document.querySelector('[data-drawing-track]');
  if (!track) return [];
  return [...track.querySelectorAll('.drawing-artwork:not([hidden])')]
    .map(card => card.querySelector('[data-detail]')?.dataset.detail)
    .filter((id, index, list) => id && list.indexOf(id) === index);
}
function ensureCollectionNav() {
  if (collectionNav || !modal) return collectionNav;
  const host = document.getElementById('modalDesc')?.parentElement;
  if (!host) return null;
  const nav = document.createElement('div');
  nav.className = 'detail-collection-nav';
  nav.hidden = true;
  nav.innerHTML = `
    <button type="button" class="detail-collection-button" data-collection-prev aria-label="Karya sebelumnya"><span aria-hidden="true">←</span><span class="detail-nav-label tr" data-en="Previous">Sebelumnya</span></button>
    <span class="detail-collection-count" data-collection-count aria-live="polite">01 / 01</span>
    <button type="button" class="detail-collection-button" data-collection-next aria-label="Karya berikutnya"><span class="detail-nav-label tr" data-en="Next">Berikutnya</span><span aria-hidden="true">→</span></button>`;
  host.insertBefore(nav, document.getElementById('modalLink'));
  nav.querySelector('[data-collection-prev]').addEventListener('click', () => moveDrawingDetail(-1));
  nav.querySelector('[data-collection-next]').addEventListener('click', () => moveDrawingDetail(1));
  collectionNav = nav;
  return nav;
}
function updateCollectionNav() {
  const nav = ensureCollectionNav();
  if (!nav) return;
  const ids = getDrawingSequence();
  const index = ids.indexOf(activeDetail);
  nav.hidden = index < 0 || ids.length < 2;
  if (nav.hidden) return;
  nav.querySelector('[data-collection-count]').textContent = `${String(index + 1).padStart(2,'0')} / ${String(ids.length).padStart(2,'0')}`;
  const prevButton = nav.querySelector('[data-collection-prev]');
  const nextButton = nav.querySelector('[data-collection-next]');
  prevButton.disabled = index === 0;
  nextButton.disabled = index === ids.length - 1;
  prevButton.setAttribute('aria-label', t('Karya sebelumnya', 'Previous artwork'));
  nextButton.setAttribute('aria-label', t('Karya berikutnya', 'Next artwork'));
  nav.querySelector('[data-collection-prev] .detail-nav-label').textContent = t('Sebelumnya', 'Previous');
  nav.querySelector('[data-collection-next] .detail-nav-label').textContent = t('Berikutnya', 'Next');
}
function moveDrawingDetail(delta) {
  const ids = getDrawingSequence();
  const index = ids.indexOf(activeDetail);
  if (index < 0) return;
  const nextIndex = Math.max(0, Math.min(ids.length - 1, index + delta));
  if (nextIndex === index) return;
  activeDetail = ids[nextIndex];
  renderDetail(activeDetail);
  modal.scrollTo({ top:0, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

window.portfolioText = (id, en) => currentLang === 'en' ? en : id;
const t = window.portfolioText;

// Gunakan pengganti hanya bila berkas gambar terkait belum tersedia.
function prepareImages(scope = document) {
  scope.querySelectorAll('img').forEach(img => {
    if (img.dataset.fallbackReady) return;
    img.dataset.fallbackReady = 'true';
    function fallback() {
      if (img.dataset.missing) return;
      img.dataset.missing = 'true';
      img.alt = t('Gambar belum tersedia: ', 'Image not supplied: ') + img.alt;
      img.src = img.dataset.fallback || 'assets/image-placeholder.svg';
    }
    img.addEventListener('error', fallback, { once: true });
    if (img.complete && img.naturalWidth === 0) fallback();
  });
}

function updateThemeButton() {
  const dark = document.documentElement.classList.contains('dark');
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', dark ? t('Aktifkan mode terang', 'Enable light mode') : t('Aktifkan mode gelap', 'Enable dark mode'));
  themeButton.innerHTML = `<i class="fa-solid fa-${dark ? 'sun' : 'moon'}" aria-hidden="true"></i>`;
}
themeButton.addEventListener('click', () => {
  const dark = document.documentElement.classList.toggle('dark');
  storage.set('wahyu-theme', dark ? 'dark' : 'light');
  updateThemeButton();
});

function setMenu(open) {
  if (!menu || !menuButton) return;
  menu.classList.toggle('hidden', !open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? t('Tutup menu', 'Close menu') : t('Buka menu', 'Open menu'));
}
// Tanpa JS, tautan navigasi tetap terlihat. Dengan JS, menu HP bisa dilipat.
menu?.classList.add('lg:flex');
if (menuButton) menuButton.hidden = false;
setMenu(false);
menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
menu?.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
// Keep the current page marker correct even when files are served from GitHub Pages.
const currentFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
document.querySelectorAll('.nav-link[href]').forEach(link => {
  const target = (link.getAttribute('href') || '').split('#')[0].toLowerCase();
  if (target === currentFile) link.setAttribute('aria-current', 'page');
  else link.removeAttribute('aria-current');
});

window.addEventListener('resize', () => {
  if (innerWidth >= 1024) setMenu(false);
}, { passive:true });

// Navbar becomes slightly more compact after scrolling, without covering content.
const siteHeader = document.querySelector('.site-header');
function updateHeaderState() { siteHeader?.classList.toggle('is-scrolled', window.scrollY > 24); }
window.addEventListener('scroll', updateHeaderState, { passive:true });
updateHeaderState();

// Same-page anchors keep native history while using smooth positioning and fixed-nav offset.
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || link.getAttribute('href') === '#') return;
  const target = document.querySelector(link.getAttribute('href'));
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start' });
  history.pushState(null, '', link.getAttribute('href'));
});


document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    setMenu(false); menuButton.focus();
  }
});

function translatePage() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('.tr[data-en]').forEach(el => {
    // Hanya HTML terjemahan dari source milik kita; input pengguna tidak dimasukkan ke innerHTML.
    if (el.dataset.id === undefined) el.dataset.id = el.innerHTML;
    el.innerHTML = currentLang === 'en' ? el.dataset.en : el.dataset.id;
  });
  document.querySelectorAll('[data-aria-en]').forEach(el => el.setAttribute('aria-label', currentLang === 'en' ? el.dataset.ariaEn : el.dataset.ariaId));
  languageButton.textContent = currentLang === 'id' ? 'EN' : 'ID';
  languageButton.setAttribute('aria-label', t('Switch to English', 'Ganti ke Bahasa Indonesia'));
  document.querySelector('nav').setAttribute('aria-label', t('Navigasi utama', 'Main navigation'));
  document.getElementById('closeModal').setAttribute('aria-label', t('Tutup detail', 'Close details'));
  updateThemeButton();
  setMenu(menuButton.getAttribute('aria-expanded') === 'true');
  if (activeDetail) renderDetail(activeDetail);
  document.dispatchEvent(new CustomEvent('portfolio:languagechange'));
}
languageButton.addEventListener('click', () => {
  currentLang = currentLang === 'id' ? 'en' : 'id';
  storage.set('wahyu-lang', currentLang);
  translatePage();
});


function lockPageScroll() {
  document.documentElement.classList.add('modal-open');
  document.body.classList.add('modal-open');
}
function unlockPageScroll() {
  document.documentElement.classList.remove('modal-open');
  document.body.classList.remove('modal-open');
  ['overflow','overflow-y','position','top','width'].forEach(prop => {
    document.documentElement.style.removeProperty(prop);
    document.body.style.removeProperty(prop);
  });
}
window.addEventListener('pageshow', unlockPageScroll);
window.addEventListener('pagehide', unlockPageScroll);

// <dialog> memberikan fokus terperangkap di dalam modal dan dukungan tombol Escape.
function renderDetail(id) {
  const data = window.portfolioDetails?.[id];
  if (!data) return;
  const title = currentLang === 'en' ? (data.title_en || data.title) : data.title;
  document.getElementById('modalTitle').textContent = title;
  const desc = document.getElementById('modalDesc');
  desc.innerHTML = currentLang === 'en' ? (data.desc_en || data.desc) : data.desc;
  desc.querySelectorAll('a[target="_blank"]').forEach(a => a.rel = 'noopener noreferrer');
  const images = document.getElementById('modalImages');
  detailGallery?.destroy();
  const sources = data.images || (data.img ? [data.img] : []);
  images.hidden = !sources.length;
  detailGallery = window.createMediaGallery(images, sources, title, t);
  prepareImages(images);
  const link = document.getElementById('modalLink');
  link.hidden = !data.link;
  if (data.link) {
    link.href = data.link;
    link.innerHTML = currentLang === 'en' ? (data.linkText_en || data.linkText || 'Open link ↗') : (data.linkText || 'Buka tautan ↗');
  } else { link.removeAttribute('href'); }
  updateCollectionNav();
}
function openDetail(id, trigger) {
  if (!window.portfolioDetails?.[id]) return;
  activeDetail = id;
  previousFocus = trigger || document.activeElement;
  renderDetail(id);
  modal.showModal();
  lockPageScroll();
  modal.scrollTop = 0;
  document.dispatchEvent(new CustomEvent('portfolio:modalchange', { detail: { open: true } }));
}
document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-detail]');
  if (trigger) openDetail(trigger.dataset.detail, trigger);
});
document.getElementById('closeModal')?.addEventListener('click', () => modal?.close());
modal.addEventListener('click', event => {
  if (event.target !== modal) return;
  const rect = modal.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) modal.close();
});
modal.addEventListener('close', () => {
  detailGallery?.destroy();
  detailGallery = null;
  activeDetail = null;
  unlockPageScroll();
  previousFocus?.focus();
  document.dispatchEvent(new CustomEvent('portfolio:modalchange', { detail: { open: false } }));
});
modal.addEventListener('keydown', event => {
  if (event.target.closest('input, textarea, pre, code')) return;
  if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    if (detailGallery?.multiple) {
      event.preventDefault();
      detailGallery.move(event.key === 'ArrowRight' ? 1 : -1);
      return;
    }
    if (collectionNav && !collectionNav.hidden) {
      event.preventDefault();
      moveDrawingDetail(event.key === 'ArrowRight' ? 1 : -1);
    }
  }
});
function openLinkedProject() {
  const id = location.hash.slice(1);
  const trigger = document.querySelector(`[data-detail="${CSS.escape(id)}"]`);
  if (trigger && window.portfolioDetails?.[id]) openDetail(id, trigger);
}
window.addEventListener('hashchange', openLinkedProject);
translatePage();
prepareImages();
openLinkedProject();
