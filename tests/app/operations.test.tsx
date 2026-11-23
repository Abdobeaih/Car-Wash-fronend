import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import PaymentRecord from '@/components/PaymentRecord';
import type { Booking } from '@/lib/types';
import { renderWithIntl } from '../test-utils';

const h = vi.hoisted(() => ({ apiRequest: vi.fn() }));
vi.mock('@/lib/api', async (original) => ({ ...await original<typeof import('@/lib/api')>(), apiRequest: h.apiRequest }));
const analytics = { range: { start: '2030-01-01', end: '2030-01-31', timeZone: 'Africa/Cairo' }, summary: { bookings: 3, completed: 1, cancelled: 1, bookedValue: 300, recordedPaid: 100, outstanding: 200, completedValue: 100, cancelledPaid: 70 }, daily: [{ _id: '2030-01-15', bookings: 3, recordedPaid: 100 }], services: [{ _id: 's1', name: 'Wash', count: 2, baseValue: 200 }], customers: { unique: 1, returning: 1 } };
const booking = { _id: 'b1', paymentStatus: 'PENDING', status: 'CONFIRMED' } as Booking;
describe('Operations panels', () => {
  beforeEach(() => { h.apiRequest.mockReset(); });
  it('loads authenticated analytics with honest accounting and refund labels', async () => {
    h.apiRequest.mockResolvedValue(analytics);
    renderWithIntl(<AnalyticsPanel />);
    expect(await screen.findByText('Wash')).toBeInTheDocument();
    expect(h.apiRequest).toHaveBeenCalledWith('/admin/analytics?', { auth: true });
    expect(screen.getByText(/not bank settlements/)).toBeInTheDocument();
    expect(screen.getByText(/Reconcile these separately/)).toBeInTheDocument();
    expect(screen.getByText('2030-01-15')).toBeInTheDocument();
  });
  it('filters dates only on submit', async () => {
    h.apiRequest.mockResolvedValue(analytics);
    const user = userEvent.setup();
    renderWithIntl(<AnalyticsPanel />);
    await screen.findByText('Wash');
    await user.click(screen.getByRole('button', { name: 'Update report' }));
    await waitFor(() => expect(h.apiRequest).toHaveBeenCalledWith('/admin/analytics?start=2030-01-01&end=2030-01-31', { auth: true }));
  });
  it('shows empty data and request errors without invented figures', async () => {
    h.apiRequest.mockImplementation(async () => { throw new Error('Offline'); });
    renderWithIntl(<AnalyticsPanel />);
    expect(await screen.findByText('Offline')).toBeInTheDocument();
    expect(screen.queryByText('Wash')).not.toBeInTheDocument();
  });
  it('requires a separate confirmation to record full payment', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    h.apiRequest.mockResolvedValue({ ...booking, paymentStatus: 'PAID' });
    renderWithIntl(<PaymentRecord booking={booking} onUpdate={onUpdate} />);
    await user.click(screen.getByRole('button', { name: 'Record full amount received' }));
    expect(h.apiRequest).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText(/Receipt\/reference/), 'receipt 42');
    await user.click(screen.getByRole('button', { name: 'Confirm record' }));
    await waitFor(() => expect(h.apiRequest).toHaveBeenCalledWith('/admin/bookings/b1/payment', { auth: true, method: 'PATCH', body: { paymentStatus: 'PAID', reference: 'receipt 42' } }));
    expect(onUpdate).toHaveBeenCalled();
  });
  it('has no payment action for cancelled bookings', () => {
    renderWithIntl(<PaymentRecord booking={{ ...booking, status: 'CANCELLED' }} onUpdate={vi.fn()} />);
    expect(screen.getByText(/Cancelled booking/)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('renders Arabic report copy', async () => {
    h.apiRequest.mockResolvedValue({ ...analytics, daily: [], services: [] });
    renderWithIntl(<AnalyticsPanel />, 'ar');
    expect(await screen.findByText('التشغيل والتحليلات')).toBeInTheDocument();
  });
});
