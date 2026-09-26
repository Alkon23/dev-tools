import { useEffect, useRef, useState } from 'react';
import { Check, Clipboard, Plus, Trash2, X } from 'lucide-react';
import {
  INITIAL_URL,
  addQueryEntry,
  getQueryEntries,
  getUrlParts,
  parseUrl,
  removeQueryEntry,
  updateQueryEntry,
  updateUrlPart,
  type UrlPart,
  type UrlParts,
} from './urlParser';

interface PartDefinition {
  key: UrlPart;
  label: string;
  removable?: boolean;
}

const PARTS: PartDefinition[] = [
  { key: 'protocol', label: 'Protocol' },
  { key: 'username', label: 'Username', removable: true },
  { key: 'password', label: 'Password', removable: true },
  { key: 'hostname', label: 'Hostname' },
  { key: 'port', label: 'Port', removable: true },
  { key: 'pathname', label: 'Path' },
  { key: 'search', label: 'Query', removable: true },
  { key: 'hash', label: 'Fragment', removable: true },
];

const EMPTY_PARTS: UrlParts = {
  protocol: '',
  username: '',
  password: '',
  hostname: '',
  port: '',
  pathname: '',
  search: '',
  hash: '',
};

export default function UrlParserTool() {
  const initialParsedUrl = new URL(INITIAL_URL);
  const [urlValue, setUrlValue] = useState(INITIAL_URL);
  const [partDrafts, setPartDrafts] = useState(() => getUrlParts(initialParsedUrl));
  const [invalidPart, setInvalidPart] = useState<UrlPart | null>(null);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const parsedUrl = parseUrl(urlValue);
  const queryEntries = getQueryEntries(urlValue);

  useEffect(() => () => {
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
  }, []);

  function applyUrl(nextUrl: string) {
    const parsed = new URL(nextUrl);
    setUrlValue(nextUrl);
    setPartDrafts(getUrlParts(parsed));
    setInvalidPart(null);
  }

  function changeSource(value: string) {
    setUrlValue(value);
    const parsed = parseUrl(value);
    if (parsed) {
      setPartDrafts(getUrlParts(parsed));
      setInvalidPart(null);
    }
  }

  function changePartDraft(part: UrlPart, value: string) {
    setPartDrafts((drafts) => ({ ...drafts, [part]: value }));
    if (invalidPart === part) {
      setInvalidPart(null);
    }
  }

  function commitPart(part: UrlPart) {
    const result = updateUrlPart(urlValue, part, partDrafts[part]);
    if (result.error) {
      setInvalidPart(part);
      return;
    }
    applyUrl(result.value);
  }

  function removePart(part: UrlPart) {
    const result = updateUrlPart(urlValue, part, '');
    if (!result.error) {
      applyUrl(result.value);
    }
  }

  function changeQueryEntry(index: number, key: string, value: string) {
    applyUrl(updateQueryEntry(urlValue, index, key, value));
  }

  async function copyValue(id: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedValue(id);
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => setCopiedValue(null), 1600);
  }

  return (
    <section className="url-parser-tool" aria-label="URL parser">
      <div className="tool-card url-source-card">
        <div className="url-section-heading">
          <div>
            <span className="section-index">SOURCE</span>
            <h2>URL workspace</h2>
          </div>
          <button
            className="button button-secondary"
            disabled={!parsedUrl}
            onClick={() => copyValue('source', parsedUrl?.href ?? '')}
            type="button"
          >
            {copiedValue === 'source' ? <Check size={16} aria-hidden="true" /> : <Clipboard size={16} aria-hidden="true" />}
            {copiedValue === 'source' ? 'Copied' : 'Copy URL'}
          </button>
        </div>
        <label htmlFor="url-parser-source">URL to parse and edit</label>
        <textarea
          aria-describedby={!parsedUrl ? 'url-parser-source-error' : undefined}
          aria-invalid={!parsedUrl}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          autoFocus
          id="url-parser-source"
          onChange={(event) => changeSource(event.target.value)}
          rows={3}
          spellCheck={false}
          value={urlValue}
        />
        {!parsedUrl && <p className="url-field-error" id="url-parser-source-error">Enter a valid absolute URL.</p>}
      </div>

      <div className="tool-card url-parts-card">
        <div className="url-section-heading">
          <div>
            <span className="section-index">PARTS</span>
            <h2>Components</h2>
          </div>
          <p>Edit any field to rebuild the source URL.</p>
        </div>

        <div className="url-parts-grid">
          {PARTS.map(({ key, label, removable }) => {
            const value = parsedUrl ? partDrafts[key] : EMPTY_PARTS[key];
            const errorId = `url-part-${key}-error`;
            return (
              <div className="url-part-field" key={key}>
                <label htmlFor={`url-part-${key}`}>{label}</label>
                <div className={`url-part-input-group${removable ? ' has-remove' : ''}`}>
                  <input
                    aria-describedby={invalidPart === key ? errorId : undefined}
                    aria-invalid={invalidPart === key}
                    disabled={!parsedUrl}
                    id={`url-part-${key}`}
                    onBlur={() => commitPart(key)}
                    onChange={(event) => changePartDraft(key, event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.currentTarget.blur();
                      }
                    }}
                    spellCheck={false}
                    type="text"
                    value={value}
                  />
                  <button
                    aria-label={`Copy ${label}`}
                    disabled={!value}
                    onClick={() => copyValue(key, value)}
                    title={`Copy ${label}`}
                    type="button"
                  >
                    {copiedValue === key ? <Check size={15} aria-hidden="true" /> : <Clipboard size={15} aria-hidden="true" />}
                  </button>
                  {removable && (
                    <button
                      aria-label={`Remove ${label}`}
                      disabled={!value}
                      onClick={() => removePart(key)}
                      title={`Remove ${label}`}
                      type="button"
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                  )}
                </div>
                {invalidPart === key && <p className="url-field-error" id={errorId}>This value cannot be applied to the URL.</p>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="tool-card url-query-card">
        <div className="url-section-heading">
          <div>
            <span className="section-index">QUERY</span>
            <h2>Parameters</h2>
          </div>
          <button
            className="button button-secondary"
            disabled={!parsedUrl}
            onClick={() => applyUrl(addQueryEntry(urlValue))}
            type="button"
          >
            <Plus size={16} aria-hidden="true" />
            Add parameter
          </button>
        </div>

        {queryEntries.length === 0 ? (
          <p className="url-query-empty">This URL has no query parameters.</p>
        ) : (
          <div className="url-query-list">
            {queryEntries.map(([key, value], index) => (
              <div className="url-query-row" key={index}>
                <div className="url-query-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
                <div className="url-query-field">
                  <label htmlFor={`url-query-key-${index}`}>Parameter {index + 1} name</label>
                  <input
                    id={`url-query-key-${index}`}
                    onChange={(event) => changeQueryEntry(index, event.target.value, value)}
                    spellCheck={false}
                    type="text"
                    value={key}
                  />
                </div>
                <div className="url-query-field">
                  <label htmlFor={`url-query-value-${index}`}>Parameter {index + 1} value</label>
                  <input
                    id={`url-query-value-${index}`}
                    onChange={(event) => changeQueryEntry(index, key, event.target.value)}
                    spellCheck={false}
                    type="text"
                    value={value}
                  />
                </div>
                <button
                  aria-label={`Remove parameter ${index + 1}`}
                  className="url-query-remove"
                  onClick={() => applyUrl(removeQueryEntry(urlValue, index))}
                  title={`Remove parameter ${index + 1}`}
                  type="button"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
