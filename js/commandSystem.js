/* ===================================================================
   TWO-WAY COMMAND & CLOSED-LOOP CONTROL SYSTEM
   India Mission Control ⇄ Antarctic Station Edge Handshake
   =================================================================== */

class CommandSystem {
  constructor() {
    this.commandHistory = [
      {
        id: 'CMD-8812',
        direction: 'India ➔ Bharati',
        action: 'Health Diagnostic Telemetry Request',
        status: 'ACKNOWLEDGED',
        time: '14:22:10 UTC'
      },
      {
        id: 'CMD-8811',
        direction: 'Bharati ➔ India',
        action: 'Atmospheric Physics Spectrometer Sync',
        status: 'DELIVERED',
        time: '14:15:02 UTC'
      },
      {
        id: 'CMD-8810',
        direction: 'India ➔ Maitri',
        action: 'Engage Lake Priyadarshini Trace Heat Cable #2',
        status: 'ACKNOWLEDGED & EXECUTED',
        time: '13:58:44 UTC'
      }
    ];
  }

  init() {
    this.bindEvents();
    this.renderHistory();
  }

  bindEvents() {
    const dispatchBtn = document.getElementById('btn-dispatch-cmd');
    const select = document.getElementById('cmd-select');
    const customInput = document.getElementById('custom-cmd-input');
    const customSendBtn = document.getElementById('btn-custom-cmd-send');

    if (dispatchBtn && select) {
      dispatchBtn.addEventListener('click', () => {
        const val = select.value;
        if (!val) return;
        this.sendCommand(val);
      });
    }

    if (customSendBtn && customInput) {
      const sendCustom = () => {
        const text = customInput.value.trim();
        if (!text) return;
        this.sendCommand(text);
        customInput.value = '';
      };
      customSendBtn.addEventListener('click', sendCustom);
      customInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendCustom();
      });
    }

    // Quick Command Chips
    document.querySelectorAll('.cmd-quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const cmd = chip.dataset.cmd || chip.textContent.trim();
        this.sendCommand(cmd);
      });
    });
  }

  sendCommand(actionText) {
    const station = window.telemetry ? window.telemetry.currentStation : 'bharati';
    const stName = station === 'maitri' ? 'Maitri' : 'Bharati';
    const isOffline = window.offlineSync ? window.offlineSync.isOffline : false;

    const cmdId = 'CMD-' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toISOString().substring(11, 19) + ' UTC';

    if (isOffline) {
      // Buffer command in offline store & forward queue
      window.offlineSync.queuePacket({
        type: 'COMMAND_OUTBOUND',
        id: cmdId,
        destination: stName,
        action: actionText,
        timestamp: now
      });

      const entry = {
        id: cmdId,
        direction: `India ➔ ${stName}`,
        action: actionText,
        status: 'QUEUED_OFFLINE (Store & Forward)',
        time: now
      };
      this.commandHistory.unshift(entry);
      this.renderHistory();
      if (window.voiceAlerts) window.voiceAlerts.playSirenTone('warning');
      return;
    }

    // Normal Online Two-Way Handshake Simulation
    const entry = {
      id: cmdId,
      direction: `India ➔ ${stName}`,
      action: actionText,
      status: 'TRANSMITTING...',
      time: now
    };
    this.commandHistory.unshift(entry);
    this.renderHistory();

    if (window.voiceAlerts) window.voiceAlerts.playSirenTone('ack');

    // Simulate round-trip latency & station edge acknowledgment
    setTimeout(() => {
      entry.status = 'STATION RECEIVED';
      this.renderHistory();

      setTimeout(() => {
        entry.status = 'ACKNOWLEDGED & EXECUTED';
        this.renderHistory();
        if (window.voiceAlerts) window.voiceAlerts.playSirenTone('ack');

        // Dynamic reactive execution based on command content:
        const lower = actionText.toLowerCase();

        // 1. Convoy dispatch / reroute
        if (lower.includes('dispatch') || lower.includes('alpha') || lower.includes('convoy')) {
          if (window.polarMap && window.polarMap.convoys[0]) {
            window.polarMap.convoys[0].status = 'EN_ROUTE';
            window.polarMap.convoys[0].speedKmH = 24.0;
            window.polarMap.renderConvoyList();
          }
        }
        if (lower.includes('reroute') || lower.includes('ridge')) {
          if (window.polarMap) window.polarMap.rerouteSelectedConvoy();
        }

        // 2. Power Grid & Generator switching
        if (lower.includes('dg-2') || lower.includes('generator') || lower.includes('power bus')) {
          if (window.telemetry) {
            window.telemetry.setUserEnergy(station, { dg2Status: 'RUNNING', dg2Load: 35 });
          }
        }

        // 3. Trace heating / Water pipe
        if (lower.includes('trace') || lower.includes('priyadarshini') || lower.includes('heat cable')) {
          if (window.telemetry) {
            const st = window.telemetry.getActiveStation();
            if (st) {
              st.alerts = st.alerts.filter(a => !a.title.toLowerCase().includes('trace') && !a.title.toLowerCase().includes('water'));
              window.telemetry.notifyUpdate();
            }
          }
        }

        // 4. Reset SOS / Acknowledge alarm
        if (lower.includes('reset') || lower.includes('acknowledge') || lower.includes('sos') || lower.includes('clear')) {
          if (window.telemetry) {
            window.telemetry.resolveCustomAnomaly('all');
          }
        }

        // 5. Fuel resupply
        if (lower.includes('fuel resupply') || lower.includes('+fuel') || lower.includes('emergency fuel')) {
          if (window.telemetry) {
            window.telemetry.logResourceTransaction(station, { type: 'fuel', amount: 8000, note: 'Emergency Fuel Transfer via Command Directives' });
          }
        }

        // 6. Food resupply
        if (lower.includes('food') || lower.includes('rations')) {
          if (window.telemetry) {
            window.telemetry.logResourceTransaction(station, { type: 'food', amount: 1500, note: 'Rations Dispatch via Command Directive' });
          }
        }

        // 7. HVAC Eco mode
        if (lower.includes('hvac') || lower.includes('eco')) {
          if (window.telemetry) {
            const st = window.telemetry.getActiveStation();
            if (st) {
              st.energy.totalDemand = Math.max(50, st.energy.totalDemand - 12);
              window.telemetry.notifyUpdate();
            }
          }
        }

      }, 800);
    }, 600);
  }

  renderHistory() {
    const list = document.getElementById('command-history-list');
    if (!list) return;

    list.innerHTML = this.commandHistory.map(c => `
      <div class="command-entry">
        <div>
          <span class="cmd-dir ${c.direction.includes('Bharati ➔') || c.direction.includes('Maitri ➔') ? 'recv' : ''}">[${c.direction}]</span>
          <span style="color:#ffffff; margin-left: 5px;">${c.action}</span>
          <div style="font-size: 0.65rem; color:#64748b; margin-top:2px;">ID: ${c.id} | ${c.time}</div>
        </div>
        <span class="cmd-ack" style="color: ${c.status.includes('QUEUED') ? '#f59e0b' : c.status.includes('ACK') ? '#10b981' : '#38bdf8'}">${c.status}</span>
      </div>
    `).join('');
  }
}

window.commandSystem = new CommandSystem();
