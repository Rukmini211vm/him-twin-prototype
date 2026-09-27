/* ===================================================================
   MAIN APPLICATION ORCHESTRATOR - HIM-TWIN
   Antarctic Digital Twin Mission Control
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize sub-modules
  window.digitalTwin.init();
  window.polarMap.init();
  window.commandSystem.init();
  window.offlineSync.init();
  window.simulationEngine.init();
  window.omniQuery.init();

  initClocks();
  initStationNav();
  initTabs();
  initRibbonClicks();
  initCameraControls();
  initHeaderActions();
  initTelemetryListener();
  initInteractiveStudio();
  initOmniHintCycler();

  // Initial render
  updateMetricRibbon();
});

/* 0. Omni-Query Hint Cycler (typewriter-style rotating hints) */
function initOmniHintCycler() {
  const hints = [
    'Try "how fuel is there" or "simulate fuel dropping alert"',
    'Try "empty cans alert" to audit limited canned food rations',
    'Try "food status" to see ration levels and 12.5 days autonomy',
    'Try "water status" to inspect the Priyadarshini lake intake & heating',
    'Try "power status" to view the microgrid and renewable generation mix',
    'Try "crew life support" to check 23 personnel vitals & +21°C habitat heat',
    'Try "fuel cctv" to open the live fuel farm surveillance feed',
    'Try "show all cameras" to open the 5-feed CCTV surveillance wall',
    'Try "add food 1500" to log an emergency rations delivery to station',
    'Try "add fuel 5000" to record a polar fuel resupply to the tank farm',
    'Try "convoy status" to track overland expedition vehicles on the radar',
    'Try "weather status" to check polar METAR and katabatic wind speeds',
    'Try "set temp -58" to inject a custom sub-zero temperature into the twin',
    'Try "reroute" to redirect Convoy Alpha around the blizzard hazard zone',
    'Try "reset alarms" to clear all active station anomaly alerts',
  ];
  const el = document.getElementById('omni-hint-text');
  if (!el) return;

  let idx = 0;
  setInterval(() => {
    el.style.opacity = '0';
    setTimeout(() => {
      idx = (idx + 1) % hints.length;
      el.textContent = hints[idx];
      el.style.opacity = '1';
    }, 400);
  }, 4000);

  el.style.transition = 'opacity 0.4s ease';
}

/* 1. Clocks (UTC & IST) */
function initClocks() {
  const updateTimes = () => {
    const now = new Date();
    const utcHours = String(now.getUTCHours()).padStart(2, '0');
    const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
    const utcSeconds = String(now.getUTCSeconds()).padStart(2, '0');

    // IST is UTC + 5:30
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const istHours = String(istTime.getUTCHours()).padStart(2, '0');
    const istMinutes = String(istTime.getUTCMinutes()).padStart(2, '0');
    const istSeconds = String(istTime.getUTCSeconds()).padStart(2, '0');

    const utcEl = document.getElementById('utc-clock');
    const istEl = document.getElementById('ist-clock');
    if (utcEl) utcEl.textContent = `${utcHours}:${utcMinutes}:${utcSeconds} UTC`;
    if (istEl) istEl.textContent = `${istHours}:${istMinutes}:${istSeconds} IST`;
  };

  updateTimes();
  setInterval(updateTimes, 1000);
}

/* 2. Station Selection Navigation */
function initStationNav() {
  const btns = document.querySelectorAll('.station-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const st = btn.dataset.station;
      window.telemetry.setStation(st);
      updateMetricRibbon();

      // Update station label header
      const subLabel = document.getElementById('header-station-name');
      if (subLabel) {
        if (st === 'bharati') subLabel.textContent = 'BHARATI STATION // LARSEMANN HILLS (69°24′S)';
        else if (st === 'maitri') subLabel.textContent = 'MAITRI STATION // SCHIRMACHER OASIS (70°45′S)';
        else subLabel.textContent = 'DUAL STATION OPERATIONS // MAITRI & BHARATI';
      }
    });
  });
}

