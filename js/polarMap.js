/* ===================================================================
   POLAR MAP - ANTARCTIC CONTINENTAL RADAR & VEHICLE TRACKER
   GPS Convoy Tracking, Ice Shelf Traverse, ETA & Cargo Telemetry
   =================================================================== */

class PolarMapViewer {
  constructor() {
    this.canvas = document.getElementById('polar-canvas');
    this.ctx = null;
    this.animationId = null;
    this.activeCargoFilter = 'all';

    // Rich initial Antarctic convoys with realistic cargo manifests
    this.convoys = [
      {
        id: 'convoy-food',
        name: 'Convoy Foxtrot (Pantry Resupply)',
        vehicleType: 'Kässbohrer Polar 400 (Insulated Cargo Sled)',
        cargoCategory: 'food',
        cargoIcon: '🥫',
        cargo: '1,800 Cans of Preserved Meat, Lentils & Emergency Food Rations',
        origin: 'Prydz Bay Sea Ice Pier',
        dest: 'Bharati Station',
        progress: 0.61, // 0.0 to 1.0 along route
        speedKmH: 21.0,
        totalDistKm: 48.0,
        remainingKm: 18.6,
        eta: '53 mins',
        status: 'EN_ROUTE',
        risk: 'LOW (Sea Ice Stable, -28°C)',
        pathNormalized: [
          { x: 0.82, y: 0.35, name: 'Prydz Bay Sea Ice Pier' },
          { x: 0.76, y: 0.44, name: 'Sea Ice Causeway Alpha' },
          { x: 0.70, y: 0.50, name: 'Larsemann Ridge Waypoint' },
          { x: 0.65, y: 0.53, name: 'Bharati Station' }
        ],
        currentPos: { x: 0, y: 0 },
        color: '#f59e0b'
      },
      {
        id: 'convoy-medicine',
        name: 'Traverse Med-Evac Delta',
        vehicleType: 'Arctic Hägglunds BV-206 (Climate-Controlled Medical Unit)',
        cargoCategory: 'medicine',
        cargoIcon: '💊',
        cargo: 'Critical Antibiotics, Blood Plasma, Insulin & Trauma Surgical Kits',
        origin: 'Novo Polar Runway / Airfield',
        dest: 'Maitri Station',
        progress: 0.52,
        speedKmH: 28.0,
        totalDistKm: 72.0,
        remainingKm: 34.2,
        eta: '1h 13m',
        status: 'EN_ROUTE',
        risk: 'NOMINAL (Smooth Blue Ice, -34°C)',
        pathNormalized: [
          { x: 0.28, y: 0.28, name: 'Novo Polar Runway' },
          { x: 0.33, y: 0.38, name: 'Nunatak Navigation Beacon' },
          { x: 0.37, y: 0.47, name: 'Schirmacher Ice Gap' },
          { x: 0.40, y: 0.55, name: 'Maitri Station' }
        ],
        currentPos: { x: 0, y: 0 },
        color: '#ef4444'
      },
      {
        id: 'convoy-fuel',
        name: 'Convoy Alpha (PB-300 Heavy Fuel)',
        vehicleType: 'Tracked PistenBully PB-300 + 4x Heated Fuel Bladders',
        cargoCategory: 'fuel',
        cargoIcon: '⚡',
        cargo: '12,000 L Arctic Jet A-1 Fuel + Heated Paraffin Trace Lines',
        origin: 'Coastal Depot (Dakshin Gangotri)',
        dest: 'Maitri Station',
        progress: 0.44,
        speedKmH: 18.5,
        totalDistKm: 98.0,
        remainingKm: 54.8,
        eta: '2h 58m',
        status: 'EN_ROUTE',
        risk: 'MODERATE (Blizzard Sector 2, 45kt Wind)',
        pathNormalized: [
          { x: 0.32, y: 0.32, name: 'Coastal Ice Depot' },
          { x: 0.35, y: 0.41, name: 'Crevasse Bypass Waypoint' },
          { x: 0.38, y: 0.49, name: 'Moraine South Gate' },
          { x: 0.40, y: 0.55, name: 'Maitri Station' }
        ],
        currentPos: { x: 0, y: 0 },
        color: '#00f2fe'
      },
      {
        id: 'convoy-science',
        name: 'Science Traverse Gamma',
        vehicleType: 'Polar Snowcat 250 (Cryogenic Science Carrier)',
        cargoCategory: 'science',
        cargoIcon: '🔬',
        cargo: '800m Deep Antarctic Ice Cores (-50°C Cryo Storage Chambers)',
        origin: 'Inland Plateau Glaciology Camp',
        dest: 'Bharati Station',
        progress: 0.36,
        speedKmH: 16.0,
        totalDistKm: 140.0,
        remainingKm: 89.0,
        eta: '5h 34m',
        status: 'EN_ROUTE',
        risk: 'EXTREME COLD (-48°C, Sastrugi Ridges)',
        pathNormalized: [
          { x: 0.55, y: 0.82, name: 'Polar Plateau Deep Camp' },
          { x: 0.59, y: 0.70, name: 'Sastrugi Field Waypoint 1' },
          { x: 0.62, y: 0.61, name: 'Continental Ice Transition' },
          { x: 0.65, y: 0.53, name: 'Bharati Station' }
        ],
        currentPos: { x: 0, y: 0 },
        color: '#a855f7'
      },
      {
        id: 'convoy-spares',
        name: 'Logistics Echo (Engineering Spares)',
        vehicleType: 'Heavy All-Terrain Transporter 8x8',
        cargoCategory: 'spares',
        cargoIcon: '⚙',
        cargo: 'Caterpillar DG-1 Turbos, Glycol Heating Coils & Heavy Bearings',
        origin: 'Expedition Vessel Ivan Papanin',
        dest: 'Bharati Station',
        progress: 0.72,
        speedKmH: 24.0,
        totalDistKm: 36.0,
        remainingKm: 10.1,
        eta: '25 mins',
        status: 'APPROACHING',
        risk: 'LOW (Clear Visibility 15km)',
        pathNormalized: [
          { x: 0.80, y: 0.38, name: 'Ice Shelf Berthing Pier' },
          { x: 0.74, y: 0.46, name: 'Shoreline Ramp' },
          { x: 0.65, y: 0.53, name: 'Bharati Station' }
        ],
        currentPos: { x: 0, y: 0 },
        color: '#10b981'
      }
    ];

    this.selectedConvoy = this.convoys[0]; // Default to food cans convoy
    this.blizzardZoneNormalized = { x: 0.36, y: 0.42, radiusPct: 0.08, severity: 'Katabatic 65 kt' };
  }

