import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginForm from '@/components/auth/LoginForm';
import type { AuthContextValue } from '@/lib/auth-context';
import type { User } from '@/lib/types';
import { renderWithIntl } from '../test-utils';

const h = vi.hoisted(() => ({
  push: vi.fn(),
  login: vi.fn(),
  params: new URLSearchParams(),
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ login: h.login }) as unknown as AuthContextValue,
}));
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: h.push, replace: vi.fn() }),
  usePathname: () => '/login',
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));
vi.mock('next/navigation', () => ({
  useSearchParams: () => h.params,
}));

const customer: User = { _id: 'c1', name: 'Cust', email: 'c@test.com', role: 'CUSTOMER' };
const admin: User = { _id: 'a1', name: 'Admin', email: 'admin', role: 'ADMIN' };

async function submitLogin(email: string, password: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Log in' }));
}

describe('LoginForm', () => {
  it('shows invalid credentials in Arabic rather than the English server message',async()=>{
    h.login.mockRejectedValueOnce(new Error('Invalid email or password.'));
    renderWithIntl(<LoginForm/>,'ar');
    const user=userEvent.setup();
    await user.type(screen.getByLabelText('البريد الإلكتروني'),'c@test.com');
    await user.type(screen.getByLabelText('كلمة المرور'),'wrong-password');
    await user.click(screen.getByRole('button',{name:'تسجيل الدخول'}));
    expect(await screen.findByRole('alert')).toHaveTextContent('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
    expect(screen.queryByText('Invalid email or password.')).not.toBeInTheDocument();
  });

  beforeEach(() => {
    h.push.mockReset();
    h.login.mockReset();
    h.params = new URLSearchParams();
  });

  it('sends customers to the dashboard after login', async () => {
    h.login.mockResolvedValueOnce(customer);
    renderWithIntl(<LoginForm />);
    await submitLogin('c@test.com', 'password123');
    await waitFor(() => expect(h.push).toHaveBeenCalledWith('/dashboard'));
    expect(h.login).toHaveBeenCalledWith('c@test.com', 'password123');
  });

  it('sends admins to the admin area after login', async () => {
    h.login.mockResolvedValueOnce(admin);
    renderWithIntl(<LoginForm />);
    await submitLogin('admin', 'password123');
    await waitFor(() => expect(h.push).toHaveBeenCalledWith('/admin'));
  });

  it('honors a safe relative next parameter', async () => {
    h.params = new URLSearchParams('next=/book');
    h.login.mockResolvedValueOnce(customer);
    renderWithIntl(<LoginForm />);
    await submitLogin('c@test.com', 'password123');
    await waitFor(() => expect(h.push).toHaveBeenCalledWith('/book'));
  });

  it.each(['//evil.example/phish', 'https://evil.example/phish', '/\\evil.example'])(
    'refuses to redirect to external next=%s',
    async (next) => {
      h.params = new URLSearchParams(`next=${encodeURIComponent(next)}`);
      h.login.mockResolvedValueOnce(customer);
      renderWithIntl(<LoginForm />);
      await submitLogin('c@test.com', 'password123');
      await waitFor(() => expect(h.push).toHaveBeenCalledWith('/dashboard'));
    },
  );

  it('shows the server error and stays put when login fails', async () => {
    h.login.mockRejectedValueOnce(new Error('Invalid email or password.'));
    renderWithIntl(<LoginForm />);
    await submitLogin('c@test.com', 'wrong-password');
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.');
    expect(h.push).not.toHaveBeenCalled();
  });
});
