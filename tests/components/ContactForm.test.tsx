import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ContactForm from '@/app/[locale]/contact/ContactForm';
import { renderWithIntl } from '../test-utils';

const h = vi.hoisted(() => ({ apiRequest: vi.fn() }));

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return { ...actual, apiRequest: h.apiRequest };
});

async function fillForm() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Name'), 'Abdo');
  await user.type(screen.getByLabelText('Email'), 'abdo@test.com');
  await user.type(screen.getByLabelText('Message'), 'My booking question');
  return user;
}

describe('ContactForm', () => {
  beforeEach(() => h.apiRequest.mockReset());

  it('posts the message and shows the sent state', async () => {
    h.apiRequest.mockResolvedValueOnce({});
    renderWithIntl(<ContactForm />);
    const user = await fillForm();
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    await waitFor(() =>
      expect(h.apiRequest).toHaveBeenCalledWith('/contact', {
        method: 'POST',
        body: { name: 'Abdo', email: 'abdo@test.com', message: 'My booking question' },
      }),
    );
    expect(await screen.findByText('Message sent')).toBeInTheDocument();
  });

  it('shows the failure copy and keeps the form when sending fails', async () => {
    h.apiRequest.mockRejectedValueOnce(new Error('boom'));
    renderWithIntl(<ContactForm />);
    const user = await fillForm();
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('boom');
    expect(screen.queryByText('Message sent')).not.toBeInTheDocument();
  });
});
