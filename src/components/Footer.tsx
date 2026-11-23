import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import LogoMark from '@/components/LogoMark';

export default async function Footer() {
  const t = await getTranslations('Footer');
  return (
    <footer className="border-t border-gray-800 bg-black text-gray-400">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="flex items-center gap-2.5 font-display text-lg font-semibold text-white">
            <LogoMark size={36} className="shrink-0" />
            Mobile <span className="text-brand-500">CarCare</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-400">{t('tagline')}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-aqua-400">{t('explore')}</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="transition hover:text-brand-400" href="/services">{t('services')}</Link></li>
            <li><Link className="transition hover:text-brand-400" href="/how-it-works">{t('howItWorks')}</Link></li>
            <li><Link className="transition hover:text-brand-400" href="/about">{t('about')}</Link></li>
            <li><Link className="transition hover:text-brand-400" href="/faq">{t('faq')}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-aqua-400">{t('account')}</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="transition hover:text-brand-400" href="/register">{t('register')}</Link></li>
            <li><Link className="transition hover:text-brand-400" href="/login">{t('login')}</Link></li>
            <li><Link className="transition hover:text-brand-400" href="/dashboard">{t('dashboard')}</Link></li>
            <li><Link className="transition hover:text-brand-400" href="/book">{t('book')}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-aqua-400">{t('contact')}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-gray-400">
            <li><Link className="transition hover:text-brand-400" href="/contact">{t('contactUs')}</Link></li>
            <li>{t('hours')}</li>
            <li className="font-display text-sm text-gray-300">{t('hoursValue')}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-6">
        <p className="container-page text-center text-xs text-gray-600">
          {t('rights', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}