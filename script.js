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

// Live agency opening hours (Manosque, Europe/Paris)
// 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
const AGENCY_HOURS = {
  0: [],
  1: [{ start: 14 * 60, end: 19 * 60, label: '14h00 – 19h00' }],
  2: [{ start: 17 * 60, end: 19 * 60, label: '17h00 – 19h00' }],
  3: [
    { start: 10 * 60, end: 12 * 60, label: '10h00 – 12h00' },
    { start: 14 * 60, end: 19 * 60, label: '14h00 – 19h00' }
  ],
  4: [{ start: 14 * 60, end: 19 * 60, label: '14h00 – 19h00' }],
  5: [{ start: 14 * 60, end: 19 * 60, label: '14h00 – 19h00' }],
  6: [
    { start: 10 * 60, end: 12 * 60, label: '10h00 – 12h00' },
    { start: 14 * 60, end: 17 * 60, label: '14h00 – 17h00' }
  ]
};

const DAY_NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

function formatMinute(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h${m === 0 ? '00' : String(m).padStart(2, '0')}`;
}

function getParisNow() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(now);

  const weekdayMap = { dim: 0, lun: 1, mar: 2, mer: 3, jeu: 4, ven: 5, sam: 6 };
  const rawDay = (parts.find((p) => p.type === 'weekday')?.value || '').toLowerCase().slice(0, 3);
  const day = weekdayMap[rawDay] ?? now.getDay();
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? now.getHours());
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? now.getMinutes());
  return { day, minutes: hour * 60 + minute };
}

function updateAgencyStatus() {
  const badges = document.querySelectorAll('[data-agency-status]');
  const hoursList = document.querySelector('[data-hours-list]');
  const { day, minutes } = getParisNow();

  if (hoursList) {
    const todayItem = hoursList.querySelector(`[data-day="${day}"]`);
    if (todayItem) todayItem.classList.add('is-today');
  }

  if (badges.length === 0) return;

  const todaySlots = AGENCY_HOURS[day] || [];
  const activeSlot = todaySlots.find((s) => minutes >= s.start && minutes < s.end);
  const nextTodaySlot = todaySlots.find((s) => minutes < s.start);

  let text = '';
  let isOpen = false;

  if (activeSlot) {
    isOpen = true;
    text = `Bureau ouvert · jusqu'à ${formatMinute(activeSlot.end)}`;
  } else if (nextTodaySlot) {
    text = `Ouvre aujourd'hui à ${formatMinute(nextTodaySlot.start)}`;
  } else {
    for (let offset = 1; offset <= 7; offset += 1) {
      const nextDay = (day + offset) % 7;
      const slots = AGENCY_HOURS[nextDay];
      if (slots && slots.length > 0) {
        const dayLabel = offset === 1 ? 'demain' : DAY_NAMES[nextDay];
        text = `Fermé · Ouvre ${dayLabel} à ${formatMinute(slots[0].start)}`;
        break;
      }
    }
  }

  badges.forEach((badge) => {
    badge.textContent = text;
    badge.classList.toggle('is-open', isOpen);
    badge.classList.toggle('is-closed', !isOpen);
  });
}

updateAgencyStatus();

