import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NotificationsPanel from '@/components/NotificationsPanel';
import type { Notification } from '@/lib/types';
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

function note(overrides: Partial<Notification>): Notification {
  return {
    _id: 'n1',
    recipientId: 'u1',
    type: 'BOOKING',
    title: 'Booking confirmed',
    message: 'Your wash is confirmed.',
    read: false,
    createdAt: '2026-11-22T10:00:00Z',
    ...overrides,
  };
}

describe('NotificationsPanel', () => {
  beforeEach(() => h.apiRequest.mockReset());

  it('loads notifications and shows the unread count', async () => {
    h.apiRequest.mockResolvedValueOnce([note({}), note({ _id: 'n2', read: true, title: 'Old one' })]);
    renderWithIntl(<NotificationsPanel />);
    expect(await screen.findByText('Booking confirmed')).toBeInTheDocument();
    expect(screen.getByText(/1 unread/i)).toBeInTheDocument();
  });

  it('marks one notification read through the API and updates the UI', async () => {
    h.apiRequest.mockResolvedValueOnce([note({})]);
    renderWithIntl(<NotificationsPanel />);
    const btn = await screen.findByRole('button', { name: 'Mark read' });
    h.apiRequest.mockResolvedValueOnce({});
    await userEvent.setup().click(btn);
    await waitFor(() =>
      expect(h.apiRequest).toHaveBeenLastCalledWith('/notifications/n1/read', { method: 'PATCH', auth: true }),
    );
    await waitFor(() => expect(screen.getByText(/all caught up/i)).toBeInTheDocument());
  });

  it('marks all as read and confirms', async () => {
    h.apiRequest.mockResolvedValueOnce([note({}), note({ _id: 'n2', title: 'Second' })]);
    renderWithIntl(<NotificationsPanel />);
    const all = await screen.findByRole('button', { name: /mark all/i });
    h.apiRequest.mockResolvedValueOnce({});
    await userEvent.setup().click(all);
    await waitFor(() =>
      expect(h.apiRequest).toHaveBeenLastCalledWith('/notifications/read-all', { method: 'PATCH', auth: true }),
    );
    expect(await screen.findByText(/marked as read/i)).toBeInTheDocument();
  });

  it('shows the error state with a working retry', async () => {
    h.apiRequest.mockRejectedValueOnce(new Error('load failed'));
    renderWithIntl(<NotificationsPanel />);
    const retry = await screen.findByRole('button', { name: /try again/i });
    h.apiRequest.mockResolvedValueOnce([]);
    await userEvent.setup().click(retry);
    expect(await screen.findByText(/no notifications/i)).toBeInTheDocument();
  });

  it('links a booking notification to its booking and marks it read on open', async () => {
    h.apiRequest.mockResolvedValueOnce([note({ data: { bookingId: 'b9' } })]);
    renderWithIntl(<NotificationsPanel basePath="/dashboard/bookings" />);
    const link = await screen.findByRole('link', { name: /view booking/i });
    expect(link).toHaveAttribute('href', '/dashboard/bookings/b9');
    h.apiRequest.mockResolvedValueOnce({});
    await userEvent.setup().click(link);
    await waitFor(() =>
      expect(h.apiRequest).toHaveBeenLastCalledWith('/notifications/n1/read', { method: 'PATCH', auth: true }),
    );
  });
});
