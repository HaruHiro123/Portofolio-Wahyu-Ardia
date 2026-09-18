'use strict';
/* Original WahyuVerse creatures: simple, playful, and intentionally non-robotic. */
(() => {
  const creatures = [...document.querySelectorAll('[data-mascot]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');

  const eyes = (dark = '#20211f') => `
    <g class="mascot-eyes mascot-pupils">
      <ellipse cx="88" cy="93" rx="6.5" ry="9" fill="${dark}"/>
      <ellipse cx="116" cy="93" rx="6.5" ry="9" fill="${dark}"/>
    </g>`;

  const templates = {
    hero: () => `<svg viewBox="0 0 200 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <ellipse cx="101" cy="170" rx="54" ry="8" fill="#20211f" opacity=".12"/>
      <g class="creature-body flower-body">
        <g fill="#155EEF" stroke="#20211f" stroke-width="3">
          <ellipse cx="100" cy="42" rx="25" ry="34"/><ellipse cx="145" cy="60" rx="25" ry="34" transform="rotate(45 145 60)"/>
          <ellipse cx="160" cy="105" rx="25" ry="34" transform="rotate(90 160 105)"/><ellipse cx="140" cy="145" rx="25" ry="34" transform="rotate(135 140 145)"/>
          <ellipse cx="99" cy="158" rx="25" ry="34"/><ellipse cx="57" cy="143" rx="25" ry="34" transform="rotate(45 57 143)"/>
          <ellipse cx="42" cy="100" rx="25" ry="34" transform="rotate(90 42 100)"/><ellipse cx="59" cy="59" rx="25" ry="34" transform="rotate(135 59 59)"/>
        </g>
        <circle cx="101" cy="101" r="48" fill="#FFD51C" stroke="#20211f" stroke-width="3"/>
        ${eyes()}
        <path d="M96 116q6 6 12 0" fill="none" stroke="#20211f" stroke-width="3" stroke-linecap="round"/>
        <circle cx="83" cy="74" r="7" fill="#fff" opacity=".5"/>
      </g>
      <g class="mascot-orbit" fill="#F725A9"><circle cx="176" cy="40" r="6"/><circle cx="26" cy="146" r="4"/><path d="M171 140l5 9 10 2-8 7 2 10-9-5-9 5 2-10-8-7 10-2z"/></g>
    </svg>`,
    peek: () => `<svg viewBox="0 0 200 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <ellipse cx="102" cy="172" rx="48" ry="7" fill="#20211f" opacity=".12"/>
      <g class="creature-body jelly-body">
        <path d="M49 148V92c0-42 22-65 53-65s54 23 54 65v56c-12-8-21-8-30 0-9 8-18 8-27 0-9-8-18-8-27 0-8 8-16 8-23 0Z" fill="#6236FF" stroke="#20211f" stroke-width="3"/>
        ${eyes('#fff')}
        <path d="M94 112q8 3 15-2" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M57 65q9-18 26-23" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".25"/>
      </g>
    </svg>`,
    project: () => `<svg viewBox="0 0 200 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <ellipse cx="101" cy="174" rx="51" ry="7" fill="#20211f" opacity=".12"/>
      <g class="creature-body project-blob">
        <path d="M45 103c0-44 24-73 61-73 39 0 62 27 55 64-3 18 7 28-2 48-10 21-33 30-61 27-34-3-57-25-53-66Z" fill="#F725A9" stroke="#20211f" stroke-width="3"/>
        ${eyes()}
        <path d="M95 115q6 5 13 0" fill="none" stroke="#20211f" stroke-width="3" stroke-linecap="round"/>
        <g class="creature-prop phone-prop" transform="rotate(7 145 127)"><rect x="126" y="101" width="39" height="59" rx="9" fill="#FFFDFC" stroke="#20211f" stroke-width="3"/><rect x="132" y="108" width="27" height="36" rx="5" fill="#155EEF"/><circle cx="145" cy="151" r="3" fill="#20211f"/></g>
        <path d="M51 122q-20 7-25 25" fill="none" stroke="#20211f" stroke-width="8" stroke-linecap="round"/>
      </g>
    </svg>`,
    journey: () => `<svg viewBox="0 0 200 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <ellipse cx="100" cy="170" rx="46" ry="7" fill="#20211f" opacity=".12"/>
      <g class="creature-body star-body">
        <path d="m100 25 21 43 47 7-34 33 8 47-42-22-42 22 8-47-34-33 47-7Z" fill="#FFD51C" stroke="#20211f" stroke-width="3" stroke-linejoin="round"/>
        ${eyes()}
        <path d="M96 111q6 5 12 0" fill="none" stroke="#20211f" stroke-width="3" stroke-linecap="round"/>
      </g>
    </svg>`,
    museum: () => `<svg viewBox="0 0 200 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <ellipse cx="101" cy="173" rx="54" ry="7" fill="#000" opacity=".16"/>
      <g class="creature-body cat-body">
        <path d="m57 63 9-35 26 22c7-3 16-4 25-2l25-20 8 37c12 13 18 31 15 51-4 35-28 53-64 53-40 0-66-20-66-55 0-21 8-38 22-51Z" fill="#20211F" stroke="#111" stroke-width="3"/>
        ${eyes('#FFFDFC')}
        <path d="M96 112q6 4 12 0" fill="none" stroke="#FFFDFC" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M68 119H37m31 8-34 8m99-16h31m-31 8 34 8" stroke="#20211f" stroke-width="3" stroke-linecap="round"/>
        <path d="M56 161q-2 15-17 17m105-17q3 14 18 16" fill="none" stroke="#20211f" stroke-width="12" stroke-linecap="round"/>
      </g>
    </svg>`,
    contact: () => `<svg viewBox="0 0 200 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <ellipse cx="103" cy="171" rx="49" ry="7" fill="#000" opacity=".13"/>
      <g class="creature-body speech-body">
        <path d="M42 82c0-34 25-56 61-56 37 0 62 22 62 57 0 34-24 56-61 56H88l-29 28 6-36C50 121 42 104 42 82Z" fill="#FFD51C" stroke="#20211f" stroke-width="3"/>
        ${eyes()}
        <path d="M95 108q7 6 14 0" fill="none" stroke="#20211f" stroke-width="3" stroke-linecap="round"/>
        <g class="creature-prop envelope-prop"><rect x="112" y="126" width="57" height="39" rx="8" fill="#FFFDFC" stroke="#20211f" stroke-width="3"/><path d="m116 132 24 16 25-16" fill="none" stroke="#155EEF" stroke-width="3"/></g>
      </g>
    </svg>`
  };

  creatures.forEach((el, index) => {
    const kind = el.dataset.mascot;
    el.innerHTML = (templates[kind] || templates.peek)();
    el.style.setProperty('--mascot-delay', `${index * -1.1}s`);
  });

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('is-in-view', entry.isIntersecting)), { rootMargin:'100px' })
    : null;
  creatures.forEach(el => observer?.observe(el));

  // The curious flower follows the pointer with its eyes only.
  const hero = document.querySelector('[data-mascot="hero"]');
  let eyeFrame = 0, px = 0, py = 0;
  document.addEventListener('pointermove', event => {
    if (!hero || reduced.matches || !fine.matches || !hero.classList.contains('is-in-view')) return;
    px = event.clientX; py = event.clientY;
    if (eyeFrame) return;
    eyeFrame = requestAnimationFrame(() => {
      eyeFrame = 0;
      const rect = hero.getBoundingClientRect();
      const dx = Math.max(-5, Math.min(5, (px - rect.left - rect.width / 2) / 55));
      const dy = Math.max(-3.5, Math.min(3.5, (py - rect.top - rect.height / 2) / 55));
      hero.style.setProperty('--eye-x', `${dx}px`);
      hero.style.setProperty('--eye-y', `${dy}px`);
    });
  }, { passive:true });

  const projectCreature = document.querySelector('[data-mascot="project"]');
  document.querySelectorAll('[data-project]').forEach(card => {
    ['pointerenter','focusin'].forEach(type => card.addEventListener(type, () => !reduced.matches && projectCreature?.classList.add('is-reacting')));
    ['pointerleave','focusout'].forEach(type => card.addEventListener(type, () => projectCreature?.classList.remove('is-reacting')));
  });

  const contactCreature = document.querySelector('[data-mascot="contact"]');
  document.querySelectorAll('#contactForm button[type="submit"], .contact-aside a').forEach(el => {
    ['pointerenter','focusin'].forEach(type => el.addEventListener(type, () => !reduced.matches && contactCreature?.classList.add('is-reacting')));
    ['pointerleave','focusout'].forEach(type => el.addEventListener(type, () => contactCreature?.classList.remove('is-reacting')));
  });

  // Existing experience timeline behavior, now carried by the yellow star.
  const journey = document.getElementById('journey');
  const guide = document.getElementById('journeyGuide');
  const milestones = [...document.querySelectorAll('[data-milestone]')];
  let scrollFrame = 0;
  function moveGuide() {
    scrollFrame = 0;
    if (!journey || !guide || reduced.matches || document.hidden) return;
    let closest = null, distance = Infinity;
    milestones.forEach(card => {
      const r = card.getBoundingClientRect();
      const d = Math.abs(r.top + Math.min(r.height / 2, 180) - innerHeight * .48);
      if (d < distance) { closest = card; distance = d; }
    });
    milestones.forEach(card => card.classList.toggle('is-current', card === closest));
    if (closest) guide.style.transform = `translateY(${closest.offsetTop + 83}px)`;
  }
  function queueJourney() { if (!scrollFrame) scrollFrame = requestAnimationFrame(moveGuide); }
  if (journey) {
    addEventListener('scroll', queueJourney, { passive:true });
    addEventListener('resize', queueJourney, { passive:true });
    document.addEventListener('portfolio:languagechange', queueJourney);
    queueJourney();
  }

  const museumCreature = document.querySelector('[data-mascot="museum"]');
  const museumTrack = document.getElementById('museumTrack');
  let museumFrame = 0;
  museumTrack?.addEventListener('scroll', () => {
    if (reduced.matches || museumFrame || !museumCreature) return;
    museumFrame = requestAnimationFrame(() => {
      museumFrame = 0;
      museumCreature.style.setProperty('--eye-x', `${Math.sin(museumTrack.scrollLeft / 180) * 4}px`);
    });
  }, { passive:true });

  reduced.addEventListener('change', () => {
    if (reduced.matches) creatures.forEach(el => {
      el.classList.remove('is-reacting');
      el.style.removeProperty('--eye-x'); el.style.removeProperty('--eye-y');
    });
    else queueJourney();
  });
})();