// Interactive Orientation Simulator (index.html)
const orientationWidget = document.getElementById('orientation-widget');
if (orientationWidget) {
  const RECOMMENDATIONS = {
    auto: {
      15: {
        tag: 'Parcours recommandé · Voiture dès 15 ans',
        title: 'Conduite Accompagnée (AAC)',
        desc: 'Idéal pour démarrer tôt : formation initiale en auto-école (minimum 20 h), puis conduite avec un proche avant l’examen.',
        points: [
          'Code de la route + formation pratique dès 15 ans',
          'Période probatoire réduite à 2 ans au lieu de 3 ans',
          'Accompagnement complet du dossier ANTS au bureau'
        ],
        ctaLabel: 'Se renseigner sur l’AAC',
        formation: 'Conduite Accompagnée (AAC)'
      },
      '16-17': {
        tag: 'Parcours recommandé · Voiture 16–17 ans',
        title: 'Conduite Accompagnée (AAC)',
        desc: 'Commencez dès maintenant à Manosque pour gagner un maximum d’expérience avant le passage de l’épreuve pratique.',
        points: [
          'Apprentissage progressif sur Renault Clio double commande',
          'Rendez-vous pédagogiques avec vos accompagnateurs',
          'Autorisation du représentant légal requise à l’inscription'
        ],
        ctaLabel: 'Se renseigner sur l’AAC',
        formation: 'Conduite Accompagnée (AAC)'
      },
      '18+': {
        tag: 'Parcours recommandé · Voiture 18 ans et +',
        title: 'Permis B ou Conduite Supervisée',
        desc: 'Formation complète en boîte manuelle au départ du 18 bd Élémir Bourges, avec possibilité de conduite supervisée.',
        points: [
          'Évaluation de départ pour estimer votre volume d’heures',
          'Circulation en ville, route et voies rapides du secteur',
          'Option Conduite Supervisée possible après la formation initiale'
        ],
        ctaLabel: 'Demander les tarifs Permis B',
        formation: 'Permis B'
      }
    },
    moto: {
      15: {
        tag: 'Information âge légal · Deux-roues',
        title: 'Permis A1 accessible dès 16 ans',
        desc: 'Le permis moto 125 cm³ (A1) débute à 16 ans, mais vous pouvez déjà préparer votre dossier et le code théorique moto (ETM).',
        points: [
          'Passage de l’épreuve pratique A1 possible dès 16 ans',
          'Formation sur Kawasaki Z125 légère et maniable',
          'Appelez-nous pour anticiper votre inscription'
        ],
        ctaLabel: 'Préparer mon dossier Moto',
        formation: 'Permis Moto (A1 / A2)'
      },
      '16-17': {
        tag: 'Parcours recommandé · Deux-roues 16–17 ans',
        title: 'Permis Moto A1 (125 cm³)',
        desc: 'Dès 16 ans, apprenez à piloter une 125 cm³ en toute sécurité sur plateau puis sur les routes des Alpes-de-Haute-Provence.',
        points: [
          'Moto-école sur Kawasaki Z125 adaptée aux débutants',
          'Préparation à l’ETM (Code moto) et au plateau',
          'Équipement homologué CE requis pour les leçons'
        ],
        ctaLabel: 'Demander les infos Permis A1',
        formation: 'Permis Moto (A1 / A2)'
      },
      '18+': {
        tag: 'Parcours recommandé · Deux-roues 18 ans et +',
        title: 'Permis Moto A2 (Gros cube)',
        desc: 'Formation complète plateau et circulation sur Kawasaki Z500 avec des moniteurs passionnés et pédagogues.',
        points: [
          'Maîtrise lente, freinage d’urgence et évitement',
          'Circulation sur les routes du 04 autour de Manosque',
          'Remise en confiance et suivi personnalisé jusqu’à l’examen'
        ],
        ctaLabel: 'Demander les infos Permis A2',
        formation: 'Permis Moto (A1 / A2)'
      }
    },
    code: {
      15: {
        tag: 'Parcours recommandé · Théorique',
        title: 'Code de la route (ETG)',
        desc: 'Préparez l’épreuve théorique générale dès 15 ans dans le cadre de la conduite accompagnée.',
        points: [
          'Séries d’entraînement conformes à l’examen officiel',
          'Explications et suivi des points délicats',
          'Accompagnement pour la convocation'
        ],
        ctaLabel: 'Se renseigner sur le Code',
        formation: 'Code de la route'
      },
      '16-17': {
        tag: 'Parcours recommandé · Théorique',
        title: 'Code Auto (ETG) ou Moto (ETM)',
        desc: 'Obtenez votre code théorique rapidement pour enchaîner sur vos heures de conduite voiture ou 125 cm³.',
        points: [
          'Séances d’entraînement et corrections détaillées',
          'Valable 5 ans (ou 5 présentations à l’examen pratique)',
          'Inscription simplifiée au bureau de Manosque'
        ],
        ctaLabel: 'Se renseigner sur le Code',
        formation: 'Code de la route'
      },
      '18+': {
        tag: 'Parcours recommandé · Théorique',
        title: 'Code Auto (ETG) ou Moto (ETM)',
        desc: 'Un accompagnement structuré pour réussir votre épreuve théorique et passer sereinement à la pratique.',
        points: [
          'Préparation adaptée à votre rythme',
          'Tests blancs en conditions d’examen',
          'Suivi de votre dossier ANTS / numéro NEPH'
        ],
        ctaLabel: 'Se renseigner sur le Code',
        formation: 'Code de la route'
      }
    }
  };

  let state = { vehicle: 'auto', age: '18+' };

  const tagEl = document.getElementById('orient-tag');
  const titleEl = document.getElementById('orient-title');
  const descEl = document.getElementById('orient-desc');
  const pointsEl = document.getElementById('orient-points');
  const ctaEl = document.getElementById('orient-cta');

  function renderOrientation() {
    const rec = RECOMMENDATIONS[state.vehicle]?.[state.age];
    if (!rec) return;
    tagEl.textContent = rec.tag;
    titleEl.textContent = rec.title;
    descEl.textContent = rec.desc;
    pointsEl.innerHTML = rec.points.map((pt) => `<li>${pt}</li>`).join('');
    ctaEl.textContent = `${rec.ctaLabel} →`;
    ctaEl.href = `contact.html?formation=${encodeURIComponent(rec.formation)}#contact`;
  }

  orientationWidget.querySelectorAll('[data-choice-group]').forEach((group) => {
    const key = group.dataset.choiceGroup;
    group.querySelectorAll('.choice-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.choice-pill').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state[key] = btn.dataset.value;
        renderOrientation();
      });
    });
  });

  renderOrientation();
}

