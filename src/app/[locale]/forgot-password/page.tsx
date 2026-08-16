import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('forgotPasswordTitle'),
    description: t('forgotPasswordDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function ForgotPasswordPage() {
  return (
    <div className="container-page flex justify-center py-10 sm:py-16">
      <ForgotPasswordForm />
    </div>
  );
}