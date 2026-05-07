import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function DonutChart({ line, data }) {
  const filtered = data.filter(r => r.line === line || r.sku === line || r.shift === line);
  if (!filtered.length) return null;

  const avg = key => filtered.reduce((s, r) => s + r[key], 0) / filtered.length;
  const A = Math.round(avg('A') * 100);
  const P = Math.round(avg('P') * 100);
  const Q = Math.round(avg('Q') * 100);
  const OEE = Math.round(avg('OEE') * 100);

  const chartData = [
    { name: 'A Доступность', value: A, color: '#6c8fff' },
    { name: 'P Производительность', value: P, color: '#4ecda4' },
    { name: 'Q Качество', value: Q, color: '#a78bfa' },
  ];

  const isAlert = OEE < 85;

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${isAlert ? 'rgba(226,75,74,0.4)' : 'var(--border)'}`,
      borderRadius: 14,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{line}</span>
        {isAlert && <span style={{ fontSize: 11, color: '#E24B4A' }}>⚠ Ниже плана</span>}
      </div>

      <div style={{ position: 'relative' }}>
        <PieChart width={160} height={160}>
          <Pie
            data={chartData}
            cx={75}
            cy={75}
            innerRadius={45}
            outerRadius={70}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `${v}%`} />
        </PieChart>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: isAlert ? '#E24B4A' : 'var(--text)' }}>{OEE}%</div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>OEE</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        {chartData.map(item => (
          <div key={item.name} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: item.color }}>{item.value}%</div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{item.name[0]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}