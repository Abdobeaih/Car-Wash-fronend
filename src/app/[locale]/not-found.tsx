import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('NotFound');
  return (
    <div className="container-page flex flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl font-extrabold text-brand-600">{t('code')}</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">{t('title')}</h1>
      <p className="mt-2 text-gray-600">{t('text')}</p>
      <Link href="/" className="btn-primary mt-8">
        {t('home')}
      </Link>
    </div>
  );
}