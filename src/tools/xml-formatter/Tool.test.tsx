import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import XmlFormatterTool from './Tool';

describe('XmlFormatterTool', () => {
  it('prettifies XML after a pause with reference defaults', async () => {
    const user = userEvent.setup();
    render(<XmlFormatterTool />);

    const editor = screen.getByLabelText('XML editor');
    expect(screen.getByLabelText('Collapse text content')).toBeChecked();
    expect(screen.getByLabelText('Indent size')).toHaveValue(2);
    await user.clear(editor);
    await user.click(editor);
    await user.paste('<root><item>one</item><item>two</item></root>');
    expect(editor).toHaveValue('<root><item>one</item><item>two</item></root>');
    await waitFor(() => expect(editor).toHaveValue('<root>\n  <item>one</item>\n  <item>two</item>\n</root>'));

    await user.click(screen.getByLabelText('Collapse text content'));
    await waitFor(() => expect(editor).toHaveValue('<root>\n  <item>\n    one\n  </item>\n  <item>\n    two\n  </item>\n</root>'));
  });

  it('minifies XML and copies the editor content', async () => {
    const user = userEvent.setup();
    render(<XmlFormatterTool />);

    const editor = screen.getByLabelText('XML editor');
    await user.click(screen.getByRole('button', { name: 'Minify' }));
    await waitFor(() => expect(editor).toHaveValue('<hello><world>foo</world><world>bar</world></hello>'));
    expect(screen.getByLabelText('Collapse text content')).toBeDisabled();
    expect(screen.getByLabelText('Indent size')).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Copy XML' }));
    expect(await navigator.clipboard.readText()).toBe('<hello><world>foo</world><world>bar</world></hello>');
  });

  it('preserves malformed drafts and clears the editor', async () => {
    const user = userEvent.setup();
    render(<XmlFormatterTool />);

    const editor = screen.getByLabelText('XML editor');
    await user.clear(editor);
    await user.click(editor);
    await user.paste('<root><item></root>');
    expect(editor).toHaveValue('<root><item></root>');
    expect(editor).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Provided XML is not valid.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy XML' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(editor).toHaveValue('');
    expect(editor).toHaveAttribute('aria-invalid', 'false');
  });
});
