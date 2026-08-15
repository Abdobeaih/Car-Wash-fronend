'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { Booking } from '@/lib/types';
import { LoadingState, EmptyState, ErrorState } from '@/components/States';
import { StatusBadge, formatDate, formatMoney } from '@/components/Badges';
import { bookingLines } from '@/lib/booking-lines';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await apiRequest<Booking[]>('/bookings', { auth: true });
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings.');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!bookings) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <Link href="/book" className="btn-primary">
          Book a service
        </Link>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="Book your first mobile car care service to get started."
          action={
            <Link href="/book" className="btn-primary">
              Book a service
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
                          ? `${lines[0].service.name} +${lines.length - 1} more`
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