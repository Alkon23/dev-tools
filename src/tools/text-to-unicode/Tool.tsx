import { useEffect, useRef, useState } from 'react';
import { Check, Clipboard } from 'lucide-react';
import { convertTextToUnicode, convertUnicodeToText } from './textToUnicode';

type CopiedOutput = 'text-to-unicode' | 'unicode-to-text' | null;

export default function TextToUnicodeTool() {
  const [inputText, setInputText] = useState('');
  const [inputUnicode, setInputUnicode] = useState('');
  const [copiedOutput, setCopiedOutput] = useState<CopiedOutput>(null);
  const copyTimerRef = useRef<number | null>(null);
  const unicodeFromText = inputText.trim() ? convertTextToUnicode(inputText) : '';
  const textFromUnicode = inputUnicode.trim() ? convertUnicodeToText(inputUnicode) : '';

  useEffect(() => () => {
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
  }, []);

  async function copyOutput(value: string, output: Exclude<CopiedOutput, null>) {
    await navigator.clipboard.writeText(value);
    setCopiedOutput(output);
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => setCopiedOutput(null), 1600);
  }

  return (
    <section className="text-unicode-tool" aria-label="Text to Unicode">
      <div className="tool-card text-unicode-panel">
        <h2>Encode text</h2>
        <div className="field-group">
          <label htmlFor="unicode-source-text">Enter text to convert to Unicode</label>
          <textarea
            autoFocus
            id="unicode-source-text"
            onChange={(event) => setInputText(event.target.value)}
            placeholder="e.g. 'Hello Avengers'"
            rows={5}
            value={inputText}
          />
        </div>
        <div className="field-group">
          <label htmlFor="unicode-from-text">Unicode from your text</label>
          <textarea
            className="text-unicode-output"
            id="unicode-from-text"
            placeholder="The Unicode representation of your text will be here"
            readOnly
            rows={5}
            value={unicodeFromText}
          />
        </div>
        <div className="text-unicode-actions">
          <button
            className="button button-primary"
            disabled={!unicodeFromText}
            onClick={() => copyOutput(unicodeFromText, 'text-to-unicode')}
            type="button"
          >
            {copiedOutput === 'text-to-unicode' ? <Check size={17} aria-hidden="true" /> : <Clipboard size={17} aria-hidden="true" />}
            {copiedOutput === 'text-to-unicode' ? 'Copied' : 'Copy Unicode'}
          </button>
        </div>
      </div>

      <div className="tool-card text-unicode-panel">
        <h2>Decode Unicode</h2>
        <div className="field-group">
          <label htmlFor="unicode-source-value">Enter Unicode to convert to text</label>
          <textarea
            className="text-unicode-output"
            id="unicode-source-value"
            onChange={(event) => setInputUnicode(event.target.value)}
            placeholder="Input Unicode"
            rows={5}
            value={inputUnicode}
          />
        </div>
        <div className="field-group">
          <label htmlFor="text-from-unicode">Text from your Unicode</label>
          <textarea
            id="text-from-unicode"
            placeholder="The text representation of your Unicode will be here"
            readOnly
            rows={5}
            value={textFromUnicode}
          />
        </div>
        <div className="text-unicode-actions">
          <button
            className="button button-primary"
            disabled={!textFromUnicode}
            onClick={() => copyOutput(textFromUnicode, 'unicode-to-text')}
            type="button"
          >
            {copiedOutput === 'unicode-to-text' ? <Check size={17} aria-hidden="true" /> : <Clipboard size={17} aria-hidden="true" />}
            {copiedOutput === 'unicode-to-text' ? 'Copied' : 'Copy text'}
          </button>
        </div>
      </div>
    </section>
  );
}
