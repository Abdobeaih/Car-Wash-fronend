import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDate, useDateTime, useMoney } from '@/lib/format';
import { renderWithIntl } from '../test-utils';

function Probe() {
  const money = useMoney();
  const date = useDate();
  const dateTime = useDateTime();
  return (
    <div>
      <span data-testid="money">{money(1234.5)}</span>
      <span data-testid="date">{date('2026-11-22')}</span>
      <span data-testid="badDate">{date('not-a-date')}</span>
      <span data-testid="dateTime">{dateTime('2026-11-22T10:30:00')}</span>
      <span data-testid="dateTimeEmpty">{dateTime(undefined)}</span>
      <span data-testid="dateTimeBad">{dateTime('garbage')}</span>
    </div>
  );
}

describe('format hooks', () => {
  it('formats money with the locale currency label', () => {
    renderWithIntl(<Probe />);
    expect(screen.getByTestId('money').textContent).toBe('EGP 1,234.5');
  });

  it('formats calendar dates without timezone day-shift', () => {
    renderWithIntl(<Probe />);
    expect(screen.getByTestId('date').textContent).toContain('Nov');
    expect(screen.getByTestId('date').textContent).toContain('2026');
  });

  it('returns unparsable dates unchanged instead of crashing', () => {
    renderWithIntl(<Probe />);
    expect(screen.getByTestId('badDate').textContent).toBe('not-a-date');
    expect(screen.getByTestId('dateTimeBad').textContent).toBe('garbage');
  });

  it('renders a placeholder for missing timestamps', () => {
    renderWithIntl(<Probe />);
    expect(screen.getByTestId('dateTimeEmpty').textContent).toBe('—');
    expect(screen.getByTestId('dateTime').textContent).toContain('2026');
  });
});
