import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProfilePage from '@/app/[locale]/dashboard/profile/page';
import type { AuthContextValue } from '@/lib/auth-context';
import type { User } from '@/lib/types';
import { renderWithIntl } from '../test-utils';

const h = vi.hoisted(() => ({
  apiRequest: vi.fn(),
  refresh: vi.fn(),
}));

const customer: User = {
  _id: 'u1',
  name: 'Abdo Beaih',
  email: 'abdo@test.com',
  phone: '+201012345678',
  role: 'CUSTOMER',
  createdAt: '2026-01-01T00:00:00Z',
};

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: customer, loading: false, refresh: h.refresh }) as unknown as AuthContextValue,
}));
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return { ...actual, apiRequest: h.apiRequest };
});

describe('ProfilePage', () => {
  beforeEach(() => {
    h.apiRequest.mockReset();
    h.refresh.mockReset();
  });

  it('shows the email read-only with a reason, keeping name and phone editable', () => {
    renderWithIntl(<ProfilePage />);
    const email = screen.getByLabelText('Email');
    expect(email).toHaveAttribute('readonly');
    expect(email).toHaveValue('abdo@test.com');
    expect(screen.getByText(/sign-in and recovery address/)).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeEnabled();
    expect(screen.getByLabelText('Phone number')).toBeEnabled();
  });

  it('saves name and phone without sending the email field', async () => {
    h.apiRequest.mockResolvedValueOnce({});
    renderWithIntl(<ProfilePage />);
    const user = userEvent.setup();
    const nameInput = screen.getByLabelText('Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Abdo New');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(h.apiRequest).toHaveBeenCalledTimes(1));
    const [path, init] = h.apiRequest.mock.calls[0] as [string, { method: string; body: Record<string, unknown> }];
    expect(path).toBe('/auth/me');
    expect(init.method).toBe('PATCH');
    expect(init.body).toEqual({ name: 'Abdo New', phone: '+201012345678' });
    expect(init.body).not.toHaveProperty('email');
    await waitFor(() => expect(h.refresh).toHaveBeenCalled());
    expect(await screen.findByText('Profile updated.')).toBeInTheDocument();
  });

  it('omits the phone entirely when the field is cleared', async () => {
    h.apiRequest.mockResolvedValueOnce({});
    renderWithIntl(<ProfilePage />);
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText('Phone number'));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(h.apiRequest).toHaveBeenCalledTimes(1));
    const [, init] = h.apiRequest.mock.calls[0] as [string, { body: Record<string, unknown> }];
    expect(init.body.phone).toBeUndefined();
  });

  it('rejects an invalid phone number before calling the API', async () => {
    renderWithIntl(<ProfilePage />);
    const user = userEvent.setup();
    const phone = screen.getByLabelText('Phone number');
    await user.clear(phone);
    await user.type(phone, 'abc');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('Enter a valid phone number.')).toBeInTheDocument();
    expect(h.apiRequest).not.toHaveBeenCalled();
  });

  it('blocks a mismatched password change before calling the API', async () => {
    renderWithIntl(<ProfilePage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Current password'), 'oldpassword');
    await user.type(screen.getByLabelText('New password'), 'password123');
    await user.type(screen.getByLabelText('Confirm new password'), 'password999');
    await user.click(screen.getByRole('button', { name: 'Change password' }));
    expect(await screen.findByText(/do not match/)).toBeInTheDocument();
    expect(h.apiRequest).not.toHaveBeenCalled();
  });

  it('changes the password and clears the password fields', async () => {
    h.apiRequest.mockResolvedValueOnce({});
    renderWithIntl(<ProfilePage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Current password'), 'oldpassword');
    await user.type(screen.getByLabelText('New password'), 'password123');
    await user.type(screen.getByLabelText('Confirm new password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Change password' }));
    await waitFor(() =>
      expect(h.apiRequest).toHaveBeenCalledWith('/auth/change-password', {
        method: 'POST',
        body: { currentPassword: 'oldpassword', newPassword: 'password123' },
        auth: true,
      }),
    );
    expect(await screen.findByText('Password changed successfully.')).toBeInTheDocument();
    expect(screen.getByLabelText('Current password')).toHaveValue('');
  });

  it('shows the server error when the save fails', async () => {
    h.apiRequest.mockRejectedValueOnce(new Error('Server rejected the update.'));
    renderWithIntl(<ProfilePage />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('Server rejected the update.')).toBeInTheDocument();
  });
});
