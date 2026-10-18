import { useEffect, useRef, useState, useCallback } from 'react';
import { Copy, ImagePlus, Trash2 } from 'lucide-react';
import { readQrImage } from './qrReader';

export default function QrReaderTool() {
  const [result, setResult] = useState<{ text: string; preview: string } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const request = useRef({ id: 0 });
  const input = useRef<HTMLInputElement>(null);

  const read = useCallback(async (file: File) => {
    const id = ++request.current.id;
    setResult(null);
    setError('');
    setCopyStatus('');
    setBusy(true);
    try {
      const decoded = await readQrImage(file);
      if (request.current.id === id) setResult(decoded);
    } catch (cause) {
      if (request.current.id === id) setError(cause instanceof Error ? cause.message : 'The image could not be read.');
    } finally {
      if (request.current.id === id) setBusy(false);
    }
  }, []);

  useEffect(() => {
    const pending = request.current;
    function paste(event: ClipboardEvent) {
      const file = Array.from(event.clipboardData?.items ?? [])
        .find((item) => item.kind === 'file' && item.type.startsWith('image/'))?.getAsFile();
      if (!file) return;
      event.preventDefault();
      void read(file);
    }
    document.addEventListener('paste', paste);
    return () => {
      document.removeEventListener('paste', paste);
      pending.id++;
    };
  }, [read]);

  function clear() {
    request.current.id++;
    setResult(null);
    setError('');
    setCopyStatus('');
    setBusy(false);
    if (input.current) input.current.value = '';
  }

  async function copy() {
    if (!result) return;
    const id = request.current.id;
    try {
      await navigator.clipboard.writeText(result.text);
      if (id === request.current.id) setCopyStatus('Copied.');
    } catch {
      if (id === request.current.id) setCopyStatus('Copy failed. Select and copy the text below.');
    }
  }

  return (
    <section className="tool-card mx-auto max-w-[1000px]" aria-label="QR code reader">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="section-index">SOURCE IMAGE</span>
          <h2 className="mt-1 mb-1 text-[18px] font-semibold">Read a QR code</h2>
          <p className="m-0 text-xs leading-5 text-muted">Upload an image or paste a screenshot with Ctrl+V / Cmd+V. Images stay in your browser.</p>
        </div>
        <button className="button button-secondary" onClick={clear} type="button"><Trash2 size={16} aria-hidden="true" />Clear</button>
      </div>

      <label className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-[#d8dfdc] bg-[#f8faf9] px-5 py-8 text-center hover:border-accent focus-within:outline-2 focus-within:outline-accent">
        <input ref={input} type="file" accept="image/*" aria-label="Upload QR code image" className="sr-only" onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void read(file);
        }} />
        <ImagePlus className="mb-3 size-7 text-accent-dark" aria-hidden="true" />
        <strong className="text-sm">Choose an image or paste from clipboard</strong>
        <span className="mt-2 text-xs text-muted">PNG, JPEG, WebP, and other browser-supported images. Up to 20 MB / 16 megapixels.</span>
      </label>

      <p role="status" className="mt-3 text-xs text-muted">{busy ? 'Reading QR code…' : copyStatus}</p>
      {error && <p role="alert" className="mt-4 rounded-[7px] border border-[#edc6c1] bg-[#fff1ef] px-3 py-2.5 text-xs text-[#9a382f]">{error}</p>}

      {result && (
        <div className="mt-5 grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-0 rounded-[10px] border border-line bg-white p-4">
            <img src={result.preview} alt="Uploaded QR code" className="mx-auto max-h-[350px] max-w-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="qr-reader-result" className="text-sm font-semibold">Decoded text</label>
              <button type="button" className="button button-secondary" onClick={() => void copy()}><Copy size={16} aria-hidden="true" />Copy text</button>
            </div>
            <textarea id="qr-reader-result" readOnly value={result.text} rows={8} className="input-control w-full resize-y font-mono text-sm" />
            <p className="mt-2 text-xs text-muted">Links and other content are displayed as text, never opened automatically.</p>
          </div>
        </div>
      )}
    </section>
  );
}
