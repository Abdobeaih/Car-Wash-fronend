import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import BookingFlow from './BookingFlow';
import { LoadingState } from '@/components/States';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('bookTitle'),
    description: t('bookDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function BookPage() {
  const t = await getTranslations('Book');
  return (
    <Suspense fallback={<LoadingState label={t('loading')} />}>
      <BookingFlow />
    </Suspense>
  );
}