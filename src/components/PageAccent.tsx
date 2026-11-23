'use client';
import Image from 'next/image';
import { usePathname } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import premium from '../../public/images/premium-2.webp';

export default function PageAccent() {
 const path=usePathname(); const ar=useLocale()==='ar';
 if(path==='/') return null;
 return <div className="mcc-page-accent"><Image src={premium} alt="" sizes="(max-width:640px) 240px,420px" className="mcc-accent-car"/><div className="container-page relative z-10"><p className="eyebrow">MOBILE CAR CARE / {path.startsWith('/admin')?'OPERATIONS':'PRECISION CARE'}</p><p className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{ar?'حضور مختلف. عناية مختلفة.':'Presence, in every detail.'}</p></div></div>;
}
