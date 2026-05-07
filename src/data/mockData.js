const lines = ['Линия А', 'Линия Б', 'Линия В'];
const shifts = ['Утренняя', 'Дневная', 'Ночная'];
const skus = ['Таблетки 500мг', 'Капсулы 250мг', 'Инъекции 10мл'];

const plannedSpeed = { 'Линия А': 120, 'Линия Б': 100, 'Линия В': 80 };
const plannedOutput = 480;
const TARGET_OEE = 0.85;

// Скользящее окно: 30 последних дней по сегодняшний день включительно.
// dayIndex = 0..29, где 29 = сегодня, 0 = 29 дней назад.
const TOTAL_DAYS = 30;
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

function dateForDayIndex(dayIndex) {
  const d = new Date(TODAY);
  d.setDate(TODAY.getDate() - (TOTAL_DAYS - 1 - dayIndex));
  return d;
}

function isoDate(d) {
  // Локальная дата без сдвига часового пояса
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function generateRecord(line, shift, sku, dayIndex) {
  const isNight = shift === 'Ночная';
  const isLineC = line === 'Линия В';
  const isInjection = sku === 'Инъекции 10мл';
  // «Неделя-3» (поломка на Линии В) — теперь это середина окна, дни 14–20 от начала окна.
  const isWeek3 = dayIndex >= 14 && dayIndex <= 20;
  // «Пятница ночью» — определяем по реальному дню недели.
  const recordDate = dateForDayIndex(dayIndex);
  const isFridayNight = recordDate.getDay() === 5 && isNight;

  let downtime = randomBetween(20, 60);
  if (isNight) downtime += randomBetween(15, 30);
  if (isLineC) downtime += randomBetween(10, 25);
  if (isWeek3 && isLineC) downtime += randomBetween(40, 80);
  if (isFridayNight) downtime += randomBetween(60, 100);

  const actualSpeed = plannedSpeed[line] * randomBetween(
    isNight ? 0.75 : 0.82,
    isNight ? 0.88 : 0.98
  );

  const plannedOutputVal = plannedOutput;
  const actualOutput = Math.round(plannedOutputVal * (actualSpeed / plannedSpeed[line]) * ((480 - downtime) / 480));

  let defectRate = randomBetween(0.03, 0.08);
  if (isInjection) defectRate += randomBetween(0.05, 0.12);
  if (isLineC) defectRate += randomBetween(0.02, 0.05);
  if (isFridayNight) defectRate += randomBetween(0.08, 0.15);

  const defects = Math.round(actualOutput * defectRate);
  const rework = Math.round(actualOutput * randomBetween(0.01, 0.03));

  const A = Math.max(0.5, (480 - downtime) / 480);
  const P = Math.max(0.5, actualSpeed / plannedSpeed[line]);
  const Q = Math.max(0.5, (actualOutput - defects - rework) / Math.max(actualOutput, 1));
  const OEE = A * P * Q;

  const downtimeReasons = {
    'ТО': Math.round(downtime * 0.17),
    'Переналадка': Math.round(downtime * 0.34),
    'Поломка': Math.round(downtime * (isWeek3 && isLineC ? 0.35 : 0.11)),
    'Микростопы': Math.round(downtime * 0.24),
    'Отсутствие сырья': Math.round(downtime * 0.08),
  };

  return {
    line, shift, sku,
    date: isoDate(recordDate),
    dayIndex,
    plannedSpeed: plannedSpeed[line],
    actualSpeed: Math.round(actualSpeed),
    plannedOutput: plannedOutputVal,
    actualOutput,
    defects,
    rework,
    downtime: Math.round(downtime),
    downtimeReasons,
    A: Math.round(A * 100) / 100,
    P: Math.round(P * 100) / 100,
    Q: Math.round(Q * 100) / 100,
    OEE: Math.round(OEE * 100) / 100,
    targetOEE: TARGET_OEE,
  };
}

const records = [];
for (let day = 0; day < TOTAL_DAYS; day++) {
  for (const line of lines) {
    for (const shift of shifts) {
      for (const sku of skus) {
        records.push(generateRecord(line, shift, sku, day));
      }
    }
  }
}

export const mockData = records;
export const TARGET_OEE_VALUE = TARGET_OEE;
export const LINES = lines;
export const SHIFTS = shifts;
export const SKUS = skus;
