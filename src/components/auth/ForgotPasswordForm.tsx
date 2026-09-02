'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useState, type FormEvent } from 'react';
import { apiRequest } from '@/lib/api';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Alert } from '@/components/States';

interface ForgotResponse {
  message?: string;
  resetToken?: string | null;
}

export default function ForgotPasswordForm() {
  const t = useTranslations('ForgotPassword');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetTokenIssued, setResetTokenIssued] = useState(false);

  const requestCode = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      const res = await apiRequest<ForgotResponse>('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });
      setInfo(res.message ?? '');
      if (res.resetToken) {
        setToken(res.resetToken);
        setResetTokenIssued(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('requestError'));
    } finally {
      setSubmitting(false);
    }
  };

  const resetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (newPassword !== confirmPassword) {
      setError(t('mismatchError'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiRequest<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: { email, token, newPassword },
      });
      setSuccess(res.message ?? t('success'));
      setResetTokenIssued(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('resetError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="display-title mt-5 text-center text-2xl text-gray-900">{t('title')}</h1>
      <p className="mt-2 text-center text-sm text-gray-500">
        {t('subtitle')}
      </p>

      {success && (
        <div className="mt-4">
          <Alert type="success">{success}</Alert>
          <p className="mt-4 text-center text-sm text-gray-600">
            <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
              {t('backToLogin')}
            </Link>
          </p>
        </div>
      )}

      {!success && (
        <>
          {!resetTokenIssued ? (
            <form onSubmit={requestCode} className="mt-6" noValidate>
              {error && <Alert type="error">{error}</Alert>}
              <Input
                label={t('email')}
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" className="w-full" loading={submitting} disabled={submitting}>
                {t('sendCode')}
              </Button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="mt-6" noValidate>
              {info && <div className="mb-4"><Alert type="info">{info}</Alert></div>}
              {error && <Alert type="error">{error}</Alert>}
              <Input
                label={t('resetCode')}
                name="token"
                required
                autoComplete="off"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <Input
                label={t('newPassword')}
                name="newPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                label={t('confirmPassword')}
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button type="submit" className="w-full" loading={submitting} disabled={submitting}>
                {t('reset')}
              </Button>
              <p className="mt-4 text-center text-sm">
                <button
                  type="button"
                  className="font-medium text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setResetTokenIssued(false);
                    setToken('');
                    setError(null);
                    setInfo(null);
                  }}
                >
                  {t('resend')}
                </button>
              </p>
            </form>
          )}
        </>
      )}

      <p className="mt-6 text-center text-sm text-gray-600">
        {t('remembered')}{' '}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          {t('backToLogin')}
        </Link>
      </p>
    </div>
  );
}