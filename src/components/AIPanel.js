import React, { useState, useEffect } from 'react';
import { computeFallbackAnalysis } from '../utils/fallbackAnalysis';

export default function AIPanel({ data, periodLabel }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null); // { message, details } | null
  const [showDetails, setShowDetails] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const analyze = async () => {
    setLoading(true);
    setErrorInfo(null);
    try {
      const summary = {
        avgOEE: Math.round(data.reduce((s, r) => s + r.OEE, 0) / data.length * 100),
        avgA: Math.round(data.reduce((s, r) => s + r.A, 0) / data.length * 100),
        avgP: Math.round(data.reduce((s, r) => s + r.P, 0) / data.length * 100),
        avgQ: Math.round(data.reduce((s, r) => s + r.Q, 0) / data.length * 100),
        totalDefects: data.reduce((s, r) => s + r.defects, 0),
        totalDowntime: data.reduce((s, r) => s + r.downtime, 0),
        worstLine: ['Линия А', 'Линия Б', 'Линия В'].map(line => {
          const f = data.filter(r => r.line === line);
          return { line, oee: f.length ? Math.round(f.reduce((s, r) => s + r.OEE, 0) / f.length * 100) : 0 };
        }).sort((a, b) => a.oee - b.oee)[0],
      };

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: summary }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Бекенд вернул структурированную ошибку — показываем её и включаем фоллбэк
        const fallback = computeFallbackAnalysis(data);
        setAnalysis(fallback);
        setErrorInfo({
          message: result.message || `Ошибка ${response.status}`,
          details: result.details || '',
          status: response.status,
        });
        setUpdatedAt(new Date());
      } else {
        setAnalysis(result);
        setUpdatedAt(new Date());
      }
    } catch (err) {
      // Сетевая ошибка / клиентская — фоллбэк
      const fallback = computeFallbackAnalysis(data);
      setAnalysis(fallback);
      setErrorInfo({
        message: 'Сетевая ошибка — не удалось связаться с сервером',
        details: String(err && err.message || err),
      });
      setUpdatedAt(new Date());
    }
    setLoading(false);
  };

  useEffect(() => { analyze(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isFallback = analysis && analysis._fallback === true;

  const handleDownloadPDF = () => {
    if (!analysis) return;
    const win = window.open('', '_blank');
    if (!win) {
      alert('Разрешите всплывающие окна, чтобы скачать отчёт.');
      return;
    }
    const dateStr = new Date().toLocaleString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const period = periodLabel || 'Все данные';
    const sourceLabel = isFallback
      ? '⚠ Локальный rule-based анализ (AI недоступен)'
      : 'AI-анализ (Claude через OpenRouter)';
    const bottlenecksHtml = (analysis.bottlenecks || []).map(b => `
      <div class="block">
        <div class="row"><span class="tag tag-cause">Причина</span><span>${escapeHtml(b.cause)}</span></div>
        <div class="row"><span class="tag tag-effect">Эффект</span><span>${escapeHtml(b.effect)}</span></div>
        <div class="row"><span class="tag tag-rec">Рекомендация</span><span>${escapeHtml(b.recommendation)}</span></div>
      </div>`).join('');
    const prioritiesHtml = (analysis.priorities || []).map(p => `
      <tr>
        <td class="rank">${p.rank}</td>
        <td>${escapeHtml(p.action)}</td>
        <td class="gain">${escapeHtml(String(p.expected_oee_gain))}</td>
        <td class="risk risk-${p.gmp_risk}">${escapeHtml(p.gmp_risk)}</td>
      </tr>`).join('');
    win.document.write(`<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>PharmaLine — AI диагностика OEE</title>
      <style>
        @page { margin: 18mm; size: A4; }
        body { font-family: -apple-system, system-ui, "Helvetica Neue", Arial, sans-serif; color: #111; font-size: 12px; line-height: 1.55; margin: 0; }
        h1 { color: #4a6fdc; font-size: 22px; margin: 0 0 4px; }
        .meta { color: #666; font-size: 11px; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 2px solid #4a6fdc; }
        .source { font-size: 10px; color: #888; margin-top: 4px; }
        h2 { font-size: 14px; margin: 18px 0 8px; color: #222; }
        .summary { background: #f5f7fb; padding: 12px 14px; border-radius: 6px; margin-bottom: 12px; }
        .block { background: #fafafa; border-left: 3px solid #4a6fdc; padding: 8px 12px; margin-bottom: 6px; border-radius: 0 4px 4px 0; }
        .row { display: flex; gap: 8px; margin-bottom: 4px; align-items: baseline; }
        .row:last-child { margin-bottom: 0; }
        .tag { display: inline-block; padding: 1px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; min-width: 90px; text-align: center; }
        .tag-cause { background: #e8edff; color: #3650b8; }
        .tag-effect { background: #fff1d9; color: #a06410; }
        .tag-rec { background: #e0f5ec; color: #2a8060; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 11px; }
        th { text-align: left; font-weight: 600; padding: 6px 8px; background: #f0f0f0; }
        td { padding: 6px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
        .rank { font-weight: 600; color: #4a6fdc; width: 24px; }
        .gain { color: #2a8060; font-weight: 600; white-space: nowrap; }
        .risk { font-weight: 500; text-transform: capitalize; }
        .risk-низкий  { color: #2a8060; }
        .risk-средний { color: #a06410; }
        .risk-высокий { color: #b03030; }
        .footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 10px; color: #888; }
        .actions { padding: 12px; background: #fafafa; border-bottom: 1px solid #eee; text-align: center; }
        .actions button { padding: 8px 16px; font-size: 13px; border: 1px solid #4a6fdc; background: #4a6fdc; color: #fff; border-radius: 6px; cursor: pointer; margin: 0 4px; }
        .actions button.secondary { background: #fff; color: #4a6fdc; }
        @media print { .actions { display: none; } body { margin: 0; } }
      </style></head><body>
      <div class="actions">
        <button onclick="window.print()">Сохранить как PDF</button>
        <button class="secondary" onclick="window.close()">Закрыть</button>
      </div>
      <div style="padding: 0 4px;">
        <h1>PharmaLine — AI диагностика OEE</h1>
        <div class="meta">
          Сформировано: ${dateStr} · ${escapeHtml(period)}
          <div class="source">${escapeHtml(sourceLabel)}</div>
        </div>
        ${analysis.summary ? `<div class="summary">${escapeHtml(analysis.summary)}</div>` : ''}
        ${bottlenecksHtml ? `<h2>Выявленные проблемы</h2>${bottlenecksHtml}` : ''}
        ${prioritiesHtml ? `<h2>Приоритетные действия</h2>
          <table><thead><tr><th>#</th><th>Действие</th><th>OEE</th><th>GMP-риск</th></tr></thead>
          <tbody>${prioritiesHtml}</tbody></table>
          <div style="font-size: 10px; color: #666; margin-top: 6px;">GMP-риск отражает регуляторную сложность реализации: высокий — требуется валидация и документация по GMP, низкий — операционные изменения без регуляторного импакта.</div>` : ''}
        <div class="footer">PharmaLine OEE Analytics · Отчёт сгенерирован на основе данных производственных линий</div>
      </div>
    </body></html>`);
    win.document.close();
  };

  const updatedLabel = updatedAt
    ? `обновлено ${updatedAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
    : 'данные актуальны';
  const period = periodLabel || '';

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid rgba(108,143,255,0.25)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>✨</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>AI диагностика</span>
            {isFallback && (
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 10,
                background: 'rgba(255,179,71,0.15)', color: '#ffb347',
                border: '1px solid rgba(255,179,71,0.3)',
              }}>локальный режим</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4, paddingLeft: 24 }}>
            {period && `${period} · `}{updatedLabel}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleDownloadPDF}
            disabled={!analysis || loading}
            style={{
              background: 'rgba(108,143,255,0.1)', border: '1px solid rgba(108,143,255,0.3)',
              borderRadius: 8, padding: '5px 12px', color: '#6c8fff', fontSize: 12,
              cursor: analysis && !loading ? 'pointer' : 'not-allowed', opacity: analysis && !loading ? 1 : 0.5,
            }}
            title="Откроется страница для печати — выберите 'Сохранить как PDF' в диалоге печати"
          >
            ⬇ Скачать PDF
          </button>
          <button onClick={analyze} style={{ background: 'rgba(108,143,255,0.1)', border: '1px solid rgba(108,143,255,0.3)', borderRadius: 8, padding: '5px 14px', color: '#6c8fff', fontSize: 12, cursor: 'pointer' }}>
            {loading ? 'Анализирую...' : '↻ Обновить'}
          </button>
        </div>
      </div>

      {loading && <div style={{ color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center', padding: 20 }}>AI анализирует данные производства...</div>}

      {errorInfo && !loading && (
        <div style={{
          background: 'rgba(255,179,71,0.1)',
          border: '1px solid rgba(255,179,71,0.3)',
          borderRadius: 10,
          padding: '10px 14px',
          marginBottom: 12,
          fontSize: 12,
          color: '#ffb347',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <strong>AI временно недоступен:</strong>
            <span style={{ color: 'var(--text-secondary)' }}>{errorInfo.message}</span>
            <span style={{ color: 'var(--text-tertiary)', marginLeft: 'auto', fontSize: 11 }}>
              Показан локальный rule-based анализ
            </span>
            {errorInfo.details && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                style={{ background: 'none', border: 'none', color: '#ffb347', cursor: 'pointer', fontSize: 11, textDecoration: 'underline', padding: 0 }}
              >
                {showDetails ? 'Скрыть' : 'Подробности'}
              </button>
            )}
          </div>
          {showDetails && errorInfo.details && (
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'monospace', wordBreak: 'break-word', paddingTop: 4, borderTop: '1px solid rgba(255,179,71,0.2)' }}>
              {errorInfo.details}
            </div>
          )}
        </div>
      )}

      {analysis && !loading && (
        <>
          {analysis.summary && (
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                {isFallback ? 'Сводка (локальный анализ)' : 'Полный отчёт AI'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{analysis.summary}</div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Выявленные проблемы</div>
              {analysis.bottlenecks?.map((b, i) => (
                <div key={i} style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 10, marginBottom: 8 }}>
                  <Step icon="!" label="Причина" color="#6c8fff" bg="rgba(108,143,255,0.15)" text={b.cause} />
                  <Step icon="↓" label="Эффект" color="#ffb347" bg="rgba(255,179,71,0.15)" text={b.effect} />
                  <Step icon="✓" label="Рекомендация" color="#4ecda4" bg="rgba(78,205,164,0.15)" text={b.recommendation} />
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Приоритетные действия</div>
              {analysis.priorities && (
                <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '18px 1fr 70px 80px',
                    gap: 12,
                    alignItems: 'center',
                    paddingBottom: 10,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    marginBottom: 12,
                  }}>
                    <div></div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Действие</div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>OEE</div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>GMP-риск</div>
                  </div>

                  {analysis.priorities.map((p, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '18px 1fr 70px 80px',
                        gap: 12,
                        alignItems: 'center',
                        marginBottom: i === analysis.priorities.length - 1 ? 0 : 14,
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#6c8fff' }}>{p.rank}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{p.action}</span>
                      <span style={{ fontSize: 11, color: '#4ecda4', fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>{p.expected_oee_gain}</span>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <span style={{
                          fontSize: 10, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap',
                          background: p.gmp_risk === 'высокий' ? 'rgba(226,75,74,0.15)' : p.gmp_risk === 'средний' ? 'rgba(255,179,71,0.15)' : 'rgba(78,205,164,0.15)',
                          color: p.gmp_risk === 'высокий' ? '#ff8080' : p.gmp_risk === 'средний' ? '#ffb347' : '#4ecda4',
                          border: `1px solid ${p.gmp_risk === 'высокий' ? 'rgba(226,75,74,0.3)' : p.gmp_risk === 'средний' ? 'rgba(255,179,71,0.3)' : 'rgba(78,205,164,0.3)'}`,
                        }}>{p.gmp_risk}</span>
                      </div>
                    </div>
                  ))}

                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 10, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                    GMP-риск отражает регуляторную сложность: высокий — требуется валидация и документация по GMP, низкий — операционные изменения без регуляторного импакта.
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Step({ icon, label, color, bg, text }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{ width: 18, height: 18, borderRadius: 5, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color, fontWeight: 700 }}>{icon}</div>
        <span style={{ fontSize: 12, fontWeight: 600, color }}>{label}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, paddingLeft: 26 }}>{text}</div>
    </div>
  );
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
