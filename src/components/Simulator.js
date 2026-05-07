import React, { useState } from 'react';

const PARAMS = ['Доступность (A)', 'Производительность (P)', 'Качество (Q)'];

export default function Simulator({ data }) {
  const avgOEE = Math.round(data.reduce((s, r) => s + r.OEE, 0) / data.length * 100);
  const [param, setParam] = useState('Доступность (A)');
  const [percent, setPercent] = useState(5);
  const [result, setResult] = useState(null);

  const calculate = () => {
    const avgA = Math.round(data.reduce((s, r) => s + r.A, 0) / data.length * 100);
const avgP = Math.round(data.reduce((s, r) => s + r.P, 0) / data.length * 100);
const avgQ = Math.round(data.reduce((s, r) => s + r.Q, 0) / data.length * 100);
const newA = param === 'Доступность (A)' ? Math.min(avgA + percent, 100) / 100 : avgA / 100;
const newP = param === 'Производительность (P)' ? Math.min(avgP + percent, 100) / 100 : avgP / 100;
const newQ = param === 'Качество (Q)' ? Math.min(avgQ + percent, 100) / 100 : avgQ / 100;
const newOEEValue = Math.round(newA * newP * newQ * 100);
const gain = newOEEValue - avgOEE;
    const newOEE = newOEEValue;
    const extraOutput = Math.round(gain * 2500);
   const economicEffect = Math.round(gain * 380000);
    setResult({ newOEE, extraOutput, economicEffect, gain });
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid rgba(108,143,255,0.25)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(108,143,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎯</div>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Симулятор "Что если"</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Если мы улучшим:</div>
          <select value={param} onChange={e => setParam(e.target.value)} style={{
            width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '8px 10px', color: 'var(--text)', fontSize: 12, marginBottom: 12,
          }}>
            {PARAMS.map(p => <option key={p}>{p}</option>)}
          </select>

          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>на</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
            <input type="number" value={percent} min={1} max={20} onChange={e => setPercent(Number(e.target.value))} style={{
              width: 60, background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '8px 10px', color: 'var(--text)', fontSize: 12,
            }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>%</span>
          </div>

          <button onClick={calculate} style={{
            width: '100%', background: '#6c8fff', border: 'none', borderRadius: 10,
            padding: '10px 0', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Рассчитать</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, alignContent: 'start' }}>
          {result ? (
            <>
              <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>Новый OEE</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)' }}>{result.newOEE}%</div>
                <div style={{ fontSize: 12, color: '#4ecda4', marginTop: 4 }}>↑ +{result.gain}%</div>
              </div>
              <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>Доп. выпуск</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)' }}>+{result.extraOutput.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>ед.</div>
              </div>
              <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>Экономический эффект</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#4ecda4' }}>₽{result.economicEffect.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>за период</div>
              </div>
            </>
          ) : (
            <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 13, minHeight: 100 }}>
              Выберите параметр и нажмите "Рассчитать"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}