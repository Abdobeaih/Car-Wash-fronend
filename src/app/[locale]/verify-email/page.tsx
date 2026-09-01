import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import VerifyEmailForm from '@/components/auth/VerifyEmailForm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('verifyEmailTitle'),
    description: t('verifyEmailDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function VerifyEmailPage() {
  return (
    <div className="container-page flex justify-center px-4 py-10 sm:py-16">
      <VerifyEmailForm />
    </div>
  );
}
