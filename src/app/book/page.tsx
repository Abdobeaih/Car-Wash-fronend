import type { Metadata } from 'next';
import { Suspense } from 'react';
import BookingFlow from './BookingFlow';
import { LoadingState } from '@/components/States';

export const metadata: Metadata = {
  title: 'Book a Service',
  description:
    'Book a professional mobile car care service — choose your service, vehicle, add-ons, location and an available time.',
  robots: { index: false, follow: false },
};

export default function BookPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading booking…" />}>
      <BookingFlow />
    </Suspense>
  );
}