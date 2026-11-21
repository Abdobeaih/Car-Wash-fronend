import type { StaticImageData } from 'next/image';
import exteriorWash from '../../public/images/services/exterior-wash.jpg';
import interiorCleaning from '../../public/images/services/interior-cleaning.jpg';
import fullDetailing from '../../public/images/services/full-detailing.jpg';
import premiumDetailing from '../../public/images/services/premium-detailing.jpg';

const FALLBACK: StaticImageData = exteriorWash;

const SVG_TO_REAL: Record<string, StaticImageData> = {
  '/images/services/exterior-wash.svg': exteriorWash,
  '/images/services/interior-cleaning.svg': interiorCleaning,
  '/images/services/full-detailing.svg': fullDetailing,
  '/images/services/premium-detailing.svg': premiumDetailing,
};

export function serviceImagePath(image?: string | null): StaticImageData | string {
  if (!image) return FALLBACK;
  return SVG_TO_REAL[image] ?? image;
}

export function serviceImageUrl(image?: string | null): string {
  const resolved = serviceImagePath(image);
  return typeof resolved === 'string' ? resolved : resolved.src;
}
