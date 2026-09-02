'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth-context';
import Button from '@/components/Button';
import Input, { Select } from '@/components/Input';
import { Alert } from '@/components/States';

interface CountryOption {
  code: string;
  label: string;
  dial: string;
}

const FALLBACK_COUNTRIES: CountryOption[] = [
  { code: 'US', label: '🇺🇸 United States (+1)', dial: '+1' },
  { code: 'GB', label: '🇬🇧 United Kingdom (+44)', dial: '+44' },
  { code: 'SA', label: '🇸🇦 Saudi Arabia (+966)', dial: '+966' },
  { code: 'AE', label: '🇦🇪 United Arab Emirates (+971)', dial: '+971' },
  { code: 'EG', label: '🇪🇬 Egypt (+20)', dial: '+20' },
  { code: 'JO', label: '🇯🇴 Jordan (+962)', dial: '+962' },
  { code: 'KW', label: '🇰🇼 Kuwait (+965)', dial: '+965' },
  { code: 'QA', label: '🇶🇦 Qatar (+974)', dial: '+974' },
  { code: 'BH', label: '🇧🇭 Bahrain (+973)', dial: '+973' },
  { code: 'OM', label: '🇴🇲 Oman (+968)', dial: '+968' },
  { code: 'IN', label: '🇮🇳 India (+91)', dial: '+91' },
  { code: 'PK', label: '🇵🇰 Pakistan (+92)', dial: '+92' },
];

interface RestCountry {
  cca2: string;
  flag: string;
  name: { common: string };
  idd?: { root?: string; suffixes?: string[] };
}

function toCountryOption(c: RestCountry): CountryOption | null {
  if (!c.idd?.root || !c.idd.suffixes?.length) return null;
  const dial = `${c.idd.root}${c.idd.suffixes[0]}`;
  return {
    code: c.cca2,
    dial,
    label: `${c.flag} ${c.name.common} (${dial})`,
  };
}

export default function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [countryCode, setCountryCode] = useState(() => (locale === 'ar' ? 'SA' : 'US'));
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; phone?: string; password?: string; confirm?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const applyCountries = (options: CountryOption[]) => {
      if (!active) return;
      setCountries(options);
      setCountryCode((cur) => {
        if (cur && options.some((o) => o.code === cur)) return cur;
        const preferred = options.find((o) => o.code === (locale === 'ar' ? 'SA' : 'US'));
        return (preferred ?? options[0])?.code;
      });
    };

    const load = async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: RestCountry[] = await res.json();
        const options = data
          .map(toCountryOption)
          .filter((o): o is CountryOption => o !== null)
          .sort((a, b) => a.label.localeCompare(b.label));
        applyCountries(options.length ? options : FALLBACK_COUNTRIES);
      } catch {
        applyCountries(FALLBACK_COUNTRIES);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [locale]);

  const dial = countries.find((c) => c.code === countryCode)?.dial ?? '';

  const validate = () => {
    const errors: typeof fieldErrors = {};
    if (name.trim().length < 2) errors.name = t('nameError');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = t('emailError');
    if (!/^\d{6,15}$/.test(phone)) errors.phone = t('phoneError');
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
      await register({
        name,
        email,
        phone: `${dial}${phone}`,
        password,
        countryCode,
      });
      router.push(
        `/verify-email?email=${encodeURIComponent(email)}&channel=EMAIL&phone=${encodeURIComponent(`${dial}${phone}`)}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setSubmitting(false);
    }
  };

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
        <Select
          label={t('country')}
          name="country"
          required
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
        >
          {countries.length === 0 ? (
            <option value="">{t('countryLoading')}</option>
          ) : (
            countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))
          )}
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