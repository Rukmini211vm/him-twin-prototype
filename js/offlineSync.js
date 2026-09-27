/* ===================================================================
   OFFLINE-FIRST ARCHITECTURE & STORE-AND-FORWARD SYNCHRONIZER
   Local Station Edge Autonomy ⇄ Satellite Reconnection Sync
   =================================================================== */

class OfflineSyncManager {
  constructor() {
    this.isOffline = false;
    this.bufferQueue = [];
    this.lastSyncTime = new Date().toLocaleTimeString();
    this.autoBufferTimer = null;
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    const toggleBadge = document.getElementById('link-status-toggle');
    if (toggleBadge) {
      toggleBadge.addEventListener('click', () => {
        this.toggleConnectivity();
      });
    }

    const flushBtn = document.getElementById('btn-manual-sync');
    if (flushBtn) {
      flushBtn.addEventListener('click', () => {
        this.synchronizeData();
      });
    }
  }

  toggleConnectivity() {
    this.isOffline = !this.isOffline;
    const badge = document.getElementById('link-status-toggle');
    const syncBar = document.getElementById('offline-sync-bar');
    const camCards = document.querySelectorAll('.cam-feed-card');

    if (this.isOffline) {
      // Transition to OFFLINE
      badge.classList.add('offline-mode');
      badge.innerHTML = `<div class="link-pulse"></div> SATELLITE LINK: OFFLINE (EDGE MODE)`;
      syncBar.classList.add('visible');

      // Set camera cards to offline freeze state
      camCards.forEach(c => c.classList.add('offline'));

      if (window.voiceAlerts) {
        window.voiceAlerts.speak("Notice. Satellite communications link interrupted. Switching to autonomous local station edge mode. Local monitoring active.", "warning");
      }

      // Start accumulating sensor packets in local buffer
      this.startLocalBuffering();
    } else {
      // Transition to ONLINE -> Sync
      badge.classList.remove('offline-mode');
      badge.innerHTML = `<div class="link-pulse"></div> SATELLITE LINK: GSAT-7 CONNECTED (98.4%)`;
      camCards.forEach(c => c.classList.remove('offline'));

      this.stopLocalBuffering();
      this.synchronizeData();
    }
  }

  startLocalBuffering() {
    this.autoBufferTimer = setInterval(() => {
      if (this.isOffline) {
        // Enqueue telemetry log packet
        this.queuePacket({
          type: 'TELEMETRY_SAMPLE',
          station: window.telemetry.currentStation,
          timestamp: new Date().toISOString().substring(11, 19),
          payload: {
            power: (70 + Math.random() * 15).toFixed(1) + ' kW',
            temp: (-35 - Math.random() * 8).toFixed(1) + ' °C'
          }
        });
      }
    }, 3000);
  }

  stopLocalBuffering() {
    if (this.autoBufferTimer) {
      clearInterval(this.autoBufferTimer);
      this.autoBufferTimer = null;
    }
  }

  queuePacket(packet) {
    this.bufferQueue.push(packet);
    this.updateQueueCountUI();
  }

  updateQueueCountUI() {
    const countEl = document.getElementById('sync-packet-count');
    if (countEl) {
      countEl.textContent = `${this.bufferQueue.length} Packets Buffered`;
    }
  }

  synchronizeData() {
    const syncBar = document.getElementById('offline-sync-bar');
    const statusText = document.getElementById('sync-status-text');

    if (this.bufferQueue.length === 0) {
      if (statusText) statusText.textContent = 'All Edge Nodes Synchronized';
      setTimeout(() => {
        if (syncBar && !this.isOffline) syncBar.classList.remove('visible');
      }, 1500);
      return;
    }

    if (statusText) statusText.textContent = `STORE-AND-FORWARD: Flushing ${this.bufferQueue.length} buffered logs to India Mission Control...`;

    // Simulated rapid burst flush
    let packetsRemaining = this.bufferQueue.length;
    const interval = setInterval(() => {
      packetsRemaining = Math.max(0, packetsRemaining - 4);
      this.bufferQueue = this.bufferQueue.slice(4);
      this.updateQueueCountUI();

      if (packetsRemaining <= 0) {
        clearInterval(interval);
        this.lastSyncTime = new Date().toLocaleTimeString();
        if (statusText) statusText.textContent = `Synchronization Complete // ${this.lastSyncTime} UTC`;
        if (window.voiceAlerts) {
          window.voiceAlerts.playSirenTone('ack');
        }
        setTimeout(() => {
          if (syncBar && !this.isOffline) syncBar.classList.remove('visible');
        }, 2000);
      }
    }, 350);
  }
}

window.offlineSync = new OfflineSyncManager();
