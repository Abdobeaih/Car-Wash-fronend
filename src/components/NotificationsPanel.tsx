'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { Notification } from '@/lib/types';
import Button from '@/components/Button';
import { LoadingState, EmptyState, ErrorState, Alert } from '@/components/States';
import { StatusBadge } from '@/components/Badges';
import { useDateTime, useMoney } from '@/lib/format';

export default function NotificationsPanel({ basePath }: { basePath?: string }) {
  const t = useTranslations('NotificationsPanel');
  const formatDateTime = useDateTime();
  const formatMoney = useMoney();
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await apiRequest<Notification[]>('/notifications', { auth: true });
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loadFailed'));
    }
  }, [t]);

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
      setMessage(t('markAllDone'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('updateFailed'));
    }
  };

  if (error && !notifications) return <ErrorState message={error} onRetry={load} />;
  if (!notifications) return <LoadingState label={t('title')} />;

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {unread === 0 ? t('allCaughtUp') : t('unread', { count: unread })}
          </p>
        </div>
        {unread > 0 && (
          <Button type="button" variant="secondary" onClick={markAllAsRead}>
            {t('markAll')}
          </Button>
        )}
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {message && <Alert type="success">{message}</Alert>}

      {notifications.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li key={n._id}>
              <div
                className={`card p-5 transition ${
                  n.read
                    ? 'opacity-75'
                    : 'border-s-4 border-s-brand-500 shadow-md shadow-brand-600/5'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {!n.read && <span className="h-2 w-2 rounded-full bg-brand-600" aria-hidden="true" />}
                      <h2 className="font-semibold text-gray-900">{n.title}</h2>
                      {n.data?.status && <StatusBadge status={n.data.status} />}
                    </div>
                    <p className="mt-1.5 text-sm text-gray-600">{n.message}</p>
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
                        {t('viewBooking')}
                      </Link>
                    )}
                    {!n.read && (
                      <Button type="button" variant="secondary" onClick={() => void markAsRead(n._id)}>
                        {t('markRead')}
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