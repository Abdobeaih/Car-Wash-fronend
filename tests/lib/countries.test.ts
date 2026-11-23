import { describe, expect, it } from 'vitest';
import { countries } from '@/lib/countries';

describe('countries', () => {
  it('includes Egypt with the +20 dial code', () => {
    const egypt = countries.find((c) => c.cca2 === 'EG');
    expect(egypt).toBeDefined();
    expect(egypt?.dialCode).toBe('+20');
  });

  it('only lists countries that have a dial code', () => {
    for (const c of countries) {
      expect(c.dialCode.startsWith('+')).toBe(true);
      expect(c.cca2).toHaveLength(2);
      expect(c.name.length).toBeGreaterThan(0);
    }
  });

  it('is sorted alphabetically by country name', () => {
    const names = countries.map((c) => c.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it('builds a regional-indicator flag emoji from the ISO code', () => {
    const egypt = countries.find((c) => c.cca2 === 'EG');
    expect(egypt?.flag).toBe('🇪🇬');
  });
});
