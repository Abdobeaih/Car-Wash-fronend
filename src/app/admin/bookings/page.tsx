'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { Booking, BookingStatus } from '@/lib/types';
import Button from '@/components/Button';
import { Select } from '@/components/Input';
import { LoadingState, EmptyState, Alert } from '@/components/States';
import { StatusBadge, formatDate, formatMoney } from '@/components/Badges';
import { bookingLines } from '@/lib/booking-lines';

const statuses: BookingStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export default function AdminBookingsPage() {
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
      setError(err instanceof Error ? err.message : 'Failed to load bookings.');
    }
  }, [statusFilter, search]);

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
      setMessage('Booking status updated.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!bookings) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">Search, filter and update booking statuses.</p>
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
            <label htmlFor="search" className="label">Search</label>
            <input
              id="search"
              className="input"
              placeholder="Customer name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select label="Status" name="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <div className="flex items-end">
            <Button type="submit" variant="secondary">Apply</Button>
          </div>
        </form>
      </div>

      {bookings.length === 0 ? (
        <EmptyState title="No bookings found" description="Try adjusting your search or filters." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Date / Time</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {(b.customerId as { name?: string })?.name ?? 'Customer'}
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
                          ? `${lines[0].service.name} +${lines.length - 1} more`
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
                        View
                      </Link>
                      {b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && (
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={updatingId === b._id}
                          onClick={() => changeStatus(b._id, 'COMPLETED')}
                        >
                          Complete
                        </Button>
                      )}
                      <select
                        className="input w-auto py-1.5 text-xs"
                        value={b.status}
                        disabled={updatingId === b._id}
                        onChange={(e) => changeStatus(b._id, e.target.value as BookingStatus)}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}