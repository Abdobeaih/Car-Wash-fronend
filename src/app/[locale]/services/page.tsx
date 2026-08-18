import type { Metadata } from 'next';
import Image from 'next/image';
import { getFormatter, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { API_URL } from '@/lib/api';
import type { CarService } from '@/lib/types';
import { EmptyState } from '@/components/States';
import BackToDashboard from '@/components/BackToDashboard';

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
  const t = await getTranslations('Services');
  const tc = await getTranslations('Common');
  const format = await getFormatter();

  return (
    <div className="container-page py-12">
      <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-gray-600">
            {t('subtitle')}
          </p>
        </div>
        <BackToDashboard className="shrink-0" />
      </header>

      {services.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service._id}
              href={`/services/${service.slug}`}
              className="card group overflow-hidden p-0 text-center transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-600/5 sm:text-start"
            >
              <div className="relative overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.name}
                  width={400}
                  height={260}
                  className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-brand-700">
                  {service.name}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">{service.description}</p>
                <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
                  <span className="text-lg font-bold text-brand-600">
                    {format.number(service.basePrice, { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    {tc('minutes', { value: service.duration })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}