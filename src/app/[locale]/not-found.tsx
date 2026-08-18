import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('NotFound');
  return (
    <div className="container-page flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13m-14 0h14m-14 0v3m14-3v3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="mt-6 text-6xl font-extrabold tracking-tight text-brand-600">{t('code')}</p>
      <h1 className="mt-3 text-2xl font-bold text-gray-900">{t('title')}</h1>
      <p className="mt-2 text-gray-600">{t('text')}</p>
      <Link href="/" className="btn-primary mt-8">
        {t('home')}
      </Link>
    </div>
  );
}