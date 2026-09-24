import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import TextStatisticsTool from './Tool';

describe('TextStatisticsTool', () => {
  it('updates each statistic as text is entered', async () => {
    const user = userEvent.setup();
    render(<TextStatisticsTool />);

    const characters = screen.getByRole('group', { name: 'Character count' });
    const words = screen.getByRole('group', { name: 'Word count' });
    const lines = screen.getByRole('group', { name: 'Line count' });
    const bytes = screen.getByRole('group', { name: 'Byte size' });

    expect(within(characters).getByText('0')).toBeInTheDocument();
    expect(within(words).getByText('0')).toBeInTheDocument();
    expect(within(lines).getByText('0')).toBeInTheDocument();
    expect(within(bytes).getByText('0 Bytes')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Your text'), 'Hello 👋{enter}world');

    expect(within(characters).getByText('14')).toBeInTheDocument();
    expect(within(words).getByText('3')).toBeInTheDocument();
    expect(within(lines).getByText('2')).toBeInTheDocument();
    expect(within(bytes).getByText('16 Bytes')).toBeInTheDocument();
  });
});
