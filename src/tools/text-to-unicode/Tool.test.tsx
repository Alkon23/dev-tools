import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import TextToUnicodeTool from './Tool';

describe('TextToUnicodeTool', () => {
  it('converts in both directions and copies the generated output', async () => {
    const user = userEvent.setup();
    render(<TextToUnicodeTool />);

    const copyUnicode = screen.getByRole('button', { name: 'Copy Unicode' });
    const copyText = screen.getByRole('button', { name: 'Copy text' });
    expect(copyUnicode).toBeDisabled();
    expect(copyText).toBeDisabled();

    await user.type(screen.getByLabelText('Enter text to convert to Unicode'), 'A😀');
    expect(screen.getByLabelText('Unicode from your text')).toHaveValue('&#65;&#55357;&#56832;');
    expect(copyUnicode).toBeEnabled();
    await user.click(copyUnicode);
    expect(await navigator.clipboard.readText()).toBe('&#65;&#55357;&#56832;');

    await user.type(screen.getByLabelText('Enter Unicode to convert to text'), '&#105;&#116;');
    expect(screen.getByLabelText('Text from your Unicode')).toHaveValue('it');
    expect(copyText).toBeEnabled();
  });

  it('keeps outputs empty for whitespace-only input', async () => {
    const user = userEvent.setup();
    render(<TextToUnicodeTool />);

    await user.type(screen.getByLabelText('Enter text to convert to Unicode'), '   ');
    await user.type(screen.getByLabelText('Enter Unicode to convert to text'), '   ');

    expect(screen.getByLabelText('Unicode from your text')).toHaveValue('');
    expect(screen.getByLabelText('Text from your Unicode')).toHaveValue('');
  });
});
