import { useState } from 'react';
import { Check, Clipboard, Eraser } from 'lucide-react';
import { convertTextCase, type TextCase } from './textCase';

const formats: { label: string; value: TextCase }[] = [
  { label: 'Sentence case', value: 'sentence' },
  { label: 'Title Case', value: 'title' },
  { label: 'camelCase', value: 'camel' },
  { label: 'kebab-case', value: 'kebab' },
];

export default function TextCaseTool() {
  const [input, setInput] = useState('ship useful developer tools');
  const [format, setFormat] = useState<TextCase>('title');
  const [copied, setCopied] = useState(false);
  const output = convertTextCase(input, format);

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="tool-card" aria-label="Text case converter">
      <div className="field-group">
        <label htmlFor="source-text">Your text</label>
        <textarea
          id="source-text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={7}
          placeholder="Paste or type text here"
        />
      </div>

      <fieldset className="format-picker">
        <legend>Output format</legend>
        <div className="segmented-control">
          {formats.map((item) => (
            <button
              className={format === item.value ? 'is-selected' : ''}
              key={item.value}
              onClick={() => setFormat(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="field-group">
        <div className="field-label-row">
          <label htmlFor="converted-text">Converted text</label>
          <span>{output.length} characters</span>
        </div>
        <textarea id="converted-text" value={output} rows={7} readOnly />
      </div>

      <div className="tool-actions">
        <button className="button button-secondary" onClick={() => setInput('')} type="button">
          <Eraser size={17} aria-hidden="true" />
          Clear
        </button>
        <button className="button button-primary" disabled={!output} onClick={copyOutput} type="button">
          {copied ? <Check size={17} aria-hidden="true" /> : <Clipboard size={17} aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy result'}
        </button>
      </div>
    </section>
  );
}
