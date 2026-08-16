'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { RequireRole } from '@/components/RouteGuard';
import NotificationsNavLink from '@/components/NotificationsNavLink';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations('AdminShell');

  const links = [
    { href: '/admin', label: t('dashboard'), key: 'dashboard' },
    { href: '/admin/services', label: t('services'), key: 'services' },
    { href: '/admin/add-ons', label: t('addOns'), key: 'addOns' },
    { href: '/admin/bookings', label: t('bookings'), key: 'bookings' },
    { href: '/admin/messages', label: t('messages'), key: 'messages' },
    { href: '/admin/customers', label: t('customers'), key: 'customers' },
    { href: '/admin/calendar', label: t('calendar'), key: 'calendar' },
  ];

  return (
    <RequireRole role="ADMIN">
      <div className="min-h-[70vh] bg-gray-100">
        <div className="container-page grid gap-6 py-8 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col" aria-label="Admin navigation">
              {links.map((link) => {
                const active =
                  link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.key}
                    href={link.href}
                    className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium ${
                      active
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <NotificationsNavLink
                href="/admin/notifications"
                label={t('notifications')}
                className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium ${
                  pathname.startsWith('/admin/notifications')
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              />
            </nav>
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </RequireRole>
  );
}