// Mobile menu toggle
const burgerBtn = document.getElementById('burger-btn');
const navMenu = document.getElementById('nav-menu');

if (burgerBtn && navMenu) {
  burgerBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    burgerBtn.setAttribute('aria-expanded', String(isOpen));
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      burgerBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// Formation category filters
const tabButtons = document.querySelectorAll('.tab-btn');
const formationCards = document.querySelectorAll('.formation-card');

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;

    tabButtons.forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    formationCards.forEach((card) => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !match);
    });
  });
});

// Pre-select formation in contact form (via button or URL ?formation=...)
const formationSelect = document.getElementById('formation');
const contactSection = document.getElementById('contact');

if (formationSelect) {
  const params = new URLSearchParams(window.location.search);
  const urlFormation = params.get('formation');
  if (urlFormation) {
    const matchOption = Array.from(formationSelect.options).find(
      (opt) => opt.value.toLowerCase() === urlFormation.toLowerCase()
    );
    if (matchOption) {
      formationSelect.value = matchOption.value;
    }
  }
}

document.querySelectorAll('.select-formation').forEach((btn) => {
  btn.addEventListener('click', () => {
    const chosen = btn.dataset.formation;
    if (formationSelect && chosen) {
      formationSelect.value = chosen;
    }
    contactSection?.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('name')?.focus({ preventScroll: true });
  });
});

// Demo form submission feedback
const leadForm = document.getElementById('lead-form');
const formFeedback = document.getElementById('form-feedback');

if (leadForm && formFeedback) {
  leadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name')?.value.trim() || 'Merci';
    const formation = formationSelect?.value || 'votre formation';
    formFeedback.textContent = `Merci ${name} ! Votre demande pour "${formation}" est prête (démo : lors de la mise en ligne, elle sera envoyée directement par email à l'auto-école).`;
    leadForm.reset();
  });
}
