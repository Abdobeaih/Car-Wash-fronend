'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Alert, LoadingState } from '@/components/States';
import { RoleBadge, formatDateTime } from '@/components/Badges';

export default function ProfilePage() {
  const { user, loading, refresh } = useAuth();

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

  if (loading) return <LoadingState label="Loading profile…" />;
  if (!user) return null;

  const handleProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileMessage(null);
    setSavingProfile(true);
    try {
      await apiRequest('/auth/me', { method: 'PATCH', body: { name, email }, auth: true });
      await refresh();
      setProfileMessage('Profile updated.');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    setSavingPassword(true);
    try {
      await apiRequest('/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
        auth: true,
      });
      setPasswordMessage('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          View your account details and manage your sign-in information.
        </p>
      </div>

      <section className="card">
        <h2 className="font-semibold text-gray-900">Account details</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">Name</dt>
            <dd className="mt-1 font-medium text-gray-900">{user.name}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Email</dt>
            <dd className="mt-1 font-medium text-gray-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Role</dt>
            <dd className="mt-1"><RoleBadge role={user.role} /></dd>
          </div>
          <div>
            <dt className="text-gray-500">Member since</dt>
            <dd className="mt-1 font-medium text-gray-900">{formatDateTime(user.createdAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="card">
        <h2 className="font-semibold text-gray-900">Edit profile</h2>
        <p className="mt-1 text-sm text-gray-500">Update your name or email address.</p>
        {profileError && <div className="mt-4"><Alert type="error">{profileError}</Alert></div>}
        {profileMessage && <div className="mt-4"><Alert type="success">{profileMessage}</Alert></div>}
        <form onSubmit={handleProfile} className="mt-4">
          <Input
            label="Name"
            name="name"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" loading={savingProfile} disabled={savingProfile}>
            Save changes
          </Button>
        </form>
      </section>

      <section className="card">
        <h2 className="font-semibold text-gray-900">Change password</h2>
        <p className="mt-1 text-sm text-gray-500">
          Enter your current password and choose a new one (8+ characters).
        </p>
        {passwordError && <div className="mt-4"><Alert type="error">{passwordError}</Alert></div>}
        {passwordMessage && <div className="mt-4"><Alert type="success">{passwordMessage}</Alert></div>}
        <form onSubmit={handlePassword} className="mt-4">
          <Input
            label="Current password"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
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
          <Button type="submit" loading={savingPassword} disabled={savingPassword}>
            Change password
          </Button>
        </form>
      </section>
    </div>
  );
}