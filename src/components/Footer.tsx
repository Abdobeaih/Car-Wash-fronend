import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function Footer() {
  const t = await getTranslations('Footer');
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-gray-900">
            Mobile<span className="text-brand-600">CarCare</span>
          </p>
          <p className="mt-2 text-sm text-gray-500">{t('tagline')}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{t('explore')}</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-500">
            <li><Link className="hover:text-gray-900" href="/services">{t('services')}</Link></li>
            <li><Link className="hover:text-gray-900" href="/how-it-works">{t('howItWorks')}</Link></li>
            <li><Link className="hover:text-gray-900" href="/about">{t('about')}</Link></li>
            <li><Link className="hover:text-gray-900" href="/faq">{t('faq')}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{t('account')}</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-500">
            <li><Link className="hover:text-gray-900" href="/register">{t('register')}</Link></li>
            <li><Link className="hover:text-gray-900" href="/login">{t('login')}</Link></li>
            <li><Link className="hover:text-gray-900" href="/dashboard">{t('dashboard')}</Link></li>
            <li><Link className="hover:text-gray-900" href="/book">{t('book')}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{t('contact')}</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-500">
            <li><Link className="hover:text-gray-900" href="/contact">{t('contactUs')}</Link></li>
            <li>{t('hours')}</li>
            <li>{t('hoursValue')}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200 py-5">
        <p className="container-page text-center text-xs text-gray-400">
          {t('rights', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}