import type { Metadata } from 'next';
import Image from 'next/image';
import { getFormatter, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { API_URL } from '@/lib/api';
import type { CarService } from '@/lib/types';
import heroCarWash from '../../../public/images/services/pngtree-car-wash-fast-delicate-png-image_15497309.png';
import heroCartoon from '../../../public/images/services/pngtree-cartoon-illustration-of-car-wash-service-png-image_15194039.png';
import heroLogo from '../../../public/images/services/تصميم-شعار-لوجو-مغسلة-سيارات.jpg.webp';
import heroWindows from '../../../public/images/services/ما-أهمية-غسيل-السيارات-وهل-هو-ضروري؟-ماذا-عن-النوافذ؟-6.jpg';

const heroImages = [heroCarWash, heroCartoon, heroLogo, heroWindows];

export const dynamic = 'force-dynamic';

async function getServices(): Promise<CarService[]> {
  try {
    const res = await fetch(`${API_URL}/services`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return (await res.json()) as CarService[];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('defaultTitle'),
    description: t('defaultDescription'),
  };
}

export default async function HomePage() {
  const services = await getServices();
  const t = await getTranslations('Home');
  const tc = await getTranslations('Common');
  const format = await getFormatter();

  const features = [t('feature1'), t('feature2'), t('feature3')];

  const howSteps = [
    { step: '1', title: t('howStep1Title'), text: t('howStep1Text') },
    { step: '2', title: t('howStep2Title'), text: t('howStep2Text') },
    { step: '3', title: t('howStep3Title'), text: t('howStep3Text') },
  ];

  const why = [
    { title: t('why1Title'), text: t('why1Text') },
    { title: t('why2Title'), text: t('why2Text') },
    { title: t('why3Title'), text: t('why3Text') },
    { title: t('why4Title'), text: t('why4Text') },
  ];

  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-gray-50">
        <div className="container-page grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:py-24">
          <div className="text-center lg:text-start">
            <p className="mb-3 inline-block rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700">
              {t('badge')}
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              {t('title')}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600 lg:mx-0">
              {t('subtitle')}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/book" className="btn-primary px-6 py-3 text-base">
                {t('book')}
              </Link>
              <Link href="/services" className="btn-secondary px-6 py-3 text-base">
                {t('browse')}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-600 lg:justify-start">
              {features.map((f) => (
                <span key={f}>✓ {f}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {services.slice(0, 4).map((service, index) => (
              <Link
                key={service._id}
                href={`/services/${service.slug}`}
                className="card group p-3 text-center transition hover:shadow-md sm:p-4"
              >
                <Image
                  src={heroImages[index % heroImages.length]}
                  alt={service.name}
                  width={200}
                  height={130}
                  className="h-24 w-full rounded-xl object-cover"
                />
                <h3 className="mt-3 text-sm font-semibold text-gray-900 group-hover:text-brand-700">
                  {service.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {format.number(service.basePrice, { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 })} ·{' '}
                  {tc('minutes', { value: service.duration })}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-12 sm:py-16">
        <h2 className="text-center text-3xl font-bold text-gray-900">{t('howTitle')}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {howSteps.map((item) => (
            <div key={item.step} className="card text-center md:text-start">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white md:mx-0">
                {item.step}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <div className="container-page">
          <h2 className="text-center text-3xl font-bold text-gray-900">{t('whyTitle')}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {why.map((item) => (
              <div key={item.title} className="card text-center">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-700 py-12 sm:py-16">
        <div className="container-page text-center">
          <h2 className="text-3xl font-bold text-white">{t('ctaTitle')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            {t('ctaText')}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/book" className="btn bg-white px-6 py-3 text-base text-brand-700 hover:bg-brand-50">
              {t('ctaBook')}
            </Link>
            <Link
              href="/register"
              className="btn border border-brand-300 px-6 py-3 text-base text-white hover:bg-brand-600"
            >
              {t('ctaRegister')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}