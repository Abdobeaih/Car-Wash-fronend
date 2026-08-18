import type { StaticImageData } from 'next/image';
import exteriorWash from '../../public/images/services/pngtree-car-wash-fast-delicate-png-image_15497309.png';
import interiorCleaning from '../../public/images/services/pngtree-cartoon-illustration-of-car-wash-service-png-image_15194039.png';
import fullDetailing from '../../public/images/services/ما-أهمية-غسيل-السيارات-وهل-هو-ضروري؟-ماذا-عن-النوافذ؟-6.jpg';
import premiumDetailing from '../../public/images/services/تصميم-شعار-لوجو-مغسلة-سيارات.jpg.webp';

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