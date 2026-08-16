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
    { title: t('workingHoursTitle'), value: t('workingHoursValue') },
    { title: t('serviceAreaTitle'), value: t('serviceAreaValue') },
    { title: t('bookingTitle'), value: t('bookingValue') },
  ];

  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
      <p className="mt-3 text-gray-600">
        {t('subtitle')}
      </p>

      <ContactForm />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((item) => (
          <div key={item.title} className="card text-center">
            <p className="font-semibold text-gray-900">{item.title}</p>
            <p className="mt-1 text-sm text-gray-500">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}