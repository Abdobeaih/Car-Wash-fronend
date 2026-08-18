import type { Metadata } from 'next';
import Image from 'next/image';
import { getFormatter, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { API_URL } from '@/lib/api';
import { serviceImagePath } from '@/lib/service-images';
import type { CarService } from '@/lib/types';

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
      <section className="bg-gradient-to-b from-brand-50 via-brand-50/50 to-gray-50">
        <div className="container-page grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:py-24">
          <div className="text-center lg:text-start">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3.5 py-1.5 text-sm font-medium text-brand-700 shadow-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 3l1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8L12 3z"
                  fill="currentColor"
                />
              </svg>
              {t('badge')}
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              {t('title')}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-gray-600 lg:mx-0">
              {t('subtitle')}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/book" className="btn-primary btn-lg">
                {t('book')}
              </Link>
              <Link href="/services" className="btn-secondary btn-lg">
                {t('browse')}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-gray-600 lg:justify-start">
              {features.map((f) => (
                <span key={f} className="inline-flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {f}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {services.slice(0, 4).map((service) => (
              <Link
                key={service._id}
                href={`/services/${service.slug}`}
                className="card group overflow-hidden p-0 text-center transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-600/5"
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={serviceImagePath(service.image)}
                    alt={service.name}
                    width={200}
                    height={130}
                    className="h-24 w-full object-cover transition duration-300 group-hover:scale-105 sm:h-28"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-700">
                    {service.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-gray-500">
                    {format.number(service.basePrice, { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 })} ·{' '}
                    {tc('minutes', { value: service.duration })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-12 sm:py-16">
        <h2 className="text-center text-3xl font-bold text-gray-900">{t('howTitle')}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {howSteps.map((item) => (
            <div key={item.step} className="card relative overflow-hidden p-6 text-center md:text-start">
              <span className="absolute end-3 top-3 text-5xl font-extrabold text-brand-50">
                {item.step}
              </span>
              <span className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white shadow-md shadow-brand-600/25 md:mx-0">
                {item.step}
              </span>
              <h3 className="relative mt-4 text-lg font-semibold text-gray-900">{item.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-gray-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <div className="container-page">
          <h2 className="text-center text-3xl font-bold text-gray-900">{t('whyTitle')}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {why.map((item, i) => (
              <div
                key={item.title}
                className="card p-6 text-center transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm ${
                  i % 4 === 0 ? 'bg-brand-600' : i % 4 === 1 ? 'bg-green-600' : i % 4 === 2 ? 'bg-amber-500' : 'bg-purple-600'
                }`}>
                  <WhyIcon index={i} />
                </span>
                <h3 className="mt-4 font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-brand-700 via-brand-700 to-brand-900 py-14 sm:py-16">
        <div className="container-page text-center">
          <h2 className="text-3xl font-bold text-white">{t('ctaTitle')}</h2>
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-brand-100">
            {t('ctaText')}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/book" className="btn bg-white px-6 py-3 text-base font-semibold text-brand-700 shadow-lg shadow-black/10 transition hover:bg-brand-50">
              {t('ctaBook')}
            </Link>
            <Link
              href="/register"
              className="btn border border-white/40 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              {t('ctaRegister')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function WhyIcon({ index }: { index: number }) {
  const icons = [
    <path
      key="1"
      d="M3 12l2-7h14l2 7m-18 0v7m18-7v7M3 12h18M5 19h14"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
    <path
      key="2"
      d="M12 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />,
    <path
      key="3"
      d="M4 20V9l8-5 8 5v11M9 20v-6h6v6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
    <rect
      key="4"
      x="4"
      y="5"
      width="16"
      height="14"
      rx="3"
      stroke="currentColor"
      strokeWidth="1.8"
    />,
  ];
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {icons[index % icons.length]}
    </svg>
  );
}