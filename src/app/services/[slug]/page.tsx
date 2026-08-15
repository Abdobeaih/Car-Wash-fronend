import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { API_URL } from '@/lib/api';
import type { AddOn, CarService } from '@/lib/types';
import { formatMoney } from '@/components/Badges';
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
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) {
    return { title: 'Service not found' };
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

  if (!service) {
    notFound();
  }

  return (
    <div className="container-page py-12">
      <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
        <Link href="/services" className="hover:text-brand-600">
          Services
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
              {formatMoney(service.basePrice)}
            </span>
            <span className="badge bg-gray-100 text-gray-700">{service.duration} minutes</span>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">Popular add-ons</h2>
            <ul className="mt-3 space-y-2">
              {addOns.map((addon) => (
                <li
                  key={addon._id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm"
                >
                  <span>
                    <span className="font-medium text-gray-900">{addon.name}</span>
                    <span className="ml-2 text-gray-500">{addon.description}</span>
                  </span>
                  <span className="font-semibold text-gray-900">+{formatMoney(addon.price)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={`/book?service=${service._id}`} className="btn-primary px-6 py-3 text-base">
              Book this service
            </Link>
            <Link href="/services" className="btn-secondary px-6 py-3 text-base">
              View all services
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