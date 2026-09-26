import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import JsonFormatterTool from './Tool';

describe('JsonFormatterTool', () => {
  it('prettifies JSON5 after a pause and leaves key sorting off by default', async () => {
    const user = userEvent.setup();
    render(<JsonFormatterTool />);

    const editor = screen.getByLabelText('JSON editor');
    expect(screen.getByLabelText('Sort object keys')).not.toBeChecked();
    await user.clear(editor);
    await user.click(editor);
    await user.paste("{z:1,a:'two',}");
    expect(editor).toHaveValue("{z:1,a:'two',}");
    await waitFor(() => expect(editor).toHaveValue(`{
   "z": 1,
   "a": "two"
}`));

    await user.clear(screen.getByLabelText('Indent size'));
    await user.type(screen.getByLabelText('Indent size'), '2');
    await waitFor(() => expect(editor).toHaveValue(`{
  "z": 1,
  "a": "two"
}`));

    await user.click(screen.getByLabelText('Sort object keys'));
    await waitFor(() => expect(editor).toHaveValue(`{
  "a": "two",
  "z": 1
}`));
  });

  it('minifies without applying the prettify sort option and copies output', async () => {
    const user = userEvent.setup();
    render(<JsonFormatterTool />);

    const editor = screen.getByLabelText('JSON editor');
    await user.clear(editor);
    await user.click(editor);
    await user.paste('{zebra:1,alpha:2}');
    await user.click(screen.getByRole('button', { name: 'Minify' }));

    await waitFor(() => expect(editor).toHaveValue('{"zebra":1,"alpha":2}'));
    expect(screen.getByLabelText('Sort object keys')).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Copy JSON' }));
    expect(await navigator.clipboard.readText()).toBe('{"zebra":1,"alpha":2}');
  });

  it('shows validation feedback and clears the workspace', async () => {
    const user = userEvent.setup();
    render(<JsonFormatterTool />);

    const editor = screen.getByLabelText('JSON editor');
    await user.clear(editor);
    await user.click(editor);
    await user.paste('{ nope');
    expect(editor).toHaveValue('{ nope');
    expect(editor).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Provided JSON is not valid.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy JSON' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(editor).toHaveValue('');
    expect(editor).toHaveAttribute('aria-invalid', 'false');
  });
});
