import type { CarService } from '@/lib/types';
import { localizeContent } from '@/lib/localize-content';
import { serviceDescription } from '@/lib/service-descriptions';

export default function ServiceDescription({service,locale}:{service:Pick<CarService,'name'|'description'>;locale:string}) {
 const copy=serviceDescription(service,locale);
 return <div className="mt-4 max-w-xl space-y-4 text-gray-600">
  <p className="leading-relaxed">{copy?.summary ?? localizeContent(locale,service.description)}</p>
  {copy && <div><h3 className="text-sm font-semibold text-gray-900">{locale==='ar'?'تشمل الخدمة':'What is included'}</h3><ul className="mt-2 list-disc space-y-1.5 ps-5 text-sm leading-relaxed">{copy.includes.map(item=><li key={item}>{item}</li>)}</ul></div>}
 </div>;
}