// FAQ Accordion
document.querySelectorAll('.faq-trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const item = trigger.closest('.faq-item');
    if (!item) return;
    const isOpen = item.classList.toggle('open');
    trigger.setAttribute('aria-expanded', String(isOpen));
  });
});

// Interactive Document Checklist (inscription.html)
const checklistContainer = document.getElementById('doc-checklist');
if (checklistContainer) {
  const checkboxes = checklistContainer.querySelectorAll('input[type="checkbox"]');
  const progressText = document.getElementById('checklist-count');
  const progressBar = document.getElementById('checklist-bar-fill');
  const STORAGE_KEY = 'berge_doc_checklist_v1';

  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    saved = {};
  }

  function updateChecklistUI() {
    const total = checkboxes.length;
    let checked = 0;
    const nextSaved = {};

    checkboxes.forEach((cb) => {
      const row = cb.closest('.checklist-item');
      if (cb.checked) {
        checked += 1;
        row?.classList.add('is-checked');
      } else {
        row?.classList.remove('is-checked');
      }
      nextSaved[cb.dataset.docId] = cb.checked;
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSaved));
    } catch {
      // ignore storage errors
    }

    const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (progressText) {
      progressText.textContent =
        checked === total
          ? `${checked} / ${total} pièces prêtes — Dossier complet !`
          : `${checked} / ${total} pièces cochées`;
    }
  }

  checkboxes.forEach((cb) => {
    if (saved[cb.dataset.docId]) {
      cb.checked = true;
    }
    cb.addEventListener('change', updateChecklistUI);
  });

  updateChecklistUI();
}

// Pre-select formation in contact form (via URL ?formation=...)
const formationSelect = document.getElementById('formation');
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

// Site config loader (config-site.json + localStorage overrides from admin.html)
const CONFIG_STORAGE_KEY = 'berge_site_config_v1';

const DEFAULT_SITE_CONFIG = {
  web3formsKey: '',
  financements: {
    cpf: true,
    unEuro: true,
    plusieursFois: true
  },
  tarifs: [
    {
      id: 'permis-b',
      category: 'auto',
      title: 'Forfait Permis B',
      price: '1 190 €',
      subtitle: '20h de conduite + Code & accompagnement',
      features: [
        'Évaluation de départ incluse',
        '20 heures de conduite sur Renault Clio',
        'Préparation au Code (ETG) & suivi ANTS',
        "1 présentation à l'examen pratique"
      ],
      highlighted: true,
      visible: true
    },
    {
      id: 'aac',
      category: 'auto',
      title: 'Conduite Accompagnée (AAC)',
      price: '1 290 €',
      subtitle: 'Dès 15 ans · Formation initiale + RDV pédagogiques',
      features: [
        'Formation initiale 20h de conduite',
        'Rendez-vous préalable + 2 RDV pédagogiques',
        "Livret d'apprentissage & suivi complet",
        "1 présentation à l'examen pratique"
      ],
      highlighted: false,
      visible: true
    },
    {
      id: 'moto-a2',
      category: 'moto',
      title: 'Permis Moto A2 / A1',
      price: '890 €',
      subtitle: '20h plateau & circulation sur Kawasaki Z500 / Z125',
      features: [
        '8h hors circulation (plateau)',
        '12h en circulation sur les routes du 04',
        'Accompagnement aux examens plateau & route',
        "Suivi personnalisé jusqu'à l'obtention"
      ],
      highlighted: true,
      visible: true
    },
    {
      id: 'code-seul',
      category: 'code',
      title: 'Forfait Code (ETG / ETM)',
      price: '190 €',
      subtitle: 'Préparation théorique Auto ou Moto',
      features: [
        "Séries d'entraînement conformes à l'examen",
        'Corrections et explications au bureau',
        'Tests blancs en conditions réelles',
        'Accompagnement inscription ANTS / NEPH'
      ],
      highlighted: false,
      visible: true
    }
  ],
  vehicules: [
    {
      id: 'renault-clio-6',
      category: 'auto',
      name: 'Renault Clio',
      badge: 'Permis B · AAC · Supervisée',
      description: 'Boîte manuelle, double commande et aides à la conduite récentes pour apprendre sereinement en ville comme sur route.',
      image: 'assets/clio-auto.jpg',
      visible: true
    },
    {
      id: 'kawasaki-z500',
      category: 'moto',
      name: 'Kawasaki Z500',
      badge: 'Permis A2 (Gros cube)',
      description: 'Roadster maniable et accessible, idéal pour maîtriser les épreuves plateau et prendre plaisir sur les routes du 04.',
      image: 'assets/kawasaki-z500.jpg',
      visible: true
    },
    {
      id: 'kawasaki-z125',
      category: 'moto',
      name: 'Kawasaki Z125',
      badge: 'Permis A1 (125 cm³)',
      description: 'Moto légère et rassurante pour débuter dès 16 ans en toute sécurité sur plateau et en circulation.',
      image: 'assets/kawasaki-z125.jpg',
      visible: true
    }
  ]
};

