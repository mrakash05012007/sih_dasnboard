import { format } from 'date-fns';
import RiskBadge from './RiskBadge';

const riskRowClass = { SAFE: 'row-safe', WARNING: 'row-warning', DANGER: 'row-danger', CRITICAL: 'row-critical' };

export default function WorkerTable({ workers = [], onSelectWorker }) {
  if (workers.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        No worker data available. Waiting for Raspberry Pi...
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Worker ID</th>
            <th>H₂S (MQ-136)</th>
            <th>CO (MQ-7)</th>
            <th>CH₄ (MQ-4)</th>
            <th>MQ-2</th>
            <th>Temp (°C)</th>
            <th>Vibration</th>
            <th>Fall</th>
            <th>Risk</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {workers.map((w) => (
            <tr
              key={w.worker_id}
              className={riskRowClass[w.risk_level] || ''}
              onClick={() => onSelectWorker && onSelectWorker(w)}
              title="Click to view sensor history"
            >
              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{w.worker_id}</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{w.mq136_h2s ?? '—'}</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{w.mq7_co ?? '—'}</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{w.mq4_ch4 ?? '—'}</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{w.mq2_gas ?? '—'}</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{w.temperature != null ? `${w.temperature}°` : '—'}</td>
              <td>
                {w.vibration ? (
                  <span className="risk-badge WARNING">Active</span>
                ) : (
                  <span className="risk-badge SAFE">None</span>
                )}
              </td>
              <td>
                {w.fall_detected ? (
                  <span className="risk-badge CRITICAL">⚠ FALL</span>
                ) : (
                  <span className="risk-badge SAFE">None</span>
                )}
              </td>
              <td><RiskBadge level={w.risk_level} /></td>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {w.last_updated ? format(new Date(w.last_updated), 'HH:mm:ss') : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
