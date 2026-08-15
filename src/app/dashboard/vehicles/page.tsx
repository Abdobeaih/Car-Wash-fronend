'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
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
      setError(err instanceof Error ? err.message : 'Failed to load vehicles.');
    }
  }, []);

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
        setMessage('Vehicle updated.');
      } else {
        await apiRequest('/vehicles', { method: 'POST', body: payload, auth: true });
        setMessage('Vehicle added.');
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vehicle.');
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
      setMessage('Vehicle deleted.');
      setConfirmingDelete(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vehicle.');
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
        <h1 className="text-2xl font-bold text-gray-900">My Vehicles</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add the vehicles you want to book car care services for.
        </p>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {message && <Alert type="success">{message}</Alert>}

      <form onSubmit={handleSubmit} className="card" noValidate>
        <h2 className="font-semibold text-gray-900">
          {editingId ? 'Edit vehicle' : 'Add a vehicle'}
        </h2>
        <div className="mt-4 grid gap-0 sm:grid-cols-2">
          <Input
            label="Brand"
            name="brand"
            required
            placeholder="e.g. Toyota"
            {...field('brand')}
          />
          <Input
            label="Model"
            name="model"
            required
            placeholder="e.g. Camry"
            {...field('model')}
          />
          <Input
            label="Year"
            name="year"
            type="number"
            required
            min={1980}
            max={2100}
            placeholder="2020"
            {...field('year')}
          />
          <Input
            label="Color"
            name="color"
            required
            placeholder="e.g. Silver"
            {...field('color')}
          />
          <Input
            label="Plate number"
            name="plateNumber"
            required
            placeholder="e.g. ABC 123"
            {...field('plateNumber')}
          />
          <Select label="Vehicle type" name="vehicleType" required {...field('vehicleType')}>
            {vehicleTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-2 flex gap-3">
          <Button type="submit" loading={submitting} disabled={submitting}>
            {editingId ? 'Save changes' : 'Add vehicle'}
          </Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {vehicles.length === 0 ? (
        <EmptyState
          title="No vehicles yet"
          description="Add your first vehicle above to start booking services."
        />
      ) : (
        <ul className="space-y-3">
          {vehicles.map((v) => (
            <li key={v._id} className="card flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900">
                  {v.brand} {v.model}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {v.year} · {v.color} · {v.plateNumber} · {v.vehicleType}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => startEdit(v)}>
                  Edit
                </Button>
                {confirmingDelete === v._id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Delete?</span>
                    <Button variant="danger" onClick={confirmDelete}>
                      Yes
                    </Button>
                    <Button variant="secondary" onClick={() => setConfirmingDelete(null)}>
                      No
                    </Button>
                  </div>
                ) : (
                  <Button variant="danger" onClick={() => setConfirmingDelete(v._id)}>
                    Delete
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