'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { Booking, Vehicle } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { LoadingState, EmptyState, ErrorState } from '@/components/States';
import { StatusBadge, RoleBadge } from '@/components/Badges';
import { useDate, useMoney } from '@/lib/format';

export default function DashboardPage() {
  const { user } = useAuth();
  const t = useTranslations('Dashboard');
  const tc = useTranslations('Common');
  const formatDate = useDate();
  const formatMoney = useMoney();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [b, v] = await Promise.all([
        apiRequest<Booking[]>('/bookings', { auth: true }),
        apiRequest<Vehicle[]>('/vehicles', { auth: true }),
      ]);
      setBookings(b);
      setVehicles(v);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedLoad'));
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!bookings || !vehicles) return <LoadingState />;

  const upcoming = bookings.find((b) => b.status === 'PENDING' || b.status === 'CONFIRMED');
  const recent = bookings.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-title break-words text-2xl text-gray-900 sm:text-3xl">
          {t('welcome', { name: user?.name?.split(' ')[0] ?? '' })}
        </h1>
        <p className="break-words mt-2 text-sm text-gray-500">{t('subtitle')}</p>
      </div>

      <section className="card flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-start">
        <div className="flex min-w-0 flex-col items-center gap-4 sm:flex-row">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-black font-display text-2xl font-semibold text-brand-500">
            {(user?.name?.[0] ?? 'U').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="break-words font-semibold text-gray-900">{user?.name}</p>
            <p className="break-words text-sm text-gray-500">{user?.email}</p>
            <div className="mt-2 flex items-center justify-center gap-3 sm:justify-start">
              <RoleBadge role={user?.role ?? 'CUSTOMER'} />
            </div>
          </div>
        </div>
        <Link href="/dashboard/profile" className="btn-secondary shrink-0">
          {t('editProfile')}
        </Link>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="display-title text-lg text-gray-900">{t('upcoming')}</h2>
            <Link href="/book" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              {t('bookService')}
            </Link>
          </div>
          {upcoming ? (
            <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:text-start">
              <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border border-gray-800 bg-black text-white">
                <span className="text-[11px] font-semibold uppercase text-brand-400">
                  {new Date(`${upcoming.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short' })}
                </span>
                <span className="mt-0.5 font-display text-xl font-semibold leading-none">
                  {new Date(`${upcoming.date}T00:00:00`).getDate()}
                </span>
              </div>
              <div className="flex-1">
                <StatusBadge status={upcoming.status} />
                <h3 className="mt-1.5 font-medium text-gray-900">
                  {(upcoming.serviceId as { name?: string })?.name ?? tc('service')}
                </h3>
                <p className="mt-1.5 text-sm text-gray-600">
                  {formatDate(upcoming.date)} · {upcoming.startTime} – {upcoming.endTime}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {formatMoney(upcoming.total)} · {upcoming.location.city}
                </p>
                <Link
                  href={`/dashboard/bookings/${upcoming._id}`}
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  {t('viewDetails')}
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-lg bg-gray-100 p-5 text-center">
              <p className="text-sm text-gray-600">{t('noUpcoming')}</p>
              <Link href="/book" className="btn-primary mt-3">
                {t('bookFirst')}
              </Link>
            </div>
          )}
        </section>

        <section className="card p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="display-title text-lg text-gray-900">{t('myVehicles')}</h2>
            <Link href="/dashboard/vehicles" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              {t('manage')}
            </Link>
          </div>
          {vehicles.length === 0 ? (
            <div className="mt-4 rounded-lg bg-gray-100 p-5 text-center">
              <p className="text-sm text-gray-600">{t('noVehicles')}</p>
              <Link href="/dashboard/vehicles" className="btn-secondary mt-3">
                {t('addVehicle')}
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-gray-200">
              {vehicles.slice(0, 3).map((v) => (
                <li key={v._id} className="flex items-center gap-3 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 text-gray-600">
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
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">
                      {v.brand} {v.model}
                    </p>
                    <p className="text-sm text-gray-500">
                      {v.year} · {v.color} · {v.plateNumber}
                    </p>
                  </div>
                  <span className="badge shrink-0 border border-gray-200 bg-gray-50 text-gray-600">{v.vehicleType}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="display-title text-lg text-gray-900">{t('recentBookings')}</h2>
          <Link href="/dashboard/bookings" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            {t('viewAll')}
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState title={t('noBookings')} description={t('noBookingsDesc')} />
        ) : (
          <ul className="mt-4 divide-y divide-gray-200">
            {recent.map((b) => (
              <li key={b._id}>
                <Link
                  href={`/dashboard/bookings/${b._id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg py-3 transition hover:bg-gray-100"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">
                      {(b.serviceId as { name?: string })?.name ?? tc('service')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(b.date)} · {b.startTime}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">{formatMoney(b.total)}</span>
                    <StatusBadge status={b.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}