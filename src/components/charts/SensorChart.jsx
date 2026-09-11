import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';

const SENSOR_COLORS = {
  mq136_h2s:   '#f59e0b',
  mq7_co:      '#ef4444',
  mq4_ch4:     '#8b5cf6',
  mq2_gas:     '#06b6d4',
  temperature: '#f97316',
  vibration:   '#3b82f6',
};

const CustomTooltip = ({ active, payload, label, sensorKey }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card-alt)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: '10px 14px',
      fontSize: '0.8rem',
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ color: SENSOR_COLORS[sensorKey] || '#60a5fa', fontWeight: 700 }}>
        {payload[0]?.value ?? '—'} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>ADC</span>
      </div>
    </div>
  );
};

export default function SensorChart({ data = [], sensorKey, label, color, isDemoMode = false, height = 200 }) {
  const chartColor = color || SENSOR_COLORS[sensorKey] || '#3b82f6';

  const formatted = data.map((d) => ({
    ...d,
    _time: d.timestamp ? format(new Date(d.timestamp), 'HH:mm:ss') : '',
    value: d[sensorKey],
  }));

  return (
    <div style={{ position: 'relative' }}>
      {isDemoMode && (
        <div style={{
          position: 'absolute',
          top: 8, right: 8,
          zIndex: 2,
        }}>
          <span className="demo-watermark">DEMO DATA</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={formatted} margin={{ top: 8, right: 12, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="_time"
            tick={{ fontSize: 10 }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip sensorKey={sensorKey} />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={chartColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: chartColor }}
            isAnimationActive={false}
            name={label}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
