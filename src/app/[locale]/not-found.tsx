import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('NotFound');
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-black text-brand-500">
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
      <p className="mt-8 font-display text-7xl font-semibold text-brand-600 sm:text-8xl">
        {t('code')}
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">{t('title')}</h1>
      <p className="mt-2 text-gray-600">{t('text')}</p>
      <Link href="/" className="btn-primary mt-8">
        {t('home')}
      </Link>
    </div>
  );
}