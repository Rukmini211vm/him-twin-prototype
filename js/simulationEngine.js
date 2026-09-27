/* ===================================================================
   EMERGENCY SIMULATION & DECISION SUPPORT RUNNER
   Step-by-step automated mission workflow demonstrator
   =================================================================== */

class EmergencySimulationEngine {
  constructor() {
    this.modal = document.getElementById('sim-modal-overlay');
    this.stepContainer = document.getElementById('sim-step-list');
    this.isRunning = false;
    this.currentStepIdx = 0;
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    const launchBtn = document.getElementById('btn-launch-sim');
    const closeBtn = document.getElementById('btn-close-sim');
    const startSimBtn = document.getElementById('btn-start-scenario-1');

    if (launchBtn) launchBtn.addEventListener('click', () => this.openModal());
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
    if (startSimBtn) startSimBtn.addEventListener('click', () => this.runScenario1FuelCrisis());

    const scenario2Btn = document.getElementById('btn-start-scenario-2');
    if (scenario2Btn) scenario2Btn.addEventListener('click', () => this.runScenario2Blizzard());

    const scenario3Btn = document.getElementById('btn-start-scenario-3');
    if (scenario3Btn) scenario3Btn.addEventListener('click', () => this.runScenario3GeneratorFailover());

    // Backdrop click closes modal
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeModal();
      });
    }

    // ESC key closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });
  }

  openModal() {
    if (this.modal) this.modal.classList.add('active');
  }

  closeModal() {
    if (this.modal) this.modal.classList.remove('active');
    // Reset so scenarios can be re-run after re-opening
    this.isRunning = false;
  }


  /* Scenario 1: Fuel Depletion & Resupply Protocol (Exact prompt requirement) */
  runScenario1FuelCrisis() {
    this.openModal();
    if (this.isRunning) return;
    this.isRunning = true;

    // Switch view to Maitri station where fuel crisis occurs
    window.telemetry.setStation('maitri');

    const steps = [
      {
        text: 'Step 1: Telemetry reports fuel reserve drops below critical threshold (14.2%)',
        action: () => {
          window.telemetry.stations.maitri.resources.fuelPercent = 14.2;
          window.telemetry.stations.maitri.resources.fuelDaysLeft = 3.1;
          document.dispatchEvent(new CustomEvent('telemetry-updated'));
        }
      },
      {
        text: 'Step 2: Digital Twin highlights Maitri Fuel Farm in CRITICAL Red state',
        action: () => {
          const zone = document.getElementById('zone-mtr-fuel');
          if (zone) zone.classList.add('critical-alert');
        }
      },
      {
        text: 'Step 3: SOS Emergency Klaxon & Spoken Voice Announcement Activated',
        action: () => {
          if (window.voiceAlerts) {
            window.voiceAlerts.speak(
              "Critical fuel alert. Maitri station fuel reserve has reached a critical level. Estimated remaining operational duration is 36 hours. Immediate resupply required.",
              "critical"
            );
          }
        }
      },
      {
        text: 'Step 4: AI Engine predicts depletion in 36h under blizzard thermal load and recommends Convoy Alpha dispatch',
        action: () => {
          // Switch to logistics tab to show radar map
          const logTab = document.querySelector('[data-tab="logistics"]');
          if (logTab) logTab.click();
        }
      },
      {
        text: 'Step 5: Logistics assigns PistenBully PB-300 Convoy Alpha with 12,000L fuel sleds',
        action: () => {
          if (window.polarMap && window.polarMap.convoys[0]) {
            window.polarMap.convoys[0].status = 'EN_ROUTE';
            window.polarMap.convoys[0].speedKmH = 24.0;
            window.polarMap.selectedConvoy = window.polarMap.convoys[0];
            window.polarMap.updateHUD();
          }
        }
      },
      {
        text: 'Step 6: India Mission Control issues Priority Dispatch Command [CMD-9042]',
        action: () => {
          window.commandSystem.sendCommand('EMERGENCY DISPATCH: Fuel Sled Convoy Alpha to Maitri Station');
        }
      },
      {
        text: 'Step 7: Station Edge acknowledges command, logs telemetry handshake, and ETA locks to 3h 12m',
        action: () => {
          if (window.voiceAlerts) {
            window.voiceAlerts.speak("Operational command acknowledged by Maitri edge server. Polar convoy en route. Situation stabilized.", "normal");
          }
        }
      }
    ];

    this.renderSteps(steps);
    this.executeWorkflowSequence(steps);
  }

  /* Scenario 2: Severe Polar Blizzard & Convoy Reroute */
  runScenario2Blizzard() {
    this.openModal();
    if (this.isRunning) return;
    this.isRunning = true;

    const steps = [
      {
        text: 'Step 1: Meteorological station records Katabatic wind spike to 82 knots & 150m whiteout visibility',
        action: () => {
          window.telemetry.stations.maitri.weather.windSpeed = 82;
          window.telemetry.stations.maitri.weather.visibility = 150;
          window.telemetry.stations.maitri.weather.blizzardWarning = true;
          document.dispatchEvent(new CustomEvent('telemetry-updated'));
        }
      },
      {
        text: 'Step 2: Audible warning issued for severe Antarctic blizzard conditions',
        action: () => {
          if (window.voiceAlerts) {
            window.voiceAlerts.speak("Emergency weather alert. Katabatic wind velocity exceeds 80 knots. Severe whiteout conditions detected.", "critical");
          }
        }
      },
      {
        text: 'Step 3: AI Logistics detects crevasse bridge instability along primary Waypoint Delta',
        action: () => {
          const logTab = document.querySelector('[data-tab="logistics"]');
          if (logTab) logTab.click();
        }
      },
      {
        text: 'Step 4: AI recommends 14 km Ridge Bypass route to ensure vehicle safety',
        action: () => {
          if (window.polarMap && window.polarMap.convoys[0]) {
            window.polarMap.convoys[0].risk = 'HIGH (Rerouting via Ridge Bypass)';
            window.polarMap.updateHUD();
          }
        }
      },
      {
        text: 'Step 5: India authorizes dynamic route change; Convoy confirms coordinates',
        action: () => {
          window.commandSystem.sendCommand('AUTHORIZE REROUTE: Convoy Alpha via Eastern Ridge Corridor');
        }
      }
    ];

    this.renderSteps(steps);
    this.executeWorkflowSequence(steps);
  }

  /* Scenario 3: Generator Overheat & Automatic Microgrid Failover */
  runScenario3GeneratorFailover() {
    this.openModal();
    if (this.isRunning) return;
    this.isRunning = true;

    // Switch to Bharati
    window.telemetry.setStation('bharati');

    const steps = [
      {
        text: 'Step 1: Vibration sensor on Generator DG-1 spikes to 5.2 mm/s (Bearing anomaly)',
        action: () => {
          window.telemetry.stations.bharati.energy.dg1Health = 61;
          document.dispatchEvent(new CustomEvent('telemetry-updated'));
        }
      },
      {
        text: 'Step 2: AI Predictive System issues Early Warning of impending bearing seizure',
        action: () => {
          if (window.voiceAlerts) {
            window.voiceAlerts.speak("Infrastructure advisory. Generator DG-1 bearing vibration anomaly detected. Recommending failover to standby DG-2.", "warning");
          }
        }
      },
      {
        text: 'Step 3: Station Edge executes seamless closed-loop transfer: DG-2 starts & synchronizes bus',
        action: () => {
          window.telemetry.stations.bharati.energy.dg1Load = 0;
          window.telemetry.stations.bharati.energy.dg2Load = 72;
          window.telemetry.stations.bharati.energy.dg2Status = 'ACTIVE PRIMARY';
          document.dispatchEvent(new CustomEvent('telemetry-updated'));
        }
      },
      {
        text: 'Step 4: Mission Control receives automated failover telemetry; power grid remains nominal',
        action: () => {
          window.commandSystem.sendCommand('TELEMETRY AUDIT: DG-2 Synchronized. Power bus nominal at 400V 50Hz');
        }
      }
    ];

    this.renderSteps(steps);
    this.executeWorkflowSequence(steps);
  }

  renderSteps(steps) {
    if (!this.stepContainer) return;
    this.stepContainer.innerHTML = steps.map((s, idx) => `
      <div class="sim-step-item" id="sim-step-${idx}">
        <div class="sim-step-icon">○</div>
        <div>${s.text}</div>
      </div>
    `).join('');
  }

  executeWorkflowSequence(steps) {
    let current = 0;
    const nextStep = () => {
      if (current >= steps.length) {
        this.isRunning = false;
        return;
      }

      // Mark current
      const item = document.getElementById(`sim-step-${current}`);
      if (item) {
        item.classList.add('active');
        item.querySelector('.sim-step-icon').textContent = '▶';
      }

      // Execute action
      try {
        steps[current].action();
      } catch (e) {
        console.error('Sim step error', e);
      }

      setTimeout(() => {
        if (item) {
          item.classList.remove('active');
          item.classList.add('done');
          item.querySelector('.sim-step-icon').textContent = '✓';
        }
        current++;
        nextStep();
      }, 3500); // realistic readable pacing
    };

    nextStep();
  }
}

window.simulationEngine = new EmergencySimulationEngine();
