import type { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create your free Mobile CarCare account to book mobile car care services.',
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <div className="container-page flex justify-center py-16">
      <RegisterForm />
    </div>
  );
}