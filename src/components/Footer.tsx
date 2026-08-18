import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function Footer() {
  const t = await getTranslations('Footer');
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13m-14 0h14m-14 0v3m14-3v3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Mobile<span className="text-brand-600">CarCare</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-500">{t('tagline')}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">{t('explore')}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-gray-500">
            <li><Link className="transition hover:text-brand-600" href="/services">{t('services')}</Link></li>
            <li><Link className="transition hover:text-brand-600" href="/how-it-works">{t('howItWorks')}</Link></li>
            <li><Link className="transition hover:text-brand-600" href="/about">{t('about')}</Link></li>
            <li><Link className="transition hover:text-brand-600" href="/faq">{t('faq')}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">{t('account')}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-gray-500">
            <li><Link className="transition hover:text-brand-600" href="/register">{t('register')}</Link></li>
            <li><Link className="transition hover:text-brand-600" href="/login">{t('login')}</Link></li>
            <li><Link className="transition hover:text-brand-600" href="/dashboard">{t('dashboard')}</Link></li>
            <li><Link className="transition hover:text-brand-600" href="/book">{t('book')}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">{t('contact')}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-gray-500">
            <li><Link className="transition hover:text-brand-600" href="/contact">{t('contactUs')}</Link></li>
            <li>{t('hours')}</li>
            <li>{t('hoursValue')}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-100 py-5">
        <p className="container-page text-center text-xs text-gray-400">
          {t('rights', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}