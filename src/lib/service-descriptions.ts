import type { CarService } from './types';

type Copy = { summary: string; includes: string[] };
type ServiceCopy = { name: string; description: string; en: Copy; ar: Copy };

// Reviewed against the public catalog on 2026-11-23. Match both name and
// description so later catalog edits cannot silently inherit stale inclusions.
const descriptions: ServiceCopy[] = [
 {name:'Exterior Car Wash',description:'A complete exterior wash including foam pre-wash, hand wash, wheel cleaning and spot-free rinse to leave your car shining.',
 en:{summary:'An exterior wash to clean the body and wheels and leave your car looking fresh.',includes:['Foam pre-wash','Hand wash','Wheel cleaning','Spot-free final rinse']},
 ar:{summary:'غسيل خارجي لتنظيف هيكل السيارة والعجلات واستعادة مظهرها النظيف.',includes:['غسيل تمهيدي بالرغوة','غسيل يدوي','تنظيف العجلات','شطف نهائي دون بقع']}},
 {name:'Interior Cleaning',description:'Professional interior vacuum, dashboard and console wipe-down, seat cleaning and window polish for a fresh cabin.',
 en:{summary:'Interior cleaning focused on the cabin, seats and glass for a cleaner, fresher space.',includes:['Interior vacuuming','Dashboard and console wipe-down','Seat cleaning','Window polishing']},
 ar:{summary:'تنظيف للمقصورة والمقاعد والزجاج لتكون السيارة أنظف من الداخل.',includes:['تنظيف المقصورة بالمكنسة','مسح لوحة القيادة والكونسول','تنظيف المقاعد','تلميع الزجاج']}},
 {name:'Full Car Detailing',description:'A thorough exterior and interior detail including wash, wax, interior deep clean and trim restoration.',
 en:{summary:'A thorough interior and exterior care package, combining cleaning with wax and trim restoration.',includes:['Exterior wash','Wax treatment','Deep interior cleaning','Trim restoration']},
 ar:{summary:'عناية شاملة بالسيارة من الداخل والخارج، تجمع التنظيف مع الشمع وتجديد الأجزاء التجميلية.',includes:['غسيل خارجي','معالجة بالشمع','تنظيف عميق للمقصورة','تجديد الأجزاء التجميلية']}},
 {name:'Premium Detailing',description:'Our top-tier package with machine polish, paint protection, leather conditioning and a showroom-quality finish.',
 en:{summary:'Our premium care package focuses on the paint finish and leather surfaces.',includes:['Machine polishing','Paint protection treatment','Leather conditioning']},
 ar:{summary:'باقة العناية الفاخرة تركز على مظهر الطلاء والعناية بالأسطح الجلدية.',includes:['تلميع بالماكينة','معالجة لحماية الطلاء','ترطيب الجلد']}}
];

export function serviceDescription(service: Pick<CarService,'name'|'description'>, locale: string): Copy | null {
 const match = descriptions.find(item=>item.name===service.name && item.description===service.description);
 return match ? match[locale==='ar'?'ar':'en'] : null;
}

const addons: Record<string,{description:string;en:string;ar:string}> = {
 'Engine Bay Cleaning':{description:'Safe steam cleaning and degreasing of the engine bay.',en:'Steam cleaning and degreasing of the engine bay to remove built-up grease and dirt.',ar:'تنظيف حجرة المحرك بالبخار وإزالة الشحوم والأوساخ المتراكمة.'},
 'Leather Conditioning':{description:'Cleans and conditions leather seats to prevent cracking.',en:'Cleaning and conditioning for leather seats to help care for the leather.',ar:'تنظيف المقاعد الجلدية وترطيبها للعناية بالجلد.'},
 'Odor Treatment':{description:'Neutralizes unpleasant odors and leaves a fresh scent.',en:'A treatment to neutralize unpleasant odors and leave a fresh scent.',ar:'معالجة للروائح غير المرغوبة وترك رائحة منعشة.'},
 'Tire Cleaning':{description:'Deep clean and shine treatment for all tires and rims.',en:'Deep cleaning and a shine treatment for the tires and rims.',ar:'تنظيف عميق ومعالجة لإضفاء اللمعان على الإطارات والجنوط.'}
};
export function addOnDescription(addon:{name:string;description?:string},locale:string): string | null {
 const match=addons[addon.name];
 return match && match.description===addon.description ? match[locale==='ar'?'ar':'en'] : null;
}
