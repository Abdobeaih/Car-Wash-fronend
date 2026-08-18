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
      <div className="container-page grid gap-6 py-10 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav
            className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:px-0 lg:pb-0"
            aria-label="Admin navigation"
          >
            {links.map((link) => {
              const active =
                link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    active
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                      : 'border border-gray-200 bg-white text-gray-600 shadow-sm hover:border-brand-200 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <NotificationsNavLink
              href="/admin/notifications"
              label={t('notifications')}
              className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                pathname.startsWith('/admin/notifications')
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                  : 'border border-gray-200 bg-white text-gray-600 shadow-sm hover:border-brand-200 hover:text-gray-900'
              }`}
            />
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </RequireRole>
  );
}