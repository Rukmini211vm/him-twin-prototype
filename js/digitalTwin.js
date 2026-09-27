/* ===================================================================
   DIGITAL TWIN - 2.5D & BLUEPRINT INFRASTRUCTURE RENDERER
   Interactive Multi-Level Architecture for Bharati & Maitri
   =================================================================== */

class DigitalTwinViewer {
  constructor() {
    this.container = document.getElementById('twin-svg-stage');
    this.activeLevel = 'all';
    this.selectedZone = null;

    // Component database for Bharati & Maitri
    this.components = {
      // Bharati components
      'bht_dg_bay': {
        id: 'bht_dg_bay',
        name: 'Generator & Power Bay (DG 1-3)',
        station: 'bharati',
        level: 'level0',
        health: 96,
        status: 'Operational',
        sensors: [
          { label: 'DG-1 Active Output', val: '68.0 kW', status: 'nominal' },
          { label: 'Exhaust Temperature', val: '412 °C', status: 'nominal' },
          { label: 'Lube Oil Pressure', val: '4.8 bar', status: 'nominal' },
          { label: 'Bearing Vibration', val: '1.4 mm/s', status: 'nominal' },
          { label: 'Fuel Flow Rate', val: '18.2 L/h', status: 'nominal' }
        ],
        description: 'Triple redundancy Caterpillar 3406 polar diesel generators in acoustic isolation enclosure with heat recovery loop feeding station hydronic central heating.'
      },
      'bht_fuel_bay': {
        id: 'bht_fuel_bay',
        name: 'Fuel Storage & Transfer Manifold',
        station: 'bharati',
        level: 'level0',
        health: 92,
        status: 'Nominal',
        sensors: [
          { label: 'Fuel In-Tank Temp', val: '-8.4 °C', status: 'nominal' },
          { label: 'Reserve Level', val: '48,500 L (80.8%)', status: 'nominal' },
          { label: 'Fuel Sump Sensor', val: '0.00 Dry', status: 'nominal' },
          { label: 'Transfer Pump #1', val: 'STANDBY', status: 'nominal' }
        ],
        description: 'Double-walled insulated Arctic Jet A-1 fuel tanks with heated trace lines to prevent paraffin wax precipitation at extreme sub-zero temperatures.'
      },
      'bht_water_snowmelt': {
        id: 'bht_water_snowmelt',
        name: 'Snow Melt & Potable Water Plant',
        station: 'bharati',
        level: 'level0',
        health: 94,
        status: 'Active Circulation',
        sensors: [
          { label: 'Potable Buffer Tank', val: '16,400 L', status: 'nominal' },
          { label: 'Line Trace Temp', val: '+4.8 °C', status: 'nominal' },
          { label: 'UV Sterilization', val: 'ACTIVE 99.8%', status: 'nominal' },
          { label: 'Daily Consumption', val: '850 L/d', status: 'nominal' }
        ],
        description: 'Automated thermal snow melting pit coupled with multi-stage filtration and UV purification for drinking water sustainability.'
      },
      'bht_labs_main': {
        id: 'bht_labs_main',
        name: 'Atmospheric Sciences & Cryosphere Labs',
        station: 'bharati',
        level: 'level1',
        health: 99,
        status: 'Active Experiments',
        sensors: [
          { label: 'Indoor Temp', val: '+21.2 °C', status: 'nominal' },
          { label: 'Cleanroom Humidity', val: '34%', status: 'nominal' },
          { label: 'Spectrometer Bus', val: 'DATA OK', status: 'nominal' },
          { label: 'Laser Radar (LIDAR)', val: 'PULSING', status: 'nominal' }
        ],
        description: 'State-of-the-art laboratories for upper atmospheric physics, ice core stratigraphy, and geomagnetism.'
      },
      'bht_med_center': {
        id: 'bht_med_center',
        name: 'Medical Infirmary & Telemedicine ICU',
        station: 'bharati',
        level: 'level1',
        health: 100,
        status: 'Ready',
        sensors: [
          { label: 'Medical Oxygen Line', val: '4.2 bar', status: 'nominal' },
          { label: 'Defibrillator Battery', val: '100% OK', status: 'nominal' },
          { label: 'Telemedicine Satellite Link', val: 'STANDBY 12Mbps', status: 'nominal' },
          { label: 'Room Air Exchange', val: '6.2 ACH', status: 'nominal' }
        ],
        description: 'Fully equipped polar emergency medical center with surgical capability, hyperbaric treatment support, and real-time AI teleconsultation link to AIIMS Delhi.'
      },
      'bht_living_quarters': {
        id: 'bht_living_quarters',
        name: 'Living Quarters, Mess & Hydroponics',
        station: 'bharati',
        level: 'level2',
        health: 98,
        status: 'Occupied (23 Crew)',
        sensors: [
          { label: 'HVAC Supply Temp', val: '+22.0 °C', status: 'nominal' },
          { label: 'CO2 Concentration', val: '580 ppm', status: 'nominal' },
          { label: 'Hydroponics Daylight LED', val: 'CYCLE ON', status: 'nominal' },
          { label: 'Food Storage Reserve', val: '428 kg (12.5 d)', status: 'warning' }
        ],
        description: 'Acoustically isolated private berths, communal dining hall, gym, and experimental indoor LED hydroponics farm supplying fresh greens.'
      },
      'bht_roof_radome': {
        id: 'bht_roof_radome',
        name: 'Avionics, Radomes & Satellite Telemetry Deck',
        station: 'bharati',
        level: 'roof',
        health: 97,
        status: 'Tracking GSAT-7',
        sensors: [
          { label: 'Antenna De-Icer Heat', val: 'ACTIVE (+18°C)', status: 'nominal' },
          { label: 'Radome Azimuth Angle', val: '142.8°', status: 'nominal' },
          { label: 'Signal-to-Noise (SNR)', val: '18.4 dB', status: 'nominal' },
          { label: 'Meteo Wind Vane', val: '46 kts SSW', status: 'nominal' }
        ],
        description: 'Dual geodesic radomes housing tracking dish antennas providing continuous telemetry reception from Indian remote sensing satellites.'
      },

      // Maitri Components
      'mtr_fuel_farm': {
        id: 'mtr_fuel_farm',
        name: 'Fuel Storage Tank Farm (4x Tanks)',
        station: 'maitri',
        level: 'outdoor',
        health: 44,
        status: 'CRITICAL DEPLETION',
        sensors: [
          { label: 'Bulk Storage Capacity', val: '11,200 L (18.6%)', status: 'critical' },
          { label: 'Daily Depletion Rate', val: '460 L/day', status: 'critical' },
          { label: 'AI Estimated Autonomy', val: '24.3 Days (72h storm reserve)', status: 'critical' },
          { label: 'Manifold Heating Trace', val: 'ONLINE (+6°C)', status: 'nominal' }
        ],
        description: 'Strategic fuel bladders and hard tanks holding Arctic-grade polar diesel. Fuel level is currently at 18.6%, triggering automated resupply protocol.'
      },
      'mtr_generator_shed': {
        id: 'mtr_generator_shed',
        name: 'Generator Complex (DG A/B/C)',
        station: 'maitri',
        level: 'level0',
        health: 88,
        status: 'DG-A Primary Active',
        sensors: [
          { label: 'DG-A Load', val: '74.0 kW', status: 'nominal' },
          { label: 'DG-B Standby Auto-Start', val: 'ARMED', status: 'nominal' },
          { label: 'Coolant Jacket Temp', val: '86 °C', status: 'nominal' },
          { label: 'Exhaust Backpressure', val: '0.12 bar', status: 'nominal' }
        ],
        description: 'Heavy duty Kirloskar/Cummins Arctic diesel generator sets powering the main habitat block, laboratories, and Priyadarshini water pump.'
      },
      'mtr_priyadarshini_pump': {
        id: 'mtr_priyadarshini_pump',
        name: 'Priyadarshini Lake Water Pump House',
        station: 'maitri',
        level: 'outdoor',
        health: 79,
        status: 'Trace Heater Active',
        sensors: [
          { label: 'Lake Water Temp (Depth 4m)', val: '+1.4 °C', status: 'nominal' },
          { label: 'Sub-Ice Pipeline Trace Temp', val: '-2.1 °C', status: 'warning' },
          { label: 'Line Flow Rate', val: '38 L/min', status: 'nominal' },
          { label: 'Heating Cable Current', val: '24.8 A', status: 'nominal' }
        ],
        description: 'Freshwater supply intake submerged in the permanently frozen Lake Priyadarshini. Equipped with thermal trace heating to prevent ice blockage.'
      },
      'mtr_main_block': {
        id: 'mtr_main_block',
        name: 'Main Station Living Block & Central Hall',
        station: 'maitri',
        level: 'level1',
        health: 95,
        status: 'Occupied (27 Crew)',
        sensors: [
          { label: 'Central Radiator Loop', val: '58 °C', status: 'nominal' },
          { label: 'Interior Habitat Temp', val: '+20.5 °C', status: 'nominal' },
          { label: 'Food Inventory', val: '1,450 kg (38 d)', status: 'nominal' },
          { label: 'Emergency Beacon', val: 'READY', status: 'nominal' }
        ],
        description: 'Historic main station structure in Schirmacher Oasis featuring residential rooms, kitchen, central boiler plant, and communication terminal.'
      },
      'mtr_garage_yard': {
        id: 'mtr_garage_yard',
        name: 'Vehicle Workshop Yard & Heavy Sled Bay',
        station: 'maitri',
        level: 'outdoor',
        health: 92,
        status: 'Active Prep',
        sensors: [
          { label: 'PistenBully PB-300 Fleet', val: '2 Ready / 1 in Transit', status: 'nominal' },
          { label: 'Engine Pre-Heater Bus', val: 'ENERGIZED', status: 'nominal' },
          { label: 'Hydraulic Fluid Temp', val: '+24 °C', status: 'nominal' },
          { label: 'Battery Chargers', val: '100% FLOAT', status: 'nominal' }
        ],
        description: 'Insulated hangar for maintenance of tracked snow vehicles, fuel sleds, snowcats, and polar traverse equipment.'
      }
    };
  }

