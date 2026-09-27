/* ===================================================================
   OMNI-QUERY & AI OPERATIONS ASSISTANT - HIM-TWIN
   Interactive natural language query engine (Food CCTV, Fuel, Convoy, etc.)
   =================================================================== */

class OmniQueryAssistant {
  constructor() {
    this.input = document.getElementById('omni-search-input');
    this.execBtn = document.getElementById('omni-exec-btn');
    this.clearBtn = document.getElementById('omni-clear-btn');
    this.outputContainer = document.getElementById('omni-output-container');
    this.dropdown = document.getElementById('omni-autocomplete-dropdown');
    this.promptPills = document.querySelectorAll('.prompt-pill');
  }

  init() {
    if (!this.input) return;
    this.bindEvents();
  }

  bindEvents() {
    // Execute on Enter key
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.hideAutocomplete();
        this.processQuery(this.input.value);
      }
    });

    // Execute button click
    if (this.execBtn) {
      this.execBtn.addEventListener('click', () => {
        this.hideAutocomplete();
        this.processQuery(this.input.value);
      });
    }

    // Input focus opens dropdown
    this.input.addEventListener('focus', () => {
      this.showAutocomplete();
    });

    // Input change toggle clear button and filters autocomplete
    this.input.addEventListener('input', () => {
      if (this.clearBtn) {
        this.clearBtn.style.display = this.input.value.trim() ? 'block' : 'none';
      }
      this.filterAutocomplete(this.input.value.trim().toLowerCase());
    });

    // Click outside closes dropdown
    document.addEventListener('click', (e) => {
      if (this.dropdown && !this.dropdown.contains(e.target) && e.target !== this.input) {
        this.hideAutocomplete();
      }
    });

    // Clear button
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        this.input.value = '';
        this.clearBtn.style.display = 'none';
        this.hideOutput();
        this.hideAutocomplete();
        this.input.focus();
      });
    }

    // Prompt pills click
    this.promptPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const q = pill.dataset.query || pill.textContent.trim();
        this.input.value = q;
        if (this.clearBtn) this.clearBtn.style.display = 'block';
        this.hideAutocomplete();
        this.processQuery(q);
      });
    });
  }

  showAutocomplete() {
    if (this.dropdown) {
      this.dropdown.style.display = 'block';
    }
  }

  hideAutocomplete() {
    if (this.dropdown) {
      this.dropdown.style.display = 'none';
    }
  }

  selectAutocomplete(q) {
    if (this.input) {
      this.input.value = q;
      if (this.clearBtn) this.clearBtn.style.display = 'block';
    }
    this.hideAutocomplete();
    this.processQuery(q);
  }

  filterAutocomplete(filterText) {
    if (!this.dropdown) return;
    this.dropdown.style.display = 'block';
    const items = this.dropdown.querySelectorAll('.autocomplete-item');
    items.forEach(item => {
      const txt = item.textContent.toLowerCase();
      item.style.display = !filterText || txt.includes(filterText) ? 'flex' : 'none';
    });
  }

  processQuery(rawQuery) {
    const q = rawQuery.trim().toLowerCase();
    if (!q) return;

    const st = window.telemetry ? window.telemetry.getActiveStation() : null;
    if (!st) return;

    this.showOutput();

    // 1. Direct Value Command Adjustments (e.g. "temp -45", "add food 500", "fuel 50000")
    if (this.handleDirectCommands(q)) {
      return;
    }

    // 2. Query: FUEL DROPPING ALERT / HOW FUEL IS THERE / LEAK SIMULATION
    if ((q.includes('fuel') || q.includes('diesel') || q.includes('jet') || q.includes('oil')) && 
        (q.includes('drop') || q.includes('leak') || q.includes('alert') || q.includes('how fuel') || q.includes('how is fuel') || q.includes('how much fuel') || q.includes('loss') || q.includes('fall') || q.includes('rapid'))) {
      this.renderFuelDroppingAlert(st);
      return;
    }

    // 3. Query: FUEL CCTV / TANK CAMERA / GENERATOR FUEL CAMERA
    if ((q.includes('fuel') || q.includes('diesel') || q.includes('tank')) && 
        (q.includes('cctv') || q.includes('cam') || q.includes('feed') || q.includes('video') || q.includes('show'))) {
      this.renderFuelCCTV(st);
      return;
    }

    // 4. Query: FOOD & EMPTY CANS / LIMITED FOOD / CANNED FOOD INVENTORY
    if (q.includes('empty can') || q.includes('empty cans') || q.includes('can') || q.includes('cans') || q.includes('limited food') || q.includes('canned') || 
        ((q.includes('food') || q.includes('ration') || q.includes('pantry') || q.includes('groceries')) && 
         (q.includes('alert') || q.includes('how') || q.includes('status') || q.includes('check') || q.includes('drop') || q.includes('shortage')))) {
      this.renderFoodEmptyCansAlert(st);
      return;
    }

    // 5. Query: FOOD CCTV / KITCHEN CAMERA / HYDROPONICS CAMERA
    if ((q.includes('food') || q.includes('ration') || q.includes('kitchen') || q.includes('hydro')) && 
        (q.includes('cctv') || q.includes('cam') || q.includes('feed') || q.includes('video') || q.includes('show') || q.includes('look'))) {
      this.renderFoodCCTV(st);
      return;
    }

    // 6. Query: STANDARD FOOD & RATIONS
    if (q.includes('food') || q.includes('ration') || q.includes('mess') || q.includes('eat') || q.includes('groceries')) {
      this.renderFoodEmptyCansAlert(st);
      return;
    }

    // 7. Query: STANDARD FUEL STATUS
    if (q.includes('fuel') || q.includes('diesel') || q.includes('jet') || q.includes('oil')) {
      this.renderFuelStatus(st);
      return;
    }

    // 8. Query: CREW & LIFE SUPPORT
    if (q.includes('crew') || q.includes('life support') || q.includes('habitat') || q.includes('personnel') || q.includes('oxygen') || q.includes('medical') || q.includes('vital') || q.includes('health')) {
      this.renderCrewLifeSupport(st);
      return;
    }

    // 9. Query: ALL CCTV / CAMERAS
    if (q.includes('cctv') || q.includes('camera') || q.includes('surveillance') || q.includes('video')) {
      this.renderAllCCTV(st);
      return;
    }

    // 10. Query: CONVOY / LOGISTICS / RADAR / PISTENBULLY / TRAVERSE
    if (q.includes('convoy') || q.includes('logistics') || q.includes('radar') || q.includes('truck') || q.includes('sled') || q.includes('traverse') || q.includes('pistenbully')) {
      this.renderConvoyStatus(st);
      return;
    }

    // 11. Query: POWER / GENERATOR / ELECTRICITY / SOLAR / WIND / MICROGRID
    if (q.includes('power') || q.includes('generator') || q.includes('dg') || q.includes('solar') || q.includes('wind') || q.includes('battery') || q.includes('grid') || q.includes('electricity')) {
      this.renderPowerStatus(st);
      return;
    }

    // 12. Query: WEATHER / TEMPERATURE / BLIZZARD / KATABATIC / METAR
    if (q.includes('weather') || q.includes('temp') || q.includes('wind') || q.includes('chill') || q.includes('blizzard') || q.includes('storm') || q.includes('katabatic') || q.includes('metar')) {
      this.renderWeatherStatus(st);
      return;
    }

    // 13. Query: WATER / PRIYADARSHINI / SNOWMELT / PIPE FREEZE
    if (q.includes('water') || q.includes('lake') || q.includes('priyadarshini') || q.includes('pipe') || q.includes('trace') || q.includes('snowmelt') || q.includes('freeze')) {
      this.renderWaterStatus(st);
      return;
    }

    // 14. Query: MAITRI / BHARATI
    if (q.includes('maitri')) {
      window.telemetry.setStation('maitri');
      this.renderStationOverview(window.telemetry.stations.maitri);
      return;
    }
    if (q.includes('bharati')) {
      window.telemetry.setStation('bharati');
      this.renderStationOverview(window.telemetry.stations.bharati);
      return;
    }

    // 15. Generic Intelligent Assistant Fallback
    this.renderGenericAssistant(q, st);
  }

  showOutput() {
    if (this.outputContainer) {
      this.outputContainer.style.display = 'block';
      setTimeout(() => {
        this.outputContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    }
  }

  hideOutput() {
    if (this.outputContainer) {
      this.outputContainer.style.display = 'none';
      this.outputContainer.innerHTML = '';
    }
  }

  /* Direct Input Manipulation via Prompt (e.g. "set temp -45", "add food 500") */
  handleDirectCommands(q) {
    // Add food
    if (q.match(/add.*food\s*([0-9]+)/i) || q.match(/food\s*\+\s*([0-9]+)/i)) {
      const match = q.match(/([0-9]+)/);
      if (match) {
        const amt = parseFloat(match[1]);
        window.telemetry.logResourceTransaction(window.telemetry.currentStation, {
          type: 'food',
          amount: amt,
          note: `Operator voice/query command: Add ${amt} kg rations.`
        });
        this.renderSuccessCard(`SUCCESS: Recorded +${amt} kg Food Rations to station inventory!`, 'food');
        return true;
      }
    }

    // Add fuel
    if (q.match(/add.*fuel\s*([0-9]+)/i) || q.match(/fuel\s*\+\s*([0-9]+)/i)) {
      const match = q.match(/([0-9]+)/);
      if (match) {
        const amt = parseFloat(match[1]);
        window.telemetry.logResourceTransaction(window.telemetry.currentStation, {
          type: 'fuel',
          amount: amt,
          note: `Operator voice/query command: Add ${amt} L fuel.`
        });
        this.renderSuccessCard(`SUCCESS: Recorded +${amt} L Polar Jet A-1 Fuel resupply!`, 'fuel');
        return true;
      }
    }

    // Set temp
    if (q.match(/temp\s*(-?[0-9.]+)/i)) {
      const match = q.match(/temp\s*(-?[0-9.]+)/i);
      if (match) {
        const t = parseFloat(match[1]);
        window.telemetry.setUserWeather(window.telemetry.currentStation, { temp: t });
        this.renderSuccessCard(`SUCCESS: Ambient Temperature set to ${t}°C. Heating demand recalculated.`, 'weather');
        return true;
      }
    }

    // Reroute convoy
    if (q.includes('reroute')) {
      if (window.polarMap) window.polarMap.rerouteSelectedConvoy();
      this.renderSuccessCard(`SUCCESS: Convoy rerouted via elevated blue ice ridge path. Blizzard hazard bypassed!`, 'convoy');
      return true;
    }

    // Reset alarms
    if (q.includes('reset') && (q.includes('alarm') || q.includes('sos') || q.includes('alert') || q.includes('clear'))) {
      if (window.telemetry) window.telemetry.resolveCustomAnomaly('all');
      this.renderSuccessCard(`SUCCESS: All critical station alerts and SOS alarms have been reset to nominal.`, 'nominal');
      return true;
    }

    return false;
  }

  /* -------------------------------------------------------------
     RENDER CARDS BASED ON QUERIES
     ------------------------------------------------------------- */

  /* =====================================================================
     RENDER METHODS — RICH ANIMATED OUTPUTS
     ===================================================================== */

  /* FOOD CCTV CARD */
  renderFoodCCTV(st) {
    if (window.voiceAlerts) {
      window.voiceAlerts.speak("Displaying live surveillance feed and inventory telemetry for Station Food Storage Bay.", "normal");
    }

    const timeStr = new Date().toISOString().substring(0, 19).replace('T', ' ') + ' UTC';
    this.outputContainer.innerHTML = `
      <div class="omni-response-card">
        <div class="omni-response-header">
          <div class="omni-response-title">
            <span style="color:var(--polar-cyan);">📹 LIVE SURVEILLANCE:</span>
            <span>FOOD STORAGE BAY & HYDROPONIC FARM // ${st.name.toUpperCase()}</span>
          </div>
          <button class="omni-close-out-btn" onclick="window.omniQuery.hideOutput()">&times;</button>
        </div>

        <div class="omni-grid-2col">
          <!-- Live Feed Box -->
          <div class="omni-cctv-feed-box" id="omni-food-cam-box">
            <img src="assets/food_cam.jpg" alt="Food Storage Bay CCTV" class="omni-cctv-img">
            <div class="omni-cctv-badge">
              <span class="cam-rec-dot" style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#ef4444; animation: cam-rec-blink 1s infinite alternate;"></span>
              CAM 07 // FOOD PANTRY & HYDROPONICS
            </div>
            <div class="omni-cctv-time">${timeStr}</div>
            <div class="omni-cctv-filter-bar">
              <button class="omni-filter-btn active" onclick="window.omniQuery.setCamFilter('omni-food-cam-box', 'opt', this)">OPTICAL</button>
              <button class="omni-filter-btn" onclick="window.omniQuery.setCamFilter('omni-food-cam-box', 'flir', this)">FLIR</button>
              <button class="omni-filter-btn" onclick="window.omniQuery.setCamFilter('omni-food-cam-box', 'nvg', this)">NVG</button>
            </div>
          </div>

          <!-- Live Food Inventory Stats & Quick Actions -->
          <div class="omni-stats-panel">
            <div class="omni-metric-tile">
              <div class="title">CURRENT FOOD STOCK</div>
              <div class="val" style="color:var(--polar-cyan);">${st.resources.foodStockKg} kg</div>
            </div>
            <div class="omni-metric-tile">
              <div class="title">AUTONOMY REMAINING</div>
              <div class="val" style="color:${st.resources.foodDaysLeft <= 15 ? 'var(--status-warning)' : 'var(--status-nominal)'};">
                ${st.resources.foodDaysLeft} DAYS
              </div>
            </div>
            <div class="omni-metric-tile">
              <div class="title">DAILY CREW BURN RATE</div>
              <div class="val">${st.resources.foodBurnRate} kg/day (${st.population} Personnel)</div>
            </div>
            <div class="omni-metric-tile">
              <div class="title">INBOUND RESUPPLY STATUS</div>
              <div class="val" style="font-size:0.95rem; color:#10b981;">Convoy Bravo (2,400 kg Rations) ETA 42m</div>
            </div>

            <!-- Interactive Quick Actions -->
            <div class="omni-action-row">
              <button class="action-btn-sm success" onclick="window.telemetry.logResourceTransaction(window.telemetry.currentStation, {type:'food', amount:1000, note:'Emergency Rations Airbridge Delivery'}); window.omniQuery.processQuery('food cctv');">
                +1,000 kg Rations Delivery
              </button>
              <button class="action-btn-sm" onclick="document.querySelector('[data-tab=\\'cctv\\']').click();">
                Open Full CCTV Wall
              </button>
              <button class="action-btn-sm" onclick="document.querySelector('[data-tab=\\'inventory\\']').click();">
                Open Inventory Tab
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* FUEL CCTV CARD */
  renderFuelCCTV(st) {
    if (window.voiceAlerts) {
      window.voiceAlerts.speak("Displaying surveillance and telemetry for Antarctic Bulk Fuel Farm and transfer manifolds.", "normal");
    }

    const timeStr = new Date().toISOString().substring(0, 19).replace('T', ' ') + ' UTC';
    this.outputContainer.innerHTML = `
      <div class="omni-response-card">
        <div class="omni-response-header">
          <div class="omni-response-title">
            <span style="color:var(--polar-cyan);">📹 LIVE SURVEILLANCE:</span>
            <span>BULK FUEL STORAGE FARM & HEATED MANIFOLDS // ${st.name.toUpperCase()}</span>
          </div>
          <button class="omni-close-out-btn" onclick="window.omniQuery.hideOutput()">&times;</button>
        </div>

        <div class="omni-grid-2col">
          <!-- Live Feed Box -->
          <div class="omni-cctv-feed-box" id="omni-fuel-cam-box">
            <img src="assets/fuel_cam.jpg" alt="Fuel Farm CCTV" class="omni-cctv-img">
            <div class="omni-cctv-badge">
              <span class="cam-rec-dot" style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#ef4444;"></span>
              CAM 04 // POLAR FUEL STORAGE FARM
            </div>
            <div class="omni-cctv-time">${timeStr}</div>
            <div class="omni-cctv-filter-bar">
              <button class="omni-filter-btn active" onclick="window.omniQuery.setCamFilter('omni-fuel-cam-box', 'opt', this)">OPTICAL</button>
              <button class="omni-filter-btn" onclick="window.omniQuery.setCamFilter('omni-fuel-cam-box', 'flir', this)">FLIR</button>
              <button class="omni-filter-btn" onclick="window.omniQuery.setCamFilter('omni-fuel-cam-box', 'nvg', this)">NVG</button>
            </div>
          </div>

          <!-- Fuel Telemetry & Interactive Actions -->
          <div class="omni-stats-panel">
            <div class="omni-metric-tile">
              <div class="title">JET A-1 CURRENT RESERVE</div>
              <div class="val" style="color:var(--polar-cyan);">${st.resources.fuelLiters.toLocaleString()} L (${st.resources.fuelPercent}%)</div>
            </div>
            <div class="omni-metric-tile">
              <div class="title">AUTONOMY AT RUN-RATE</div>
              <div class="val" style="color:${st.resources.fuelPercent <= 20 ? 'var(--status-critical)' : 'var(--status-nominal)'};">
                ${st.resources.fuelDaysLeft} DAYS
              </div>
            </div>
            <div class="omni-metric-tile">
              <div class="title">DAILY CONSUMPTION BURN</div>
              <div class="val">${st.resources.fuelBurnRate} L/day (DG Microgrid & Heating)</div>
            </div>
            <div class="omni-metric-tile">
              <div class="title">TRACE HEATING CABLE STATUS</div>
              <div class="val" style="color:#10b981;">ONLINE (+6.2°C Anti-Freeze Nominal)</div>
            </div>

            <div class="omni-action-row">
              <button class="action-btn-sm success" onclick="window.telemetry.logResourceTransaction(window.telemetry.currentStation, {type:'fuel', amount:5000, note:'Emergency Fuel Sled Transfer'}); window.omniQuery.processQuery('fuel cctv');">
                +5,000 L Fuel Intake
              </button>
              <button class="action-btn-sm" onclick="if(window.polarMap) window.polarMap.dispatchUserConvoy({dest:'${st.name}'}); window.omniQuery.processQuery('convoy');">
                Dispatch Fuel Sled Convoy
              </button>
              <button class="action-btn-sm" onclick="document.querySelector('[data-tab=\\'energy\\']').click();">
                Open Energy Grid
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ALL CCTV SURVEILLANCE WALL */
  renderAllCCTV(st) {
    this.outputContainer.innerHTML = `
      <div class="omni-response-card">
        <div class="omni-response-header">
          <div class="omni-response-title">
            <span style="color:var(--polar-cyan);">📹 TACTICAL CCTV SURVEILLANCE MATRIX</span>
            <span style="font-size:0.8rem; color:#94a3b8;">5 ACTIVE FEEDS CONNECTED</span>
          </div>
          <button class="omni-close-out-btn" onclick="window.omniQuery.hideOutput()">&times;</button>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:10px;">
          <!-- Cam 1: Food Storage -->
          <div style="background:#000; border-radius:6px; overflow:hidden; border:1px solid rgba(56,189,248,0.3); cursor:pointer;" onclick="window.omniQuery.processQuery('food cctv')">
            <img src="assets/food_cam.jpg" style="width:100%; height:140px; object-fit:cover;">
            <div style="padding:6px 10px; font-size:0.75rem; display:flex; justify-content:space-between;">
              <span style="color:var(--polar-cyan);">CAM 07 // FOOD & HYDROPONICS</span>
              <span style="color:#10b981;">ONLINE</span>
            </div>
          </div>

          <!-- Cam 2: Fuel Farm -->
          <div style="background:#000; border-radius:6px; overflow:hidden; border:1px solid rgba(56,189,248,0.3); cursor:pointer;" onclick="window.omniQuery.processQuery('fuel cctv')">
            <img src="assets/fuel_cam.jpg" style="width:100%; height:140px; object-fit:cover;">
            <div style="padding:6px 10px; font-size:0.75rem; display:flex; justify-content:space-between;">
              <span style="color:var(--polar-cyan);">CAM 04 // FUEL STORAGE FARM</span>
              <span style="color:#10b981;">ONLINE</span>
            </div>
          </div>

          <!-- Cam 3: Bharati Station -->
          <div style="background:#000; border-radius:6px; overflow:hidden; border:1px solid rgba(56,189,248,0.3);">
            <img src="assets/bharati_cam.jpg" style="width:100%; height:140px; object-fit:cover;">
            <div style="padding:6px 10px; font-size:0.75rem; display:flex; justify-content:space-between;">
              <span style="color:var(--polar-cyan);">CAM 01 // BHARATI PROMONTORY</span>
              <span style="color:#10b981;">ONLINE</span>
            </div>
          </div>

          <!-- Cam 4: Maitri Station -->
          <div style="background:#000; border-radius:6px; overflow:hidden; border:1px solid rgba(56,189,248,0.3);">
            <img src="assets/maitri_cam.jpg" style="width:100%; height:140px; object-fit:cover;">
            <div style="padding:6px 10px; font-size:0.75rem; display:flex; justify-content:space-between;">
              <span style="color:var(--polar-cyan);">CAM 02 // MAITRI OASIS</span>
              <span style="color:#10b981;">ONLINE</span>
            </div>
          </div>

          <!-- Cam 5: Convoy Alpha in Blizzard -->
          <div style="background:#000; border-radius:6px; overflow:hidden; border:1px solid rgba(56,189,248,0.3);">
            <img src="assets/convoy_cam.jpg" style="width:100%; height:140px; object-fit:cover;">
            <div style="padding:6px 10px; font-size:0.75rem; display:flex; justify-content:space-between;">
              <span style="color:var(--polar-cyan);">CAM 03 // CONVOY BLIZZARD TRAVERSE</span>
              <span style="color:#f59e0b;">NVG ACTIVE</span>
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end;">
          <button class="action-btn-sm" onclick="document.querySelector('[data-tab=\'cctv\']').click();">
            Switch to Dedicated CCTV Tab ➔
          </button>
        </div>
      </div>
    `;
    this.outputContainer.style.display = 'block';
  }

  /* =============================================================
     FOOD & EMPTY CANS ALERT CARD (Real-World Pantry Audit)
     ============================================================= */
  renderFoodEmptyCansAlert(st) {
    const timeStr = new Date().toISOString().substring(0, 19).replace('T', ' ') + ' UTC';
    const voiceMsg = `Station Alert: Food pantry inventory audit complete. Warning: Canned rations are critically limited. Six empty cans detected in Storage Bay Two. Canned protein rations depleted. Station expeditioners shifted to pulse grains and hydroponic harvest. Resupply required within forty-eight hours.`;
    
    if (window.voiceAlerts) {
      window.voiceAlerts.speak(voiceMsg, 'warning');
    }

    this.outputContainer.innerHTML = `
      <div class="omni-response-card" style="border-color: #f59e0b; box-shadow: 0 0 25px rgba(245,158,11,0.2);">
        <div class="omni-response-header" style="background: rgba(245,158,11,0.15); border-bottom: 1px solid rgba(245,158,11,0.35);">
          <div class="omni-response-title" style="color: #fbbf24;">
            <span style="font-size: 1.2rem;">🥫</span>
            <span>CRITICAL PANTRY AUDIT: EMPTY CANS DETECTED & CANNED RATIONS LIMITED</span>
          </div>
          <button class="omni-close-out-btn" onclick="window.omniQuery.hideOutput()">&times;</button>
        </div>

        <!-- Audit Alert Banner -->
        <div style="background: rgba(245, 158, 11, 0.15); border-bottom: 1px solid rgba(245, 158, 11, 0.3); padding: 10px 16px; font-family: var(--font-display); font-size: 0.85rem; color: #fde68a; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <div>
            <strong>PANTRY INSPECTION:</strong> Optical inventory scanner detected <strong>6 empty cans</strong> in disposal bin. Canned meat and fish stock is <strong>depleted</strong>. Canned legumes limited to <strong>4 cans remaining</strong>.
          </div>
          <span class="status-badge warning" style="background: #f59e0b; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: bold;">LIMITED CANNED STOCK</span>
        </div>

        <div style="padding: 16px;">
          <div style="display: grid; grid-template-columns: minmax(280px, 340px) 1fr; gap: 20px; margin-bottom: 16px;">
            
            <!-- Left: Live Food Storage Bay CCTV with AI Vision Overlays -->
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="position: relative; border-radius: 8px; overflow: hidden; border: 1px solid rgba(245, 158, 11, 0.4); background: #000; height: 210px;">
                <img src="assets/food_cam.jpg" alt="Food Storage Bay CCTV" style="width: 100%; height: 100%; object-fit: cover;">
                
                <!-- Camera Header Overlay -->
                <div style="position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.8); padding: 3px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.68rem; color: #fbbf24; display:flex; align-items:center; gap:6px;">
                  <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#ef4444; animation:pulse 1s infinite;"></span>
                  CAM 07 // FOOD STORAGE BAY & DISPOSAL BIN
                </div>

                <!-- AI Bounding Box 1: Empty Cans in Recycling Bin -->
                <div style="position: absolute; bottom: 35px; right: 25px; width: 110px; height: 65px; border: 2px solid #ef4444; background: rgba(239,68,68,0.22); border-radius: 4px; display: flex; flex-direction: column; justify-content: flex-start; padding: 2px; animation: pulse 1.5s infinite;">
                  <span style="font-family: var(--font-mono); font-size: 0.58rem; color: #fff; font-weight: bold; background: #ef4444; padding: 1px 3px; border-radius: 2px; width: fit-content;">AI: 6x EMPTY CANS</span>
                  <span style="font-family: var(--font-mono); font-size: 0.52rem; color: #fecaca; margin-top: auto;">Disposal Bin B-03</span>
                </div>

                <!-- AI Bounding Box 2: Limited Canned Foods Shelf -->
                <div style="position: absolute; top: 40px; left: 30px; width: 120px; height: 60px; border: 2px solid #f59e0b; background: rgba(245,158,11,0.2); border-radius: 4px; display: flex; flex-direction: column; justify-content: flex-start; padding: 2px;">
                  <span style="font-family: var(--font-mono); font-size: 0.58rem; color: #000; font-weight: bold; background: #f59e0b; padding: 1px 3px; border-radius: 2px; width: fit-content;">AI: LIMITED RATIONS</span>
                  <span style="font-family: var(--font-mono); font-size: 0.52rem; color: #fef08a; margin-top: auto;">4 Cans Left (Shelf 2)</span>
                </div>

                <!-- Timestamp -->
                <div style="position: absolute; bottom: 8px; left: 8px; font-family: var(--font-mono); font-size: 0.65rem; color: #cbd5e1; background: rgba(0,0,0,0.65); padding: 2px 6px; border-radius: 3px;">
                  ${timeStr} // VISION MODEL: YOLO-v9-POLAR
                </div>
              </div>

              <!-- Quick Autonomy Indicator -->
              <div style="background: rgba(13, 22, 41, 0.7); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 6px; padding: 10px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono);">OVERALL FOOD AUTONOMY</div>
                  <div style="font-size: 1.25rem; font-weight: bold; color: #fbbf24;">${st.resources.foodDaysLeft} DAYS</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono);">DAILY CONSUMPTION</div>
                  <div style="font-size: 1.1rem; color: #e2e8f0;">${st.resources.foodBurnRate} kg/day (${st.population} Pax)</div>
                </div>
              </div>
            </div>

            <!-- Right: Itemized Pantry Rations Ledger & Empty Cans Analysis -->
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="font-family: var(--font-display); font-size: 0.78rem; font-weight: bold; color: #94a3b8; letter-spacing: 0.8px;">
                ITEMIZED FOOD PANTRY AUDIT // PROVISION BREAKDOWN
              </div>

              <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.78rem;">
                
                <!-- Item 1: Canned Pulses & Beans -->
                <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="color: #fca5a5;">🥫 Canned Beans, Chickpeas & Dal:</strong>
                    <div style="font-size: 0.72rem; color: #cbd5e1;">6 Empty cans found in bin. Only 4 cans remaining on Shelf B-02.</div>
                  </div>
                  <span style="font-family: var(--font-mono); color: #ef4444; font-weight: bold; white-space: nowrap;">🚨 3 DAYS LEFT</span>
                </div>

                <!-- Item 2: Canned Meat & Fish -->
                <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="color: #fca5a5;">🥫 Canned Meats & Tuna Fish:</strong>
                    <div style="font-size: 0.72rem; color: #cbd5e1;">Zero cans remaining. Expeditioner protein intake shifted to dry lentils.</div>
                  </div>
                  <span style="font-family: var(--font-mono); color: #ef4444; font-weight: bold; white-space: nowrap;">🚨 0 CANS (DEPLETED)</span>
                </div>

                <!-- Item 3: Canned Veggies & Fruit -->
                <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="color: #fde68a;">🥫 Canned Peaches & Vegetables:</strong>
                    <div style="font-size: 0.72rem; color: #cbd5e1;">8 Cans remaining. Rationed for medical / wintering crew.</div>
                  </div>
                  <span style="font-family: var(--font-mono); color: #f59e0b; font-weight: bold; white-space: nowrap;">⚠️ 5 DAYS LEFT</span>
                </div>

                <!-- Item 4: Dry Bulk Staples -->
                <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="color: #6ee7b7;">🌾 Bulk Dry Grains (Rice, Atta Flour, Oats):</strong>
                    <div style="font-size: 0.72rem; color: #cbd5e1;">240 kg in sealed moisture-proof bins. Healthy reserve.</div>
                  </div>
                  <span style="font-family: var(--font-mono); color: #10b981; font-weight: bold; white-space: nowrap;">✓ 28 DAYS</span>
                </div>

                <!-- Item 5: Hydroponic Greenhouse -->
                <div style="background: rgba(0, 242, 254, 0.08); border: 1px solid rgba(0, 242, 254, 0.25); border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="color: var(--polar-cyan);">🥬 Station Hydroponic Greenhouse:</strong>
                    <div style="font-size: 0.72rem; color: #cbd5e1;">18.4 kg Fresh spinach, mustard greens & micro-tomatoes ready to harvest.</div>
                  </div>
                  <span style="font-family: var(--font-mono); color: var(--polar-cyan); font-weight: bold; white-space: nowrap;">✓ HARVEST READY</span>
                </div>

              </div>
            </div>

          </div>

          <!-- Remediation Actions -->
          <div class="omni-action-row" id="food-alert-action-row">
            <button class="action-btn-sm success" onclick="window.telemetry.logResourceTransaction(window.telemetry.currentStation, {type:'food', amount:1500, note:'Emergency Canned Provisions Airbridge'}); window.omniQuery.resolveFoodShortage();">
              📦 LOG AIRBRIDGE RESUPPLY (+1,500 kg CANNED FOOD)
            </button>
            <button class="action-btn-sm" style="border-color: #10b981; color: #10b981;" onclick="window.telemetry.logResourceTransaction(window.telemetry.currentStation, {type:'food', amount:18, note:'Hydroponic Greenhouse Harvest'}); window.omniQuery.processQuery('food');">
              🥬 HARVEST HYDROPONICS (+18 kg FRESH GREENS)
            </button>
            <button class="action-btn-sm" onclick="window.voiceAlerts.replayLast();">
              🔊 REPLAY VOICE ALERT
            </button>
            <button class="action-btn-sm" onclick="document.querySelector('[data-tab=\\'inventory\\']').click();">
              OPEN INVENTORY TAB ➔
            </button>
          </div>
        </div>
      </div>
    `;
  }

  resolveFoodShortage() {
    const row = document.getElementById('food-alert-action-row');
    if (row) {
      row.innerHTML = `
        <div style="width:100%; background:rgba(16,185,129,0.15); border:1px solid #10b981; border-radius:6px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
          <div style="color:#10b981; font-family:var(--font-display); font-weight:bold;">
            ✓ INVENTORY UPDATED: +1,500 kg Emergency Canned Food & Rations logged. Autonomy extended to 56.6 Days!
          </div>
          <button class="action-btn-sm success" onclick="window.omniQuery.processQuery('food status');">
            View Restored Food Inventory ➔
          </button>
        </div>
      `;
    }
    if (window.voiceAlerts) {
      window.voiceAlerts.speak("Station dispatch confirmation: Emergency food rations delivery of one thousand five hundred kilograms has been logged. Canned goods restocked. Station food autonomy extended to fifty-six days.", "ack");
    }
  }

  /* FOOD STATUS CARD */
  renderFoodStatus(st) {
    this.renderFoodEmptyCansAlert(st);
  }

  /* =============================================================
     FUEL DROPPING ALERT CARD (Interactive Real-World Simulation)
     ============================================================= */
  renderFuelDroppingAlert(st) {
    const fuel = st.resources;
    const anomalyBurnRateHr = 46.5;
    const anomalyBurnRateDay = Math.round(anomalyBurnRateHr * 24);
    const reducedAutonomyDays = (fuel.fuelLiters / anomalyBurnRateDay).toFixed(1);
    const timeStr = new Date().toISOString().substring(0, 19).replace('T', ' ') + ' UTC';

    const voiceMsg = `Warning: Station fuel reserve is ${fuel.fuelLiters.toLocaleString()} liters. Alert: Fuel level is dropping rapidly at forty-six point five liters per hour. Sector three manifold discrepancy detected. Autonomy reduced to ${reducedAutonomyDays} days. Recommend isolating Auxiliary Line Bravo immediately.`;
    if (window.voiceAlerts) {
      window.voiceAlerts.speak(voiceMsg, 'critical');
    }

    this.outputContainer.innerHTML = `
      <div class="omni-response-card alert-critical-card" style="border-color: #ef4444; box-shadow: 0 0 30px rgba(239,68,68,0.25);">
        <div class="omni-response-header" style="background: rgba(239,68,68,0.15); border-bottom: 1px solid rgba(239,68,68,0.4);">
          <div class="omni-response-title" style="color: #ef4444;">
            <span style="font-size: 1.2rem; animation: pulse 1s infinite;">🚨</span>
            <span>CRITICAL ANOMALY: RAPID FUEL DROP & SECTOR 3 MANIFOLD LEAK DETECTED</span>
          </div>
          <button class="omni-close-out-btn" onclick="window.omniQuery.hideOutput()">&times;</button>
        </div>

        <!-- Alert Notification Ribbon -->
        <div style="background: rgba(239, 68, 68, 0.18); border-bottom: 1px solid rgba(239, 68, 68, 0.3); padding: 10px 16px; font-family: var(--font-display); font-size: 0.85rem; color: #fca5a5; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <div>
            <strong>ALARM TRIGGERED:</strong> Telemetry sensor FM-302 recorded abnormal fuel drop rate of <strong>-46.5 L/hr</strong> (+28.3 L/hr over nominal base load).
          </div>
          <span class="status-badge critical" style="background: #ef4444; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: bold;">DEPLETION ACCELERATED</span>
        </div>

        <div style="padding: 16px;">
          <div style="display: grid; grid-template-columns: minmax(200px, 240px) 1fr; gap: 20px; align-items: center; margin-bottom: 16px;">
            
            <!-- Dynamic Fuel Tank & Drop Indicator -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; background: rgba(8, 14, 28, 0.7); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 12px;">
              <div style="font-family: var(--font-mono); font-size: 0.68rem; color: #f87171; letter-spacing: 1px; font-weight: bold;">RAPID DEPLETION GAUGE</div>
              
              <svg width="100" height="150" viewBox="0 0 100 150">
                <!-- Tank Outline -->
                <rect x="10" y="10" width="80" height="120" rx="8" fill="#0b1222" stroke="#ef4444" stroke-width="2.5" />
                <clipPath id="rapid-fuel-clip">
                  <rect x="12" y="12" width="76" height="116" rx="7" />
                </clipPath>
                <!-- Liquid Fill Level -->
                <rect x="12" y="35" width="76" height="93" rx="4" fill="#ef4444" opacity="0.85" clip-path="url(#rapid-fuel-clip)">
                  <animate attributeName="y" values="35;38;35" dur="1.5s" repeatCount="indefinite" />
                </rect>
                <!-- Descending Dropping Arrow -->
                <g fill="#ffffff" opacity="0.9">
                  <path d="M50,45 L50,85 M42,75 L50,85 L58,75" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
                    <animateTransform attributeName="transform" type="translate" values="0,0; 0,10; 0,0" dur="1.2s" repeatCount="indefinite" />
                  </path>
                </g>
                <!-- Tank Level Text -->
                <text x="50" y="112" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle" font-family="monospace">${fuel.fuelPercent}%</text>
              </svg>

              <div style="font-family: var(--font-mono); font-size: 0.85rem; color: #ef4444; font-weight: bold;">
                ${fuel.fuelLiters.toLocaleString()} L
              </div>
              <div style="font-family: var(--font-mono); font-size: 0.72rem; color: #fca5a5; display:flex; align-items:center; gap:4px;">
                <span>🔻</span> <strong>-46.5 L/hr</strong> DROP RATE
              </div>
            </div>

            <!-- Diagnostics Metrics & Live Camera Joint Leak -->
            <div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; margin-bottom: 12px;">
                <div class="omni-metric-tile" style="border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.06);">
                  <div class="title" style="color:#f87171;">COMPROMISED AUTONOMY</div>
                  <div class="val" style="color: #ef4444; font-size: 1.4rem;">${reducedAutonomyDays} <span style="font-size:0.75rem;">DAYS</span></div>
                  <div style="font-size: 0.65rem; color: #94a3b8;">Normal: 111.2 Days (-61% loss)</div>
                </div>

                <div class="omni-metric-tile" style="border-color: rgba(239,68,68,0.4);">
                  <div class="title">DROP SPIKE</div>
                  <div class="val" style="color: #f59e0b; font-size: 1.4rem;">+28.3 <span style="font-size:0.75rem;">L/h</span></div>
                  <div style="font-size: 0.65rem; color: #94a3b8;">Excess consumption leak</div>
                </div>

                <div class="omni-metric-tile">
                  <div class="title">LINE PRESSURE</div>
                  <div class="val" style="color: #ef4444;">1.8 Bar</div>
                  <div style="font-size: 0.65rem; color: #94a3b8;">Nominal: 3.2 Bar (-44% drop)</div>
                </div>

                <div class="omni-metric-tile">
                  <div class="title">HEATING IMPACT</div>
                  <div class="val" style="color: #38bdf8;">-36.8°C Demand</div>
                  <div style="font-size: 0.65rem; color: #94a3b8;">DG-1 Base: 18.2 L/h required</div>
                </div>
              </div>

              <!-- Thermal FLIR Camera Snippet with Leak Callout -->
              <div style="position: relative; border-radius: 6px; overflow: hidden; border: 1px solid rgba(239,68,68,0.5); background: #000; height: 130px;">
                <img src="assets/fuel_cam.jpg" alt="Fuel Farm Thermal Inspection" style="width: 100%; height: 100%; object-fit: cover; filter: sepia(0.6) hue-rotate(300deg) contrast(1.2);">
                <div style="position: absolute; top: 6px; left: 8px; background: rgba(0,0,0,0.75); padding: 3px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.68rem; color: #f87171; display:flex; align-items:center; gap:6px;">
                  <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#ef4444; animation:pulse 1s infinite;"></span>
                  CAM 04 FLIR // LEAK DETECTED: VALVE MANIFOLD B-07
                </div>
                <!-- Tactical Bounding Box over leak spot -->
                <div style="position: absolute; top: 40px; right: 80px; width: 90px; height: 50px; border: 2px dashed #ef4444; background: rgba(239,68,68,0.25); border-radius: 4px; display:flex; align-items:center; justify-content:center; animation:pulse 1.2s infinite;">
                  <span style="font-family: var(--font-mono); font-size: 0.62rem; color: #fff; font-weight: bold; background: #ef4444; padding: 1px 4px; border-radius: 2px;">COLD JET LEAK</span>
                </div>
                <div style="position: absolute; bottom: 6px; left: 8px; font-family: var(--font-mono); font-size: 0.65rem; color: #cbd5e1;">
                  ${timeStr} // THERMAL DELTA: -14.2°C at flange seal
                </div>
              </div>

            </div>
          </div>

          <!-- Interactive Action Buttons -->
          <div class="omni-action-row" id="fuel-alert-action-row">
            <button class="action-btn-sm success" id="btn-fix-fuel-leak" style="background: rgba(16,185,129,0.25); border-color: #10b981; font-weight: 700;" onclick="window.omniQuery.resolveFuelLeak();">
              🔧 ISOLATE SECTOR 3 LEAK VALVE (AUX LINE B)
            </button>
            <button class="action-btn-sm" style="border-color: #38bdf8; color: #38bdf8;" onclick="if(window.polarMap) window.polarMap.dispatchUserConvoy({dest:'${st.name}'}); window.omniQuery.processQuery('convoy');">
              🚜 DISPATCH RESUPPLY CONVOY (+12,000 L)
            </button>
            <button class="action-btn-sm" onclick="window.voiceAlerts.replayLast();">
              🔊 REPLAY VOICE ALERT
            </button>
            <button class="action-btn-sm" onclick="document.querySelector('[data-tab=\\'energy\\']').click();">
              OPEN ENERGY TAB ➔
            </button>
          </div>
        </div>
      </div>
    `;
  }

  resolveFuelLeak() {
    const row = document.getElementById('fuel-alert-action-row');
    if (row) {
      row.innerHTML = `
        <div style="width:100%; background:rgba(16,185,129,0.15); border:1px solid #10b981; border-radius:6px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
          <div style="color:#10b981; font-family:var(--font-display); font-weight:bold;">
            ✓ COMMAND EXECUTED: Auxiliary Line B isolation valve closed remotely. Leak sealed. Drop rate normalized to 18.2 L/hr!
          </div>
          <button class="action-btn-sm success" onclick="window.omniQuery.processQuery('fuel status');">
            View Restored Fuel Status ➔
          </button>
        </div>
      `;
    }
    if (window.voiceAlerts) {
      window.voiceAlerts.speak("Station dispatch confirmation: Auxiliary Line Bravo isolation valve closed. Leak halted. Fuel consumption returned to nominal eighteen point two liters per hour. All systems stable.", "ack");
    }
  }

  /* FUEL STATUS CARD — RICH ANIMATED TANK VISUAL */
  renderFuelStatus(st) {
    const fuel = st.resources;
    const isCritical = fuel.fuelPercent <= 20;
    const isWarning = fuel.fuelPercent <= 35;
    const alertColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#00f2fe';
    const alertLabel = isCritical ? '🚨 CRITICAL — HABITAT HEATING AT RISK' : isWarning ? '⚠ LOW — SCHEDULE EMERGENCY RESUPPLY' : '✓ NOMINAL — ADEQUATE FUEL RESERVES';

    if (window.voiceAlerts && isCritical) {
      window.voiceAlerts.speak(`Critical fuel alert at ${st.name}. Fuel reserve is at ${fuel.fuelPercent} percent. Habitat heating may fail in ${fuel.fuelDaysLeft} days. Emergency convoy resupply triggered.`, 'critical');
    } else if (window.voiceAlerts && isWarning) {
      window.voiceAlerts.speak(`Fuel warning at ${st.name}. Reserve at ${fuel.fuelPercent} percent. ${fuel.fuelDaysLeft} days of autonomy remaining.`, 'warning');
    } else if (window.voiceAlerts) {
      window.voiceAlerts.speak(`Fuel telemetry: ${st.name} holds ${fuel.fuelLiters.toLocaleString()} liters of Polar Jet A-1 fuel, providing ${fuel.fuelDaysLeft} days of autonomy.`, 'normal');
    }

    this.outputContainer.innerHTML = `
      <div class="omni-response-card" style="border-color:${alertColor}40;">
        <div class="omni-response-header">
          <div class="omni-response-title">
            <span style="color:${alertColor};">🛢</span>
            <span>JET A-1 POLAR FUEL // ${st.name.toUpperCase()}</span>
          </div>
          <button class="omni-close-out-btn" onclick="window.omniQuery.hideOutput()">&times;</button>
        </div>

        <!-- Alert Banner -->
        <div style="background:${alertColor}18;border-bottom:1px solid ${alertColor}40;padding:8px 16px;font-family:var(--font-display);font-size:0.78rem;font-weight:700;color:${alertColor};letter-spacing:0.8px;display:flex;justify-content:space-between;align-items:center;">
          <span>${alertLabel}</span>
          <button class="action-btn-sm danger" style="padding:2px 8px;font-size:0.7rem;" onclick="window.omniQuery.renderFuelDroppingAlert(window.telemetry.getActiveStation())">
            Simulate Fuel Dropping Alert ➔
          </button>
        </div>

        <div style="padding:16px;">
          <div style="display:grid;grid-template-columns:180px 1fr;gap:20px;align-items:center;margin-bottom:16px;">

            <!-- Animated Tank SVG -->
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
              <div style="font-family:var(--font-mono);font-size:0.62rem;color:#64748b;letter-spacing:1px;">TANK FILL LEVEL</div>
              <svg width="90" height="140" viewBox="0 0 90 140">
                <rect x="5" y="10" width="80" height="115" rx="8" fill="#0a1020" stroke="${alertColor}" stroke-width="2" opacity="0.8"/>
                <clipPath id="fuel-clip-stat">
                  <rect x="6" y="11" width="78" height="113" rx="7"/>
                </clipPath>
                <rect id="fuel-fill-rect" x="6" y="${11 + 113 - (113 * fuel.fuelPercent / 100)}" width="78" height="${113 * fuel.fuelPercent / 100}" rx="4" fill="${alertColor}" opacity="0.8" clip-path="url(#fuel-clip-stat)" style="transition:y 1.5s ease,height 1.5s ease;">
                  <animate attributeName="opacity" values="0.7;0.9;0.7" dur="2s" repeatCount="indefinite"/>
                </rect>
                <text x="45" y="75" fill="white" font-size="18" font-weight="bold" text-anchor="middle" font-family="monospace">${fuel.fuelPercent}%</text>
                <rect x="35" y="124" width="20" height="16" rx="3" fill="#1e2a3a" stroke="#334155" stroke-width="1"/>
              </svg>
              <div style="font-family:var(--font-mono);font-size:0.75rem;color:${alertColor};font-weight:700;">${fuel.fuelLiters.toLocaleString()} L</div>
            </div>

            <!-- Stats Panel -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <div class="omni-metric-tile" style="border-color:${alertColor}30;">
                <div class="title">AUTONOMY</div>
                <div class="val" style="color:${alertColor};font-size:1.3rem;">${fuel.fuelDaysLeft} <span style="font-size:0.7rem;">DAYS</span></div>
              </div>
              <div class="omni-metric-tile">
                <div class="title">DAILY BURN</div>
                <div class="val">${fuel.fuelBurnRate} <span style="font-size:0.7rem;">L/day</span></div>
              </div>
              <div class="omni-metric-tile">
                <div class="title">DG HOURLY RATE</div>
                <div class="val">${st.energy.dg1FuelRate} L/h</div>
              </div>
              <div class="omni-metric-tile">
                <div class="title">THRESHOLD (20%)</div>
                <div class="val" style="color:#ef4444;">${(fuel.fuelCapacity * 0.2 / 1000).toFixed(0)}k L</div>
              </div>

              <!-- Depletion bar -->
              <div class="omni-metric-tile" style="grid-column:span 2;">
                <div class="title" style="margin-bottom:6px;">DEPLETION TIMELINE (30 DAYS)</div>
                <div style="background:#0f172a;border-radius:3px;height:8px;overflow:hidden;">
                  <div style="height:100%;width:${Math.min(100, (fuel.fuelDaysLeft / 30) * 100)}%;background:linear-gradient(90deg,#ef4444,${alertColor});border-radius:3px;"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="omni-action-row">
            <button class="action-btn-sm danger" onclick="window.omniQuery.renderFuelDroppingAlert(window.telemetry.getActiveStation())">🚨 Test Fuel Dropping Alert</button>
            <button class="action-btn-sm" onclick="window.omniQuery.processQuery('fuel cctv')">📹 Fuel Farm CCTV</button>
            <button class="action-btn-sm success" onclick="window.telemetry.logResourceTransaction(window.telemetry.currentStation, {type:'fuel', amount:5000, note:'Emergency Fuel Sled'}); window.omniQuery.processQuery('fuel status');">✚ +5,000 L Intake</button>
            <button class="action-btn-sm" onclick="window.voiceAlerts.replayLast();">🔊 Replay Voice</button>
          </div>
        </div>
      </div>
    `;
  }

  /* -------------------------------------------------------------
     CREW LIFE SUPPORT & HABITAT CARD
     ------------------------------------------------------------- */
  renderCrewLifeSupport(st) {
    const voiceMsg = `Habitat life support report: All twenty-three station personnel nominal. Habitat thermal control maintaining plus twenty-one point four degrees Celsius. Oxygen levels optimal at twenty point nine percent.`;
    if (window.voiceAlerts) {
      window.voiceAlerts.speak(voiceMsg, 'normal');
    }

    this.outputContainer.innerHTML = `
      <div class="omni-response-card" style="border-color: rgba(56, 189, 248, 0.4);">
        <div class="omni-response-header">
          <div class="omni-response-title">
            <span style="color: var(--polar-cyan);">🩺</span>
            <span>EXPEDITION CREW & HABITAT LIFE SUPPORT // ${st.name.toUpperCase()}</span>
          </div>
          <button class="omni-close-out-btn" onclick="window.omniQuery.hideOutput()">&times;</button>
        </div>

        <div style="padding: 16px;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 14px;">
            <div class="omni-metric-tile" style="border-color: #10b98130;">
              <div class="title">CREW HEADCOUNT</div>
              <div class="val" style="color: #10b981; font-size: 1.4rem;">${st.population} Personnel</div>
              <div style="font-size: 0.65rem; color: #94a3b8;">100% Accounted For & Active</div>
            </div>

            <div class="omni-metric-tile" style="border-color: #00f2fe30;">
              <div class="title">INDOOR HABITAT TEMP</div>
              <div class="val" style="color: #00f2fe; font-size: 1.4rem;">+21.4°C</div>
              <div style="font-size: 0.65rem; color: #94a3b8;">Thermal Exchanger Nominal</div>
            </div>

            <div class="omni-metric-tile" style="border-color: #38bdf830;">
              <div class="title">ATMOSPHERIC O2</div>
              <div class="val" style="color: #38bdf8;">20.9%</div>
              <div style="font-size: 0.65rem; color: #94a3b8;">18 ICU Cylinders in Reserve</div>
            </div>

            <div class="omni-metric-tile" style="border-color: #10b98130;">
              <div class="title">CO2 SCRUBBING</div>
              <div class="val" style="color: #10b981;">418 ppm</div>
              <div style="font-size: 0.65rem; color: #94a3b8;">Optimal (Threshold &lt; 1,000 ppm)</div>
            </div>
          </div>

          <div style="background: rgba(8, 14, 28, 0.7); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 6px; padding: 12px; margin-bottom: 12px; font-size: 0.78rem;">
            <div style="font-family: var(--font-display); font-weight: bold; color: #38bdf8; margin-bottom: 4px;">STATION MEDICAL & HABITAT STATUS</div>
            <div style="color: #cbd5e1; line-height: 1.5;">
              • Medical Bay: Ready (1 ICU Bed, 1 Telemedicine Uplink to AIIMS New Delhi active).<br>
              • Cold Exposure / Hypothermia Cases: <strong>0 Reported</strong>.<br>
              • Hydronic Heating Loop: Operating at 44 kW thermal heat recovery from DG-1.<br>
              • Fresh Air Circulation: 4.2 air changes/hour with high-efficiency particulate filtration.
            </div>
          </div>

          <div class="omni-action-row">
            <button class="action-btn-sm" onclick="window.voiceAlerts.replayLast();">
              🔊 REPLAY VOICE DISPATCH
            </button>
            <button class="action-btn-sm" onclick="document.querySelector('[data-tab=\\'twin\\']').click();">
              INSPECT 3D HABITAT BLUEPRINT ➔
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /* =============================================================
     CONVOY STATUS CARD
     ============================================================= */
  renderConvoyStatus(st) {
    const convoys = window.polarMap ? window.polarMap.convoys : [];
    if (window.voiceAlerts) {
      window.voiceAlerts.speak("Logistics tracking: Convoy Alpha tracked on polar radar with twelve thousand liters of Arctic fuel. Convoy Bravo approaching station with two point four thousand kilograms of rations.", "normal");
    }

    let convoysHtml = convoys.map(c => `
      <div style="background:rgba(15,23,42,0.8); border:1px solid rgba(56,189,248,0.25); border-left:3px solid ${c.color}; border-radius:6px; padding:10px;">
        <div style="display:flex; justify-content:space-between; font-weight:bold; color:#ffffff;">
          <span>🚜 ${c.name}</span>
          <span style="color:#00f2fe; font-size:0.75rem;">${c.status}</span>
        </div>
        <div style="font-size:0.78rem; color:#cbd5e1; margin-top:4px;">
          <div>Origin: ${c.origin} ➔ Destination: <strong>${c.dest}</strong></div>
          <div>Cargo: <strong>${c.cargo}</strong></div>
          <div>Speed: ${c.speedKmH} km/h | Remaining: ${c.remainingKm} km (ETA: ${c.eta})</div>
          <div>Risk: <span style="color:${c.risk.includes('BLIZZARD') ? '#f59e0b' : '#10b981'};">${c.risk}</span></div>
        </div>
      </div>
    `).join('');

    this.outputContainer.innerHTML = `
      <div class="omni-response-card">
        <div class="omni-response-header">
          <div class="omni-response-title">
            <span>🚜 POLAR OVERLAND EXPEDITIONS & GPS TRACKING</span>
            <span style="font-size:0.8rem; color:#94a3b8;">${convoys.length} CONVOYS ACTIVE</span>
          </div>
          <button class="omni-close-out-btn" onclick="window.omniQuery.hideOutput()">&times;</button>
        </div>

        <div style="padding:16px;">
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:10px; margin-bottom:12px;">
            ${convoysHtml}
          </div>

          <div class="omni-action-row">
            <button class="action-btn-sm" style="border-color:#f59e0b; color:#f59e0b;" onclick="if(window.polarMap) window.polarMap.rerouteSelectedConvoy(); window.omniQuery.processQuery('convoy');">
              🏔 Reroute Selected Convoy via Ridge Path
            </button>
            <button class="action-btn-sm success" onclick="if(window.polarMap) window.polarMap.dispatchUserConvoy({dest:'${st.name}'}); window.omniQuery.processQuery('convoy');">
              🚀 Dispatch New Expedition Convoy
            </button>
            <button class="action-btn-sm" onclick="window.voiceAlerts.replayLast();">
              🔊 Replay Voice
            </button>
            <button class="action-btn-sm" onclick="document.querySelector('[data-tab=\\'logistics\\']').click();">
              Open Continental Radar Map ➔
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /* =============================================================
     POWER STATUS CARD
     ============================================================= */
  renderPowerStatus(st) {
    const e = st.energy;
    const totalGen = e.dg1Load + e.dg2Load + e.solarGen + e.windGen;
    const renewPct = Math.round(((e.solarGen + e.windGen) / e.totalDemand) * 100);
    const overloaded = e.totalDemand > totalGen;
    const alertColor = overloaded ? '#ef4444' : '#00f2fe';

    if (window.voiceAlerts) {
      window.voiceAlerts.speak(`Microgrid report: Diesel generator DG-1 operating at nominal capacity with sixty-eight kilowatts base load. Hybrid solar and wind arrays supplying twenty-two point seven kilowatts of renewable offset.`, 'normal');
    }

    const genSources = [
      { label: 'DG-1 Diesel', kw: e.dg1Load, color: '#00f2fe', status: 'RUNNING', health: e.dg1Health },
      { label: 'DG-2 Standby', kw: e.dg2Load, color: '#38bdf8', status: e.dg2Status || 'STANDBY', health: e.dg2Health },
      { label: 'Solar PV', kw: e.solarGen, color: '#f59e0b', status: 'ACTIVE', health: 100 },
      { label: 'Wind Turbine', kw: e.windGen, color: '#10b981', status: 'ACTIVE', health: 100 },
      { label: 'BESS Battery', kw: 0, color: '#8b5cf6', status: `${e.batterySoC}% SoC`, health: e.batterySoC }
    ];

    const sourceBarsHtml = genSources.map(s => `
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:10px;height:10px;border-radius:50%;background:${s.color};box-shadow:0 0 6px ${s.color};flex-shrink:0;"></div>
        <div style="flex:1;">
          <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:0.68rem;margin-bottom:3px;">
            <span style="color:#cbd5e1;">${s.label}</span>
            <span style="color:${s.color};font-weight:700;">${s.kw} kW</span>
          </div>
          <div style="background:#0f172a;border-radius:3px;height:5px;">
            <div style="height:100%;width:${Math.min(100, (s.kw / e.totalDemand) * 100)}%;background:${s.color};border-radius:3px;transition:width 1s ease;"></div>
          </div>
        </div>
        <div style="font-family:var(--font-display);font-size:0.6rem;color:${s.kw > 0 ? '#10b981' : '#475569'};width:52px;text-align:right;">${s.status}</div>
      </div>
    `).join('');

    this.outputContainer.innerHTML = `
      <div class="omni-response-card" style="border-color:${alertColor}30;">
        <div class="omni-response-header">
          <div class="omni-response-title">
            <span style="color:${alertColor};">⚡</span>
            <span>MICROGRID POWER // ${st.name.toUpperCase()}</span>
          </div>
          <button class="omni-close-out-btn" onclick="window.omniQuery.hideOutput()">&times;</button>
        </div>

        ${overloaded ? `<div style="background:rgba(239,68,68,0.12);border-bottom:1px solid #ef444440;padding:8px 16px;font-family:var(--font-display);font-size:0.78rem;font-weight:700;color:#ef4444;">🚨 POWER OVERLOAD — DEMAND EXCEEDS GENERATION CAPACITY</div>` : ''}

        <div style="padding:16px;display:grid;grid-template-columns:1fr 1fr;gap:20px;">
          <!-- Left: Key Metrics -->
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <div class="omni-metric-tile">
                <div class="title">TOTAL DEMAND</div>
                <div class="val" style="color:${alertColor};font-size:1.3rem;">${e.totalDemand} <span style="font-size:0.7rem;">kW</span></div>
              </div>
              <div class="omni-metric-tile">
                <div class="title">RENEWABLE MIX</div>
                <div class="val" style="color:#10b981;font-size:1.3rem;">${renewPct}<span style="font-size:0.7rem;">%</span></div>
              </div>
              <div class="omni-metric-tile">
                <div class="title">BESS BATTERY</div>
                <div class="val" style="color:#8b5cf6;">${e.batterySoC}% SoC</div>
                <div style="background:#0f172a;border-radius:3px;height:4px;margin-top:4px;"><div style="height:100%;width:${e.batterySoC}%;background:#8b5cf6;border-radius:3px;"></div></div>
              </div>
              <div class="omni-metric-tile">
                <div class="title">BACKUP (BESS)</div>
                <div class="val" style="color:#94a3b8;">6.4 hrs</div>
                <div style="font-size:0.62rem;color:#475569;">at zero generation</div>
              </div>
            </div>

            <div class="omni-action-row">
              <button class="action-btn-sm" style="font-size:0.72rem;" onclick="window.commandSystem.sendCommand('START DG-2: Secondary generator brought online at 40kW'); window.omniQuery.processQuery('power status');">⚡ Start DG-2</button>
              <button class="action-btn-sm" style="font-size:0.72rem;" onclick="window.commandSystem.sendCommand('ECO MODE: HVAC load reduced to 65kW'); window.omniQuery.processQuery('power status');">🌿 HVAC Eco Mode</button>
              <button class="action-btn-sm" onclick="window.voiceAlerts.replayLast();">🔊 Replay Voice</button>
              <button class="action-btn-sm" style="font-size:0.72rem;" onclick="document.querySelector('[data-tab=\\'energy\\']').click();">📊 Energy Tab</button>
            </div>
          </div>

          <!-- Right: Generation Sources -->
          <div style="background:rgba(0,10,25,0.6);border:1px solid rgba(0,242,254,0.1);border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:10px;">
            <div style="font-family:var(--font-display);font-size:0.65rem;font-weight:700;color:#64748b;letter-spacing:1px;margin-bottom:4px;">GENERATION SOURCES</div>
            ${sourceBarsHtml}
          </div>
        </div>
      </div>
    `;
    this.outputContainer.style.display = 'block';
  }

  /* WEATHER STATUS CARD — CINEMATIC POLAR CONDITIONS VISUAL */
  renderWeatherStatus(st) {
    const w = st.weather;
    const isBlizzard = w.blizzardWarning || w.windSpeed >= 70;
    const isAdvisory = w.windSpeed >= 50;
    const alertColor = isBlizzard ? '#ef4444' : isAdvisory ? '#f59e0b' : '#00f2fe';
    const windRisk = isBlizzard ? '🌪 WHITEOUT BLIZZARD — ALL TRAVERSE OPERATIONS HALTED' : isAdvisory ? '⚠ KATABATIC SURGE — CONVOY SPEED REDUCED' : '✓ MANAGEABLE CONDITIONS';
    const windPct = Math.min(100, (w.windSpeed / 110) * 100);
    const tempPct = Math.min(100, ((w.temp + 70) / 60) * 100); // -70 to -10 range

    if (window.voiceAlerts && isBlizzard) {
      window.voiceAlerts.speak(`Whiteout blizzard warning at ${st.name}. Wind speed ${w.windSpeed} knots. Wind chill ${w.windChill} degrees. All traverse operations should be suspended.`, 'critical');
    }

    this.outputContainer.innerHTML = `
      <div class="omni-response-card" style="border-color:${alertColor}40;">
        <div class="omni-response-header">
          <div class="omni-response-title">
            <span style="color:${alertColor};">❄</span>
            <span>POLAR METAR // ${st.name.toUpperCase()}</span>
            <span style="font-size:0.72rem;color:#64748b;font-family:var(--font-mono);">METAR LIVE</span>
          </div>
          <button class="omni-close-out-btn" onclick="window.omniQuery.hideOutput()">&times;</button>
        </div>

        <div style="background:${alertColor}15;border-bottom:1px solid ${alertColor}30;padding:8px 16px;font-family:var(--font-display);font-size:0.78rem;font-weight:700;color:${alertColor};letter-spacing:0.8px;">
          ${windRisk}
        </div>

        <div style="padding:16px;">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;margin-bottom:16px;">
            <div class="omni-metric-tile" style="border-color:#00f2fe30;">
              <div class="title">AMBIENT TEMP</div>
              <div class="val" style="color:#00f2fe;font-size:1.6rem;">${w.temp}°C</div>
              <div style="font-size:0.62rem;color:#475569;">exterior surface</div>
            </div>
            <div class="omni-metric-tile" style="border-color:#ef444430;">
              <div class="title">WIND CHILL</div>
              <div class="val" style="color:#ef4444;font-size:1.6rem;">${w.windChill}°C</div>
              <div style="font-size:0.62rem;color:#475569;">effective exposure</div>
            </div>
            <div class="omni-metric-tile" style="border-color:${alertColor}30;">
              <div class="title">KATABATIC WIND</div>
              <div class="val" style="color:${alertColor};font-size:1.2rem;">${w.windSpeed} kts</div>
              <div style="font-size:0.62rem;color:#f59e0b;">Gusts: ${w.windGust} kts</div>
            </div>
            <div class="omni-metric-tile" style="border-color:${w.visibility < 300 ? '#ef444430' : '#f59e0b30'};">
              <div class="title">VISIBILITY</div>
              <div class="val" style="color:${w.visibility < 300 ? '#ef4444' : '#f59e0b'};font-size:1.2rem;">${w.visibility} m</div>
              <div style="font-size:0.62rem;color:#475569;">${w.visibility < 300 ? 'ZERO VISIBILITY' : 'limited range'}</div>
            </div>
          </div>

          <!-- Wind speed gauge bar -->
          <div style="margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:0.65rem;color:#64748b;margin-bottom:5px;">
              <span>WIND INTENSITY SCALE</span>
              <span style="color:${alertColor};">${w.windSpeed} kts / 110 kts MAX</span>
            </div>
            <div style="background:#0f172a;border-radius:4px;height:12px;overflow:hidden;position:relative;">
              <div style="height:100%;width:${windPct}%;background:linear-gradient(90deg,#10b981,#f59e0b,#ef4444);border-radius:4px;transition:width 1.2s ease;"></div>
              <div style="position:absolute;top:0;left:45%;height:100%;width:2px;background:rgba(255,255,255,0.2);"></div>
              <div style="position:absolute;top:0;left:63%;height:100%;width:2px;background:rgba(239,68,68,0.4);"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:0.58rem;color:#334155;margin-top:2px;">
              <span>CALM</span><span>ADVISORY (50kts)</span><span>DANGER (70kts)</span><span>EXTREME</span>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
            <div class="omni-metric-tile">
              <div class="title">WIND DIRECTION</div>
              <div class="val" style="color:#94a3b8;">${w.windDir || 'SSW 195°'}</div>
            </div>
            <div class="omni-metric-tile">
              <div class="title">GEOMAGNETIC Kp</div>
              <div class="val" style="color:#10b981;">Kp 3.2 — HF STABLE</div>
            </div>
          </div>

          <div class="omni-action-row">
            <button class="action-btn-sm danger" onclick="window.telemetry.setUserWeather(window.telemetry.currentStation, {temp:-58, windSpeed:88, windGust:102, visibility:50, blizzardWarning:true}); window.omniQuery.processQuery('weather status');">🌪 Inject Whiteout Blizzard</button>
            <button class="action-btn-sm" onclick="window.telemetry.setUserWeather(window.telemetry.currentStation, {temp:-18, windSpeed:15, windGust:22, visibility:8000, blizzardWarning:false}); window.omniQuery.processQuery('weather status');">☀ Summer Calm Preset</button>
            <button class="action-btn-sm success" onclick="window.telemetry.setUserWeather(window.telemetry.currentStation, {temp:-36.8, windSpeed:46, windGust:62, visibility:420, blizzardWarning:false}); window.omniQuery.processQuery('weather status');">↺ Standard Conditions</button>
            <button class="action-btn-sm" onclick="window.voiceAlerts.replayLast();">🔊 Replay Voice</button>
          </div>
        </div>
      </div>
    `;
  }

  /* WATER PIPELINE STATUS CARD — VISUAL PIPE DIAGRAM */
  renderWaterStatus(st) {
    const r = st.resources;
    const waterPct = Math.round((r.waterLiters / r.waterCapacity) * 100);
    const isLow = r.waterDaysLeft < 7;
    const alertColor = isLow ? '#ef4444' : r.waterDaysLeft < 14 ? '#f59e0b' : '#00f2fe';
    const heaterStatus = st.weather && st.weather.temp < -40 ? 'CRITICAL — FREEZE RISK' : 'NOMINAL';
    const heaterColor = heaterStatus.includes('CRITICAL') ? '#ef4444' : '#10b981';

    if (window.voiceAlerts) {
      window.voiceAlerts.speak(`Potable water telemetry: Priyadarshini lake reservoir at ${r.waterLiters.toLocaleString()} liters. Trace heating cables active at plus four point eight degrees Celsius to prevent sub-zero pipe freezing.`, 'normal');
    }

    this.outputContainer.innerHTML = `
      <div class="omni-response-card" style="border-color:${alertColor}30;">
        <div class="omni-response-header">
          <div class="omni-response-title">
            <span style="color:${alertColor};">💧</span>
            <span>PRIYADARSHINI WATER SYSTEM // ${st.name.toUpperCase()}</span>
          </div>
          <button class="omni-close-out-btn" onclick="window.omniQuery.hideOutput()">&times;</button>
        </div>

        <div style="padding:16px;">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;margin-bottom:14px;">
            <div class="omni-metric-tile" style="border-color:${alertColor}30;">
              <div class="title">WATER RESERVE</div>
              <div class="val" style="color:${alertColor};font-size:1.3rem;">${r.waterLiters.toLocaleString()} <span style="font-size:0.7rem;">L</span></div>
              <div style="background:#0f172a;border-radius:3px;height:5px;margin-top:6px;"><div style="height:100%;width:${waterPct}%;background:${alertColor};border-radius:3px;transition:width 1s ease;"></div></div>
            </div>
            <div class="omni-metric-tile">
              <div class="title">BUFFER DAYS</div>
              <div class="val" style="color:${alertColor};">${r.waterDaysLeft} <span style="font-size:0.7rem;">days</span></div>
            </div>
            <div class="omni-metric-tile">
              <div class="title">DAILY USE</div>
              <div class="val">${r.waterBurnRate} L/day</div>
              <div style="font-size:0.62rem;color:#475569;margin-top:2px;">${st.population} personnel</div>
            </div>
            <div class="omni-metric-tile" style="border-color:${heaterColor}30;">
              <div class="title">TRACE HEATER</div>
              <div class="val" style="color:${heaterColor};font-size:0.8rem;">${heaterStatus}</div>
              <div style="font-size:0.62rem;color:#475569;margin-top:2px;">+4.8°C anti-freeze</div>
            </div>
          </div>

          <!-- Pipeline Diagram (SVG) -->
          <div style="background:rgba(0,10,25,0.6);border:1px solid rgba(0,242,254,0.1);border-radius:8px;padding:12px;margin-bottom:12px;">
            <div style="font-family:var(--font-display);font-size:0.65rem;color:#64748b;letter-spacing:1px;margin-bottom:10px;">PRIYADARSHINI LAKE INTAKE PIPELINE — 450m TRACE-HEATED</div>
            <svg width="100%" height="60" viewBox="0 0 500 60" preserveAspectRatio="xMidYMid meet">
              <ellipse cx="40" cy="30" rx="35" ry="18" fill="rgba(0,180,220,0.15)" stroke="#00f2fe" stroke-width="1.5"/>
              <text x="40" y="34" fill="#00f2fe" font-size="8" text-anchor="middle" font-family="monospace">LAKE</text>
              <rect x="75" y="25" width="280" height="10" rx="5" fill="#0f172a" stroke="${heaterColor}" stroke-width="1.5"/>
              <rect x="75" y="27" width="20" height="6" rx="3" fill="${alertColor}" opacity="0.8">
                <animateTransform attributeName="transform" type="translate" from="0,0" to="280,0" dur="2s" repeatCount="indefinite"/>
              </rect>
              <circle cx="210" cy="30" r="10" fill="#0a1828" stroke="#38bdf8" stroke-width="1.5"/>
              <text x="210" y="34" fill="#38bdf8" font-size="7" text-anchor="middle" font-family="monospace">⚙</text>
              <rect x="358" y="10" width="40" height="40" rx="6" fill="rgba(0,180,220,0.1)" stroke="${alertColor}" stroke-width="1.5"/>
              <rect x="359" y="${10 + 40 - (40 * waterPct / 100)}" width="38" height="${40 * waterPct / 100}" rx="4" fill="${alertColor}" opacity="0.6"/>
              <text x="378" y="55" fill="${alertColor}" font-size="7" text-anchor="middle" font-family="monospace">${waterPct}%</text>
              <text x="210" y="55" fill="#475569" font-size="7" text-anchor="middle" font-family="monospace">PUMP STATION</text>
              <text x="420" y="35" fill="#64748b" font-size="8" font-family="monospace">STATION</text>
              <text x="420" y="45" fill="#64748b" font-size="8" font-family="monospace">TANK</text>
            </svg>
          </div>

          <div class="omni-action-row">
            <button class="action-btn-sm success" onclick="window.commandSystem.sendCommand('ENGAGE: Auxiliary Trace-Heating Cable 2 — Priyadarshini Line');">❄ Engage Trace Heater</button>
            <button class="action-btn-sm" onclick="window.telemetry.logResourceTransaction(window.telemetry.currentStation, {type:'water', amount:3000, note:'Snowmelt Intake'}); window.omniQuery.processQuery('water status');">💧 +3,000 L Snowmelt Intake</button>
            <button class="action-btn-sm" onclick="window.voiceAlerts.replayLast();">🔊 Replay Voice</button>
          </div>
        </div>
      </div>
    `;
  }

  /* STATION OVERVIEW CARD */
  renderStationOverview(st) {
    this.outputContainer.innerHTML = `
      <div class="omni-response-card">
        <div class="omni-response-header">
          <div class="omni-response-title">
            <span>🇮🇳 ${st.name.toUpperCase()} // STATION MISSION OVERVIEW</span>
            <span style="font-size:0.75rem; color:var(--polar-cyan); font-family:var(--font-mono);">${st.coords}</span>
          </div>
          <button class="omni-close-out-btn" onclick="window.omniQuery.hideOutput()">&times;</button>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:10px;">
          <div class="omni-metric-tile"><div class="title">TEMPERATURE</div><div class="val">${st.weather.temp}°C</div></div>
          <div class="omni-metric-tile"><div class="title">POWER DEMAND</div><div class="val">${st.energy.totalDemand} kW</div></div>
          <div class="omni-metric-tile"><div class="title">FUEL RESERVE</div><div class="val">${st.resources.fuelPercent}%</div></div>
          <div class="omni-metric-tile"><div class="title">FOOD AUTONOMY</div><div class="val">${st.resources.foodDaysLeft} Days</div></div>
          <div class="omni-metric-tile"><div class="title">CREW ON STATION</div><div class="val">${st.population} Personnel</div></div>
        </div>

        <div class="omni-action-row">
          <button class="action-btn-sm" onclick="window.omniQuery.processQuery('cctv')">📹 Open Station CCTV</button>
          <button class="action-btn-sm" onclick="window.omniQuery.processQuery('convoy')">🚜 Track Convoys</button>
          <button class="action-btn-sm" onclick="document.querySelector('[data-tab=\\'controls\\']').click();">🎛 Open Control Studio</button>
        </div>
      </div>
    `;
  }

  /* SUCCESS CARD FOR DIRECT ACTIONS */
  renderSuccessCard(msg, topic) {
    if (window.voiceAlerts) window.voiceAlerts.speak(msg, "normal");
    this.outputContainer.innerHTML = `
      <div class="omni-response-card" style="border-color:var(--status-nominal); background:rgba(6, 25, 23, 0.95);">
        <div class="omni-response-header">
          <div class="omni-response-title" style="color:var(--status-nominal);">
            <span>✓ MISSION DIRECTIVE EXECUTED</span>
          </div>
          <button class="omni-close-out-btn" onclick="window.omniQuery.hideOutput()">&times;</button>
        </div>
        <div style="font-size:0.95rem; color:#ffffff; line-height:1.5;">${msg}</div>
        <div class="omni-action-row">
          <button class="action-btn-sm" onclick="window.omniQuery.processQuery('${topic}')">
            View Updated ${topic.toUpperCase()} Status ➔
          </button>
        </div>
      </div>
    `;
  }

  /* GENERIC ASSISTANT FALLBACK */
  renderGenericAssistant(q, st) {
    this.outputContainer.innerHTML = `
      <div class="omni-response-card">
        <div class="omni-response-header">
          <div class="omni-response-title">
            <span style="color:var(--polar-cyan);">🤖 MISSION INTELLIGENCE:</span>
            <span>Query Result for "${q}"</span>
          </div>
          <button class="omni-close-out-btn" onclick="window.omniQuery.hideOutput()">&times;</button>
        </div>
        <div style="font-size:0.85rem; color:#cbd5e1; line-height:1.6;">
          Processed query regarding <strong>"${q}"</strong>. Below are quick actionable views matching your operational request:
        </div>
        <div class="omni-action-row">
          <button class="action-btn-sm" onclick="window.omniQuery.processQuery('food cctv')">📹 Food CCTV</button>
          <button class="action-btn-sm" onclick="window.omniQuery.processQuery('fuel status')">🛢 Fuel Status</button>
          <button class="action-btn-sm" onclick="window.omniQuery.processQuery('convoy')">🚜 Polar Convoys</button>
          <button class="action-btn-sm" onclick="window.omniQuery.processQuery('cctv')">🎥 All Surveillance</button>
          <button class="action-btn-sm" onclick="window.omniQuery.processQuery('power')">⚡ Power Grid</button>
        </div>
      </div>
    `;
  }

  /* Camera optical/flir/nvg mode toggle */
  setCamFilter(boxId, mode, btn) {
    const box = document.getElementById(boxId);
    if (!box) return;
    box.classList.remove('flir-mode', 'nvg-mode');
    if (mode === 'flir') box.classList.add('flir-mode');
    if (mode === 'nvg') box.classList.add('nvg-mode');

    box.querySelectorAll('.omni-filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
  }
}

window.omniQuery = new OmniQueryAssistant();
