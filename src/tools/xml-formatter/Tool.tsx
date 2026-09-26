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
    <section className="tool-card data-formatter-tool" aria-label="XML formatter">
      <div className="data-formatter-controls">
        <fieldset className="format-picker data-formatter-mode-picker">
          <legend>Output mode</legend>
          <div className="segmented-control">
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

        <div className="data-formatter-options" aria-disabled={mode === 'minify'}>
          <label className="data-formatter-toggle-option">
            <input
              checked={collapseContent}
              disabled={mode === 'minify'}
              onChange={(event) => setCollapseContent(event.target.checked)}
              type="checkbox"
            />
            Collapse text content
          </label>
          <label className="data-formatter-indent-option" htmlFor="xml-indent-size">
            Indent size
            <input
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

      <div className="field-group data-formatter-editor">
        <div className="field-label-row">
          <label htmlFor="xml-editor">XML editor</label>
          <span>{input.length} characters</span>
        </div>
        <textarea
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
          <p className="data-formatter-error" id="xml-editor-error">Provided XML is not valid.</p>
        ) : (
          <p className="data-formatter-help" id="xml-editor-help">Valid XML is normalized after you pause typing.</p>
        )}
      </div>

      <div className="tool-actions data-formatter-actions">
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
