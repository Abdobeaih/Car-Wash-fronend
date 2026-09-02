import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import ContactForm from './ContactForm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('contactTitle'),
    description: t('contactDescription'),
  };
}

export default async function ContactPage() {
  const t = await getTranslations('Contact');

  const cards = [
    { title: t('workingHoursTitle'), value: t('workingHoursValue'), icon: 'clock' },
    { title: t('serviceAreaTitle'), value: t('serviceAreaValue'), icon: 'pin' },
    { title: t('bookingTitle'), value: t('bookingValue'), icon: 'calendar' },
  ] as const;

  const cardIcons = {
    clock: (
      <path d="M12 7v5l3 2M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    ),
    pin: (
      <path d="M12 21s-6-5.1-6-10a6 6 0 1 1 12 0c0 4.9-6 10-6 10zM12 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" stroke="currentColor" strokeWidth="1.8" />
    ),
    calendar: (
      <rect x="4" y="5" width="16" height="15" rx="3" stroke="currentColor" strokeWidth="1.8" />
    ),
  };

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
        <div>
          <p className="eyebrow">Mobile Car Care</p>
          <h1 className="display-title mt-4 text-3xl text-gray-900 sm:text-4xl">{t('title')}</h1>
          <p className="mt-4 max-w-xl leading-relaxed text-gray-600">{t('subtitle')}</p>

          <ul className="mt-10 divide-y divide-gray-200 border-y border-gray-200">
            {cards.map((item) => (
              <li key={item.title} className="flex items-center gap-5 py-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-gray-300 text-gray-900">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    {cardIcons[item.icon]}
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold uppercase tracking-wide text-gray-900">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">{item.value}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}