import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from 'recharts';

const SHIFTS = ['Утренняя', 'Дневная', 'Ночная'];

export default function PeriodComparison({ data }) {
  const [mode, setMode] = useState('week'); // 'week' | 'shift'

  // === Режим: неделя к неделе ===
  const weekContent = () => {
    const dates = [...new Set(data.map(r => r.date))].sort();

    const getWeekOEE = (weekDates) => weekDates.map(date => {
      const records = data.filter(r => r.date === date);
      const avg = records.length ? records.reduce((s, r) => s + r.OEE, 0) / records.length : 0;
      return { date: date.slice(5), oee: Math.round(avg * 100) };
    });

    const lastWeek = dates.slice(-7);
    const prevWeek = dates.slice(-14, -7);
    const currentData = getWeekOEE(lastWeek);
    const previousData = getWeekOEE(prevWeek);

    const currentAvg = currentData.length ? Math.round(currentData.reduce((s, r) => s + r.oee, 0) / currentData.length) : 0;
    const prevAvg = previousData.length ? Math.round(previousData.reduce((s, r) => s + r.oee, 0) / previousData.length) : 0;
    const diff = currentAvg - prevAvg;

    const chartData = currentData.map((item, i) => ({
      date: item.date,
      current: item.oee,
      previous: previousData[i]?.oee || 0,
    }));

    return (
      <>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '12px 20px', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>Текущая неделя</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>{currentAvg}%</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 20, color: 'var(--text-tertiary)' }}>VS</div>
          <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '12px 20px', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>Прошлая неделя</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>{prevAvg}%</div>
          </div>
          <div style={{ background: diff >= 0 ? 'rgba(78,205,164,0.15)' : 'rgba(226,75,74,0.15)', borderRadius: 10, padding: '12px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>Изменение</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: diff >= 0 ? '#4ecda4' : '#E24B4A' }}>
              {diff >= 0 ? '↑' : '↓'} {Math.abs(diff)}%
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca0ac' }} />
            <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: '#9ca0ac' }} />
            <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: '#1a1d27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
            <ReferenceLine y={85} stroke="#E24B4A" strokeDasharray="4 3" />
            <Line type="monotone" dataKey="current" stroke="#6c8fff" strokeWidth={2} dot={false} name="Текущая" />
            <Line type="monotone" dataKey="previous" stroke="rgba(255,255,255,0.3)" strokeWidth={1} strokeDasharray="4 3" dot={false} name="Прошлая" />
          </LineChart>
        </ResponsiveContainer>
      </>
    );
  };

  // === Режим: смена к смене (Утро / День / Ночь) ===
  const shiftContent = () => {
    // За последние 7 дней — средние A/P/Q/OEE по каждой смене
    const dates = [...new Set(data.map(r => r.date))].sort().slice(-7);
    const recentData = data.filter(r => dates.includes(r.date));

    const shiftStats = SHIFTS.map(shift => {
      const recs = recentData.filter(r => r.shift === shift);
      if (!recs.length) return { shift, oee: 0, A: 0, P: 0, Q: 0, count: 0 };
      const avg = key => recs.reduce((s, r) => s + r[key], 0) / recs.length;
      return {
        shift,
        oee: Math.round(avg('OEE') * 100),
        A: Math.round(avg('A') * 100),
        P: Math.round(avg('P') * 100),
        Q: Math.round(avg('Q') * 100),
        count: recs.length,
      };
    });

    const best = shiftStats.reduce((b, s) => s.oee > b.oee ? s : b, shiftStats[0]);
    const worst = shiftStats.reduce((w, s) => s.oee < w.oee ? s : w, shiftStats[0]);
    const diff = best.oee - worst.oee;

    const chartData = shiftStats.map(s => ({ name: s.shift, OEE: s.oee, A: s.A, P: s.P, Q: s.Q }));

    return (
      <>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ background: 'rgba(78,205,164,0.10)', borderRadius: 10, padding: '12px 20px', flex: 1, textAlign: 'center', border: '1px solid rgba(78,205,164,0.25)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>Лучшая смена</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{best.shift}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#4ecda4' }}>{best.oee}%</div>
          </div>
          <div style={{ background: 'rgba(226,75,74,0.10)', borderRadius: 10, padding: '12px 20px', flex: 1, textAlign: 'center', border: '1px solid rgba(226,75,74,0.25)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>Худшая смена</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{worst.shift}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#E24B4A' }}>{worst.oee}%</div>
          </div>
          <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '12px 20px', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>Разрыв</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>&nbsp;</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: diff > 5 ? '#E24B4A' : '#4ecda4' }}>
              {diff} п.п.
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={chartData} barCategoryGap={20}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca0ac' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca0ac' }} />
            <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: '#1a1d27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
            <ReferenceLine y={85} stroke="#E24B4A" strokeDasharray="4 3" />
            <Bar dataKey="A" fill="#6c8fff" name="Доступность" />
            <Bar dataKey="P" fill="#4ecda4" name="Производительность" />
            <Bar dataKey="Q" fill="#a78bfa" name="Качество" />
            <Bar dataKey="OEE" fill="rgba(255,255,255,0.6)" name="OEE" />
          </BarChart>
        </ResponsiveContainer>
      </>
    );
  };

  // Pill-стиль кнопок переключателя
  const tabBtn = (active) => ({
    background: active ? '#6c8fff' : 'transparent',
    border: 'none',
    borderRadius: 7,
    padding: '6px 14px',
    color: active ? '#fff' : '#9ca0ac',
    fontSize: 12,
    fontWeight: active ? 500 : 400,
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
  });

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 16, border: '1px solid var(--border)', marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Сравнение периодов</div>
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, padding: 3 }}>
          <button style={tabBtn(mode === 'week')} onClick={() => setMode('week')}>Неделя к неделе</button>
          <button style={tabBtn(mode === 'shift')} onClick={() => setMode('shift')}>Смена к смене</button>
        </div>
      </div>

      {mode === 'week' ? weekContent() : shiftContent()}
    </div>
  );
}
