'use client';

import Link from 'next/link';
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
      setError(err instanceof Error ? err.message : 'Failed to request a reset code.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiRequest<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: { email, token, newPassword },
      });
      setSuccess(res.message ?? 'Password reset successfully.');
      setResetTokenIssued(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card mx-auto w-full max-w-md">
      <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
      <p className="mt-1 text-sm text-gray-500">
        Enter your account email to receive a reset code, then choose a new password.
      </p>

      {success && (
        <div className="mt-4">
          <Alert type="success">{success}</Alert>
          <p className="mt-4 text-center text-sm text-gray-600">
            <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Back to login
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
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" className="w-full" loading={submitting} disabled={submitting}>
                Send reset code
              </Button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="mt-6" noValidate>
              {info && <div className="mb-4"><Alert type="info">{info}</Alert></div>}
              {error && <Alert type="error">{error}</Alert>}
              <Input
                label="Reset code"
                name="token"
                required
                autoComplete="off"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <Input
                label="New password"
                name="newPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                label="Confirm new password"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button type="submit" className="w-full" loading={submitting} disabled={submitting}>
                Reset password
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
                  Resend code
                </button>
              </p>
            </form>
          )}
        </>
      )}

      <p className="mt-6 text-center text-sm text-gray-600">
        Remembered it?{' '}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Back to login
        </Link>
      </p>
    </div>
  );
}