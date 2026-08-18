'use client';

import { useFormatter, useLocale } from 'next-intl';
import type { AppLocale } from '@/i18n/routing';
import { formatMoney } from '@/lib/money';

export function useMoney() {
  const locale = useLocale() as AppLocale;
  return (value: number) => formatMoney(locale, value);
}

export function useDate() {
  const format = useFormatter();
  return (value: string) => {
    const d = new Date(`${value}T00:00:00`);
    if (Number.isNaN(d.getTime())) return value;
    return format.dateTime(d, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
}

export function useDateTime() {
  const format = useFormatter();
  return (value?: string) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return format.dateTime(d, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
}