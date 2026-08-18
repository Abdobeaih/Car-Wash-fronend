'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import type { Booking } from '@/lib/types';
import Button from '@/components/Button';
import { LoadingState, ErrorState, Alert } from '@/components/States';
import { StatusBadge } from '@/components/Badges';
import { useDate, useDateTime, useMoney } from '@/lib/format';
import { bookingLines } from '@/lib/booking-lines';

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations('BookingDetail');
  const tc = useTranslations('Common');
  const formatDate = useDate();
  const formatDateTime = useDateTime();
  const formatMoney = useMoney();
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
      setError(err instanceof Error ? err.message : t('loadFailed'));
    }
  }, [params.id, t]);

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
      setMessage(t('cancelled'));
      setConfirming(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('cancelFailed'));
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push('/dashboard/bookings')}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          {t('back')}
        </button>
        <StatusBadge status={booking.status} />
      </div>

      <h1 className="break-all text-2xl font-bold text-gray-900">{t('title', { id: booking._id })}</h1>

      {message && <Alert type="success">{message}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t('services')}</h2>
            <ul className="mt-1 space-y-2">
              {lines.map((l, i) => (
                <li key={i}>
                  <p className="font-semibold text-gray-900">{l.service.name}</p>
                  <p className="text-sm text-gray-500">
                    {l.addOns.length > 0 ? l.addOns.map((a) => a.name).join(', ') : tc('noExtras')} ·{' '}
                    {tc('minutes', { value: l.duration ?? booking.duration })}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t('vehicle')}</h2>
            <p className="mt-1 font-semibold text-gray-900">
              {vehicle.brand} {vehicle.model}
            </p>
            <p className="text-sm text-gray-500">{vehicle.plateNumber}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t('schedule')}</h2>
            <p className="mt-1 font-semibold text-gray-900">{formatDate(booking.date)}</p>
            <p className="text-sm text-gray-500">
              {booking.startTime} – {booking.endTime}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t('location')}</h2>
            <p className="mt-1 font-semibold text-gray-900">
              {booking.location.address}
            </p>
            <p className="text-sm text-gray-500">
              {booking.location.city}, {booking.location.country}
            </p>
            {booking.location.notes && (
              <p className="mt-1 text-sm text-gray-500">{t('notes', { notes: booking.location.notes })}</p>
            )}
          </div>
        </section>

        <section className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('summary')}</h2>
          <div className="space-y-2 text-sm">
            {lines.map((l, i) => (
              <div key={i}>
                <div className="flex justify-between">
                  <span className="text-gray-500">{l.service.name}</span>
                  <span className="font-medium text-gray-900">{formatMoney(l.subtotal ?? 0)}</span>
                </div>
                {l.addOns.map((a, j) => (
                  <div key={j} className="flex justify-between ps-3">
                    <span className="text-gray-500">{a.name}</span>
                    <span className="font-medium text-gray-900">{formatMoney(a.price ?? 0)}</span>
                  </div>
                ))}
              </div>
            ))}
            <div className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
              <span className="font-semibold text-gray-900">{t('total')}</span>
              <span className="text-lg font-bold text-brand-700">{formatMoney(booking.total)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-sm">
            <div className="min-w-0">
              <p className="text-gray-500">{t('payment')}</p>
              <p className="break-words font-medium text-gray-900">{booking.paymentStatus}</p>
            </div>
            <div className="min-w-0">
              <p className="text-gray-500">{t('created')}</p>
              <p className="break-words font-medium text-gray-900">{formatDateTime(booking.createdAt)}</p>
            </div>
          </div>

          {cancellable && (
            <div className="border-t border-gray-100 pt-4">
              {confirming ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                  <span className="text-sm font-medium text-red-700">{t('cancelPrompt')}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="danger" onClick={handleCancel} loading={cancelling}>
                      {t('confirm')}
                    </Button>
                    <Button variant="secondary" onClick={() => setConfirming(false)}>
                      {t('keepIt')}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="danger" onClick={() => setConfirming(true)}>
                  {t('cancelBooking')}
                </Button>
              )}
            </div>
          )}

          {!cancellable && booking.status === 'CANCELLED' && (
            <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">
              {t('cancelledNote')}
            </p>
          )}
        </section>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => router.push('/dashboard/bookings')}>
          {t('allBookings')}
        </Button>
        <Button variant="secondary" onClick={() => router.push('/book')}>
          {t('bookAnother')}
        </Button>
      </div>
    </div>
  );
}