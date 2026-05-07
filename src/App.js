import React, { useState } from 'react';
import './App.css';
import Alerts from './components/Alerts';
import KPICards from './components/KPICards';
import { mockData, LINES, SHIFTS } from './data/mockData';

function App() {
  const [activePage, setActivePage] = useState('overview');
  const [selectedLine, setSelectedLine] = useState('Все линии');
  const [selectedShift, setSelectedShift] = useState('Все смены');
  const [selectedPeriod, setSelectedPeriod] = useState('Последние 7 дней');
  const [theme, setTheme] = useState('dark');

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
            <button className="export-btn">⬇ Экспорт CSV</button>
            <button className="theme-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        <div className="content">
          <Alerts />
          <KPICards data={mockData} selectedLine={selectedLine} selectedShift={selectedShift} />
        </div>
      </main>
    </div>
  );
}

export default App;