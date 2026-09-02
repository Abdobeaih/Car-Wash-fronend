import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { API_URL } from '@/lib/api';
import { formatDuration } from '@/lib/duration';
import { formatMoney } from '@/lib/money';
import { serviceImagePath, serviceImageUrl } from '@/lib/service-images';
import type { AppLocale } from '@/i18n/routing';
import type { AddOn, CarService } from '@/lib/types';
import BackToDashboard from '@/components/BackToDashboard';

export const dynamic = 'force-dynamic';

async function getService(slug: string): Promise<CarService | null> {
  try {
    const res = await fetch(`${API_URL}/services/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as CarService;
  } catch {
    return null;
  }
}

async function getAddOns(): Promise<AddOn[]> {
  try {
    const res = await fetch(`${API_URL}/add-ons`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return (await res.json()) as AddOn[];
  } catch {
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ServiceDetail' });
  const service = await getService(slug);
  if (!service) {
    return { title: t('notFoundTitle') };
  }
  return {
    title: service.name,
    description: service.description,
    openGraph: {
      title: service.name,
      description: service.description,
      images: [serviceImageUrl(service.image)],
    },
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [service, addOns] = await Promise.all([getService(slug), getAddOns()]);
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations('ServiceDetail');
  const tc = await getTranslations('Common');

  if (!service) {
    notFound();
  }

  return (
    <div className="container-page py-12 sm:py-16">
      <nav
        className="mb-10 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-gray-500"
        aria-label="Breadcrumb"
      >
        <Link href="/services" className="transition hover:text-brand-600">
          {t('breadcrumb')}
        </Link>
        <span className="text-gray-300" aria-hidden="true">/</span>
        <span className="text-gray-800">{service.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="relative">
          <span
            aria-hidden="true"
            className="absolute -bottom-4 -end-4 hidden h-24 w-24 bg-brand-600 sm:block"
          />
          <div className="relative overflow-hidden rounded-none border border-gray-300 bg-gray-100">
            <Image
              src={serviceImagePath(service.image)}
              alt={service.name}
              width={720}
              height={520}
              className="aspect-[16/11] w-full object-cover"
            />
          </div>
        </div>
        <div>
          <p className="eyebrow">Mobile Car Care</p>
          <h1 className="display-title mt-4 text-3xl text-gray-900 sm:text-4xl">{service.name}</h1>
          <p className="mt-4 max-w-xl leading-relaxed text-gray-600">{service.description}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-3 rounded-md border border-gray-800 bg-black px-5 py-2.5 text-white">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                {tc('price')}
              </span>
              <span className="font-display text-xl font-semibold text-brand-400">
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

          {addOns.length > 0 && (
            <div className="mt-10">
              <h2 className="eyebrow">{t('popularAddOns')}</h2>
              <ul className="mt-4 divide-y divide-gray-200 border-y border-gray-200">
                {addOns.map((addon) => (
                  <li
                    key={addon._id}
                    className="flex items-center justify-between gap-3 py-3.5"
                  >
                    <span className="min-w-0">
                      <span className="font-semibold text-gray-900">{addon.name}</span>
                      <span className="ms-2 text-sm text-gray-500">{addon.description}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="font-display font-semibold text-brand-600">
                        +{formatMoney(locale, addon.price, tc('currencyLabel'))}
                      </span>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-gray-500">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                        </svg>
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href={`/book?service=${service._id}`} className="btn-primary btn-lg">
              {t('bookThis')}
            </Link>
            <Link href="/services" className="btn-secondary btn-lg">
              {t('viewAll')}
            </Link>
            <BackToDashboard className="btn-lg" />
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: service.name,
            description: service.description,
            image: serviceImageUrl(service.image),
            provider: { '@type': 'LocalBusiness', name: 'MobileCarCare' },
            offers: {
              '@type': 'Offer',
              price: service.basePrice,
              priceCurrency: 'USD',
            },
          }),
        }}
      />
    </div>
  );
}