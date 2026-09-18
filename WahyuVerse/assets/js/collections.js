'use strict';
/* Central renderer for WahyuVerse collections. All content comes from data.js. */
(() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tr = (id, en) => `<span class="tr" data-en="${escape(en || id)}">${escape(id)}</span>`;
  const safeLink = url => /^https?:\/\//i.test(url || '') ? url : '';
  const cats = {
    course:['Kursus','Course'], technology:['Teknologi','Technology'], workshop:['Workshop','Workshop'],
    competition:['Kompetisi','Competition'], organization:['Organisasi','Organization'], achievement:['Pencapaian','Achievement'],
    canva:['Desain Canva','Canva Design'], uiux:['UI/UX','UI/UX'], visual:['Visual Design','Visual Design'],
    illustration:['Ilustrasi','Illustration'], traditional:['Gambar Tradisional','Traditional Drawing']
  };
  const categoryLabel = category => tr(...(cats[category] || [category, category]));

  /* Certificates */
  const certificateData = Array.isArray(window.certificates) ? window.certificates : [];
  certificateData.forEach(cert => {
    const old = window.portfolioDetails[cert.id] || {};
    const meta = [cert.issuer, cert.year].filter(Boolean).map(escape).join(' · ');
    window.portfolioDetails[cert.id] = {
      ...old,
      title: cert.title,
      title_en: cert.title_en || cert.title,
      img: cert.image || '',
      images: cert.images?.length ? cert.images : cert.image ? [cert.image] : [],
      desc: `${meta ? `<p class="mb-4 font-bold">${meta}</p>` : ''}${cert.description || old.desc || ''}`,
      desc_en: `${meta ? `<p class="mb-4 font-bold">${meta}</p>` : ''}${cert.description_en || cert.description || old.desc_en || ''}`,
      link: safeLink(cert.credentialUrl), linkText:'Lihat kredensial ↗', linkText_en:'View credential ↗'
    };
  });

  document.querySelectorAll('[data-certificates]').forEach(container => {
    const mode = container.dataset.certificates;
    const data = mode === 'featured' ? certificateData.filter(c => c.featured).slice(0, 3) : certificateData;
    container.innerHTML = data.map((c, i) => `<article class="certificate-card" data-cursor="open">
      <button type="button" class="certificate-image" data-detail="${escape(c.id)}" aria-label="${escape(c.title)}">
        ${c.image ? `<img src="${escape(c.image)}" ${c.width ? `width="${c.width}"` : ''} ${c.height ? `height="${c.height}"` : ''} loading="lazy" decoding="async" alt="${escape(c.title)}">` : `<span class="certificate-placeholder">${tr('Gambar sertifikat belum tersedia','Certificate image not supplied')}</span>`}
      </button>
      <div class="certificate-copy">
        <div class="certificate-meta"><span>CERT / ${String(i + 1).padStart(2, '0')}</span><span>${c.year || 'ARCHIVE'} · ${categoryLabel(c.category)}</span></div>
        <h3>${tr(c.title, c.title_en)}</h3>${c.issuer ? `<p>${escape(c.issuer)}</p>` : `<p>${tr('Detail pada dokumen asli','Details on original document')}</p>`}
        <button type="button" class="text-link" data-detail="${escape(c.id)}">${tr('Lihat detail ↗','Open details ↗')}</button>
      </div>
    </article>`).join('');
    if (!data.length) container.innerHTML = `<p class="creative-empty">${tr('Arsip sertifikat sedang disiapkan.','The certificate archive is being prepared.')}</p>`;
  });

  /* Education journey */
  document.querySelectorAll('[data-education-journey]').forEach(container => {
    const education = Array.isArray(window.education) ? window.education : [];
    container.innerHTML = education.map((e, i) => `<article class="education-stop ${e.current ? 'is-current' : ''}">
      <span class="education-index">0${i + 1}</span>
      <div><p class="education-period">${tr(e.period, e.period_en || e.period)}</p><h3>${tr(e.school, e.school_en || e.school)}</h3>${e.program ? `<p>${tr(e.program, e.program_en || e.program)}</p>` : ''}</div>
      ${e.current ? `<span class="education-now">${tr('SEKARANG','NOW')}</span>` : ''}
    </article>`).join('');
  });

  /* Soft skills and exploring tags */
  document.querySelectorAll('[data-soft-skills]').forEach(container => {
    container.innerHTML = (window.softSkills || []).map((s, i) => `<span class="soft-skill-tag" style="--tag-i:${i}">${tr(s[0], s[1])}</span>`).join('');
  });
  document.querySelectorAll('[data-exploring]').forEach(container => {
    container.innerHTML = (window.exploring || []).map((item, i) => `<span class="explore-chip" style="--chip-i:${i}">${escape(item)}</span>`).join('');
  });

  /* Featured Goresan & Cerita collage */
  document.querySelectorAll('[data-featured-drawings]').forEach(container => {
    const drawings = window.featuredDrawings || [];
    container.innerHTML = drawings.map((d, i) => `<button type="button" class="sketch-photo sketch-photo-${i + 1}" data-detail="${escape(d.id)}" data-cursor="view" aria-label="${escape(d.title)}">
      <span class="sketch-number">0${i + 1}</span><img src="${escape(d.image)}" width="${d.width || 960}" height="${d.height || 1280}" loading="lazy" decoding="async" alt="${escape(d.title)}">
    </button>`).join('');
  });

  /* Scout chapter */
  document.querySelectorAll('[data-scout-experiences]').forEach(container => {
    const scouts = window.scoutExperiences || [];
    container.innerHTML = scouts.map(item => `<article class="scout-story-card">
      <div class="scout-story-copy"><span class="micro">SCOUT / PRAMUKA</span><h3>${tr(item.title,item.title_en)}</h3><p>${tr(item.description,item.description_en)}</p><button type="button" class="btn-secondary" data-detail="${escape(item.id)}" data-cursor="view">${tr(`Buka ${item.images.length} foto ↗`,`Open ${item.images.length} photos ↗`)}</button></div>
      <button type="button" class="scout-story-image" data-detail="${escape(item.id)}" data-cursor="view" aria-label="${escape(item.title)}"><img src="${escape(item.image)}" loading="lazy" decoding="async" alt="${escape(item.title)}" width="${item.width || 1600}" height="${item.height || 1200}"><span>${String(item.images.length).padStart(2,'0')} PHOTOS</span></button>
    </article>`).join('');
  });

  /* Gallery: one Drawing Room for every drawing, plus the existing design/UIUX archive rooms. */
  const rooms = document.getElementById('creativeRooms');
  const filters = document.getElementById('creativeFilters');
  const drawingTrack = document.querySelector('[data-drawing-track]');
  const drawingFilters = document.getElementById('drawingFilters');
  if (!rooms || !filters) return;

  const drawings = Array.isArray(window.drawingArtworks) ? window.drawingArtworks : [];
  const drawingCategoryLabel = category => ({
    all: tr('Semua','All'), portrait: tr('Potret','Portrait'), sketch: tr('Sketsa','Sketch'),
    character: tr('Karakter','Character'), traditional: tr('Tradisional','Traditional')
  }[category] || escape(category));

  if (drawingTrack && drawingFilters) {
    drawingTrack.innerHTML = drawings.map((d, i) => {
      const categories = (d.categories || [d.category || 'sketch']).join(' ');
      return `<article class="museum-artwork drawing-artwork" data-drawing-categories="${escape(categories)}">
        <button type="button" class="museum-frame drawing-frame" style="--art-ratio:${d.width || 4}/${d.height || 5}" data-detail="${escape(d.id)}" data-cursor="view" aria-label="${escape(d.title)}">
          <span class="drawing-index">${String(i + 1).padStart(2,'0')}</span>
          <img class="museum-image drawing-image" src="${escape(d.image)}" width="${d.width || 960}" height="${d.height || 1280}" loading="lazy" decoding="async" draggable="false" alt="${escape(d.title)}">
        </button>
        <div class="museum-plaque drawing-plaque">
          <p class="drawing-category">${(d.categories || []).includes('traditional') ? tr('TRADISIONAL','TRADITIONAL') : (d.categories || []).includes('portrait') ? tr('POTRET','PORTRAIT') : tr('KARAKTER','CHARACTER')}</p>
          <h3>${tr(d.title,d.title_en || d.title)}</h3>
          <p>${tr(d.medium || 'Sketsa di atas kertas', d.medium_en || d.medium || 'Sketch on paper')}</p>
          <button class="drawing-open" data-detail="${escape(d.id)}" type="button">${tr('Lihat karya →','View artwork →')}</button>
        </div>
      </article>`;
    }).join('');

    // All works belong in one Drawing Room, so no category filter buttons are shown.
    drawingFilters.replaceChildren();
    drawingFilters.hidden = true;

    let filterTimer = 0;
    function setDrawingFilter(category, button) {
      const items = [...drawingTrack.querySelectorAll('.drawing-artwork')];
      clearTimeout(filterTimer);
      items.forEach(item => {
        const matches = category === 'all' || item.dataset.drawingCategories.split(' ').includes(category);
        if (matches) {
          item.hidden = false;
          item.classList.add('is-filter-entering');
          requestAnimationFrame(() => requestAnimationFrame(() => item.classList.remove('is-filter-entering')));
        } else {
          item.classList.add('is-filter-leaving');
        }
      });
      filterTimer = setTimeout(() => {
        items.forEach(item => {
          const matches = category === 'all' || item.dataset.drawingCategories.split(' ').includes(category);
          item.hidden = !matches;
          item.classList.remove('is-filter-leaving','is-filter-entering');
        });
        drawingTrack.scrollTo({ left:0, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        document.dispatchEvent(new CustomEvent('portfolio:galleryfilter'));
      }, 190);
      drawingFilters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    }
    drawingFilters.addEventListener('click', event => {
      const button = event.target.closest('[data-drawing-filter]');
      if (!button) return;
      setDrawingFilter(button.dataset.drawingFilter, button);
    });
  }

  const works = (window.creativeWorks || []).filter(w => w.image && cats[w.category]);
  works.forEach(w => {
    if (w.detailId && window.portfolioDetails[w.detailId]) return;
    window.portfolioDetails[w.id] = {
      title:w.title, title_en:w.title_en || w.title,
      desc:`${(w.tools || []).length ? `<p class="mb-4 font-bold">${escape(w.tools.join(' · '))}${w.year ? ' / '+escape(w.year) : ''}</p>` : ''}${escape(w.description)}`,
      desc_en:`${(w.tools || []).length ? `<p class="mb-4 font-bold">${escape(w.tools.join(' · '))}${w.year ? ' / '+escape(w.year) : ''}</p>` : ''}${escape(w.description_en || w.description)}`,
      img:w.image, images:w.images?.length ? w.images : [w.image], link:safeLink(w.url)
    };
  });

  const categories = ['visual','uiux','illustration','canva'].filter(c => works.some(w => w.category === c));
  let roomNumber = 2;
  categories.forEach(category => {
    rooms.insertAdjacentHTML('beforeend', `<section class="exhibition-room design-room" data-room="${category}"><div class="room-label"><span>ROOM / ${String(roomNumber++).padStart(2,'0')}</span><h2>${categoryLabel(category)}</h2></div><div class="creative-grid">${works.filter(w => w.category === category).map(w => `<article class="creative-card" data-cursor="view"><button type="button" data-detail="${escape(w.detailId || w.id)}"><div><img src="${escape(w.image)}" ${w.width ? `width="${w.width}"` : ''} ${w.height ? `height="${w.height}"` : ''} alt="${escape(w.title)}" loading="lazy" decoding="async"></div><span class="creative-card-copy"><span class="micro">${escape((w.tools || []).join(' · ')) || categoryLabel(category)}</span><strong>${tr(w.title,w.title_en)}</strong><small>${tr('Lihat karya ↗','View work ↗')}</small></span></button></article>`).join('')}</div></section>`);
  });

  const available = ['all','drawing', ...categories];
  filters.innerHTML = [...new Set(available)].map(c => `<button type="button" data-creative-filter="${c}" aria-pressed="${c === 'all'}">${c === 'all' ? tr('Semua ruang','All rooms') : c === 'drawing' ? tr('Drawing Room','Drawing Room') : categoryLabel(c)}</button>`).join('');
  filters.addEventListener('click', e => {
    const button = e.target.closest('[data-creative-filter]');
    if (!button) return;
    const category = button.dataset.creativeFilter;
    document.querySelectorAll('[data-room]').forEach(room => room.hidden = !(category === 'all' || room.dataset.room === category));
    filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    document.dispatchEvent(new CustomEvent('portfolio:roomchange'));
  });
})();
