/* ===================================================================
   TELEMETRY & ANTARCTIC STATION STATE STORE
   =================================================================== */

class TelemetryStore {
  constructor() {
    this.currentStation = 'bharati'; // 'bharati' | 'maitri' | 'both'
    this.isOffline = false;

    // Station State Definitions
    this.stations = {
      bharati: {
        name: 'Bharati Station',
        code: 'BHT-69S',
        location: 'Larsemann Hills, Prydz Bay',
        coords: '69°24′28″S, 76°11′14″E',
        altitude: '35 m above sea level',
        population: 23,
        weather: {
          temp: -36.8,
          windChill: -54.2,
          windSpeed: 46,
          windGust: 62,
          windDir: 'SSW 195°',
          visibility: 420, // meters
          pressure: 982,
          blizzardWarning: false
        },
        energy: {
          dg1Load: 68, // kW
          dg1Health: 94,
          dg1FuelRate: 18.2, // L/h
          dg2Load: 0,
          dg2Status: 'STANDBY',
          dg2Health: 98,
          dg3Load: 0,
          dg3Status: 'OFFLINE_MAINTENANCE',
          dg3Health: 72,
          solarGen: 14.5, // kW
          windGen: 8.2, // kW
          totalDemand: 82.5,
          batterySoC: 92, // %
          batteryVolts: 49.2
        },
        resources: {
          fuelLiters: 48500,
          fuelCapacity: 60000,
          fuelPercent: 80.8,
          fuelBurnRate: 436, // L/day
          fuelDaysLeft: 111.2,

          foodStockKg: 428,
          foodBurnRate: 34, // kg/day
          foodDaysLeft: 12.5, // low!

          waterLiters: 16400,
          waterCapacity: 20000,
          waterBurnRate: 850,
          waterDaysLeft: 19.3,

          oxygenCylinders: 18,
          oxygenDaysLeft: 84
        },
        alerts: [
          {
            id: 'bht-alt-1',
            level: 'warning',
            title: 'Food Stock Approaching Critical Days',
            detail: 'Food stock at 428 kg (34 kg/day). Estimated availability is 12.5 days. Resupply scheduled via Polar Convoy Bravo.',
            timestamp: new Date().toLocaleTimeString(),
            zone: 'Food Storage Bay'
          }
        ]
      },

      maitri: {
        name: 'Maitri Station',
        code: 'MTR-70S',
        location: 'Schirmacher Oasis, Queen Maud Land',
        coords: '70°45′57″S, 11°44′09″E',
        altitude: '117 m above sea level',
        population: 27,
        weather: {
          temp: -41.4,
          windChill: -61.0,
          windSpeed: 52,
          windGust: 74,
          windDir: 'SSE 160°',
          visibility: 280, // meters
          pressure: 974,
          blizzardWarning: true
        },
        energy: {
          dg1Load: 74,
          dg1Health: 88,
          dg1FuelRate: 19.8,
          dg2Load: 0,
          dg2Status: 'STANDBY',
          dg2Health: 91,
          dg3Load: 0,
          dg3Status: 'STANDBY',
          dg3Health: 85,
          solarGen: 4.1,
          windGen: 11.4,
          totalDemand: 85.5,
          batterySoC: 86,
          batteryVolts: 48.6
        },
        resources: {
          fuelLiters: 11200,
          fuelCapacity: 60000,
          fuelPercent: 18.6, // CRITICAL EXAMPLE
          fuelBurnRate: 460,
          fuelDaysLeft: 24.3,

          foodStockKg: 1450,
          foodBurnRate: 38,
          foodDaysLeft: 38.1,

          waterLiters: 8200,
          waterCapacity: 15000,
          waterBurnRate: 920,
          waterDaysLeft: 8.9,

          oxygenCylinders: 22,
          oxygenDaysLeft: 105
        },
        alerts: [
          {
            id: 'mtr-alt-1',
            level: 'critical',
            title: 'Main Fuel Reserve Below 20%',
            detail: 'Fuel level at 18.6%. AI predicts critical low (3 days operational reserve) under upcoming blizzard wind chill load.',
            timestamp: new Date().toLocaleTimeString(),
            zone: 'Fuel Storage Farm'
          },
          {
            id: 'mtr-alt-2',
            level: 'warning',
            title: 'Priyadarshini Water Inlet Trace-Heat Advisory',
            detail: 'Sub-ice line temperature dropped to -2.1°C. Auxiliary trace-heater engaged.',
            timestamp: new Date().toLocaleTimeString(),
            zone: 'Water Pump House'
          }
        ]
      }
    };

    // Sensor historical series for canvas mini-charts
    this.history = {
      bharati: {
        powerLoad: [72, 75, 78, 80, 81, 79, 82.5],
        fuelBurn: [17.5, 18.0, 18.2, 17.9, 18.2],
        temp: [-35.2, -35.8, -36.1, -36.5, -36.8]
      },
      maitri: {
        powerLoad: [79, 81, 82, 84, 85.5],
        fuelBurn: [18.8, 19.2, 19.5, 19.8],
        temp: [-39.5, -40.1, -40.8, -41.4]
      }
    };

    this.initInterval();
  }

