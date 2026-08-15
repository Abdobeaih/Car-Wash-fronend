'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { apiRequest } from '@/lib/api';
import type { CarService } from '@/lib/types';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { LoadingState, EmptyState, Alert } from '@/components/States';
import { ActiveBadge, formatMoney } from '@/components/Badges';

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
      setError(err instanceof Error ? err.message : 'Failed to load services.');
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
        setMessage('Service updated.');
      } else {
        await apiRequest('/admin/services', { method: 'POST', body: payload, auth: true });
        setMessage('Service created.');
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save service.');
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
      setError(err instanceof Error ? err.message : 'Failed to update service.');
    }
  };

  const confirmDelete = async () => {
    if (!confirmingDelete) return;
    setError(null);
    try {
      await apiRequest(`/admin/services/${confirmingDelete}`, { method: 'DELETE', auth: true });
      setMessage('Service deleted.');
      setConfirmingDelete(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service.');
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
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <p className="mt-1 text-sm text-gray-500">Create, edit, activate or deactivate services.</p>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {message && <Alert type="success">{message}</Alert>}

      <form onSubmit={handleSubmit} className="card" noValidate>
        <h2 className="font-semibold text-gray-900">{editingId ? 'Edit service' : 'Create service'}</h2>
        <div className="mt-4 grid gap-0 sm:grid-cols-2">
          <Input label="Name" name="name" required minLength={2} placeholder="e.g. Exterior Car Wash" {...set('name')} />
          <Input label="Image URL" name="image" type="url" required placeholder="https://…/image.svg" {...set('image')} />
          <Input label="Base price" name="basePrice" type="number" required min={0} step="0.01" {...set('basePrice')} />
          <Input label="Duration (minutes)" name="duration" type="number" required min={15} {...set('duration')} />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="label">Description</label>
          <textarea
            id="description"
            className="input min-h-24"
            required
            minLength={10}
            placeholder="Describe the service"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div className="mb-4 flex items-center gap-2">
          <input
            id="isActive"
            type="checkbox"
            className="h-4 w-4 rounded text-brand-600"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Active (bookable by customers)
          </label>
        </div>
        <div className="flex gap-3">
          <Button type="submit" loading={submitting} disabled={submitting}>
            {editingId ? 'Save changes' : 'Create service'}
          </Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {services.length === 0 ? (
        <EmptyState title="No services" description="Create your first service above." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((s) => (
                <tr key={s._id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3">{formatMoney(s.basePrice)}</td>
                  <td className="px-4 py-3">{s.duration} min</td>
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
                        Edit
                      </Button>
                      <Button variant="secondary" onClick={() => toggleActive(s)}>
                        {s.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      {confirmingDelete === s._id ? (
                        <Button variant="danger" onClick={confirmDelete}>
                          Confirm delete
                        </Button>
                      ) : (
                        <Button variant="danger" onClick={() => setConfirmingDelete(s._id)}>
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}