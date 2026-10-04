import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadPdf, rebuildPdf } from '../pdf/pdfDocument';
import PdfPageManagerTool from './Tool';

vi.mock('../pdf/pdfDocument', async (importOriginal) => ({
  ...await importOriginal<typeof import('../pdf/pdfDocument')>(),
  rebuildPdf: vi.fn(),
  downloadPdf: vi.fn(),
}));
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {},
  getDocument: () => ({
    promise: Promise.resolve({
      numPages: 2,
      getPage: async () => ({ getViewport: () => ({ width: 100, height: 100 }), render: () => ({ promise: Promise.resolve() }) }),
      destroy: async () => {},
    }),
    destroy: async () => {},
  }),
}));

function sourceFile(name = 'source.pdf') {
  const file = new File(['pdf'], name, { type: 'application/pdf' });
  Object.defineProperty(file, 'arrayBuffer', { value: async () => new ArrayBuffer(0) });
  return file;
}

describe('PdfPageManagerTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(rebuildPdf).mockResolvedValue(new Blob(['result']));
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,preview');
  });

  it('downloads the edited pages directly with a custom or fallback name', async () => {
    render(<MemoryRouter><PdfPageManagerTool /></MemoryRouter>);
    const file = sourceFile();
    fireEvent.change(screen.getByLabelText('Choose a PDF to manage'), { target: { files: [file] } });
    await screen.findByRole('button', { name: 'Duplicate original page 1' });
    expect(screen.queryByRole('button', { name: 'Create PDF' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Result PDF name'), { target: { value: 'Edited' } });
    fireEvent.click(screen.getByRole('button', { name: 'Duplicate original page 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Download' }));
    expect(screen.getByRole('button', { name: 'Preparing PDF...' })).toBeDisabled();
    await waitFor(() => expect(downloadPdf).toHaveBeenCalledWith(expect.any(Blob), 'Edited.pdf'));
    expect(rebuildPdf).toHaveBeenCalledWith(file, [0, 0, 1]);
    fireEvent.change(screen.getByLabelText('Result PDF name'), { target: { value: ' ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Download' }));
    await waitFor(() => expect(downloadPdf).toHaveBeenLastCalledWith(expect.any(Blob), 'source_pages.pdf'));
  });

  it('preserves the transferred merger filename', async () => {
    render(<MemoryRouter initialEntries={[{ pathname: '/tools/pdf-page-manager', state: { file: sourceFile('Combined.pdf') } }]}><PdfPageManagerTool /></MemoryRouter>);
    await screen.findByRole('button', { name: 'Duplicate original page 1' });
    expect(screen.getByLabelText('Result PDF name')).toHaveValue('Combined.pdf');
  });
  it('provides a direct PDF upload control', () => {
    render(<MemoryRouter><PdfPageManagerTool /></MemoryRouter>);

    expect(screen.getByRole('region', { name: 'PDF page manager' })).toBeInTheDocument();
    expect(screen.getByLabelText('Choose a PDF to manage')).toHaveAttribute('accept', 'application/pdf,.pdf');
  });
});
