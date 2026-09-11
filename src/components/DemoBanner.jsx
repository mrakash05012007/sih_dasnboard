export default function DemoBanner() {
  return (
    <div className="demo-banner">
      <span style={{ fontSize: '1.1rem' }}>⚠</span>
      <div>
        <strong>DEMO DATA MODE</strong> — Raspberry Pi backend not connected.
        All displayed values are simulated. Configure your RPi IP in{' '}
        <strong>Settings</strong> to connect real sensor data.
      </div>
    </div>
  );
}
