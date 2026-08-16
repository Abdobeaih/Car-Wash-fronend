'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { Booking } from '@/lib/types';
import { LoadingState, EmptyState, ErrorState } from '@/components/States';
import { StatusBadge } from '@/components/Badges';
import { useDate, useMoney } from '@/lib/format';
import { bookingLines } from '@/lib/booking-lines';

export default function BookingsPage() {
  const t = useTranslations('Bookings');
  const formatDate = useDate();
  const formatMoney = useMoney();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await apiRequest<Booking[]>('/bookings', { auth: true });
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loadFailed'));
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!bookings) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <Link href="/book" className="btn-primary whitespace-nowrap">
          {t('book')}
        </Link>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title={t('emptyTitle')}
          description={t('emptyDescription')}
          action={
            <Link href="/book" className="btn-primary">
              {t('book')}
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b._id}>
              <Link
                href={`/dashboard/bookings/${b._id}`}
                className="card block transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {(() => {
                        const lines = bookingLines(b);
                        return lines.length > 1
                          ? `${lines[0].service.name} ${t('more', { count: lines.length - 1 })}`
                          : lines[0].service.name;
                      })()}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatDate(b.date)} · {b.startTime} – {b.endTime} ·{' '}
                      {b.location.city}, {b.location.country}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">{formatMoney(b.total)}</span>
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}