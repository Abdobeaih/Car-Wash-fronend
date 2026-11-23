'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/Button';
import { Alert } from '@/components/States';
import { apiRequest } from '@/lib/api';
import type { Booking } from '@/lib/types';

export default function PaymentRecord({ booking, onUpdate }: { booking: Booking; onUpdate: (booking: Booking) => void }) {
  const t = useTranslations('PaymentRecord');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const next = booking.paymentStatus === 'PAID' ? 'PENDING' : 'PAID';
  async function save() {
    setBusy(true); setError(null); setSaved(false);
    try {
      const result = await apiRequest<Booking>(`/admin/bookings/${booking._id}/payment`, { method: 'PATCH', auth: true, body: { paymentStatus: next, reference: reference.trim() } });
      onUpdate(result); setEditing(false); setReference(''); setSaved(true);
    } catch (err) { setError(err instanceof Error ? err.message : t('failed')); }
    finally { setBusy(false); }
  }
  return <section className="card space-y-4">
    <div><h2 className="display-title text-lg">{t('title')}</h2><p className="mt-2 text-sm text-gray-500">{t('disclaimer')}</p></div>
    <p className="font-semibold">{t('status')}: {t(booking.paymentStatus === 'PAID' ? 'paid' : 'pending')}</p>
    {saved && <Alert type="success">{t('saved')}</Alert>}
    {error && <Alert type="error">{error}</Alert>}
    {booking.status === 'CANCELLED' ? <p className="text-sm text-amber-800">{t('cancelled')}</p> : editing ? <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); void save(); }}>
      <p className="text-sm font-medium">{t(next === 'PAID' ? 'confirmPaid' : 'confirmPending')}</p>
      <label className="block text-sm">{t('reference')}<input maxLength={200} value={reference} onChange={(e) => setReference(e.target.value)} className="mt-2 block w-full rounded-xl border border-gray-300 p-3" /></label>
      <div className="flex flex-wrap gap-3"><Button type="submit" loading={busy}>{t('confirm')}</Button><Button type="button" variant="secondary" disabled={busy} onClick={() => setEditing(false)}>{t('back')}</Button></div>
    </form> : <Button type="button" onClick={() => { setEditing(true); setSaved(false); }}>{t(next === 'PAID' ? 'markPaid' : 'correct')}</Button>}
    {(booking.paymentHistory?.length ?? 0) > 0 && <details className="text-sm"><summary className="cursor-pointer font-medium">{t('history')}</summary><ul className="mt-3 space-y-2">{booking.paymentHistory?.map((entry, index) => <li key={index} className="rounded-xl bg-gray-50 p-3"><p>{t(entry.status === 'PAID' ? 'paid' : 'pending')} · <time dateTime={entry.recordedAt}>{new Date(entry.recordedAt).toLocaleString()}</time></p>{entry.reference && <p className="mt-1 break-words text-gray-600">{entry.reference}</p>}</li>)}</ul></details>}
  </section>;
}
