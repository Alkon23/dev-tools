import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { toolsByCategory } from './tools/registry';

vi.mock('./tools/regex-tester/Tool.tsx', () => ({
  default: () => <section aria-label="Regex tester" />,
}));

describe('App', () => {
  it('renders tools from the registry on the dashboard and sidebar', () => {
    render(<MemoryRouter><App /></MemoryRouter>);

    expect(screen.queryByText('Small tools.')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Available tools' })).not.toBeInTheDocument();
    const categoryLinks = screen.getByRole('navigation', { name: 'Jump to category' });
    expect(screen.getByRole('region', { name: 'Categories' })).toHaveTextContent('00');
    expect(within(categoryLinks).getAllByRole('link')).toHaveLength(toolsByCategory.size);
    for (const [index, [category, categoryTools]] of [...toolsByCategory].entries()) {
      const section = screen.getByRole('region', { name: category });
      expect(section).toHaveAttribute('id', `category-${index}`);
      expect(within(categoryLinks).getByRole('link', { name: new RegExp(category) })).toHaveAttribute('href', `#category-${index}`);
      expect(within(section).getAllByRole('link')).toHaveLength(categoryTools.length);
    }
    expect(screen.getAllByRole('link', { name: /Text case converter/ })).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'GitHub repository' })).toHaveAttribute('href', 'https://github.com/Alkon23/dev-tools');
  });

  it('shows category labels in the mobile drawer after collapsing the sidebar', () => {
    render(<MemoryRouter><App /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(within(screen.getByRole('navigation', { name: 'Developer tools' })).queryByText('Converters')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    const navigation = screen.getByRole('navigation', { name: 'Developer tools' });
    expect(within(navigation).getByText('Converters')).toBeInTheDocument();
    expect(within(navigation).getByRole('link', { name: 'Color converter' })).toBeInTheDocument();
  });

  it('renders a lazy tool inside the tool container', async () => {
    render(<MemoryRouter initialEntries={['/tools/text-case']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Text case converter' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Text case converter' })).toBeInTheDocument();
  });

  it('loads the QR generator directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/tools/qr-generator']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'QR code generator' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'QR code generator' })).toBeInTheDocument();
  });

  it('loads the crontab generator directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/tools/crontab-generator']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Crontab generator' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Crontab generator' })).toBeInTheDocument();
  });

  it('loads the ASCII tree generator directly and marks its sidebar link active', async () => {
    render(<MemoryRouter initialEntries={['/tools/ascii-tree']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'ASCII tree generator' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'ASCII tree generator' })).toBeInTheDocument();
    expect(within(screen.getByRole('navigation', { name: 'Developer tools' })).getByRole('link', { name: 'ASCII tree generator' })).toHaveAttribute('aria-current', 'page');
  });

  it('loads the Markdown editor directly under Text and marks its sidebar link active', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:markdown-draft');
    URL.revokeObjectURL = vi.fn();
    render(<MemoryRouter initialEntries={['/tools/markdown-editor']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Markdown editor' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Markdown editor' }, { timeout: 5000 })).toBeInTheDocument();
    expect(within(screen.getByRole('navigation', { name: 'Developer tools' })).getByRole('link', { name: 'Markdown editor' })).toHaveAttribute('aria-current', 'page');
  });

  it('loads the regex tester directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/tools/regex-tester']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Regex tester' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Regex tester' })).toBeInTheDocument();
  });

  it('loads the keyboard tester directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/tools/keyboard-tester']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Keyboard tester' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Keyboard tester' })).toBeInTheDocument();
  });

  it('loads the ISSN / ISBN validator directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/tools/issn-isbn-validator']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'ISSN / ISBN validator' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'ISSN and ISBN validator' })).toBeInTheDocument();
  });

  it('loads the percentage calculator directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/tools/percentage-calculator']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Percentage calculator' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Percentage calculator' })).toBeInTheDocument();
  });

  it('loads text statistics directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/tools/text-statistics']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Text statistics' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Text statistics' })).toBeInTheDocument();
  });

  it('loads Text to Unicode directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/tools/text-to-unicode']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Text to Unicode' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Text to Unicode' })).toBeInTheDocument();
  });

  it('loads the date-time converter directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/tools/date-time-converter']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Date-time converter' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Date-time converter' }, { timeout: 3000 })).toBeInTheDocument();
  });

  it('loads the color converter directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/tools/color-converter']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Color converter' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Color converter' })).toBeInTheDocument();
  });

  it('loads the unit converter directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/tools/unit-converter']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Unit converter' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Unit converter' })).toBeInTheDocument();
  });

  it('loads the JSON formatter directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/tools/json-formatter']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'JSON formatter' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'JSON formatter' })).toBeInTheDocument();
  });

  it('loads the XML formatter directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/tools/xml-formatter']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'XML formatter' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'XML formatter' })).toBeInTheDocument();
  });

  it('loads the URL encoder directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/tools/url-encoder']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'URL encoder / decoder' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'URL encoder / decoder' })).toBeInTheDocument();
  });

  it('loads the URL parser directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/tools/url-parser']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'URL parser' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'URL parser' })).toBeInTheDocument();
  });

  it('renders the not-found page for unknown paths', () => {
    render(<MemoryRouter initialEntries={['/tools/unknown']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'This utility does not exist.' })).toBeInTheDocument();
  });
});
