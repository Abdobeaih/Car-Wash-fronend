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
    title: t('faqTitle'),
    description: t('faqDescription'),
  };
}

export default async function FaqPage() {
  const t = await getTranslations('Faq');
  const faqs = t.raw('items') as { q: string; a: string }[];

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
    <div className="container-page max-w-3xl py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <p className="eyebrow">Mobile Car Care</p>
      <h1 className="display-title mt-4 text-3xl text-gray-900 sm:text-4xl">{t('title')}</h1>
      <div className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
        {faqs.map((item) => (
          <details key={item.q} className="group">
            <summary className="cursor-pointer list-none px-1 py-5 font-display text-base font-semibold uppercase tracking-wide text-gray-900 marker:hidden sm:text-lg">
              <span className="flex items-center justify-between gap-4">
                {item.q}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="shrink-0 text-gray-400 transition group-open:rotate-180 group-open:text-brand-600"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </summary>
            <p className="pb-6 ps-1 pe-1 pt-1 text-sm leading-relaxed text-gray-600 sm:pe-10">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}