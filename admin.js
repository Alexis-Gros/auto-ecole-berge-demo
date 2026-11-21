const CONFIG_STORAGE_KEY = 'berge_site_config_v1';

const DEFAULT_CONFIG = {
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
      image: '',
      visible: true
    },
    {
      id: 'kawasaki-z500',
      category: 'moto',
      name: 'Kawasaki Z500',
      badge: 'Permis A2 (Gros cube)',
      description: 'Roadster maniable et accessible, idéal pour maîtriser les épreuves plateau et prendre plaisir sur les routes du 04.',
      image: '',
      visible: true
    },
    {
      id: 'kawasaki-z125',
      category: 'moto',
      name: 'Kawasaki Z125',
      badge: 'Permis A1 (125 cm³)',
      description: 'Moto légère et rassurante pour débuter dès 16 ans en toute sécurité sur plateau et en circulation.',
      image: '',
      visible: true
    }
  ]
};

let currentConfig = structuredClone(DEFAULT_CONFIG);

async function loadInitialConfig() {
  try {
    const res = await fetch('config-site.json');
    if (res.ok) {
      const remote = await res.json();
      currentConfig = { ...DEFAULT_CONFIG, ...remote };
    }
  } catch {
    // fallback to DEFAULT_CONFIG on file://
  }

  try {
    const localRaw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (localRaw) {
      const local = JSON.parse(localRaw);
      currentConfig = { ...currentConfig, ...local };
    }
  } catch {
    // ignore
  }

  renderAdminUI();
}

function showToast(msg) {
  const toast = document.getElementById('admin-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

function saveConfigToLocal() {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(currentConfig));
  } catch {
    // ignore
  }
}

function renderTarifsAdmin() {
  const container = document.getElementById('admin-tarifs-list');
  if (!container) return;
  container.innerHTML = '';

  currentConfig.tarifs.forEach((tarif, idx) => {
    const card = document.createElement('div');
    card.className = 'admin-item-card';
    card.innerHTML = `
      <div class="admin-item-head">
        <strong>${tarif.title || 'Nouveau forfait'}</strong>
        <button type="button" class="btn btn-outline btn-sm" data-delete-tarif="${idx}">Supprimer</button>
      </div>
      <div class="admin-grid-3">
        <div class="form-group">
          <label>Nom du forfait</label>
          <input type="text" data-tarif-field="title" data-idx="${idx}" value="${escapeHtml(tarif.title)}" />
        </div>
        <div class="form-group">
          <label>Prix affiché</label>
          <input type="text" data-tarif-field="price" data-idx="${idx}" value="${escapeHtml(tarif.price)}" />
        </div>
        <div class="form-group">
          <label>Catégorie</label>
          <select data-tarif-field="category" data-idx="${idx}">
            <option value="auto" ${tarif.category === 'auto' ? 'selected' : ''}>Voiture (Auto / AAC)</option>
            <option value="moto" ${tarif.category === 'moto' ? 'selected' : ''}>Moto (A1 / A2)</option>
            <option value="code" ${tarif.category === 'code' ? 'selected' : ''}>Code</option>
          </select>
        </div>
      </div>
      <div class="form-group" style="margin-top: 0.85rem;">
        <label>Sous-titre court</label>
        <input type="text" data-tarif-field="subtitle" data-idx="${idx}" value="${escapeHtml(tarif.subtitle)}" />
      </div>
      <div class="form-group" style="margin-top: 0.85rem;">
        <label>Points inclus (1 ligne par point)</label>
        <textarea rows="3" data-tarif-features="${idx}">${escapeHtml((tarif.features || []).join('\n'))}</textarea>
      </div>
      <div class="admin-toggle-row">
        <label><input type="checkbox" data-tarif-bool="visible" data-idx="${idx}" ${tarif.visible !== false ? 'checked' : ''} /> Afficher sur le site</label>
        <label><input type="checkbox" data-tarif-bool="highlighted" data-idx="${idx}" ${tarif.highlighted ? 'checked' : ''} /> Mettre en avant</label>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('[data-tarif-field]').forEach((el) => {
    el.addEventListener('input', () => {
      const idx = Number(el.dataset.idx);
      currentConfig.tarifs[idx][el.dataset.tarifField] = el.value;
    });
  });

  container.querySelectorAll('[data-tarif-features]').forEach((el) => {
    el.addEventListener('input', () => {
      const idx = Number(el.dataset.tarifFeatures);
      currentConfig.tarifs[idx].features = el.value
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    });
  });

  container.querySelectorAll('[data-tarif-bool]').forEach((el) => {
    el.addEventListener('change', () => {
      const idx = Number(el.dataset.idx);
      currentConfig.tarifs[idx][el.dataset.tarifBool] = el.checked;
    });
  });

  container.querySelectorAll('[data-delete-tarif]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.deleteTarif);
      currentConfig.tarifs.splice(idx, 1);
      renderTarifsAdmin();
    });
  });
}

function renderVehiculesAdmin() {
  const container = document.getElementById('admin-vehicules-list');
  if (!container) return;
  container.innerHTML = '';

  currentConfig.vehicules.forEach((v, idx) => {
    const card = document.createElement('div');
    card.className = 'admin-item-card';
    card.innerHTML = `
      <div class="admin-item-head">
        <strong>${v.name || 'Nouveau véhicule'}</strong>
        <button type="button" class="btn btn-outline btn-sm" data-delete-veh="${idx}">Supprimer</button>
      </div>
      <div class="admin-grid-3">
        <div class="form-group">
          <label>Modèle</label>
          <input type="text" data-veh-field="name" data-idx="${idx}" value="${escapeHtml(v.name)}" />
        </div>
        <div class="form-group">
          <label>Badge / Permis</label>
          <input type="text" data-veh-field="badge" data-idx="${idx}" value="${escapeHtml(v.badge)}" />
        </div>
        <div class="form-group">
          <label>Catégorie</label>
          <select data-veh-field="category" data-idx="${idx}">
            <option value="auto" ${v.category === 'auto' ? 'selected' : ''}>Voiture</option>
            <option value="moto" ${v.category === 'moto' ? 'selected' : ''}>Moto</option>
          </select>
        </div>
      </div>
      <div class="admin-grid-2" style="margin-top: 0.85rem;">
        <div class="form-group">
          <label>Description</label>
          <textarea rows="2" data-veh-field="description" data-idx="${idx}">${escapeHtml(v.description)}</textarea>
        </div>
        <div class="form-group">
          <label>Chemin ou URL de la photo</label>
          <input type="text" data-veh-field="image" data-idx="${idx}" value="${escapeHtml(v.image || '')}" placeholder="Laisser vide ou coller l'URL d'une photo" />
        </div>
      </div>
      <div class="admin-toggle-row">
        <label><input type="checkbox" data-veh-bool="visible" data-idx="${idx}" ${v.visible !== false ? 'checked' : ''} /> Afficher sur le site</label>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('[data-veh-field]').forEach((el) => {
    el.addEventListener('input', () => {
      const idx = Number(el.dataset.idx);
      currentConfig.vehicules[idx][el.dataset.vehField] = el.value;
    });
  });

  container.querySelectorAll('[data-veh-bool]').forEach((el) => {
    el.addEventListener('change', () => {
      const idx = Number(el.dataset.idx);
      currentConfig.vehicules[idx][el.dataset.vehBool] = el.checked;
    });
  });

  container.querySelectorAll('[data-delete-veh]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.deleteVeh);
      currentConfig.vehicules.splice(idx, 1);
      renderVehiculesAdmin();
    });
  });
}

