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
    }
  }, [user]);

  if (loading) return <LoadingState />;
  if (!user) return null;

  const handleProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileMessage(null);
    setSavingProfile(true);
    try {
      await apiRequest('/auth/me', { method: 'PATCH', body: { name, email }, auth: true });
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
        <p className="mt-1 text-sm text-gray-500">
          {t('subtitle')}
        </p>
      </div>

      <section className="card">
        <h2 className="font-semibold text-gray-900">{t('accountDetails')}</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">{t('name')}</dt>
            <dd className="mt-1 font-medium text-gray-900">{user.name}</dd>
          </div>
          <div>
            <dt className="text-gray-500">{t('email')}</dt>
            <dd className="mt-1 font-medium text-gray-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-gray-500">{t('role')}</dt>
            <dd className="mt-1"><RoleBadge role={user.role} /></dd>
          </div>
          <div>
            <dt className="text-gray-500">{t('memberSince')}</dt>
            <dd className="mt-1 font-medium text-gray-900">{formatDateTime(user.createdAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="card">
        <h2 className="font-semibold text-gray-900">{t('editProfile')}</h2>
        <p className="mt-1 text-sm text-gray-500">{t('editSubtitle')}</p>
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
          <Button type="submit" loading={savingProfile} disabled={savingProfile}>
            {t('saveChanges')}
          </Button>
        </form>
      </section>

      <section className="card">
        <h2 className="font-semibold text-gray-900">{t('changePassword')}</h2>
        <p className="mt-1 text-sm text-gray-500">
          {t('passwordSubtitle')}
        </p>
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