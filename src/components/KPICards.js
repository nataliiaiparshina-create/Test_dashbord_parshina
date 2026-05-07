import React from 'react';

function calcKPI(data, selectedLine, selectedShift) {
  let filtered = data;
  if (selectedLine !== 'Все линии') filtered = filtered.filter(r => r.line === selectedLine);
  if (selectedShift !== 'Все смены') filtered = filtered.filter(r => r.shift === selectedShift);
  if (!filtered.length) return null;
  const avg = key => filtered.reduce((s, r) => s + r[key], 0) / filtered.length;
  return {
    OEE: Math.round(avg('OEE') * 100),
    A: Math.round(avg('A') * 100),
    P: Math.round(avg('P') * 100),
    Q: Math.round(avg('Q') * 100),
  };
}

const cards = [
  { key: 'OEE', label: 'OEE (Общая эффективность)', plan: 85, color: '#E24B4A', icon: '📊' },
  { key: 'A', label: 'Доступность (A)', plan: 90, color: '#6c8fff', icon: '⏱' },
  { key: 'P', label: 'Производительность (P)', plan: 95, color: '#4ecda4', icon: '⚡' },
  { key: 'Q', label: 'Качество (Q)', plan: 95, color: '#a78bfa', icon: '✅' },
];

export default function KPICards({ data, selectedLine, selectedShift }) {
  const kpi = calcKPI(data, selectedLine, selectedShift);
  if (!kpi) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
      {cards.map(card => {
        const value = kpi[card.key];
        const diff = value - card.plan;
        const isGood = diff >= 0;
        return (
          <div key={card.key} style={{
            background: 'var(--surface)',
            border: `1px solid ${card.key === 'OEE' && !isGood ? 'rgba(226,75,74,0.4)' : 'var(--border)'}`,
            borderRadius: 14,
            padding: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${card.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{card.icon}</div>
              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: isGood ? 'rgba(78,205,164,0.15)' : 'rgba(226,75,74,0.15)', color: isGood ? '#4ecda4' : '#E24B4A', fontWeight: 500 }}>
                {isGood ? '↑' : '↓'} {Math.abs(diff)}%
              </span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 600, color: card.key === 'OEE' && !isGood ? '#E24B4A' : 'var(--text)', marginBottom: 4 }}>{value}%</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{card.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>План: {card.plan}%</div>
            <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(value, 100)}%`, background: card.color, borderRadius: 2 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}