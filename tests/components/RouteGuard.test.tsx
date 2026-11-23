import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequireRole } from '@/components/RouteGuard';
import type { AuthContextValue } from '@/lib/auth-context';
import type { User } from '@/lib/types';
import { renderWithIntl } from '../test-utils';

const h = vi.hoisted(() => ({
  replace: vi.fn(),
  auth: { user: null as User | null, loading: false },
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => h.auth as unknown as AuthContextValue,
}));
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: h.replace }),
}));

const admin: User = { _id: 'a1', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' };
const customer: User = { _id: 'c1', name: 'Cust', email: 'cust@test.com', role: 'CUSTOMER' };

describe('RequireRole', () => {
  beforeEach(() => {
    h.replace.mockReset();
    h.auth = { user: null, loading: false };
  });

  it('shows a loading state while the session is being restored', () => {
    h.auth = { user: null, loading: true };
    renderWithIntl(<RequireRole role="CUSTOMER"><p>secret</p></RequireRole>);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
    expect(h.replace).not.toHaveBeenCalled();
  });

  it('redirects anonymous visitors to login', () => {
    renderWithIntl(<RequireRole role="CUSTOMER"><p>secret</p></RequireRole>);
    expect(h.replace).toHaveBeenCalledWith('/login');
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
  });

  it('sends customers away from admin pages to their dashboard', () => {
    h.auth = { user: customer, loading: false };
    renderWithIntl(<RequireRole role="ADMIN"><p>admin area</p></RequireRole>);
    expect(h.replace).toHaveBeenCalledWith('/dashboard');
    expect(screen.queryByText('admin area')).not.toBeInTheDocument();
  });

  it('sends admins away from customer pages to the admin home', () => {
    h.auth = { user: admin, loading: false };
    renderWithIntl(<RequireRole role="CUSTOMER"><p>cust area</p></RequireRole>);
    expect(h.replace).toHaveBeenCalledWith('/admin');
  });

  it('renders children for the matching role', () => {
    h.auth = { user: customer, loading: false };
    renderWithIntl(<RequireRole role="CUSTOMER"><p>cust area</p></RequireRole>);
    expect(screen.getByText('cust area')).toBeInTheDocument();
    expect(h.replace).not.toHaveBeenCalled();
  });
});
