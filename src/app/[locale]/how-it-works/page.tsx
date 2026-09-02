import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('howItWorksTitle'),
    description: t('howItWorksDescription'),
  };
}

export default async function HowItWorksPage() {
  const t = await getTranslations('HowItWorks');
  const steps = t.raw('steps') as { title: string; text: string }[];

  return (
    <div className="container-page max-w-3xl py-12 sm:py-16">
      <p className="eyebrow">Mobile Car Care</p>
      <h1 className="display-title mt-4 text-3xl text-gray-900 sm:text-4xl">{t('title')}</h1>
      <p className="mt-4 max-w-xl leading-relaxed text-gray-600">{t('subtitle')}</p>
      <ol className="mt-10 divide-y divide-gray-200 border-y border-gray-200">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-6 py-8">
            <span className="font-display text-4xl font-semibold text-brand-600 sm:text-5xl">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-gray-900">
                {step.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-10">
        <Link href="/book" className="btn-primary btn-lg">
          {t('book')}
        </Link>
      </div>
    </div>
  );
}