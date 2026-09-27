import { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor/editor/editor.api.js';
import EditorWorker from 'monaco-editor/editor/editor.worker.js?worker';
import 'monaco-editor/features/codicon/register.js';
import { RegexCheatsheet } from './RegexCheatsheet';
import { REGEX_LANGUAGE_ID, REGEX_THEME_ID, registerRegexLanguage } from './regexLanguage';
import {
  DEFAULT_REGEX_FLAGS,
  buildRegexFlags,
  supportsUnicodeSets,
  type RegexFlags,
  type RegexWorkerResult,
} from './regexTester';
import { RegexWorkerClient } from './regexWorkerClient';

(globalThis as typeof globalThis & { MonacoEnvironment: { getWorker: () => Worker } }).MonacoEnvironment = {
  getWorker: () => new EditorWorker(),
};

const INITIAL_PATTERN = '([A-Z])\\w+';
const INITIAL_TEXT = 'Regex Tester makes patterns visible.\nTesting tools should explain their matches.';

const FLAG_OPTIONS: readonly { key: keyof Omit<RegexFlags, 'unicodeMode'>; flag: string; label: string; title: string }[] = [
  { key: 'global', flag: 'g', label: 'Global', title: 'Find every match' },
  { key: 'ignoreCase', flag: 'i', label: 'Ignore case', title: 'Use case-insensitive matching' },
  { key: 'multiline', flag: 'm', label: 'Multiline', title: 'Let ^ and $ match line boundaries' },
  { key: 'dotAll', flag: 's', label: 'Dot all', title: 'Let . match line breaks' },
  { key: 'sticky', flag: 'y', label: 'Sticky', title: 'Match only at the current lastIndex position' },
];

function getStatusText(result: RegexWorkerResult): string {
  if (result.status === 'idle') {
    return 'Enter a pattern to begin testing.';
  }
  if (result.status === 'error' || result.status === 'timeout') {
    return result.message;
  }
  if (result.truncated) {
    return `Showing the first ${result.matches.length} matches.`;
  }
  return `${result.matches.length} ${result.matches.length === 1 ? 'match' : 'matches'}`;
}

export default function RegexTesterTool() {
  const [pattern, setPattern] = useState(INITIAL_PATTERN);
  const [text, setText] = useState(INITIAL_TEXT);
  const [flags, setFlags] = useState<RegexFlags>({ ...DEFAULT_REGEX_FLAGS });
  const [result, setResult] = useState<RegexWorkerResult>({ matches: [], status: 'idle', truncated: false });
  const patternContainerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const patternModelRef = useRef<monaco.editor.ITextModel | null>(null);
  const textModelRef = useRef<monaco.editor.ITextModel | null>(null);
  const decorationsRef = useRef<monaco.editor.IEditorDecorationsCollection | null>(null);
  const workerClientRef = useRef<RegexWorkerClient | null>(null);
  const unicodeSetsSupported = supportsUnicodeSets();
  const activeFlags = buildRegexFlags(flags);

  useEffect(() => {
    if (!patternContainerRef.current || !textContainerRef.current) {
      return undefined;
    }

    registerRegexLanguage();
    const patternModel = monaco.editor.createModel(INITIAL_PATTERN, REGEX_LANGUAGE_ID);
    const textModel = monaco.editor.createModel(INITIAL_TEXT, 'plaintext');
    const patternEditor = monaco.editor.create(patternContainerRef.current, {
      ariaLabel: 'Regular expression pattern',
      automaticLayout: true,
      folding: false,
      fontFamily: 'DM Mono, monospace',
      fontSize: 20,
      glyphMargin: false,
      hideCursorInOverviewRuler: true,
      lineNumbers: 'off',
      minimap: { enabled: false },
      model: patternModel,
      overviewRulerLanes: 0,
      padding: { top: 13, bottom: 10 },
      renderLineHighlight: 'none',
      scrollBeyondLastLine: false,
      scrollbar: { horizontal: 'auto', vertical: 'hidden', alwaysConsumeMouseWheel: false },
      theme: REGEX_THEME_ID,
      wordWrap: 'off',
    });
    const textEditor = monaco.editor.create(textContainerRef.current, {
      ariaLabel: 'Test text',
      automaticLayout: true,
      fontFamily: 'DM Mono, monospace',
      fontSize: 14,
      lineNumbers: 'on',
      minimap: { enabled: false },
      model: textModel,
      overviewRulerLanes: 0,
      padding: { top: 14, bottom: 14 },
      scrollBeyondLastLine: false,
      theme: REGEX_THEME_ID,
      wordWrap: 'on',
    });
    const patternListener = patternModel.onDidChangeContent(() => setPattern(patternModel.getValue()));
    const textListener = textModel.onDidChangeContent(() => setText(textModel.getValue()));

    patternModelRef.current = patternModel;
    textModelRef.current = textModel;
    decorationsRef.current = textEditor.createDecorationsCollection();

    return () => {
      monaco.editor.setModelMarkers(patternModel, 'regex-tester', []);
      patternListener.dispose();
      textListener.dispose();
      decorationsRef.current?.clear();
      decorationsRef.current = null;
      patternModelRef.current = null;
      textModelRef.current = null;
      patternEditor.dispose();
      textEditor.dispose();
      patternModel.dispose();
      textModel.dispose();
    };
  }, []);

  useEffect(() => {
    const client = new RegexWorkerClient();
    workerClientRef.current = client;
    return () => {
      workerClientRef.current = null;
      client.dispose();
    };
  }, []);

  useEffect(() => {
    workerClientRef.current?.evaluate({ pattern, text, flags }, setResult);
  }, [flags, pattern, text]);

  useEffect(() => {
    const patternModel = patternModelRef.current;
    const textModel = textModelRef.current;
    const decorations = decorationsRef.current;
    if (!patternModel || !textModel || !decorations) {
      return;
    }

    if (result.status === 'error') {
      const range = patternModel.getFullModelRange();
      monaco.editor.setModelMarkers(patternModel, 'regex-tester', [{
        endColumn: range.endColumn,
        endLineNumber: range.endLineNumber,
        message: result.message,
        severity: monaco.MarkerSeverity.Error,
        startColumn: range.startColumn,
        startLineNumber: range.startLineNumber,
      }]);
    } else {
      monaco.editor.setModelMarkers(patternModel, 'regex-tester', []);
    }

    if (result.status !== 'valid') {
      decorations.clear();
      return;
    }

    decorations.set(result.matches.map((match, index) => {
      const start = textModel.getPositionAt(match.start);
      const end = textModel.getPositionAt(match.end);
      const empty = match.start === match.end;
      return {
        range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
        options: empty
          ? {
              after: { content: '│', inlineClassName: 'regex-zero-match' },
              description: `Empty regex match ${index + 1}`,
            }
          : {
              description: `Regex match ${index + 1}`,
              inlineClassName: 'regex-match-highlight',
              hoverMessage: { value: `Match ${index + 1}: offsets ${match.start}-${match.end}` },
            },
      };
    }));
  }, [result]);

  function setBooleanFlag(key: keyof Omit<RegexFlags, 'unicodeMode'>, checked: boolean) {
    setFlags((current) => ({ ...current, [key]: checked }));
  }

  return (
    <section className="regex-tester-tool" aria-label="Regex tester">
      <div className="regex-workspace">
        <div className="tool-card regex-pattern-card">
          <div className="regex-panel-heading">
            <div>
              <span className="section-index">EXPRESSION</span>
              <h2>JavaScript pattern</h2>
            </div>
            <output
              className={`regex-status regex-status-${result.status}`}
              aria-live="polite"
              htmlFor="regex-pattern-editor regex-text-editor"
            >
              {getStatusText(result)}
            </output>
          </div>

          <div className="regex-expression-shell" aria-describedby="regex-expression-help">
            <span aria-hidden="true">/</span>
            <div className="regex-pattern-editor" id="regex-pattern-editor" ref={patternContainerRef} />
            <span className="regex-expression-flags" aria-hidden="true">/{activeFlags}</span>
          </div>
          <p className="regex-expression-help" id="regex-expression-help">
            Enter the pattern without surrounding slashes. Colors distinguish regex syntax.
          </p>

          <fieldset className="regex-flags">
            <legend>Flags</legend>
            <div className="regex-flag-list">
              {FLAG_OPTIONS.map((option) => (
                <label className="regex-flag" key={option.flag} title={option.title}>
                  <input
                    checked={flags[option.key]}
                    onChange={(event) => setBooleanFlag(option.key, event.target.checked)}
                    type="checkbox"
                  />
                  <code>{option.flag}</code>
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            <div className="regex-unicode-modes" role="group" aria-label="Unicode mode">
              <span>Unicode</span>
              <label>
                <input
                  checked={flags.unicodeMode === ''}
                  name="regex-unicode-mode"
                  onChange={() => setFlags((current) => ({ ...current, unicodeMode: '' }))}
                  type="radio"
                />
                Off
              </label>
              <label>
                <input
                  checked={flags.unicodeMode === 'u'}
                  name="regex-unicode-mode"
                  onChange={() => setFlags((current) => ({ ...current, unicodeMode: 'u' }))}
                  type="radio"
                />
                <code>u</code>
              </label>
              <label title={unicodeSetsSupported ? 'Unicode sets mode' : 'Unicode sets are not supported by this browser'}>
                <input
                  checked={flags.unicodeMode === 'v'}
                  disabled={!unicodeSetsSupported}
                  name="regex-unicode-mode"
                  onChange={() => setFlags((current) => ({ ...current, unicodeMode: 'v' }))}
                  type="radio"
                />
                <code>v</code>
              </label>
            </div>
          </fieldset>
        </div>

        <div className="tool-card regex-text-card">
          <div className="regex-panel-heading">
            <div>
              <span className="section-index">TEST TEXT</span>
              <h2>Highlighted matches</h2>
            </div>
            <span className="regex-editor-note">Editable</span>
          </div>
          <div className="regex-text-editor" id="regex-text-editor" ref={textContainerRef} />
        </div>
      </div>

      <RegexCheatsheet />
    </section>
  );
}
