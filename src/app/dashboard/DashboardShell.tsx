'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RequireRole } from '@/components/RouteGuard';
import NotificationsNavLink from '@/components/NotificationsNavLink';

const links = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/profile', label: 'My Profile' },
  { href: '/dashboard/vehicles', label: 'My Vehicles' },
  { href: '/dashboard/bookings', label: 'My Bookings' },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <RequireRole role="CUSTOMER">
      <div className="container-page grid gap-6 py-10 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Dashboard navigation">
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
              label="Notifications"
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