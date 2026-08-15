import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { API_URL } from '@/lib/api';
import type { CarService } from '@/lib/types';
import { formatMoney } from '@/components/Badges';
import { EmptyState } from '@/components/States';
import BackToDashboard from '@/components/BackToDashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Explore our mobile car care services — exterior wash, interior cleaning, full detailing and premium detailing.',
};

async function getServices(): Promise<CarService[]> {
  try {
    const res = await fetch(`${API_URL}/services`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return (await res.json()) as CarService[];
  } catch {
    return [];
  }
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="container-page py-12">
      <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-900">Our Services</h1>
          <p className="mt-2 text-gray-600">
            Every service is performed at your location by trained professionals. Choose the
            package that fits your car.
          </p>
        </div>
        <BackToDashboard className="shrink-0" />
      </header>

      {services.length === 0 ? (
        <EmptyState title="No services available" description="Services are coming soon." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service._id}
              href={`/services/${service.slug}`}
              className="card group overflow-hidden p-0 transition hover:shadow-md"
            >
              <Image
                src={service.image}
                alt={service.name}
                width={400}
                height={260}
                className="h-40 w-full object-cover"
              />
              <div className="p-5">
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-brand-700">
                  {service.name}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">{service.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-brand-600">
                    {formatMoney(service.basePrice)}
                  </span>
                  <span className="text-sm text-gray-500">{service.duration} min</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}