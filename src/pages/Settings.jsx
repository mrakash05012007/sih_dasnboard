import { useState } from 'react';
import { getCurrentBaseUrl, setBaseUrlOverride } from '../services/api';

export default function Settings({ onPollIntervalChange }) {
  const [baseUrl, setBaseUrl] = useState(() => localStorage.getItem('rpi_api_base_url') || import.meta.env.VITE_API_BASE_URL || '');
  const [saved, setSaved] = useState(false);
  const [pollMs, setPollMs] = useState(() => parseInt(localStorage.getItem('poll_interval_ms') || '1500'));
  const [demoForced, setDemoForced] = useState(() => localStorage.getItem('force_demo') === 'true');

  const handleSaveUrl = () => {
    setBaseUrlOverride(baseUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePollChange = (val) => {
    const ms = parseInt(val);
    setPollMs(ms);
    localStorage.setItem('poll_interval_ms', ms);
    onPollIntervalChange?.(ms);
  };

  const handleDemoToggle = (val) => {
    setDemoForced(val);
    localStorage.setItem('force_demo', val ? 'true' : 'false');
  };

  const handleReset = () => {
    localStorage.removeItem('rpi_api_base_url');
    setBaseUrl(import.meta.env.VITE_API_BASE_URL || '');
  };

  return (
    <div className="page-wrapper page-enter">
      {/* RPi Connection */}
      <div className="card mb-4">
        <div className="card-header"><h3>🌐 Raspberry Pi Connection</h3></div>
        <div className="card-body">
          <div style={{ marginBottom: '20px', padding: '14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: 'var(--text-muted)', borderLeft: '3px solid var(--accent-blue)' }}>
            <strong style={{ color: 'var(--accent-blue-l)' }}>How to connect:</strong><br />
            1. Find your Raspberry Pi IP address (e.g., run <code style={{ fontFamily: 'var(--font-mono)' }}>hostname -I</code> on the Pi)<br />
            2. Enter it below in the format <code style={{ fontFamily: 'var(--font-mono)' }}>http://&lt;IP&gt;:8000</code><br />
            3. Click Save — the dashboard will immediately use the new URL.<br />
            4. For a permanent fix, update <code style={{ fontFamily: 'var(--font-mono)' }}>.env</code> and rebuild.
          </div>
          <div className="form-group">
            <label className="form-label">Backend URL (Raspberry Pi FastAPI)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="form-input"
                type="url"
                value={baseUrl}
                onChange={e => setBaseUrl(e.target.value)}
                placeholder="http://192.168.1.25:8000"
              />
              <button className="btn btn-primary" onClick={handleSaveUrl}>{saved ? '✓ Saved!' : 'Save'}</button>
              <button className="btn btn-ghost" onClick={handleReset}>Reset</button>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Current active URL: <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-blue-l)' }}>{getCurrentBaseUrl()}</code>
            </div>
          </div>
        </div>
      </div>

      {/* Polling */}
      <div className="card mb-4">
        <div className="card-header"><h3>⏱ Data Polling</h3></div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Poll Interval: {pollMs}ms ({(pollMs/1000).toFixed(1)}s)</label>
            <input
              type="range"
              min="500"
              max="5000"
              step="250"
              value={pollMs}
              onChange={e => handlePollChange(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent-blue)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>0.5s (fast)</span><span>5.0s (slow)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Mode */}
      <div className="card mb-4">
        <div className="card-header"><h3>🎭 Demo Mode</h3></div>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>Force Demo Data</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                When enabled, dashboard uses simulated data even if RPi is reachable.
                Useful for UI testing without a physical device.
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={demoForced}
                onChange={e => handleDemoToggle(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-blue)', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 600 }}>{demoForced ? '🟡 Demo ON' : '✅ Demo OFF'}</span>
            </label>
          </div>
        </div>
      </div>

      {/* .env info */}
      <div className="card">
        <div className="card-header"><h3>📄 Environment Configuration</h3></div>
        <div className="card-body">
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            For permanent configuration, edit the <code style={{ fontFamily: 'var(--font-mono)' }}>.env</code> file in the project root:
          </div>
          <pre style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-primary)', overflow: 'auto' }}>
{`# .env
VITE_API_BASE_URL=http://YOUR_RASPBERRY_PI_IP:8000

# Example:
VITE_API_BASE_URL=http://192.168.1.25:8000`}
          </pre>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            After editing <code style={{ fontFamily: 'var(--font-mono)' }}>.env</code>, restart the dev server with <code style={{ fontFamily: 'var(--font-mono)' }}>npm run dev</code>
          </div>
        </div>
      </div>
    </div>
  );
}
