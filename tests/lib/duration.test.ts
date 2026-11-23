import { describe, expect, it } from 'vitest';
import { formatDuration, type DurationTranslator } from '@/lib/duration';

const t: DurationTranslator = (key, values) =>
  values ? `${key}(${values.value})` : key;

describe('formatDuration', () => {
  it('formats combined hours and minutes', () => {
    expect(formatDuration(t, 90)).toBe('hour(1) and minutes(30)');
  });

  it('uses singular keys for exactly one hour and one minute', () => {
    expect(formatDuration(t, 61)).toBe('hour(1) and minute(1)');
  });

  it('omits the minutes part for whole hours', () => {
    expect(formatDuration(t, 120)).toBe('hours(2)');
  });

  it('omits the hours part under one hour', () => {
    expect(formatDuration(t, 45)).toBe('minutes(45)');
  });

  it('reports zero minutes instead of an empty string', () => {
    expect(formatDuration(t, 0)).toBe('minutes(0)');
  });
});
