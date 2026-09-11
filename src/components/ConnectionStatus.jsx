import { CONNECTION_STATE } from '../hooks/useSensorData';

export default function ConnectionStatus({ connectionState }) {
  const map = {
    [CONNECTION_STATE.CONNECTED]:    { cls: 'connected',    dot: 'online',   label: '🟢 Raspberry Pi Connected' },
    [CONNECTION_STATE.DELAYED]:      { cls: 'delayed',      dot: 'delayed',  label: '🟠 Data Delayed' },
    [CONNECTION_STATE.DISCONNECTED]: { cls: 'disconnected', dot: 'offline',  label: '🔴 Raspberry Pi Disconnected' },
  };
  const { cls, dot, label } = map[connectionState] || map[CONNECTION_STATE.DISCONNECTED];

  return (
    <span className={`conn-bar ${cls}`}>
      <span className={`dot ${dot}`} />
      {label}
    </span>
  );
}
