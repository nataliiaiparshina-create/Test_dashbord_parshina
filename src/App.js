import React, { useState, useMemo } from 'react';
import './App.css';
import Alerts from './components/Alerts';
import KPICards from './components/KPICards';
import DonutChart from './components/DonutChart';
import LossPareto from './components/LossPareto';
import Heatmap from './components/Heatmap';
import PeriodComparison from './components/PeriodComparison';
import AIPanel from './components/AIPanel';
import Simulator from './components/Simulator';
import FinancialBlock from './components/FinancialBlock';
import ExportButton from './components/ExportButton';
import { mockData, LINES, SHIFTS, SKUS } from './data/mockData';

const sectionLabelStyle = {
  fontSize: 12,
  color: 'var(--text-tertiary)',
  textTransform: 'uppercase',
  letterSpacing: 1,
  marginBottom: 10,
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: 10,
  marginBottom: 20,
};

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const MONTHS_FULL = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];

function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function fmtShort(d) { return `${d.getDate()} ${MONTHS[d.getMonth()]}`; }
function isoLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ISO-неделя (понедельник = первый день; неделя 1 содержит первый четверг года)
function isoWeek(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

function startOfWeek(d) {
  const x = startOfDay(d);
  const dayNum = x.getDay() || 7; // 1..7, Mon=1
  x.setDate(x.getDate() - (dayNum - 1));
  return x;
}

function buildPeriodOptions(today) {
  const t = startOfDay(today);

  const last7From = addDays(t, -6);
  const last30From = addDays(t, -29);

  const thisWeekFrom = startOfWeek(t);
  const thisWeekTo = addDays(thisWeekFrom, 6);

  const lastWeekFrom = addDays(thisWeekFrom, -7);
  const lastWeekTo = addDays(thisWeekFrom, -1);

  const thisMonthFrom = new Date(t.getFullYear(), t.getMonth(), 1);
  const thisMonthTo = new Date(t.getFullYear(), t.getMonth() + 1, 0);

  const lastMonthFrom = new Date(t.getFullYear(), t.getMonth() - 1, 1);
  const lastMonthTo = new Date(t.getFullYear(), t.getMonth(), 0);

  return [
    { key: 'last7',     label: `Последние 7 дней (${fmtShort(last7From)} – ${fmtShort(t)})`,                                       from: last7From,    to: t },
    { key: 'last30',    label: `Последние 30 дней (${fmtShort(last30From)} – ${fmtShort(t)})`,                                     from: last30From,   to: t },
    { key: 'thisWeek',  label: `Эта неделя (нед. ${isoWeek(t)}, ${fmtShort(thisWeekFrom)} – ${fmtShort(thisWeekTo)})`,             from: thisWeekFrom, to: thisWeekTo },
    { key: 'lastWeek',  label: `Прошлая неделя (нед. ${isoWeek(lastWeekFrom)}, ${fmtShort(lastWeekFrom)} – ${fmtShort(lastWeekTo)})`, from: lastWeekFrom, to: lastWeekTo },
    { key: 'thisMonth', label: `Этот месяц (${MONTHS_FULL[t.getMonth()]} ${t.getFullYear()})`,                                     from: thisMonthFrom,to: thisMonthTo },
    { key: 'lastMonth', label: `Прошлый месяц (${MONTHS_FULL[lastMonthFrom.getMonth()]} ${lastMonthFrom.getFullYear()})`,          from: lastMonthFrom,to: lastMonthTo },
  ];
}

function App() {
  const [activePage, setActivePage] = useState('overview');
  const [selectedLine, setSelectedLine] = useState('Все линии');
  const [selectedShift, setSelectedShift] = useState('Все смены');
  const [selectedSKU, setSelectedSKU] = useState('Все SKU');
  const [selectedPeriodKey, setSelectedPeriodKey] = useState('last7');
  const [theme, setTheme] = useState('dark');

  const periodOptions = useMemo(() => buildPeriodOptions(new Date()), []);
  const currentPeriod = periodOptions.find(p => p.key === selectedPeriodKey) || periodOptions[0];

  const filteredData = useMemo(() => {
    const fromIso = isoLocal(currentPeriod.from);
    const toIso = isoLocal(currentPeriod.to);
    return mockData.filter(r => {
      if (r.date < fromIso || r.date > toIso) return false;
      if (selectedLine !== 'Все линии' && r.line !== selectedLine) return false;
      if (selectedShift !== 'Все смены' && r.shift !== selectedShift) return false;
      if (selectedSKU !== 'Все SKU' && r.sku !== selectedSKU) return false;
      return true;
    });
  }, [currentPeriod, selectedLine, selectedShift, selectedSKU]);

  return (
    <div className={`app ${theme}`}>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">P</div>
          <div>
            <div className="logo-title">PharmaLine</div>
            <div className="logo-sub">OEE Analytics</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {[
            { id: 'overview', label: 'Обзор', icon: '📊' },
            { id: 'lines', label: 'По линиям', icon: '🏭' },
            { id: 'shifts', label: 'По сменам', icon: '🕐' },
            { id: 'sku', label: 'По SKU', icon: '📦' },
          ].map(item => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-avatar">НП</div>
          <div>
            <div className="user-name">Наталия П.</div>
            <div className="user-role">Администратор</div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-title">
            <h1>Общий обзор</h1>
            <p>Сводная аналитика эффективности производства</p>
          </div>
          <div className="topbar-filters">
            <select
              value={selectedPeriodKey}
              onChange={e => setSelectedPeriodKey(e.target.value)}
              style={{ minWidth: 280 }}
            >
              <optgroup label="Скользящее окно">
                {periodOptions.filter(p => p.key === 'last7' || p.key === 'last30').map(p => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </optgroup>
              <optgroup label="Календарные периоды">
                {periodOptions.filter(p => p.key !== 'last7' && p.key !== 'last30').map(p => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </optgroup>
            </select>
            <select value={selectedShift} onChange={e => setSelectedShift(e.target.value)}>
              <option>Все смены</option>
              {SHIFTS.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={selectedLine} onChange={e => setSelectedLine(e.target.value)}>
              <option>Все линии</option>
              {LINES.map(l => <option key={l}>{l}</option>)}
            </select>
            <select value={selectedSKU} onChange={e => setSelectedSKU(e.target.value)}>
              <option>Все SKU</option>
              {SKUS.map(s => <option key={s}>{s}</option>)}
            </select>
            <ExportButton data={filteredData} />
            <button className="theme-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        <div className="content">
          <Alerts />
          <KPICards data={filteredData} selectedLine={selectedLine} selectedShift={selectedShift} />

          <div style={sectionLabelStyle}>OEE по линиям — A / P / Q</div>
          <div style={gridStyle}>
            {LINES.map(line => (
              <DonutChart key={line} line={line} data={filteredData} />
            ))}
          </div>

          <div style={sectionLabelStyle}>OEE по сменам — A / P / Q</div>
          <div style={gridStyle}>
            {SHIFTS.map(shift => (
              <DonutChart key={shift} line={shift} data={filteredData} />
            ))}
          </div>

          <div style={sectionLabelStyle}>OEE по SKU — A / P / Q</div>
          <div style={gridStyle}>
            {SKUS.map(sku => (
              <DonutChart key={sku} line={sku} data={filteredData} />
            ))}
          </div>

          <LossPareto data={filteredData} />
          <PeriodComparison data={mockData} />
          <Heatmap data={filteredData} />
          <AIPanel data={filteredData} periodLabel={currentPeriod.label} />
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20, alignItems: 'stretch' }}>
            <FinancialBlock data={filteredData} periodLabel={currentPeriod && currentPeriod.label.split('(')[1]?.replace(')', '')} />
            <Simulator data={filteredData} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
