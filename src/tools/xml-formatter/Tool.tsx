import { useEffect, useRef, useState } from 'react';
import { Check, Clipboard, Eraser } from 'lucide-react';
import { formatXml, type XmlFormatMode } from './xmlFormatter';

const INITIAL_XML = '<hello><world>foo</world><world>bar</world></hello>';
const FORMAT_DELAY = 450;

export default function XmlFormatterTool() {
  const [input, setInput] = useState(INITIAL_XML);
  const [mode, setMode] = useState<XmlFormatMode>('prettify');
  const [indentSize, setIndentSize] = useState(2);
  const [collapseContent, setCollapseContent] = useState(true);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);
  const result = formatXml(input, { collapseContent, indentSize, mode });

  useEffect(() => {
    const formatted = formatXml(input, { collapseContent, indentSize, mode });
    if (formatted.error || formatted.value === input) {
      return;
    }

    const timer = window.setTimeout(() => {
      setInput((currentInput) => currentInput === input ? formatted.value : currentInput);
    }, FORMAT_DELAY);
    return () => window.clearTimeout(timer);
  }, [collapseContent, indentSize, input, mode]);

  useEffect(() => () => {
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
  }, []);

  async function copyOutput() {
    await navigator.clipboard.writeText(input);
    setCopied(true);
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="tool-card mx-auto max-w-[1500px]" aria-label="XML formatter">
      <div className="mb-6 flex items-end justify-between gap-7 border-b border-line pb-[22px] max-[420px]:items-stretch max-[420px]:flex-col max-[420px]:gap-[18px]">
        <fieldset className="format-picker mt-0 min-w-[280px] max-[420px]:min-w-0">
          <legend>Output mode</legend>
          <div className="segmented-control grid-cols-2">
            <button
              aria-pressed={mode === 'prettify'}
              className={mode === 'prettify' ? 'is-selected' : ''}
              onClick={() => setMode('prettify')}
              type="button"
            >
              Prettify
            </button>
            <button
              aria-pressed={mode === 'minify'}
              className={mode === 'minify' ? 'is-selected' : ''}
              onClick={() => setMode('minify')}
              type="button"
            >
              Minify
            </button>
          </div>
        </fieldset>

        <div className="flex items-center gap-[22px] aria-disabled:opacity-50 max-[420px]:justify-between" aria-disabled={mode === 'minify'}>
          <label className="flex min-h-[42px] cursor-pointer items-center gap-[9px] text-xs font-semibold text-[#45504c]">
            <input
              className="m-0 size-[17px] accent-accent-dark"
              checked={collapseContent}
              disabled={mode === 'minify'}
              onChange={(event) => setCollapseContent(event.target.checked)}
              type="checkbox"
            />
            Collapse text content
          </label>
          <label className="flex items-center gap-[9px] whitespace-nowrap text-xs font-semibold text-[#45504c]" htmlFor="xml-indent-size">
            Indent size
            <input
              className="min-h-[42px] w-[70px] rounded-[7px] border border-[#d8dfdc] bg-[#f8faf9] px-2.5 py-2 font-mono text-ink focus:border-accent focus:shadow-focus focus:outline-0"
              disabled={mode === 'minify'}
              id="xml-indent-size"
              max="10"
              min="0"
              onChange={(event) => setIndentSize(Number(event.target.value))}
              type="number"
              value={indentSize}
            />
          </label>
        </div>
      </div>

      <div className="field-group min-w-0">
        <div className="field-label-row">
          <label htmlFor="xml-editor">XML editor</label>
          <span>{input.length} characters</span>
        </div>
        <textarea
          className="min-h-[max(560px,calc(100vh-370px))] font-mono text-xs [tab-size:3] aria-invalid:border-[#b74b42] max-[760px]:min-h-[max(460px,calc(100dvh-390px))]"
          aria-describedby={result.error ? 'xml-editor-error' : 'xml-editor-help'}
          aria-invalid={result.error}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          autoFocus
          id="xml-editor"
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste your XML here..."
          rows={24}
          spellCheck={false}
          value={input}
        />
        {result.error ? (
          <p className="error-text leading-[1.45]" id="xml-editor-error">Provided XML is not valid.</p>
        ) : (
          <p className="m-0 text-[11px] leading-[1.45] text-muted" id="xml-editor-help">Valid XML is normalized after you pause typing.</p>
        )}
      </div>

      <div className="tool-actions border-t border-line pt-5">
        <button className="button button-secondary" disabled={!input} onClick={() => setInput('')} type="button">
          <Eraser size={17} aria-hidden="true" />
          Clear
        </button>
        <button
          className="button button-primary"
          disabled={result.error || !result.value}
          onClick={copyOutput}
          type="button"
        >
          {copied ? <Check size={17} aria-hidden="true" /> : <Clipboard size={17} aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy XML'}
        </button>
      </div>
    </section>
  );
}
