import { useState, useEffect, useRef, useCallback } from 'react';
import { getLatestSensorData, getAllWorkers, getAlerts, getSystemStatus, healthCheck } from '../services/api';

// ---------------------------------------------------------------------------
// Demo data — shown ONLY when the Raspberry Pi backend is unreachable
// ---------------------------------------------------------------------------
const generateDemoReading = () => {
  const now = new Date();
  return {
    worker_id: 'W001',
    mq136_h2s: Math.floor(120 + Math.random() * 60),
    mq7_co: Math.floor(80 + Math.random() * 40),
    mq4_ch4: Math.floor(200 + Math.random() * 80),
    mq2_gas: Math.floor(150 + Math.random() * 50),
    temperature: parseFloat((28 + Math.random() * 6).toFixed(1)),
    vibration: Math.random() > 0.85 ? 1 : 0,
    fall_detected: Math.random() > 0.97,
    risk_level: 'SAFE',
    timestamp: now.toISOString(),
    _demo: true,
  };
};

const generateDemoWorkers = () => [
  { worker_id: 'W001', mq136_h2s: 142, mq7_co: 95, mq4_ch4: 230, mq2_gas: 165, temperature: 30.2, vibration: 0, fall_detected: false, risk_level: 'SAFE', last_updated: new Date().toISOString(), _demo: true },
  { worker_id: 'W002', mq136_h2s: 380, mq7_co: 195, mq4_ch4: 410, mq2_gas: 290, temperature: 33.8, vibration: 1, fall_detected: false, risk_level: 'WARNING', last_updated: new Date().toISOString(), _demo: true },
  { worker_id: 'W003', mq136_h2s: 620, mq7_co: 340, mq4_ch4: 580, mq2_gas: 420, temperature: 38.1, vibration: 1, fall_detected: false, risk_level: 'DANGER', last_updated: new Date().toISOString(), _demo: true },
  { worker_id: 'W004', mq136_h2s: 95,  mq7_co: 60,  mq4_ch4: 140, mq2_gas: 110, temperature: 29.5, vibration: 0, fall_detected: false, risk_level: 'SAFE', last_updated: new Date().toISOString(), _demo: true },
];

const generateDemoAlerts = () => [
  { id: 1, worker_id: 'W003', sensor: 'MQ-136 H₂S', message: 'H₂S ADC value exceeds danger threshold', severity: 'DANGER', timestamp: new Date(Date.now() - 120000).toISOString(), _demo: true },
  { id: 2, worker_id: 'W002', sensor: 'Temperature', message: 'Elevated body temperature detected', severity: 'WARNING', timestamp: new Date(Date.now() - 300000).toISOString(), _demo: true },
  { id: 3, worker_id: 'W003', sensor: 'MQ-7 CO', message: 'CO ADC value above warning level', severity: 'WARNING', timestamp: new Date(Date.now() - 600000).toISOString(), _demo: true },
  { id: 4, worker_id: 'W001', sensor: 'System', message: 'Worker W001 check-in confirmed', severity: 'INFO', timestamp: new Date(Date.now() - 900000).toISOString(), _demo: true },
];

const generateDemoSystemStatus = () => ({
  raspberry_pi: 'OFFLINE',
  fastapi: 'OFFLINE',
  sqlite: 'OFFLINE',
  mq136: 'OFFLINE',
  mq7: 'OFFLINE',
  mq4: 'OFFLINE',
  mq2: 'OFFLINE',
  temperature_sensor: 'OFFLINE',
  vibration_sensor: 'OFFLINE',
  mpu6050: 'OFFLINE',
  _demo: true,
});

// ---------------------------------------------------------------------------
// Connection states
// ---------------------------------------------------------------------------
export const CONNECTION_STATE = {
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  DELAYED: 'DELAYED',
};

const MAX_HISTORY = 60;
const STALE_THRESHOLD_MS = 10000; // 10 s without update → DELAYED

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export const useSensorData = (pollIntervalMs = 1500) => {
  const [sensorData, setSensorData] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [connectionState, setConnectionState] = useState(CONNECTION_STATE.DISCONNECTED);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [history, setHistory] = useState([]); // rolling buffer

  const lastSuccessRef = useRef(null);
  const intervalRef = useRef(null);
  const staleTimerRef = useRef(null);

  const appendHistory = useCallback((reading) => {
    setHistory((prev) => {
      const next = [...prev, { ...reading, _ts: Date.now() }];
      return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
    });
  }, []);

  const activateDemoMode = useCallback(() => {
    setIsDemoMode(true);
    setConnectionState(CONNECTION_STATE.DISCONNECTED);
    const demo = generateDemoReading();
    setSensorData(demo);
    setWorkers(generateDemoWorkers());
    setAlerts(generateDemoAlerts());
    setSystemStatus(generateDemoSystemStatus());
    appendHistory(demo);
    setLastUpdated(new Date());
  }, [appendHistory]);

  const poll = useCallback(async () => {
    try {
      // Primary: fetch latest sensor reading
      const data = await getLatestSensorData();

      // Parallel: workers, alerts, system status (non-blocking failures OK)
      const [workersData, alertsData, statusData] = await Promise.allSettled([
        getAllWorkers(),
        getAlerts(),
        getSystemStatus(),
      ]);

      setSensorData(data);
      if (workersData.status === 'fulfilled') setWorkers(workersData.value);
      if (alertsData.status === 'fulfilled') setAlerts(alertsData.value);
      if (statusData.status === 'fulfilled') setSystemStatus(statusData.value);

      appendHistory(data);
      setLastUpdated(new Date());
      lastSuccessRef.current = Date.now();
      setConnectionState(CONNECTION_STATE.CONNECTED);
      setIsDemoMode(false);

      // Reset stale timer
      if (staleTimerRef.current) clearTimeout(staleTimerRef.current);
      staleTimerRef.current = setTimeout(() => {
        setConnectionState(CONNECTION_STATE.DELAYED);
      }, STALE_THRESHOLD_MS);

    } catch {
      // Backend unreachable — activate demo mode
      if (!lastSuccessRef.current) {
        activateDemoMode();
      } else {
        const elapsed = Date.now() - lastSuccessRef.current;
        if (elapsed > STALE_THRESHOLD_MS) {
          setConnectionState(CONNECTION_STATE.DELAYED);
          setIsDemoMode(true);
          activateDemoMode();
        } else {
          setConnectionState(CONNECTION_STATE.DELAYED);
        }
      }
    }
  }, [appendHistory, activateDemoMode]);

  useEffect(() => {
    poll(); // immediate first fetch
    intervalRef.current = setInterval(poll, pollIntervalMs);
    return () => {
      clearInterval(intervalRef.current);
      if (staleTimerRef.current) clearTimeout(staleTimerRef.current);
    };
  }, [poll, pollIntervalMs]);

  return {
    sensorData,
    workers,
    alerts,
    systemStatus,
    connectionState,
    isDemoMode,
    lastUpdated,
    history,
    refetch: poll,
  };
};
