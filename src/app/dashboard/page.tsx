'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { Booking, Vehicle } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { LoadingState, EmptyState, ErrorState } from '@/components/States';
import { StatusBadge, RoleBadge, formatDate, formatMoney } from '@/components/Badges';

export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [b, v] = await Promise.all([
        apiRequest<Booking[]>('/bookings', { auth: true }),
        apiRequest<Vehicle[]>('/vehicles', { auth: true }),
      ]);
      setBookings(b);
      setVehicles(v);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard.');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!bookings || !vehicles) return <LoadingState />;

  const upcoming = bookings.find((b) => b.status === 'PENDING' || b.status === 'CONFIRMED');
  const recent = bookings.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your vehicles and bookings from here.</p>
      </div>

      <section className="card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
            {(user?.name?.[0] ?? 'U').toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RoleBadge role={user?.role ?? 'CUSTOMER'} />
          <Link
            href="/dashboard/profile"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Edit profile
          </Link>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Upcoming booking</h2>
            <Link href="/book" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Book a service
            </Link>
          </div>
          {upcoming ? (
            <div className="mt-4">
              <StatusBadge status={upcoming.status} />
              <h3 className="mt-2 font-medium text-gray-900">
                {(upcoming.serviceId as { name?: string })?.name ?? 'Service'}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {formatDate(upcoming.date)} · {upcoming.startTime} – {upcoming.endTime}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {formatMoney(upcoming.total)} · {upcoming.location.city}
              </p>
              <Link
                href={`/dashboard/bookings/${upcoming._id}`}
                className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                View details →
              </Link>
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-gray-50 p-5 text-center">
              <p className="text-sm text-gray-500">No upcoming booking.</p>
              <Link href="/book" className="btn-primary mt-3">
                Book your first service
              </Link>
            </div>
          )}
        </section>

        <section className="card">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">My vehicles</h2>
            <Link href="/dashboard/vehicles" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Manage
            </Link>
          </div>
          {vehicles.length === 0 ? (
            <div className="mt-4 rounded-xl bg-gray-50 p-5 text-center">
              <p className="text-sm text-gray-500">No vehicles yet.</p>
              <Link href="/dashboard/vehicles" className="btn-secondary mt-3">
                Add a vehicle
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-gray-100">
              {vehicles.slice(0, 3).map((v) => (
                <li key={v._id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {v.brand} {v.model}
                    </p>
                    <p className="text-sm text-gray-500">
                      {v.year} · {v.color} · {v.plateNumber}
                    </p>
                  </div>
                  <span className="badge bg-gray-100 text-gray-600">{v.vehicleType}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent bookings</h2>
          <Link href="/dashboard/bookings" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState title="No bookings yet" description="Your bookings will appear here." />
        ) : (
          <ul className="mt-4 divide-y divide-gray-100">
            {recent.map((b) => (
              <li key={b._id}>
                <Link
                  href={`/dashboard/bookings/${b._id}`}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {(b.serviceId as { name?: string })?.name ?? 'Service'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(b.date)} · {b.startTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">{formatMoney(b.total)}</span>
                    <StatusBadge status={b.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}