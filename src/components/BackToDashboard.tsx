'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth-context';

export default function BackToDashboard({ className = '' }: { className?: string }) {
  const { user, loading } = useAuth();
  const t = useTranslations('Common');
  if (loading || !user) return null;
  return (
    <Link href="/dashboard" className={`btn-secondary ${className}`}>
      {t('back')}
    </Link>
  );
}