'use client';

import { useTranslations } from 'next-intl';
import type { BookingStatus, UserRole } from '@/lib/types';

const statusStyles: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-600/25',
  CONFIRMED: 'bg-gray-900 text-gray-50 ring-gray-900/20',
  COMPLETED: 'bg-green-50 text-green-700 ring-green-600/25',
  CANCELLED: 'bg-gray-200 text-gray-600 ring-gray-500/25',
};

const statusDot: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-600',
  CONFIRMED: 'bg-gray-900',
  COMPLETED: 'bg-green-600',
  CANCELLED: 'bg-gray-400',
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const t = useTranslations('Status');
  return (
    <span className={`badge ring-1 ring-inset ${statusStyles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${statusDot[status]}`} aria-hidden="true" />
      {t(status)}
    </span>
  );
}

export function RoleBadge({ role }: { role: UserRole }) {
  const t = useTranslations('Role');
  const styles =
    role === 'ADMIN'
      ? 'bg-purple-50 text-purple-700 ring-purple-600/20'
      : 'bg-gray-100 text-gray-600 ring-gray-500/20';
  return <span className={`badge ring-1 ring-inset ${styles}`}>{t(role)}</span>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  const t = useTranslations('Common');
  return active ? (
    <span className="badge bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
      {t('active')}
    </span>
  ) : (
    <span className="badge bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-500/20">
      {t('inactive')}
    </span>
  );
}