let activeSiteConfig = DEFAULT_SITE_CONFIG;

async function loadSiteConfig() {
  let merged = structuredClone(DEFAULT_SITE_CONFIG);
  try {
    const res = await fetch('config-site.json');
    if (res.ok) {
      const remote = await res.json();
      merged = { ...merged, ...remote };
    }
  } catch {
    // file:// fallback
  }

  try {
    const localRaw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (localRaw) {
      merged = { ...merged, ...JSON.parse(localRaw) };
    }
  } catch {
    // ignore
  }

  activeSiteConfig = merged;
  return merged;
}

// Form submission (Web3Forms when configured, otherwise clean demo mode)
const leadForm = document.getElementById('lead-form');
const formFeedback = document.getElementById('form-feedback');

if (leadForm && formFeedback) {
  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = leadForm.querySelector('button[type="submit"]');
    const name = document.getElementById('name')?.value.trim() || 'Merci';
    const phone = document.getElementById('phone')?.value.trim() || '';
    const formation = formationSelect?.value || 'votre formation';
    const message = document.getElementById('message')?.value.trim() || '';

    const key = activeSiteConfig.web3formsKey?.trim();

    if (key) {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours...';
      }
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: key,
            subject: `Nouvelle demande (${formation}) — ${name}`,
            from_name: 'Site Auto-École Bergé',
            name,
            phone,
            formation,
            message
          })
        });
        const data = await res.json();
        if (data.success) {
          formFeedback.textContent = `Merci ${name} ! Votre demande pour « ${formation} » a bien été envoyée à l'auto-école.`;
          formFeedback.classList.add('is-sent');
          leadForm.reset();
        } else {
          throw new Error(data.message || 'Erreur Web3Forms');
        }
      } catch {
        formFeedback.textContent = `Une erreur est survenue lors de l'envoi. Vous pouvez appeler directement le 04 92 72 06 94.`;
        formFeedback.classList.remove('is-sent');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Envoyer ma demande de rappel';
        }
      }
      return;
    }

    formFeedback.textContent = `Merci ${name} ! Demande enregistrée pour « ${formation} » (mode démo : ajoutez votre clé gratuite Web3Forms dans l'Espace Gérant pour recevoir les demandes par email).`;
    formFeedback.classList.add('is-sent');
    leadForm.reset();
  });
}

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
      img.alt = `${item.name} — Auto-École Bergé Manosque`;
      img.loading = 'lazy';
      media.appendChild(img);
    } else {
      media.innerHTML = `
        <div class="fleet-placeholder">
          <i data-lucide="image" width="24" height="24" aria-hidden="true"></i>
          <span>${item.name}</span>
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

function renderTarifs(container, tarifs, filterCategory = 'all') {
  container.innerHTML = '';
  const visible = tarifs.filter(
    (t) => t.visible !== false && (filterCategory === 'all' || t.category === filterCategory)
  );

  visible.forEach((t) => {
    const card = document.createElement('article');
    card.className = `tarif-card${t.highlighted ? ' is-highlighted' : ''}`;

    const badge = document.createElement('span');
    badge.className = 'card-badge';
    badge.textContent = t.highlighted ? 'Formule populaire' : t.category.toUpperCase();

    const title = document.createElement('h3');
    title.textContent = t.title;

    const price = document.createElement('div');
    price.className = 'tarif-price';
    price.textContent = t.price;

    const sub = document.createElement('p');
    sub.className = 'tarif-subtitle';
    sub.textContent = t.subtitle;

    const list = document.createElement('ul');
    list.className = 'mini-list';
    (t.features || []).forEach((feat) => {
      const li = document.createElement('li');
      li.textContent = feat;
      list.appendChild(li);
    });

    const cta = document.createElement('a');
    cta.className = `btn ${t.highlighted ? 'btn-accent' : 'btn-outline'} btn-full`;
    const formationParam =
      t.category === 'moto'
        ? 'Permis Moto (A1 / A2)'
        : t.category === 'code'
          ? 'Code de la route'
          : t.id === 'aac'
            ? 'Conduite Accompagnée (AAC)'
            : 'Permis B';
    cta.href = `contact.html?formation=${encodeURIComponent(formationParam)}#contact`;
    cta.textContent = 'Choisir cette formule';

    card.append(badge, title, price, sub, list, cta);
    container.appendChild(card);
  });
}

