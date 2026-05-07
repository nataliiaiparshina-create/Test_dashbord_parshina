import React from 'react';

const SHIFTS = ['Утренняя', 'Дневная', 'Ночная'];
const LINES = ['Линия А', 'Линия Б', 'Линия В'];

function getColor(oee) {
  if (oee >= 85) return '#185FA5';
  if (oee >= 75) return '#378ADD';
  if (oee >= 65) return '#85B7EB';
  if (oee >= 55) return '#B5D4F4';
  return '#E24B4A';
}

export default function Heatmap({ data }) {
  // Берём ВСЕ дни из переданных данных (фильтрация по периоду — на уровне App.js).
  const dates = [...new Set(data.map(r => r.date))].sort();

  const getOEE = (line, shift, date) => {
    const records = data.filter(r => r.line === line && r.shift === shift && r.date === date);
    if (!records.length) return null;
    return Math.round(records.reduce((s, r) => s + r.OEE, 0) / records.length * 100);
  };

  const formatDate = date => {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  // Если дней много — ужимаем колонки по ширине, чтобы таблица не разъезжалась.
  const cellMinWidth = dates.length > 14 ? 32 : 44;

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 16, border: '1px solid var(--border)', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>OEE по дням и сменам (Heatmap)</div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{dates.length} дн.</div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 4, width: '100%' }}>
          <thead>
            <tr>
              <th style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'left', paddingRight: 8, fontWeight: 400, whiteSpace: 'nowrap' }}>Линия / Смена</th>
              {dates.map(date => (
                <th key={date} style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 400, textAlign: 'center', minWidth: cellMinWidth }}>
                  {formatDate(date)}
                </th>
              ))}
              <th style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 400, textAlign: 'center', paddingLeft: 8 }}>Среднее</th>
            </tr>
          </thead>
          <tbody>
            {LINES.map(line => SHIFTS.map(shift => {
              const values = dates.map(date => getOEE(line, shift, date)).filter(v => v != null);
              const avg = values.length ? Math.round(values.reduce((s, v) => s + v, 0) / values.length) : null;
              return (
                <tr key={`${line}-${shift}`}>
                  <td style={{ fontSize: 11, color: 'var(--text-secondary)', paddingRight: 8, whiteSpace: 'nowrap' }}>
                    {line} · {shift}
                  </td>
                  {dates.map(date => {
                    const val = getOEE(line, shift, date);
                    return (
                      <td key={date} style={{ textAlign: 'center' }}>
                        <div style={{
                          background: val ? getColor(val) : 'var(--surface2)',
                          borderRadius: 4,
                          padding: '4px 2px',
                          fontSize: 11,
                          color: '#fff',
                          fontWeight: 500,
                        }}>
                          {val || '-'}
                        </div>
                      </td>
                    );
                  })}
                  <td style={{ textAlign: 'center', paddingLeft: 8 }}>
                    <div style={{
                      background: avg ? getColor(avg) : 'var(--surface2)',
                      borderRadius: 4,
                      padding: '4px 2px',
                      fontSize: 11,
                      color: '#fff',
                      fontWeight: 600,
                    }}>
                      {avg || '-'}
                    </div>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Низкий OEE</span>
          {['#E24B4A', '#B5D4F4', '#85B7EB', '#378ADD', '#185FA5'].map(c => (
            <div key={c} style={{ width: 20, height: 8, background: c, borderRadius: 2 }} />
          ))}
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Высокий OEE</span>
        </div>
      </div>
    </div>
  );
}
