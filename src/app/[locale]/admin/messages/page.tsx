'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/api';
import type { ContactMessage } from '@/lib/types';
import Button from '@/components/Button';
import { LoadingState, EmptyState, ErrorState } from '@/components/States';
import { useDateTime } from '@/lib/format';

export default function AdminMessagesPage() {
  const t = useTranslations('AdminMessages');
  const formatDateTime = useDateTime();
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await apiRequest<ContactMessage[]>('/admin/messages', { auth: true });
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loadFailed'));
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const markAsRead = async (id: string) => {
    try {
      const updated = await apiRequest<ContactMessage>(`/admin/messages/${id}/read`, {
        method: 'PATCH',
        auth: true,
      });
      setMessages((prev) =>
        prev ? prev.map((m) => (m._id === id ? updated : m)) : prev,
      );
    } catch {
      // ignore — read state stays as-is
    }
  };

  if (!messages) return <LoadingState />;

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t('subtitle')}
          {unread > 0 && ` · ${t('unread', { count: unread })}`}
        </p>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {messages.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m._id} className={`card transition ${m.read ? '' : 'border-s-4 border-s-brand-500 shadow-md shadow-brand-600/5'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                  <h2 className="font-semibold text-gray-900">{m.name}</h2>
                  <a href={`mailto:${m.email}`} className="min-w-0 break-all text-sm text-blue-600 hover:underline">
                    {m.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  {!m.read ? (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {t('unreadBadge')}
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                      {t('readBadge')}
                    </span>
                  )}
                  <span className="text-sm text-gray-500">{m.createdAt ? formatDateTime(m.createdAt) : ''}</span>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{m.message}</p>
              {!m.read && (
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => void markAsRead(m._id)}
                >
                  {t('markRead')}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}