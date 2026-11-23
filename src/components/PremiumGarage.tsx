import Image from 'next/image';
import bmw1 from '../../public/images/premium-0.webp';
import bmw2 from '../../public/images/premium-1.webp';
import amg from '../../public/images/premium-2.webp';
import s63 from '../../public/images/premium-3.webp';

export default function PremiumGarage({ locale, wide = false }: { locale: string; wide?: boolean }) {
 const ar = locale === 'ar';
 const cars = wide ? [{image:amg,label:'MERCEDES-AMG GT'},{image:s63,label:'MERCEDES S63'}] : [{image:bmw1,label:'BMW 1M'},{image:bmw2,label:'BMW COUPE'}];
 return <section className="border-b border-gray-200 bg-gray-900 py-14 sm:py-20">
  <div className="container-page">
   <div className="mb-8 flex items-end justify-between gap-6"><div><p className="eyebrow">{wide ? 'THE FINISH' : 'DRIVEN BY DETAIL'}</p><h2 className="display-title mt-3 text-3xl text-white sm:text-5xl">{ar ? (wide?'كل تفصيلة ليها قيمتها.':'حضور مختلف. عناية مختلفة.') : (wide?'Every detail matters.':'Presence, in every detail.')}</h2></div><span className="hidden text-sm text-gray-400 sm:block">{wide?'02 / FINISH':'01 / PRECISION'}</span></div>
   <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{cars.map((car,i)=><figure key={car.label} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black"><Image src={car.image} alt={car.label} sizes="(max-width:640px) 100vw,50vw" className={`w-full object-cover transition duration-700 group-hover:scale-105 ${wide?'aspect-[16/10]':'aspect-[4/3]'}`} style={{objectPosition:'50% 60%'}}/><figcaption className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/95 to-transparent px-6 pb-6 pt-20 text-sm font-semibold tracking-widest text-white"><span>{car.label}</span><span className="text-lime-300">0{i+1}</span></figcaption></figure>)}</div>
   <p className="mt-4 text-xs text-gray-500">{ar?'صور توضيحية لأسلوب العناية. لا تعني ارتباطًا بالعلامات التجارية.':'Automotive inspiration. No brand affiliation or endorsement.'}</p>
  </div>
 </section>;
}
