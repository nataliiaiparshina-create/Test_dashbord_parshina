import React, { useState } from 'react';

const PARAMS = ['Доступность (A)', 'Производительность (P)', 'Качество (Q)'];

const COEFFS = {
  'Доступность (A)':         { output: 1.0, money: 1.0  },
  'Производительность (P)':  { output: 1.0, money: 0.85 },
  'Качество (Q)':            { output: 0.6, money: 1.4  },
};

const BASE_OUTPUT_PER_PP = 2500;
const BASE_MONEY_PER_PP  = 380000;

export function calculateSimulation({ data, param, percent }) {
  if (!data || data.length === 0) return null;
  const avgA = data.reduce((s, r) => s + r.A, 0) / data.length;
  const avgP = data.reduce((s, r) => s + r.P, 0) / data.length;
  const avgQ = data.reduce((s, r) => s + r.Q, 0) / data.length;
  const oldOEE = avgA * avgP * avgQ;
  const delta = percent / 100;
  const newA = param === 'Доступность (A)'         ? Math.min(avgA + delta, 1) : avgA;
  const newP = param === 'Производительность (P)'  ? Math.min(avgP + delta, 1) : avgP;
  const newQ = param === 'Качество (Q)'            ? Math.min(avgQ + delta, 1) : avgQ;
  const newOEE = newA * newP * newQ;
  const gainPP = (newOEE - oldOEE) * 100;
  const c = COEFFS[param] || COEFFS['Доступность (A)'];
  return {
    newOEE: Math.round(newOEE * 100),
    gain: +gainPP.toFixed(1),
    extraOutput: Math.round(gainPP * BASE_OUTPUT_PER_PP * c.output),
    economicEffect: Math.round(gainPP * BASE_MONEY_PER_PP * c.money),
  };
}

const cardStyle = {
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

const cardIcon = (color, bgAlpha) => ({
  width: 30,
  height: 30,
  borderRadius: 8,
  background: bgAlpha,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color,
  fontSize: 14,
  fontWeight: 700,
  flexShrink: 0,
});

const cardLabel = {
  fontSize: 11,
  color: '#9ca0ac',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  fontWeight: 500,
  lineHeight: 1.2,
};

const cardValue = {
  fontSize: 18,
  fontWeight: 600,
  color: '#fff',
  fontVariantNumeric: 'tabular-nums',
};

const cardSub = {
  fontSize: 11,
  color: '#7a7d8a',
  marginTop: 3,
};

const fieldStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  padding: '0 12px',
  fontSize: 12,
  height: 38,
  color: '#d0d2da',
  outline: 'none',
};

const fieldLabel = {
  fontSize: 10,
  color: '#7a7d8a',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  marginBottom: 5,
};

export default function Simulator({ data }) {
  const [param, setParam] = useState('Доступность (A)');
  const [percent, setPercent] = useState(5);
  const [result, setResult] = useState(null);

  const calculate = () => {
    setResult(calculateSimulation({ data, param, percent }));
  };

  const avgOEEDisplay = data && data.length
    ? Math.round(data.reduce((s, r) => s + r.OEE, 0) / data.length * 100)
    : 0;

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
          background: 'rgba(108,143,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14,
        }}>🎯</div>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Симулятор «Что если»</span>
        <span style={{
          marginLeft: 'auto',
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(108,143,255,0.12)',
          border: '1px solid rgba(108,143,255,0.3)',
          borderRadius: 12,
          padding: '3px 10px',
        }}>
          <span style={{ fontSize: 9, color: '#7a7d8a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Сейчас</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#6c8fff' }}>{avgOEEDisplay}%</span>
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <div style={fieldLabel}>Улучшаем</div>
          <select
            value={param}
            onChange={e => setParam(e.target.value)}
            style={{
              ...fieldStyle,
              width: '100%',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'><path d=\'M3 4.5L6 7.5L9 4.5\' stroke=\'%237a7d8a\' stroke-width=\'1.5\' fill=\'none\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/></svg>")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              paddingRight: 30,
            }}
          >
            {PARAMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <div style={fieldLabel}>На</div>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              value={percent}
              min={1}
              max={20}
              onChange={e => setPercent(Number(e.target.value))}
              style={{
                ...fieldStyle,
                width: '100%',
                paddingRight: 28,
                boxSizing: 'border-box',
              }}
            />
            <span style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#7a7d8a',
              fontSize: 12,
              pointerEvents: 'none',
            }}>%</span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr',
        gap: 8,
        marginBottom: 10,
        flex: 1,
      }}>
        <div style={cardStyle}>
          <div style={cardHead}>
            <div style={cardIcon('#6c8fff', 'rgba(108,143,255,0.18)')}>↗</div>
            <span style={cardLabel}>Новый OEE</span>
          </div>
          <div>
            <div style={cardValue}>{result ? `${result.newOEE}%` : '—'}</div>
            {result ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                background: 'rgba(110,255,192,0.15)',
                border: '1px solid rgba(110,255,192,0.3)',
                borderRadius: 10,
                padding: '2px 8px',
                fontSize: 10,
                color: '#6effc0',
                fontWeight: 600,
                marginTop: 5,
              }}>↑ +{result.gain}%</span>
            ) : (
              <div style={cardSub}>прогноз</div>
            )}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardHead}>
            <div style={cardIcon('#ffb347', 'rgba(255,179,71,0.18)')}>▣</div>
            <span style={cardLabel}>Доп. выпуск</span>
          </div>
          <div>
            <div style={cardValue}>{result ? `+${result.extraOutput.toLocaleString('ru-RU')}` : '—'}</div>
            <div style={cardSub}>ед. за период</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardHead}>
            <div style={cardIcon('#6effc0', 'rgba(110,255,192,0.18)')}>$</div>
            <span style={cardLabel}>₽-эффект</span>
          </div>
          <div>
            <div style={{ ...cardValue, fontSize: 14, color: '#6effc0' }}>
              {result ? `₽${result.economicEffect.toLocaleString('ru-RU')}` : '—'}
            </div>
            <div style={cardSub}>за период</div>
          </div>
        </div>
      </div>

      <button
        onClick={calculate}
        style={{
          width: '100%',
          background: '#6c8fff',
          border: 'none',
          borderRadius: 10,
          color: '#fff',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          height: 40,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#8aa6ff'}
        onMouseLeave={e => e.currentTarget.style.background = '#6c8fff'}
      >
        Рассчитать
      </button>
    </div>
  );
}
