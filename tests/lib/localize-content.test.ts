import { describe, expect, it } from 'vitest';
import { localizeContent } from '@/lib/localize-content';

describe('localizeContent', () => {
  it('translates seeded service names to Arabic', () => {
    expect(localizeContent('ar', 'Exterior Car Wash')).toBe('غسيل خارجي للسيارة');
  });

  it('translates seeded add-on descriptions to Arabic', () => {
    expect(localizeContent('ar', 'Safe steam cleaning and degreasing of the engine bay.')).toBe(
      'تنظيف آمن بالبخار وإزالة الشحوم من حجرة المحرك.',
    );
  });

  it('leaves English untouched in the English locale', () => {
    expect(localizeContent('en', 'Exterior Car Wash')).toBe('Exterior Car Wash');
  });

  it('passes unknown values through unchanged in Arabic', () => {
    expect(localizeContent('ar', 'Brand New Service')).toBe('Brand New Service');
  });

  it('normalizes missing text to an empty string', () => {
    expect(localizeContent('ar', null)).toBe('');
    expect(localizeContent('en', undefined)).toBe('');
  });
});
