import { useState } from 'react';
import { format } from 'date-fns';
import WorkerTable from '../components/WorkerTable';
import DemoBanner from '../components/DemoBanner';
import SensorChart from '../components/charts/SensorChart';
import RiskBadge from '../components/RiskBadge';

export default function Workers({ workers, isDemoMode }) {
  const [selectedWorker, setSelectedWorker] = useState(null);

  return (
    <div className="page-wrapper page-enter">
      {isDemoMode && <DemoBanner />}

      <div className="section-header mb-4">
        <div className="section-title">👷 Worker Monitor</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{workers.length} workers tracked</div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3>All Workers</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click a row for sensor history</span>
        </div>
        <WorkerTable workers={workers} onSelectWorker={setSelectedWorker} />
      </div>

      {/* Worker Detail Modal */}
      {selectedWorker && (
        <div className="modal-overlay" onClick={() => setSelectedWorker(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontFamily: 'var(--font-mono)' }}>{selectedWorker.worker_id}</h2>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Last updated: {selectedWorker.last_updated ? format(new Date(selectedWorker.last_updated), 'MMM d, HH:mm:ss') : '—'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <RiskBadge level={selectedWorker.risk_level} />
                <button className="modal-close" onClick={() => setSelectedWorker(null)}>✕</button>
              </div>
            </div>
            <div className="modal-body">
              {/* Sensor Value Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                {[
                  { key: 'mq136_h2s', label: 'H₂S', icon: '🟡', unit: 'ADC' },
                  { key: 'mq7_co',    label: 'CO',   icon: '🔴', unit: 'ADC' },
                  { key: 'mq4_ch4',   label: 'CH₄',  icon: '🟣', unit: 'ADC' },
                  { key: 'mq2_gas',   label: 'MQ-2', icon: '💨', unit: 'ADC' },
                  { key: 'temperature', label: 'Temp',icon: '🌡', unit: '°C'  },
                  { key: 'vibration', label: 'Vibration', icon: '📳', unit: 'State' },
                ].map(({ key, label, icon, unit }) => (
                  <div key={key} style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px' }}>
                    <div style={{ fontSize: '1.1rem', marginBottom: '6px' }}>{icon}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                      {selectedWorker[key] ?? '—'}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{unit}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '4px' }}>{label}</div>
                  </div>
                ))}
              </div>
              {/* Fall Detection */}
              <div style={{ padding: '14px', background: selectedWorker.fall_detected ? 'var(--danger-bg)' : 'var(--safe-bg)', border: `1px solid ${selectedWorker.fall_detected ? 'var(--danger-border)' : 'var(--safe-border)'}`, borderRadius: 'var(--radius)', textAlign: 'center' }}>
                <span style={{ fontSize: '1.2rem' }}>⚠</span>{' '}
                <strong>Fall Detection:</strong>{' '}
                <span style={{ color: selectedWorker.fall_detected ? 'var(--danger)' : 'var(--safe)' }}>
                  {selectedWorker.fall_detected ? '🚨 FALL DETECTED' : '✅ No Fall Event'}
                </span>
              </div>
              <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                💡 Full sensor history charts are available in the <strong>Sensor History</strong> page. Select Worker ID: <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-blue-l)' }}>{selectedWorker.worker_id}</code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
