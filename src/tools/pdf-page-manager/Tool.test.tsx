import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import PdfPageManagerTool from './Tool';

describe('PdfPageManagerTool', () => {
  it('provides a direct PDF upload control', () => {
    render(<MemoryRouter><PdfPageManagerTool /></MemoryRouter>);

    expect(screen.getByRole('region', { name: 'PDF page manager' })).toBeInTheDocument();
    expect(screen.getByLabelText('Choose a PDF to manage')).toHaveAttribute('accept', 'application/pdf,.pdf');
  });
});
