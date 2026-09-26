import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { format } from 'date-fns';
import { describe, expect, it } from 'vitest';
import DateTimeConverterTool from './Tool';

describe('DateTimeConverterTool', () => {
  it('auto-detects input and renders all predefined conversions', async () => {
    const user = userEvent.setup();
    render(<DateTimeConverterTool />);

    await user.type(screen.getByLabelText('Date or timestamp'), '2024-05-06T12:34:56Z');

    expect(screen.getByLabelText('Input format')).toHaveValue('rfc-3339');
    expect(screen.getByLabelText('Unix timestamp (seconds since 1970-01-01)')).toHaveValue('1714998896');
    expect(screen.getByLabelText('Unix timestamp (milliseconds since 1970-01-01)')).toHaveValue('1714998896000');
    expect(screen.getAllByRole('button', { name: /^Copy / })).toHaveLength(8);
  });

  it('builds a custom format exclusively through token buttons', async () => {
    const user = userEvent.setup();
    const date = new Date('2024-05-06T12:34:56Z');
    render(<DateTimeConverterTool />);

    await user.type(screen.getByLabelText('Date or timestamp'), date.toISOString());
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    await user.click(screen.getByRole('button', { name: 'Add 4-digit year (yyyy)' }));
    await user.click(screen.getByRole('button', { name: 'Add Slash (/)' }));
    await user.click(screen.getByRole('button', { name: 'Add 2-digit month (MM)' }));

    expect(screen.getByLabelText('Custom format string')).toHaveTextContent('yyyy/MM');
    expect(screen.getByLabelText('Custom result')).toHaveValue(format(date, 'yyyy/MM'));

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByLabelText('Custom format string')).toHaveTextContent('yyyy/');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Custom format string')).toHaveTextContent('yyyy-MM-dd HH:mm:ss');
  });

  it('shows validation feedback for input that does not match the selected format', async () => {
    const user = userEvent.setup();
    render(<DateTimeConverterTool />);

    await user.selectOptions(screen.getByLabelText('Input format'), 'iso-8601');
    await user.type(screen.getByLabelText('Date or timestamp'), 'not-a-date');

    expect(screen.getByText('This date is invalid for the selected input format.')).toBeInTheDocument();
    expect(screen.getByLabelText('Date or timestamp')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Custom result')).toHaveValue('');
  });
});
