import { format } from 'date-fns';
import DemoBanner from '../components/DemoBanner';
import ConnectionStatus from '../components/ConnectionStatus';
import RiskBadge from '../components/RiskBadge';

const SENSORS = [
  { key: 'mq136_h2s',    label: 'H₂S',          sublabel: 'MQ-136', icon: '🟡', unit: 'ADC' },
  { key: 'mq7_co',       label: 'CO',            sublabel: 'MQ-7',   icon: '🔴', unit: 'ADC' },
  { key: 'mq4_ch4',      label: 'CH₄',           sublabel: 'MQ-4',   icon: '🟣', unit: 'ADC' },
  { key: 'mq2_gas',      label: 'Gas / Smoke',   sublabel: 'MQ-2',   icon: '💨', unit: 'ADC' },
  { key: 'temperature',  label: 'Temperature',   sublabel: 'Sensor', icon: '🌡', unit: '°C'  },
  { key: 'vibration',    label: 'Vibration',     sublabel: 'IMU',    icon: '📳', unit: 'State' },
  { key: 'fall_detected',label: 'Fall Detection',sublabel: 'MPU6050',icon: '⚠', unit: 'Event' },
];

const getSensorRisk = (key, val) => {
  const t = { mq136_h2s:{w:300,d:500,c:800}, mq7_co:{w:150,d:250,c:400}, mq4_ch4:{w:300,d:500,c:700}, mq2_gas:{w:200,d:350,c:500}, temperature:{w:35,d:38,c:40} };
  if (key === 'fall_detected') return val ? 'CRITICAL' : 'SAFE';
  if (key === 'vibration') return val ? 'WARNING' : 'SAFE';
  if (!t[key] || val == null) return 'SAFE';
  if (val >= t[key].c) return 'CRITICAL';
  if (val >= t[key].d) return 'DANGER';
  if (val >= t[key].w) return 'WARNING';
  return 'SAFE';
};

const RISK_COLORS = { SAFE:'var(--safe)', WARNING:'var(--warning)', DANGER:'var(--danger)', CRITICAL:'var(--critical)' };

export default function LiveMonitoring({ sensorData, connectionState, lastUpdated, isDemoMode }) {
  return (
    <div className="page-wrapper page-enter">
      {isDemoMode && <DemoBanner />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem' }}>Worker: <span style={{ color: 'var(--accent-blue-l)', fontFamily: 'var(--font-mono)' }}>{sensorData?.worker_id || '—'}</span></h2>
          {lastUpdated && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>Last update: {format(lastUpdated, 'HH:mm:ss.SSS')}</div>}
        </div>
        <ConnectionStatus connectionState={connectionState} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {SENSORS.map(({ key, label, sublabel, icon, unit }) => {
          const raw = sensorData?.[key];
          const risk = getSensorRisk(key, raw);
          const color = RISK_COLORS[risk];

          let displayValue;
          if (raw === null || raw === undefined) { displayValue = '—'; }
          else if (typeof raw === 'boolean') { displayValue = raw ? '⚠ DETECTED' : 'NONE'; }
          else { displayValue = raw; }

          return (
            <div key={key} style={{
              background: 'var(--bg-card)',
              border: `1px solid ${color}40`,
              borderRadius: 'var(--radius-lg)',
              padding: '22px 20px',
              boxShadow: `0 0 20px ${color}18, var(--shadow-card)`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                <RiskBadge level={risk} />
              </div>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color, lineHeight: 1, marginBottom: '4px' }}>
                {displayValue}
              </div>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {unit}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{label}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sublabel}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
