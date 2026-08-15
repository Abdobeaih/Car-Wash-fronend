'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { Booking } from '@/lib/types';
import Button from '@/components/Button';
import { LoadingState, ErrorState } from '@/components/States';
import { StatusBadge, formatMoney } from '@/components/Badges';

type View = 'day' | 'week' | 'month';

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export default function AdminCalendarPage() {
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
      setError(err instanceof Error ? err.message : 'Failed to load calendar.');
    }
  }, [start, end]);

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
    if (view === 'day') return start.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (view === 'week') return `${toISODate(start)} – ${toISODate(end)}`;
    return start.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }, [view, start, end]);

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
    return (
      <div key={iso} className="border border-gray-200 bg-white p-2">
        <p className="text-xs font-semibold text-gray-500">{date.getDate()}</p>
        {list.map((b) => (
          <div key={b._id} className="mt-1 rounded bg-brand-50 px-1.5 py-1 text-xs">
            <p className="truncate font-medium text-brand-700">
              {b.startTime} {(b.serviceId as { name?: string })?.name}
            </p>
            <p className="truncate text-gray-500">
              {(b.customerId as { name?: string })?.name} · {formatMoney(b.total)}
            </p>
          </div>
        ))}
      </div>
    );
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!bookings) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => navigate(-1)} aria-label="Previous">
            ←
          </Button>
          <span className="min-w-40 text-center text-sm font-medium text-gray-700">{periodLabel}</span>
          <Button variant="secondary" onClick={() => navigate(1)} aria-label="Next">
            →
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
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
              view === v ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {view === 'month' && (
        <div className="grid grid-cols-7 gap-1 overflow-hidden">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="px-2 py-1 text-center text-xs font-semibold uppercase text-gray-500">
              {d}
            </div>
          ))}
          {daysInMonth.map((d) => renderDay(d))}
        </div>
      )}

      {view !== 'month' && (
        <div className="space-y-3">
          {Array.from({ length: view === 'day' ? 1 : 7 }).map((_, i) => {
            const day = addDays(start, i);
            const list = byDate.get(toISODate(day)) ?? [];
            return (
              <div key={toISODate(day)} className="card">
                <h3 className="font-semibold text-gray-900">
                  {day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                {list.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-400">No bookings</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {list.map((b) => (
                      <li key={b._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm">
                        <span className="font-medium text-gray-900">
                          {b.startTime} – {b.endTime} · {(b.serviceId as { name?: string })?.name}
                        </span>
                        <span className="text-gray-500">
                          {(b.customerId as { name?: string })?.name} · {formatMoney(b.total)}
                        </span>
                        <StatusBadge status={b.status} />
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