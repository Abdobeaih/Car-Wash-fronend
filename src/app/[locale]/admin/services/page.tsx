'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/api';
import type { CarService } from '@/lib/types';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { LoadingState, EmptyState, Alert } from '@/components/States';
import { ActiveBadge } from '@/components/Badges';
import { useMoney } from '@/lib/format';

interface FormState {
  name: string;
  description: string;
  image: string;
  basePrice: string;
  duration: string;
  isActive: boolean;
}

const emptyForm: FormState = {
  name: '',
  description: '',
  image: '',
  basePrice: '',
  duration: '60',
  isActive: true,
};

export default function AdminServicesPage() {
  const t = useTranslations('AdminServices');
  const tc = useTranslations('Common');
  const formatMoney = useMoney();
  const [services, setServices] = useState<CarService[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await apiRequest<CarService[]>('/admin/services', { auth: true });
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loadFailed'));
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    const payload = {
      name: form.name,
      description: form.description,
      image: form.image,
      basePrice: Number(form.basePrice),
      duration: Number(form.duration),
      isActive: form.isActive,
    };
    try {
      if (editingId) {
        await apiRequest(`/admin/services/${editingId}`, {
          method: 'PATCH',
          body: payload,
          auth: true,
        });
        setMessage(t('updated'));
      } else {
        await apiRequest('/admin/services', { method: 'POST', body: payload, auth: true });
        setMessage(t('created'));
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (s: CarService) => {
    setError(null);
    try {
      await apiRequest(`/admin/services/${s._id}`, {
        method: 'PATCH',
        body: { isActive: !s.isActive },
        auth: true,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('updateFailed'));
    }
  };

  const confirmDelete = async () => {
    if (!confirmingDelete) return;
    setError(null);
    try {
      await apiRequest(`/admin/services/${confirmingDelete}`, { method: 'DELETE', auth: true });
      setMessage(t('deleted'));
      setConfirmingDelete(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('deleteFailed'));
    }
  };

  if (!services) return <LoadingState />;

  const set = (key: keyof FormState) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-sm text-gray-500">{t('subtitle')}</p>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {message && <Alert type="success">{message}</Alert>}

      <form onSubmit={handleSubmit} className="card" noValidate>
        <h2 className="font-semibold text-gray-900">{editingId ? t('editTitle') : t('createTitle')}</h2>
        <div className="mt-4 grid gap-x-4 sm:grid-cols-2">
          <Input label={t('name')} name="name" required minLength={2} placeholder={t('namePlaceholder')} {...set('name')} />
          <Input label={t('imageUrl')} name="image" type="url" required placeholder={t('imagePlaceholder')} {...set('image')} />
          <Input label={t('basePrice')} name="basePrice" type="number" required min={0} step="0.01" {...set('basePrice')} />
          <Input label={t('duration')} name="duration" type="number" required min={15} {...set('duration')} />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="label">{t('description')}</label>
          <textarea
            id="description"
            className="input min-h-24"
            required
            minLength={10}
            placeholder={t('descriptionPlaceholder')}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div className="mb-4 flex items-center gap-2">
          <input
            id="isActive"
            type="checkbox"
            className="h-4 w-4 rounded accent-brand-600"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            {t('activeLabel')}
          </label>
        </div>
        <div className="flex gap-3">
          <Button type="submit" loading={submitting} disabled={submitting}>
            {editingId ? t('save') : t('create')}
          </Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={resetForm}>
              {t('cancel')}
            </Button>
          )}
        </div>
      </form>

      {services.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {services.map((s) => (
              <li key={s._id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">{tc('minutes', { value: s.duration })}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="font-semibold text-gray-900">{formatMoney(s.basePrice)}</span>
                    <ActiveBadge active={s.isActive} />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => {
                    setEditingId(s._id);
                    setForm({
                      name: s.name,
                      description: s.description,
                      image: s.image,
                      basePrice: String(s.basePrice),
                      duration: String(s.duration),
                      isActive: s.isActive,
                    });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}>
                    {t('edit')}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => toggleActive(s)}>
                    {s.isActive ? t('deactivate') : t('activate')}
                  </Button>
                  {confirmingDelete === s._id ? (
                    <Button size="sm" variant="danger" onClick={confirmDelete}>
                      {t('confirmDelete')}
                    </Button>
                  ) : (
                    <Button size="sm" variant="danger" onClick={() => setConfirmingDelete(s._id)}>
                      {t('delete')}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="card hidden overflow-x-auto p-0 md:block">
            <table className="w-full min-w-[640px] text-start text-sm">
              <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th scope="col" className="px-4 py-3">{t('name')}</th>
                  <th scope="col" className="px-4 py-3">{t('price')}</th>
                  <th scope="col" className="px-4 py-3">{t('durationLabel')}</th>
                  <th scope="col" className="px-4 py-3">{t('status')}</th>
                  <th scope="col" className="px-4 py-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {services.map((s) => (
                  <tr key={s._id} className="transition hover:bg-gray-50/70">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                    <td className="px-4 py-3">{formatMoney(s.basePrice)}</td>
                    <td className="px-4 py-3">{tc('minutes', { value: s.duration })}</td>
                    <td className="px-4 py-3"><ActiveBadge active={s.isActive} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={() => {
                          setEditingId(s._id);
                          setForm({
                            name: s.name,
                            description: s.description,
                            image: s.image,
                            basePrice: String(s.basePrice),
                            duration: String(s.duration),
                            isActive: s.isActive,
                          });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}>
                          {t('edit')}
                        </Button>
                        <Button variant="secondary" onClick={() => toggleActive(s)}>
                          {s.isActive ? t('deactivate') : t('activate')}
                        </Button>
                        {confirmingDelete === s._id ? (
                          <Button variant="danger" onClick={confirmDelete}>
                            {t('confirmDelete')}
                          </Button>
                        ) : (
                          <Button variant="danger" onClick={() => setConfirmingDelete(s._id)}>
                            {t('delete')}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}