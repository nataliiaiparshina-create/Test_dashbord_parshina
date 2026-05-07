import React, { useState } from 'react';
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

function App() {
  const [activePage, setActivePage] = useState('overview');
  const [selectedLine, setSelectedLine] = useState('Все линии');
  const [selectedShift, setSelectedShift] = useState('Все смены');
  const [selectedSKU, setSelectedSKU] = useState('Все SKU');
  const [selectedPeriod, setSelectedPeriod] = useState('Последние 7 дней');
  const [theme, setTheme] = useState('dark');

  const filteredData = mockData.filter(r => {
    if (selectedLine !== 'Все линии' && r.line !== selectedLine) return false;
    if (selectedShift !== 'Все смены' && r.shift !== selectedShift) return false;
    if (selectedSKU !== 'Все SKU' && r.sku !== selectedSKU) return false;
    return true;
  });

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
            <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}>
              <option>Последние 7 дней</option>
              <option>Последние 30 дней</option>
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
          <KPICards data={mockData} selectedLine={selectedLine} selectedShift={selectedShift} />

          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            OEE по линиям — A / P / Q
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
            {LINES.map(line => (
              <DonutChart key={line} line={line} data={filteredData} />
            ))}
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
  OEE по сменам — A / P / Q
</div>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
  {SHIFTS.map(shift => (
    <DonutChart key={shift} line={shift} data={filteredData} />
  ))}
</div>
            OEE по SKU — A / P / Q
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
            {SKUS.map(sku => (
              <DonutChart key={sku} line={sku} data={filteredData} />
            ))}
          </div>

          <LossPareto data={filteredData} />
          <PeriodComparison data={mockData} />
          <Heatmap data={mockData} />
          <AIPanel data={filteredData} />
          <Simulator data={filteredData} />
          <FinancialBlock data={filteredData} />
        </div>
      </main>
    </div>
  );
}

export default App;