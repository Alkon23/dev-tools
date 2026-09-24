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

  it('renders the not-found page for unknown paths', () => {
    render(<MemoryRouter initialEntries={['/tools/unknown']}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'This utility does not exist.' })).toBeInTheDocument();
  });
});
