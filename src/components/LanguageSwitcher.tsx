'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { useTransition } from 'react';

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations('Header');
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const other = routing.locales.find((l) => l !== locale) ?? 'en';
    startTransition(() => {
      router.replace(pathname, { locale: other });
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 ${className}`}
      aria-label={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
      aria-busy={isPending}
      disabled={isPending}
    >
      {isPending ? (
        <svg
          className="animate-spin text-brand-600"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
          <path
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M3.5 12h17M12 3c2.5 2.4 3.8 5.6 3.8 9S14.5 18.6 12 21c-2.5-2.4-3.8-5.6-3.8-9S9.5 5.4 12 3z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      )}
      {t('otherLanguage')}
    </button>
  );
}