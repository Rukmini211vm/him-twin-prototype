/* ===================================================================
   VOICE ALERTS & AUDIO KLAXON ENGINE
   Web Audio API Synthesizer + SpeechSynthesis Web API
   =================================================================== */

class VoiceAlertEngine {
  constructor() {
    this.audioCtx = null;
    this.muted = false;
    this.speechSynth = window.speechSynthesis;
    this.isAnnouncing = false;
    this.voice = null;
    this.lastMessage = "HIM-TWIN Antarctic digital twin mission control ready for operator telemetry input.";
    this.lastPriority = "normal";
    this.initVoice();
    this.setupUnlockListeners();
  }

  setupUnlockListeners() {
    const unlock = () => {
      this.initAudioContext();
      if (this.speechSynth && this.speechSynth.paused) {
        this.speechSynth.resume();
      }
    };
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }

  initAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  initVoice() {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = this.speechSynth.getVoices();
        // Look for authoritative English voices
        this.voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('David') || v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('James'))) || voices.find(v => v.lang.startsWith('en')) || null;
      };
      loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (muted && this.speechSynth) {
      this.speechSynth.cancel();
    }
    const indicator = document.getElementById('voice-status-global-pill');
    if (indicator) {
      indicator.className = muted ? 'omni-voice-indicator muted' : 'omni-voice-indicator armed';
      indicator.innerHTML = muted ? '🔇 VOICE MUTED' : '🔊 DISPATCH VOICE ACTIVE';
    }
  }

  /* Play tactical alert klaxon sound synthesized via Web Audio */
  playSirenTone(type = 'critical') {
    if (this.muted) return;
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'critical') {
        // Two-tone European/Military klaxon
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(1080, now + 0.22);
        osc.frequency.linearRampToValueAtTime(800, now + 0.44);
        osc.frequency.linearRampToValueAtTime(1080, now + 0.66);
        osc.frequency.linearRampToValueAtTime(800, now + 0.88);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.95);

        osc.start(now);
        osc.stop(now + 0.95);
      } else if (type === 'warning') {
        // Radio comms dual beep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1174, now + 0.08);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'ack') {
        // Double positive confirmation chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587, now);
        osc.frequency.setValueAtTime(880, now + 0.12);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      console.warn('Audio synthesis notice:', e);
    }
  }

  /* Authoritative spoken voice announcement */
  speak(message, priority = 'normal') {
    this.lastMessage = message;
    this.lastPriority = priority;
    if (this.muted) return;
    if (!('speechSynthesis' in window)) return;

    this.initAudioContext();

    // Broadcast visual banner update immediately
    this.updateVisualVoiceBanner(message, priority, true);

    // Play tone first
    this.playSirenTone(priority === 'critical' ? 'critical' : priority === 'ack' ? 'ack' : 'warning');

    setTimeout(() => {
      try {
        this.speechSynth.cancel(); // cancel previous if needed
        const utterance = new SpeechSynthesisUtterance(message);
        if (this.voice) {
          utterance.voice = this.voice;
        }
        utterance.rate = 0.95; // clear tactical cadence
        utterance.pitch = 0.92;
        utterance.volume = 1.0;

        utterance.onstart = () => {
          this.isAnnouncing = true;
          this.updateVisualVoiceBanner(message, priority, true);
          document.dispatchEvent(new CustomEvent('voice-start', { detail: { text: message } }));
        };
        utterance.onend = () => {
          this.isAnnouncing = false;
          this.updateVisualVoiceBanner(message, priority, false);
          document.dispatchEvent(new CustomEvent('voice-end'));
        };
        utterance.onerror = () => {
          this.isAnnouncing = false;
          this.updateVisualVoiceBanner(message, priority, false);
        };

        this.speechSynth.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis notice:', err);
        this.updateVisualVoiceBanner(message, priority, false);
      }
    }, 380);
  }

  replayLast() {
    if (this.lastMessage) {
      this.speak(this.lastMessage, this.lastPriority);
    }
  }

  updateVisualVoiceBanner(message, priority, isLive) {
    const banner = document.getElementById('omni-voice-broadcast-bar');
    const textEl = document.getElementById('omni-voice-broadcast-text');
    const eq = document.getElementById('omni-voice-eq');
    if (!banner || !textEl) return;

    banner.style.display = 'flex';
    textEl.textContent = `"${message}"`;
    if (priority === 'critical') {
      banner.className = 'omni-voice-broadcast-bar critical';
    } else if (priority === 'warning') {
      banner.className = 'omni-voice-broadcast-bar warning';
    } else {
      banner.className = 'omni-voice-broadcast-bar';
    }

    if (eq) {
      eq.style.opacity = isLive ? '1' : '0.4';
      eq.classList.toggle('active', isLive);
    }
  }
}

window.voiceAlerts = new VoiceAlertEngine();
