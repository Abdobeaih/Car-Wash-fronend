import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import LoginForm from '@/components/auth/LoginForm';
import AuthShell from '@/components/auth/AuthShell';
import { LoadingState } from '@/components/States';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('loginTitle'),
    description: t('loginDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage() {
  const t = await getTranslations('Common');
  return (
    <AuthShell>
      <Suspense fallback={<LoadingState label={t('loading')} />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}