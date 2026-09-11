import { format } from 'date-fns';
import RiskBadge from './RiskBadge';

export default function AlertFeed({ alerts = [], maxItems = 10 }) {
  const displayed = alerts.slice(0, maxItems);

  if (displayed.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        ✅ No recent alerts
      </div>
    );
  }

  return (
    <div>
      {displayed.map((alert, i) => (
        <div key={alert.id || i} className="alert-item">
          <span className={`alert-dot ${alert.severity}`} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{alert.worker_id}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{alert.sensor}</span>
              <RiskBadge level={alert.severity} />
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
              {alert.message}
            </div>
            {alert.timestamp && (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {format(new Date(alert.timestamp), 'MMM d, HH:mm:ss')}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
