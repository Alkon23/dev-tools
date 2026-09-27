import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import CrontabGeneratorTool from './Tool';

describe('CrontabGeneratorTool', () => {
  it('renders and describes the reference default expression', () => {
    render(<CrontabGeneratorTool />);

    expect(screen.getByLabelText('Cron expression')).toHaveValue('40 * * * *');
    expect(screen.getByText('At 40 minutes past the hour, every hour, every day')).toBeInTheDocument();
    expect(screen.getByLabelText('Verbose')).toBeChecked();
    expect(screen.getByLabelText('Use 24-hour time format')).toBeChecked();
    expect(screen.getByLabelText('Days start at 0')).toBeChecked();
  });

  it('shows validation feedback and recovers when the expression becomes valid', async () => {
    const user = userEvent.setup();
    render(<CrontabGeneratorTool />);
    const input = screen.getByLabelText('Cron expression');

    await user.clear(input);
    await user.type(input, '60 * * * *');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('This cron is invalid.')).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, '*/10 * * * *');

    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByText('This cron is invalid.')).not.toBeInTheDocument();
    expect(screen.getByText('Every 10 minutes, every hour, every day')).toBeInTheDocument();
  });

  it('updates the description options live', async () => {
    const user = userEvent.setup();
    render(<CrontabGeneratorTool />);
    const input = screen.getByLabelText('Cron expression');

    await user.clear(input);
    await user.type(input, '5 14 * * *');
    await user.click(screen.getByLabelText('Verbose'));
    expect(screen.getByText('At 14:05')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Use 24-hour time format'));
    expect(screen.getByText('At 02:05 PM')).toBeInTheDocument();
  });

  it('renders corrected expressions and labels unsupported shortcuts', () => {
    render(<CrontabGeneratorTool />);

    expect(screen.getByLabelText('Cron expression field diagram')).toHaveTextContent('[optional] seconds');
    expect(screen.getByText('1-10 * * * *')).toBeInTheDocument();

    const dailyRow = screen.getByText('@daily').closest('tr');
    expect(dailyRow).not.toBeNull();
    expect(within(dailyRow as HTMLTableRowElement).getByText('0 0 * * *')).toBeInTheDocument();
    expect(within(dailyRow as HTMLTableRowElement).getByText('Reference only')).toBeInTheDocument();
  });
});
