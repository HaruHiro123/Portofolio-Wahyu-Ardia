'use strict';
// Form kontak privat untuk situs statis. Alamat email tujuan tidak disimpan di source code.
(() => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const feedback = document.getElementById('contactFeedback');
  const submitButton = form.querySelector('button[type="submit"]');
  const t = window.portfolioText || ((id) => id);
  const fields = [...form.querySelectorAll('input:not([name="_gotcha"]), textarea')];

  submitButton.disabled = false;

  fields.forEach(field => field.addEventListener('input', () => {
    field.setCustomValidity('');
    feedback.textContent = '';
  }));

  form.addEventListener('submit', async event => {
    event.preventDefault();

    fields.forEach(field => {
      if (typeof field.value === 'string') field.value = field.value.trim();
      const invalid = !field.value || (field.name === 'message' && field.value.length < 10);
      field.setCustomValidity(
        invalid
          ? t('Isi bagian ini dengan benar. Pesan minimal 10 karakter.', 'Complete this field. Message must contain at least 10 characters.')
          : ''
      );
    });

    if (!form.reportValidity()) return;

    const endpoint = form.dataset.endpoint || '';
    if (!endpoint || endpoint.includes('PASTE_FORM_ID_HERE')) {
      feedback.textContent = t(
        'Form kontak belum terhubung. Tambahkan Formspree endpoint terlebih dahulu.',
        'The contact form is not connected yet. Add your Formspree endpoint first.'
      );
      return;
    }

    submitButton.disabled = true;
    feedback.textContent = t('Mengirim pesan…', 'Sending message…');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      });

      if (!response.ok) throw new Error(`Form service returned ${response.status}`);

      form.reset();
      feedback.textContent = t(
        'Pesan berhasil dikirim. Terima kasih sudah menghubungi saya!',
        'Message sent successfully. Thanks for reaching out!'
      );
    } catch (error) {
      feedback.textContent = t(
        'Pesan belum berhasil dikirim. Coba lagi beberapa saat lagi.',
        'The message could not be sent. Please try again in a moment.'
      );
      console.error('Contact form error:', error);
    } finally {
      submitButton.disabled = false;
    }
  });

  document.addEventListener('portfolio:languagechange', () => {
    fields.forEach(field => field.setCustomValidity(''));
    feedback.textContent = '';
  });
})();
