import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { ArrowLeft, ArrowRight, Copy, Download, FileText, RotateCcw, Trash2, Upload } from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatFileSize, isPdfFile, moveItem, outputFileName, rebuildPdf } from '../pdf/pdfDocument';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface TransferState {
  file?: File;
}

export default function PdfPageManagerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const receivedTransferRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const transferredFile = (location.state as TransferState | null)?.file;
  const resultFileName = outputFileName(file?.name ?? 'document', 'pages');
  const downloadUrl = useMemo(() => result ? URL.createObjectURL(result) : null, [result]);

  useEffect(() => () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
  }, [downloadUrl]);

  useEffect(() => {
    if (!transferredFile || receivedTransferRef.current) {
      return;
    }
    receivedTransferRef.current = true;
    setFile(transferredFile);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, navigate, transferredFile]);

  useEffect(() => {
    if (!file) {
      return;
    }
    const selectedFile = file;
    let cancelled = false;
    let loadingTask: ReturnType<typeof pdfjs.getDocument> | null = null;
    setIsLoading(true);
    setThumbnails([]);
    setPageOrder([]);
    setResult(null);
    setError(null);

    async function renderPages() {
      try {
        loadingTask = pdfjs.getDocument({ data: await selectedFile.arrayBuffer() });
        const pdfDocument = await loadingTask.promise;
        const nextThumbnails: string[] = [];
        for (let pageIndex = 1; pageIndex <= pdfDocument.numPages; pageIndex += 1) {
          const page = await pdfDocument.getPage(pageIndex);
          const viewport = page.getViewport({ scale: 0.28 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) {
            throw new Error('Canvas rendering is unavailable.');
          }
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          await page.render({ canvasContext: context, viewport }).promise;
          nextThumbnails.push(canvas.toDataURL('image/jpeg', 0.8));
        }
        if (!cancelled) {
          setThumbnails(nextThumbnails);
          setPageOrder(Array.from({ length: pdfDocument.numPages }, (_, index) => index));
        }
        await pdfDocument.destroy();
      } catch {
        if (!cancelled) {
          setError('This PDF could not be opened. Password-protected or damaged PDFs cannot be edited.');
          setFile(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void renderPages();
    return () => {
      cancelled = true;
      void loadingTask?.destroy();
    };
  }, [file]);

  function selectFile(nextFile: File | undefined) {
    if (!nextFile || !isPdfFile(nextFile)) {
      setError('Choose a PDF file to manage.');
      return;
    }
    setFile(nextFile);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    selectFile(event.dataTransfer.files[0]);
  }

  function updateOrder(nextOrder: number[]) {
    setPageOrder(nextOrder);
    setResult(null);
  }

  function duplicatePage(index: number) {
    const pageIndex = pageOrder[index];
    updateOrder([...pageOrder.slice(0, index + 1), pageIndex, ...pageOrder.slice(index + 1)]);
  }

  function deletePage(index: number) {
    if (pageOrder.length === 1) {
      return;
    }
    updateOrder(pageOrder.filter((_, itemIndex) => itemIndex !== index));
  }

  async function buildPdf() {
    if (!file || !pageOrder.length) {
      return;
    }
    setIsBuilding(true);
    setError(null);
    setResult(null);
    try {
      setResult(await rebuildPdf(file, pageOrder));
    } catch {
      setError('The edited PDF could not be created. Please try a different file.');
    } finally {
      setIsBuilding(false);
    }
  }

  return (
    <section className="tool-card mx-auto max-w-[1420px]" aria-label="PDF page manager">
      <div className="mb-6 flex items-start justify-between gap-5 border-b border-line pb-5 max-[620px]:flex-col">
        <div>
          <span className="section-index">PAGE ARRANGEMENT</span>
          <h2 className="mt-1 mb-1 text-[18px] font-semibold">Organize every page</h2>
          <p className="m-0 text-xs leading-5 text-muted">Drag pages into place, duplicate a page, or remove it from the final PDF.</p>
        </div>
        {file && <button className="button button-secondary" disabled={isBuilding} onClick={() => setFile(null)} type="button">Choose another PDF</button>}
      </div>

      {!file && (
        <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-[#d8dfdc] bg-[#f8faf9] px-5 py-8 text-center hover:border-accent" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
          <input accept="application/pdf,.pdf" aria-label="Choose a PDF to manage" className="sr-only" onChange={handleFileChange} ref={fileInputRef} type="file" />
          <Upload className="mb-3 size-7 text-accent-dark" aria-hidden="true" />
          <strong className="text-sm">Drop a PDF here or choose a file</strong>
          <span className="mt-1 text-xs text-muted">The PDF stays in your browser while you edit it.</span>
        </label>
      )}

      {error && <p className="mt-4 rounded-[7px] border border-[#edc6c1] bg-[#fff1ef] px-3 py-2.5 text-xs text-[#9a382f]" role="alert">{error}</p>}

      {file && (
        <>
          <div className="flex items-center gap-3 rounded-[8px] border border-[#d8dfdc] bg-[#f8faf9] px-3 py-2.5">
            <FileText className="size-5 shrink-0 text-[#a53b32]" aria-hidden="true" />
            <div className="min-w-0"><p className="m-0 truncate text-xs font-semibold">{file.name}</p><p className="m-0 mt-0.5 text-[10px] text-muted">{formatFileSize(file.size)}{pageOrder.length ? ` · ${pageOrder.length} output ${pageOrder.length === 1 ? 'page' : 'pages'}` : ''}</p></div>
          </div>

          {isLoading ? <p className="mt-6 text-center text-sm text-muted" role="status">Rendering page previews...</p> : pageOrder.length > 0 && (
            <>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="m-0 text-xs text-muted">Original page numbers stay visible on the thumbnails.</p>
                <button className="button button-secondary" disabled={isBuilding} onClick={() => updateOrder(Array.from({ length: thumbnails.length }, (_, index) => index))} type="button"><RotateCcw size={16} aria-hidden="true" />Reset order</button>
              </div>
              <ol className="mt-4 grid list-none grid-cols-[repeat(auto-fill,minmax(142px,1fr))] gap-3 p-0 max-[420px]:grid-cols-2" aria-label="PDF pages in output order">
                {pageOrder.map((sourcePageIndex, index) => (
                  <li
                    className={`group relative overflow-hidden rounded-[8px] border bg-[#f8faf9] ${draggedIndex === index ? 'border-dashed border-accent opacity-45' : 'border-[#d8dfdc]'}`}
                    draggable={!isBuilding}
                    key={`${sourcePageIndex}-${index}`}
                    onDragEnd={() => setDraggedIndex(null)}
                    onDragOver={(event) => event.preventDefault()}
                    onDragStart={(event) => { setDraggedIndex(index); event.dataTransfer.effectAllowed = 'move'; }}
                    onDrop={(event) => { event.preventDefault(); if (draggedIndex !== null) { updateOrder(moveItem(pageOrder, draggedIndex, index)); } setDraggedIndex(null); }}
                  >
                    <img alt={`Original page ${sourcePageIndex + 1}, output position ${index + 1}`} className="aspect-[3/4] w-full object-cover" draggable={false} src={thumbnails[sourcePageIndex]} />
                    <span className="absolute top-1.5 left-1.5 rounded bg-[#211e16e6] px-1.5 py-1 font-mono text-[10px] text-white">#{index + 1}</span>
                    <span className="absolute right-1.5 bottom-1.5 rounded bg-white/90 px-1.5 py-1 font-mono text-[10px] text-[#4d5853]">Page {sourcePageIndex + 1}</span>
                    <div className="absolute inset-x-1.5 top-8 flex justify-between opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <button aria-label={`Move original page ${sourcePageIndex + 1} earlier`} className="button button-secondary min-h-7 bg-white/95 px-1.5 py-1" disabled={isBuilding || index === 0} onClick={() => updateOrder(moveItem(pageOrder, index, index - 1))} type="button"><ArrowLeft size={14} /></button>
                      <button aria-label={`Move original page ${sourcePageIndex + 1} later`} className="button button-secondary min-h-7 bg-white/95 px-1.5 py-1" disabled={isBuilding || index === pageOrder.length - 1} onClick={() => updateOrder(moveItem(pageOrder, index, index + 1))} type="button"><ArrowRight size={14} /></button>
                    </div>
                    <div className="absolute inset-x-1.5 bottom-8 flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <button aria-label={`Duplicate original page ${sourcePageIndex + 1}`} className="button min-h-7 bg-[#216c48e6] px-1.5 py-1 text-white hover:bg-[#216c48]" disabled={isBuilding} onClick={() => duplicatePage(index)} type="button"><Copy size={14} /></button>
                      <button aria-label={`Delete original page ${sourcePageIndex + 1}`} className="button min-h-7 bg-[#a53b32e6] px-1.5 py-1 text-white hover:bg-[#a53b32]" disabled={isBuilding || pageOrder.length === 1} onClick={() => deletePage(index)} type="button"><Trash2 size={14} /></button>
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-5">
            <button className="button button-primary" disabled={isLoading || isBuilding || !pageOrder.length} onClick={buildPdf} type="button">{isBuilding ? 'Creating PDF...' : 'Create PDF'}</button>
            {result && downloadUrl && <a className="button button-secondary" download={resultFileName} href={downloadUrl}><Download size={17} aria-hidden="true" />Download</a>}
          </div>
        </>
      )}
    </section>
  );
}
