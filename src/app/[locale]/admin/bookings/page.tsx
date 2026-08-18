'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { Booking, BookingStatus } from '@/lib/types';
import Button from '@/components/Button';
import { Select } from '@/components/Input';
import { LoadingState, EmptyState, Alert } from '@/components/States';
import { StatusBadge } from '@/components/Badges';
import { useDate, useMoney } from '@/lib/format';
import { bookingLines } from '@/lib/booking-lines';

const statuses: BookingStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export default function AdminBookingsPage() {
  const t = useTranslations('AdminBookings');
  const ts = useTranslations('Status');
  const formatDate = useDate();
  const formatMoney = useMoney();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      const qs = params.toString();
      const data = await apiRequest<Booking[]>(`/admin/bookings${qs ? `?${qs}` : ''}`, { auth: true });
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loadFailed'));
    }
  }, [statusFilter, search, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeStatus = async (id: string, status: BookingStatus) => {
    setUpdatingId(id);
    setMessage(null);
    setError(null);
    try {
      await apiRequest(`/admin/bookings/${id}/status`, {
        method: 'PATCH',
        body: { status },
        auth: true,
      });
      setMessage(t('statusUpdated'));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('updateFailed'));
    } finally {
      setUpdatingId(null);
    }
  };

  if (!bookings) return <LoadingState />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('subtitle')}</p>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {message && <Alert type="success">{message}</Alert>}

      <div className="card">
        <form
          className="grid gap-4 sm:grid-cols-[1fr_200px_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            void load();
          }}
        >
          <div>
            <label htmlFor="search" className="label">{t('search')}</label>
            <input
              id="search"
              className="input"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select label={t('status')} name="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">{t('all')}</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{ts(s)}</option>
            ))}
          </Select>
          <div className="flex items-end">
            <Button type="submit" variant="secondary">{t('apply')}</Button>
          </div>
        </form>
      </div>

      {bookings.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {bookings.map((b) => (
              <li key={b._id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">
                      {(b.customerId as { name?: string })?.name ?? t('customer')}
                    </p>
                    <p className="break-all text-xs text-gray-500">
                      {(b.customerId as { email?: string })?.email}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="font-medium text-gray-900">
                    {(() => {
                      const lines = bookingLines(b);
                      return lines.length > 1
                        ? `${lines[0].service.name} ${t('more', { count: lines.length - 1 })}`
                        : lines[0].service.name;
                    })()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(b.vehicleId as { brand?: string; model?: string })?.brand}{' '}
                    {(b.vehicleId as { model?: string })?.model}
                  </p>
                  <p className="text-gray-600">
                    {formatDate(b.date)} · {b.startTime}
                  </p>
                  <p className="font-semibold text-gray-900">{formatMoney(b.total)}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/bookings/${b._id}`}
                    className="btn-secondary btn-sm"
                  >
                    {t('view')}
                  </Link>
                  {b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={updatingId === b._id}
                      onClick={() => changeStatus(b._id, 'COMPLETED')}
                    >
                      {t('complete')}
                    </Button>
                  )}
                  <select
                    className="input w-auto py-1.5 text-xs"
                    value={b.status}
                    disabled={updatingId === b._id}
                    onChange={(e) => changeStatus(b._id, e.target.value as BookingStatus)}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>{ts(s)}</option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>
          <div className="card hidden overflow-x-auto p-0 md:block">
            <table className="w-full min-w-[860px] text-start text-sm">
              <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th scope="col" className="px-4 py-3">{t('customer')}</th>
                  <th scope="col" className="px-4 py-3">{t('service')}</th>
                  <th scope="col" className="px-4 py-3">{t('dateTime')}</th>
                  <th scope="col" className="px-4 py-3">{t('total')}</th>
                  <th scope="col" className="px-4 py-3">{t('statusLabel')}</th>
                  <th scope="col" className="px-4 py-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => (
                  <tr key={b._id} className="transition hover:bg-gray-50/70">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {(b.customerId as { name?: string })?.name ?? t('customer')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(b.customerId as { email?: string })?.email}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {(() => {
                          const lines = bookingLines(b);
                          return lines.length > 1
                            ? `${lines[0].service.name} ${t('more', { count: lines.length - 1 })}`
                            : lines[0].service.name;
                        })()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(b.vehicleId as { brand?: string; model?: string })?.brand}{' '}
                        {(b.vehicleId as { model?: string })?.model}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(b.date)} · {b.startTime}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatMoney(b.total)}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/bookings/${b._id}`}
                          className="text-sm font-medium text-brand-600 hover:text-brand-700"
                        >
                          {t('view')}
                        </Link>
                        {b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && (
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={updatingId === b._id}
                            onClick={() => changeStatus(b._id, 'COMPLETED')}
                          >
                            {t('complete')}
                          </Button>
                        )}
                        <select
                          className="input w-auto py-1.5 text-xs"
                          value={b.status}
                          disabled={updatingId === b._id}
                          onChange={(e) => changeStatus(b._id, e.target.value as BookingStatus)}
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>{ts(s)}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}