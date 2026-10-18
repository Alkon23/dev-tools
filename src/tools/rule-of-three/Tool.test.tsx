import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import RuleOfThreeTool from './Tool';

describe('RuleOfThreeTool', () => {
  it('calculates live and switches mode with values intact', async () => {
    const user = userEvent.setup();
    render(<RuleOfThreeTool />);
    expect(screen.getByLabelText('X — Result')).toHaveValue('');
    await user.type(screen.getByLabelText('A — Known value'), '2');
    await user.type(screen.getByLabelText('B — Known value'), '10');
    await user.type(screen.getByLabelText('C — New value'), '5');
    expect(screen.getByLabelText('X — Result')).toHaveValue('25');
    expect(screen.getByRole('button', { name: 'Direct' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Inverse' }));
    expect(screen.getByRole('button', { name: 'Inverse' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('X — Result')).toHaveValue('4');
    await user.clear(screen.getByLabelText('A — Known value'));
    expect(screen.getByLabelText('X — Result')).toHaveValue('');
  });

  it('explains malformed input, mode-specific zero divisors and range errors', () => {
    render(<RuleOfThreeTool />);
    const a = screen.getByLabelText('A — Known value');
    fireEvent.change(a, { target: { value: 'oops' } });
    expect(a).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Enter a valid finite number.')).toBeInTheDocument();
    fireEvent.change(a, { target: { value: '0' } });
    expect(screen.getByText('A must not be zero in direct proportion.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Inverse' }));
    expect(a).toHaveAttribute('aria-invalid', 'false');
    fireEvent.change(screen.getByLabelText('C — New value'), { target: { value: '0' } });
    expect(screen.getByText('C must not be zero in inverse proportion.')).toBeInTheDocument();
    fireEvent.change(a, { target: { value: '1e300' } });
    fireEvent.change(screen.getByLabelText('B — Known value'), { target: { value: '1e300' } });
    fireEvent.change(screen.getByLabelText('C — New value'), { target: { value: '1e-300' } });
    expect(screen.getByText('Result is outside the supported numeric range.')).toBeInTheDocument();
    expect(screen.getByLabelText('X — Result')).toHaveValue('');
  });
});
