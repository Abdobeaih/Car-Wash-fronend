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
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
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