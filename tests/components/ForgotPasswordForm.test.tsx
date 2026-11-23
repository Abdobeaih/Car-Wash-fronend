import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { renderWithIntl } from '../test-utils';

const h = vi.hoisted(() => ({ apiRequest: vi.fn() }));

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return { ...actual, apiRequest: h.apiRequest };
});
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

async function reachCodeStep() {
  const user = userEvent.setup();
  h.apiRequest.mockResolvedValueOnce({ message: 'Code sent' });
  await user.type(screen.getByLabelText('Email'), 'abdo@test.com');
  await user.click(screen.getByRole('button', { name: 'Send reset code' }));
  await screen.findByLabelText('Reset code');
  return user;
}

describe('ForgotPasswordForm', () => {
  beforeEach(() => h.apiRequest.mockReset());

  it('requests a reset code for the entered email', async () => {
    renderWithIntl(<ForgotPasswordForm />);
    await reachCodeStep();
    expect(h.apiRequest).toHaveBeenCalledWith('/auth/forgot-password', {
      method: 'POST',
      body: { email: 'abdo@test.com' },
    });
  });

  it('strips non-digits from the reset code as it is typed', async () => {
    renderWithIntl(<ForgotPasswordForm />);
    const user = await reachCodeStep();
    const otp = screen.getByLabelText('Reset code');
    await user.type(otp, '12ab34');
    expect(otp).toHaveValue('1234');
  });

  it('rejects codes that are not exactly 6 digits', async () => {
    renderWithIntl(<ForgotPasswordForm />);
    const user = await reachCodeStep();
    await user.type(screen.getByLabelText('Reset code'), '123');
    await user.type(screen.getByLabelText('New password'), 'password123');
    await user.type(screen.getByLabelText('Confirm new password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('6-digit code');
    expect(h.apiRequest).toHaveBeenCalledTimes(1);
  });

  it('blocks a mismatched password confirmation before calling the API', async () => {
    renderWithIntl(<ForgotPasswordForm />);
    const user = await reachCodeStep();
    await user.type(screen.getByLabelText('Reset code'), '123456');
    await user.type(screen.getByLabelText('New password'), 'password123');
    await user.type(screen.getByLabelText('Confirm new password'), 'password999');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('do not match');
    expect(h.apiRequest).toHaveBeenCalledTimes(1);
  });

  it('resets the password with email, code and the new password', async () => {
    renderWithIntl(<ForgotPasswordForm />);
    const user = await reachCodeStep();
    h.apiRequest.mockResolvedValueOnce({});
    await user.type(screen.getByLabelText('Reset code'), '123456');
    await user.type(screen.getByLabelText('New password'), 'password123');
    await user.type(screen.getByLabelText('Confirm new password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));
    await waitFor(() =>
      expect(h.apiRequest).toHaveBeenLastCalledWith('/auth/reset-password', {
        method: 'POST',
        body: { email: 'abdo@test.com', otp: '123456', newPassword: 'password123' },
      }),
    );
    expect(await screen.findByText('Password reset successfully.')).toBeInTheDocument();
  });

  it('surfaces request failures instead of moving forward', async () => {
    const user = userEvent.setup();
    h.apiRequest.mockRejectedValueOnce(new Error('No account with that email.'));
    renderWithIntl(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText('Email'), 'ghost@test.com');
    await user.click(screen.getByRole('button', { name: 'Send reset code' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to request a reset code.');
    expect(screen.queryByLabelText('Reset code')).not.toBeInTheDocument();
  });
});
