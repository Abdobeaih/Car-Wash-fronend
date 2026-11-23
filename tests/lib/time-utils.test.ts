import { describe, expect, it } from 'vitest';
import { currentTime, isValidTime } from '@/components/TimeInput';

describe('isValidTime', () => {
  it('accepts boundary times', () => {
    expect(isValidTime('00:00')).toBe(true);
    expect(isValidTime('23:59')).toBe(true);
  });

  it('rejects out-of-range hours and minutes', () => {
    expect(isValidTime('24:00')).toBe(false);
    expect(isValidTime('12:60')).toBe(false);
  });

  it('rejects missing leading zeros and junk', () => {
    expect(isValidTime('9:30')).toBe(false);
    expect(isValidTime('')).toBe(false);
    expect(isValidTime('ab:cd')).toBe(false);
  });
});

describe('currentTime', () => {
  it('returns a HH:MM string aligned to the grid', () => {
    const value = currentTime(5);
    expect(value).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
  });

  it('rounds to the nearest step', () => {
    const minutes = Number(currentTime(15).split(':')[1]);
    expect(minutes % 15).toBe(0);
  });
});
