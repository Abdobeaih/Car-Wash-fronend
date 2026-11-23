/**
 * DB content (service/add-on names & descriptions) is seeded in English.
 * Map known values to Arabic so the AR locale is fully Arabic.
 * Unknown values pass through unchanged.
 */
const AR_CONTENT: Record<string, string> = {
  // Services
  'Exterior Car Wash': 'غسيل خارجي للسيارة',
  'Interior Cleaning': 'تنظيف داخلي',
  'Full Car Detailing': 'تنظيف وتلميع شامل للسيارة',
  'Premium Detailing': 'باقة العناية الفاخرة',
  'A complete exterior wash including foam pre-wash, hand wash, wheel cleaning and spot-free rinse to leave your car shining.':
    'غسيل خارجي متكامل يشمل الرغوة والغسيل اليدوي وتنظيف الجنوط، ثم شطفًا نهائيًا دون بقع لسيارة نظيفة ولامعة.',
  'Professional interior vacuum, dashboard and console wipe-down, seat cleaning and window polish for a fresh cabin.':
    'تنظيف داخلي احترافي بالمكنسة، مسح التابلوه والكونسول، تنظيف المقاعد وتلميع الزجاج لمقصورة منتعشة.',
  'A thorough exterior and interior detail including wash, wax, interior deep clean and trim restoration.':
    'تنظيف شامل للسيارة من الداخل والخارج، يشمل الغسيل والتلميع بالشمع والتنظيف العميق للمقصورة وتجديد القطع البلاستيكية.',
  'Our top-tier package with machine polish, paint protection, leather conditioning and a showroom-quality finish.':
    'باقتنا الفاخرة تشمل التلميع بالماكينة وحماية الدهان وترطيب الجلد، لنتيجة تضاهي سيارات العرض.',
  // Add-ons
  'Engine Bay Cleaning': 'تنظيف حجرة المحرك',
  'Leather Conditioning': 'ترطيب الجلد',
  'Odor Treatment': 'معالجة الروائح',
  'Tire Cleaning': 'تنظيف الإطارات',
  'Safe steam cleaning and degreasing of the engine bay.':
    'تنظيف آمن بالبخار وإزالة الشحوم من حجرة المحرك.',
  'Cleans and conditions leather seats to prevent cracking.':
    'تنظيف وترطيب المقاعد الجلدية لحمايتها من التشقق.',
  'Neutralizes unpleasant odors and leaves a fresh scent.':
    'يقضي على الروائح الكريهة ويترك رائحة منعشة.',
  'Deep clean and shine treatment for all tires and rims.':
    'تنظيف عميق ولمعان لجميع الإطارات والجنوط.',
};

export function localizeContent(locale: string, text?: string | null): string {
  if (text == null) return '';
  if (locale !== 'ar') return text;
  return AR_CONTENT[text] ?? text;
}
