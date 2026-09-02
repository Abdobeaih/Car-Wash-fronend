'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { Link } from '@/i18n/navigation';
import type { Booking } from '@/lib/types';
import Button from '@/components/Button';
import { LoadingState, ErrorState } from '@/components/States';
import { StatusBadge } from '@/components/Badges';
import { useMoney } from '@/lib/format';

type View = 'day' | 'week' | 'month';

function toISODate(d: Date): string {
  const copy = new Date(d);
  const tz = copy.getTimezoneOffset();
  return new Date(copy.getTime() - tz * 60000).toISOString().split('T')[0];
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export default function AdminCalendarPage() {
  const t = useTranslations('AdminCalendar');
  const format = useFormatter();
  const formatMoney = useMoney();
  const [view, setView] = useState<View>('month');
  const [anchor, setAnchor] = useState<Date>(() => new Date());
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { start, end } = useMemo(() => {
    const startDate = view === 'day' ? new Date(anchor) : view === 'week' ? addDays(anchor, -anchor.getDay()) : new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const endDate =
      view === 'day'
        ? anchor
        : view === 'week'
          ? addDays(startDate, 6)
          : new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    return { start: startDate, end: endDate };
  }, [view, anchor]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const qs = `start=${toISODate(start)}&end=${toISODate(end)}`;
      const data = await apiRequest<Booking[]>(`/admin/calendar?${qs}`, { auth: true });
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loadFailed'));
    }
  }, [start, end, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const byDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings ?? []) {
      const list = map.get(b.date) ?? [];
      list.push(b);
      map.set(b.date, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return map;
  }, [bookings]);

  const navigate = (dir: number) => {
    setAnchor((prev) =>
      view === 'day'
        ? addDays(prev, dir)
        : view === 'week'
          ? addDays(prev, dir * 7)
          : new Date(prev.getFullYear(), prev.getMonth() + dir, 1),
    );
  };

  const periodLabel = useMemo(() => {
    if (view === 'day') return format.dateTime(start, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (view === 'week') return `${toISODate(start)} – ${toISODate(end)}`;
    return format.dateTime(start, { year: 'numeric', month: 'long' });
  }, [view, start, end, format]);

  const weekdayLabels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        format.dateTime(new Date(2024, 0, 7 + i), { weekday: 'short' }),
      ),
    [format],
  );

  const daysInMonth = useMemo(() => {
    if (view !== 'month') return [];
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const count = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
    const days: Date[] = [];
    for (let i = 0; i < count; i += 1) days.push(addDays(first, i));
    return days;
  }, [view, anchor]);

  const renderDay = (date: Date) => {
    const iso = toISODate(date);
    const list = byDate.get(iso) ?? [];
    const today = iso === toISODate(new Date());
    return (
      <div
        key={iso}
        className={`min-h-[92px] rounded-lg border bg-white p-1.5 transition hover:border-brand-300 ${
          today ? 'border-brand-500 ring-1 ring-brand-500/30' : 'border-gray-200'
        }`}
      >
        <p
          className={`px-1 pt-0.5 text-xs font-semibold ${
            today ? 'text-brand-600' : 'text-gray-500'
          }`}
        >
          {date.getDate()}
        </p>
        <div className="mt-1 space-y-1">
          {list.map((b) => (
            <Link
              key={b._id}
              href={`/admin/bookings/${b._id}`}
              className="block rounded-md bg-brand-50 px-1.5 py-1 text-[11px] leading-tight transition hover:bg-brand-100"
            >
              <p className="truncate font-medium text-brand-700">
                {b.startTime} {(b.serviceId as { name?: string })?.name}
              </p>
              <p className="truncate text-gray-500">
                {(b.customerId as { name?: string })?.name} · {formatMoney(b.total)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!bookings) return <LoadingState />;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="display-title text-2xl text-gray-900 sm:text-3xl">{t('title')}</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => navigate(-1)} aria-label={t('previous')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
          <span className="min-w-40 text-center text-sm font-medium text-gray-700">{periodLabel}</span>
          <Button variant="secondary" onClick={() => navigate(1)} aria-label={t('next')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="flex gap-2" role="tablist" aria-label="Calendar view">
        {(['day', 'week', 'month'] as View[]).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              view === v
                ? 'bg-black text-brand-500'
                : 'border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            {t(v)}
          </button>
        ))}
      </div>

      {view === 'month' && (
        <div className="overflow-x-auto pb-2">
          <div className="grid min-w-[560px] grid-cols-7 gap-1">
            {weekdayLabels.map((d) => (
              <div key={d} className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                {d}
              </div>
            ))}
            {daysInMonth.map((d) => renderDay(d))}
          </div>
        </div>
      )}

      {view !== 'month' && (
        <div className="space-y-3">
          {Array.from({ length: view === 'day' ? 1 : 7 }).map((_, i) => {
            const day = addDays(start, i);
            const list = byDate.get(toISODate(day)) ?? [];
            return (
              <div key={toISODate(day)} className="card p-5">
                <h3 className="font-semibold text-gray-900">
                  {format.dateTime(day, { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                {list.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-400">{t('noBookings')}</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {list.map((b) => (
                      <li key={b._id}>
                        <Link
                          href={`/admin/bookings/${b._id}`}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm transition hover:border-brand-200 hover:bg-brand-50/40"
                        >
                          <span className="font-medium text-gray-900">
                            {b.startTime} – {b.endTime} · {(b.serviceId as { name?: string })?.name}
                          </span>
                          <span className="text-gray-500">
                            {(b.customerId as { name?: string })?.name} · {formatMoney(b.total)}
                          </span>
                          <StatusBadge status={b.status} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}