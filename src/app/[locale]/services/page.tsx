import type { Metadata } from 'next';
import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { API_URL } from '@/lib/api';
import { formatDuration } from '@/lib/duration';
import { formatMoney } from '@/lib/money';
import { serviceImagePath } from '@/lib/service-images';
import type { AppLocale } from '@/i18n/routing';
import type { CarService } from '@/lib/types';
import { EmptyState } from '@/components/States';

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
    title: t('servicesTitle'),
    description: t('servicesDescription'),
  };
}

export default async function ServicesPage() {
  const services = await getServices();
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations('Services');
  const td = await getTranslations('ServiceDetail');
  const tc = await getTranslations('Common');

  return (
    <>
      <section className="border-b border-gray-200 bg-black py-14 sm:py-20">
        <div className="container-page">
          <p className="eyebrow text-brand-400">Mobile Car Care</p>
          <h1 className="display-title mt-4 text-4xl text-white sm:text-5xl">{t('title')}</h1>
          <p className="mt-4 max-w-xl leading-relaxed text-gray-400">{t('subtitle')}</p>
        </div>
      </section>

      <section className="container-page pb-20 pt-4 sm:pt-8">
        {services.length === 0 ? (
          <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
        ) : (
          <div className="divide-y divide-gray-200">
            {services.map((service, i) => {
              const flip = i % 2 === 1;
              return (
                <article
                  key={service._id}
                  className={`group relative grid gap-6 py-10 sm:py-12 lg:items-center lg:gap-12 ${
                    flip ? 'lg:grid-cols-[1fr_2fr]' : 'lg:grid-cols-[2fr_1fr]'
                  }`}
                >
                  <div className={`relative ${flip ? 'lg:order-2' : ''}`}>
                    <Link
                      href={`/services/${service.slug}`}
                      className="relative block overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                    >
                      <Image
                        src={serviceImagePath(service.image)}
                        alt={service.name}
                        width={640}
                        height={400}
                        className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                      <span className="absolute start-4 top-4 bg-black/90 px-2.5 py-1 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-400">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </Link>
                  </div>

                  <div className={flip ? 'lg:order-1' : ''}>
                    <h2 className="display-title text-2xl text-gray-900 transition group-hover:text-brand-700 sm:text-3xl">
                      {service.name}
                    </h2>
                    <p className="mt-4 max-w-xl leading-relaxed text-gray-600">
                      {service.description}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-3 rounded-md border border-gray-800 bg-black px-5 py-2.5 text-white">
                        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                          {tc('price')}
                        </span>
                        <span className="font-display text-lg font-semibold text-brand-400">
                          {formatMoney(locale, service.basePrice, tc('currencyLabel'))}
                        </span>
                      </span>
                      <span className="badge border border-gray-200 bg-gray-50 text-gray-600">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                          <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        {formatDuration(tc, service.duration)}
                      </span>
                    </div>
                    <Link href={`/book?service=${service._id}`} className="btn-primary mt-7">
                      {td('bookThis')}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}