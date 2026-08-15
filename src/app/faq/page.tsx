import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Frequently asked questions about Mobile CarCare booking, pricing, cancellation and more.',
};

const faqs = [
  {
    q: 'How do I book a service?',
    a: 'Create an account, add your vehicle, then use the booking flow to pick a service, add-ons, location and an available time slot.',
  },
  {
    q: 'Do you come to my location?',
    a: 'Yes. Mobile CarCare is fully mobile — a professional travels to the location you provide during booking.',
  },
  {
    q: 'How is the price calculated?',
    a: 'The final price is the service base price plus any add-ons you select. The total is always confirmed by our system before you complete the booking.',
  },
  {
    q: 'What are the working hours?',
    a: 'Bookings can be scheduled every day between 09:00 and 18:00. Available slots depend on service duration and existing bookings.',
  },
  {
    q: 'Can I cancel a booking?',
    a: 'Yes. Pending and confirmed bookings can be cancelled from your dashboard. Completed and already-cancelled bookings cannot be cancelled.',
  },
  {
    q: 'Which vehicles can I add?',
    a: 'You can add any car (sedan, SUV, pickup or luxury) by providing the brand, model, year, color and plate number.',
  },
];

export default function FaqPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <div className="container-page max-w-3xl py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
      <div className="mt-8 space-y-4">
        {faqs.map((item) => (
          <details key={item.q} className="card group">
            <summary className="cursor-pointer list-none font-semibold text-gray-900 marker:hidden">
              <span className="flex items-center justify-between gap-4">
                {item.q}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="shrink-0 text-gray-400 transition group-open:rotate-180"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-sm text-gray-600">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}