import type { BookingStatus, UserRole } from '@/lib/types';

const statusStyles: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-200 text-gray-600',
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return <span className={`badge ${statusStyles[status]}`}>{status}</span>;
}

export function RoleBadge({ role }: { role: UserRole }) {
  const styles =
    role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700';
  return <span className={`badge ${styles}`}>{role}</span>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="badge bg-green-100 text-green-800">Active</span>
  ) : (
    <span className="badge bg-gray-200 text-gray-600">Inactive</span>
  );
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}