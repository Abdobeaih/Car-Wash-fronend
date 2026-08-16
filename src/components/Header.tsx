'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Header() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Header');
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleLogout = async () => {
    close();
    await logout();
    router.push('/');
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const navLinks = [
    { href: '/services', key: 'services' },
    { href: '/how-it-works', key: 'howItWorks' },
    { href: '/about', key: 'about' },
    { href: '/contact', key: 'contact' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={close}>
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
          <span className="whitespace-nowrap text-base font-bold text-gray-900 sm:text-lg">
            Mobile<span className="text-brand-600">CarCare</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={t('mainNav')}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive(link.href) ? 'bg-gray-100 text-brand-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          {loading ? (
            <span className="px-3 py-2 text-sm text-gray-400">{t('loading')}</span>
          ) : user ? (
            <>
              <Link
                href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                {t('dashboard')}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                {t('login')}
              </Link>
              <Link href="/register" className="btn-primary">
                {t('register')}
              </Link>
            </>
          )}
          <Link href="/book" className="btn-primary ms-1">
            {t('book')}
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
          aria-label={open ? t('closeMenu') : t('openMenu')}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-gray-200 bg-white px-4 pb-4 pt-2 lg:hidden" aria-label={t('mobileNav')}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                isActive(link.href) ? 'bg-gray-100 text-brand-700' : 'text-gray-700'
              }`}
            >
              {t(link.key)}
            </Link>
          ))}
          <div className="mt-2 border-t border-gray-100 pt-2">
            {!loading && user ? (
              <>
                <Link
                  href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  onClick={close}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700"
                >
                  {t('dashboard')}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-3 py-2.5 text-start text-sm font-medium text-gray-700"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              !loading && (
                <>
                  <Link
                    href="/login"
                    onClick={close}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href="/register"
                    onClick={close}
                    className="mt-1 block rounded-lg px-3 py-2.5 text-center text-sm font-medium text-brand-700 hover:bg-gray-50"
                  >
                    {t('register')}
                  </Link>
                </>
              )
            )}
            <LanguageSwitcher className="mt-1 block text-center" />
            <Link href="/book" onClick={close} className="btn-primary mt-2 w-full">
              {t('book')}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}