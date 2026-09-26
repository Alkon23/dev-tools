import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import UnitConverterTool from './Tool';

describe('UnitConverterTool', () => {
  it('converts temperature from any field and normalizes the source on blur', async () => {
    const user = userEvent.setup();
    render(<UnitConverterTool />);

    const fahrenheit = screen.getByLabelText('Fahrenheit (°F)');
    await user.clear(fahrenheit);
    await user.type(fahrenheit, '212');

    expect(fahrenheit).toHaveValue('212');
    expect(screen.getByLabelText('Celsius (°C)')).toHaveValue('100.00');
    expect(screen.getByLabelText('Kelvin (K)')).toHaveValue('373.15');

    await user.tab();
    expect(fahrenheit).toHaveValue('212.00');
  });

  it('converts exact length factors and binary byte sizes', async () => {
    const user = userEvent.setup();
    render(<UnitConverterTool />);

    const inch = screen.getByLabelText('Inch (in)');
    await user.clear(inch);
    await user.type(inch, '1');

    expect(screen.getByLabelText('Millimetre (mm)')).toHaveValue('25.40');
    expect(screen.getByLabelText('Centimetre (cm)')).toHaveValue('2.54');

    expect(screen.getByLabelText('Byte (B)')).toHaveValue('1048576.00');
    expect(screen.getByLabelText('Kilobyte (KB)')).toHaveValue('1024.00');
    expect(screen.getByLabelText('Gigabyte (GB)')).toHaveValue('0.00');
  });

  it('isolates malformed input and copies valid values', async () => {
    const user = userEvent.setup();
    render(<UnitConverterTool />);

    const metre = screen.getByLabelText('Metre (m)');
    const previousInches = (screen.getByLabelText('Inch (in)') as HTMLInputElement).value;
    await user.clear(metre);
    await user.type(metre, 'x12 metres');

    expect(metre).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Enter a valid number.')).toBeInTheDocument();
    expect(screen.getByLabelText('Inch (in)')).toHaveValue(previousInches);
    expect(screen.getByRole('button', { name: 'Copy Metre (m)' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Copy Inch (in)' }));
    expect(await navigator.clipboard.readText()).toBe(previousInches);
  });
});
