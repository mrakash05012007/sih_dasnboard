import { useMemo } from 'react';
import SensorCard from '../components/SensorCard';
import AlertFeed from '../components/AlertFeed';
import SensorChart from '../components/charts/SensorChart';
import RiskBadge from '../components/RiskBadge';
import DemoBanner from '../components/DemoBanner';

const getSensorRisk = (key, value) => {
  if (value === null || value === undefined) return 'SAFE';
  const thresholds = {
    mq136_h2s:   { warn: 300, danger: 500, critical: 800 },
    mq7_co:      { warn: 150, danger: 250, critical: 400 },
    mq4_ch4:     { warn: 300, danger: 500, critical: 700 },
    mq2_gas:     { warn: 200, danger: 350, critical: 500 },
    temperature: { warn: 35,  danger: 38,  critical: 40  },
  };
  const t = thresholds[key];
  if (!t) return 'SAFE';
  if (value >= t.critical) return 'CRITICAL';
  if (value >= t.danger)   return 'DANGER';
  if (value >= t.warn)     return 'WARNING';
  return 'SAFE';
};

const getOverallRisk = (sensorData) => {
  if (!sensorData) return 'SAFE';
  if (sensorData.risk_level) return sensorData.risk_level;
  if (sensorData.fall_detected) return 'CRITICAL';
  const keys = ['mq136_h2s', 'mq7_co', 'mq4_ch4', 'mq2_gas', 'temperature'];
  const risks = ['SAFE', 'WARNING', 'DANGER', 'CRITICAL'];
  let maxIdx = 0;
  keys.forEach((k) => {
    const r = getSensorRisk(k, sensorData[k]);
    const idx = risks.indexOf(r);
    if (idx > maxIdx) maxIdx = idx;
  });
  return risks[maxIdx];
};

export default function Overview({ sensorData, workers, alerts, history, isDemoMode }) {
  const overallRisk = useMemo(() => getOverallRisk(sensorData), [sensorData]);

  const safeCounts = useMemo(() => ({
    total:   workers.length,
    safe:    workers.filter(w => w.risk_level === 'SAFE').length,
    warning: workers.filter(w => w.risk_level === 'WARNING').length,
    danger:  workers.filter(w => ['DANGER','CRITICAL'].includes(w.risk_level)).length,
  }), [workers]);

  const criticalAlerts = alerts.filter(a => ['CRITICAL','DANGER'].includes(a.severity));

  return (
    <div className="page-wrapper page-enter">
      {isDemoMode && <DemoBanner />}

      {/* Overall Safety Banner */}
      <div style={{
        background: overallRisk === 'SAFE' ? 'var(--safe-bg)' :
                    overallRisk === 'WARNING' ? 'var(--warning-bg)' : 'var(--danger-bg)',
        border: `1px solid ${overallRisk === 'SAFE' ? 'var(--safe-border)' :
                              overallRisk === 'WARNING' ? 'var(--warning-border)' : 'var(--danger-border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '16px 22px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Overall Safety Status
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {overallRisk === 'SAFE' ? '✅ All Systems Safe' :
             overallRisk === 'WARNING' ? '⚠ Safety Warning Active' :
             overallRisk === 'CRITICAL' ? '🚨 Critical Alert!' : '🔴 Danger Detected'}
          </div>
        </div>
        <RiskBadge level={overallRisk} />
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid mb-6">
        <div className="kpi-card">
          <div className="kpi-icon">👷</div>
          <div className="kpi-value" style={{ color: 'var(--accent-blue-l)' }}>{safeCounts.total}</div>
          <div className="kpi-label">Active Workers</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">✅</div>
          <div className="kpi-value" style={{ color: 'var(--safe)' }}>{safeCounts.safe}</div>
          <div className="kpi-label">Safe Workers</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">⚠</div>
          <div className="kpi-value" style={{ color: 'var(--warning)' }}>{safeCounts.warning}</div>
          <div className="kpi-label">Warning</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">🔴</div>
          <div className="kpi-value" style={{ color: 'var(--danger)' }}>{safeCounts.danger}</div>
          <div className="kpi-label">Danger / Critical</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">🔔</div>
          <div className="kpi-value" style={{ color: 'var(--warning)' }}>{criticalAlerts.length}</div>
          <div className="kpi-label">Active Alerts</div>
        </div>
      </div>

      {/* Sensor Cards */}
      <div className="section-header">
        <div className="section-title">⚡ Live Sensor Readings</div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {sensorData?.worker_id ? `Worker: ${sensorData.worker_id}` : 'No data'}
        </span>
      </div>
      <div className="sensor-grid mb-6">
        <SensorCard label="H₂S" sublabel="MQ-136" value={sensorData?.mq136_h2s} icon="🟡" risk={getSensorRisk('mq136_h2s', sensorData?.mq136_h2s)} description="Hydrogen Sulphide gas sensor" />
        <SensorCard label="CO"  sublabel="MQ-7"   value={sensorData?.mq7_co}   icon="🔴" risk={getSensorRisk('mq7_co', sensorData?.mq7_co)}   description="Carbon monoxide sensor" />
        <SensorCard label="CH₄" sublabel="MQ-4"   value={sensorData?.mq4_ch4}  icon="🟣" risk={getSensorRisk('mq4_ch4', sensorData?.mq4_ch4)}  description="Methane / natural gas" />
        <SensorCard label="Gas / Smoke" sublabel="MQ-2" value={sensorData?.mq2_gas} icon="💨" risk={getSensorRisk('mq2_gas', sensorData?.mq2_gas)} description="Combustible gas & smoke" />
        <SensorCard label="Temperature" sublabel="°C" value={sensorData?.temperature} unit="°C" icon="🌡" risk={getSensorRisk('temperature', sensorData?.temperature)} description="Ambient temperature" />
        <SensorCard label="Vibration" sublabel="IMU" value={sensorData?.vibration} unit="Sensor Value" icon="📳" risk={sensorData?.vibration ? 'WARNING' : 'SAFE'} description="Vibration / motion detected" />
        <SensorCard label="Fall Detection" sublabel="MPU6050" value={sensorData?.fall_detected} unit="Event" icon="⚠" risk={sensorData?.fall_detected ? 'CRITICAL' : 'SAFE'} description="Worker fall event detection" />
      </div>

      {/* Charts + Alerts side by side */}
      <div className="grid-2">
        {/* Trend Charts */}
        <div className="card">
          <div className="card-header">
            <h3>📈 Sensor Trends</h3>
            {isDemoMode && <span className="demo-watermark">DEMO DATA</span>}
          </div>
          <div className="card-body">
            {['mq136_h2s','mq7_co','mq4_ch4','temperature'].map((key, i) => {
              const labels = { mq136_h2s:'H₂S (MQ-136)', mq7_co:'CO (MQ-7)', mq4_ch4:'CH₄ (MQ-4)', temperature:'Temperature (°C)' };
              return (
                <div key={key} style={{ marginBottom: i < 3 ? 20 : 0 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{labels[key]}</div>
                  <SensorChart data={history} sensorKey={key} label={labels[key]} isDemoMode={isDemoMode} height={80} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="card">
          <div className="card-header">
            <h3>🔔 Recent Alerts</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{alerts.length} total</span>
          </div>
          <div className="card-body">
            <AlertFeed alerts={alerts} maxItems={8} />
          </div>
        </div>
      </div>
    </div>
  );
}
