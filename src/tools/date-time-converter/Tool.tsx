import { useEffect, useRef, useState } from 'react';
import { Check, Clipboard, RotateCcw, Trash2, Undo2 } from 'lucide-react';
import {
  DATE_FORMATS,
  DEFAULT_FORMAT_ID,
  detectDateFormat,
  formatCustomDate,
  formatPredefinedDate,
  parseDateInput,
  type DateFormatId,
} from './dateTimeConverter';

interface FormatToken {
  value: string;
  display?: string;
  label: string;
}

interface TokenGroup {
  label: string;
  tokens: readonly FormatToken[];
}

const DEFAULT_CUSTOM_TOKENS = ['yyyy', '-', 'MM', '-', 'dd', ' ', 'HH', ':', 'mm', ':', 'ss'];

const COMMON_TOKEN_GROUPS: readonly TokenGroup[] = [
  {
    label: 'Date',
    tokens: [
      { value: 'yyyy', label: '4-digit year' },
      { value: 'yy', label: '2-digit year' },
      { value: 'MMMM', label: 'Full month' },
      { value: 'MMM', label: 'Short month' },
      { value: 'MM', label: '2-digit month' },
      { value: 'M', label: 'Month' },
      { value: 'dd', label: '2-digit day' },
      { value: 'd', label: 'Day' },
      { value: 'EEEE', label: 'Full weekday' },
      { value: 'EEE', label: 'Short weekday' },
    ],
  },
  {
    label: 'Time',
    tokens: [
      { value: 'HH', label: '24-hour, padded' },
      { value: 'H', label: '24-hour' },
      { value: 'hh', label: '12-hour, padded' },
      { value: 'h', label: '12-hour' },
      { value: 'mm', label: 'Minutes, padded' },
      { value: 'm', label: 'Minutes' },
      { value: 'ss', label: 'Seconds, padded' },
      { value: 's', label: 'Seconds' },
      { value: 'SSS', label: 'Milliseconds' },
      { value: 'a', label: 'AM or PM' },
    ],
  },
  {
    label: 'Timezone',
    tokens: [
      { value: 'XXX', label: 'Offset with colon' },
      { value: 'xx', label: 'Offset without colon' },
    ],
  },
  {
    label: 'Separators',
    tokens: [
      { value: ' ', display: 'space', label: 'Space' },
      { value: '-', label: 'Dash' },
      { value: '/', label: 'Slash' },
      { value: ':', label: 'Colon' },
      { value: '.', label: 'Period' },
      { value: ', ', display: ', + space', label: 'Comma and space' },
      { value: "'T'", display: 'T', label: 'Literal T' },
    ],
  },
];

const ADVANCED_TOKEN_GROUPS: readonly TokenGroup[] = [
  {
    label: 'Era and quarter',
    tokens: [
      { value: 'G', label: 'Era' },
      { value: 'GGG', label: 'Short era' },
      { value: 'GGGG', label: 'Full era' },
      { value: 'Q', label: 'Quarter' },
      { value: 'Qo', label: 'Ordinal quarter' },
      { value: 'QQQ', label: 'Short quarter' },
      { value: 'QQQQ', label: 'Full quarter' },
    ],
  },
  {
    label: 'Ordinals and ISO week',
    tokens: [
      { value: 'Mo', label: 'Ordinal month' },
      { value: 'do', label: 'Ordinal day' },
      { value: 'RRRR', label: 'ISO week-year' },
      { value: 'I', label: 'ISO week' },
      { value: 'II', label: 'ISO week, padded' },
      { value: 'Io', label: 'Ordinal ISO week' },
    ],
  },
  {
    label: 'Precision and timezone',
    tokens: [
      { value: 'S', label: 'Tenths of a second' },
      { value: 'SS', label: 'Hundredths of a second' },
      { value: 'X', label: 'Basic timezone' },
      { value: 'XX', label: 'Timezone with minutes' },
      { value: 'XXXX', label: 'Timezone with seconds' },
      { value: 'XXXXX', label: 'Extended timezone' },
      { value: 'O', label: 'Short GMT offset' },
      { value: 'OOOO', label: 'Long GMT offset' },
      { value: 'z', label: 'Short timezone name' },
      { value: 'zzzz', label: 'Long timezone name' },
    ],
  },
  {
    label: 'Unix values',
    tokens: [
      { value: 't', label: 'Unix seconds' },
      { value: 'T', label: 'Unix milliseconds' },
    ],
  },
];

function TokenGroups({ groups, onAdd }: { groups: readonly TokenGroup[]; onAdd: (token: string) => void }) {
  return groups.map((group) => (
    <div className="date-token-group" key={group.label}>
      <h3>{group.label}</h3>
      <div className="date-token-list">
        {group.tokens.map((token) => (
          <button
            aria-label={`Add ${token.label} (${token.display ?? token.value})`}
            className="date-token"
            key={`${group.label}-${token.value}`}
            onClick={() => onAdd(token.value)}
            title={token.label}
            type="button"
          >
            <code>{token.display ?? token.value}</code>
            <span>{token.label}</span>
          </button>
        ))}
      </div>
    </div>
  ));
}

