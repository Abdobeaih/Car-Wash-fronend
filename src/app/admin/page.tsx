'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { AdminDashboard } from '@/lib/types';
import { LoadingState, ErrorState } from '@/components/States';
import { formatMoney } from '@/components/Badges';

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await apiRequest<AdminDashboard>('/admin/dashboard', { auth: true });
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard.');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <LoadingState />;

  const metrics = [
    { label: 'Total bookings', value: String(data.totalBookings) },
    { label: 'Pending', value: String(data.pendingBookings) },
    { label: 'Confirmed', value: String(data.confirmedBookings) },
    { label: 'Completed', value: String(data.completedBookings) },
    { label: 'Customers', value: String(data.customers) },
    { label: 'Revenue', value: formatMoney(data.revenue) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your car care business.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} className="card">
            <p className="text-sm text-gray-500">{m.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900">Quick actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/bookings" className="btn-secondary justify-start">
            Manage bookings
          </Link>
          <Link href="/admin/services" className="btn-secondary justify-start">
            Manage services
          </Link>
          <Link href="/admin/calendar" className="btn-secondary justify-start">
            View calendar
          </Link>
        </div>
      </div>
    </div>
  );
}