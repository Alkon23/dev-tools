import { PDFDocument } from 'pdf-lib';

export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function moveItem<T>(items: readonly T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) {
    return [...items];
  }

  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function outputFileName(fileName: string, suffix: string): string {
  const baseName = fileName.replace(/\.pdf$/i, '');
  return `${baseName || 'document'}_${suffix}.pdf`;
}

export async function mergePdfFiles(files: readonly File[]): Promise<Blob> {
  if (files.length < 2) {
    throw new Error('Add at least two PDF files to merge.');
  }

  const mergedDocument = await PDFDocument.create();
  for (const file of files) {
    const sourceDocument = await PDFDocument.load(await file.arrayBuffer());
    const pages = await mergedDocument.copyPages(sourceDocument, sourceDocument.getPageIndices());
    pages.forEach((page) => mergedDocument.addPage(page));
  }

  const pdfBytes = await mergedDocument.save();
  return new Blob([new Uint8Array(pdfBytes).buffer], { type: 'application/pdf' });
}

export async function getPdfPageCount(file: File): Promise<number> {
  const document = await PDFDocument.load(await file.arrayBuffer());
  return document.getPageCount();
}

export async function rebuildPdf(file: File, pageOrder: readonly number[]): Promise<Blob> {
  if (!pageOrder.length) {
    throw new Error('Keep at least one page in the document.');
  }

  const sourceDocument = await PDFDocument.load(await file.arrayBuffer());
  const sourcePageCount = sourceDocument.getPageCount();
  if (pageOrder.some((pageIndex) => !Number.isInteger(pageIndex) || pageIndex < 0 || pageIndex >= sourcePageCount)) {
    throw new Error('The page arrangement contains an invalid page.');
  }

  const outputDocument = await PDFDocument.create();
  const pages = await outputDocument.copyPages(sourceDocument, [...pageOrder]);
  pages.forEach((page) => outputDocument.addPage(page));
  const pdfBytes = await outputDocument.save();
  return new Blob([new Uint8Array(pdfBytes).buffer], { type: 'application/pdf' });
}
