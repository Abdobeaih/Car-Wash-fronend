import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RegisterForm from '@/components/auth/RegisterForm';
import type { AuthContextValue, RegisterInput } from '@/lib/auth-context';
import { renderWithIntl } from '../test-utils';

const h = vi.hoisted(() => ({
  push: vi.fn(),
  register: vi.fn(),
  apiRequest: vi.fn(),
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ register: h.register }) as unknown as AuthContextValue,
}));
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return { ...actual, apiRequest: h.apiRequest };
});
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: h.push, replace: vi.fn() }),
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Full name'), 'Abdo Beaih');
  await user.type(screen.getByLabelText('Email'), 'abdo@test.com');
  await user.selectOptions(screen.getByLabelText('Country'), 'EG');
  await user.type(screen.getByLabelText('Phone number'), '01012345678');
  await user.type(screen.getByLabelText('Password'), 'password123');
  await user.type(screen.getByLabelText('Confirm password'), 'password123');
}

describe('RegisterForm', () => {
  beforeEach(() => {
    h.push.mockReset();
    h.register.mockReset();
    h.apiRequest.mockReset();
  });

  it('validates all fields before calling the API', async () => {
    const user = userEvent.setup();
    renderWithIntl(<RegisterForm />);
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(h.register).not.toHaveBeenCalled();
    const form = screen.getByRole('button', { name: 'Create account' }).closest('form');
    const alerts = within(form as HTMLElement).getAllByRole('alert');
    expect(alerts.map((a) => a.textContent)).toEqual([
      'Name must be at least 2 characters.',
      'Enter a valid email address.',
      'Enter a valid 11-digit phone number.',
      'Password must be at least 8 characters.',
    ]);
  });

  it('rejects a phone number that is not 11 digits', async () => {
    const user = userEvent.setup();
    renderWithIntl(<RegisterForm />);
    await fillValidForm(user);
    await user.clear(screen.getByLabelText('Phone number'));
    await user.type(screen.getByLabelText('Phone number'), '0101');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(h.register).not.toHaveBeenCalled();
    expect(screen.getByText('Enter a valid 11-digit phone number.')).toBeInTheDocument();
  });

  it('rejects mismatched password confirmation', async () => {
    const user = userEvent.setup();
    renderWithIntl(<RegisterForm />);
    await fillValidForm(user);
    await user.clear(screen.getByLabelText('Confirm password'));
    await user.type(screen.getByLabelText('Confirm password'), 'password999');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(h.register).not.toHaveBeenCalled();
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
  });

  it('normalizes an Egyptian national number into dialCode + phone parts', async () => {
    const user = userEvent.setup();
    h.register.mockResolvedValueOnce({ user: { _id: 'u1' }, message: 'ok' });
    renderWithIntl(<RegisterForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    await waitFor(() => expect(h.register).toHaveBeenCalledTimes(1));
    const input = h.register.mock.calls[0][0] as RegisterInput;
    expect(input).toMatchObject({
      name: 'Abdo Beaih',
      email: 'abdo@test.com',
      country: 'EG',
      countryCode: 'EG',
      dialCode: '+20',
      phone: '1012345678',
    });
    expect(await screen.findByText('Verify your email')).toBeInTheDocument();
  });

  it('shows the server error when registration fails', async () => {
    const user = userEvent.setup();
    h.register.mockRejectedValueOnce(new Error('Email already registered.'));
    renderWithIntl(<RegisterForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('An account with this email already exists.')).toBeInTheDocument();
  });
});
