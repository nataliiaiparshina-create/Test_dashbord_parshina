import React, { useState, useEffect } from 'react';

export default function AIPanel({ data }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = {
        totalRecords: data.length,
        avgOEE: Math.round(data.reduce((s, r) => s + r.OEE, 0) / data.length * 100),
        avgA: Math.round(data.reduce((s, r) => s + r.A, 0) / data.length * 100),
        avgP: Math.round(data.reduce((s, r) => s + r.P, 0) / data.length * 100),
        avgQ: Math.round(data.reduce((s, r) => s + r.Q, 0) / data.length * 100),
        totalDefects: data.reduce((s, r) => s + r.defects, 0),
        totalDowntime: data.reduce((s, r) => s + r.downtime, 0),
        worstLine: ['Линия А', 'Линия Б', 'Линия В'].map(line => ({
          line,
          oee: Math.round(data.filter(r => r.line === line).reduce((s, r) => s + r.OEE, 0) / data.filter(r => r.line === line).length * 100)
        })).sort((a, b) => a.oee - b.oee)[0],
      };

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: summary }),
      });

      const result = await response.json();
      setAnalysis(result);
    } catch (err) {
      setError('Ошибка AI-анализа. Проверьте токен OpenRouter.');
    }
    setLoading(false);
  };

  useEffect(() => { analyze(); }, []);

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid rgba(108,143,255,0.25)',
      borderRadius: 14,
      padding: 16,
      marginBottom: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>✨</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>AI диагностика</span>
        </div>
        <button onClick={analyze} style={{
          background: 'rgba(108,143,255,0.1)',
          border: '1px solid rgba(108,143,255,0.3)',
          borderRadius: 8,
          padding: '5px 12px',
          color: '#6c8fff',
          fontSize: 12,
          cursor: 'pointer',
        }}>
          {loading ? 'Анализирую...' : 'Обновить анализ'}
        </button>
      </div>

      {loading && (
        <div style={{ color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center', padding: 20 }}>
          AI анализирует данные производства...
        </div>
      )}

      {error && (
        <div style={{ color: '#E24B4A', fontSize: 13, padding: 10 }}>{error}</div>
      )}

      {analysis && !loading && (
        <div>
          {analysis.bottlenecks?.map((b, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 20px 1fr 20px 1fr',
              gap: 6,
              marginBottom: 8,
              padding: 10,
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 10,
            }}>
              <div style={{ background: 'rgba(226,75,74,0.15)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 8, padding: '6px 8px', fontSize: 11, color: '#ff8080', lineHeight: 1.4 }}>
                <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 2 }}>Причина</div>
                {b.cause}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>→</div>
              <div style={{ background: 'rgba(255,179,71,0.15)', border: '1px solid rgba(255,179,71,0.2)', borderRadius: 8, padding: '6px 8px', fontSize: 11, color: '#ffb347', lineHeight: 1.4 }}>
                <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 2 }}>Эффект</div>
                {b.effect}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>→</div>
              <div style={{ background: 'rgba(78,205,164,0.15)', border: '1px solid rgba(78,205,164,0.2)', borderRadius: 8, padding: '6px 8px', fontSize: 11, color: '#4ecda4', lineHeight: 1.4 }}>
                <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 2 }}>Рекомендация</div>
                {b.recommendation}
              </div>
            </div>
          ))}

          {analysis.priorities && (
            <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Приоритетные действия</div>
              {analysis.priorities.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)', width: 16 }}>{p.rank}.</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{p.action}</span>
                  <span style={{ fontSize: 11, color: '#4ecda4', fontWeight: 600 }}>{p.expected_oee_gain}</span>
                  <span style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 20,
                    background: p.gmp_risk === 'высокий' ? 'rgba(226,75,74,0.15)' : p.gmp_risk === 'средний' ? 'rgba(255,179,71,0.15)' : 'rgba(78,205,164,0.15)',
                    color: p.gmp_risk === 'высокий' ? '#ff8080' : p.gmp_risk === 'средний' ? '#ffb347' : '#4ecda4',
                  }}>{p.gmp_risk}</span>
                </div>
              ))}
            </div>
          )}

          {analysis.summary && (
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
              {analysis.summary}
            </div>
          )}
        </div>
      )}
    </div>
  );
}