import { format } from 'date-fns';
import { CONNECTION_STATE } from '../../hooks/useSensorData';
import './TopBar.css';

export default function TopBar({ title, connectionState, lastUpdated, isDemoMode }) {
  const connLabel = {
    [CONNECTION_STATE.CONNECTED]:    '🟢 Raspberry Pi Connected',
    [CONNECTION_STATE.DELAYED]:      '🟠 Data Delayed',
    [CONNECTION_STATE.DISCONNECTED]: '🔴 Raspberry Pi Disconnected',
  }[connectionState] || '🔴 Disconnected';

  const connClass = {
    [CONNECTION_STATE.CONNECTED]:    'connected',
    [CONNECTION_STATE.DELAYED]:      'delayed',
    [CONNECTION_STATE.DISCONNECTED]: 'disconnected',
  }[connectionState] || 'disconnected';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
      </div>
      <div className="topbar-right">
        {isDemoMode && (
          <span className="demo-watermark">⚠ DEMO DATA</span>
        )}
        {lastUpdated && (
          <span className="topbar-updated text-sm text-muted">
            Updated {format(lastUpdated, 'HH:mm:ss')}
          </span>
        )}
        <span className={`conn-bar ${connClass}`}>
          <span className={`dot ${connClass === 'connected' ? 'online' : connClass === 'delayed' ? 'delayed' : 'offline'}`} />
          {connLabel}
        </span>
      </div>
    </header>
  );
}
