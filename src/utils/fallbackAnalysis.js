// Rule-based fallback анализ. Используется когда OpenRouter недоступен.
// Возвращает структуру совместимую с ответом AI.

const LINES = ['Линия А', 'Линия Б', 'Линия В'];

function avg(arr, key) {
  if (!arr.length) return 0;
  return arr.reduce((s, r) => s + r[key], 0) / arr.length;
}

function fmtPct(x) { return Math.round(x * 100) + '%'; }
function fmtPP(min, max) { return `+${min}–${max}%`; }

export function computeFallbackAnalysis(data) {
  if (!data || data.length === 0) {
    return {
      bottlenecks: [],
      priorities: [],
      summary: 'Недостаточно данных для анализа.',
      _fallback: true,
    };
  }

  // === Сводные метрики ===
  const avgA = avg(data, 'A');
  const avgP = avg(data, 'P');
  const avgQ = avg(data, 'Q');
  const avgOEE = avg(data, 'OEE');
  const totalDowntime = data.reduce((s, r) => s + (r.downtime || 0), 0);
  const totalDefects = data.reduce((s, r) => s + (r.defects || 0), 0);
  const totalOutput = data.reduce((s, r) => s + (r.actualOutput || 0), 0);
  const defectRate = totalOutput > 0 ? totalDefects / totalOutput : 0;

  // Худшая линия — определяем для конкретики в действиях
  const lineStats = LINES
    .map(line => ({
      line,
      oee: avg(data.filter(r => r.line === line), 'OEE'),
      count: data.filter(r => r.line === line).length,
    }))
    .filter(x => x.count > 0)
    .sort((a, b) => a.oee - b.oee);
  const worstLine = lineStats[0];

  // Главная причина простоев — для рекомендации
  const reasonsAgg = {};
  for (const r of data) {
    if (!r.downtimeReasons) continue;
    for (const [k, v] of Object.entries(r.downtimeReasons)) {
      reasonsAgg[k] = (reasonsAgg[k] || 0) + v;
    }
  }
  const topReason = Object.entries(reasonsAgg).sort((a, b) => b[1] - a[1])[0];
  const topReasonName = topReason ? topReason[0] : null;

  // === Bottlenecks: по каждому из A/P/Q, отсортировано от худшего к лучшему ===
  const factors = [
    { key: 'A', name: 'Доступность', val: avgA, weak: avgA < 0.85 },
    { key: 'P', name: 'Производительность', val: avgP, weak: avgP < 0.85 },
    { key: 'Q', name: 'Качество', val: avgQ, weak: avgQ < 0.95 },
  ].sort((a, b) => a.val - b.val);

  const bottlenecks = factors.map(f => {
    if (f.key === 'A') {
      return {
        cause: `Доступность ${fmtPct(f.val)} — простои ${Math.round(totalDowntime).toLocaleString('ru-RU')} мин за период`,
        effect: `Потеря ${Math.round((1 - f.val) * 100)}% производственного времени, снижение валового выпуска`,
        recommendation: topReasonName
          ? `Главная причина — «${topReasonName}». Анализ Парето простоев, превентивное ТОиР, оптимизация переналадок`
          : 'Анализ Парето простоев, превентивное ТОиР на критическом оборудовании',
      };
    }
    if (f.key === 'P') {
      return {
        cause: `Производительность ${fmtPct(f.val)} — оборудование работает ниже номинальной скорости`,
        effect: `Скрытая потеря ${Math.round((1 - f.val) * 100)}% мощности, недовыпуск продукции`,
        recommendation: 'Оптимизация настроек процесса, устранение микроостановок, обучение операторов',
      };
    }
    return {
      cause: `Качество ${fmtPct(f.val)} — ${totalDefects.toLocaleString('ru-RU')} дефектных единиц (${(defectRate * 100).toFixed(1)}%)`,
      effect: `Потери от брака, риски GMP-несоответствий и регуляторных замечаний`,
      recommendation: 'Усилить входной контроль материалов, калибровка оборудования, SPC-мониторинг трендов',
    };
  });

  // === Priorities: 4 действия, отсортированы по ожидаемому приросту OEE ===
  const priorities = [];
  if (worstLine && worstLine.oee < avgOEE - 0.03) {
    priorities.push({
      rank: 1,
      action: `Сфокусироваться на ${worstLine.line}: OEE ${fmtPct(worstLine.oee)} (на ${Math.round((avgOEE - worstLine.oee) * 100)} п.п. ниже среднего). Диагностика оборудования и анализ причин простоев`,
      expected_oee_gain: fmtPP(5, 8),
      gmp_risk: 'средний',
    });
  }
  if (avgA < 0.9) {
    priorities.push({
      rank: priorities.length + 1,
      action: 'Снизить незапланированные простои через TPM (Total Productive Maintenance) и предиктивную диагностику оборудования',
      expected_oee_gain: fmtPP(4, 6),
      gmp_risk: 'низкий',
    });
  }
  if (avgQ < 0.95) {
    priorities.push({
      rank: priorities.length + 1,
      action: 'Программа повышения качества: SPC-мониторинг критических параметров, Root Cause Analysis для типовых дефектов',
      expected_oee_gain: fmtPP(3, 5),
      gmp_risk: 'высокий',
    });
  }
  if (avgP < 0.9) {
    priorities.push({
      rank: priorities.length + 1,
      action: 'Устранение микроостановок и оптимизация переналадок (SMED) для роста производительности',
      expected_oee_gain: fmtPP(2, 4),
      gmp_risk: 'низкий',
    });
  }
  // Если все факторы хорошие — добавим заглушку, чтобы блок не был пустым
  if (priorities.length === 0) {
    priorities.push({
      rank: 1,
      action: 'OEE на целевом уровне — фокус на удержании. Рекомендуется регулярный аудит и обновление benchmarking',
      expected_oee_gain: fmtPP(0, 2),
      gmp_risk: 'низкий',
    });
  }

  // === Summary ===
  const benchmarkLow = 0.75, benchmarkHigh = 0.85;
  const oeeLabel = avgOEE < benchmarkLow ? 'ниже' : avgOEE > benchmarkHigh ? 'выше' : 'в диапазоне';
  const summaryParts = [
    `OEE ${fmtPct(avgOEE)} ${oeeLabel} фармацевтического бенчмарка (75–85%).`,
    worstLine ? `${worstLine.line} с OEE ${fmtPct(worstLine.oee)} требует приоритетного внимания.` : null,
    `Структура потерь: A ${fmtPct(avgA)}, P ${fmtPct(avgP)}, Q ${fmtPct(avgQ)}.`,
    avgQ < 0.95 ? 'Низкое качество — главный регуляторный риск с учётом GMP.' : null,
    'Потенциал роста OEE до 80–85% при системном подходе.',
  ].filter(Boolean);

  return {
    bottlenecks,
    priorities,
    summary: summaryParts.join(' '),
    _fallback: true, // флаг что это локальный анализ, а не AI
  };
}
