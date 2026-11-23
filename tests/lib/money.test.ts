import { describe, expect, it } from 'vitest';
import { formatMoney } from '@/lib/money';

describe('formatMoney', () => {
  it('places the currency label before the amount in English', () => {
    expect(formatMoney('en', 150, 'EGP ')).toBe('EGP 150');
  });

  it('groups thousands and keeps up to two fraction digits in English', () => {
    expect(formatMoney('en', 1234.5, 'EGP ')).toBe('EGP 1,234.5');
  });

  it('rounds beyond two fraction digits instead of trailing precision', () => {
    expect(formatMoney('en', 10.456, 'EGP ')).toBe('EGP 10.46');
  });

  it('places the currency label after the amount in Arabic', () => {
    expect(formatMoney('ar', 150, 'ج.م').endsWith(' ج.م')).toBe(true);
  });

  it('uses Arabic-Indic digits in Arabic', () => {
    expect(formatMoney('ar', 150, 'ج.م')).toContain('١٥٠');
  });

  it('handles zero without crashing either locale', () => {
    expect(formatMoney('en', 0, 'EGP ')).toBe('EGP 0');
    expect(formatMoney('ar', 0, 'ج.م')).toContain('٠');
  });
});
