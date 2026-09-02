'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { AdminDashboard } from '@/lib/types';
import { LoadingState, ErrorState } from '@/components/States';
import { useMoney } from '@/lib/format';

export default function AdminDashboardPage() {
  const t = useTranslations('AdminDashboard');
  const formatMoney = useMoney();
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await apiRequest<AdminDashboard>('/admin/dashboard', { auth: true });
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loadFailed'));
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <LoadingState />;

  const metrics = [
    { label: t('totalBookings'), value: String(data.totalBookings), tone: 'bg-gray-900 text-brand-500', icon: 'calendar' },
    { label: t('pending'), value: String(data.pendingBookings), tone: 'bg-amber-100 text-amber-700', icon: 'clock' },
    { label: t('confirmed'), value: String(data.confirmedBookings), tone: 'bg-gray-200 text-gray-700', icon: 'check' },
    { label: t('completed'), value: String(data.completedBookings), tone: 'bg-green-100 text-green-700', icon: 'checkCircle' },
    { label: t('customers'), value: String(data.customers), tone: 'bg-gray-100 text-gray-600', icon: 'users' },
    { label: t('revenue'), value: formatMoney(data.revenue), tone: 'bg-brand-50 text-brand-700', icon: 'dollar' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-title text-2xl text-gray-900 sm:text-3xl">{t('title')}</h1>
        <p className="mt-2 text-sm text-gray-500">{t('subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} className="card flex items-start gap-4 p-5">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${m.tone}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                {m.icon === 'calendar' && (
                  <rect x="4" y="5" width="16" height="15" rx="3" stroke="currentColor" strokeWidth="1.8" />
                )}
                {m.icon === 'clock' && (
                  <path d="M12 7v5l3 2M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                )}
                {m.icon === 'check' && (
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                )}
                {m.icon === 'checkCircle' && (
                  <>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M8.5 12.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </>
                )}
                {m.icon === 'users' && (
                  <path d="M12 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                )}
                {m.icon === 'dollar' && (
                  <path d="M12 3v18M16 6.5c0-1.5-1.8-2.5-4-2.5s-4 1-4 2.5 1.5 2.3 4 2.8 4 1.3 4 2.7-1.8 2.5-4 2.5-4-1-4-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                )}
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-sm text-gray-500">{m.label}</p>
              <p className="mt-1.5 truncate text-2xl font-bold text-gray-900">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="display-title text-lg text-gray-900">{t('quickActions')}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/bookings" className="btn-secondary justify-start">
            {t('manageBookings')}
          </Link>
          <Link href="/admin/services" className="btn-secondary justify-start">
            {t('manageServices')}
          </Link>
          <Link href="/admin/calendar" className="btn-secondary justify-start">
            {t('viewCalendar')}
          </Link>
        </div>
      </div>
    </div>
  );
}