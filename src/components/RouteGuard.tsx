'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';
import { LoadingState } from '@/components/States';

export function RequireRole({ role, children }: { role: 'CUSTOMER' | 'ADMIN'; children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    } else if (user.role !== role) {
      router.replace(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    }
  }, [user, loading, role, router]);

  if (loading || !user || user.role !== role) {
    return <LoadingState label="Checking access…" />;
  }

  return <>{children}</>;
}