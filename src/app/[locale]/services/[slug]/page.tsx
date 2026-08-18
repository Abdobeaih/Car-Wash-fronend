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
    <div className="container-page py-12">
      <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
        <Link href="/services" className="hover:text-brand-600">
          {t('breadcrumb')}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{service.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl shadow-sm ring-1 ring-gray-200">
          <Image
            src={serviceImagePath(service.image)}
            alt={service.name}
            width={600}
            height={390}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
          <p className="mt-3 leading-relaxed text-gray-600">{service.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="text-3xl font-bold text-brand-600">
              {formatMoney(locale, service.basePrice, tc('currencyLabel'))}
            </span>
            <span className="badge bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-500/20">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {formatDuration(tc, service.duration)}
            </span>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">{t('popularAddOns')}</h2>
            <ul className="mt-3 space-y-2">
              {addOns.map((addon) => (
                <li
                  key={addon._id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition hover:border-brand-200"
                >
                  <span className="min-w-0">
                    <span className="font-medium text-gray-900">{addon.name}</span>
                    <span className="ms-2 text-gray-500">{addon.description}</span>
                  </span>
                  <span className="shrink-0 font-semibold text-brand-600">
                    +{formatMoney(locale, addon.price, tc('currencyLabel'))}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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