  init() {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.bindEvents();
    this.renderConvoyList();
    this.updateHUD();
    this.updateTelemetryCard();
    this.startAnimationLoop();
  }

  resizeCanvas() {
    if (!this.canvas || !this.canvas.parentElement) return;
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight || 480;
  }

  bindEvents() {
    // 1. Cargo filter ribbon buttons
    const filterBtns = document.querySelectorAll('.cargo-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cargoType = btn.dataset.cargo;
        this.filterByCargo(cargoType);
      });
    });

    // 2. Interactive Radar Search Input & Button
    const searchBtn = document.getElementById('btn-radar-cargo-search');
    const searchInput = document.getElementById('radar-cargo-input');

    if (searchBtn && searchInput) {
      const executeSearch = () => {
        const query = searchInput.value.trim();
        if (query) {
          this.searchCargoQuery(query);
        }
      };

      searchBtn.addEventListener('click', executeSearch);
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') executeSearch();
      });
    }

    // 3. Quick Query Hint Chips
    document.querySelectorAll('.radar-hint-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.dataset.query;
        if (searchInput) searchInput.value = q;
        this.searchCargoQuery(q);
      });
    });

    // 4. Dispatch Distance Slider sync
    const distSlider = document.getElementById('convoy-input-distance');
    const distVal = document.getElementById('val-convoy-distance');
    if (distSlider && distVal) {
      distSlider.addEventListener('input', (e) => {
        distVal.textContent = `${e.target.value} km`;
      });
    }
  }

  /* -----------------------------------------------------------------
     FILTER & SEARCH LOGIC (Where is the food cans / medicine moving?)
     ----------------------------------------------------------------- */
  filterByCargo(cargoCategory) {
    this.activeCargoFilter = cargoCategory;

    if (cargoCategory === 'all') {
      this.renderConvoyList();
      this.updateHUD();
      this.updateTelemetryCard();
      return;
    }

    // Find convoy matching cargo
    let match = this.convoys.find(c => c.cargoCategory === cargoCategory);

    // If none exists, auto-dispatch a representative convoy for this cargo
    if (!match) {
      match = this.createDefaultCargoConvoy(cargoCategory);
      this.convoys.unshift(match);
    }

    this.selectedConvoy = match;
    this.renderConvoyList();
    this.updateHUD();
    this.updateTelemetryCard();

    // Voice announcement
    if (window.voiceAlerts) {
      const msg = `Tracking ${match.cargoCategory} cargo. ${match.name} is moving, ${match.remainingKm} kilometers from ${match.dest}. Estimated arrival in ${match.eta}.`;
      window.voiceAlerts.speak(msg, "normal");
    }
  }

  searchCargoQuery(queryStr) {
    const q = queryStr.toLowerCase();
    let targetCategory = null;

    if (q.includes('food') || q.includes('can') || q.includes('ration') || q.includes('pantry') || q.includes('meal')) {
      targetCategory = 'food';
    } else if (q.includes('med') || q.includes('drug') || q.includes('trauma') || q.includes('blood') || q.includes('health') || q.includes('serum')) {
      targetCategory = 'medicine';
    } else if (q.includes('fuel') || q.includes('diesel') || q.includes('jet') || q.includes('oil') || q.includes('tanker')) {
      targetCategory = 'fuel';
    } else if (q.includes('ice') || q.includes('core') || q.includes('sample') || q.includes('science') || q.includes('cryo')) {
      targetCategory = 'science';
    } else if (q.includes('spare') || q.includes('part') || q.includes('generator') || q.includes('turbo') || q.includes('dg')) {
      targetCategory = 'spares';
    } else if (q.includes('water') || q.includes('snowmelt') || q.includes('potable')) {
      targetCategory = 'water';
    }

    // Check if query directly named a convoy
    let match = null;
    if (targetCategory) {
      match = this.convoys.find(c => c.cargoCategory === targetCategory);
      // Highlight matching filter button
      document.querySelectorAll('.cargo-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cargo === targetCategory);
      });
    } else {
      match = this.convoys.find(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
    }

    if (!match && targetCategory) {
      match = this.createDefaultCargoConvoy(targetCategory);
      this.convoys.unshift(match);
    }

    if (match) {
      this.selectedConvoy = match;
      this.activeCargoFilter = targetCategory || 'all';
      this.renderConvoyList();
      this.updateHUD();
      this.updateTelemetryCard();

      if (window.voiceAlerts) {
        window.voiceAlerts.speak(`Target acquired on radar. ${match.name} transporting ${match.cargo}. Distance remaining ${match.remainingKm} kilometers at ${match.speedKmH} kilometers per hour.`, "normal");
      }
    } else {
      // General feedback
      if (window.voiceAlerts) {
        window.voiceAlerts.speak(`Scanning polar radar sector. Tracking ${this.convoys.length} active overland traverse vehicles.`, "normal");
      }
    }
  }

  createDefaultCargoConvoy(category) {
    const configs = {
      food: {
        name: 'Convoy Foxtrot (Pantry Resupply)',
        vehicleType: 'Kässbohrer Polar 400 (Insulated Sled)',
        cargoIcon: '🥫',
        cargo: '1,800 Cans of Preserved Meat, Lentils & Emergency Food Rations',
        origin: 'Prydz Bay Sea Ice Pier',
        dest: 'Bharati Station',
        dist: 48,
        speed: 21,
        color: '#f59e0b'
      },
      medicine: {
        name: 'Traverse Med-Evac Delta',
        vehicleType: 'Arctic Hägglunds BV-206 (Medical Unit)',
        cargoIcon: '💊',
        cargo: 'Critical Antibiotics, Blood Plasma, Insulin & Trauma Surgical Kits',
        origin: 'Novo Polar Runway',
        dest: 'Maitri Station',
        dist: 72,
        speed: 28,
        color: '#ef4444'
      },
      fuel: {
        name: 'Convoy Alpha (PB-300 Heavy Fuel)',
        vehicleType: 'Tracked PistenBully PB-300 + 4x Fuel Bladders',
        cargoIcon: '⚡',
        cargo: '12,000 L Arctic Jet A-1 Fuel + Heated Paraffin Trace Lines',
        origin: 'Coastal Depot (Dakshin Gangotri)',
        dest: 'Maitri Station',
        dist: 98,
        speed: 18.5,
        color: '#00f2fe'
      },
      science: {
        name: 'Science Traverse Gamma',
        vehicleType: 'Polar Snowcat 250 (Cryo Science Carrier)',
        cargoIcon: '🔬',
        cargo: '800m Deep Antarctic Ice Cores (-50°C Cryo Storage Chambers)',
        origin: 'Polar Plateau Glaciology Camp',
        dest: 'Bharati Station',
        dist: 140,
        speed: 16,
        color: '#a855f7'
      },
      spares: {
        name: 'Logistics Echo (Engineering Spares)',
        vehicleType: 'Heavy All-Terrain Transporter 8x8',
        cargoIcon: '⚙',
        cargo: 'Caterpillar DG-1 Turbos, Glycol Heating Coils & Heavy Bearings',
        origin: 'Supply Vessel Ivan Papanin',
        dest: 'Bharati Station',
        dist: 36,
        speed: 24,
        color: '#10b981'
      },
      water: {
        name: 'Convoy Hydro (Potable Melt Tanker)',
        vehicleType: 'Polar Tanker Hauler PB-200',
        cargoIcon: '💧',
        cargo: '6,000 L Heated Potable Snowmelt Water',
        origin: 'Priyadarshini Lake Pumping Head',
        dest: 'Maitri Station',
        dist: 22,
        speed: 19,
        color: '#38bdf8'
      }
    };

    const cfg = configs[category] || configs.food;
    const initialRemaining = Math.round(cfg.dist * 0.45 * 10) / 10;
    const mins = Math.round((initialRemaining / cfg.speed) * 60);

    return {
      id: `convoy-${category}-${Date.now()}`,
      name: cfg.name,
      vehicleType: cfg.vehicleType,
      cargoCategory: category,
      cargoIcon: cfg.cargoIcon,
      cargo: cfg.cargo,
      origin: cfg.origin,
      dest: cfg.dest,
      progress: 0.55,
      speedKmH: cfg.speed,
      totalDistKm: cfg.dist,
      remainingKm: initialRemaining,
      eta: mins < 60 ? `${mins} mins` : `${Math.floor(mins / 60)}h ${mins % 60}m`,
      status: 'EN_ROUTE',
      risk: 'NOMINAL (GPS Locked)',
      pathNormalized: [
        { x: 0.30, y: 0.30, name: cfg.origin },
        { x: 0.35, y: 0.42, name: 'Midway Beacon' },
        { x: 0.40, y: 0.55, name: cfg.dest }
      ],
      currentPos: { x: 0, y: 0 },
      color: cfg.color
    };
  }

  /* -----------------------------------------------------------------
     LIVE UI UPDATES: TELEMETRY CARD & CONVOY LIST
     ----------------------------------------------------------------- */
  updateTelemetryCard() {
    const c = this.selectedConvoy;
    if (!c) return;

    const iconEl = document.getElementById('telemetry-vehicle-icon');
    const nameEl = document.getElementById('telemetry-vehicle-name');
    const descEl = document.getElementById('telemetry-cargo-desc');
    const distEl = document.getElementById('telemetry-distance-val');
    const etaEl = document.getElementById('telemetry-eta-val');
    const speedEl = document.getElementById('telemetry-speed-val');
    const barEl = document.getElementById('telemetry-progress-bar');
    const coordsEl = document.getElementById('telemetry-coords');
    const statusEl = document.getElementById('telemetry-vehicle-status');

    if (iconEl) iconEl.textContent = c.cargoIcon || '🚜';
    if (nameEl) nameEl.textContent = c.name;
    if (descEl) descEl.textContent = c.cargo;
    if (distEl) {
      distEl.innerHTML = `<strong>${c.remainingKm} km left</strong> <span style="font-size:0.72rem; color:#94a3b8;">/ ${c.totalDistKm} km total</span>`;
    }
    if (etaEl) etaEl.textContent = c.eta;
    if (speedEl) speedEl.textContent = `${c.speedKmH} km/h // ${c.vehicleType}`;
    if (barEl) {
      const pct = Math.min(100, Math.max(5, Math.round(c.progress * 100)));
      barEl.style.width = `${pct}%`;
    }
    if (coordsEl) {
      const lat = (69.4 + c.progress * 1.3).toFixed(3);
      const lon = (76.2 - c.progress * 1.8).toFixed(3);
      coordsEl.textContent = `GPS: ${lat}°S, ${lon}°E // MOVING // DEST: ${c.dest.toUpperCase()}`;
    }
    if (statusEl) {
      statusEl.textContent = `${c.status} (MOVING)`;
      statusEl.style.color = '#10b981';
    }
  }

  renderConvoyList() {
    const listContainer = document.querySelector('.polar-convoy-list');
    if (!listContainer) return;

    const filtered = (this.activeCargoFilter && this.activeCargoFilter !== 'all')
      ? this.convoys.filter(c => c.cargoCategory === this.activeCargoFilter)
      : this.convoys;

    let html = `
      <div style="font-size: 0.72rem; font-family: var(--font-display); font-weight: bold; color: #94a3b8; letter-spacing: 0.8px; margin-bottom: 6px; display:flex; justify-content:space-between; align-items:center;">
        <span>ACTIVE TRAVERSE CONVOYS (${filtered.length})</span>
        <span style="color:var(--polar-cyan); font-size:0.65rem;">LIVE RADAR</span>
      </div>
    `;

    filtered.forEach(c => {
      const isAct = this.selectedConvoy && this.selectedConvoy.id === c.id;
      html += `
        <div class="convoy-card ${isAct ? 'active' : ''}" data-convoy="${c.id}" style="cursor:pointer; border-left: 3px solid ${c.color}; margin-bottom:6px;">
          <div class="convoy-header-row">
            <span class="convoy-name">${c.cargoIcon || '🚜'} ${c.name}</span>
            <span class="convoy-status-tag" style="background:${c.status.includes('EN_ROUTE') ? 'rgba(0,242,254,0.15)' : 'rgba(16,185,129,0.15)'}; color:${c.status.includes('EN_ROUTE') ? '#00f2fe' : '#10b981'}; font-size:0.68rem; padding:2px 6px; border-radius:3px;">${c.status}</span>
          </div>
          <div class="convoy-details" style="font-size:0.73rem; color:#cbd5e1; margin-top:3px;">
            <div style="grid-column: span 2; color:#fde68a;"><strong>${c.cargo}</strong></div>
            <div>Speed: <strong>${c.speedKmH} km/h</strong></div>
            <div>ETA: <strong style="color:var(--polar-cyan)">${c.eta}</strong> (${c.remainingKm} km)</div>
          </div>
        </div>
      `;
    });

    listContainer.innerHTML = html;

    listContainer.querySelectorAll('.convoy-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.convoy;
        this.selectedConvoy = this.convoys.find(c => c.id === id) || this.convoys[0];
        this.renderConvoyList();
        this.updateHUD();
        this.updateTelemetryCard();

        if (window.voiceAlerts && this.selectedConvoy) {
          window.voiceAlerts.speak(`Selected ${this.selectedConvoy.name}. Carrying ${this.selectedConvoy.cargo}. Remaining distance: ${this.selectedConvoy.remainingKm} kilometers.`, "normal");
        }
      });
    });
  }

  updateHUD() {
    const c = this.selectedConvoy;
    if (!c) return;
    const hud = document.getElementById('map-hud-convoy');
    if (hud) {
      hud.innerHTML = `
        <div class="hud-title">LOGISTICS TRACKING // ${c.cargoIcon || '🚜'} ${c.name}</div>
        <div>VEHICLE: ${c.vehicleType}</div>
        <div>ROUTE: ${c.origin} ➔ ${c.dest}</div>
        <div>CARGO: <span style="color:#fcd34d">${c.cargo}</span></div>
        <div>DISTANCE & ETA: <span style="color:#00f2fe; font-weight:bold;">${c.remainingKm} km remaining</span> | Moving at ${c.speedKmH} km/h (ETA: ${c.eta})</div>
        <div>CORRIDOR RISK: <span style="color:${c.risk.includes('BLIZZARD') || c.risk.includes('EXTREME') ? '#ef4444' : c.risk.includes('MODERATE') ? '#f59e0b' : '#10b981'}">${c.risk}</span></div>
      `;
    }
  }

  /* -----------------------------------------------------------------
     DISPATCH NEW CONVOY WITH CUSTOM DISTANCE & CARGO
     ----------------------------------------------------------------- */
  dispatchUserConvoy({ name, vehicleType, origin, dest, cargo, cargoCategory, cargoAmount, speedKmH, totalDistKm }) {
    const id = 'convoy-' + Date.now();
    const colors = ['#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6', '#f97316'];
    const assignedColor = colors[this.convoys.length % colors.length];

    const dist = parseFloat(totalDistKm) || 65.0;
    const speed = parseFloat(speedKmH) || 22.0;
    const mins = Math.round((dist / speed) * 60);
    const etaStr = mins < 60 ? `${mins} mins` : `${Math.floor(mins / 60)}h ${mins % 60}m`;

    let pathNormalized = [];
    if (dest && dest.toLowerCase().includes('maitri')) {
      pathNormalized = [
        { x: 0.30, y: 0.30, name: origin || 'Coastal Ice Depot' },
        { x: 0.33, y: 0.39, name: 'Nunatak Traverse Beacon' },
        { x: 0.37, y: 0.48, name: 'Moraine Gap' },
        { x: 0.40, y: 0.55, name: 'Maitri Station' }
      ];
    } else {
      pathNormalized = [
        { x: 0.82, y: 0.36, name: origin || 'Prydz Bay Pier' },
        { x: 0.75, y: 0.45, name: 'Sea Ice Causeway' },
        { x: 0.65, y: 0.53, name: 'Bharati Station' }
      ];
    }

    const icons = {
      food: '🥫',
      medicine: '💊',
      fuel: '⚡',
      science: '🔬',
      spares: '⚙',
      water: '💧'
    };

    const newConvoy = {
      id,
      name: name || `Convoy Echo-${this.convoys.length + 1}`,
      vehicleType: vehicleType || 'Tracked Arctic PistenBully PB-300',
      cargoCategory: cargoCategory || 'food',
      cargoIcon: icons[cargoCategory] || '🚜',
      origin: origin || 'Coastal Depot',
      dest: dest || 'Bharati Station',
      cargo: cargo || '2,000 Cans Canned Protein & Winter Rations',
      cargoAmount: parseFloat(cargoAmount) || 2000,
      progress: 0.05,
      speedKmH: speed,
      totalDistKm: dist,
      remainingKm: dist,
      eta: etaStr,
      status: 'EN_ROUTE',
      risk: 'NOMINAL (Fresh Track Active)',
      pathNormalized,
      currentPos: { x: 0, y: 0 },
      color: assignedColor
    };

    this.convoys.unshift(newConvoy);
    this.selectedConvoy = newConvoy;
    this.renderConvoyList();
    this.updateHUD();
    this.updateTelemetryCard();

    if (window.voiceAlerts) {
      window.voiceAlerts.speak(`Logistics directive executed. ${newConvoy.name} dispatched with ${newConvoy.cargo} from ${dist} kilometers out. ETA ${etaStr}.`, "normal");
    }

    return newConvoy;
  }

  rerouteSelectedConvoy() {
    if (!this.selectedConvoy) return;
    const c = this.selectedConvoy;
    c.pathNormalized = [
      { x: 0.30, y: 0.30, name: 'Coastal Ice Depot' },
      { x: 0.26, y: 0.40, name: 'Elevated Blue Ice Ridge (Blizzard Bypass)' },
      { x: 0.34, y: 0.50, name: 'Ridge Descent Valley' },
      { x: 0.40, y: 0.55, name: 'Maitri Station' }
    ];
    c.risk = 'LOW (Blizzard Bypassed via Ridge)';
    c.speedKmH = Math.min(35, +(c.speedKmH + 3).toFixed(1));
    this.updateHUD();
    this.updateTelemetryCard();
    this.renderConvoyList();

    if (window.voiceAlerts) {
      window.voiceAlerts.speak(`Convoy reroute approved. ${c.name} navigating elevated blue ice corridor around katabatic storm.`, "normal");
    }
  }

  adjustSelectedConvoySpeed(newSpeed) {
    if (!this.selectedConvoy) return;
    this.selectedConvoy.speedKmH = Math.max(5, Math.min(60, parseFloat(newSpeed)));
    const mins = Math.round((this.selectedConvoy.remainingKm / this.selectedConvoy.speedKmH) * 60);
    this.selectedConvoy.eta = mins < 60 ? `${mins} mins` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
    this.updateHUD();
    this.updateTelemetryCard();
    this.renderConvoyList();
  }

  /* -----------------------------------------------------------------
     ANIMATION LOOP & DYNAMIC REAL-TIME MOVEMENT
     ----------------------------------------------------------------- */
  startAnimationLoop() {
    let t = 0;
    let lastUiUpdate = 0;

    const render = () => {
      t += 0.015;
      this.updateConvoyPositions();
      this.drawRadar(t);

      // Periodically refresh HUD and Telemetry card to reflect updating km and ETA
      if (t - lastUiUpdate > 0.4) {
        lastUiUpdate = t;
        this.updateTelemetryCard();
        // Also update remainingKm in convoy cards in DOM without rebuilding whole list
        const activeCard = document.querySelector(`.convoy-card.active`);
        if (activeCard && this.selectedConvoy) {
          const detailEta = activeCard.querySelector('.convoy-details div:last-child');
          if (detailEta) {
            detailEta.innerHTML = `ETA: <strong style="color:var(--polar-cyan)">${this.selectedConvoy.eta}</strong> (${this.selectedConvoy.remainingKm} km)`;
          }
        }
      }

      this.animationId = requestAnimationFrame(render);
    };
    this.animationId = requestAnimationFrame(render);
  }

  updateConvoyPositions() {
    const w = this.canvas ? this.canvas.width : 800;
    const h = this.canvas ? this.canvas.height : 480;

    this.convoys.forEach(c => {
      if (c.status === 'EN_ROUTE' || c.status === 'APPROACHING') {
        // Continuous movement along route
        const progressIncrement = 0.00035 * (c.speedKmH / 20.0);
        c.progress += progressIncrement;

        if (c.progress >= 0.98) {
          c.progress = 0.06; // Loop journey for continuous live simulation
        }

        // Interpolate along waypoints using normalized coordinates
        const totalSegments = c.pathNormalized.length - 1;
        const scaled = c.progress * totalSegments;
        const segIdx = Math.min(Math.floor(scaled), totalSegments - 1);
        const frac = scaled - segIdx;

        const p1 = c.pathNormalized[segIdx];
        const p2 = c.pathNormalized[segIdx + 1];

        const normX = p1.x + (p2.x - p1.x) * frac;
        const normY = p1.y + (p2.y - p1.y) * frac;

        c.currentPos.x = normX * w;
        c.currentPos.y = normY * h;

        // Calculate heading angle
        c.heading = Math.atan2((p2.y - p1.y) * h, (p2.x - p1.x) * w);

        // Update remaining km and ETA
        c.remainingKm = Math.max(0.1, +(c.totalDistKm * (1 - c.progress)).toFixed(1));
        const minsLeft = Math.round((c.remainingKm / c.speedKmH) * 60);
        if (minsLeft < 60) {
          c.eta = `${minsLeft} mins`;
        } else {
          const hrs = Math.floor(minsLeft / 60);
          const mins = minsLeft % 60;
          c.eta = `${hrs}h ${mins}m`;
        }
      }
    });
  }

  /* -----------------------------------------------------------------
     RADAR CANVAS RENDERING
     ----------------------------------------------------------------- */
  drawRadar(t) {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Radar Grid Circles
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
    ctx.lineWidth = 1;
    const cx = w * 0.5;
    const cy = h * 0.52;

    for (let r = 70; r < Math.max(w, h); r += 70) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Radial spokes
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * w, cy + Math.sin(angle) * w);
      ctx.stroke();
    }

    // 2. Continental Coastline of East Antarctica (Queen Maud Land to Prydz Bay)
    ctx.fillStyle = 'rgba(15, 28, 54, 0.6)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.85);
    ctx.bezierCurveTo(w * 0.2, h * 0.45, w * 0.35, h * 0.38, w * 0.5, h * 0.45);
    ctx.bezierCurveTo(w * 0.65, h * 0.5, w * 0.75, h * 0.35, w * 0.9, h * 0.75);
    ctx.lineTo(w * 0.95, h * 0.95);
    ctx.lineTo(w * 0.05, h * 0.95);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Katabatic Blizzard Hazard Area
    const pulse = (Math.sin(t * 2) + 1) * 0.5;
    const bzX = this.blizzardZoneNormalized.x * w;
    const bzY = this.blizzardZoneNormalized.y * h;
    const bzR = this.blizzardZoneNormalized.radiusPct * Math.min(w, h);

    ctx.fillStyle = `rgba(239, 68, 68, ${0.1 + pulse * 0.08})`;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(bzX, bzY, bzR + pulse * 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#fca5a5';
    ctx.font = 'bold 10px "Space Grotesk"';
    ctx.fillText('⚠ KATABATIC BLIZZARD CORRIDOR (65 kts)', bzX - 90, bzY - bzR - 8);

    // 4. Stations Placed on Map
    // Maitri Station
    const maitriX = 0.40 * w;
    const maitriY = 0.55 * h;
    ctx.fillStyle = '#ff9933';
    ctx.beginPath();
    ctx.arc(maitriX, maitriY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Rajdhani"';
    ctx.fillText('MAITRI STATION (70°45′S)', maitriX + 12, maitriY - 8);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px "JetBrains Mono"';
    ctx.fillText('Schirmacher Oasis Base', maitriX + 12, maitriY + 6);

    // Bharati Station
    const bharatiX = 0.65 * w;
    const bharatiY = 0.53 * h;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(bharatiX, bharatiY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Rajdhani"';
    ctx.fillText('BHARATI STATION (69°24′S)', bharatiX - 150, bharatiY - 8);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px "JetBrains Mono"';
    ctx.fillText('Larsemann Hills (Prydz Bay)', bharatiX - 150, bharatiY + 6);

    // 5. Convoy Routes, Waypoints & Moving Vehicles
    this.convoys.forEach(c => {
      const isSelected = this.selectedConvoy && this.selectedConvoy.id === c.id;

      // Draw dashed trajectory route
      ctx.strokeStyle = isSelected ? c.color : c.color + '66';
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.setLineDash(isSelected ? [8, 4] : [4, 4]);
      ctx.beginPath();
      c.pathNormalized.forEach((pt, idx) => {
        const px = pt.x * w;
        const py = pt.y * h;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Waypoints
      c.pathNormalized.forEach((pt, idx) => {
        const px = pt.x * w;
        const py = pt.y * h;
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.arc(px, py, idx === 0 || idx === c.pathNormalized.length - 1 ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Vehicle Current Moving Position
      const vx = c.currentPos.x;
      const vy = c.currentPos.y;

      // Moving ripple rings
      ctx.fillStyle = c.color + (isSelected ? '44' : '22');
      ctx.beginPath();
      ctx.arc(vx, vy, 16 + Math.sin(t * 5) * 4, 0, Math.PI * 2);
      ctx.fill();

      // Vehicle marker circle/box
      ctx.fillStyle = '#060d1d';
      ctx.beginPath();
      ctx.arc(vx, vy, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Cargo Icon rendered directly onto the vehicle!
      ctx.font = '12px "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.cargoIcon || '🚜', vx, vy);

      // Reset alignment
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      // Heading direction arrow
      if (c.heading !== undefined) {
        ctx.save();
        ctx.translate(vx, vy);
        ctx.rotate(c.heading);
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.lineTo(8, -4);
        ctx.lineTo(8, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // If selected: Draw Tactical Target Reticle with distance banner
      if (isSelected) {
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 1.5;
        const retSize = 22 + Math.sin(t * 4) * 2;

        // 4 corner brackets
        ctx.beginPath();
        // Top-left
        ctx.moveTo(vx - retSize, vy - retSize + 6);
        ctx.lineTo(vx - retSize, vy - retSize);
        ctx.lineTo(vx - retSize + 6, vy - retSize);
        // Top-right
        ctx.moveTo(vx + retSize - 6, vy - retSize);
        ctx.lineTo(vx + retSize, vy - retSize);
        ctx.lineTo(vx + retSize, vy - retSize + 6);
        // Bottom-left
        ctx.moveTo(vx - retSize, vy + retSize - 6);
        ctx.lineTo(vx - retSize, vy + retSize);
        ctx.lineTo(vx - retSize + 6, vy + retSize);
        // Bottom-right
        ctx.moveTo(vx + retSize - 6, vy + retSize);
        ctx.lineTo(vx + retSize, vy + retSize);
        ctx.lineTo(vx + retSize, vy + retSize - 6);
        ctx.stroke();

        // Pulsing Target Lock Label
        ctx.fillStyle = '#00f2fe';
        ctx.font = 'bold 11px "Space Grotesk"';
        ctx.fillText(`TARGET LOCKED // ${c.remainingKm} km left (${c.eta})`, vx + 16, vy - 14);
      }

      // Tactical Vehicle & Cargo Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "Space Grotesk"';
      ctx.fillText(`${c.cargoIcon || ''} ${c.name}`, vx + 16, vy + 4);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '9px "JetBrains Mono"';
      ctx.fillText(`Distance: ${c.remainingKm} km | Speed: ${c.speedKmH} km/h`, vx + 16, vy + 16);
    });

    // 6. Sweeping Polar Radar Beam
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.8);
    const grad = ctx.createLinearGradient(0, 0, 300, 300);
    grad.addColorStop(0, 'rgba(0, 242, 254, 0.22)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, Math.max(w, h), 0, Math.PI / 4.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

window.polarMap = new PolarMapViewer();
