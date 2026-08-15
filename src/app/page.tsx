import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { API_URL } from '@/lib/api';
import type { CarService } from '@/lib/types';
import { formatMoney } from '@/components/Badges';
import heroCarWash from '../../public/images/services/pngtree-car-wash-fast-delicate-png-image_15497309.png';
import heroCartoon from '../../public/images/services/pngtree-cartoon-illustration-of-car-wash-service-png-image_15194039.png';
import heroLogo from '../../public/images/services/تصميم-شعار-لوجو-مغسلة-سيارات.jpg.webp';
import heroWindows from '../../public/images/services/ما-أهمية-غسيل-السيارات-وهل-هو-ضروري؟-ماذا-عن-النوافذ؟-6.jpg';

const heroImages = [heroCarWash, heroCartoon, heroLogo, heroWindows];

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mobile CarCare — Professional Mobile Car Care Services',
  description:
    'Book professional mobile car care services — exterior wash, interior cleaning and full detailing — delivered to your location.',
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

export default async function HomePage() {
  const services = await getServices();

  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-gray-50">
        <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="mb-3 inline-block rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700">
              Mobile car care, delivered to you
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              A professional car wash, wherever you are.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-gray-600">
              Book exterior washes, interior cleaning and full detailing in minutes. Our
              professionals come to your location, so you never have to wait in line.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/book" className="btn-primary px-6 py-3 text-base">
                Book a Service
              </Link>
              <Link href="/services" className="btn-secondary px-6 py-3 text-base">
                Browse Services
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-gray-600">
              <span>✓ Mobile professionals</span>
              <span>✓ Transparent pricing</span>
              <span>✓ Flexible scheduling</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {services.slice(0, 4).map((service, index) => (
              <Link
                key={service._id}
                href={`/services/${service.slug}`}
                className="card group p-4 transition hover:shadow-md"
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
                  {formatMoney(service.basePrice)} · {service.duration} min
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="text-center text-3xl font-bold text-gray-900">How It Works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              step: '1',
              title: 'Choose your service',
              text: 'Browse wash, interior and detailing packages that fit your car.',
            },
            {
              step: '2',
              title: 'Pick a time',
              text: 'Choose your location, date and an available time slot that suits you.',
            },
            {
              step: '3',
              title: 'We come to you',
              text: 'A professional arrives at your location and takes care of your car.',
            },
          ].map((item) => (
            <div key={item.step} className="card">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
                {item.step}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page">
          <h2 className="text-center text-3xl font-bold text-gray-900">Why Choose MobileCarCare</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'At your doorstep', text: 'No queues, no waiting rooms. We come to you.' },
              { title: 'Trained professionals', text: 'Certified detailers with quality materials.' },
              { title: 'Fair, upfront pricing', text: 'The price you see is the price you pay.' },
              { title: 'Easy online booking', text: 'Schedule in minutes, manage anytime.' },
            ].map((item) => (
              <div key={item.title} className="card">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-700 py-16">
        <div className="container-page text-center">
          <h2 className="text-3xl font-bold text-white">Ready to get your car looking great?</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Book your first mobile car care service today — it takes less than two minutes.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/book" className="btn bg-white px-6 py-3 text-base text-brand-700 hover:bg-brand-50">
              Book a Service
            </Link>
            <Link
              href="/register"
              className="btn border border-brand-300 px-6 py-3 text-base text-white hover:bg-brand-600"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}