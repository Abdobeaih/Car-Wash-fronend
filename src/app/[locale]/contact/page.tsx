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
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
      <p className="mt-3 leading-relaxed text-gray-600">
        {t('subtitle')}
      </p>

      <ContactForm />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((item) => (
          <div key={item.title} className="card p-5 text-center">
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                {cardIcons[item.icon]}
              </svg>
            </span>
            <p className="mt-3 font-semibold text-gray-900">{item.title}</p>
            <p className="mt-1.5 text-sm text-gray-500">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}