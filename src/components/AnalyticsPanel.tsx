'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { localizeContent } from '@/lib/localize-content';
import { useLocale } from 'next-intl';
import { useMoney } from '@/lib/format';
import { ErrorState, LoadingState } from '@/components/States';
import Button from '@/components/Button';
import type { AdminAnalytics } from '@/lib/types';

export default function AnalyticsPanel() {
  const t = useTranslations('Analytics');
  const money = useMoney();
  const locale = useLocale();
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load(from = '', until = '') {
    setBusy(true);
    setError(null);
    const query = new URLSearchParams();
    if (from) query.set('start', from);
    if (until) query.set('end', until);
    try {
      const result = await apiRequest<AdminAnalytics>(`/admin/analytics?${query}`, { auth: true });
      setData(result);
      setStart(result.range.start);
      setEnd(result.range.end);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failed'));
    } finally { setBusy(false); }
  }
  // Initial report uses the server's Cairo-local date, not the browser's timezone.
  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <section className="card space-y-6" aria-labelledby="analytics-title">
    <div><p className="eyebrow">{t('eyebrow')}</p><h2 id="analytics-title" className="display-title mt-2 text-2xl">{t('title')}</h2><p className="mt-2 text-sm text-gray-500">{t('basis')}</p></div>
    <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); void load(start, end); }}>
      <label className="min-w-0 basis-full text-sm font-medium sm:flex-1 sm:basis-0">{t('from')}<input required type="date" value={start} onChange={(e) => setStart(e.target.value)} className="mt-2 block w-full min-w-0 rounded-xl border border-gray-300 bg-white p-3 text-gray-900" /></label>
      <label className="min-w-0 basis-full text-sm font-medium sm:flex-1 sm:basis-0">{t('to')}<input required type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-2 block w-full min-w-0 rounded-xl border border-gray-300 bg-white p-3 text-gray-900" /></label>
      <Button type="submit" loading={busy}>{t('apply')}</Button>
    </form>
    {error && <ErrorState message={error} onRetry={() => void load(start, end)} />}
    {!data && !error && <LoadingState />}
    {data && !error && <div className="space-y-6" aria-busy={busy}>
      <p className="text-sm text-gray-500">{t('range', { start: data.range.start, end: data.range.end })}</p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(['recordedPaid', 'outstanding', 'bookedValue', 'completedValue'] as const).map((key) => <div key={key} className="min-w-0 rounded-2xl bg-gray-50 p-4"><p className="text-sm text-gray-600">{t(key)}</p><p className="mt-2 break-words font-display text-xl font-semibold">{money(data.summary[key])}</p></div>)}
      </div>
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">{t('notBank')}</p>
      {data.summary.cancelledPaid > 0 && <p role="status" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">{t('reconcile', { value: money(data.summary.cancelledPaid) })}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        <div><p className="text-sm text-gray-500">{t('bookings')}</p><p className="text-2xl font-semibold">{data.summary.bookings}</p></div>
        <div><p className="text-sm text-gray-500">{t('cancelled')}</p><p className="text-2xl font-semibold">{data.summary.cancelled}</p></div>
        <div><p className="text-sm text-gray-500">{t('returning')}</p><p className="text-2xl font-semibold">{data.customers.returning} / {data.customers.unique}</p><p className="text-xs text-gray-500">{t('returningBasis')}</p></div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="min-w-0"><h3 className="font-semibold">{t('daily')}</h3>{data.daily.length === 0 ? <p className="mt-3 text-sm text-gray-500">{t('empty')}</p> : <div className="mt-3 max-h-80 overflow-auto"><table className="w-full text-start text-sm"><caption className="sr-only">{t('daily')}</caption><thead className="sticky top-0 bg-white"><tr><th scope="col" className="p-2 text-start">{t('date')}</th><th scope="col" className="p-2 text-start">{t('bookings')}</th><th scope="col" className="p-2 text-start">{t('recordedPaid')}</th></tr></thead><tbody>{data.daily.map((day) => <tr key={day._id} className="border-t border-gray-100"><th scope="row" className="whitespace-nowrap p-2 text-start font-normal" dir="ltr">{day._id}</th><td className="p-2">{day.bookings}</td><td className="p-2">{money(day.recordedPaid)}</td></tr>)}</tbody></table></div>}</section>
        <section className="min-w-0"><h3 className="font-semibold">{t('services')}</h3><p className="mt-1 text-xs text-gray-500">{t('servicesBasis')}</p>{data.services.length === 0 ? <p className="mt-3 text-sm text-gray-500">{t('empty')}</p> : <ol className="mt-3 space-y-3">{data.services.map((service) => <li key={service._id} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3"><span className="min-w-0 break-words text-sm">{localizeContent(locale, service.name)}</span><span className="shrink-0 text-sm font-semibold">{service.count}</span></li>)}</ol>}</section>
      </div>
    </div>}
  </section>;
}