export default function DateTimeConverterTool() {
  const [inputDate, setInputDate] = useState('');
  const [inputFormat, setInputFormat] = useState<DateFormatId>(DEFAULT_FORMAT_ID);
  const [now, setNow] = useState(() => new Date());
  const [customTokens, setCustomTokens] = useState<string[]>(DEFAULT_CUSTOM_TOKENS);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (inputDate) {
      return undefined;
    }

    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, [inputDate]);

  useEffect(() => () => {
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
  }, []);

  const normalizedDate = parseDateInput(inputDate, inputFormat, now);
  const predefinedResults = normalizedDate ? formatPredefinedDate(normalizedDate) : [];
  const customPattern = customTokens.join('');
  const customResult = normalizedDate ? formatCustomDate(normalizedDate, customPattern) : '';
  const hasInvalidInput = inputDate.trim() !== '' && !normalizedDate;

  function updateInputDate(value: string) {
    setInputDate(value);
    const detectedFormat = detectDateFormat(value);
    if (detectedFormat) {
      setInputFormat(detectedFormat);
    }
  }

  async function copyValue(value: string, id: string) {
    await navigator.clipboard.writeText(value);
    setCopiedValue(id);
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => setCopiedValue(null), 1600);
  }

  return (
    <section className="date-converter-tool" aria-label="Date-time converter">
      <div className="date-input-shell">
        <div className="date-input-grid">
          <div className="field-group">
            <label htmlFor="date-converter-input">Date or timestamp</label>
            <input
              aria-describedby={hasInvalidInput ? 'date-input-error' : undefined}
              aria-invalid={hasInvalidInput}
              autoFocus
              id="date-converter-input"
              onChange={(event) => updateInputDate(event.target.value)}
              placeholder="Enter a date or leave empty for now"
              type="text"
              value={inputDate}
            />
          </div>
          <div className="field-group date-format-select">
            <label htmlFor="date-input-format">Input format</label>
            <select
              id="date-input-format"
              onChange={(event) => setInputFormat(event.target.value as DateFormatId)}
              value={inputFormat}
            >
              {DATE_FORMATS.map((dateFormat) => (
                <option key={dateFormat.id} value={dateFormat.id}>{dateFormat.label}</option>
              ))}
            </select>
          </div>
        </div>
        {hasInvalidInput && <p className="date-input-error" id="date-input-error">This date is invalid for the selected input format.</p>}
      </div>

      <div className="date-converter-columns">
        <div className="tool-card date-converter-panel">
          <div className="date-panel-heading">
            <span className="section-index">01</span>
            <div>
              <h2>Predefined formats</h2>
              <p>Standard representations of the selected instant.</p>
            </div>
          </div>

          <div className="date-results" aria-live="polite">
            {DATE_FORMATS.map((dateFormat) => {
              const value = predefinedResults.find(({ id }) => id === dateFormat.id)?.value ?? '';
              return (
                <div className="date-result" key={dateFormat.id}>
                  <label htmlFor={`date-result-${dateFormat.id}`}>{dateFormat.label}</label>
                  <div className="date-copy-field">
                    <input id={`date-result-${dateFormat.id}`} readOnly value={value} placeholder="Invalid date" />
                    <button
                      aria-label={`Copy ${dateFormat.label}`}
                      disabled={!value}
                      onClick={() => copyValue(value, dateFormat.id)}
                      title={`Copy ${dateFormat.label}`}
                      type="button"
                    >
                      {copiedValue === dateFormat.id ? <Check size={16} aria-hidden="true" /> : <Clipboard size={16} aria-hidden="true" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="tool-card date-converter-panel date-builder-panel">
          <div className="date-panel-heading">
            <span className="section-index">02</span>
            <div>
              <h2>Custom format builder</h2>
              <p>Build a pattern by adding tokens in order.</p>
            </div>
          </div>

          <div className="date-builder-preview">
            <div>
              <span>Format string</span>
              <code aria-label="Custom format string">{customPattern || 'No tokens selected'}</code>
            </div>
            <div className="date-result">
              <label htmlFor="custom-date-result">Custom result</label>
              <div className="date-copy-field">
                <input id="custom-date-result" readOnly value={customResult} placeholder="Add tokens to build a format" />
                <button
                  aria-label="Copy custom result"
                  disabled={!customResult}
                  onClick={() => copyValue(customResult, 'custom')}
                  title="Copy custom result"
                  type="button"
                >
                  {copiedValue === 'custom' ? <Check size={16} aria-hidden="true" /> : <Clipboard size={16} aria-hidden="true" />}
                </button>
              </div>
            </div>
          </div>

          <div className="date-builder-actions" aria-label="Format builder actions">
            <button className="button button-secondary" disabled={!customTokens.length} onClick={() => setCustomTokens((tokens) => tokens.slice(0, -1))} type="button">
              <Undo2 size={15} aria-hidden="true" /> Undo
            </button>
            <button className="button button-secondary" disabled={!customTokens.length} onClick={() => setCustomTokens([])} type="button">
              <Trash2 size={15} aria-hidden="true" /> Clear
            </button>
            <button className="button button-secondary" onClick={() => setCustomTokens(DEFAULT_CUSTOM_TOKENS)} type="button">
              <RotateCcw size={15} aria-hidden="true" /> Reset
            </button>
          </div>

          <div className="date-token-groups">
            <TokenGroups groups={COMMON_TOKEN_GROUPS} onAdd={(token) => setCustomTokens((tokens) => [...tokens, token])} />
          </div>

          <details className="date-advanced-tokens">
            <summary>Advanced tokens</summary>
            <div className="date-token-groups">
              <TokenGroups groups={ADVANCED_TOKEN_GROUPS} onAdd={(token) => setCustomTokens((tokens) => [...tokens, token])} />
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