  initInterval() {
    // Dynamic real-time micro-fluctuations
    setInterval(() => {
      ['bharati', 'maitri'].forEach(stKey => {
        const s = this.stations[stKey];
        // micro jitter in wind and temp
        s.weather.windSpeed = Math.max(15, Math.min(95, Math.round((s.weather.windSpeed + (Math.random() * 2 - 1)) * 10) / 10));
        s.weather.temp = Math.round((s.weather.temp + (Math.random() * 0.4 - 0.2)) * 10) / 10;
        s.weather.windChill = Math.round((s.weather.temp - (s.weather.windSpeed * 0.4)) * 10) / 10;

        // micro jitter in power demand
        s.energy.totalDemand = Math.round((s.energy.totalDemand + (Math.random() * 1.2 - 0.6)) * 10) / 10;
        s.energy.dg1Load = Math.round(s.energy.totalDemand - (s.energy.solarGen + s.energy.windGen));

        // update history
        if (this.history[stKey]) {
          this.history[stKey].powerLoad.push(s.energy.totalDemand);
          if (this.history[stKey].powerLoad.length > 20) this.history[stKey].powerLoad.shift();
        }
      });

      // Dispatch event for UI re-render
      document.dispatchEvent(new CustomEvent('telemetry-updated', {
        detail: {
          currentStation: this.currentStation,
          data: this.stations[this.currentStation === 'both' ? 'bharati' : this.currentStation]
        }
      }));
    }, 2500);
  }

  getActiveStation() {
    return this.currentStation === 'both' ? this.stations.bharati : this.stations[this.currentStation];
  }

  setStation(st) {
    this.currentStation = st;
    document.dispatchEvent(new CustomEvent('station-changed', { detail: { station: st } }));
    this.notifyUpdate();
  }

  notifyUpdate() {
    document.dispatchEvent(new CustomEvent('telemetry-updated', {
      detail: {
        currentStation: this.currentStation,
        data: this.getActiveStation()
      }
    }));
  }

  /* User Input: Weather Modification */
  setUserWeather(stationKey, { temp, windSpeed, isBlizzard }) {
    const key = stationKey === 'both' ? 'bharati' : stationKey;
    const st = this.stations[key];
    if (!st) return;

    if (temp !== undefined) st.weather.temp = parseFloat(temp);
    if (windSpeed !== undefined) {
      st.weather.windSpeed = parseFloat(windSpeed);
      st.weather.windGust = Math.round(st.weather.windSpeed * 1.35);
    }
    st.weather.windChill = Math.round((st.weather.temp - (st.weather.windSpeed * 0.45)) * 10) / 10;
    if (isBlizzard !== undefined) st.weather.blizzardWarning = !!isBlizzard;

    // Heating demand scales inversely with ambient temp & wind
    const extraHeating = Math.max(0, (-30 - st.weather.temp) * 0.6) + (st.weather.windSpeed > 50 ? 12 : 0);
    st.energy.totalDemand = Math.round((70 + extraHeating) * 10) / 10;
    st.energy.dg1Load = Math.max(0, Math.round(st.energy.totalDemand - (st.energy.solarGen + st.energy.windGen)));

    this.notifyUpdate();
  }

