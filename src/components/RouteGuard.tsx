'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';
import { LoadingState } from '@/components/States';

export function RequireRole({ role, children }: { role: 'CUSTOMER' | 'ADMIN'; children: ReactNode }) {
  const { user, loading, sessionError, refresh } = useAuth();
  const ar=useLocale()==='ar';
  const router = useRouter();
  const t = useTranslations('RouteGuard');

  useEffect(() => {
    if (loading || sessionError) return;
    if (!user) {
      router.replace('/login');
    } else if (user.role !== role) {
      router.replace(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    }
  }, [user, loading, sessionError, role, router]);

  if(sessionError && !user) return <div className="container-page py-16" role="alert"><h1 className="display-title text-2xl">{ar?'تعذر التحقق من الاتصال حاليًا':'Connection temporarily unavailable'}</h1><p className="mt-3 text-gray-500">{ar?'تم الاحتفاظ بجلسة الدخول ومكانك. حاول مرة أخرى.':'Your saved sign-in and current page are preserved. Try again.'}</p><button className="btn-primary mt-5" onClick={()=>void refresh()}>{ar?'إعادة المحاولة':'Retry'}</button></div>;
  if (loading || !user || user.role !== role) {
    return <LoadingState label={t('checking')} />;
  }

  return <>{children}</>;
}