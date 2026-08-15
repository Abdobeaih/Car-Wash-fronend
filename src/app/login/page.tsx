import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { LoadingState } from '@/components/States';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Log in to your Mobile CarCare account to manage vehicles and bookings.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="container-page flex justify-center py-16">
      <Suspense fallback={<LoadingState label="Loading…" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}