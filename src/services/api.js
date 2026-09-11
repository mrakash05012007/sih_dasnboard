import axios from 'axios';

// ---------------------------------------------------------------------------
// Resolve base URL — runtime override via localStorage takes priority
// (used by the Settings page), then falls back to .env VITE_API_BASE_URL
// ---------------------------------------------------------------------------
const getBaseUrl = () => {
  const override = localStorage.getItem('rpi_api_base_url');
  if (override && override.trim()) return override.trim();
  return import.meta.env.VITE_API_BASE_URL || 'http://192.168.0.115:5000';
};

// Build a fresh axios instance each call so runtime URL changes are picked up
const getClient = () =>
  axios.create({
    baseURL: getBaseUrl(),
    timeout: 5000,
    headers: { 'Content-Type': 'application/json' },
  });

// ---------------------------------------------------------------------------
// Sensor Data
// ---------------------------------------------------------------------------

/**
 * POST /api/sensor-data
 * Send a sensor reading payload (typically called by sensor.py on the RPi,
 * but exposed here if the dashboard ever needs to post test data).
 */
export const postSensorData = async (payload) => {
  const client = getClient();
  const response = await client.post('/api/sensor-data', payload);
  return response.data;
};

/**
 * GET /api/sensor-data/latest
 * Returns the most recent sensor reading from the Raspberry Pi.
 */
export const getLatestSensorData = async () => {
  const client = getClient();
  const response = await client.get('/api/sensor-data/latest');
  return response.data;
};

/**
 * GET /api/sensor-history/{worker_id}?limit=60&hours=1
 * Returns historical sensor readings for a specific worker.
 */
export const getSensorHistory = async (workerId, limit = 60, hours = 1) => {
  const client = getClient();
  const response = await client.get(`/api/sensor-history/${workerId}`, {
    params: { limit, hours },
  });
  return response.data;
};

// ---------------------------------------------------------------------------
// Workers
// ---------------------------------------------------------------------------

/**
 * GET /api/workers
 * Returns list of all active workers with latest readings.
 */
export const getAllWorkers = async () => {
  const client = getClient();
  const response = await client.get('/api/workers');
  return response.data;
};

/**
 * GET /api/workers/{worker_id}
 * Returns details for a single worker.
 */
export const getWorker = async (workerId) => {
  const client = getClient();
  const response = await client.get(`/api/workers/${workerId}`);
  return response.data;
};

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

/**
 * GET /api/alerts?severity=&limit=50
 * Returns alerts from the Raspberry Pi backend.
 */
export const getAlerts = async (severity = null, limit = 50) => {
  const client = getClient();
  const params = { limit };
  if (severity) params.severity = severity;
  const response = await client.get('/api/alerts', { params });
  return response.data;
};

// ---------------------------------------------------------------------------
// System Status
// ---------------------------------------------------------------------------

/**
 * GET /api/system-status
 * Returns health/status of Raspberry Pi subsystems.
 */
export const getSystemStatus = async () => {
  const client = getClient();
  const response = await client.get('/api/system-status');
  return response.data;
};

/**
 * GET /api/health
 * Simple liveness check — used to determine connection state.
 */
export const healthCheck = async () => {
  const client = getClient();
  const response = await client.get('/api/health');
  return response.data;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the currently active base URL (for display in Settings). */
export const getCurrentBaseUrl = () => getBaseUrl();

/** Persist a new base URL override to localStorage. */
export const setBaseUrlOverride = (url) => {
  if (url && url.trim()) {
    localStorage.setItem('rpi_api_base_url', url.trim());
  } else {
    localStorage.removeItem('rpi_api_base_url');
  }
};
