import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { toolsByCategory } from './tools/registry';

vi.mock('./tools/regex-tester/Tool.tsx', () => ({
  default: () => <section aria-label="Regex tester" />,
}));

vi.mock('./tools/text-diff/Tool.tsx', () => ({
  default: () => <section aria-label="Text diff" />,
}));

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('toggles and remembers the theme from the header', () => {
    const page = render(<MemoryRouter><App /></MemoryRouter>);
    const toggle = screen.getByRole('button', { name: 'Switch to dark mode' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(toggle);
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('dev-tools-theme')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toHaveAttribute('aria-pressed', 'true');

    page.unmount();
    render(<MemoryRouter><App /></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  it('follows system theme changes until a mode is chosen', () => {
    let onChange: (() => void) | undefined;
    const preference = {
      matches: true,
      addEventListener: vi.fn((_type: string, listener: () => void) => { onChange = listener; }),
      removeEventListener: vi.fn(),
    };
    const previousMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn(() => preference as unknown as MediaQueryList);
    try {
      render(<MemoryRouter><App /></MemoryRouter>);
      expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
      preference.matches = false;
      act(() => onChange?.());
      expect(document.documentElement).toHaveAttribute('data-theme', 'light');
      fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
      preference.matches = false;
      act(() => onChange?.());
      expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    } finally {
      window.matchMedia = previousMatchMedia;
    }
  });

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

  it('keeps dashboard and sidebar links under the deployment base', async () => {
    render(<MemoryRouter basename="/dev-tools/" initialEntries={['/dev-tools/']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Tools' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/dev-tools/');
    const allLinks = screen.getAllByRole('link');
    for (const categoryTools of toolsByCategory.values()) {
      for (const tool of categoryTools) {
        const links = allLinks.filter((link) => link.getAttribute('href') === `/dev-tools/${tool.id}`);
        expect(links).toHaveLength(2);
      }
    }

    const navigation = screen.getByRole('navigation', { name: 'Developer tools' });
    fireEvent.click(within(navigation).getByRole('link', { name: 'QR code reader' }));
    expect(await screen.findByRole('region', { name: 'QR code reader' }, { timeout: 5000 })).toBeInTheDocument();
    expect(within(navigation).getByRole('link', { name: 'QR code reader' })).toHaveAttribute('aria-current', 'page');
    fireEvent.click(screen.getByRole('link', { name: 'Home' }));
    expect(screen.getByRole('heading', { name: 'Tools' })).toBeInTheDocument();
  });

  it('opens a clean browser URL with its query and fragment intact', async () => {
    const originalUrl = window.location.href;
    window.history.replaceState(null, '', '/dev-tools/qr-reader?example=a%26b#preview');
    const page = render(<BrowserRouter basename={import.meta.env.BASE_URL}><App /></BrowserRouter>);

    try {
      expect(await screen.findByRole('region', { name: 'QR code reader' })).toBeInTheDocument();
      expect(window.location.pathname).toBe('/dev-tools/qr-reader');
      expect(window.location.search).toBe('?example=a%26b');
      expect(window.location.hash).toBe('#preview');
      const navigation = screen.getByRole('navigation', { name: 'Developer tools' });
      expect(within(navigation).getByRole('link', { name: 'QR code reader' })).toHaveAttribute('aria-current', 'page');
      fireEvent.click(screen.getByRole('link', { name: 'Home' }));
      expect(window.location.pathname).toBe('/dev-tools/');
    } finally {
      page.unmount();
      window.history.replaceState(null, '', originalUrl);
    }
  });

  it('renders the app not-found page for unknown slugs under the deployment base', () => {
    render(<MemoryRouter basename="/dev-tools/" initialEntries={['/dev-tools/unknown']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'This utility does not exist.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/dev-tools/');
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
    render(<MemoryRouter initialEntries={['/text-case']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Text case converter' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Text case converter' })).toBeInTheDocument();
  });

  it('loads the QR generator directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/qr-generator']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'QR code generator' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'QR code generator' })).toBeInTheDocument();
  });

  it('loads the QR reader directly and marks its sidebar link active', async () => {
    render(<MemoryRouter initialEntries={['/qr-reader']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'QR code reader' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'QR code reader' })).toBeInTheDocument();
    const navigation = screen.getByRole('navigation', { name: 'Developer tools' });
    expect(within(navigation).getByRole('link', { name: 'QR code reader' })).toHaveAttribute('aria-current', 'page');
    expect(within(navigation).getByText('Converters')).toBeInTheDocument();
  });

  it('gives text diff the full workspace width without widening other pages', async () => {
    render(<MemoryRouter basename="/dev-tools/" initialEntries={['/dev-tools/text-diff']}><App /></MemoryRouter>);

    expect(await screen.findByRole('region', { name: 'Text diff' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveClass('max-w-none', 'px-6', 'max-[760px]:px-[18px]');
    expect(screen.getByRole('main')).not.toHaveClass('max-w-[1680px]');
    const navigation = screen.getByRole('navigation', { name: 'Developer tools' });
    expect(within(navigation).getByRole('link', { name: 'Text diff' })).toHaveAttribute('aria-current', 'page');

    fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(screen.getByRole('main')).toHaveClass('max-w-none', 'px-6');

    fireEvent.click(screen.getByRole('link', { name: 'Home' }));
    expect(screen.getByRole('main')).toHaveClass('max-w-[1680px]', 'px-[clamp(24px,3vw,48px)]');
    expect(screen.getByRole('main')).not.toHaveClass('max-w-none');
  });

  it('loads the crontab generator directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/crontab-generator']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Crontab generator' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Crontab generator' })).toBeInTheDocument();
  });

  it('loads the ASCII tree generator directly and marks its sidebar link active', async () => {
    render(<MemoryRouter initialEntries={['/ascii-tree']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'ASCII tree generator' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'ASCII tree generator' })).toBeInTheDocument();
    expect(within(screen.getByRole('navigation', { name: 'Developer tools' })).getByRole('link', { name: 'ASCII tree generator' })).toHaveAttribute('aria-current', 'page');
  });

  it('loads the Markdown editor directly under Text and marks its sidebar link active', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:markdown-draft');
    URL.revokeObjectURL = vi.fn();
    render(<MemoryRouter initialEntries={['/markdown-editor']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Markdown editor' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Markdown editor' }, { timeout: 5000 })).toBeInTheDocument();
    expect(within(screen.getByRole('navigation', { name: 'Developer tools' })).getByRole('link', { name: 'Markdown editor' })).toHaveAttribute('aria-current', 'page');
  });

  it('loads the regex tester directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/regex-tester']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Regex tester' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Regex tester' })).toBeInTheDocument();
  });

  it('loads the keyboard tester directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/keyboard-tester']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Keyboard tester' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Keyboard tester' })).toBeInTheDocument();
  });

  it('loads the ISSN / ISBN validator directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/issn-isbn-validator']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'ISSN / ISBN validator' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'ISSN and ISBN validator' })).toBeInTheDocument();
  });

  it('loads the percentage calculator directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/percentage-calculator']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Percentage calculator' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Percentage calculator' })).toBeInTheDocument();
  });

  it('loads the rule of three directly and marks its sidebar link active', async () => {
    render(<MemoryRouter initialEntries={['/rule-of-three']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Rule of three' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Rule of three' })).toBeInTheDocument();
    expect(within(screen.getByRole('navigation', { name: 'Developer tools' })).getByRole('link', { name: 'Rule of three' })).toHaveAttribute('aria-current', 'page');
    expect(toolsByCategory.get('Math')?.some((tool) => tool.id === 'rule-of-three')).toBe(true);
  });

  it('loads text statistics directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/text-statistics']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Text statistics' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Text statistics' })).toBeInTheDocument();
  });

  it('loads Text to Unicode directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/text-to-unicode']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Text to Unicode' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Text to Unicode' })).toBeInTheDocument();
  });

  it('loads the date-time converter directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/date-time-converter']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Date-time converter' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Date-time converter' }, { timeout: 8000 })).toBeInTheDocument();
  });

  it('loads the color converter directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/color-converter']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Color converter' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Color converter' })).toBeInTheDocument();
  });

  it('loads the unit converter directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/unit-converter']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Unit converter' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Unit converter' })).toBeInTheDocument();
  });

  it('loads the JSON formatter directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/json-formatter']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'JSON formatter' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'JSON formatter' })).toBeInTheDocument();
  });

  it('loads the XML formatter directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/xml-formatter']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'XML formatter' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'XML formatter' })).toBeInTheDocument();
  });

  it('loads the URL encoder directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/url-encoder']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'URL encoder / decoder' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'URL encoder / decoder' })).toBeInTheDocument();
  });

  it('loads the URL parser directly from its generated route', async () => {
    render(<MemoryRouter initialEntries={['/url-parser']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'URL parser' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'URL parser' })).toBeInTheDocument();
  });

  it('renders the not-found page for unknown paths', () => {
    render(<MemoryRouter initialEntries={['/unknown']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'This utility does not exist.' })).toBeInTheDocument();
  });
});
