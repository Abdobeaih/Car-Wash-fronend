'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function BackToDashboard({ className = '' }: { className?: string }) {
  const { user, loading } = useAuth();
  if (loading || !user) return null;
  return (
    <Link href="/dashboard" className={`btn-secondary ${className}`}>
      Back to dashboard
    </Link>
  );
}
