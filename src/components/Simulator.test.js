import { calculateSimulation } from './Simulator';

// Реалистичная фарм-линия: A=0.88, P=0.92, Q=0.97, OEE≈0.785
const sampleData = [
  { A: 0.88, P: 0.92, Q: 0.97, OEE: 0.785 },
  { A: 0.88, P: 0.92, Q: 0.97, OEE: 0.785 },
];

describe('calculateSimulation', () => {
  test('возвращает null для пустых данных', () => {
    expect(calculateSimulation({ data: [], param: 'Доступность (A)', percent: 5 })).toBeNull();
    expect(calculateSimulation({ data: null, param: 'Доступность (A)', percent: 5 })).toBeNull();
  });

  test('даёт разные результаты для разных параметров (главный баг)', () => {
    const a = calculateSimulation({ data: sampleData, param: 'Доступность (A)', percent: 5 });
    const p = calculateSimulation({ data: sampleData, param: 'Производительность (P)', percent: 5 });
    const q = calculateSimulation({ data: sampleData, param: 'Качество (Q)', percent: 5 });

    // newOEE может численно совпасть после округления при близких A/P/Q,
    // но gain в п.п. до округления должен отличаться, и ₽-эффект — точно отличается
    // из-за разных коэффициентов.
    expect(a.economicEffect).not.toBe(p.economicEffect);
    expect(a.economicEffect).not.toBe(q.economicEffect);
    expect(p.economicEffect).not.toBe(q.economicEffect);

    expect(a.extraOutput).not.toBe(q.extraOutput); // Q даёт меньший выпуск (output: 0.6)
  });

  test('гейн в процентных пунктах положителен для прибавки', () => {
    const r = calculateSimulation({ data: sampleData, param: 'Доступность (A)', percent: 5 });
    expect(r.gain).toBeGreaterThan(0);
    expect(r.newOEE).toBeGreaterThan(78);
  });

  test('параметр не превышает 100% (cap)', () => {
    const highData = [{ A: 0.98, P: 0.98, Q: 0.98, OEE: 0.94 }];
    const r = calculateSimulation({ data: highData, param: 'Доступность (A)', percent: 20 });
    // newA должен быть закаплен на 1.0 → newOEE = 1.0 * 0.98 * 0.98 = 0.9604 → 96%
    expect(r.newOEE).toBeLessThanOrEqual(100);
    expect(r.newOEE).toBe(96);
  });

  test('Q даёт более высокий ₽-эффект на единицу прироста, чем A', () => {
    // При одинаковой прибавке к параметру коэффициент 1.4 для Q должен дать больший
    // ₽-эффект на 1 п.п. прироста OEE, чем 1.0 для A.
    // Но абсолютная величина зависит от gain в п.п. — поэтому считаем эффективность.
    const a = calculateSimulation({ data: sampleData, param: 'Доступность (A)', percent: 5 });
    const q = calculateSimulation({ data: sampleData, param: 'Качество (Q)', percent: 5 });

    const aEffectPerPP = a.economicEffect / a.gain;
    const qEffectPerPP = q.economicEffect / q.gain;

    expect(qEffectPerPP).toBeGreaterThan(aEffectPerPP);
  });

  test('неизвестный параметр не ломает расчёт (fallback на A)', () => {
    const r = calculateSimulation({ data: sampleData, param: 'Что-то_странное', percent: 5 });
    expect(r).not.toBeNull();
    expect(r.gain).toBeGreaterThanOrEqual(0); // gain = 0, потому что ни один параметр не вырос
    expect(r.economicEffect).toBe(0);
  });
});
