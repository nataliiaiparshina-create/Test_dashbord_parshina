import React from 'react';

const cardBase = {
  background: 'rgba(255,255,255,0.04)',
  borderRadius: 10,
  padding: 14,
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
};

const cardHead = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const cardIcon = (color, bg) => ({
  width: 30,
  height: 30,
  borderRadius: 8,
  background: bg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color,
  fontSize: 14,
  fontWeight: 700,
  flexShrink: 0,
});

const cardLabel = (color = '#9ca0ac', danger = false) => ({
  fontSize: 11,
  color,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  fontWeight: danger ? 600 : 500,
  lineHeight: 1.2,
});

const cardValue = (color = '#fff') => ({
  fontSize: 18,
  fontWeight: 600,
  color,
  fontVariantNumeric: 'tabular-nums',
});

const cardSub = {
  fontSize: 11,
  color: '#7a7d8a',
  marginTop: 3,
};

export default function FinancialBlock({ data, periodLabel }) {
  const totalDefects = data.reduce((s, r) => s + r.defects, 0);
  const totalDowntime = data.reduce((s, r) => s + r.downtime, 0);
  const totalRework = data.reduce((s, r) => s + r.rework, 0);

  const lossFromDowntime = Math.round(totalDowntime * 120);
  const lossFromDefects = Math.round(totalDefects * 85);
  const lossFromRework = Math.round(totalRework * 45);
  const totalLoss = lossFromDowntime + lossFromDefects + lossFromRework;

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid rgba(108,143,255,0.25)',
      borderRadius: 14,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'rgba(226,75,74,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14,
        }}>💰</div>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Финансовый эффект</span>
        {periodLabel && (
          <span style={{ marginLeft: 'auto', fontSize: 10, color: '#7a7d8a' }}>
            {periodLabel}
          </span>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        flex: 1,
      }}>
        <div style={cardBase}>
          <div style={cardHead}>
            <div style={cardIcon('#6c8fff', 'rgba(108,143,255,0.18)')}>⏱</div>
            <span style={cardLabel()}>Простои</span>
          </div>
          <div>
            <div style={cardValue()}>₽{lossFromDowntime.toLocaleString('ru-RU')}</div>
            <div style={cardSub}>{totalDowntime.toLocaleString('ru-RU')} мин</div>
          </div>
        </div>

        <div style={cardBase}>
          <div style={cardHead}>
            <div style={cardIcon('#ff8080', 'rgba(226,75,74,0.18)')}>✕</div>
            <span style={cardLabel()}>Брак</span>
          </div>
          <div>
            <div style={cardValue()}>₽{lossFromDefects.toLocaleString('ru-RU')}</div>
            <div style={cardSub}>{totalDefects.toLocaleString('ru-RU')} ед.</div>
          </div>
        </div>

        <div style={cardBase}>
          <div style={cardHead}>
            <div style={cardIcon('#ffb347', 'rgba(255,179,71,0.18)')}>⚡</div>
            <span style={cardLabel()}>Переработка</span>
          </div>
          <div>
            <div style={cardValue()}>₽{lossFromRework.toLocaleString('ru-RU')}</div>
            <div style={cardSub}>{totalRework.toLocaleString('ru-RU')} ед.</div>
          </div>
        </div>

        <div style={{
          ...cardBase,
          background: 'rgba(226,75,74,0.10)',
          border: '1px solid rgba(226,75,74,0.25)',
        }}>
          <div style={cardHead}>
            <div style={cardIcon('#ff8080', 'rgba(226,75,74,0.25)')}>!</div>
            <span style={cardLabel('#ff8080', true)}>Общие потери</span>
          </div>
          <div>
            <div style={cardValue('#ff8080')}>₽{totalLoss.toLocaleString('ru-RU')}</div>
            <div style={cardSub}>за период</div>
          </div>
        </div>
      </div>
    </div>
  );
}
