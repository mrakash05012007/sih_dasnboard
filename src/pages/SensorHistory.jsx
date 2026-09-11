import { useState, useEffect } from 'react';
import { getSensorHistory } from '../services/api';
import SensorChart from '../components/charts/SensorChart';
import DemoBanner from '../components/DemoBanner';

const SENSOR_KEYS = [
  { key: 'mq136_h2s',   label: 'H₂S (MQ-136)',      color: '#f59e0b' },
  { key: 'mq7_co',      label: 'CO (MQ-7)',           color: '#ef4444' },
  { key: 'mq4_ch4',     label: 'CH₄ (MQ-4)',          color: '#8b5cf6' },
  { key: 'temperature', label: 'Temperature (°C)',     color: '#f97316' },
];

export default function SensorHistory({ workers, isDemoMode, history }) {
  const [selectedWorker, setSelectedWorker] = useState('');
  const [timeRange, setTimeRange] = useState(1);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // When no RPi, use the rolling in-memory history from useSensorData
  useEffect(() => {
    if (isDemoMode) {
      setHistoryData(history);
      return;
    }
    if (!selectedWorker) return;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSensorHistory(selectedWorker, 120, timeRange);
        setHistoryData(Array.isArray(data) ? data : data.readings || []);
      } catch (e) {
        setError('Could not load history from Raspberry Pi. Using in-memory buffer.');
        setHistoryData(history);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [selectedWorker, timeRange, isDemoMode, history]);

  return (
    <div className="page-wrapper page-enter">
      {isDemoMode && <DemoBanner />}

      <div className="card mb-4">
        <div className="card-body" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0, flex: '1', minWidth: '180px' }}>
            <label className="form-label">Worker ID</label>
            <select className="form-input" value={selectedWorker} onChange={e => setSelectedWorker(e.target.value)}>
              <option value="">— Select Worker —</option>
              {workers.map(w => <option key={w.worker_id} value={w.worker_id}>{w.worker_id}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Time Range</label>
            <div className="tabs">
              {[1, 6, 24].map(h => (
                <button key={h} className={`tab-btn ${timeRange === h ? 'active' : ''}`} onClick={() => setTimeRange(h)}>{h}h</button>
              ))}
            </div>
          </div>
          {isDemoMode && <span className="demo-watermark">DEMO DATA</span>}
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: '16px', fontSize: '0.82rem', color: 'var(--warning)' }}>
          ⚠ {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading sensor history…</div>
      )}

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '16px' }}>
          {SENSOR_KEYS.map(({ key, label, color }) => (
            <div key={key} className="card">
              <div className="card-header">
                <h4>{label}</h4>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{historyData.length} data points</span>
              </div>
              <div className="card-body">
                <SensorChart
                  data={historyData}
                  sensorKey={key}
                  label={label}
                  color={color}
                  isDemoMode={isDemoMode}
                  height={200}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
