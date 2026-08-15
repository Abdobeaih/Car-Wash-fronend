'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { Notification } from '@/lib/types';
import Button from '@/components/Button';
import { LoadingState, EmptyState, ErrorState, Alert } from '@/components/States';
import { StatusBadge, formatDateTime, formatMoney } from '@/components/Badges';

export default function NotificationsPanel({ basePath }: { basePath?: string }) {
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await apiRequest<Notification[]>('/notifications', { auth: true });
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications.');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markAsRead = async (id: string) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PATCH', auth: true });
      setNotifications((prev) =>
        prev?.map((n) => (n._id === id ? { ...n, read: true } : n)) ?? prev,
      );
    } catch {
      // non-critical — ignore failures to keep UI responsive
    }
  };

  const markAllAsRead = async () => {
    setMessage(null);
    setError(null);
    try {
      await apiRequest('/notifications/read-all', { method: 'PATCH', auth: true });
      setNotifications((prev) => prev?.map((n) => ({ ...n, read: true })) ?? prev);
      setMessage('All notifications marked as read.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notifications.');
    }
  };

  if (error && !notifications) return <ErrorState message={error} onRetry={load} />;
  if (!notifications) return <LoadingState label="Loading notifications…" />;

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            {unread === 0
              ? 'You are all caught up.'
              : `${unread} unread notification${unread === 1 ? '' : 's'}.`}
          </p>
        </div>
        {unread > 0 && (
          <Button type="button" variant="secondary" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {message && <Alert type="success">{message}</Alert>}

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="Updates about your bookings will appear here."
        />
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li key={n._id}>
              <div
                className={`card transition ${n.read ? 'opacity-70' : 'border-brand-300'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {!n.read && <span className="h-2 w-2 rounded-full bg-brand-600" aria-hidden="true" />}
                      <h2 className="font-semibold text-gray-900">{n.title}</h2>
                      {n.data?.status && <StatusBadge status={n.data.status} />}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                    {n.data?.date && n.data.startTime && (
                      <p className="mt-1 text-xs text-gray-500">
                        {n.data.serviceName ?? 'Service'} · {n.data.date} ·{' '}
                        {n.data.startTime}{n.data.endTime ? ` – ${n.data.endTime}` : ''}
                        {n.data.total !== undefined ? ` · ${formatMoney(n.data.total)}` : ''}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">{formatDateTime(n.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {basePath && n.data?.bookingId && (
                      <Link
                        href={`${basePath}/${n.data.bookingId}`}
                        className="text-sm font-medium text-brand-600 hover:text-brand-700"
                        onClick={() => void markAsRead(n._id)}
                      >
                        View booking
                      </Link>
                    )}
                    {!n.read && (
                      <Button type="button" variant="secondary" onClick={() => void markAsRead(n._id)}>
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}