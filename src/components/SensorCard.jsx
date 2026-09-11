import './SensorCard.css';

const RISK_COLORS = {
  SAFE:     'safe',
  WARNING:  'warning',
  DANGER:   'danger',
  CRITICAL: 'critical',
};

export default function SensorCard({ label, sublabel, value, unit = 'ADC / Sensor Value', risk = 'SAFE', icon, description }) {
  const riskClass = RISK_COLORS[risk] || 'safe';

  return (
    <div className={`sensor-card risk-${riskClass}`}>
      <div className="sensor-card-header">
        <div className="sensor-card-icon">{icon}</div>
        <div className={`sensor-card-risk risk-badge ${risk}`}>{risk}</div>
      </div>
      <div className="sensor-card-value">
        {value === null || value === undefined ? (
          <span className="sensor-card-na">—</span>
        ) : typeof value === 'boolean' ? (
          <span className={`sensor-card-bool ${value ? 'true' : 'false'}`}>
            {value ? 'DETECTED' : 'NONE'}
          </span>
        ) : (
          <span className="sensor-card-num">{value}</span>
        )}
      </div>
      <div className="sensor-card-unit">{unit}</div>
      <div className="sensor-card-label">{label}</div>
      {sublabel && <div className="sensor-card-sublabel">{sublabel}</div>}
      {description && <div className="sensor-card-desc">{description}</div>}
    </div>
  );
}
