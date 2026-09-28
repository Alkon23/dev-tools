import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import PdfMergerTool from './Tool';

describe('PdfMergerTool', () => {
  it('accepts multiple PDFs and lets the user reorder them before merging', () => {
    render(<MemoryRouter><PdfMergerTool /></MemoryRouter>);
    const input = screen.getByLabelText('Choose PDFs to merge');
    const first = new File(['first'], 'first.pdf', { type: 'application/pdf' });
    const second = new File(['second'], 'second.pdf', { type: 'application/pdf' });

    fireEvent.change(input, { target: { files: [first, second] } });

    expect(screen.getByLabelText('PDF files in merge order')).toHaveTextContent('first.pdf');
    expect(screen.getByRole('button', { name: 'Move second.pdf earlier' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Move second.pdf earlier' }));
    expect(screen.getByLabelText('PDF files in merge order').firstElementChild).toHaveTextContent('second.pdf');
  });
});
