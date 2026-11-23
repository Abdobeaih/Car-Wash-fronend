'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { AdminDashboard } from '@/lib/types';
import { LoadingState, ErrorState } from '@/components/States';
import AnalyticsPanel from '@/components/AnalyticsPanel';
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

 const total = Math.max(data.totalBookings, 1);
 const segments = [
  { label: t('cancelled'), value: data.cancelledBookings ?? 0, bar: 'bg-red-400', dot: 'bg-red-400' },
  { label: t('pending'), value: data.pendingBookings, bar: 'bg-amber-400', dot: 'bg-amber-400' },
  { label: t('confirmed'), value: data.confirmedBookings, bar: 'bg-gray-300', dot: 'bg-gray-300' },
  { label: t('completed'), value: data.completedBookings, bar: 'bg-green-400', dot: 'bg-green-400' },
 ];

 const metrics = [
  { label: t('totalBookings'), value: String(data.totalBookings), tone: 'bg-gray-900 text-brand-500', icon: 'calendar' },
  { label: t('pending'), value: String(data.pendingBookings), tone: 'bg-amber-100 text-amber-700', icon: 'clock' },
  { label: t('confirmed'), value: String(data.confirmedBookings), tone: 'bg-gray-200 text-gray-700', icon: 'check' },
  { label: t('completed'), value: String(data.completedBookings), tone: 'bg-green-100 text-green-700', icon: 'checkCircle' },
  { label: t('customers'), value: String(data.customers), tone: 'bg-gray-100 text-gray-600', icon: 'users' },
 ];

 return (
  <div className="space-y-6">
   {/* ── Hero band ─────────────────────────────────────────── */}
   <div className="relative overflow-hidden rounded-3xl bg-gray-900 p-6 text-white shadow-lift sm:p-8">
    <div
     aria-hidden="true"
     className="pointer-events-none absolute -end-16 -top-16 h-56 w-56 rounded-full bg-brand-600/30 blur-3xl"
    />
    <div
     aria-hidden="true"
     className="pointer-events-none absolute -bottom-24 start-1/4 h-52 w-52 rounded-full bg-brand-400/10 blur-3xl"
    />
    <div className="relative flex flex-wrap items-end justify-between gap-6">
     <div>
      <p className="eyebrow text-brand-400">{t('eyebrow')}</p>
      <h1 className="display-title mt-3 text-2xl text-white sm:text-3xl">{t('title')}</h1>
      <p className="mt-2 text-sm text-gray-400">{t('subtitle')}</p>
     </div>
     <div className="text-end">
      <p className="flex items-center justify-end gap-1.5 text-xs font-semibold text-gray-500">
       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3v18M16 6.5c0-1.5-1.8-2.5-4-2.5s-4 1-4 2.5 1.5 2.3 4 2.8 4 1.3 4 2.7-1.8 2.5-4 2.5-4-1-4-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
       </svg>
       {t('revenue')}
      </p>
      <p className="mt-1 font-display text-3xl font-semibold text-brand-400 sm:text-4xl">
       {formatMoney(data.revenue)}
      </p>
     </div>
    </div>

    {/* booking status bar */}
    <div className="relative mt-8">
     <div className="flex h-3 overflow-hidden rounded-full bg-white/10">
      {segments.map((seg) =>
       seg.value > 0 ? (
        <div
         key={seg.label}
         className={`${seg.bar} transition-all duration-500`}
         style={{ width: `${(seg.value / total) * 100}%` }}
         title={`${seg.label}: ${seg.value}`}
        />
       ) : null,
      )}
     </div>
     <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-gray-400">
      {segments.map((seg) => (
       <span key={seg.label} className="inline-flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${seg.dot}`} aria-hidden="true" />
        {seg.label}
        <span className="font-semibold text-gray-200">{seg.value}</span>
       </span>
      ))}
     </div>
    </div>
   </div>

   {/* ── Metric tiles ──────────────────────────────────────── */}
   <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {metrics.map((m) => (
     <div
      key={m.label}
      className="card flex items-start gap-4 p-5 transition-shadow duration-300 hover:shadow-lift"
     >
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
       </svg>
      </span>
      <div className="min-w-0">
       <p className="text-sm text-gray-500">{m.label}</p>
       <p className="mt-1.5 truncate font-display text-2xl font-semibold text-gray-900">{m.value}</p>
      </div>
     </div>
    ))}
   </div>

   <AnalyticsPanel />

   {/* ── Quick actions ─────────────────────────────────────── */}
   <div className="grid gap-4 sm:grid-cols-3">
    {[
     { href: '/admin/bookings', label: t('manageBookings') },
     { href: '/admin/services', label: t('manageServices') },
     { href: '/admin/calendar', label: t('viewCalendar') },
    ].map((a) => (
     <Link
      key={a.href}
      href={a.href}
      className="group relative overflow-hidden rounded-2xl bg-gray-900 p-5 text-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
     >
      <div
       aria-hidden="true"
       className="pointer-events-none absolute -end-8 -top-8 h-24 w-24 rounded-full bg-brand-600/25 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative flex items-center justify-between gap-3">
       <span className="font-display text-sm font-semibold">
        {a.label}
       </span>
       <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="rtl:-scale-x-100">
         <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
       </span>
      </div>
     </Link>
    ))}
   </div>
  </div>
 );
}
