'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { useRouter } from '@/i18n/navigation';
import Button from '@/components/Button';
import OtpInput from './OtpInput';
import { Alert } from '@/components/States';

interface VerifyOtpResponse {
  message?: string;
}

interface SendOtpResponse {
  message?: string;
}

const RESEND_COOLDOWN = 60;

function getOtpErrorMessage(
  err: unknown,
  fallback: string,
  t: (key: string) => string,
): string {
  if (!(err instanceof Error)) return fallback;
  const status = (err as { status?: number }).status;
  const msg = err.message.toLowerCase();

  if (status === 429 || /rate\s*limit|too many requests?/.test(msg)) {
    return t('errorRateLimited');
  }
  if (/too many (failed )?attempts|max(imum)? attempts?/.test(msg)) {
    return t('errorMaxAttempts');
  }
  if (/expired|no longer valid/.test(msg)) {
    return t('errorExpiredOtp');
  }
  if (/resend.*(soon|wait|cooldown)|too soon/.test(msg)) {
    return t('errorResendTooSoon');
  }
  if (/invalid (otp|code)|incorrect (otp|code)|wrong (otp|code)/.test(msg)) {
    return t('errorWrongOtp');
  }
  if (status === 502 || status === 503 || /unreachable|network|gateway/.test(msg)) {
    return t('errorNetwork');
  }
  return fallback;
}

export default function VerifyEmailForm() {
  const t = useTranslations('VerifyEmail');
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') ?? '';
  const channel = searchParams.get('channel') === 'SMS' ? 'SMS' : 'EMAIL';
  const phone = searchParams.get('phone') ?? '';
  const contact = channel === 'SMS' && phone ? phone : email;

  const [otp, setOtp] = useState('');
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
      await apiRequest<SendOtpResponse>('/auth/resend-verification', {
        method: 'POST',
        body: { email },
      });
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
          {error && <Alert type="error">{error}</Alert>}

          <OtpInput value={otp} onChange={setOtp} disabled={submitting} />

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
