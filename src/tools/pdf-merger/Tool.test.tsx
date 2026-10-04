import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadPdf, mergePdfFiles } from '../pdf/pdfDocument';
import PdfMergerTool from './Tool';

vi.mock('../pdf/pdfDocument', async (importOriginal) => ({
  ...await importOriginal<typeof import('../pdf/pdfDocument')>(),
  mergePdfFiles: vi.fn(),
  downloadPdf: vi.fn(),
}));

function addFiles() {
  const files = [new File(['first'], 'first.pdf', { type: 'application/pdf' }), new File(['second'], 'second.pdf', { type: 'application/pdf' })];
  fireEvent.change(screen.getByLabelText('Choose PDFs to merge'), { target: { files } });
  return files;
}

function TransferResult() {
  const location = useLocation();
  return <p>{(location.state as { file: File }).file.name}</p>;
}

describe('PdfMergerTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mergePdfFiles).mockResolvedValue(new Blob(['result'], { type: 'application/pdf' }));
  });

  it('downloads the current order in one click with a custom name', async () => {
    render(<MemoryRouter><PdfMergerTool /></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Merge PDFs' })).not.toBeInTheDocument();
    const files = addFiles();
    fireEvent.change(screen.getByLabelText('Result PDF name'), { target: { value: 'Report.pdf' } });
    fireEvent.click(screen.getByRole('button', { name: 'Move second.pdf earlier' }));
    expect(screen.getByLabelText('Result PDF name')).toHaveValue('Report.pdf');
    fireEvent.click(screen.getByRole('button', { name: 'Download' }));
    expect(screen.getByRole('button', { name: 'Preparing PDF...' })).toBeDisabled();
    await waitFor(() => expect(downloadPdf).toHaveBeenCalledWith(expect.any(Blob), 'Report.pdf'));
    expect(mergePdfFiles).toHaveBeenCalledWith([files[1], files[0]]);
    expect(screen.getByRole('button', { name: 'Download' })).toHaveClass('button-primary');
  });

  it('uses the default name when the input is cleared and reports malformed PDFs', async () => {
    render(<MemoryRouter><PdfMergerTool /></MemoryRouter>);
    addFiles();
    fireEvent.change(screen.getByLabelText('Result PDF name'), { target: { value: '' } });
    expect(screen.getByLabelText('Result PDF name')).toHaveValue('');
    fireEvent.click(screen.getByRole('button', { name: 'Download' }));
    await waitFor(() => expect(downloadPdf).toHaveBeenCalledWith(expect.any(Blob), 'first_merged.pdf'));
    vi.mocked(mergePdfFiles).mockRejectedValueOnce(new Error('Damaged PDF'));
    fireEvent.click(screen.getByRole('button', { name: 'Download' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be read');
    expect(screen.getByRole('button', { name: 'Download' })).toBeEnabled();
  });

  it('merges and hands off the named result directly to the editor', async () => {
    render(<MemoryRouter initialEntries={['/tools/pdf-merger']}><Routes>
      <Route path="/tools/pdf-merger" element={<PdfMergerTool />} />
      <Route path="/tools/pdf-page-manager" element={<TransferResult />} />
    </Routes></MemoryRouter>);
    addFiles();
    fireEvent.change(screen.getByLabelText('Result PDF name'), { target: { value: 'Combined' } });
    fireEvent.click(screen.getByRole('button', { name: 'Edit pages' }));
    expect(await screen.findByText('Combined.pdf')).toBeInTheDocument();
    expect(downloadPdf).not.toHaveBeenCalled();
  });
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
