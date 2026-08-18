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
      <ol className="mt-10 space-y-3">
        {steps.map((step, index) => (
          <li key={step.title} className="relative flex gap-4">
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute start-[19px] top-12 bottom-0 w-px bg-gray-200"
              />
            )}
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white shadow-md shadow-brand-600/25">
              {index + 1}
            </span>
            <div className="card mb-1 flex-1 p-5">
              <h2 className="font-semibold text-gray-900">{step.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{step.text}</p>
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