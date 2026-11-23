import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VerifyEmailForm from '@/components/auth/VerifyEmailForm';
import { ApiError } from '@/lib/api';
import { renderWithIntl } from '../test-utils';

const h = vi.hoisted(() => ({
  push: vi.fn(),
  apiRequest: vi.fn(),
  params: new URLSearchParams('email=abdo@test.com'),
}));

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return { ...actual, apiRequest: h.apiRequest };
});
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: h.push, replace: vi.fn() }),
}));
vi.mock('next/navigation', () => ({
  useSearchParams: () => h.params,
}));

describe('VerifyEmailForm', () => {
  beforeEach(() => {
    h.push.mockReset();
    h.apiRequest.mockReset();
    h.params = new URLSearchParams('email=abdo@test.com');
  });

  it('asks for an email when the link carries none', () => {
    h.params = new URLSearchParams();
    renderWithIntl(<VerifyEmailForm />);
    expect(screen.getByRole('alert')).toHaveTextContent('No email provided');
  });

  it('starts the resend cooldown on mount', () => {
    renderWithIntl(<VerifyEmailForm />);
    expect(screen.getByRole('button', { name: /Resend code in/ })).toBeDisabled();
  });

  it('verifies a typed 6-digit code against the email from the link', async () => {
    h.apiRequest.mockResolvedValueOnce({});
    renderWithIntl(<VerifyEmailForm />);
    const user = userEvent.setup();
    const cells = screen.getAllByRole('textbox');
    expect(cells).toHaveLength(6);
    await user.click(cells[0]);
    await user.keyboard('123456');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Verify' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Verify' }));
    await waitFor(() =>
      expect(h.apiRequest).toHaveBeenCalledWith('/auth/verify-email', {
        method: 'POST',
        body: { email: 'abdo@test.com', otp: '123456' },
      }),
    );
    expect(await screen.findByText(/verified successfully/)).toBeInTheDocument();
  });

  it('maps a 429 from the server to the rate-limit copy', async () => {
    h.apiRequest.mockRejectedValueOnce(new ApiError(429, 'Too Many Requests'));
    renderWithIntl(<VerifyEmailForm />);
    const user = userEvent.setup();
    const cells = screen.getAllByRole('textbox');
    expect(cells).toHaveLength(6);
    await user.click(cells[0]);
    await user.keyboard('123456');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Verify' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Verify' }));
    expect((await screen.findAllByText(/Too many requests\. Please wait/)).length).toBeGreaterThan(0);
    expect(h.push).not.toHaveBeenCalled();
  });
});
