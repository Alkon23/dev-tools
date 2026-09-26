import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders tools from the registry on the dashboard and sidebar', () => {
    render(<MemoryRouter><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Available tools' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Text case converter/ })).toHaveLength(2);
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

  it('renders the not-found page for unknown paths', () => {
    render(<MemoryRouter initialEntries={['/tools/unknown']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'This utility does not exist.' })).toBeInTheDocument();
  });
});
