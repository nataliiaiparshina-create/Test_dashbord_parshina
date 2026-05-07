import { render, screen } from '@testing-library/react';
import App from './App';

// Заглушаем Recharts на ResponsiveContainer (часто падает в jsdom без размеров)
// и оставляем остальное как есть. Если в будущем тесты упадут на размерах — добавьте:
// jest.mock('recharts', () => { ... });

test('рендерится логотип PharmaLine', () => {
  render(<App />);
  expect(screen.getByText(/PharmaLine/i)).toBeInTheDocument();
  expect(screen.getByText(/OEE Analytics/i)).toBeInTheDocument();
});

test('рендерится заголовок страницы и фильтры', () => {
  render(<App />);
  expect(screen.getByText(/Общий обзор/i)).toBeInTheDocument();
  expect(screen.getByText(/Все линии/i)).toBeInTheDocument();
  expect(screen.getByText(/Все смены/i)).toBeInTheDocument();
  expect(screen.getByText(/Все SKU/i)).toBeInTheDocument();
});

test('рендерится симулятор "Что если"', () => {
  render(<App />);
  expect(screen.getByText(/Симулятор/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Рассчитать/i })).toBeInTheDocument();
});

test('рендерятся секции по линиям, сменам и SKU', () => {
  render(<App />);
  expect(screen.getByText(/OEE по линиям/i)).toBeInTheDocument();
  expect(screen.getByText(/OEE по сменам/i)).toBeInTheDocument();
  expect(screen.getByText(/OEE по SKU/i)).toBeInTheDocument();
});
