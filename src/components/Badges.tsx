'use client';

import { useTranslations } from 'next-intl';
import type { BookingStatus, UserRole } from '@/lib/types';

const statusStyles: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  CONFIRMED: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  COMPLETED: 'bg-green-50 text-green-700 ring-green-600/20',
  CANCELLED: 'bg-gray-100 text-gray-600 ring-gray-500/20',
};

const statusDot: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-500',
  CONFIRMED: 'bg-blue-500',
  COMPLETED: 'bg-green-500',
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