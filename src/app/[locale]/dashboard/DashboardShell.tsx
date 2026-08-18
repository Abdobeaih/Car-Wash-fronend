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

  return (
    <RequireRole role="CUSTOMER">
      <div className="container-page flex flex-col gap-6 py-10 lg:grid lg:grid-cols-[220px_1fr]">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <nav
            className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:px-0 lg:pb-0"
            aria-label={t('nav')}
          >
            {links.map((link) => {
              const active =
                link.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium ${
                    active
                      ? 'bg-brand-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <NotificationsNavLink
              href="/dashboard/notifications"
              label={t('notifications')}
              className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium ${
                pathname.startsWith('/dashboard/notifications')
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            />
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </RequireRole>
  );
}