function renderFinancements(container, fin) {
  if (!container) return;
  const items = [];
  if (fin?.cpf) {
    items.push({
      icon: 'briefcase',
      title: 'Éligible CPF',
      desc: 'Utilisez votre Compte Personnel de Formation pour financer tout ou partie de votre permis (selon conditions en vigueur).'
    });
  }
  if (fin?.unEuro) {
    items.push({
      icon: 'piggy-bank',
      title: 'Permis à 1 € par jour',
      desc: 'Dispositif destiné aux 15–25 ans pour étaler le financement de la formation sans frais d’intérêt (sous réserve d’éligibilité).'
    });
  }
  if (fin?.plusieursFois) {
    items.push({
      icon: 'credit-card',
      title: 'Paiement en plusieurs fois',
      desc: 'Possibilité d’échelonner votre règlement directement au bureau selon le rythme de votre formation.'
    });
  }

  container.innerHTML = items
    .map(
      (item) => `
    <article class="finance-card">
      <div class="icon-box" style="margin-bottom: 0; flex-shrink: 0;" aria-hidden="true">
        <i data-lucide="${item.icon}" width="20" height="20"></i>
      </div>
      <div>
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
      </div>
    </article>
  `
    )
    .join('');
}

loadSiteConfig().then((config) => {
  const fleetContainers = document.querySelectorAll('[data-fleet-category]');
  const visibleVehicules = (config.vehicules || []).filter((v) => v.visible !== false);

  fleetContainers.forEach((container) => {
    const category = container.dataset.fleetCategory;
    const filtered = category === 'all' ? visibleVehicules : visibleVehicules.filter((v) => v.category === category);
    renderFleet(container, filtered);
  });

  const tarifsGrid = document.querySelector('[data-tarifs-grid]');
  if (tarifsGrid) {
    const defaultFilter = tarifsGrid.dataset.tarifsFilter || 'all';
    renderTarifs(tarifsGrid, config.tarifs || [], defaultFilter);

    document.querySelectorAll('[data-tarif-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-tarif-filter]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        renderTarifs(tarifsGrid, config.tarifs || [], btn.dataset.tarifFilter);
        initReveal();
      });
    });
  }

  const financeGrid = document.querySelector('[data-finance-grid]');
  if (financeGrid) {
    renderFinancements(financeGrid, config.financements || {});
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
  initReveal();
});

if (window.lucide) {
  window.lucide.createIcons();
}

// Legal Mentions Modal
const legalModal = document.getElementById('legal-modal');
document.querySelectorAll('[data-open-legal]').forEach((btn) => {
  btn.addEventListener('click', () => {
    legalModal?.classList.add('open');
  });
});

document.querySelectorAll('[data-close-legal]').forEach((btn) => {
  btn.addEventListener('click', () => {
    legalModal?.classList.remove('open');
  });
});

legalModal?.addEventListener('click', (e) => {
  if (e.target === legalModal) {
    legalModal.classList.remove('open');
  }
});

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
    '.section-head, .formation-card, .detail-card, .fleet-card, .pillar, .review-card, .info-item, .contact-form-wrap, .cta-banner, .orientation-box, .faq-item'
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
    { threshold: 0.1, rootMargin: '0px 0px -24px 0px' }
  );

  targets.forEach((el, index) => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
      const siblingIndex = el.parentElement
        ? Array.from(el.parentElement.children).indexOf(el)
        : index;
      el.style.setProperty('--reveal-delay', `${Math.min(siblingIndex * 65, 260)}ms`);
    }
    observer.observe(el);
  });
}

initReveal();
