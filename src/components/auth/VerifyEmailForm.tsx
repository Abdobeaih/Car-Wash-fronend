'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { getOtpErrorMessage } from '@/lib/otp-errors';
import { useRouter } from '@/i18n/navigation';
import Button from '@/components/Button';
import OtpInput from '@/components/ui/otp-input';
import { Alert } from '@/components/States';

interface VerifyOtpResponse {
  message?: string;
}

interface SendOtpResponse {
  message?: string;
  devOtp?: string;
}

const RESEND_COOLDOWN = 60;

export default function VerifyEmailForm() {
  const t = useTranslations('VerifyEmail');
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') ?? '';
  const channel = searchParams.get('channel') === 'SMS' ? 'SMS' : 'EMAIL';
  const phone = searchParams.get('phone') ?? '';
  const contact = channel === 'SMS' && phone ? phone : email;

  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback(() => {
    setCooldown(RESEND_COOLDOWN);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    startCooldown();
  }, [startCooldown]);

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiRequest<VerifyOtpResponse>('/auth/verify-email', {
        method: 'POST',
        body: { email, otp },
      });
      setSuccess(res.message ?? t('success'));
      setOtp('');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      setError(getOtpErrorMessage(err, t('verifyError'), t));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError(null);
    setResending(true);
    try {
      const res = await apiRequest<SendOtpResponse>('/auth/resend-verification', {
        method: 'POST',
        body: { email },
      });
      if (res.devOtp) setDevOtp(res.devOtp);
      startCooldown();
    } catch (err) {
      setError(getOtpErrorMessage(err, t('resendError'), t));
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
<div className="card mx-auto w-full max-w-md p-8">
        <Alert type="error">{t('noEmail')}</Alert>
        <p className="mt-4 text-center text-sm text-gray-600">
          <button
            type="button"
            className="font-medium text-brand-600 hover:text-brand-700"
            onClick={() => router.push('/register')}
          >
            {t('goToRegister')}
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M2 7l10 6 10-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="display-title mt-5 text-center text-2xl text-gray-900">{t('title')}</h1>
      <p className="mt-2 text-center text-sm text-gray-500">
        {t('subtitle')}
      </p>
      <p
        className="mt-1 text-center text-sm font-medium text-gray-700"
        dir={channel === 'SMS' ? 'ltr' : undefined}
      >
        {contact}
      </p>

      {devOtp && (
        <div
          className="mt-4 rounded-lg border border-dashed border-brand-300 bg-brand-50 p-3 text-center"
          dir="ltr"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {t('devCodeLabel')}
          </p>
          <p className="mt-1 text-xl font-bold tracking-[0.4em] text-brand-700">{devOtp}</p>
          <p className="mt-1 text-xs text-gray-500">{t('devCodeHint')}</p>
        </div>
      )}

      {success ? (
        <div className="mt-6">
          <Alert type="success">{success}</Alert>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="mt-6"
          noValidate
        >
          <OtpInput
            onChange={setOtp}
            disabled={submitting}
            autoFocus
            label={t('title')}
            status={error ? 'error' : 'idle'}
            errorMessage={error ?? ''}
          />

          <div className="mt-6">
            <Button
              type="submit"
              className="w-full"
              loading={submitting}
              disabled={submitting || otp.length !== 6}
            >
              {t('verify')}
            </Button>
          </div>
        </form>
      )}

      {!success && (
        <div className="mt-4 text-center">
          <button
            type="button"
            disabled={cooldown > 0 || resending}
            onClick={handleResend}
            className="text-sm font-medium text-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:text-gray-400"
          >
            {cooldown > 0 ? t('resendCountdown', { seconds: cooldown }) : t('resend')}
          </button>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-gray-600">
        <button
          type="button"
          className="font-medium text-gray-500 hover:text-gray-700"
          onClick={() => router.push('/login')}
        >
          {t('backToLogin')}
        </button>
      </p>
    </div>
  );
}
