import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import RegisterForm from '@/components/auth/RegisterForm';
import AuthShell from '@/components/auth/AuthShell';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('registerTitle'),
    description: t('registerDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function RegisterPage() {
  return (
    <AuthShell>
      <RegisterForm />
    </AuthShell>
  );
}