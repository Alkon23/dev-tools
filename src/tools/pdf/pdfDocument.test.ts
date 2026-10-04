import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { mergePdfFiles, moveItem, pdfDownloadName, rebuildPdf } from './pdfDocument';

async function createPdfFile(name: string, pageCount: number): Promise<File> {
  const document = await PDFDocument.create();
  for (let index = 0; index < pageCount; index += 1) {
    document.addPage([200, 200]);
  }
  const bytes = new Uint8Array(await document.save());
  const file = new File([bytes], name, { type: 'application/pdf' });
  Object.defineProperty(file, 'arrayBuffer', { value: async () => bytes.buffer });
  return file;
}

describe('pdfDocument', () => {
  it('normalizes output names and falls back for empty names', () => {
    expect(pdfDownloadName(' Report.PDF.pdf ', 'default.pdf')).toBe('Report.pdf');
    expect(pdfDownloadName('Report', 'default.pdf')).toBe('Report.pdf');
    expect(pdfDownloadName('  ', 'default.pdf')).toBe('default.pdf');
    expect(pdfDownloadName('.pdf', 'default.pdf')).toBe('default.pdf');
  });
  it('moves items without changing the original list', () => {
    const source = ['first', 'second', 'third'];

    expect(moveItem(source, 0, 2)).toEqual(['second', 'third', 'first']);
    expect(source).toEqual(['first', 'second', 'third']);
  });

  it('merges PDFs in their supplied order', async () => {
    const first = await createPdfFile('first.pdf', 1);
    const second = await createPdfFile('second.pdf', 2);

    const merged = await mergePdfFiles([first, second]);
    expect(merged.type).toBe('application/pdf');
    expect(merged.size).toBeGreaterThan(0);
  });

  it('rebuilds a PDF from a page order that duplicates pages', async () => {
    const source = await createPdfFile('source.pdf', 2);
    const rebuilt = await rebuildPdf(source, [1, 0, 1]);
    expect(rebuilt.type).toBe('application/pdf');
    expect(rebuilt.size).toBeGreaterThan(0);
  });
});