  /* User Input: Energy & Power Grid Modification */
  setUserEnergy(stationKey, { dg1Load, dg1Status, dg2Load, dg2Status, dg3Status, solarGen, windGen, baseDemand }) {
    const key = stationKey === 'both' ? 'bharati' : stationKey;
    const st = this.stations[key];
    if (!st) return;

    if (baseDemand !== undefined) st.energy.totalDemand = parseFloat(baseDemand);
    if (solarGen !== undefined) st.energy.solarGen = parseFloat(solarGen);
    if (windGen !== undefined) st.energy.windGen = parseFloat(windGen);
    if (dg1Status !== undefined) st.energy.dg1Status = dg1Status;
    if (dg2Status !== undefined) st.energy.dg2Status = dg2Status;
    if (dg3Status !== undefined) st.energy.dg3Status = dg3Status;

    if (dg1Load !== undefined) st.energy.dg1Load = parseFloat(dg1Load);
    if (dg2Load !== undefined) st.energy.dg2Load = parseFloat(dg2Load);

    // Calculate dynamic fuel burn rate: 0.268 L/kWh
    const activeGenKw = (st.energy.dg1Status === 'OFF' ? 0 : st.energy.dg1Load) + 
                        (st.energy.dg2Status !== 'RUNNING' ? 0 : st.energy.dg2Load);
    st.energy.dg1FuelRate = Math.round(activeGenKw * 0.268 * 10) / 10;
    st.resources.fuelBurnRate = Math.round(st.energy.dg1FuelRate * 24);

    // Recalculate fuel autonomy days
    if (st.resources.fuelBurnRate > 0) {
      st.resources.fuelDaysLeft = Math.round((st.resources.fuelLiters / st.resources.fuelBurnRate) * 10) / 10;
    }

    // Battery net flux
    const totalGen = activeGenKw + st.energy.solarGen + st.energy.windGen;
    const net = totalGen - st.energy.totalDemand;
    if (net >= 0) {
      st.energy.batterySoC = Math.min(100, Math.round(st.energy.batterySoC + 0.1));
    } else {
      st.energy.batterySoC = Math.max(10, Math.round(st.energy.batterySoC - 0.2));
    }

    this.notifyUpdate();
  }

  /* User Input: Resource Reserve Adjustment */
  setUserResource(stationKey, resourceType, value) {
    const key = stationKey === 'both' ? 'bharati' : stationKey;
    const st = this.stations[key];
    if (!st) return;

    const val = parseFloat(value);
    if (isNaN(val)) return;

    if (resourceType === 'fuel') {
      st.resources.fuelLiters = Math.max(0, Math.min(st.resources.fuelCapacity, val));
      st.resources.fuelPercent = Math.round((st.resources.fuelLiters / st.resources.fuelCapacity) * 1000) / 10;
      st.resources.fuelDaysLeft = Math.round((st.resources.fuelLiters / st.resources.fuelBurnRate) * 10) / 10;
    } else if (resourceType === 'food') {
      st.resources.foodStockKg = Math.max(0, val);
      st.resources.foodDaysLeft = Math.round((st.resources.foodStockKg / st.resources.foodBurnRate) * 10) / 10;
    } else if (resourceType === 'water') {
      st.resources.waterLiters = Math.max(0, Math.min(st.resources.waterCapacity, val));
      st.resources.waterDaysLeft = Math.round((st.resources.waterLiters / st.resources.waterBurnRate) * 10) / 10;
    } else if (resourceType === 'crew') {
      st.population = Math.max(1, Math.round(val));
      st.resources.foodBurnRate = Math.round(st.population * 1.5);
      st.resources.waterBurnRate = Math.round(st.population * 38);
      st.resources.foodDaysLeft = Math.round((st.resources.foodStockKg / st.resources.foodBurnRate) * 10) / 10;
      st.resources.waterDaysLeft = Math.round((st.resources.waterLiters / st.resources.waterBurnRate) * 10) / 10;
    }

    this.notifyUpdate();
  }

  /* User Input: Log Inbound Resupply or Outbound Consumption */
  logResourceTransaction(stationKey, { type, amount, note }) {
    const key = stationKey === 'both' ? 'bharati' : stationKey;
    const st = this.stations[key];
    if (!st) return;

    const amt = parseFloat(amount);
    if (isNaN(amt)) return;

    if (type === 'fuel') {
      this.setUserResource(key, 'fuel', st.resources.fuelLiters + amt);
    } else if (type === 'food') {
      this.setUserResource(key, 'food', st.resources.foodStockKg + amt);
    } else if (type === 'water') {
      this.setUserResource(key, 'water', st.resources.waterLiters + amt);
    }

    // Add notice to alerts log
    st.alerts.unshift({
      id: 'tx-' + Date.now(),
      level: amt >= 0 ? 'nominal' : 'warning',
      title: `Logistics Record: ${amt >= 0 ? '+' : ''}${amt} ${type.toUpperCase()}`,
      detail: note || `Manual logistics transaction entered by operator.`,
      timestamp: new Date().toLocaleTimeString(),
      zone: 'Supply Warehouse'
    });

    this.notifyUpdate();
  }

