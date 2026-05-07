import React from 'react';

export default function ExportButton({ data }) {
  const exportCSV = () => {
    let csv = '\uFEFF';

    // Секция 1 — Сводка по линиям
    csv += 'СВОДКА ПО ЛИНИЯМ\n';
    csv += 'Линия;OEE (%);Доступность A (%);Производительность P (%);Качество Q (%);Брак (ед);Простои (мин)\n';
    ['Линия А', 'Линия Б', 'Линия В'].forEach(line => {
      const d = data.filter(r => r.line === line);
      if (!d.length) return;
      const avg = k => Math.round(d.reduce((s, r) => s + r[k], 0) / d.length * 100) / 100;
      const sum = k => d.reduce((s, r) => s + r[k], 0);
      csv += `${line};${Math.round(avg('OEE') * 100)};${Math.round(avg('A') * 100)};${Math.round(avg('P') * 100)};${Math.round(avg('Q') * 100)};${sum('defects')};${sum('downtime')}\n`;
    });

    csv += '\n';

    // Секция 2 — Сводка по сменам
    csv += 'СВОДКА ПО СМЕНАМ\n';
    csv += 'Смена;OEE (%);Доступность A (%);Производительность P (%);Качество Q (%);Брак (ед);Простои (мин)\n';
    ['Утренняя', 'Дневная', 'Ночная'].forEach(shift => {
      const d = data.filter(r => r.shift === shift);
      if (!d.length) return;
      const avg = k => Math.round(d.reduce((s, r) => s + r[k], 0) / d.length * 100) / 100;
      const sum = k => d.reduce((s, r) => s + r[k], 0);
      csv += `${shift};${Math.round(avg('OEE') * 100)};${Math.round(avg('A') * 100)};${Math.round(avg('P') * 100)};${Math.round(avg('Q') * 100)};${sum('defects')};${sum('downtime')}\n`;
    });

    csv += '\n';

    // Секция 3 — Сводка по SKU
    csv += 'СВОДКА ПО SKU\n';
    csv += 'SKU;OEE (%);Доступность A (%);Производительность P (%);Качество Q (%);Брак (ед);Переработка (ед)\n';
    ['Таблетки 500мг', 'Капсулы 250мг', 'Инъекции 10мл'].forEach(sku => {
      const d = data.filter(r => r.sku === sku);
      if (!d.length) return;
      const avg = k => Math.round(d.reduce((s, r) => s + r[k], 0) / d.length * 100) / 100;
      const sum = k => d.reduce((s, r) => s + r[k], 0);
      csv += `${sku};${Math.round(avg('OEE') * 100)};${Math.round(avg('A') * 100)};${Math.round(avg('P') * 100)};${Math.round(avg('Q') * 100)};${sum('defects')};${sum('rework')}\n`;
    });

    csv += '\n';

    // Секция 4 — Детальные данные
    csv += 'ДЕТАЛЬНЫЕ ДАННЫЕ\n';
    csv += 'Дата;Линия;Смена;SKU;OEE (%);A (%);P (%);Q (%);Брак;Простои (мин)\n';
    data.forEach(r => {
      csv += `${r.date};${r.line};${r.shift};${r.sku};${Math.round(r.OEE * 100)};${Math.round(r.A * 100)};${Math.round(r.P * 100)};${Math.round(r.Q * 100)};${r.defects};${r.downtime}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OEE_PharmaLine_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={exportCSV} style={{
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '6px 14px',
      color: 'var(--text)',
      fontSize: 12,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    }}>
      ⬇ Экспорт CSV
    </button>
  );
}