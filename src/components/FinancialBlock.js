import React from 'react';

export default function FinancialBlock({ data }) {
  const totalDefects = data.reduce((s, r) => s + r.defects, 0);
  const totalDowntime = data.reduce((s, r) => s + r.downtime, 0);
  const totalRework = data.reduce((s, r) => s + r.rework, 0);

  const lossFromDowntime = Math.round(totalDowntime * 120);
  const lossFromDefects = Math.round(totalDefects * 85);
  const lossFromRework = Math.round(totalRework * 45);
  const totalLoss = lossFromDowntime + lossFromDefects + lossFromRework;

  const cards = [
    { label: 'Потери из-за простоев', value: lossFromDowntime, icon: '⏱', sub: `${totalDowntime.toLocaleString()} мин простоев` },
    { label: 'Потери из-за брака', value: lossFromDefects, icon: '❌', sub: `${totalDefects.toLocaleString()} ед. брака` },
    { label: 'Потери из-за переработки', value: lossFromRework, icon: '⚡', sub: `${totalRework.toLocaleString()} ед. переработки` },
    { label: 'Общие потери', value: totalLoss, icon: '💰', highlight: true, sub: 'за выбранный период' },
  ];

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
        Финансовый эффект · за выбранный период
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {cards.map((card, i) => (
          <div key={i} style={{
            background: card.highlight ? 'rgba(226,75,74,0.08)' : 'var(--surface)',
            border: `1px solid ${card.highlight ? 'rgba(226,75,74,0.3)' : 'var(--border)'}`,
            borderRadius: 14,
            padding: 16,
          }}>
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>{card.label}</div>
            <div style={{ fontSize: card.highlight ? 22 : 18, fontWeight: 700, color: card.highlight ? '#E24B4A' : 'var(--text)', marginBottom: 6 }}>
              ₽{card.value.toLocaleString()}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{card.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}