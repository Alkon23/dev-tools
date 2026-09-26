import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import UrlParserTool from './Tool';

describe('UrlParserTool', () => {
  it('parses, edits, and removes URL components', async () => {
    const user = userEvent.setup();
    render(<UrlParserTool />);

    expect(screen.getByLabelText('Protocol')).toHaveValue('https:');
    expect(screen.getByLabelText('Hostname')).toHaveValue('it-tools.tech');
    expect(screen.getByLabelText('Fragment')).toHaveValue('#the-hash');

    await user.click(screen.getByRole('button', { name: 'Remove Password' }));
    expect(screen.getByLabelText('Password')).toHaveValue('');
    expect(screen.getByLabelText('URL to parse and edit')).toHaveValue(
      'https://me@it-tools.tech:3000/url-parser?key1=value&key2=value2#the-hash',
    );

    await user.clear(screen.getByLabelText('Path'));
    await user.type(screen.getByLabelText('Path'), '/new path');
    await user.tab();
    expect((screen.getByLabelText('URL to parse and edit') as HTMLTextAreaElement).value).toContain('/new%20path');
  });

  it('preserves duplicate parameters and removes one exact row', async () => {
    const user = userEvent.setup();
    render(<UrlParserTool />);

    const source = screen.getByLabelText('URL to parse and edit');
    await user.clear(source);
    await user.type(source, 'https://example.com/?tag=one&tag=two');

    expect(screen.getByLabelText('Parameter 1 name')).toHaveValue('tag');
    expect(screen.getByLabelText('Parameter 2 name')).toHaveValue('tag');
    await user.click(screen.getByRole('button', { name: 'Remove parameter 1' }));

    expect(source).toHaveValue('https://example.com/?tag=two');
    expect(screen.getByLabelText('Parameter 1 value')).toHaveValue('two');
    expect(screen.queryByLabelText('Parameter 2 value')).not.toBeInTheDocument();
  });

  it('keeps invalid source and component drafts visible', async () => {
    const user = userEvent.setup();
    render(<UrlParserTool />);

    const hostname = screen.getByLabelText('Hostname');
    await user.clear(hostname);
    await user.tab();
    expect(hostname).toHaveValue('');
    expect(hostname).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('This value cannot be applied to the URL.')).toBeInTheDocument();

    const source = screen.getByLabelText('URL to parse and edit');
    await user.clear(source);
    await user.type(source, '/relative');
    expect(source).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Enter a valid absolute URL.')).toBeInTheDocument();
    expect(screen.getByLabelText('Protocol')).toBeDisabled();
  });

  it('adds a parameter and copies the normalized URL', async () => {
    const user = userEvent.setup();
    render(<UrlParserTool />);

    await user.click(screen.getByRole('button', { name: 'Add parameter' }));
    const queryCard = screen.getByRole('heading', { name: 'Parameters' }).closest('.tool-card') as HTMLElement;
    expect(within(queryCard).getByLabelText('Parameter 3 name')).toHaveValue('');

    await user.type(within(queryCard).getByLabelText('Parameter 3 name'), 'new');
    await user.type(within(queryCard).getByLabelText('Parameter 3 value'), 'two words');
    await user.click(screen.getByRole('button', { name: 'Copy URL' }));
    expect(await navigator.clipboard.readText()).toContain('new=two+words');
  });
});
