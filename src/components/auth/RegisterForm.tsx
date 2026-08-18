'use client';

import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth-context';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Alert } from '@/components/States';

export default function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const t = useTranslations('Register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string; confirm?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errors: typeof fieldErrors = {};
    if (name.trim().length < 2) errors.name = t('nameError');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = t('emailError');
    if (password.length < 8) errors.password = t('passwordError');
    if (confirm !== password) errors.confirm = t('confirmError');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register(name, email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card w-full max-w-md p-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 20a6 6 0 0 1 12 0"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path d="M13 5l6 6M16 4l2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="mt-4 text-center text-2xl font-bold text-gray-900">{t('title')}</h1>
      <p className="mt-2 text-center text-sm text-gray-500">
        {t('subtitle')}
      </p>

      <form onSubmit={handleSubmit} className="mt-6" noValidate>
        {error && <Alert type="error">{error}</Alert>}

        <Input
          label={t('fullName')}
          name="name"
          autoComplete="name"
          required
          placeholder={t('namePlaceholder')}
          value={name}
          error={fieldErrors.name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label={t('email')}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={t('emailPlaceholder')}
          value={email}
          error={fieldErrors.email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label={t('password')}
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder={t('passwordPlaceholder')}
          value={password}
          error={fieldErrors.password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label={t('confirm')}
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          placeholder={t('confirmPlaceholder')}
          value={confirm}
          error={fieldErrors.confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <Button type="submit" className="w-full" loading={submitting} disabled={submitting}>
          {t('submit')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        {t('hasAccount')}{' '}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          {t('login')}
        </Link>
      </p>
    </div>
  );
}