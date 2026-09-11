import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from 'recharts';
import DemoBanner from '../components/DemoBanner';
import SensorChart from '../components/charts/SensorChart';

const RISK_PIE_COLORS = { SAFE: '#22c55e', WARNING: '#f59e0b', DANGER: '#ef4444', CRITICAL: '#dc2626' };

export default function Analytics({ workers, alerts, history, isDemoMode }) {
  const avgData = useMemo(() => {
    if (!workers.length) return [];
    const keys = ['mq136_h2s', 'mq7_co', 'mq4_ch4', 'mq2_gas'];
    const labels = { mq136_h2s: 'H₂S', mq7_co: 'CO', mq4_ch4: 'CH₄', mq2_gas: 'MQ-2' };
    return keys.map(k => ({
      name: labels[k],
      avg: Math.round(workers.reduce((s, w) => s + (w[k] || 0), 0) / workers.length),
    }));
  }, [workers]);

  const riskDistribution = useMemo(() => {
    const counts = { SAFE: 0, WARNING: 0, DANGER: 0, CRITICAL: 0 };
    workers.forEach(w => { if (counts[w.risk_level] !== undefined) counts[w.risk_level]++; });
    return Object.entries(counts).filter(([,v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [workers]);

  const alertsBySeverity = useMemo(() => {
    const counts = { CRITICAL: 0, DANGER: 0, WARNING: 0, INFO: 0 };
    alerts.forEach(a => { if (counts[a.severity] !== undefined) counts[a.severity]++; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [alerts]);

  return (
    <div className="page-wrapper page-enter">
      {isDemoMode && <DemoBanner />}

      <div className="grid-2 mb-4">
        {/* Sensor Averages */}
        <div className="card">
          <div className="card-header">
            <h3>📊 Average Sensor Readings</h3>
            {isDemoMode && <span className="demo-watermark">DEMO DATA</span>}
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={avgData} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', borderRadius: '6px' }}
                  labelStyle={{ color: 'var(--text-secondary)' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Bar dataKey="avg" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg ADC" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Pie */}
        <div className="card">
          <div className="card-header">
            <h3>🥧 Worker Risk Distribution</h3>
            {isDemoMode && <span className="demo-watermark">DEMO DATA</span>}
          </div>
          <div className="card-body">
            {riskDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={riskDistribution} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                    {riskDistribution.map((entry) => (
                      <Cell key={entry.name} fill={RISK_PIE_COLORS[entry.name] || '#3b82f6'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', borderRadius: '6px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No worker data</div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts by Severity */}
      <div className="card mb-4">
        <div className="card-header">
          <h3>🔔 Alert Frequency by Severity</h3>
          {isDemoMode && <span className="demo-watermark">DEMO DATA</span>}
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={alertsBySeverity} margin={{ top: 4, right: 12, left: -10, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={65} />
              <Tooltip contentStyle={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', borderRadius: '6px' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Count">
                {alertsBySeverity.map(entry => (
                  <Cell key={entry.name} fill={RISK_PIE_COLORS[entry.name] || '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* H2S + Temp trends */}
      <div className="grid-2">
        {[
          { key: 'mq136_h2s', label: 'H₂S Trend (MQ-136)', color: '#f59e0b' },
          { key: 'temperature', label: 'Temperature Trend (°C)', color: '#f97316' },
        ].map(({ key, label, color }) => (
          <div key={key} className="card">
            <div className="card-header"><h4>{label}</h4></div>
            <div className="card-body">
              <SensorChart data={history} sensorKey={key} label={label} color={color} isDemoMode={isDemoMode} height={160} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
