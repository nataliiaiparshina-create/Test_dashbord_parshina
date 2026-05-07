import React, { useState } from 'react';

const PARAMS = ['Доступность (A)', 'Производительность (P)', 'Качество (Q)'];

// Коэффициенты влияния на выпуск и экономический эффект по типу улучшения.
// Логика обоснования:
//  - A (Доступность): рост = пропорциональный рост времени работы → базовый эффект 1.0/1.0.
//  - P (Производительность): быстрее цикл → больше выпуска, но износ оборудования и риск
//    качества снижают чистый ₽-эффект ~ на 15%.
//  - Q (Качество): прибавка = меньше брака. В штуках прирост выпуска меньше (брак был и так
//    невелик), НО каждая отбракованная упаковка уже несёт затраты на сырьё, труд и утилизацию.
//    В фарм-индустрии стоимость брака обычно в 1.3–1.5 раза выше валовой выручки за единицу
//    из-за затрат на расследование, утилизацию по GMP и регуляторных рисков → берём 1.4×.
const COEFFS = {
  'Доступность (A)':         { output: 1.0, money: 1.0  },
  'Производительность (P)':  { output: 1.0, money: 0.85 },
  'Качество (Q)':            { output: 0.6, money: 1.4  },
};

const BASE_OUTPUT_PER_PP = 2500;    // ед. на 1 п.п. прироста OEE
const BASE_MONEY_PER_PP  = 380000;  // ₽ на 1 п.п. прироста OEE

// Чистая функция расчёта — экспортируется для юнит-тестов.
export function calculateSimulation({ data, param, percent }) {
  if (!data || data.length === 0) return null;

  // Средние как доли (0..1), без раннего округления
  const avgA = data.reduce((s, r) => s + r.A, 0) / data.length;
  const avgP = data.reduce((s, r) => s + r.P, 0) / data.length;
  const avgQ = data.reduce((s, r) => s + r.Q, 0) / data.length;

  const oldOEE = avgA * avgP * avgQ;

  const delta = percent / 100;
  const newA = param === 'Доступность (A)'         ? Math.min(avgA + delta, 1) : avgA;
  const newP = param === 'Производительность (P)'  ? Math.min(avgP + delta, 1) : avgP;
  const newQ = param === 'Качество (Q)'            ? Math.min(avgQ + delta, 1) : avgQ;

  const newOEE = newA * newP * newQ;
  const gain = newOEE - oldOEE;     // доля, например 0.0432
  const gainPP = gain * 100;        // в процентных пунктах

  const c = COEFFS[param] || COEFFS['Доступность (A)'];
  const extraOutput    = Math.round(gainPP * BASE_OUTPUT_PER_PP * c.output);
  const economicEffect = Math.round(gainPP * BASE_MONEY_PER_PP  * c.money);

  return {
    newOEE: Math.round(newOEE * 100),
    gain: +gainPP.toFixed(1),
    extraOutput,
    economicEffect,
  };
}

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
    <div style={{ background: 'var(--surface)', border: '1px solid rgba(108,143,255,0.25)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(108,143,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎯</div>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Симулятор "Что если"</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-tertiary)' }}>Текущий OEE: {avgOEEDisplay}%</span>
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
