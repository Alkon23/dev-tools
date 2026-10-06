import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Check, Clipboard, Download, Eraser, Upload } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { alignMarkdownTables } from './alignTables';
import './markdown.css';

const EXAMPLE = '# Hello, Markdown!\n\nWrite **bold text**, add a [link](https://example.com), or make a list:\n\n- [x] Write Markdown\n- [ ] Preview the result\n';
const MARKDOWN_PLUGINS = [remarkGfm];

function downloadName(name: string): string {
  const base = name.trim().replace(/\.(md|markdown)$/i, '').replace(/[\\/:*?"<>|\p{Cc}]/gu, '-').replace(/[. ]+$/g, '');
  return `${base || 'untitled'}.md`;
}

export default function MarkdownEditorTool() {
  const [source, setSource] = useState(EXAMPLE);
  const [fileName, setFileName] = useState('untitled');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const importSequence = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const pendingSelection = useRef<{ text: string; start: number; end: number; direction: 'forward' | 'backward' | 'none'; scrollTop: number; scrollLeft: number } | null>(null);
  const copyTimer = useRef<number | null>(null);
  const downloadUrl = useMemo(() => URL.createObjectURL(new Blob([source], { type: 'text/markdown;charset=utf-8' })), [source]);

  useEffect(() => () => URL.revokeObjectURL(downloadUrl), [downloadUrl]);

  function formatTablesOnBlur() {
    const field = editor.current;
    if (!field) return;
    const result = alignMarkdownTables(field.value);
    if (result.text === field.value) return;
    pendingSelection.current = {
      text: result.text,
      start: result.mapOffset(field.selectionStart),
      end: result.mapOffset(field.selectionEnd),
      direction: field.selectionDirection,
      scrollTop: field.scrollTop,
      scrollLeft: field.scrollLeft,
    };
    setSource(result.text);
  }

  useLayoutEffect(() => {
    const selection = pendingSelection.current;
    if (selection?.text === source) {
      editor.current?.setSelectionRange(selection.start, selection.end, selection.direction);
      if (editor.current) {
        editor.current.scrollTop = selection.scrollTop;
        editor.current.scrollLeft = selection.scrollLeft;
      }
      pendingSelection.current = null;
    }
  }, [source]);

  useEffect(() => () => {
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
  }, []);

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const sequence = ++importSequence.current;
    if (!/\.(md|markdown)$/i.test(file.name)) {
      setError('Choose a .md or .markdown file.');
      return;
    }

    try {
      const text = await file.text();
      if (sequence !== importSequence.current) return;
      setSource(text);
      setFileName(file.name.replace(/\.(md|markdown)$/i, ''));
      setError(null);
    } catch {
      if (sequence === importSequence.current) setError('Could not read the selected file.');
    }
  }

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError('Could not copy Markdown to the clipboard.');
    }
  }

  return (
    <section className="mx-auto w-full max-w-[1500px]" aria-label="Markdown editor">
      <div className="mb-[18px] flex flex-wrap items-end justify-between gap-4 rounded-xl border border-line bg-surface px-5 py-4 max-[760px]:flex-col max-[760px]:items-stretch">
        <div className="field-group min-w-0 flex-1 max-w-[320px] text-xs font-semibold text-[#45504c] max-[760px]:max-w-none">
          <label htmlFor="markdown-filename">File name</label>
          <span className="flex items-center gap-2">
            <input className="input-control" id="markdown-filename" onChange={(event) => setFileName(event.target.value)} value={fileName} />
            <span className="font-mono text-xs text-muted">.md</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="button button-secondary max-[760px]:flex-1" onClick={() => fileInput.current?.click()} type="button"><Upload size={16} aria-hidden="true" /> Import file</button>
          <input accept=".md,.markdown,text/markdown" aria-label="Import Markdown file" className="hidden" onChange={importFile} ref={fileInput} tabIndex={-1} type="file" />
          <a className="button button-primary max-[760px]:flex-1" download={downloadName(fileName)} href={downloadUrl}><Download size={16} aria-hidden="true" /> Download</a>
        </div>
      </div>
      {error && <p className="mb-4 rounded-[7px] border border-[#edc6c1] bg-[#fff1ef] px-3 py-2.5 text-xs text-[#9a382f]" role="alert">{error}</p>}

      <div className="grid grid-cols-2 items-stretch gap-[18px] max-[760px]:grid-cols-1">
        <div className="tool-card flex min-w-0 flex-col p-[clamp(18px,2.5vw,30px)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><span className="section-index">SOURCE</span><h2 className="mt-1 mb-0 text-[18px] font-semibold">Markdown</h2></div>
            <div className="flex gap-2">
              <button aria-label="Clear Markdown" className="button button-secondary min-h-9 px-2.5" disabled={!source} onClick={() => { ++importSequence.current; setSource(''); setError(null); }} title="Clear Markdown" type="button"><Eraser size={16} aria-hidden="true" /></button>
              <button className="button button-secondary min-h-9 px-2.5" disabled={!source} onClick={copyMarkdown} type="button">{copied ? <Check size={16} aria-hidden="true" /> : <Clipboard size={16} aria-hidden="true" />}{copied ? 'Copied' : 'Copy'}</button>
            </div>
          </div>
          <label className="sr-only" htmlFor="markdown-source">Markdown source</label>
          <textarea
            autoCapitalize="off"
            className="min-h-[max(480px,calc(100dvh-360px))] flex-1 font-mono text-[13px] leading-[1.65] max-[760px]:min-h-[340px]"
            id="markdown-source"
            onBlur={formatTablesOnBlur}
            onChange={(event) => { ++importSequence.current; setSource(event.target.value); setError(null); }}
            placeholder="Write Markdown here..."
            ref={editor}
            spellCheck={false}
            value={source}
          />
        </div>

        <div className="tool-card flex min-w-0 flex-col p-[clamp(18px,2.5vw,30px)]">
          <div className="mb-4"><span className="section-index">LIVE PREVIEW</span><h2 className="mt-1 mb-0 text-[18px] font-semibold">Rendered Markdown</h2></div>
          <div aria-label="Markdown preview" className="markdown-preview min-h-[max(480px,calc(100dvh-360px))] min-w-0 flex-1 overflow-x-auto rounded-[7px] border border-[#d8dfdc] bg-[#f8faf9] px-5 py-4 max-[760px]:min-h-[340px]" role="region">
            {source ? <Markdown remarkPlugins={MARKDOWN_PLUGINS}>{source}</Markdown> : <p className="text-muted">Your preview will appear here.</p>}
          </div>
        </div>
      </div>
      <details className="tool-card mt-[18px] px-5 py-4">
        <summary className="cursor-pointer text-sm font-semibold marker:text-accent-dark">Markdown cheatsheet</summary>
        <div className="mt-4 grid gap-3 border-t border-line pt-4 text-xs leading-5 sm:grid-cols-2 lg:grid-cols-3">
          <div><strong>Headings</strong><code className="block whitespace-pre-wrap font-mono text-muted"># Heading 1{'\n'}## Heading 2</code></div>
          <div><strong>Emphasis</strong><code className="block whitespace-pre-wrap font-mono text-muted">**bold**  *italic*  ~~strike~~</code></div>
          <div><strong>Links and images</strong><code className="block whitespace-pre-wrap font-mono text-muted">[label](https://example.com){'\n'}![alt](image.png)</code></div>
          <div><strong>Lists and tasks</strong><code className="block whitespace-pre-wrap font-mono text-muted">- List item{'\n'}1. Numbered item{'\n'}- [x] Done</code></div>
          <div><strong>Quotes and code</strong><code className="block whitespace-pre-wrap font-mono text-muted">&gt; Quote{'\n'}`inline code`{'\n'}```js{'\n'}console.log(1){'\n'}```</code></div>
          <div><strong>Tables</strong><code className="block whitespace-pre-wrap font-mono text-muted">| Name | Value |{'\n'}| --- | ---: |{'\n'}| A | 1 |</code></div>
        </div>
      </details>
    </section>
  );
}
