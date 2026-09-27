import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import PercentageCalculatorTool from './Tool';

describe('PercentageCalculatorTool', () => {
  it('calculates and formats all three percentage operations live', async () => {
    const user = userEvent.setup();
    render(<PercentageCalculatorTool />);

    await user.type(screen.getByLabelText('Percentage'), '123');
    await user.type(screen.getByLabelText('Value'), '456');
    expect(screen.getByLabelText('Percentage of a value result')).toHaveValue('560.88');

    await user.type(screen.getByLabelText('Part'), '123');
    await user.type(screen.getByLabelText('Whole'), '456');
    expect(screen.getByLabelText('Percentage ratio result')).toHaveValue('26.973684');

    await user.type(screen.getByLabelText('Starting value'), '123');
    await user.type(screen.getByLabelText('Ending value'), '456');
    expect(screen.getByLabelText('Percentage increase or decrease result')).toHaveValue('270.731707');
  });

  it('keeps incomplete results blank and explains invalid or zero denominator input', async () => {
    const user = userEvent.setup();
    render(<PercentageCalculatorTool />);

    await user.type(screen.getByLabelText('Percentage'), '12 percent');
    expect(screen.getByLabelText('Percentage')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Enter a valid number.')).toBeInTheDocument();
    expect(screen.getByLabelText('Percentage of a value result')).toHaveValue('');

    await user.type(screen.getByLabelText('Part'), '10');
    await user.type(screen.getByLabelText('Whole'), '0');
    expect(screen.getByLabelText('Whole')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Whole value must not be zero.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Starting value'), '0');
    expect(screen.getByText('Starting value must not be zero.')).toBeInTheDocument();
  });

  it('copies a completed result', async () => {
    const user = userEvent.setup();
    render(<PercentageCalculatorTool />);
    const card = screen.getByRole('heading', { name: 'Percentage of a value' }).closest('section')!;

    await user.type(within(card).getByLabelText('Percentage'), '25');
    await user.type(within(card).getByLabelText('Value'), '80');
    await user.click(within(card).getByRole('button', { name: 'Copy Percentage of a value result' }));

    expect(await navigator.clipboard.readText()).toBe('20');
  });
});
