'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/api';
import type { AdminCustomer } from '@/lib/types';
import Button from '@/components/Button';
import { LoadingState, EmptyState, ErrorState } from '@/components/States';
import { RoleBadge } from '@/components/Badges';
import { useDateTime } from '@/lib/format';

export default function AdminCustomersPage() {
  const t = useTranslations('AdminCustomers');
  const formatDateTime = useDateTime();
  const [customers, setCustomers] = useState<AdminCustomer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try {
      const params = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const data = await apiRequest<AdminCustomer[]>(`/admin/customers${params}`, { auth: true });
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loadFailed'));
    }
  }, [search, t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!customers) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('subtitle')}</p>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault();
          void load();
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className="input"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="secondary">{t('search')}</Button>
        </div>
      </form>

      {customers.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-start text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">{t('name')}</th>
                <th className="px-4 py-3">{t('email')}</th>
                <th className="px-4 py-3">{t('role')}</th>
                <th className="px-4 py-3">{t('bookings')}</th>
                <th className="px-4 py-3">{t('registered')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((c) => (
                <tr key={c._id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3"><RoleBadge role={c.role} /></td>
                  <td className="px-4 py-3">{c.bookingCount}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDateTime(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}