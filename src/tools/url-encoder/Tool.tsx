import { useEffect, useRef, useState } from 'react';
import { Check, Clipboard } from 'lucide-react';
import { decodeUrlComponent, encodeUrlComponent } from './urlEncoder';

type CopiedOutput = 'encoded' | 'decoded' | null;

export default function UrlEncoderTool() {
  const [encodeInput, setEncodeInput] = useState('Hello world :)');
  const [decodeInput, setDecodeInput] = useState('Hello%20world%20%3A)');
  const [copiedOutput, setCopiedOutput] = useState<CopiedOutput>(null);
  const copyTimerRef = useRef<number | null>(null);
  const encoded = encodeUrlComponent(encodeInput);
  const decoded = decodeUrlComponent(decodeInput);

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
    <section className="url-encoder-tool" aria-label="URL encoder / decoder">
      <div className="tool-card url-codec-panel">
        <span className="section-index">ENCODE</span>
        <h2>Encode a URL component</h2>
        <p className="url-codec-description">Convert text and reserved characters into percent-encoded form.</p>

        <div className="field-group">
          <label htmlFor="url-encode-input">Text to encode</label>
          <textarea
            aria-describedby={encoded.error ? 'url-encode-error' : undefined}
            aria-invalid={encoded.error}
            autoFocus
            id="url-encode-input"
            onChange={(event) => setEncodeInput(event.target.value)}
            placeholder="The string to encode"
            rows={4}
            value={encodeInput}
          />
          {encoded.error && <p className="url-field-error" id="url-encode-error">This text cannot be URL encoded.</p>}
        </div>

        <div className="field-group">
          <label htmlFor="url-encode-output">Encoded text</label>
          <textarea id="url-encode-output" readOnly rows={4} value={encoded.value} />
        </div>

        <div className="url-codec-actions">
          <button
            className="button button-primary"
            disabled={encoded.error || !encoded.value}
            onClick={() => copyOutput(encoded.value, 'encoded')}
            type="button"
          >
            {copiedOutput === 'encoded' ? <Check size={17} aria-hidden="true" /> : <Clipboard size={17} aria-hidden="true" />}
            {copiedOutput === 'encoded' ? 'Copied' : 'Copy encoded text'}
          </button>
        </div>
      </div>

      <div className="tool-card url-codec-panel">
        <span className="section-index">DECODE</span>
        <h2>Decode a URL component</h2>
        <p className="url-codec-description">Turn percent escapes back into their original characters.</p>

        <div className="field-group">
          <label htmlFor="url-decode-input">Encoded text</label>
          <textarea
            aria-describedby={decoded.error ? 'url-decode-error' : undefined}
            aria-invalid={decoded.error}
            id="url-decode-input"
            onChange={(event) => setDecodeInput(event.target.value)}
            placeholder="The string to decode"
            rows={4}
            value={decodeInput}
          />
          {decoded.error && <p className="url-field-error" id="url-decode-error">This is not valid percent-encoded text.</p>}
        </div>

        <div className="field-group">
          <label htmlFor="url-decode-output">Decoded text</label>
          <textarea id="url-decode-output" readOnly rows={4} value={decoded.value} />
        </div>

        <div className="url-codec-actions">
          <button
            className="button button-primary"
            disabled={decoded.error || !decoded.value}
            onClick={() => copyOutput(decoded.value, 'decoded')}
            type="button"
          >
            {copiedOutput === 'decoded' ? <Check size={17} aria-hidden="true" /> : <Clipboard size={17} aria-hidden="true" />}
            {copiedOutput === 'decoded' ? 'Copied' : 'Copy decoded text'}
          </button>
        </div>
      </div>
    </section>
  );
}
