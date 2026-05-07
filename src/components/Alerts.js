import React from 'react';

const alerts = [
  {
    type: 'critical',
    title: 'Критический уровень простоев',
    desc: 'Линия В • Ночная смена • 06.05.26',
    color: '#E24B4A',
    bg: 'rgba(226,75,74,0.12)',
    border: 'rgba(226,75,74,0.3)',
    icon: '⚠',
  },
  {
    type: 'warning',
    title: 'Высокий процент брака',
    desc: 'Инъекции 10мл • Линия В',
    color: '#ffb347',
    bg: 'rgba(255,179,71,0.12)',
    border: 'rgba(255,179,71,0.3)',
    icon: '⚠',
  },
  {
    type: 'info',
    title: 'Улучшение после SMED',
    desc: 'Линия Б: +8% к доступности',
    color: '#6c8fff',
    bg: 'rgba(108,143,255,0.1)',
    border: 'rgba(108,143,255,0.25)',
    icon: 'ℹ',
  },
];

export default function Alerts() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
      {alerts.map((a, i) => (
        <div key={i} style={{
          background: a.bg,
          border: `1px solid ${a.border}`,
          borderRadius: 12,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: a.color, fontSize: 18 }}>{a.icon}</span>
            <div>
              <div style={{ color: a.color, fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{a.title}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{a.desc}</div>
            </div>
          </div>
          <button style={{
            background: a.bg,
            border: `1px solid ${a.border}`,
            borderRadius: 8,
            padding: '4px 10px',
            color: a.color,
            fontSize: 11,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>Подробнее</button>
        </div>
      ))}
    </div>
  );
}