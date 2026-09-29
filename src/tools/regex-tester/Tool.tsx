import { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor/editor/editor.api.js';
import EditorWorker from 'monaco-editor/editor/editor.worker.js?worker';
import 'monaco-editor/features/codicon/register.js';
import { RegexCheatsheet } from './RegexCheatsheet';
import { REGEX_DARK_THEME_ID, REGEX_LANGUAGE_ID, REGEX_THEME_ID, registerRegexLanguage } from './regexLanguage';
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
    const syncTheme = () => monaco.editor.setTheme(document.documentElement.dataset.theme === 'dark' ? REGEX_DARK_THEME_ID : REGEX_THEME_ID);
    syncTheme();
    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
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
      theme: document.documentElement.dataset.theme === 'dark' ? REGEX_DARK_THEME_ID : REGEX_THEME_ID,
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
      theme: document.documentElement.dataset.theme === 'dark' ? REGEX_DARK_THEME_ID : REGEX_THEME_ID,
      wordWrap: 'on',
    });
    const patternListener = patternModel.onDidChangeContent(() => setPattern(patternModel.getValue()));
    const textListener = textModel.onDidChangeContent(() => setText(textModel.getValue()));

    patternModelRef.current = patternModel;
    textModelRef.current = textModel;
    decorationsRef.current = textEditor.createDecorationsCollection();

    return () => {
      themeObserver.disconnect();
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
    <section className="mx-auto grid max-w-[1420px] grid-cols-[minmax(0,1fr)_minmax(320px,370px)] items-start gap-[18px] max-[1100px]:grid-cols-1 [&_.regex-match-highlight]:rounded-sm [&_.regex-match-highlight]:border-b-2 [&_.regex-match-highlight]:border-[#9c7100] [&_.regex-match-highlight]:bg-[rgba(252,186,3,0.34)] [&_.regex-zero-match]:font-bold [&_.regex-zero-match]:text-[#a2392f] forced-colors:[&_.regex-match-highlight]:border forced-colors:[&_.regex-match-highlight]:border-[HighlightText] forced-colors:[&_.regex-match-highlight]:bg-[Highlight] forced-colors:[&_.regex-match-highlight]:text-[HighlightText]! forced-colors:[&_.regex-zero-match]:text-[Highlight]!" aria-label="Regex tester">
      <div className="flex min-w-0 w-full flex-col gap-[18px]">
        <div className="tool-card min-w-0 p-[clamp(22px,2.5vw,30px)] max-[420px]:px-[18px]">
          <div className="mb-5 flex items-center justify-between gap-[18px] border-b border-line pb-4 max-[760px]:items-start max-[760px]:flex-col max-[760px]:gap-2.5">
            <div>
              <span className="section-index">EXPRESSION</span>
              <h2 className="mt-1 mb-0 text-[17px] font-semibold">JavaScript pattern</h2>
            </div>
            <output
              className={`max-w-[52%] rounded-full border px-2.5 py-1.5 text-right font-mono text-[9px] leading-[1.4] max-[760px]:max-w-full max-[760px]:text-left ${result.status === 'error' || result.status === 'timeout' ? 'border-[#efc9c4] bg-[#fff1ef] text-[#963b33]' : 'border-[#dce3df] bg-[#eef2ef] text-[#52605a]'}`}
              aria-live="polite"
              htmlFor="regex-pattern-editor regex-text-editor"
            >
              {getStatusText(result)}
            </output>
          </div>

          <div className="grid min-h-[58px] grid-cols-[auto_minmax(0,1fr)_auto] items-stretch overflow-hidden rounded-[9px] border border-[#d8dfdc] bg-[#f8faf9] transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-focus" aria-describedby="regex-expression-help">
            <span className="flex items-center py-0 pr-0.5 pl-[13px] font-mono text-xl text-[#87918d] max-[420px]:pl-2.5 max-[420px]:text-[17px]" aria-hidden="true">/</span>
            <div className="h-[58px] min-w-0" id="regex-pattern-editor" ref={patternContainerRef} />
            <span className="flex items-center py-0 pr-3.5 pl-0.5 font-mono text-xl text-accent-dark max-[420px]:pr-2.5 max-[420px]:text-[17px]" aria-hidden="true">/{activeFlags}</span>
          </div>
          <p className="mt-2 mb-0 text-[11px] leading-[1.5] text-muted" id="regex-expression-help">
            Enter the pattern without surrounding slashes. Colors distinguish regex syntax.
          </p>

          <fieldset className="mt-[22px] border-0 border-t border-line pt-5">
            <legend className="pr-2.5 font-mono text-[9px] tracking-[0.09em] text-muted uppercase">Flags</legend>
            <div className="flex flex-wrap items-center gap-2">
              {FLAG_OPTIONS.map((option) => (
                <label className="flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-[7px] border border-[#d8dfdc] bg-[#f8faf9] px-2.5 py-[7px] text-[11px] text-[#59645f] has-checked:border-[#d9b54f] has-checked:bg-[#fff4cf] has-checked:text-[#5f4600] max-[420px]:min-h-[42px]" key={option.flag} title={option.title}>
                  <input
                    className="m-0 size-[15px] accent-accent-dark"
                    checked={flags[option.key]}
                    onChange={(event) => setBooleanFlag(option.key, event.target.checked)}
                    type="checkbox"
                  />
                  <code className="font-mono font-medium">{option.flag}</code>
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-[13px] flex flex-wrap items-center gap-2 border-t border-dashed border-line pt-[13px]" role="group" aria-label="Unicode mode">
              <span className="mr-1 text-[11px] font-semibold text-[#59645f]">Unicode</span>
              <label className="flex min-h-8 cursor-pointer items-center gap-1.5 px-1 text-[11px] text-[#59645f]">
                <input
                  className="m-0 size-[15px] accent-accent-dark"
                  checked={flags.unicodeMode === ''}
                  name="regex-unicode-mode"
                  onChange={() => setFlags((current) => ({ ...current, unicodeMode: '' }))}
                  type="radio"
                />
                Off
              </label>
              <label className="flex min-h-8 cursor-pointer items-center gap-1.5 px-1 text-[11px] text-[#59645f]">
                <input
                  className="m-0 size-[15px] accent-accent-dark"
                  checked={flags.unicodeMode === 'u'}
                  name="regex-unicode-mode"
                  onChange={() => setFlags((current) => ({ ...current, unicodeMode: 'u' }))}
                  type="radio"
                />
                <code className="font-mono font-medium">u</code>
              </label>
              <label className="flex min-h-8 cursor-pointer items-center gap-1.5 px-1 text-[11px] text-[#59645f] has-disabled:cursor-not-allowed has-disabled:opacity-45" title={unicodeSetsSupported ? 'Unicode sets mode' : 'Unicode sets are not supported by this browser'}>
                <input
                  className="m-0 size-[15px] accent-accent-dark"
                  checked={flags.unicodeMode === 'v'}
                  disabled={!unicodeSetsSupported}
                  name="regex-unicode-mode"
                  onChange={() => setFlags((current) => ({ ...current, unicodeMode: 'v' }))}
                  type="radio"
                />
                <code className="font-mono font-medium">v</code>
              </label>
            </div>
          </fieldset>
        </div>

        <div className="tool-card min-w-0 p-[clamp(22px,2.5vw,30px)] max-[420px]:px-[18px]">
          <div className="mb-5 flex items-center justify-between gap-[18px] border-b border-line pb-4 max-[760px]:items-start max-[760px]:flex-col max-[760px]:gap-2.5">
            <div>
              <span className="section-index">TEST TEXT</span>
              <h2 className="mt-1 mb-0 text-[17px] font-semibold">Highlighted matches</h2>
            </div>
            <span className="font-mono text-[9px] tracking-[0.07em] text-muted uppercase">Editable</span>
          </div>
          <div className="h-[max(390px,46vh)] overflow-hidden rounded-[9px] border border-[#d8dfdc] focus-within:border-accent focus-within:shadow-focus max-[760px]:h-[max(320px,48vh)]" id="regex-text-editor" ref={textContainerRef} />
        </div>
      </div>

      <RegexCheatsheet />
    </section>
  );
}
