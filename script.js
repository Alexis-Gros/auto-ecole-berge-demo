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

// Dynamic fleet loader (reads vehicules.json, with local file:// fallback)
const FALLBACK_FLEET = [
  {
    id: 'renault-clio-6',
    category: 'auto',
    name: 'Renault Clio 6',
    badge: 'Permis B · AAC · Supervisée',
    description: 'Boîte manuelle, double commande et aides à la conduite pour apprendre sereinement en ville comme sur route.',
    image: ''
  },
  {
    id: 'kawasaki-z500',
    category: 'moto',
    name: 'Kawasaki Z500',
    badge: 'Permis A2',
    description: 'Roadster maniable et accessible, idéal pour maîtriser les épreuves plateau et prendre plaisir sur les routes du 04.',
    image: ''
  },
  {
    id: 'kawasaki-z125',
    category: 'moto',
    name: 'Kawasaki Z125',
    badge: 'Permis A1 (125 cm³)',
    description: 'Moto légère et rassurante pour débuter dès 16 ans en toute sécurité sur plateau et en circulation.',
    image: ''
  }
];

function renderFleet(container, items) {
  container.innerHTML = '';
  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'fleet-card';

    const media = document.createElement('div');
    media.className = 'fleet-media';
    if (item.image) {
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.name;
      img.loading = 'lazy';
      media.appendChild(img);
    } else {
      media.innerHTML = `
        <div class="fleet-placeholder">
          <i data-lucide="image" width="24" height="24" aria-hidden="true"></i>
          <span>Emplacement photo (${item.name})</span>
        </div>
      `;
    }

    const body = document.createElement('div');
    body.className = 'fleet-body';

    const tag = document.createElement('span');
    tag.className = 'fleet-tag';
    tag.textContent = item.badge;

    const title = document.createElement('h3');
    title.textContent = item.name;

    const desc = document.createElement('p');
    desc.textContent = item.description;

    body.append(tag, title, desc);
    card.append(media, body);
    container.appendChild(card);
  });
}

const fleetContainers = document.querySelectorAll('[data-fleet-category]');
if (fleetContainers.length > 0) {
  fetch('vehicules.json')
    .then((res) => (res.ok ? res.json() : Promise.reject()))
    .catch(() => FALLBACK_FLEET)
    .then((fleet) => {
      fleetContainers.forEach((container) => {
        const category = container.dataset.fleetCategory;
        const filtered = fleet.filter((v) => v.category === category);
        renderFleet(container, filtered);
      });
      if (window.lucide) {
        window.lucide.createIcons();
      }
      initReveal();
    });
}

if (window.lucide) {
  window.lucide.createIcons();
}

// Sticky header shadow on scroll
const header = document.querySelector('.header');
if (header) {
  window.addEventListener(
    'scroll',
    () => {
      header.classList.toggle('scrolled', window.scrollY > 12);
    },
    { passive: true }
  );
}

// Scroll reveal with staggered delays
function initReveal() {
  const targets = document.querySelectorAll(
    '.section-head, .formation-card, .detail-card, .fleet-card, .pillar, .review-card, .info-item, .contact-form-wrap, .cta-banner'
  );
  if (targets.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -32px 0px' }
  );

  targets.forEach((el, index) => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
      const siblingIndex = el.parentElement
        ? Array.from(el.parentElement.children).indexOf(el)
        : index;
      el.style.setProperty('--reveal-delay', `${Math.min(siblingIndex * 70, 280)}ms`);
    }
    observer.observe(el);
  });
}

initReveal();
