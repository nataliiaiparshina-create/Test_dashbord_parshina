import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

export default function PeriodComparison({ data }) {
  const dates = [...new Set(data.map(r => r.date))].sort();
  
  const getWeekOEE = (weekDates) => {
    return weekDates.map(date => {
      const records = data.filter(r => r.date === date);
      const avg = records.length ? records.reduce((s, r) => s + r.OEE, 0) / records.length : 0;
      return { date: date.slice(5), oee: Math.round(avg * 100) };
    });
  };

  const lastWeek = dates.slice(-7);
  const prevWeek = dates.slice(-14, -7);

  const currentData = getWeekOEE(lastWeek);
  const previousData = getWeekOEE(prevWeek);

  const currentAvg = Math.round(currentData.reduce((s, r) => s + r.oee, 0) / currentData.length);
  const prevAvg = Math.round(previousData.reduce((s, r) => s + r.oee, 0) / previousData.length);
  const diff = currentAvg - prevAvg;

  const chartData = currentData.map((item, i) => ({
    date: item.date,
    current: item.oee,
    previous: previousData[i]?.oee || 0,
  }));

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 16, border: '1px solid var(--border)', marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Сравнение периодов</div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Неделя к неделе</div>
      </div>

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
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
          <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
          <Tooltip formatter={(v) => `${v}%`} />
          <ReferenceLine y={85} stroke="#E24B4A" strokeDasharray="4 3" />
          <Line type="monotone" dataKey="current" stroke="#6c8fff" strokeWidth={2} dot={false} name="Текущая" />
          <Line type="monotone" dataKey="previous" stroke="rgba(255,255,255,0.3)" strokeWidth={1} strokeDasharray="4 3" dot={false} name="Прошлая" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}