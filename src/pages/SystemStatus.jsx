import { CONNECTION_STATE } from '../hooks/useSensorData';
import DemoBanner from '../components/DemoBanner';

const SYSTEM_COMPONENTS = [
  { key: 'raspberry_pi',       label: 'Raspberry Pi 4',    icon: '🖥' },
  { key: 'fastapi',            label: 'FastAPI Server',     icon: '⚡' },
  { key: 'sqlite',             label: 'SQLite Database',    icon: '🗄' },
  { key: 'mq136',             label: 'MQ-136 (H₂S)',       icon: '🟡' },
  { key: 'mq7',               label: 'MQ-7 (CO)',          icon: '🔴' },
  { key: 'mq4',               label: 'MQ-4 (CH₄)',         icon: '🟣' },
  { key: 'mq2',               label: 'MQ-2 (Gas/Smoke)',   icon: '💨' },
  { key: 'temperature_sensor', label: 'Temperature Sensor', icon: '🌡' },
  { key: 'vibration_sensor',   label: 'Vibration Sensor',   icon: '📳' },
  { key: 'mpu6050',           label: 'MPU6050 (IMU)',       icon: '🔵' },
];

const statusMap = {
  ONLINE:  { cls: 'online',  dot: 'online',  label: '🟢 Online'  },
  OFFLINE: { cls: 'offline', dot: 'offline', label: '🔴 Offline' },
  WARNING: { cls: 'warning', dot: 'warning', label: '🟠 Warning' },
};

export default function SystemStatus({ systemStatus, connectionState, isDemoMode }) {
  const connOk = connectionState === CONNECTION_STATE.CONNECTED;

  return (
    <div className="page-wrapper page-enter">
      {isDemoMode && <DemoBanner />}

      {/* Network banner */}
      <div style={{
        background: connOk ? 'var(--safe-bg)' : 'var(--danger-bg)',
        border: `1px solid ${connOk ? 'var(--safe-border)' : 'var(--danger-border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '16px 22px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
      }}>
        <span style={{ fontSize: '1.8rem' }}>{connOk ? '🟢' : '🔴'}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>
            {connOk ? 'Raspberry Pi Backend Connected' : 'Raspberry Pi Backend Offline'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {connOk
              ? 'All API endpoints reachable over LAN'
              : 'No response from VITE_API_BASE_URL. Check your .env or Settings page.'}
          </div>
        </div>
      </div>

      <div className="section-title mb-4">🖥 Component Status</div>

      <div className="sys-status-grid">
        {SYSTEM_COMPONENTS.map(({ key, label, icon }) => {
          const rawStatus = systemStatus?.[key] || (connOk ? 'ONLINE' : 'OFFLINE');
          const { cls, dot, label: statusLabel } = statusMap[rawStatus] || statusMap.OFFLINE;
          return (
            <div key={key} className={`sys-status-card ${cls}`}>
              <div style={{ fontSize: '1.4rem' }}>{icon}</div>
              <div className="sys-status-name">{label}</div>
              <div className={`sys-status-value ${cls}`}>
                <span className={`dot ${dot}`} />
                {statusLabel}
              </div>
            </div>
          );
        })}
      </div>

      {/* API Info */}
      <div className="card mt-6">
        <div className="card-header"><h3>🌐 Network Configuration</h3></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 24px', alignItems: 'center', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Backend URL</span>
            <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-blue-l)', background: 'var(--bg-surface)', padding: '4px 10px', borderRadius: '4px' }}>
              {localStorage.getItem('rpi_api_base_url') || import.meta.env.VITE_API_BASE_URL || 'Not configured'}
            </code>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Expected Endpoints</span>
            <span style={{ color: 'var(--text-secondary)' }}>
              /api/health, /api/sensor-data/latest, /api/workers, /api/alerts, /api/system-status
            </span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>CORS Required</span>
            <span style={{ color: 'var(--safe)' }}>✅ Yes — FastAPI must allow dashboard laptop origin</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Poll Interval</span>
            <span style={{ color: 'var(--text-secondary)' }}>1.5 seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
}