function renderReglagesAdmin() {
  const cpf = document.getElementById('fin-cpf');
  const unEuro = document.getElementById('fin-unEuro');
  const plusieursFois = document.getElementById('fin-plusieursFois');
  const w3 = document.getElementById('input-web3forms');

  if (cpf) {
    cpf.checked = Boolean(currentConfig.financements?.cpf);
    cpf.onchange = () => {
      currentConfig.financements.cpf = cpf.checked;
    };
  }
  if (unEuro) {
    unEuro.checked = Boolean(currentConfig.financements?.unEuro);
    unEuro.onchange = () => {
      currentConfig.financements.unEuro = unEuro.checked;
    };
  }
  if (plusieursFois) {
    plusieursFois.checked = Boolean(currentConfig.financements?.plusieursFois);
    plusieursFois.onchange = () => {
      currentConfig.financements.plusieursFois = plusieursFois.checked;
    };
  }
  if (w3) {
    w3.value = currentConfig.web3formsKey || '';
    w3.oninput = () => {
      currentConfig.web3formsKey = w3.value.trim();
    };
  }
}

function renderAdminUI() {
  renderTarifsAdmin();
  renderVehiculesAdmin();
  renderReglagesAdmin();
}

function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// Tabs
document.querySelectorAll('[data-admin-tab]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.adminTab;
    document.querySelectorAll('[data-admin-tab]').forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    document.querySelectorAll('.admin-panel').forEach((p) => p.classList.remove('active'));
    document.getElementById(`panel-${target}`)?.classList.add('active');
  });
});

// Add buttons
document.getElementById('btn-add-tarif')?.addEventListener('click', () => {
  currentConfig.tarifs.push({
    id: `forfait-${Date.now()}`,
    category: 'auto',
    title: 'Nouveau forfait',
    price: '0 €',
    subtitle: 'Description courte',
    features: ['Point 1', 'Point 2'],
    highlighted: false,
    visible: true
  });
  renderTarifsAdmin();
});

document.getElementById('btn-add-vehicule')?.addEventListener('click', () => {
  currentConfig.vehicules.push({
    id: `vehicule-${Date.now()}`,
    category: 'auto',
    name: 'Nouveau véhicule',
    badge: 'Permis B',
    description: 'Description du véhicule.',
    image: '',
    visible: true
  });
  renderVehiculesAdmin();
});

// Save & preview
document.getElementById('btn-save-preview')?.addEventListener('click', () => {
  saveConfigToLocal();
  showToast('Enregistré ! Ouverture du site...');
  setTimeout(() => {
    window.location.href = 'index.html#tarifs';
  }, 450);
});

// Export config-site.json
document.getElementById('btn-export-json')?.addEventListener('click', () => {
  saveConfigToLocal();
  const blob = new Blob([JSON.stringify(currentConfig, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'config-site.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Fichier config-site.json téléchargé !');
});

// Reset demo
document.getElementById('btn-reset-demo')?.addEventListener('click', () => {
  localStorage.removeItem(CONFIG_STORAGE_KEY);
  currentConfig = structuredClone(DEFAULT_CONFIG);
  renderAdminUI();
  showToast('Valeurs d’origine restaurées.');
});

loadInitialConfig();
