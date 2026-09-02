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
    <>
      <section className="border-b border-gray-200 bg-black py-14 sm:py-20">
        <div className="container-page">
          <p className="eyebrow text-brand-400">Mobile Car Care</p>
          <h1 className="display-title mt-4 max-w-2xl text-4xl text-white sm:text-5xl">
            {t('title')}
          </h1>
        </div>
      </section>

      <section className="container-page py-12 sm:py-16">
        <div className="max-w-3xl space-y-5 text-base leading-relaxed text-gray-600 sm:text-lg">
          <p>{t('paragraph1')}</p>
          <p>{t('paragraph2')}</p>
          <p className="ps-4 border-s-2 border-brand-600 text-gray-900">{t('paragraph3')}</p>
        </div>

        <dl className="mt-14 grid gap-px overflow-hidden border border-gray-200 bg-gray-200 sm:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="bg-white p-7">
              <dd className="font-display text-4xl font-semibold text-brand-600">{item.value}</dd>
              <dt className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                {item.label}
              </dt>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}