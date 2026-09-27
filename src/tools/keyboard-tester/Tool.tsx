import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  getKeyboardLayout,
  isNumpadKey,
  type KeyboardKeyDefinition,
  type KeyboardLayoutId,
} from './keyboardLayouts';

interface RecentKey {
  code: string;
  key: string;
}

type KeyStyle = CSSProperties & {
  '--key-h': number;
  '--key-w': number;
  '--key-x': number;
  '--key-y': number;
};

type BoardStyle = CSSProperties & {
  '--keyboard-columns': number;
};

function getKeyStyle(key: KeyboardKeyDefinition): KeyStyle {
  return {
    '--key-h': key.height ?? 1,
    '--key-w': key.width ?? 1,
    '--key-x': key.x,
    '--key-y': key.y,
  };
}

function updateSet(code: string, present: boolean, current: Set<string>): Set<string> {
  const next = new Set(current);
  if (present) {
    next.add(code);
  } else {
    next.delete(code);
  }
  return next;
}

export default function KeyboardTesterTool() {
  const [layoutId, setLayoutId] = useState<KeyboardLayoutId>('ansi');
  const [showNumpad, setShowNumpad] = useState(false);
  const [testedCodes, setTestedCodes] = useState<Set<string>>(() => new Set());
  const [heldCodes, setHeldCodes] = useState<Set<string>>(() => new Set());
  const [failedCodes, setFailedCodes] = useState<Set<string>>(() => new Set());
  const [recentKeys, setRecentKeys] = useState<RecentKey[]>([]);
  const layout = getKeyboardLayout(layoutId);
  const visibleKeys = useMemo(
    () => showNumpad ? layout.keys : layout.keys.filter((key) => !isNumpadKey(key)),
    [layout, showNumpad],
  );
  const layoutCodes = useMemo(() => new Set(visibleKeys.map((key) => key.code)), [visibleKeys]);
  const testedCount = visibleKeys.reduce((count, key) => count + Number(testedCodes.has(key.code)), 0);
  const visibleRecentKeys = recentKeys.filter((key) => layoutCodes.has(key.code));
  const boardStyle: BoardStyle = { '--keyboard-columns': showNumpad ? 23 : 18.5 };

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!layoutCodes.has(event.code)) {
        return;
      }
      event.preventDefault();
      setTestedCodes((current) => updateSet(event.code, true, current));
      setHeldCodes((current) => updateSet(event.code, true, current));
      if (!event.repeat) {
        setRecentKeys((current) => [...current, { code: event.code, key: event.key }].slice(-5));
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (layoutCodes.has(event.code)) {
        event.preventDefault();
        setHeldCodes((current) => updateSet(event.code, false, current));
      }
    }

    function clearHeldKeys() {
      setHeldCodes(new Set());
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', clearHeldKeys);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', clearHeldKeys);
    };
  }, [layoutCodes]);

  function resetTest() {
    setTestedCodes(new Set());
    setHeldCodes(new Set());
    setFailedCodes(new Set());
    setRecentKeys([]);
  }

  function selectLayout(nextLayout: KeyboardLayoutId) {
    setLayoutId(nextLayout);
    resetTest();
  }

  function toggleFailed(event: MouseEvent, code: string) {
    event.preventDefault();
    setFailedCodes((current) => updateSet(code, !current.has(code), current));
  }

  return (
    <section className="keyboard-tester-tool" aria-label="Keyboard tester">
      <div className="tool-card keyboard-tester-card">
        <div className="keyboard-tester-toolbar">
          <div className="keyboard-layout-controls">
            <div>
              <span className="section-index">LAYOUT</span>
              <div className="keyboard-layout-switch" role="group" aria-label="Keyboard layout">
                <button
                  aria-pressed={layoutId === 'ansi'}
                  className={layoutId === 'ansi' ? 'is-selected' : undefined}
                  onClick={() => selectLayout('ansi')}
                  type="button"
                >
                  Standard ANSI
                </button>
                <button
                  aria-pressed={layoutId === 'spanish-iso'}
                  className={layoutId === 'spanish-iso' ? 'is-selected' : undefined}
                  onClick={() => selectLayout('spanish-iso')}
                  type="button"
                >
                  Spanish ISO
                </button>
              </div>
            </div>
            <div>
              <span className="section-index">SIZE</span>
              <div className="keyboard-layout-switch keyboard-size-switch" role="group" aria-label="Keyboard size">
                <button
                  aria-pressed={!showNumpad}
                  className={!showNumpad ? 'is-selected' : undefined}
                  onClick={() => setShowNumpad(false)}
                  type="button"
                >
                  TKL
                </button>
                <button
                  aria-pressed={showNumpad}
                  className={showNumpad ? 'is-selected' : undefined}
                  onClick={() => setShowNumpad(true)}
                  type="button"
                >
                  Full
                </button>
              </div>
            </div>
          </div>

          <div className="keyboard-tester-actions">
            <div className="keyboard-progress" aria-live="polite">
              <strong>{testedCount}</strong>
              <span>of {visibleKeys.length} keys tested</span>
            </div>
            <button className="button button-secondary" onClick={resetTest} type="button">
              <RotateCcw aria-hidden="true" size={15} />
              Reset
            </button>
          </div>
        </div>

        <div className="keyboard-status-row">
          <p>Press keys anywhere on this page. Right-click a key to mark or unmark it as failed.</p>
          <output className="keyboard-history" aria-label="Last five pressed keys" aria-live="polite">
            {visibleRecentKeys.length > 0
              ? visibleRecentKeys.map((recentKey, index) => (
                  <span
                    className={index === visibleRecentKeys.length - 1 ? 'is-latest' : undefined}
                    key={`${recentKey.code}-${index}`}
                  >
                    <b>{recentKey.key === ' ' ? 'Space' : recentKey.key}</b>
                    <code>{recentKey.code}</code>
                  </span>
                ))
              : 'Waiting for a key…'}
          </output>
        </div>

        <div className="keyboard-scroll" aria-label={`${layout.label} ${showNumpad ? 'full-size' : 'TKL'} keyboard`} role="group">
          <div className="keyboard-board" style={boardStyle}>
            {visibleKeys.map((keyboardKey) => {
              const tested = testedCodes.has(keyboardKey.code);
              const held = heldCodes.has(keyboardKey.code);
              const failed = failedCodes.has(keyboardKey.code);
              const state = held ? 'pressed' : failed ? 'failed' : tested ? 'tested' : 'untested';
              return (
                <kbd
                  aria-label={`${keyboardKey.label} key, ${state}`}
                  className={[
                    'keyboard-key',
                    tested && 'is-tested',
                    failed && 'is-failed',
                    held && 'is-held',
                    keyboardKey.shape === 'iso-enter' && 'keyboard-key-iso-enter',
                  ].filter(Boolean).join(' ')}
                  data-testid={`key-${keyboardKey.code}`}
                  key={keyboardKey.code}
                  onContextMenu={(event) => toggleFailed(event, keyboardKey.code)}
                  style={getKeyStyle(keyboardKey)}
                  title={`Right-click to mark ${keyboardKey.label} as ${failed ? 'working' : 'failed'}`}
                >
                  {keyboardKey.secondaryLabel && <small>{keyboardKey.secondaryLabel}</small>}
                  <span>{keyboardKey.label}</span>
                  {failed && <i aria-hidden="true">!</i>}
                </kbd>
              );
            })}
          </div>
        </div>

        <div className="keyboard-legend" aria-label="Key states">
          <span><i className="keyboard-legend-tested" />Tested</span>
          <span><i className="keyboard-legend-held" />Pressed</span>
          <span><i className="keyboard-legend-failed" />Failed</span>
        </div>
      </div>
    </section>
  );
}
