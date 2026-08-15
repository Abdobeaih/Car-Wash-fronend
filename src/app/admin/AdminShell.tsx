'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RequireRole } from '@/components/RouteGuard';
import NotificationsNavLink from '@/components/NotificationsNavLink';

const links = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/services', label: 'Services', icon: 'services' },
  { href: '/admin/add-ons', label: 'Add-ons', icon: 'addons' },
  { href: '/admin/bookings', label: 'Bookings', icon: 'bookings' },
  { href: '/admin/messages', label: 'Messages', icon: 'messages' },
  { href: '/admin/customers', label: 'Customers', icon: 'customers' },
  { href: '/admin/calendar', label: 'Calendar', icon: 'calendar' },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <RequireRole role="ADMIN">
      <div className="min-h-[70vh] bg-gray-100">
        <div className="container-page grid gap-6 py-8 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Admin navigation">
              {links.map((link) => {
                const active =
                  link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
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
              label="Notifications"
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