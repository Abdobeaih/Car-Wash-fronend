import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TimeInput from '@/components/TimeInput';
import { renderWithIntl } from '../test-utils';

describe('TimeInput', () => {
  it('flags an invalid time only after the field is touched', async () => {
    const user = userEvent.setup();
    renderWithIntl(<TimeInput label="Start time" name="start" value="9:99" onChange={() => {}} />);
    expect(screen.queryByText(/valid time/)).not.toBeInTheDocument();
    const input = screen.getByLabelText('Start time');
    await user.click(input);
    await user.tab();
    expect(screen.getByText(/valid time/)).toBeInTheDocument();
  });

  it('accepts a valid HH:MM value without an error', async () => {
    const user = userEvent.setup();
    renderWithIntl(<TimeInput label="Start time" name="start" value="10:30" onChange={() => {}} />);
    const input = screen.getByLabelText('Start time');
    await user.click(input);
    await user.tab();
    expect(screen.queryByText(/valid time/)).not.toBeInTheDocument();
  });

  it('fills the current time from the Now button', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithIntl(<TimeInput label="Start time" name="start" value="" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Use current time' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
  });

  it('surfaces a server-provided error immediately', () => {
    renderWithIntl(
      <TimeInput label="Start time" name="start" value="" onChange={() => {}} error="Slot taken" />,
    );
    expect(screen.getByText('Slot taken')).toBeInTheDocument();
  });
});
