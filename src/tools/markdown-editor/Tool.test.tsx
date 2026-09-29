import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MarkdownEditorTool from './Tool';

beforeEach(() => {
  let nextUrl = 0;
  URL.createObjectURL = vi.fn(() => `blob:markdown-draft-${++nextUrl}`);
  URL.revokeObjectURL = vi.fn();
});

describe('MarkdownEditorTool', () => {
  it('updates the live GFM preview and ignores unsafe HTML and links', async () => {
    const user = userEvent.setup();
    render(<MarkdownEditorTool />);
    const preview = screen.getByRole('region', { name: 'Markdown preview' });
    const editor = screen.getByRole('textbox', { name: 'Markdown source' });

    expect(within(preview).getByRole('heading', { name: 'Hello, Markdown!' })).toBeInTheDocument();
    fireEvent.change(editor, { target: { value: '# Notes\n\n| Name | Value |\n| --- | --- |\n| A | 1 |\n\n- [x] Done\n\n~~Old~~\n\n<script>alert(1)</script>\n\n[bad](javascript:alert(1))' } });

    expect(within(preview).getByRole('heading', { name: 'Notes' })).toBeInTheDocument();
    expect(within(preview).getByRole('table')).toBeInTheDocument();
    expect(within(preview).getByRole('checkbox')).toBeChecked();
    expect(within(preview).getByText('Old').tagName).toBe('DEL');
    expect(preview.querySelector('script')).not.toBeInTheDocument();
    expect(within(preview).getByText('bad').closest('a')).not.toHaveAttribute('href', expect.stringContaining('javascript:'));

    await user.click(screen.getByRole('button', { name: 'Clear Markdown' }));
    expect(within(preview).getByText('Your preview will appear here.')).toBeInTheDocument();
  });

  it('imports a local Markdown file, allows editing, and downloads its current content', async () => {
    const user = userEvent.setup();
    render(<MarkdownEditorTool />);
    const file = new File(['# Imported'], 'notes.markdown', { type: 'text/markdown' });
    file.text = vi.fn().mockResolvedValue('# Imported');

    fireEvent.change(screen.getByLabelText('Import Markdown file'), { target: { files: [file] } });
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Markdown source' })).toHaveValue('# Imported'));
    expect(screen.getByRole('textbox', { name: 'File name' })).toHaveValue('notes');
    expect(screen.getByRole('heading', { name: 'Imported' })).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: 'Markdown source' }), { target: { value: '# Updated' } });
    const download = screen.getByRole('link', { name: 'Download' });
    expect(download).toHaveAttribute('download', 'notes.md');
    expect(download).toHaveAttribute('href', 'blob:markdown-draft-3');
    const blob = vi.mocked(URL.createObjectURL).mock.lastCall?.[0] as Blob;
    expect(blob.type).toBe('text/markdown;charset=utf-8');
    const content = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsText(blob);
    });
    expect(content).toBe('# Updated');
    expect(URL.revokeObjectURL).toHaveBeenCalled();

    await user.clear(screen.getByRole('textbox', { name: 'File name' }));
    expect(download).toHaveAttribute('download', 'untitled.md');
  });

  it('keeps the draft if an invalid or unreadable file is selected', async () => {
    render(<MarkdownEditorTool />);
    const editor = screen.getByRole('textbox', { name: 'Markdown source' });
    const input = screen.getByLabelText('Import Markdown file');
    fireEvent.change(input, { target: { files: [new File(['oops'], 'notes.txt')] } });
    expect(screen.getByRole('alert')).toHaveTextContent('Choose a .md or .markdown file.');
    expect((editor as HTMLTextAreaElement).value).toContain('Hello, Markdown!');

    const unreadable = new File(['oops'], 'broken.md');
    unreadable.text = vi.fn().mockRejectedValue(new Error('Read failed'));
    fireEvent.change(input, { target: { files: [unreadable] } });
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Could not read the selected file.'));
    expect((editor as HTMLTextAreaElement).value).toContain('Hello, Markdown!');
  });

  it('aligns table columns after typing without losing the cursor and offers a collapsed cheatsheet', async () => {
    const user = userEvent.setup();
    render(<MarkdownEditorTool />);
    const editor = screen.getByRole('textbox', { name: 'Markdown source' }) as HTMLTextAreaElement;
    const input = '| Name | Value |\n| --- | ---: |\n| a | 12 |\n| longer | 1 |';
    const caret = input.indexOf('longer') + 3;
    editor.focus();
    fireEvent.change(editor, { target: { value: input } });
    editor.setSelectionRange(caret, caret);

    await waitFor(() => expect(editor.value).toContain('| Name   | Value |\n| ------ | ----: |\n| a      |    12 |'), { timeout: 2000 });
    expect(editor.value.slice(editor.selectionStart - 3, editor.selectionStart + 3)).toBe('longer');
    expect(screen.getByRole('region', { name: 'Markdown preview' }).querySelector('table')).toBeInTheDocument();

    const details = screen.getByText('Markdown cheatsheet').closest('details')!;
    expect(details).not.toHaveAttribute('open');
    await user.click(screen.getByText('Markdown cheatsheet'));
    expect(details).toHaveAttribute('open');
    expect(details).toHaveTextContent('**bold**');
    expect(details).toHaveTextContent('| --- | ---: |');
  });
});
