import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about Mobile CarCare — professional mobile car care services delivered to your location.',
};

export default function AboutPage() {
  return (
    <div className="container-page max-w-3xl py-14">
      <h1 className="text-3xl font-bold text-gray-900">About Mobile CarCare</h1>
      <div className="mt-6 space-y-4 text-gray-600">
        <p>
          Mobile CarCare is a convenient mobile car care service that brings professional
          washing, cleaning and detailing directly to your location.
        </p>
        <p>
          We know your time is valuable. Instead of driving to a car wash and waiting in line,
          you book online and our trained professionals arrive at your home or workplace at the
          time you choose.
        </p>
        <p>
          Our packages cover everything from a quick exterior wash to premium detailing with
          machine polish and paint protection. Pricing is transparent and shown upfront before
          you confirm your booking.
        </p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { value: '100%', label: 'Mobile service' },
          { value: 'Upfront', label: 'Transparent pricing' },
          { value: 'Flexible', label: 'Online scheduling' },
        ].map((item) => (
          <div key={item.label} className="card text-center">
            <p className="text-xl font-bold text-brand-600">{item.value}</p>
            <p className="mt-1 text-sm text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}