/* 3. View Tabs */
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-content-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const target = btn.dataset.tab;
      const targetPanel = document.getElementById(`tab-${target}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }

      // If switching to logistics map, resize canvas
      if (target === 'logistics' && window.polarMap) {
        setTimeout(() => {
          window.polarMap.resizeCanvas();
          window.polarMap.updateHUD();
        }, 50);
      }
    });
  });
}

/* 3b. Metric Ribbon Quick-Navigation */
function initRibbonClicks() {
  const switchTab = (tabName) => {
    const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    if (tabBtn) tabBtn.click();
  };

  const tempCard = document.getElementById('card-metric-temp');
  if (tempCard) {
    tempCard.setAttribute('title', 'Click to open Polar Weather & Environment Studio');
    tempCard.addEventListener('click', () => switchTab('controls'));
  }

  const windCard = document.getElementById('card-metric-wind');
  if (windCard) {
    windCard.setAttribute('title', 'Click to open Polar Weather & Environment Studio');
    windCard.addEventListener('click', () => switchTab('controls'));
  }

  const powerCard = document.getElementById('card-metric-power');
  if (powerCard) {
    powerCard.setAttribute('title', 'Click to open Energy & Power Grid');
    powerCard.addEventListener('click', () => switchTab('energy'));
  }

  const fuelCard = document.getElementById('card-metric-fuel');
  if (fuelCard) {
    fuelCard.setAttribute('title', 'Click to inspect Fuel Storage & Inventory');
    fuelCard.addEventListener('click', () => {
      // Also open fuel asset drawer if digital twin is ready
      if (window.digitalTwin) {
        const st = window.telemetry ? window.telemetry.currentStation : 'bharati';
        const fuelAssetId = (st === 'maitri') ? 'mtr_fuel_farm' : 'bht_fuel_bay';
        window.digitalTwin.openAssetDrawer(fuelAssetId);
      }
    });
  }

  const foodCard = document.getElementById('card-metric-food');
  if (foodCard) {
    foodCard.setAttribute('title', 'Click to open Resources & Inventory');
    foodCard.addEventListener('click', () => switchTab('inventory'));
  }

  const alertCard = document.getElementById('card-metric-alerts');
  if (alertCard) {
    alertCard.setAttribute('title', 'Click to view AI Predictive Intelligence & Active Alerts');
    alertCard.addEventListener('click', () => switchTab('ai'));
  }
}

/* 4. CCTV Camera Controls (Thermal, Nightvision, Normal) */
function initCameraControls() {
  const modeBtns = document.querySelectorAll('.cam-mode-btn');
  modeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const parentCard = btn.closest('.cam-feed-card');
      const mode = btn.dataset.mode;

      parentCard.querySelectorAll('.cam-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      parentCard.classList.remove('thermal', 'nightvision');
      if (mode === 'thermal') parentCard.classList.add('thermal');
      if (mode === 'nv') parentCard.classList.add('nightvision');
    });
  });

  // Timestamp ticker in camera feeds
  setInterval(() => {
    const timeStr = new Date().toISOString().substring(0, 19).replace('T', ' ') + ' UTC';
    document.querySelectorAll('.cam-timestamp').forEach(el => {
      el.textContent = timeStr;
    });
  }, 1000);
}

/* 5. Header Actions (SOS, Voice Mute, Simulation) */
function initHeaderActions() {
  // SOS Emergency Trigger
  const sosBtn = document.getElementById('btn-header-sos');
  if (sosBtn) {
    sosBtn.addEventListener('click', () => {
      const st = window.telemetry.getActiveStation();
      if (window.voiceAlerts) {
        window.voiceAlerts.speak(
          `Attention all personnel. General station emergency protocol declared at ${st.name}. Immediate priority status. All units report to muster stations.`,
          'critical'
        );
      }
      window.commandSystem.sendCommand(`EMERGENCY BROADCAST: Station SOS Triggered at ${st.name}`);
    });
  }

  // Audio mute toggle
  const audioToggle = document.getElementById('btn-audio-toggle');
  if (audioToggle) {
    audioToggle.addEventListener('click', () => {
      const isMuted = !window.voiceAlerts.muted;
      window.voiceAlerts.setMuted(isMuted);
      if (isMuted) {
        audioToggle.classList.remove('active');
        audioToggle.innerHTML = `🔇 AUDIO MUTED`;
      } else {
        audioToggle.classList.add('active');
        audioToggle.innerHTML = `🔊 VOICE ALERTS ON`;
        window.voiceAlerts.speak("Voice alert synthesis online. Audio channel verified.", "normal");
      }
    });
  }

  // Drawer Close Button
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', () => {
      window.digitalTwin.closeAssetDrawer();
    });
  }
}

/* 6. Telemetry Event Listener */
function initTelemetryListener() {
  document.addEventListener('telemetry-updated', () => {
    updateMetricRibbon();
    updateResourceBars();
  });
}

function updateMetricRibbon() {
  const st = window.telemetry.getActiveStation();
  if (!st) return;

  // Temperature
  const tempEl = document.getElementById('metric-temp');
  if (tempEl) tempEl.textContent = `${st.weather.temp}°C`;

  const windChillEl = document.getElementById('metric-windchill');
  if (windChillEl) windChillEl.textContent = `Wind Chill ${st.weather.windChill}°C`;

  // Wind
  const windEl = document.getElementById('metric-wind');
  if (windEl) windEl.textContent = `${st.weather.windSpeed} kts`;

  const windDirEl = document.getElementById('metric-wind-dir');
  if (windDirEl) windDirEl.textContent = `${st.weather.windDir} (Gusts ${st.weather.windGust})`;

  // Power Demand
  const powerEl = document.getElementById('metric-power');
  if (powerEl) powerEl.textContent = `${st.energy.totalDemand} kW`;

  // Fuel Autonomy
  const fuelEl = document.getElementById('metric-fuel');
  const fuelDaysEl = document.getElementById('metric-fuel-days');
  const fuelCard = document.getElementById('card-metric-fuel');
  if (fuelEl) fuelEl.textContent = `${st.resources.fuelPercent}%`;
  if (fuelDaysEl) fuelDaysEl.textContent = `${st.resources.fuelDaysLeft} Days Autonomy`;

  if (fuelCard) {
    fuelCard.classList.remove('warning', 'critical');
    if (st.resources.fuelPercent <= 20) {
      fuelCard.classList.add('critical');
    } else if (st.resources.fuelPercent <= 35) {
      fuelCard.classList.add('warning');
    }
  }

  // Food Reserve
  const foodEl = document.getElementById('metric-food');
  const foodDaysEl = document.getElementById('metric-food-days');
  const foodCard = document.getElementById('card-metric-food');
  if (foodEl) foodEl.textContent = `${st.resources.foodStockKg} kg`;
  if (foodDaysEl) foodDaysEl.textContent = `${st.resources.foodDaysLeft} Days Remaining`;

  if (foodCard) {
    foodCard.classList.remove('warning', 'critical');
    if (st.resources.foodDaysLeft <= 15) {
      foodCard.classList.add('warning');
    }
  }

  // Active Alerts Count
  const alertsEl = document.getElementById('metric-alerts');
  if (alertsEl) alertsEl.textContent = st.alerts.length;

  // Synchronize controls with active station state (if user isn't currently dragging slider)
  syncControlsToTelemetry(st);
}

function updateResourceBars() {
  const st = window.telemetry.getActiveStation();
  if (!st) return;

  // Fuel bar
  const fuelFill = document.getElementById('bar-fuel-fill');
  if (fuelFill) {
    fuelFill.style.width = `${st.resources.fuelPercent}%`;
    fuelFill.classList.remove('warning', 'critical');
    if (st.resources.fuelPercent <= 20) fuelFill.classList.add('critical');
    else if (st.resources.fuelPercent <= 40) fuelFill.classList.add('warning');
  }

  // Water bar
  const waterFill = document.getElementById('bar-water-fill');
  if (waterFill) {
    const waterPct = Math.round((st.resources.waterLiters / st.resources.waterCapacity) * 100);
    waterFill.style.width = `${waterPct}%`;
  }
}

/* ===================================================================
   7. INTERACTIVE INPUT STUDIO CONTROLLER
   Empowers user to directly manipulate parameters, dispatch convoys,
   control power grid loads, and stress-test digital twin in real time
   =================================================================== */
function initInteractiveStudio() {
  // Header button to jump directly to controls
  const headerControlsBtn = document.getElementById('btn-header-controls');
  if (headerControlsBtn) {
    headerControlsBtn.addEventListener('click', () => {
      const tabBtn = document.getElementById('btn-tab-controls');
      if (tabBtn) tabBtn.click();
    });
  }

  /* --- 1. Weather Inputs --- */
  const tempSlider = document.getElementById('ctrl-temp');
  const tempVal = document.getElementById('val-ctrl-temp');
  const chillVal = document.getElementById('val-ctrl-chill');
  if (tempSlider) {
    tempSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (tempVal) tempVal.textContent = `${val}°C`;
      const currentStation = window.telemetry.currentStation;
      window.telemetry.setUserWeather(currentStation, { temp: val });
    });
  }

  const windSlider = document.getElementById('ctrl-wind');
  const windVal = document.getElementById('val-ctrl-wind');
  if (windSlider) {
    windSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (windVal) windVal.textContent = `${val} kts`;
      const currentStation = window.telemetry.currentStation;
      window.telemetry.setUserWeather(currentStation, { windSpeed: val });
    });
  }

  const blizzardBtn = document.getElementById('ctrl-btn-blizzard');
  if (blizzardBtn) {
    blizzardBtn.addEventListener('click', () => {
      const st = window.telemetry.getActiveStation();
      const nextState = !st.weather.blizzardWarning;
      window.telemetry.setUserWeather(window.telemetry.currentStation, {
        windSpeed: nextState ? 82 : 36,
        isBlizzard: nextState
      });
      showToast(nextState ? "⚠ Katabatic Whiteout Blizzard Engaged!" : "Weather Normalized. Storm Cleared.", nextState ? "warning" : "nominal");
    });
  }

  // Weather presets
  const presetCalm = document.getElementById('preset-weather-calm');
  if (presetCalm) {
    presetCalm.addEventListener('click', () => {
      window.telemetry.setUserWeather(window.telemetry.currentStation, { temp: -18.0, windSpeed: 15, isBlizzard: false });
      showToast("Applied Summer Calm Weather Preset (-18°C, 15 kts)");
    });
  }
  const presetNominal = document.getElementById('preset-weather-nominal');
  if (presetNominal) {
    presetNominal.addEventListener('click', () => {
      window.telemetry.setUserWeather(window.telemetry.currentStation, { temp: -36.8, windSpeed: 46, isBlizzard: false });
      showToast("Applied Standard Polar Weather Preset (-36.8°C, 46 kts)");
    });
  }
  const presetPolar = document.getElementById('preset-weather-polar');
  if (presetPolar) {
    presetPolar.addEventListener('click', () => {
      window.telemetry.setUserWeather(window.telemetry.currentStation, { temp: -58.0, windSpeed: 75, isBlizzard: true });
      showToast("Applied Deep Freeze Blizzard Preset (-58°C, 75 kts)", "warning");
    });
  }

  /* --- 2. Microgrid & Power Inputs --- */
  const dg1Slider = document.getElementById('ctrl-dg1-load');
  const dg1Val = document.getElementById('val-ctrl-dg1');
  if (dg1Slider) {
    dg1Slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (dg1Val) dg1Val.textContent = `${val} kW`;
      window.telemetry.setUserEnergy(window.telemetry.currentStation, { dg1Load: val });
    });
  }

  const dg2Slider = document.getElementById('ctrl-dg2-load');
  const dg2Val = document.getElementById('val-ctrl-dg2');
  if (dg2Slider) {
    dg2Slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (dg2Val) dg2Val.textContent = `${val} kW`;
      window.telemetry.setUserEnergy(window.telemetry.currentStation, { dg2Load: val, dg2Status: val > 0 ? 'RUNNING' : 'STANDBY' });
    });
  }

  const dg1ToggleBtn = document.getElementById('ctrl-btn-dg1-toggle');
  if (dg1ToggleBtn) {
    dg1ToggleBtn.addEventListener('click', () => {
      const st = window.telemetry.getActiveStation();
      const isOff = st.energy.dg1Status === 'OFF';
      window.telemetry.setUserEnergy(window.telemetry.currentStation, {
        dg1Status: isOff ? 'RUNNING' : 'OFF',
        dg1Load: isOff ? 68 : 0
      });
      showToast(isOff ? "DG-1 Primary Diesel Started" : "DG-1 Primary Diesel Stopped (Station on Battery!)", isOff ? "nominal" : "warning");
    });
  }

  const dg2ToggleBtn = document.getElementById('ctrl-btn-dg2-toggle');
  if (dg2ToggleBtn) {
    dg2ToggleBtn.addEventListener('click', () => {
      const st = window.telemetry.getActiveStation();
      const isRunning = st.energy.dg2Status === 'RUNNING';
      window.telemetry.setUserEnergy(window.telemetry.currentStation, {
        dg2Status: isRunning ? 'STANDBY' : 'RUNNING',
        dg2Load: isRunning ? 0 : 45
      });
      showToast(isRunning ? "DG-2 Switched to Armed Standby" : "DG-2 Switched to Active Generation (+45 kW)");
    });
  }

  const solarSlider = document.getElementById('ctrl-solar');
  const solarVal = document.getElementById('val-ctrl-solar');
  if (solarSlider) {
    solarSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (solarVal) solarVal.textContent = `${val} kW`;
      window.telemetry.setUserEnergy(window.telemetry.currentStation, { solarGen: val });
    });
  }

  const windGenSlider = document.getElementById('ctrl-windgen');
  const windGenVal = document.getElementById('val-ctrl-windgen');
  if (windGenSlider) {
    windGenSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (windGenVal) windGenVal.textContent = `${val} kW`;
      window.telemetry.setUserEnergy(window.telemetry.currentStation, { windGen: val });
    });
  }

  const demandSlider = document.getElementById('ctrl-demand');
  const demandVal = document.getElementById('val-ctrl-demand');
  if (demandSlider) {
    demandSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (demandVal) demandVal.textContent = `${val} kW`;
      window.telemetry.setUserEnergy(window.telemetry.currentStation, { baseDemand: val });
    });
  }

  /* --- 3. Inventory & Consumables --- */
  const fuelSlider = document.getElementById('ctrl-fuel-range');
  const fuelVal = document.getElementById('val-ctrl-fuel');
  if (fuelSlider) {
    fuelSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (fuelVal) fuelVal.textContent = `${val.toLocaleString()} L`;
      window.telemetry.setUserResource(window.telemetry.currentStation, 'fuel', val);
    });
  }

  const foodInput = document.getElementById('ctrl-food-input');
  if (foodInput) {
    foodInput.addEventListener('change', (e) => {
      window.telemetry.setUserResource(window.telemetry.currentStation, 'food', e.target.value);
      showToast(`Food Stock updated to ${e.target.value} kg`);
    });
  }

  const waterInput = document.getElementById('ctrl-water-input');
  if (waterInput) {
    waterInput.addEventListener('change', (e) => {
      window.telemetry.setUserResource(window.telemetry.currentStation, 'water', e.target.value);
      showToast(`Potable Water updated to ${e.target.value} L`);
    });
  }

  const crewInput = document.getElementById('ctrl-crew-input');
  if (crewInput) {
    crewInput.addEventListener('change', (e) => {
      window.telemetry.setUserResource(window.telemetry.currentStation, 'crew', e.target.value);
      showToast(`Station population set to ${e.target.value} crew members`);
    });
  }

  // Quick shipment buttons
  const addFuelBtn = document.getElementById('btn-add-fuel-5k');
  if (addFuelBtn) {
    addFuelBtn.addEventListener('click', () => {
      window.telemetry.logResourceTransaction(window.telemetry.currentStation, {
        type: 'fuel',
        amount: 5000,
        note: 'Quick Resupply Delivery logged by mission controller.'
      });
      showToast("Recorded +5,000 L Polar Jet Fuel Delivery", "nominal");
    });
  }

  const addFoodBtn = document.getElementById('btn-add-food-1k');
  if (addFoodBtn) {
    addFoodBtn.addEventListener('click', () => {
      window.telemetry.logResourceTransaction(window.telemetry.currentStation, {
        type: 'food',
        amount: 1500,
        note: 'Fresh Provisions & Rations Airbridge Delivery.'
      });
      showToast("Recorded +1,500 kg Food Rations Delivery", "nominal");
    });
  }

  const drainFuelBtn = document.getElementById('btn-drain-fuel-leak');
  if (drainFuelBtn) {
    drainFuelBtn.addEventListener('click', () => {
      window.telemetry.logResourceTransaction(window.telemetry.currentStation, {
        type: 'fuel',
        amount: -15000,
        note: 'Severe Fuel Line Rupture / Rapid Drainage Logged!'
      });
      showToast("Simulated -15,000 L Fuel Farm Leak Incident!", "warning");
    });
  }

  /* --- 4. Anomaly Injection --- */
  const btnInjBlizzard = document.getElementById('btn-inject-blizzard');
  if (btnInjBlizzard) btnInjBlizzard.addEventListener('click', () => {
    window.telemetry.injectCustomAnomaly('blizzard');
    showToast("ANOMALY INJECTED: Whiteout Katabatic Blizzard Surge!", "warning");
  });

  const btnInjFuel = document.getElementById('btn-inject-fuel');
  if (btnInjFuel) btnInjFuel.addEventListener('click', () => {
    window.telemetry.injectCustomAnomaly('fuel_leak');
    showToast("ANOMALY INJECTED: Fuel Reserve Dropped to Critical 14%!", "warning");
  });

  const btnInjGen = document.getElementById('btn-inject-gen');
  if (btnInjGen) btnInjGen.addEventListener('click', () => {
    window.telemetry.injectCustomAnomaly('generator_trip');
    showToast("ANOMALY INJECTED: Primary DG-1 Overheat Breaker Tripped!", "warning");
  });

  const btnInjWater = document.getElementById('btn-inject-water');
  if (btnInjWater) btnInjWater.addEventListener('click', () => {
    window.telemetry.injectCustomAnomaly('water_freeze');
    showToast("ANOMALY INJECTED: Priyadarshini Water Inlet Freezing!", "warning");
  });

  const btnResolveAll = document.getElementById('btn-resolve-all-anomalies');
  if (btnResolveAll) btnResolveAll.addEventListener('click', () => {
    window.telemetry.resolveCustomAnomaly('all');
    showToast("All station systems restored to nominal operating parameters.", "nominal");
  });

  /* --- 5. Convoy Dispatch Form (Tab 2) --- */
  const convoySpeedSlider = document.getElementById('convoy-input-speed');
  const convoySpeedVal = document.getElementById('val-convoy-speed');
  if (convoySpeedSlider) {
    convoySpeedSlider.addEventListener('input', (e) => {
      if (convoySpeedVal) convoySpeedVal.textContent = `${e.target.value} km/h`;
    });
  }

  const dispatchConvoyBtn = document.getElementById('btn-dispatch-new-convoy');
  if (dispatchConvoyBtn) {
    dispatchConvoyBtn.addEventListener('click', () => {
      const name = document.getElementById('convoy-input-name')?.value || 'Convoy Charlie';
      const vehicleType = document.getElementById('convoy-input-vehicle')?.value || 'PistenBully PB-300';
      const dest = document.getElementById('convoy-input-dest')?.value || 'Maitri Station';
      const cargoType = document.getElementById('convoy-input-cargotype')?.value || 'fuel';
      const speedKmH = document.getElementById('convoy-input-speed')?.value || 22;

      let cargo = '10,000 L Arctic Jet Fuel';
      let cargoAmount = 10000;
      if (cargoType === 'food') { cargo = '2,500 kg Winter Food Rations'; cargoAmount = 2500; }
      else if (cargoType === 'water') { cargo = '5,000 L Potable Snowmelt'; cargoAmount = 5000; }

      if (window.polarMap) {
        window.polarMap.dispatchUserConvoy({
          name,
          vehicleType,
          origin: dest.includes('Maitri') ? 'Coastal Depot (DG)' : 'Prydz Bay Pier',
          dest,
          cargo,
          cargoType,
          cargoAmount,
          speedKmH
        });
        showToast(`🚀 Dispatched ${name} bound for ${dest}!`, "nominal");
      }
    });
  }

  const rerouteBtn = document.getElementById('btn-reroute-selected-convoy');
  if (rerouteBtn) {
    rerouteBtn.addEventListener('click', () => {
      if (window.polarMap) {
        window.polarMap.rerouteSelectedConvoy();
        showToast("Rerouted Convoy onto Blue Ice Ridge (Blizzard Bypassed)", "nominal");
      }
    });
  }

  /* --- 6. Asset Drawer Interactive Overrides --- */
  const drawerThrottle = document.getElementById('drawer-throttle-slider');
  const drawerThrottleVal = document.getElementById('drawer-throttle-val');
  if (drawerThrottle) {
    drawerThrottle.addEventListener('input', (e) => {
      if (drawerThrottleVal) drawerThrottleVal.textContent = `${e.target.value}%`;
    });
  }

  const btnApplyDrawer = document.getElementById('btn-apply-drawer-ctrl');
  if (btnApplyDrawer) {
    btnApplyDrawer.addEventListener('click', () => {
      const assetTitle = document.getElementById('drawer-asset-title')?.textContent || 'Asset';
      const status = document.getElementById('drawer-status-select')?.value || 'nominal';
      const throttle = document.getElementById('drawer-throttle-slider')?.value || 100;

      const drawerStatusEl = document.getElementById('drawer-asset-status');
      if (drawerStatusEl) {
        drawerStatusEl.textContent = `Operating at ${throttle}% duty (${status.toUpperCase()})`;
        drawerStatusEl.style.color = status === 'critical' ? '#ef4444' : status === 'advisory' ? '#f59e0b' : '#10b981';
      }
      showToast(`Updated ${assetTitle}: ${throttle}% throttle, status ${status.toUpperCase()}`, "nominal");
      if (window.commandSystem) {
        window.commandSystem.sendCommand(`OVERRIDE SETPOINT: ${assetTitle} at ${throttle}% duty cycle`);
      }
    });
  }
}

function syncControlsToTelemetry(st) {
  if (!st) return;

  const stationTag = document.getElementById('hud-station-tag');
  if (stationTag) stationTag.textContent = st.name.toUpperCase();

  // Weather
  const tempSlider = document.getElementById('ctrl-temp');
  if (tempSlider && document.activeElement !== tempSlider) {
    tempSlider.value = st.weather.temp;
    const tempVal = document.getElementById('val-ctrl-temp');
    if (tempVal) tempVal.textContent = `${st.weather.temp}°C`;
  }
  const windSlider = document.getElementById('ctrl-wind');
  if (windSlider && document.activeElement !== windSlider) {
    windSlider.value = st.weather.windSpeed;
    const windVal = document.getElementById('val-ctrl-wind');
    if (windVal) windVal.textContent = `${st.weather.windSpeed} kts`;
  }
  const chillVal = document.getElementById('val-ctrl-chill');
  if (chillVal) chillVal.textContent = `${st.weather.windChill}°C`;

  // Energy
  const dg1Slider = document.getElementById('ctrl-dg1-load');
  if (dg1Slider && document.activeElement !== dg1Slider) {
    dg1Slider.value = st.energy.dg1Load;
    const dg1Val = document.getElementById('val-ctrl-dg1');
    if (dg1Val) dg1Val.textContent = `${st.energy.dg1Load} kW`;
  }

  const dg2Val = document.getElementById('val-ctrl-dg2');
  if (dg2Val) dg2Val.textContent = `${st.energy.dg2Load || 0} kW`;

  const dg1Btn = document.getElementById('ctrl-btn-dg1-toggle');
  if (dg1Btn) {
    const isRunning = st.energy.dg1Status !== 'OFF' && !st.energy.dg1Status?.includes('TRIP');
    dg1Btn.className = isRunning ? 'action-btn-sm success' : 'action-btn-sm danger';
    dg1Btn.textContent = `DG-1: ${st.energy.dg1Status || 'RUNNING'}`;
  }

  const dg2Btn = document.getElementById('ctrl-btn-dg2-toggle');
  if (dg2Btn) {
    const isRunning = st.energy.dg2Status === 'RUNNING';
    dg2Btn.className = isRunning ? 'action-btn-sm success' : 'action-btn-sm';
    dg2Btn.textContent = `DG-2: ${st.energy.dg2Status || 'STANDBY'}`;
  }

  // Net power balance indicator
  const netBadge = document.getElementById('val-ctrl-netpower');
  if (netBadge) {
    const totalGen = (st.energy.dg1Status === 'OFF' ? 0 : st.energy.dg1Load) +
                     (st.energy.dg2Status !== 'RUNNING' ? 0 : st.energy.dg2Load) +
                     st.energy.solarGen + st.energy.windGen;
    const net = Math.round((totalGen - st.energy.totalDemand) * 10) / 10;
    if (net >= 0) {
      netBadge.textContent = `SURPLUS +${net} kW`;
      netBadge.style.color = '#10b981';
      netBadge.style.borderColor = '#10b981';
    } else {
      netBadge.textContent = `DEFICIT ${net} kW (BESS DISCHARGING)`;
      netBadge.style.color = '#ef4444';
      netBadge.style.borderColor = '#ef4444';
    }
  }

  // Fuel & resources
  const fuelSlider = document.getElementById('ctrl-fuel-range');
  if (fuelSlider && document.activeElement !== fuelSlider) {
    fuelSlider.value = st.resources.fuelLiters;
    const fuelVal = document.getElementById('val-ctrl-fuel');
    if (fuelVal) fuelVal.textContent = `${st.resources.fuelLiters.toLocaleString()} L (${st.resources.fuelPercent}%)`;
  }
  const fuelDaysBadge = document.getElementById('val-ctrl-fueldays');
  if (fuelDaysBadge) fuelDaysBadge.textContent = `${st.resources.fuelDaysLeft} DAYS AUTONOMY`;

  const foodInput = document.getElementById('ctrl-food-input');
  if (foodInput && document.activeElement !== foodInput) {
    foodInput.value = st.resources.foodStockKg;
  }
  const waterInput = document.getElementById('ctrl-water-input');
  if (waterInput && document.activeElement !== waterInput) {
    waterInput.value = st.resources.waterLiters;
  }
  const crewInput = document.getElementById('ctrl-crew-input');
  if (crewInput && document.activeElement !== crewInput) {
    crewInput.value = st.population;
  }
}

/* Toast Message Notification */
function showToast(message, type = 'nominal') {
  const existing = document.querySelector('.input-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'input-toast';
  toast.style.borderColor = type === 'warning' ? '#ef4444' : type === 'nominal' ? '#10b981' : 'var(--polar-cyan)';
  toast.innerHTML = `
    <span style="font-size: 1.2rem;">${type === 'warning' ? '🚨' : type === 'nominal' ? '✓' : '⚡'}</span>
    <span style="font-family: var(--font-body);">${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
