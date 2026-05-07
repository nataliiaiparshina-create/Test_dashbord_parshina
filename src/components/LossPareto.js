import React from 'react';

export default function LossPareto({ data }) {
  const downtimeReasons = {};
  data.forEach(r => {
    Object.entries(r.downtimeReasons).forEach(([reason, minutes]) => {
      downtimeReasons[reason] = (downtimeReasons[reason] || 0) + minutes;
    });
  });

  const defectsBySkU = {};
  data.forEach(r => {
    defectsBySkU[r.sku] = (defectsBySkU[r.sku] || 0) + r.defects;
  });

  const total = obj => Object.values(obj).reduce((s, v) => s + v, 0);

  const sortedDowntime = Object.entries(downtimeReasons)
    .sort((a, b) => b[1] - a[1]);

  const sortedDefects = Object.entries(defectsBySkU)
    .sort((a, b) => b[1] - a[1]);

  const totalDowntime = total(downtimeReasons);
  const totalDefects = total(defectsBySkU);

  const Bar = ({ value, max, color }) => (
    <div style={{ flex: 1, height: 8, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: color, borderRadius: 4 }} />
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
      <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 16, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Простои: топ причин</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: '6px 8px', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Причина</div>
          <div />
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Минуты</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>%</div>
          {sortedDowntime.map(([reason, minutes]) => (
            <React.Fragment key={reason}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{reason}</div>
              <Bar value={minutes} max={sortedDowntime[0][1]} color="#6c8fff" />
              <div style={{ fontSize: 12, color: 'var(--text)', textAlign: 'right' }}>{minutes}</div>
              <div style={{ fontSize: 12, color: 'var(--text)', textAlign: 'right' }}>{Math.round(minutes / totalDowntime * 100)}%</div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 16, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Дефекты: топ по SKU</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: '6px 8px', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>SKU</div>
          <div />
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Кол-во</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>%</div>
          {sortedDefects.map(([sku, count]) => (
            <React.Fragment key={sku}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{sku}</div>
              <Bar value={count} max={sortedDefects[0][1]} color="#a78bfa" />
              <div style={{ fontSize: 12, color: 'var(--text)', textAlign: 'right' }}>{count}</div>
              <div style={{ fontSize: 12, color: 'var(--text)', textAlign: 'right' }}>{Math.round(count / totalDefects * 100)}%</div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}