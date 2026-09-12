'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api';
import { getOtpErrorMessage } from '@/lib/otp-errors';
import Button from '@/components/Button';
import Input, { Select } from '@/components/Input';
import { Alert } from '@/components/States';
import { countries as allCountries } from '@/lib/countries';
import OtpInput from '@/components/ui/otp-input';

const RESEND_COOLDOWN = 60;

interface VerifyOtpResponse {
  message?: string;
}

interface SendOtpResponse {
  message?: string;
}

type Step = 'register' | 'verify';

interface CountryOption {
  code: string;
  label: string;
  dial: string;
}

const STATIC_COUNTRIES: CountryOption[] = allCountries.map((c) => ({
  code: c.cca2,
  label: `${c.flag} ${c.name} (${c.dialCode})`,
  dial: c.dialCode,
}));

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  phone?: string;
}

/**
 * Combines a dial code (e.g. "+20") with the typed number into the payload the
 * API expects. The API keeps `dialCode` and `phone` as separate fields:
 *   - if the user already typed a full international number, the dial code is
 *     stripped from the digits so it is never duplicated;
 *   - a national leading "0" is dropped (Egyptian mobiles start with 010…).
 * The backend joins them exactly once into e.g. "+201012345678".
 */
function buildPhonePayload(
  dialCode: string,
  rawPhone: string,
): { phone?: string; dialCode?: string } {
  const digits = rawPhone.replace(/[^\d]/g, '');
  if (!digits) return {};
  const dial = dialCode.replace(/[^\d]/g, '');
  if (dial) {
    let national = digits;
    if (national.startsWith(dial)) national = national.slice(dial.length);
    national = national.replace(/^0+/, '');
    if (national) return { dialCode: `+${dial}`, phone: national };
  }
  return { phone: `+${digits}` };
}

export default function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Register');
  const vt = useTranslations('VerifyEmail');

  const [step, setStep] = useState<Step>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countries] = useState<CountryOption[]>(STATIC_COUNTRIES);
  const [countryCode, setCountryCode] = useState(() => (locale === 'ar' ? 'SA' : 'US'));
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [otp, setOtp] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const dial = countries.find((c) => c.code === countryCode)?.dial ?? '';

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

  const validate = () => {
    const errors: FieldErrors = {};
    if (name.trim().length < 2) errors.name = t('nameError');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = t('emailError');
    if (!/^\d{6,15}$/.test(phone)) errors.phone = t('phoneError');
    if (password.length < 8) errors.password = t('passwordError');
    if (confirm !== password) errors.confirm = t('confirmError');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { dialCode: normalizedDial, phone: normalizedPhone } = buildPhonePayload(
        countries.find((c) => c.code === countryCode)?.dial ?? '',
        phone,
      );
      await register({
        name,
        email,
        password,
        confirmPassword: confirm,
        country: countryCode,
        dialCode: normalizedDial,
        phone: normalizedPhone,
        countryCode,
      });
      setStep('verify');
      startCooldown();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiRequest<VerifyOtpResponse>('/auth/verify-email', {
        method: 'POST',
        body: { email, otp },
      });
      setSuccess(res.message ?? vt('success'));
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      setError(getOtpErrorMessage(err, vt('verifyError'), vt));
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
      setError(getOtpErrorMessage(err, vt('resendError'), vt));
    } finally {
      setResending(false);
    }
  };

  if (step === 'verify') {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M2 7l10 6 10-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="display-title mt-5 text-center text-2xl text-gray-900">{vt('title')}</h1>
        <p className="mt-2 text-center text-sm text-gray-500">
          {vt('subtitle')}
        </p>
        <p className="mt-1 text-center text-sm font-medium text-gray-700" dir="ltr">
          {email}
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
            <OtpInput
              onChange={setOtp}
              disabled={submitting}
              autoFocus
              label={vt('title')}
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
                {vt('verify')}
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
              {cooldown > 0 ? vt('resendCountdown', { seconds: cooldown }) : vt('resend')}
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          <button
            type="button"
            className="font-medium text-gray-500 hover:text-gray-700"
            onClick={() => router.push('/login')}
          >
            {vt('backToLogin')}
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
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
      <h1 className="display-title mt-5 text-center text-2xl text-gray-900">{t('title')}</h1>
      <p className="mt-2 text-center text-sm text-gray-500">
        {t('subtitle')}
      </p>

      <form onSubmit={handleRegister} className="mt-6" noValidate>
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
        <Select
          label={t('country')}
          name="country"
          required
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </Select>
        {dial && !fieldErrors.phone && (
          <p className="-mt-2 mb-4 text-sm text-gray-500">
            {t('dialCode')}: <span dir="ltr">{dial}</span>
          </p>
        )}
        <Input
          label={t('phone')}
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          required
          placeholder={t('phonePlaceholder')}
          value={phone}
          error={fieldErrors.phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
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