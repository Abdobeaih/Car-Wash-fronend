'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/api';
import type { Vehicle, VehicleType } from '@/lib/types';
import Button from '@/components/Button';
import Input, { Select } from '@/components/Input';
import { LoadingState, EmptyState, Alert } from '@/components/States';

const vehicleTypes: VehicleType[] = ['SEDAN', 'SUV', 'PICKUP', 'LUXURY'];

interface VehicleFormState {
  brand: string;
  model: string;
  year: string;
  color: string;
  plateNumber: string;
  vehicleType: VehicleType;
}

const emptyForm: VehicleFormState = {
  brand: '',
  model: '',
  year: '',
  color: '',
  plateNumber: '',
  vehicleType: 'SEDAN',
};

export default function VehiclesPage() {
  const t = useTranslations('Vehicles');
  const tv = useTranslations('VehicleTypes');
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await apiRequest<Vehicle[]>('/vehicles', { auth: true });
      setVehicles(data);
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
      brand: form.brand,
      model: form.model,
      year: Number(form.year),
      color: form.color,
      plateNumber: form.plateNumber,
      vehicleType: form.vehicleType,
    };
    try {
      if (editingId) {
        await apiRequest(`/vehicles/${editingId}`, {
          method: 'PATCH',
          body: payload,
          auth: true,
        });
        setMessage(t('updated'));
      } else {
        await apiRequest('/vehicles', { method: 'POST', body: payload, auth: true });
        setMessage(t('added'));
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (v: Vehicle) => {
    setEditingId(v._id);
    setForm({
      brand: v.brand,
      model: v.model,
      year: String(v.year),
      color: v.color,
      plateNumber: v.plateNumber,
      vehicleType: v.vehicleType,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    if (!confirmingDelete) return;
    setError(null);
    setMessage(null);
    try {
      await apiRequest(`/vehicles/${confirmingDelete}`, { method: 'DELETE', auth: true });
      setMessage(t('deleted'));
      setConfirmingDelete(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('deleteFailed'));
    }
  };

  if (!vehicles) return <LoadingState />;

  const field = (key: keyof VehicleFormState) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-sm text-gray-500">
          {t('subtitle')}
        </p>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {message && <Alert type="success">{message}</Alert>}

      <form onSubmit={handleSubmit} className="card" noValidate>
        <h2 className="font-semibold text-gray-900">
          {editingId ? t('editTitle') : t('addTitle')}
        </h2>
        <div className="mt-4 grid gap-x-4 sm:grid-cols-2">
          <Input
            label={t('brand')}
            name="brand"
            required
            placeholder="e.g. Toyota"
            {...field('brand')}
          />
          <Input
            label={t('model')}
            name="model"
            required
            placeholder="e.g. Camry"
            {...field('model')}
          />
          <Input
            label={t('year')}
            name="year"
            type="number"
            required
            min={1980}
            max={2100}
            placeholder="2020"
            {...field('year')}
          />
          <Input
            label={t('color')}
            name="color"
            required
            placeholder="e.g. Silver"
            {...field('color')}
          />
          <Input
            label={t('plateNumber')}
            name="plateNumber"
            required
            placeholder="e.g. ABC 123"
            {...field('plateNumber')}
          />
          <Select label={t('vehicleType')} name="vehicleType" required {...field('vehicleType')}>
            {vehicleTypes.map((vt) => (
              <option key={vt} value={vt}>
                {tv(vt)}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-2 flex gap-3">
          <Button type="submit" loading={submitting} disabled={submitting}>
            {editingId ? t('save') : t('add')}
          </Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={resetForm}>
              {t('cancel')}
            </Button>
          )}
        </div>
      </form>

      {vehicles.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
      ) : (
        <ul className="space-y-3">
          {vehicles.map((v) => (
            <li key={v._id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13m-14 0h14m-14 0v3m14-3v3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-gray-900">
                    {v.brand} {v.model}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {v.year} · {v.color} · {v.plateNumber} · {tv(v.vehicleType)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="secondary" onClick={() => startEdit(v)}>
                  {t('edit')}
                </Button>
                {confirmingDelete === v._id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-600">{t('deletePrompt')}</span>
                    <div className="flex items-center gap-2">
                      <Button variant="danger" onClick={confirmDelete}>
                        {t('yes')}
                      </Button>
                      <Button variant="secondary" onClick={() => setConfirmingDelete(null)}>
                        {t('no')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="danger" onClick={() => setConfirmingDelete(v._id)}>
                    {t('delete')}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}