  init() {
    this.renderBlueprint();
    this.bindEvents();
  }

  bindEvents() {
    // Level switch buttons
    document.querySelectorAll('.level-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        document.querySelectorAll('.level-chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        this.activeLevel = e.target.dataset.level;
        this.renderBlueprint();
      });
    });

    // Listen to station changes
    document.addEventListener('station-changed', () => {
      this.renderBlueprint();
    });

    // Close drawer on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAssetDrawer();
      }
    });

    // Close drawer on click outside
    document.addEventListener('click', (e) => {
      const drawer = document.getElementById('asset-drawer');
      if (drawer && drawer.classList.contains('open')) {
        if (!drawer.contains(e.target) && !e.target.closest('.twin-zone') && !e.target.closest('#card-metric-fuel')) {
          this.closeAssetDrawer();
        }
      }
    });
  }

  renderBlueprint() {
    const station = window.telemetry ? window.telemetry.currentStation : 'bharati';
    const activeSt = (station === 'maitri') ? 'maitri' : 'bharati';

    let svgHtml = '';

    if (activeSt === 'bharati') {
      svgHtml = this.generateBharatiSVG();
    } else {
      svgHtml = this.generateMaitriSVG();
    }

    if (this.container) {
      this.container.innerHTML = svgHtml;
      this.attachZoneClicks();
    }
  }

  generateBharatiSVG() {
    // Bharati: Iconic Aerodynamic structure on stilts in Larsemann hills
    return `
      <svg viewBox="0 0 900 420" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
        <defs>
          <linearGradient id="bgHills" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0a1224" />
            <stop offset="100%" stop-color="#050811" />
          </linearGradient>
          <linearGradient id="metalSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#24344d" />
            <stop offset="50%" stop-color="#19263a" />
            <stop offset="100%" stop-color="#0f1929" />
          </linearGradient>
          <linearGradient id="glassCyan" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(0, 242, 254, 0.4)" />
            <stop offset="100%" stop-color="rgba(56, 189, 248, 0.15)" />
          </linearGradient>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(56, 189, 248, 0.05)" stroke-width="1"/>
          </pattern>
        </defs>

        <!-- Polar Landscape Backdrop -->
        <rect width="900" height="420" fill="url(#bgHills)"/>
        <rect width="900" height="420" fill="url(#grid)"/>

        <!-- Rocky Larsemann Promontory & Frozen Ocean -->
        <path d="M 0 350 Q 250 310 500 340 T 900 330 L 900 420 L 0 420 Z" fill="#0b162a" stroke="#1e293b" stroke-width="1.5"/>
        <path d="M 120 370 Q 400 340 780 375 L 900 420 L 0 420 Z" fill="#080e1c"/>
        <text x="30" y="395" fill="#475569" font-family="var(--font-mono)" font-size="11">LARSEMANN HILLS ROCKY PROMONTORY (PRYDZ BAY) // 69°24′S</text>

        <!-- Hydraulic Support Stilts (Stilt foundation for snow drift avoidance) -->
        <g stroke="#475569" stroke-width="6" stroke-linecap="round">
          <!-- Main Stilt Pairs -->
          <line x1="260" y1="280" x2="240" y2="345" />
          <line x1="280" y1="280" x2="295" y2="345" />
          <line x1="390" y1="280" x2="380" y2="340" />
          <line x1="410" y1="280" x2="420" y2="340" />
          <line x1="520" y1="280" x2="510" y2="340" />
          <line x1="540" y1="280" x2="550" y2="340" />
          <line x1="640" y1="280" x2="625" y2="345" />
          <line x1="660" y1="280" x2="675" y2="345" />
          <!-- Catwalk Gangway -->
          <line x1="670" y1="230" x2="810" y2="355" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4,2"/>
        </g>

        <!-- STATION MAIN BODY - AERODYNAMIC CAPSULE -->
        <!-- Level 0 (Ground chassis: Generators, Fuel, Snowmelt) -->
        <g class="twin-zone" data-asset="bht_dg_bay" id="zone-bht-dg">
          <polygon points="230,225 680,225 660,280 250,280" fill="url(#metalSkin)" stroke="#38bdf8" stroke-width="1.8" />
          <text x="270" y="255" fill="#38bdf8" font-family="var(--font-display)" font-weight="700" font-size="13">⚡ DG POWER BAY (DG 1-3)</text>
          <circle cx="255" cy="251" r="5" fill="#10b981" />
        </g>

        <g class="twin-zone" data-asset="bht_fuel_bay" id="zone-bht-fuel">
          <rect x="470" y="232" width="95" height="38" rx="4" fill="rgba(14, 165, 233, 0.2)" stroke="#00f2fe" stroke-width="1.2"/>
          <text x="480" y="255" fill="#bae6fd" font-family="var(--font-mono)" font-size="10">FUEL TANK 01-04</text>
        </g>

        <g class="twin-zone" data-asset="bht_water_snowmelt" id="zone-bht-water">
          <rect x="575" y="232" width="75" height="38" rx="4" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" stroke-width="1.2"/>
          <text x="582" y="255" fill="#bae6fd" font-family="var(--font-mono)" font-size="10">SNOWMELT</text>
        </g>

        <!-- Level 1: Laboratories & Medical Center -->
        <g class="twin-zone" data-asset="bht_labs_main" id="zone-bht-labs">
          <polygon points="215,160 695,160 680,222 230,222" fill="#131e33" stroke="#00f2fe" stroke-width="1.8" />
          <!-- Observation Windows ribbon -->
          <rect x="235" y="175" width="280" height="28" fill="url(#glassCyan)" stroke="#38bdf8" stroke-width="1"/>
          <text x="245" y="194" fill="#ffffff" font-family="var(--font-display)" font-weight="700" font-size="13">🔬 ATMOSPHERIC & CRYOSPHERE LABS</text>
        </g>

        <g class="twin-zone" data-asset="bht_med_center" id="zone-bht-med">
          <rect x="525" y="175" width="145" height="28" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" stroke-width="1.2"/>
          <text x="535" y="194" fill="#a7f3d0" font-family="var(--font-display)" font-weight="700" font-size="12">➕ MEDICAL & ICU</text>
        </g>

        <!-- Level 2: Living Quarters, Mess, Lounge, Hydroponics -->
        <g class="twin-zone" data-asset="bht_living_quarters" id="zone-bht-living">
          <polygon points="230,100 680,100 695,158 215,158" fill="#17233d" stroke="#38bdf8" stroke-width="1.8" />
          <!-- Panoramic upper deck windows -->
          <rect x="250" y="112" width="410" height="32" rx="3" fill="url(#glassCyan)" stroke="#00f2fe" stroke-width="1.2"/>
          <text x="310" y="132" fill="#ffffff" font-family="var(--font-display)" font-weight="700" font-size="14">🏠 LIVING QUARTERS & MESS HALL (CREW 23)</text>
          <!-- Indian Tri-color Decal -->
          <rect x="635" y="118" width="18" height="5" fill="#ff9933"/>
          <rect x="635" y="123" width="18" height="5" fill="#ffffff"/>
          <rect x="635" y="128" width="18" height="5" fill="#138808"/>
        </g>

        <!-- Roof / Deck: Dual Geodesic Radomes & Tracking Masts -->
        <g class="twin-zone" data-asset="bht_roof_radome" id="zone-bht-roof">
          <!-- Radome 1 (GSAT-7 Link) -->
          <circle cx="340" cy="72" r="32" fill="radial-gradient(circle at 35% 35%, #ffffff 0%, #cbd5e1 70%, #64748b 100%)" stroke="#00f2fe" stroke-width="1.8"/>
          <!-- Radome Geo facets -->
          <path d="M 320 50 L 360 50 L 370 75 L 340 95 L 315 75 Z" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="1"/>
          <!-- Radome 2 -->
          <circle cx="560" cy="72" r="28" fill="radial-gradient(circle at 35% 35%, #ffffff 0%, #cbd5e1 70%, #64748b 100%)" stroke="#38bdf8" stroke-width="1.6"/>
          <!-- Meteo Wind Mast -->
          <line x1="450" y1="100" x2="450" y2="40" stroke="#94a3b8" stroke-width="2.5"/>
          <circle cx="450" cy="38" r="4" fill="#ef4444"/>
          <text x="385" y="65" fill="#00f2fe" font-family="var(--font-display)" font-weight="700" font-size="11">📡 GSAT-7 RADOME</text>
        </g>

        <!-- Interactive Click Tooltip Helper -->
        <text x="350" y="395" fill="#38bdf8" font-family="var(--font-display)" font-size="13" letter-spacing="1">⚡ CLICK ANY ZONE TO OPEN LIVE ASSET DIGITAL TWIN</text>
      </svg>
    `;
  }

  generateMaitriSVG() {
    // Maitri: Historic modular containerized station in Schirmacher Oasis near Lake Priyadarshini
    return `
      <svg viewBox="0 0 900 420" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
        <defs>
          <linearGradient id="lakeWater" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0284c7" stop-opacity="0.7"/>
            <stop offset="100%" stop-color="#0369a1" stop-opacity="0.4"/>
          </linearGradient>
          <linearGradient id="containerBlue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1e3a8a"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
        </defs>

        <!-- Rocky Oasis Backdrop -->
        <rect width="900" height="420" fill="#090d18"/>
        <!-- Schirmacher Oasis Moraine -->
        <path d="M 0 280 Q 200 240 450 270 T 900 260 L 900 420 L 0 420 Z" fill="#141c2e"/>
        <text x="30" y="40" fill="#64748b" font-family="var(--font-mono)" font-size="11">SCHIRMACHER OASIS // QUEEN MAUD LAND (70°45′S) // ELEVATION 117m</text>

        <!-- Lake Priyadarshini (Frozen Freshwater Lake) -->
        <ellipse cx="740" cy="180" rx="130" ry="60" fill="url(#lakeWater)" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="660" y="185" fill="#e0f2fe" font-family="var(--font-display)" font-weight="700" font-size="13">❄ LAKE PRIYADARSHINI</text>

        <!-- Water Pump House & Trace-heated pipeline -->
        <g class="twin-zone" data-asset="mtr_priyadarshini_pump" id="zone-mtr-pump">
          <rect x="610" y="195" width="60" height="45" rx="3" fill="#0369a1" stroke="#38bdf8" stroke-width="2"/>
          <text x="618" y="222" fill="#ffffff" font-family="var(--font-mono)" font-size="9" font-weight="bold">PUMP #1</text>
          <!-- Heated line to main station -->
          <path d="M 610 215 C 550 215, 480 250, 420 250" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="4,2"/>
        </g>

        <!-- Maitri Main Habitat Complex -->
        <g class="twin-zone" data-asset="mtr_main_block" id="zone-mtr-main">
          <!-- Main block building -->
          <rect x="180" y="210" width="280" height="90" rx="6" fill="url(#containerBlue)" stroke="#38bdf8" stroke-width="2"/>
          <!-- Windows ribbon -->
          <rect x="200" y="225" width="240" height="20" fill="rgba(56, 189, 248, 0.3)" stroke="#00f2fe" stroke-width="1"/>
          <text x="210" y="275" fill="#ffffff" font-family="var(--font-display)" font-weight="700" font-size="15">🇮🇳 MAITRI CENTRAL HABITAT BLOCK</text>
          <text x="210" y="290" fill="#94a3b8" font-family="var(--font-mono)" font-size="10">27 SCIENTIFIC PERSONNEL // SURGERY // RADIO</text>
        </g>

        <!-- Generator Shed DG A/B/C -->
        <g class="twin-zone" data-asset="mtr_generator_shed" id="zone-mtr-dg">
          <rect x="80" y="235" width="85" height="65" rx="4" fill="#0f172a" stroke="#10b981" stroke-width="2"/>
          <text x="86" y="260" fill="#10b981" font-family="var(--font-display)" font-weight="700" font-size="12">⚡ DG SHED</text>
          <text x="86" y="280" fill="#cbd5e1" font-family="var(--font-mono)" font-size="9">DG-A (74 kW)</text>
          <!-- Power conduit -->
          <line x1="165" y1="260" x2="180" y2="260" stroke="#10b981" stroke-width="3"/>
        </g>

        <!-- CRITICAL FUEL TANK FARM (4x Tanks) -->
        <g class="twin-zone critical-alert" data-asset="mtr_fuel_farm" id="zone-mtr-fuel">
          <rect x="470" y="270" width="180" height="75" rx="6" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" stroke-width="2.5"/>
          <text x="480" y="295" fill="#ef4444" font-family="var(--font-display)" font-weight="700" font-size="13">⚠ FUEL FARM [18.6% CRITICAL]</text>
          <!-- 4 cylindrical tanks -->
          <rect x="485" y="305" width="30" height="28" rx="4" fill="#b91c1c"/>
          <rect x="525" y="305" width="30" height="28" rx="4" fill="#b91c1c"/>
          <rect x="565" y="305" width="30" height="28" rx="4" fill="#475569"/>
          <rect x="605" y="305" width="30" height="28" rx="4" fill="#475569"/>
          <text x="485" y="340" fill="#fca5a5" font-family="var(--font-mono)" font-size="9">72H STORM RESERVE LEFT</text>
        </g>

        <!-- Garage Workshop Yard -->
        <g class="twin-zone" data-asset="mtr_garage_yard" id="zone-mtr-garage">
          <rect x="680" y="290" width="160" height="65" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="692" y="315" fill="#38bdf8" font-family="var(--font-display)" font-weight="700" font-size="12">🚜 PISTENBULLY YARD</text>
          <text x="692" y="335" fill="#94a3b8" font-family="var(--font-mono)" font-size="9">CONVOY PB-300 DISPATCH READY</text>
        </g>

        <text x="320" y="395" fill="#38bdf8" font-family="var(--font-display)" font-size="13" letter-spacing="1">⚡ CLICK ASSET TO INSPECT SENSORS & AI FAILURE RISK</text>
      </svg>
    `;
  }

  attachZoneClicks() {
    document.querySelectorAll('.twin-zone').forEach(el => {
      // Accessibility: keyboard + screen reader support
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      const assetId = el.dataset.asset;
      const asset = this.components[assetId];
      if (asset) {
        el.setAttribute('title', `Click to inspect: ${asset.name}`);
        el.setAttribute('aria-label', `Inspect asset: ${asset.name}`);
      }

      // Click handler — use currentTarget so child SVG elements also trigger open
      el.addEventListener('click', (e) => {
        const zone = e.currentTarget;
        this.openAssetDrawer(zone.dataset.asset);
      });

      // Keyboard: Enter / Space also opens drawer
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openAssetDrawer(el.dataset.asset);
        }
      });
    });
  }

  openAssetDrawer(assetId) {
    const asset = this.components[assetId];
    if (!asset) return;

    this.selectedZone = asset;
    const drawer = document.getElementById('asset-drawer');
    if (!drawer) return;

    // Fill drawer content
    document.getElementById('drawer-asset-title').textContent = asset.name;
    document.getElementById('drawer-asset-status').textContent = asset.status;
    document.getElementById('drawer-health-val').textContent = asset.health + '%';

    // Set health color
    const healthValEl = document.getElementById('drawer-health-val');
    if (asset.health >= 90) {
      healthValEl.style.color = 'var(--status-nominal)';
    } else if (asset.health >= 70) {
      healthValEl.style.color = 'var(--status-warning)';
    } else {
      healthValEl.style.color = 'var(--status-critical)';
    }

    // Populate sensors
    const sensorList = document.getElementById('drawer-sensor-list');
    sensorList.innerHTML = asset.sensors.map(s => `
      <div class="telemetry-drawer-cell">
        <div class="cell-label">${s.label}</div>
        <div class="cell-val" style="color: ${s.status === 'critical' ? '#ef4444' : s.status === 'warning' ? '#f59e0b' : '#38bdf8'}">${s.val}</div>
      </div>
    `).join('');

    document.getElementById('drawer-asset-desc').textContent = asset.description;

    // Render Canvas sparkline
    this.renderDrawerSparkline();

    // Open drawer
    drawer.classList.add('open');
  }

  renderDrawerSparkline() {
    const canvas = document.getElementById('drawer-chart-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
    ctx.lineWidth = 1;
    for (let y = 10; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Generate trend curve
    const points = [45, 52, 49, 58, 62, 59, 68, 64, 71, 75, 72, 78, 82];
    const step = canvas.width / (points.length - 1);

    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    points.forEach((val, idx) => {
      const x = idx * step;
      const y = canvas.height - (val / 100 * (canvas.height - 20) + 10);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Glow under curve
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fillStyle = 'rgba(0, 242, 254, 0.1)';
    ctx.fill();
  }

  closeAssetDrawer() {
    const drawer = document.getElementById('asset-drawer');
    if (drawer) drawer.classList.remove('open');
  }
}

window.digitalTwin = new DigitalTwinViewer();