  /* User Input: Anomaly Injection */
  injectCustomAnomaly(type, severity = 1) {
    const st = this.getActiveStation();
    if (!st) return;

    if (type === 'blizzard') {
      this.setUserWeather(this.currentStation, { temp: -54.5, windSpeed: 88, isBlizzard: true });
      st.alerts.unshift({
        id: 'alt-blz-' + Date.now(),
        level: 'critical',
        title: 'KATABATIC WHITEOUT SURGE',
        detail: 'Winds 88 kts, ambient -54.5°C. All surface movements restricted.',
        timestamp: new Date().toLocaleTimeString(),
        zone: 'Perimeter Met Tower'
      });
      if (window.voiceAlerts) window.voiceAlerts.speak("Warning. Extreme Katabatic blizzard detected. Whiteout conditions active.", "critical");
    } else if (type === 'fuel_leak') {
      this.setUserResource(this.currentStation, 'fuel', Math.round(st.resources.fuelLiters * 0.22));
      st.alerts.unshift({
        id: 'alt-flk-' + Date.now(),
        level: 'critical',
        title: 'MANIFOLD PRESSURE DROP / RAPID FUEL LOSS',
        detail: 'Fuel reserve dropped abruptly. Resupply protocol required immediately.',
        timestamp: new Date().toLocaleTimeString(),
        zone: 'Fuel Storage Farm'
      });
      if (window.voiceAlerts) window.voiceAlerts.speak("Emergency. Rapid fuel reserve loss detected. Fuel level below critical threshold.", "critical");
    } else if (type === 'generator_trip') {
      st.energy.dg1Status = 'TRIPPED_OVERHEAT';
      st.energy.dg1Load = 0;
      st.energy.dg1Health = 34;
      st.alerts.unshift({
        id: 'alt-gen-' + Date.now(),
        level: 'critical',
        title: 'PRIMARY DIESEL GENERATOR DG-1 TRIPPED',
        detail: 'Mechanical high thermal breaker tripped. Station on BESS battery reserve.',
        timestamp: new Date().toLocaleTimeString(),
        zone: 'Power Generation Hall'
      });
      if (window.voiceAlerts) window.voiceAlerts.speak("Critical alarm. Primary generator DG-1 has tripped. Microgrid switching to battery reserve.", "critical");
    } else if (type === 'water_freeze') {
      st.alerts.unshift({
        id: 'alt-ice-' + Date.now(),
        level: 'warning',
        title: 'WATER INTAKE PIPE ICE CRYSTALLIZATION',
        detail: 'Priyadarshini lake line sensor reports sub-zero flow restriction.',
        timestamp: new Date().toLocaleTimeString(),
        zone: 'Water Pump House'
      });
      if (window.voiceAlerts) window.voiceAlerts.speak("Advisory. Lake water intake trace heating advisory. Ice formation detected.", "warning");
    }

    this.notifyUpdate();
  }

  /* User Input: Resolve Anomaly */
  resolveCustomAnomaly(type) {
    const st = this.getActiveStation();
    if (!st) return;

    if (type === 'all' || type === 'blizzard') {
      this.setUserWeather(this.currentStation, { temp: -36.0, windSpeed: 38, isBlizzard: false });
    }
    if (type === 'all' || type === 'generator_trip') {
      st.energy.dg1Status = 'RUNNING';
      st.energy.dg1Load = 68;
      st.energy.dg1Health = 95;
    }
    if (type === 'all' || type === 'fuel_leak') {
      this.setUserResource(this.currentStation, 'fuel', 48500);
    }
    st.alerts = st.alerts.filter(a => a.level !== 'critical');
    if (window.voiceAlerts) window.voiceAlerts.speak("All critical alarms reset. Station systems restored to nominal parameters.", "normal");

    this.notifyUpdate();
  }
}

window.telemetry = new TelemetryStore();
