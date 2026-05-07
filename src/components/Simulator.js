import React, { useState } from 'react';

const PARAMS = ['Доступность (A)', 'Производительность (P)', 'Качество (Q)'];

export default function Simulator({ data }) {
  const avgOEE = Math.round(data.reduce((s, r) => s + r.OEE, 0) / data.length * 100);
  const [param, setParam] = useState('Доступность (A)');
  const [percent, setPercent] = useState(5);
  const [result, setResult] = useState(null);

  const calculate = () => {
    const gain = Math.round(avgOEE * (percent / 100));
    const newOEE = Math.min(avgOEE + gain, 95);
    const extraOutput = Math.round(gain * 2500);
    const economicEffect = Math.round(gain * 3780);
    setResult({ newOEE, extraOutput, economicEffect, gain });
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid rgba(108,143,255,0.25)',
      borderRadius: 14,
      padding: 20,
      marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 16 }}>🎯</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Симулятор "Что если"</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Если мы улучшим:</div>
          <select
            value={param}
            onChange={e => setParam(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '8px 12px',
              color: 'var(--text)',
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            {PARAMS.map(p => <option key={p}>{p}</option>)}
          </select>

          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>на</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
            <input
              type="number"
              value={percent}
              min={1}
              max={20}
              onChange={e => setPercent(Number(e.target.value))}
              style={{
                width: 80,
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 12px',
                color: 'var(--text)',
                fontSize: 13,
              }}
            />
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>%</span>
          </div>

          <button
            onClick={calculate}
            style={{
              width: '100%',
              background: '#6c8fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px 0',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Рассчитать
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {result ? (
            <>
              <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>Новый OEE</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{result.newOEE}%</div>
                <div style={{ fontSize: 12, color: '#4ecda4' }}>↑ +{result.gain}%</div>
              </div>
              <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>Доп. выпуск</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>+{result.extraOutput.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>ед.</div>
              </div>
              <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>Экономический эффект</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#4ecda4' }}>₽{result.economicEffect.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>за период</div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)', fontSize: 13 }}>
              Выберите параметр и нажмите "Рассчитать"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}