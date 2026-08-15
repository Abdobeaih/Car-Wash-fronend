'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import type { Booking, BookingStatus } from '@/lib/types';
import Button from '@/components/Button';
import { LoadingState, ErrorState, Alert } from '@/components/States';
import { StatusBadge, formatDate, formatDateTime, formatMoney } from '@/components/Badges';
import { bookingLines } from '@/lib/booking-lines';

export default function AdminBookingDetailPage() {
  const params = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [updating, setUpdating] = useState<BookingStatus | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await apiRequest<Booking>(`/admin/bookings/${params.id}`, { auth: true });
      setBooking(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking.');
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeStatus = async (status: BookingStatus) => {
    if (!booking) return;
    setUpdating(status);
    setStatusError(null);
    setMessage(null);
    try {
      const updated = await apiRequest<Booking>(`/admin/bookings/${booking._id}/status`, {
        method: 'PATCH',
        body: { status },
        auth: true,
      });
      setBooking(updated);
      setMessage(`Booking marked as ${status}. The customer has been notified.`);
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Failed to update booking status.');
    } finally {
      setUpdating(null);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!booking) return <LoadingState />;

  const customer = booking.customerId as { name?: string; email?: string };
  const vehicle = booking.vehicleId as { brand?: string; model?: string; plateNumber?: string };
  const lines = bookingLines(booking);

  const canComplete = booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED';
  const canConfirm = booking.status === 'PENDING';
  const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';

  return (
    <div className="space-y-6">
      <Link href="/admin/bookings" className="text-sm font-medium text-brand-600 hover:text-brand-700">
        ← Back to bookings
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Booking {booking._id}</h1>
        <StatusBadge status={booking.status} />
      </div>

      {message && <Alert type="success">{message}</Alert>}
      {statusError && <Alert type="error">{statusError}</Alert>}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card space-y-4 text-sm">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</h2>
            <p className="mt-1 font-semibold text-gray-900">{customer.name}</p>
            <p className="text-gray-500">{customer.email}</p>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Services</h2>
            <ul className="mt-1 space-y-2">
              {lines.map((l, i) => (
                <li key={i}>
                  <p className="mt-1 font-semibold text-gray-900">{l.service.name}</p>
                  <p className="text-gray-500">
                    {l.addOns.length > 0 ? l.addOns.map((a) => a.name).join(', ') : 'No extras'} ·{' '}
                    {l.duration ?? booking.duration} minutes
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Vehicle</h2>
            <p className="mt-1 font-semibold text-gray-900">{vehicle.brand} {vehicle.model}</p>
            <p className="text-gray-500">{vehicle.plateNumber}</p>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Schedule</h2>
            <p className="mt-1 font-semibold text-gray-900">{formatDate(booking.date)}</p>
            <p className="text-gray-500">{booking.startTime} – {booking.endTime}</p>
          </div>
        </section>

        <section className="card space-y-4 text-sm">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Location</h2>
            <p className="mt-1 font-semibold text-gray-900">{booking.location.address}</p>
            <p className="text-gray-500">{booking.location.city}, {booking.location.country}</p>
            {booking.location.notes && <p className="mt-1 text-gray-500">Notes: {booking.location.notes}</p>}
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Add-ons</h2>
            {lines.every((l) => l.addOns.length === 0) ? (
              <p className="mt-1 text-gray-500">None</p>
            ) : (
              <ul className="mt-1 space-y-1">
                {lines.flatMap((l) =>
                  l.addOns.map((a, i) => (
                    <li key={`${l.service.name}-${i}`} className="flex justify-between">
                      <span>{a.name}</span>
                      <span className="font-medium">{formatMoney(a.price ?? 0)}</span>
                    </li>
                  )),
                )}
              </ul>
            )}
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-3">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-brand-600">{formatMoney(booking.total)}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
            <div>
              <p className="text-gray-500">Payment</p>
              <p className="font-medium text-gray-900">{booking.paymentStatus}</p>
            </div>
            <div>
              <p className="text-gray-500">Created</p>
              <p className="font-medium text-gray-900">{formatDateTime(booking.createdAt)}</p>
            </div>
          </div>
        </section>
      </div>

      <section className="card">
        <h2 className="font-semibold text-gray-900">Update status</h2>
        <p className="mt-1 text-sm text-gray-500">
          Changes are saved immediately and the customer is notified with the appointment details.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {canConfirm && (
            <Button
              type="button"
              onClick={() => changeStatus('CONFIRMED')}
              loading={updating === 'CONFIRMED'}
              disabled={updating !== null}
            >
              Mark as Confirmed
            </Button>
          )}
          {canComplete && (
            <Button
              type="button"
              onClick={() => changeStatus('COMPLETED')}
              loading={updating === 'COMPLETED'}
              disabled={updating !== null}
            >
              Mark as Complete
            </Button>
          )}
          {canCancel && (
            <Button
              type="button"
              variant="danger"
              onClick={() => changeStatus('CANCELLED')}
              loading={updating === 'CANCELLED'}
              disabled={updating !== null}
            >
              Mark as Cancelled
            </Button>
          )}
          {(booking.status === 'COMPLETED' || booking.status === 'CANCELLED') && (
            <p className="text-sm text-gray-500">
              This booking is {booking.status.toLowerCase()} — no further status changes available.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}