const processForm = (form) => {
  const data = new FormData(form);
  data.append('form-name', 'contactForm');
  fetch('/', {
    method: 'POST',
    body: data,
  })
    .then(() => {
      form.innerHTML = `<div class="alert__success"><strong>Cheers!</strong> The best men will pick up your message. If they need to clarify anything or get a bit more detail they'll be in touch.</div>`;
    })
    .catch((error) => {
      form.innerHTML = `<div class="alert__error">Error: ${error}</div>`;
    });
};

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    processForm(contactForm);
  });
}
