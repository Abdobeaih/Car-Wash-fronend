import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('aboutTitle'),
    description: t('aboutDescription'),
  };
}

export default async function AboutPage() {
  const t = await getTranslations('About');

  const stats = [
    { value: t('stat1Value'), label: t('stat1Label') },
    { value: t('stat2Value'), label: t('stat2Label') },
    { value: t('stat3Value'), label: t('stat3Label') },
  ];

  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-gray-600">
        <p>{t('paragraph1')}</p>
        <p>{t('paragraph2')}</p>
        <p>{t('paragraph3')}</p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((item, i) => (
          <div key={item.label} className="card p-6 text-center transition hover:-translate-y-0.5 hover:shadow-md">
            <span className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm ${
              i === 0 ? 'bg-brand-600' : i === 1 ? 'bg-green-600' : 'bg-purple-600'
            }`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                {i === 0 ? (
                  <path d="M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                ) : i === 1 ? (
                  <path d="M3 12l7 7L21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <rect x="4" y="5" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
                )}
              </svg>
            </span>
            <p className="mt-3 text-xl font-bold text-gray-900">{item.value}</p>
            <p className="mt-1 text-sm text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}