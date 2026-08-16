'use client';

import { useTranslations } from 'next-intl';
import type { BookingStatus, UserRole } from '@/lib/types';

const statusStyles: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-200 text-gray-600',
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const t = useTranslations('Status');
  return <span className={`badge ${statusStyles[status]}`}>{t(status)}</span>;
}

export function RoleBadge({ role }: { role: UserRole }) {
  const t = useTranslations('Role');
  const styles =
    role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700';
  return <span className={`badge ${styles}`}>{t(role)}</span>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  const t = useTranslations('Common');
  return active ? (
    <span className="badge bg-green-100 text-green-800">{t('active')}</span>
  ) : (
    <span className="badge bg-gray-200 text-gray-600">{t('inactive')}</span>
  );
}