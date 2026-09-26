import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import ColorConverterTool from './Tool';

describe('ColorConverterTool', () => {
  it('updates every format from a valid CSS color name', async () => {
    const user = userEvent.setup();
    render(<ColorConverterTool />);

    const name = screen.getByLabelText('Closest CSS color name');
    await user.clear(name);
    await user.type(name, 'olive');

    expect(name).toHaveValue('olive');
    expect(screen.getByLabelText('HEX')).toHaveValue('#808000');
    expect(screen.getByLabelText('RGB')).toHaveValue('rgb(128, 128, 0)');
    expect(screen.getByLabelText('HSL')).toHaveValue('hsl(60, 100%, 25%)');

    const advanced = screen.getByText('Advanced formats').closest('details');
    await user.click(screen.getByText('Advanced formats'));
    expect(advanced).toHaveAttribute('open');
    expect(screen.getByLabelText('HWB')).toHaveValue('hwb(60 0% 50%)');
    expect(screen.getByLabelText('LCH')).toHaveValue('lch(52.15% 56.81 99.57)');
    expect(screen.getByLabelText('CMYK')).toHaveValue('device-cmyk(0% 0% 100% 50%)');
  });

  it('keeps the last valid conversions while showing invalid source feedback', async () => {
    const user = userEvent.setup();
    render(<ColorConverterTool />);

    const rgb = screen.getByLabelText('RGB');
    const previousHex = (screen.getByLabelText('HEX') as HTMLInputElement).value;
    await user.clear(rgb);
    await user.type(rgb, 'invalid-rgb');

    expect(rgb).toHaveValue('invalid-rgb');
    expect(rgb).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Invalid RGB format.')).toBeInTheDocument();
    expect(screen.getByLabelText('HEX')).toHaveValue(previousHex);

    await user.clear(rgb);
    expect(screen.queryByText('Invalid RGB format.')).not.toBeInTheDocument();
    expect(screen.getByLabelText('HEX')).toHaveValue(previousHex);
  });

  it('preserves opacity and copies converted values', async () => {
    const user = userEvent.setup();
    render(<ColorConverterTool />);

    fireEvent.change(screen.getByRole('slider', { name: /Opacity/ }), { target: { value: '50' } });
    expect(screen.getByLabelText('HEX')).toHaveValue('#d79f0080');
    expect(screen.getByLabelText('RGB')).toHaveValue('rgba(215, 159, 0, 0.5)');

    await user.click(screen.getByRole('button', { name: 'Copy HEX' }));
    expect(await navigator.clipboard.readText()).toBe('#d79f0080');
  });
});
