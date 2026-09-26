import { useEffect, useRef, useState } from 'react';
import { Check, Clipboard, Eraser } from 'lucide-react';
import { formatJson, type JsonFormatMode } from './jsonFormatter';

const INITIAL_JSON = '{"hello": "world", "foo": "bar"}';
const FORMAT_DELAY = 450;

export default function JsonFormatterTool() {
  const [input, setInput] = useState(INITIAL_JSON);
  const [mode, setMode] = useState<JsonFormatMode>('prettify');
  const [indentSize, setIndentSize] = useState(3);
  const [sortKeys, setSortKeys] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);
  const result = formatJson(input, { indentSize, mode, sortKeys });

  useEffect(() => {
    const formatted = formatJson(input, { indentSize, mode, sortKeys });
    if (formatted.error || formatted.value === input) {
      return;
    }

    const timer = window.setTimeout(() => {
      setInput((currentInput) => currentInput === input ? formatted.value : currentInput);
    }, FORMAT_DELAY);
    return () => window.clearTimeout(timer);
  }, [indentSize, input, mode, sortKeys]);

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
    <section className="tool-card data-formatter-tool" aria-label="JSON formatter">
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
              checked={sortKeys}
              disabled={mode === 'minify'}
              onChange={(event) => setSortKeys(event.target.checked)}
              type="checkbox"
            />
            Sort object keys
          </label>
          <label className="data-formatter-indent-option" htmlFor="json-indent-size">
            Indent size
            <input
              disabled={mode === 'minify'}
              id="json-indent-size"
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
          <label htmlFor="json-editor">JSON editor</label>
          <span>{input.length} characters</span>
        </div>
        <textarea
          aria-describedby={result.error ? 'json-editor-error' : 'json-editor-help'}
          aria-invalid={result.error}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          autoFocus
          id="json-editor"
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste your JSON or JSON5 here..."
          rows={24}
          spellCheck={false}
          value={input}
        />
        {result.error ? (
          <p className="data-formatter-error" id="json-editor-error">Provided JSON is not valid.</p>
        ) : (
          <p className="data-formatter-help" id="json-editor-help">Valid JSON5 is normalized as strict JSON after you pause typing.</p>
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
          {copied ? 'Copied' : 'Copy JSON'}
        </button>
      </div>
    </section>
  );
}
