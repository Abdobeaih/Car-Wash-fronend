'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { apiRequest } from '@/lib/api';
import type { AddOn } from '@/lib/types';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { LoadingState, EmptyState, Alert } from '@/components/States';
import { ActiveBadge, formatMoney } from '@/components/Badges';

interface FormState {
  name: string;
  description: string;
  price: string;
  isActive: boolean;
}

const emptyForm: FormState = { name: '', description: '', price: '', isActive: true };

export default function AdminAddOnsPage() {
  const [addOns, setAddOns] = useState<AddOn[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await apiRequest<AddOn[]>('/admin/add-ons', { auth: true });
      setAddOns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load add-ons.');
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
      price: Number(form.price),
      isActive: form.isActive,
    };
    try {
      if (editingId) {
        await apiRequest(`/admin/add-ons/${editingId}`, { method: 'PATCH', body: payload, auth: true });
        setMessage('Add-on updated.');
      } else {
        await apiRequest('/admin/add-ons', { method: 'POST', body: payload, auth: true });
        setMessage('Add-on created.');
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save add-on.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (a: AddOn) => {
    setError(null);
    try {
      await apiRequest(`/admin/add-ons/${a._id}`, {
        method: 'PATCH',
        body: { isActive: !a.isActive },
        auth: true,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update add-on.');
    }
  };

  const confirmDelete = async () => {
    if (!confirmingDelete) return;
    setError(null);
    try {
      await apiRequest(`/admin/add-ons/${confirmingDelete}`, { method: 'DELETE', auth: true });
      setMessage('Add-on deleted.');
      setConfirmingDelete(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete add-on.');
    }
  };

  if (!addOns) return <LoadingState />;

  const set = (key: keyof FormState) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add-ons</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create, edit, activate or delete add-on extras for services.
        </p>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {message && <Alert type="success">{message}</Alert>}

      <form onSubmit={handleSubmit} className="card" noValidate>
        <h2 className="font-semibold text-gray-900">{editingId ? 'Edit add-on' : 'Create add-on'}</h2>
        <div className="mt-4 grid gap-0 sm:grid-cols-2">
          <Input label="Name" name="name" required minLength={2} placeholder="e.g. Tire Cleaning" {...set('name')} />
          <Input label="Price" name="price" type="number" required min={0} step="0.01" {...set('price')} />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="label">Description</label>
          <textarea
            id="description"
            className="input min-h-20"
            required
            minLength={5}
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
            Active (selectable by customers)
          </label>
        </div>
        <div className="flex gap-3">
          <Button type="submit" loading={submitting} disabled={submitting}>
            {editingId ? 'Save changes' : 'Create add-on'}
          </Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {addOns.length === 0 ? (
        <EmptyState title="No add-ons" description="Create your first add-on above." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {addOns.map((a) => (
                <tr key={a._id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{a.name}</p>
                    <p className="text-xs text-gray-500">{a.description}</p>
                  </td>
                  <td className="px-4 py-3">{formatMoney(a.price)}</td>
                  <td className="px-4 py-3"><ActiveBadge active={a.isActive} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditingId(a._id);
                          setForm({
                            name: a.name,
                            description: a.description,
                            price: String(a.price),
                            isActive: a.isActive,
                          });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        Edit
                      </Button>
                      <Button variant="secondary" onClick={() => toggleActive(a)}>
                        {a.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      {confirmingDelete === a._id ? (
                        <Button variant="danger" onClick={confirmDelete}>
                          Confirm delete
                        </Button>
                      ) : (
                        <Button variant="danger" onClick={() => setConfirmingDelete(a._id)}>
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