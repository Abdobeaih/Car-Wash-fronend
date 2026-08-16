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
    <div className="container-page max-w-4xl py-10 sm:py-14">
      <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
      <p className="mt-3 text-gray-600">
        {t('subtitle')}
      </p>
      <ol className="mt-10 space-y-6">
        {steps.map((step, index) => (
          <li key={step.title} className="card flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 font-bold text-white">
              {index + 1}
            </span>
            <div>
              <h2 className="font-semibold text-gray-900">{step.title}</h2>
              <p className="mt-1 text-sm text-gray-600">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-10 text-center">
        <Link href="/book" className="btn-primary px-6 py-3 text-base">
          {t('book')}
        </Link>
      </div>
    </div>
  );
}