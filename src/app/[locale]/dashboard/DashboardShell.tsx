'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { RequireRole } from '@/components/RouteGuard';
import NotificationsNavLink from '@/components/NotificationsNavLink';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations('DashboardShell');

  const links = [
    { href: '/dashboard', label: t('overview') },
    { href: '/dashboard/profile', label: t('profile') },
    { href: '/dashboard/vehicles', label: t('vehicles') },
    { href: '/dashboard/bookings', label: t('bookings') },
  ];

  const activeClass = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <RequireRole role="CUSTOMER">
      <div className="container-page flex flex-col gap-6 py-10 lg:grid lg:grid-cols-[220px_1fr]">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <nav
            className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:rounded-lg lg:bg-black lg:px-2 lg:py-2 lg:pb-2"
            aria-label={t('nav')}
          >
            {links.map((link, i) => {
              const active = activeClass(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex shrink-0 items-center gap-2.5 rounded-md px-3.5 py-2.5 text-sm font-medium transition ${
                    active
                      ? 'bg-brand-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 lg:bg-transparent lg:text-gray-400 lg:hover:bg-white/5 lg:hover:text-white'
                  }`}
                >
                  <span
                    className={`hidden font-display text-[11px] font-semibold lg:inline ${
                      active ? 'text-white/70' : 'text-gray-600'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {link.label}
                </Link>
              );
            })}
            <NotificationsNavLink
              href="/dashboard/notifications"
              label={t('notifications')}
              className={`flex shrink-0 items-center gap-2.5 rounded-md px-3.5 py-2.5 text-sm font-medium transition ${
                activeClass('/dashboard/notifications')
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 lg:bg-transparent lg:text-gray-400 lg:hover:bg-white/5 lg:hover:text-white'
              }`}
            />
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </RequireRole>
  );
}