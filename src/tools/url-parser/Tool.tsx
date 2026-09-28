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
    <section className="mx-auto flex max-w-[1180px] flex-col gap-[18px]" aria-label="URL parser">
      <div className="tool-card p-[clamp(22px,3vw,32px)]">
        <div className="mb-[22px] flex items-center justify-between border-b border-line pb-[18px] max-[420px]:items-start max-[420px]:flex-col max-[420px]:gap-3">
          <div className="flex items-baseline gap-2.5">
            <span className="section-index">SOURCE</span>
            <h2 className="m-0 text-lg font-semibold">URL workspace</h2>
          </div>
          <button
            className="button button-secondary max-[420px]:w-full"
            disabled={!parsedUrl}
            onClick={() => copyValue('source', parsedUrl?.href ?? '')}
            type="button"
          >
            {copiedValue === 'source' ? <Check size={16} aria-hidden="true" /> : <Clipboard size={16} aria-hidden="true" />}
            {copiedValue === 'source' ? 'Copied' : 'Copy URL'}
          </button>
        </div>
        <label className="mb-[7px] block text-[11px] font-semibold text-[#45504c]" htmlFor="url-parser-source">URL to parse and edit</label>
        <textarea
          className="font-mono text-xs aria-invalid:border-[#b74b42]"
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
        {!parsedUrl && <p className="error-text" id="url-parser-source-error">Enter a valid absolute URL.</p>}
      </div>

      <div className="tool-card p-[clamp(22px,3vw,32px)]">
        <div className="mb-[22px] flex items-center justify-between border-b border-line pb-[18px] max-[420px]:items-start max-[420px]:flex-col max-[420px]:gap-3">
          <div className="flex items-baseline gap-2.5">
            <span className="section-index">PARTS</span>
            <h2 className="m-0 text-lg font-semibold">Components</h2>
          </div>
          <p className="m-0 text-xs leading-[1.5] text-muted">Edit any field to rebuild the source URL.</p>
        </div>

        <div className="grid grid-cols-2 gap-[17px] max-[760px]:grid-cols-1">
          {PARTS.map(({ key, label, removable }) => {
            const value = parsedUrl ? partDrafts[key] : EMPTY_PARTS[key];
            const errorId = `url-part-${key}-error`;
            return (
              <div className="min-w-0" key={key}>
                <label className="mb-[7px] block text-[11px] font-semibold text-[#45504c]" htmlFor={`url-part-${key}`}>{label}</label>
                <div className={`grid ${removable ? 'grid-cols-[minmax(0,1fr)_42px_42px]' : 'grid-cols-[minmax(0,1fr)_42px]'}`}>
                  <input
                    className="input-control rounded-r-none font-mono text-xs focus:relative focus:z-1"
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
                    className="copy-button rounded-none"
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
                      className="copy-button"
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
                {invalidPart === key && <p className="error-text mt-1.5" id={errorId}>This value cannot be applied to the URL.</p>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="tool-card p-[clamp(22px,3vw,32px)]">
        <div className="mb-[22px] flex items-center justify-between border-b border-line pb-[18px] max-[420px]:items-start max-[420px]:flex-col max-[420px]:gap-3">
          <div className="flex items-baseline gap-2.5">
            <span className="section-index">QUERY</span>
            <h2 className="m-0 text-lg font-semibold">Parameters</h2>
          </div>
          <button
            className="button button-secondary max-[420px]:w-full"
            disabled={!parsedUrl}
            onClick={() => applyUrl(addQueryEntry(urlValue))}
            type="button"
          >
            <Plus size={16} aria-hidden="true" />
            Add parameter
          </button>
        </div>

        {queryEntries.length === 0 ? (
          <p className="m-0 rounded-lg border border-dashed border-[#ccd4d0] bg-[#f8faf9] p-5 text-center text-xs leading-[1.5] text-muted">This URL has no query parameters.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {queryEntries.map(([key, value], index) => (
              <div className="grid grid-cols-[42px_minmax(0,1fr)_minmax(0,1fr)_42px] items-end max-[760px]:grid-cols-[36px_minmax(0,1fr)_42px] max-[760px]:items-stretch" key={index}>
                <div className="flex h-11 items-center justify-center self-end rounded-l-[7px] border border-[#d8dfdc] bg-[#eef1ef] font-mono text-[10px] text-muted max-[760px]:row-span-2 max-[760px]:h-auto max-[760px]:self-stretch" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
                <div className="min-w-0 max-[760px]:col-start-2">
                  <label className="mb-[7px] block text-[11px] font-semibold text-[#45504c]" htmlFor={`url-query-key-${index}`}>Parameter {index + 1} name</label>
                  <input
                    className="input-control rounded-none border-l-0 font-mono text-xs max-[760px]:rounded-tr-[7px] max-[760px]:border-l"
                    id={`url-query-key-${index}`}
                    onChange={(event) => changeQueryEntry(index, event.target.value, value)}
                    spellCheck={false}
                    type="text"
                    value={key}
                  />
                </div>
                <div className="min-w-0 max-[760px]:col-start-2">
                  <label className="mb-[7px] block text-[11px] font-semibold text-[#45504c] max-[760px]:sr-only" htmlFor={`url-query-value-${index}`}>Parameter {index + 1} value</label>
                  <input
                    className="input-control rounded-none border-l-0 font-mono text-xs max-[760px]:rounded-br-[7px] max-[760px]:border-t-0 max-[760px]:border-l"
                    id={`url-query-value-${index}`}
                    onChange={(event) => changeQueryEntry(index, key, event.target.value)}
                    spellCheck={false}
                    type="text"
                    value={value}
                  />
                </div>
                <button
                  aria-label={`Remove parameter ${index + 1}`}
                  className="copy-button h-11 self-end max-[760px]:col-start-3 max-[760px]:row-span-2 max-[760px]:row-start-1 max-[760px]:ml-[7px] max-[760px]:h-full max-[760px]:rounded-[7px] max-[760px]:border-l"
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
