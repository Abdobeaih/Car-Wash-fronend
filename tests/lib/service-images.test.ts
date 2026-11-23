import { describe, expect, it } from 'vitest';
import { serviceImagePath, serviceImageUrl } from '@/lib/service-images';

describe('service images', () => {
  it('falls back to a default image when none is set', () => {
    expect(serviceImagePath(undefined)).toBeDefined();
    expect(serviceImageUrl(null)).not.toBe('');
  });

  it('maps legacy SVG paths onto the real photography', () => {
    const resolved = serviceImagePath('/images/services/exterior-wash.svg');
    expect(resolved).not.toBe('/images/services/exterior-wash.svg');
    expect(serviceImageUrl('/images/services/full-detailing.svg')).not.toContain('.svg');
  });

  it('passes unknown custom paths through unchanged', () => {
    expect(serviceImageUrl('/images/custom/photo.png')).toBe('/images/custom/photo.png');
  });
});
