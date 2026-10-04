import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { ArrowDown, ArrowUp, Download, FileText, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { downloadPdf, formatFileSize, isPdfFile, mergePdfFiles, moveItem, outputFileName, pdfDownloadName } from '../pdf/pdfDocument';

interface MergeFile {
  id: string;
  file: File;
}

function createMergeFile(file: File): MergeFile {
  return { id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`, file };
}

export default function PdfMergerTool() {
  const [files, setFiles] = useState<MergeFile[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [resultName, setResultName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const defaultFileName = outputFileName(files[0]?.file.name ?? 'merged', 'merged');
  const resultFileName = pdfDownloadName(resultName ?? defaultFileName, defaultFileName);

  function addFiles(selectedFiles: File[]) {
    if (isMerging) return;
    const pdfFiles = selectedFiles.filter(isPdfFile);
    if (!pdfFiles.length) {
      setError('Choose PDF files to merge.');
      return;
    }
    setFiles((current) => [...current, ...pdfFiles.map(createMergeFile)]);
    setError(pdfFiles.length === selectedFiles.length ? null : 'Only PDF files were added.');
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDraggingFiles(false);
    addFiles(Array.from(event.dataTransfer.files));
  }

  function moveFile(fromIndex: number, toIndex: number) {
    if (isMerging) return;
    setFiles((current) => moveItem(current, fromIndex, toIndex));
  }

  async function mergeFiles(action: 'download' | 'edit') {
    if (isMerging) return;
    if (files.length < 2) {
      setError('Add at least two PDF files to merge.');
      return;
    }
    setIsMerging(true);
    setError(null);
    try {
      const result = await mergePdfFiles(files.map(({ file }) => file));
      if (action === 'download') {
        downloadPdf(result, resultFileName);
      } else {
        navigate('/tools/pdf-page-manager', {
          state: { file: new File([result], resultFileName, { type: 'application/pdf' }) },
        });
      }
    } catch {
      setError('One or more files could not be read. Password-protected or damaged PDFs cannot be merged.');
    } finally {
      setIsMerging(false);
    }
  }

  return (
    <section className="tool-card mx-auto max-w-[1180px]" aria-label="PDF merger">
      <div className="mb-6 flex items-start justify-between gap-5 border-b border-line pb-5 max-[620px]:flex-col">
        <div>
          <span className="section-index">SOURCE FILES</span>
          <h2 className="mt-1 mb-1 text-[18px] font-semibold">Arrange the documents</h2>
          <p className="m-0 text-xs leading-5 text-muted">Files are merged from top to bottom. Drag a file or use the arrow controls to change its position.</p>
        </div>
        <span className="rounded-full bg-[#f1f4f2] px-3 py-1.5 font-mono text-[10px] text-[#59645f]">{files.length} {files.length === 1 ? 'file' : 'files'}</span>
      </div>

      <label
        className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-[10px] border-2 border-dashed px-5 py-8 text-center transition-colors ${isDraggingFiles ? 'border-accent bg-[#fff8df]' : 'border-[#d8dfdc] bg-[#f8faf9] hover:border-accent'}`}
        onDragEnter={(event) => { event.preventDefault(); setIsDraggingFiles(true); }}
        onDragLeave={(event) => { event.preventDefault(); setIsDraggingFiles(false); }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input accept="application/pdf,.pdf" aria-label="Choose PDFs to merge" className="sr-only" disabled={isMerging} multiple onChange={handleFileChange} ref={fileInputRef} type="file" />
        <Plus className="mb-3 size-7 text-accent-dark" aria-hidden="true" />
        <strong className="text-sm">Drop PDF files here or choose files</strong>
        <span className="mt-1 text-xs text-muted">You can add more files at any time.</span>
      </label>

      {error && <p className="mt-4 rounded-[7px] border border-[#edc6c1] bg-[#fff1ef] px-3 py-2.5 text-xs text-[#9a382f]" role="alert">{error}</p>}

      {files.length > 0 && (
        <ol className="mt-6 m-0 list-none border-t border-line p-0" aria-label="PDF files in merge order">
          {files.map(({ id, file }, index) => (
            <li
              className={`grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-line py-3 transition-opacity max-[500px]:grid-cols-[auto_minmax(0,1fr)_auto] ${draggedIndex === index ? 'opacity-45' : ''}`}
              draggable={!isMerging}
              key={id}
              onDragEnd={() => setDraggedIndex(null)}
              onDragOver={(event) => event.preventDefault()}
              onDragStart={(event) => { setDraggedIndex(index); event.dataTransfer.effectAllowed = 'move'; }}
              onDrop={(event) => { event.preventDefault(); if (draggedIndex !== null) { moveFile(draggedIndex, index); } setDraggedIndex(null); }}
            >
              <GripVertical className="size-5 cursor-grab text-[#8a938f] max-[500px]:hidden" aria-hidden="true" />
              <span className="flex size-7 items-center justify-center rounded-full bg-[#fff0bd] font-mono text-[11px] font-semibold text-accent-dark">{index + 1}</span>
              <div className="flex min-w-0 items-center gap-2.5">
                <FileText className="size-5 shrink-0 text-[#a53b32]" aria-hidden="true" />
                <div className="min-w-0"><p className="m-0 truncate text-xs font-semibold">{file.name}</p><p className="m-0 mt-0.5 text-[10px] text-muted">{formatFileSize(file.size)}</p></div>
              </div>
              <div className="flex items-center gap-1">
                <button aria-label={`Move ${file.name} earlier`} className="button button-secondary min-h-8 px-2 py-1" disabled={isMerging || index === 0} onClick={() => moveFile(index, index - 1)} type="button"><ArrowUp size={15} /></button>
                <button aria-label={`Move ${file.name} later`} className="button button-secondary min-h-8 px-2 py-1" disabled={isMerging || index === files.length - 1} onClick={() => moveFile(index, index + 1)} type="button"><ArrowDown size={15} /></button>
                <button aria-label={`Remove ${file.name}`} className="button button-secondary min-h-8 px-2 py-1 text-[#a53b32]" disabled={isMerging} onClick={() => { setFiles((current) => current.filter((item) => item.id !== id)); }} type="button"><Trash2 size={15} /></button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-6 flex flex-wrap items-end gap-3 border-t border-line pt-5">
        <div className="min-w-0 flex-1 basis-60">
          <label className="mb-2 block text-xs font-semibold" htmlFor="merge-result-name">Result PDF name</label>
          <input className="input-control w-full" disabled={isMerging} id="merge-result-name" onChange={(event) => setResultName(event.target.value)} value={resultName ?? defaultFileName} />
        </div>
        <button className="button button-primary" disabled={files.length < 2 || isMerging} onClick={() => void mergeFiles('download')} type="button"><Download size={17} aria-hidden="true" />{isMerging ? 'Preparing PDF...' : 'Download'}</button>
        <button className="button button-secondary" disabled={files.length < 2 || isMerging} onClick={() => void mergeFiles('edit')} type="button"><Pencil size={17} aria-hidden="true" />Edit pages</button>
      </div>
    </section>
  );
}
