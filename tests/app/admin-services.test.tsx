import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminServicesPage from '@/app/[locale]/admin/services/page';
import type { CarService } from '@/lib/types';
import { renderWithIntl } from '../test-utils';

const h = vi.hoisted(() => ({ apiRequest: vi.fn() }));

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return { ...actual, apiRequest: h.apiRequest };
});

const svc: CarService = {
  _id: 's1', name: 'Exterior Car Wash', slug: 'exterior-car-wash', description: 'desc',
  image: '/x.jpg', basePrice: 200, duration: 60, isActive: true,
};

function loadWith(list: CarService[]) {
  h.apiRequest.mockImplementation((path: string) => {
    if (path === '/admin/services') return Promise.resolve(list);
    return Promise.resolve({});
  });
}

describe('AdminServicesPage', () => {
  beforeEach(() => h.apiRequest.mockReset());

  it('creates a service with numeric price and duration', async () => {
    loadWith([]);
    const user = userEvent.setup();
    renderWithIntl(<AdminServicesPage />);
    await screen.findByText('No services');
    await user.type(screen.getByLabelText('Name'), 'Ceramic Coating');
    await user.type(screen.getByLabelText('Image URL'), 'https://x.test/c.svg');
    await user.type(screen.getByLabelText('Base price'), '1500.5');
    await user.clear(screen.getByLabelText('Duration (minutes)'));
    await user.type(screen.getByLabelText('Duration (minutes)'), '90');
    await user.type(screen.getByLabelText('Description'), 'Long lasting paint protection');
    await user.click(screen.getByRole('button', { name: 'Create service' }));
    await waitFor(() =>
      expect(h.apiRequest).toHaveBeenCalledWith('/admin/services', {
        method: 'POST',
        auth: true,
        body: {
          name: 'Ceramic Coating',
          description: 'Long lasting paint protection',
          image: 'https://x.test/c.svg',
          basePrice: 1500.5,
          duration: 90,
          isActive: true,
        },
      }),
    );
    expect(await screen.findByText('Service created.')).toBeInTheDocument();
  });

  it('edits an existing service through PATCH', async () => {
    loadWith([svc]);
    const user = userEvent.setup();
    renderWithIntl(<AdminServicesPage />);
    await user.click((await screen.findAllByRole('button', { name: 'Edit' }))[0]);
    const name = screen.getByLabelText('Name');
    expect(name).toHaveValue('Exterior Car Wash');
    await user.clear(name);
    await user.type(name, 'Exterior Wash Plus');
    await user.click(screen.getAllByRole('button', { name: 'Save changes' })[0]);
    await waitFor(() =>
      expect(h.apiRequest).toHaveBeenCalledWith(
        '/admin/services/s1',
        expect.objectContaining({ method: 'PATCH', auth: true }),
      ),
    );
    const [, init] = h.apiRequest.mock.calls.find(
      (c) => typeof c[0] === 'string' && (c[0] as string).includes('/admin/services/s1'),
    ) as [string, { body: Record<string, unknown> }];
    expect(init.body.name).toBe('Exterior Wash Plus');
    expect(await screen.findByText('Service updated.')).toBeInTheDocument();
  });

  it('deactivates a service with a single toggle call', async () => {
    loadWith([svc]);
    const user = userEvent.setup();
    renderWithIntl(<AdminServicesPage />);
    await user.click((await screen.findAllByRole('button', { name: 'Deactivate' }))[0]);
    await waitFor(() =>
      expect(h.apiRequest).toHaveBeenCalledWith('/admin/services/s1', {
        method: 'PATCH',
        body: { isActive: false },
        auth: true,
      }),
    );
  });

  it('requires a second explicit click before deleting', async () => {
    loadWith([svc]);
    const user = userEvent.setup();
    renderWithIntl(<AdminServicesPage />);
    await user.click((await screen.findAllByRole('button', { name: 'Delete' }))[0]);
    expect(h.apiRequest).not.toHaveBeenCalledWith(
      '/admin/services/s1',
      expect.objectContaining({ method: 'DELETE' }),
    );
    await user.click(screen.getAllByRole('button', { name: 'Confirm delete' })[0]);
    await waitFor(() =>
      expect(h.apiRequest).toHaveBeenCalledWith('/admin/services/s1', { method: 'DELETE', auth: true }),
    );
    expect(await screen.findByText('Service deleted.')).toBeInTheDocument();
  });

  it('shows the error state with retry when loading fails', async () => {
    h.apiRequest.mockRejectedValueOnce(new Error('forbidden'));
    renderWithIntl(<AdminServicesPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('forbidden');
    h.apiRequest.mockResolvedValueOnce([]);
    await userEvent.setup().click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByText('No services')).toBeInTheDocument();
  });
});
