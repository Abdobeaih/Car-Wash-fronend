'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import type { Booking } from '@/lib/types';
import Button from '@/components/Button';
import { LoadingState, ErrorState, Alert } from '@/components/States';
import { StatusBadge, formatDate, formatDateTime, formatMoney } from '@/components/Badges';
import { bookingLines } from '@/lib/booking-lines';

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await apiRequest<Booking>(`/bookings/${params.id}`, { auth: true });
      setBooking(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking.');
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCancel = async () => {
    if (!booking) return;
    setCancelling(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await apiRequest<Booking>(`/bookings/${booking._id}/cancel`, {
        method: 'POST',
        auth: true,
      });
      setBooking(updated);
      setMessage('Booking cancelled.');
      setConfirming(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  if (error && !booking) return <ErrorState message={error} onRetry={load} />;
  if (!booking) return <LoadingState />;

  const vehicle = booking.vehicleId as { brand?: string; model?: string; plateNumber?: string };
  const lines = bookingLines(booking);
  const cancellable = booking.status === 'PENDING' || booking.status === 'CONFIRMED';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard/bookings" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          ← Back to bookings
        </Link>
        <StatusBadge status={booking.status} />
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Booking {booking._id}</h1>

      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Services</h2>
            <ul className="mt-1 space-y-2">
              {lines.map((l, i) => (
                <li key={i}>
                  <p className="font-semibold text-gray-900">{l.service.name}</p>
                  <p className="text-sm text-gray-500">
                    {l.addOns.length > 0 ? l.addOns.map((a) => a.name).join(', ') : 'No extras'} ·{' '}
                    {l.duration ?? booking.duration} minutes
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Vehicle</h2>
            <p className="mt-1 font-semibold text-gray-900">
              {vehicle.brand} {vehicle.model}
            </p>
            <p className="text-sm text-gray-500">{vehicle.plateNumber}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Schedule</h2>
            <p className="mt-1 font-semibold text-gray-900">{formatDate(booking.date)}</p>
            <p className="text-sm text-gray-500">
              {booking.startTime} – {booking.endTime}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Location</h2>
            <p className="mt-1 font-semibold text-gray-900">
              {booking.location.address}
            </p>
            <p className="text-sm text-gray-500">
              {booking.location.city}, {booking.location.country}
            </p>
            {booking.location.notes && (
              <p className="mt-1 text-sm text-gray-500">Notes: {booking.location.notes}</p>
            )}
          </div>
        </section>

        <section className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
          <div className="space-y-2 text-sm">
            {lines.map((l, i) => (
              <div key={i}>
                <div className="flex justify-between">
                  <span className="text-gray-500">{l.service.name}</span>
                  <span className="font-medium text-gray-900">{formatMoney(l.subtotal ?? 0)}</span>
                </div>
                {l.addOns.map((a, j) => (
                  <div key={j} className="flex justify-between pl-3">
                    <span className="text-gray-500">{a.name}</span>
                    <span className="font-medium text-gray-900">{formatMoney(a.price ?? 0)}</span>
                  </div>
                ))}
              </div>
            ))}
            <div className="flex justify-between border-t border-gray-100 pt-3">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-brand-600">{formatMoney(booking.total)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-sm">
            <div>
              <p className="text-gray-500">Payment</p>
              <p className="font-medium text-gray-900">{booking.paymentStatus}</p>
            </div>
            <div>
              <p className="text-gray-500">Created</p>
              <p className="font-medium text-gray-900">{formatDateTime(booking.createdAt)}</p>
            </div>
          </div>

          {cancellable && (
            <div className="border-t border-gray-100 pt-4">
              {confirming ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Cancel this booking?</span>
                  <Button variant="danger" onClick={handleCancel} loading={cancelling}>
                    Confirm
                  </Button>
                  <Button variant="secondary" onClick={() => setConfirming(false)}>
                    Keep it
                  </Button>
                </div>
              ) : (
                <Button variant="danger" onClick={() => setConfirming(true)}>
                  Cancel booking
                </Button>
              )}
            </div>
          )}

          {!cancellable && booking.status === 'CANCELLED' && (
            <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">
              This booking has been cancelled.
            </p>
          )}
        </section>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => router.push('/dashboard/bookings')}>
          All bookings
        </Button>
        <Button variant="secondary" onClick={() => router.push('/book')}>
          Book another service
        </Button>
      </div>
    </div>
  );
}