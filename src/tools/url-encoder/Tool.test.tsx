import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import UrlEncoderTool from './Tool';

describe('UrlEncoderTool', () => {
  it('encodes, decodes, and copies URL component text', async () => {
    const user = userEvent.setup();
    render(<UrlEncoderTool />);

    expect(screen.getByLabelText('Encoded text', { selector: 'textarea[readonly]' })).toHaveValue('Hello%20world%20%3A)');
    expect(screen.getByLabelText('Decoded text')).toHaveValue('Hello world :)');

    const encodeInput = screen.getByLabelText('Text to encode');
    await user.clear(encodeInput);
    await user.type(encodeInput, 'a/b+c');
    expect(screen.getByLabelText('Encoded text', { selector: 'textarea[readonly]' })).toHaveValue('a%2Fb%2Bc');

    await user.click(screen.getByRole('button', { name: 'Copy encoded text' }));
    expect(await navigator.clipboard.readText()).toBe('a%2Fb%2Bc');
  });

  it('shows malformed decoding feedback and disables copying', async () => {
    const user = userEvent.setup();
    render(<UrlEncoderTool />);

    const decodeInput = screen.getByLabelText('Encoded text', { selector: 'textarea:not([readonly])' });
    await user.clear(decodeInput);
    await user.type(decodeInput, '%ZZ');

    expect(decodeInput).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('This is not valid percent-encoded text.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy decoded text' })).toBeDisabled();
  });
});
