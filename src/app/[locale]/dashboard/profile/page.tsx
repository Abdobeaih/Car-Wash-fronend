'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Alert, LoadingState } from '@/components/States';
import { RoleBadge } from '@/components/Badges';
import { useDateTime } from '@/lib/format';

export default function ProfilePage() {
  const { user, loading, refresh } = useAuth();
  const t = useTranslations('Profile');
  const formatDateTime = useDateTime();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone ?? '');
    }
  }, [user]);

  if (loading) return <LoadingState />;
  if (!user) return null;

  const handleProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileMessage(null);
    const trimmedPhone = phone.trim();
    if (trimmedPhone && !/^\+?\d{6,15}$/.test(trimmedPhone)) {
      setProfileError(t('phoneError'));
      return;
    }
    setSavingProfile(true);
    try {
      await apiRequest('/auth/me', {
        method: 'PATCH',
        body: { name, email, phone: trimmedPhone || undefined },
        auth: true,
      });
      await refresh();
      setProfileMessage(t('updated'));
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : t('updateFailed'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwordMismatch'));
      return;
    }
    setSavingPassword(true);
    try {
      await apiRequest('/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
        auth: true,
      });
      setPasswordMessage(t('passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : t('passwordChangeFailed'));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-sm text-gray-500">
          {t('subtitle')}
        </p>
      </div>

      <section className="card">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <h2 className="font-semibold text-gray-900">{t('accountDetails')}</h2>
        </div>
        <dl className="mt-4 grid min-w-0 gap-4 text-sm sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-gray-500">{t('name')}</dt>
            <dd className="mt-1.5 break-words font-medium text-gray-900">{user.name}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-gray-500">{t('email')}</dt>
            <dd className="mt-1.5 break-words font-medium text-gray-900">{user.email}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-gray-500">{t('phone')}</dt>
            <dd className="mt-1.5 break-words font-medium text-gray-900" dir="ltr">
              {user.phone || '—'}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-gray-500">{t('role')}</dt>
            <dd className="mt-1.5"><RoleBadge role={user.role} /></dd>
          </div>
          <div className="min-w-0">
            <dt className="text-gray-500">{t('memberSince')}</dt>
            <dd className="mt-1.5 break-words font-medium text-gray-900">{formatDateTime(user.createdAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="card">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="1.8" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.98 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H2a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 3.6 8.98a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H8a1.7 1.7 0 0 0 1.03-1.56V2a2 2 0 1 1 4 0v.09c0 .7.42 1.33 1.03 1.56a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09c.23.61.86 1.03 1.56 1.03H22a2 2 0 1 1 0 4h-.09c-.7 0-1.33.42-1.56 1.03z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <h2 className="font-semibold text-gray-900">{t('editProfile')}</h2>
            <p className="text-sm text-gray-500">{t('editSubtitle')}</p>
          </div>
        </div>
        {profileError && <div className="mt-4"><Alert type="error">{profileError}</Alert></div>}
        {profileMessage && <div className="mt-4"><Alert type="success">{profileMessage}</Alert></div>}
        <form onSubmit={handleProfile} className="mt-4">
          <Input
            label={t('name')}
            name="name"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label={t('email')}
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label={t('phone')}
            name="phone"
            type="tel"
            dir="ltr"
            placeholder={t('phonePlaceholder')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button type="submit" loading={savingProfile} disabled={savingProfile}>
            {t('saveChanges')}
          </Button>
        </form>
      </section>

      <section className="card">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="4" y="11" width="16" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <h2 className="font-semibold text-gray-900">{t('changePassword')}</h2>
            <p className="text-sm text-gray-500">
              {t('passwordSubtitle')}
            </p>
          </div>
        </div>
        {passwordError && <div className="mt-4"><Alert type="error">{passwordError}</Alert></div>}
        {passwordMessage && <div className="mt-4"><Alert type="success">{passwordMessage}</Alert></div>}
        <form onSubmit={handlePassword} className="mt-4">
          <Input
            label={t('currentPassword')}
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
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
          <Button type="submit" loading={savingPassword} disabled={savingPassword}>
            {t('changePassword')}
          </Button>
        </form>
      </section>
    </div>
  );
}