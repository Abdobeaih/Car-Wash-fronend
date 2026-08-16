'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations('Header');
  const router = useRouter();
  const pathname = usePathname();

  const toggle = () => {
    const other = routing.locales.find((l) => l !== locale) ?? 'en';
    router.replace(pathname, { locale: other });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 ${className}`}
      aria-label={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
      {t('otherLanguage')}
    </button>
  );
}