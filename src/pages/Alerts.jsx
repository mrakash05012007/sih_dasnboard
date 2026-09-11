import { useState } from 'react';
import { format } from 'date-fns';
import DemoBanner from '../components/DemoBanner';
import RiskBadge from '../components/RiskBadge';

const SEVERITY_ORDER = ['CRITICAL', 'DANGER', 'WARNING', 'INFO'];

export default function Alerts({ alerts, isDemoMode }) {
  const [filter, setFilter] = useState('ALL');

  const filtered = filter === 'ALL' ? alerts : alerts.filter(a => a.severity === filter);
  const counts = SEVERITY_ORDER.reduce((acc, s) => ({ ...acc, [s]: alerts.filter(a => a.severity === s).length }), {});

  const dotColor = { CRITICAL: 'var(--critical)', DANGER: 'var(--danger)', WARNING: 'var(--warning)', INFO: 'var(--info)' };

  return (
    <div className="page-wrapper page-enter">
      {isDemoMode && <DemoBanner />}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {['ALL', ...SEVERITY_ORDER].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}
          >
            {s !== 'ALL' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor[s], display: 'inline-block' }} />}
            {s}
            {s !== 'ALL' && counts[s] > 0 && (
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0 5px', borderRadius: '99px', fontSize: '0.7rem' }}>
                {counts[s]}
              </span>
            )}
            {s === 'ALL' && (
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0 5px', borderRadius: '99px', fontSize: '0.7rem' }}>
                {alerts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>🔔 Alert Log</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{filtered.length} alerts</span>
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            ✅ No alerts matching this filter
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Worker</th>
                  <th>Sensor</th>
                  <th>Message</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((alert, i) => (
                  <tr key={alert.id || i} className={`row-${alert.severity?.toLowerCase()}`}>
                    <td><RiskBadge level={alert.severity} /></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{alert.worker_id}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{alert.sensor}</td>
                    <td style={{ fontSize: '0.85rem' }}>{alert.message}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {alert.timestamp ? format(new Date(alert.timestamp), 'MMM d HH:mm:ss') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
