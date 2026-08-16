import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { API_URL } from '@/lib/api';
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
      images: [service.image],
    },
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [service, addOns] = await Promise.all([getService(slug), getAddOns()]);
  const t = await getTranslations('ServiceDetail');
  const tc = await getTranslations('Common');
  const format = await getFormatter();

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
        <Image
          src={service.image}
          alt={service.name}
          width={600}
          height={390}
          className="w-full rounded-2xl object-cover shadow-sm"
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
          <p className="mt-3 text-gray-600">{service.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="text-3xl font-bold text-brand-600">
              {format.number(service.basePrice, { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
            <span className="badge bg-gray-100 text-gray-700">
              {tc('minutes', { value: service.duration })}
            </span>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">{t('popularAddOns')}</h2>
            <ul className="mt-3 space-y-2">
              {addOns.map((addon) => (
                <li
                  key={addon._id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm"
                >
                  <span className="min-w-0">
                    <span className="font-medium text-gray-900">{addon.name}</span>
                    <span className="ms-2 text-gray-500">{addon.description}</span>
                  </span>
                  <span className="shrink-0 font-semibold text-gray-900">
                    +{format.number(addon.price, { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={`/book?service=${service._id}`} className="btn-primary px-6 py-3 text-base">
              {t('bookThis')}
            </Link>
            <Link href="/services" className="btn-secondary px-6 py-3 text-base">
              {t('viewAll')}
            </Link>
            <BackToDashboard className="px-6 py-3 text-base" />
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
            image: service.image,
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