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
    <section className="mx-auto max-w-[1420px]" aria-label="Keyboard tester">
      <div className="tool-card p-[clamp(20px,3vw,32px)] max-[420px]:px-[18px]">
        <div className="flex items-end justify-between gap-6 max-[760px]:items-stretch max-[760px]:flex-col">
          <div className="flex items-end gap-[18px] max-[420px]:items-stretch max-[420px]:flex-col max-[420px]:gap-3">
            <div>
              <span className="section-index">LAYOUT</span>
              <div className="mt-2 grid grid-cols-[repeat(2,minmax(140px,1fr))] gap-px overflow-hidden rounded-lg border border-[#d8dfdc] bg-[#d8dfdc] max-[420px]:grid-cols-1" role="group" aria-label="Keyboard layout">
                <button
                  aria-pressed={layoutId === 'ansi'}
                  className={`min-h-[42px] cursor-pointer border-0 px-[15px] py-[9px] text-xs font-semibold ${layoutId === 'ansi' ? 'is-selected bg-[#fff2c2] text-accent-dark' : 'bg-[#f8faf9] text-[#66716d] hover:bg-[#fff2c2] hover:text-accent-dark'}`}
                  onClick={() => selectLayout('ansi')}
                  type="button"
                >
                  Standard ANSI
                </button>
                <button
                  aria-pressed={layoutId === 'spanish-iso'}
                  className={`min-h-[42px] cursor-pointer border-0 px-[15px] py-[9px] text-xs font-semibold ${layoutId === 'spanish-iso' ? 'is-selected bg-[#fff2c2] text-accent-dark' : 'bg-[#f8faf9] text-[#66716d] hover:bg-[#fff2c2] hover:text-accent-dark'}`}
                  onClick={() => selectLayout('spanish-iso')}
                  type="button"
                >
                  Spanish ISO
                </button>
              </div>
            </div>
            <div>
              <span className="section-index">SIZE</span>
              <div className="mt-2 grid grid-cols-[repeat(2,minmax(72px,1fr))] gap-px overflow-hidden rounded-lg border border-[#d8dfdc] bg-[#d8dfdc] max-[420px]:grid-cols-1" role="group" aria-label="Keyboard size">
                <button
                  aria-pressed={!showNumpad}
                  className={`min-h-[42px] cursor-pointer border-0 px-[15px] py-[9px] text-xs font-semibold ${!showNumpad ? 'is-selected bg-[#fff2c2] text-accent-dark' : 'bg-[#f8faf9] text-[#66716d] hover:bg-[#fff2c2] hover:text-accent-dark'}`}
                  onClick={() => setShowNumpad(false)}
                  type="button"
                >
                  TKL
                </button>
                <button
                  aria-pressed={showNumpad}
                  className={`min-h-[42px] cursor-pointer border-0 px-[15px] py-[9px] text-xs font-semibold ${showNumpad ? 'is-selected bg-[#fff2c2] text-accent-dark' : 'bg-[#f8faf9] text-[#66716d] hover:bg-[#fff2c2] hover:text-accent-dark'}`}
                  onClick={() => setShowNumpad(true)}
                  type="button"
                >
                  Full
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 max-[760px]:justify-between max-[420px]:items-stretch max-[420px]:flex-col">
            <div className="flex items-baseline gap-1.5 whitespace-nowrap max-[420px]:justify-center" aria-live="polite">
              <strong className="font-mono text-[22px] font-medium text-accent-dark">{testedCount}</strong>
              <span className="text-[11px] text-muted">of {visibleKeys.length} keys tested</span>
            </div>
            <button className="button button-secondary" onClick={resetTest} type="button">
              <RotateCcw aria-hidden="true" size={15} />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-[22px] flex items-center justify-between gap-5 border-t border-line pt-[17px] max-[760px]:items-stretch max-[760px]:flex-col max-[760px]:gap-2.5">
          <p className="m-0 text-[11px] leading-[1.5] text-muted">Press keys anywhere on this page. Right-click a key to mark or unmark it as failed.</p>
          <output className="flex min-h-7 items-center gap-[9px] whitespace-nowrap font-mono text-[10px] text-[#69736f] max-[760px]:self-start max-[760px]:flex-wrap max-[760px]:justify-start" aria-label="Last five pressed keys" aria-live="polite">
            {visibleRecentKeys.length > 0
              ? visibleRecentKeys.map((recentKey, index) => (
                  <span
                    className={`flex items-center gap-1.5 rounded-md border pl-[7px] opacity-70 ${index === visibleRecentKeys.length - 1 ? 'is-latest border-[#ead58c] bg-[#fff8df] opacity-100' : 'border-[#dfe5e2] bg-[#f5f7f6]'}`}
                    key={`${recentKey.code}-${index}`}
                  >
                    <b className="text-[11px] font-medium text-ink">{recentKey.key === ' ' ? 'Space' : recentKey.key}</b>
                    <code className="rounded-r-[5px] border-l border-[#d8dfdc] bg-[#eef1ef] px-[7px] py-[5px] text-[#68736e]">{recentKey.code}</code>
                  </span>
                ))
              : 'Waiting for a key…'}
          </output>
        </div>

        <div className="mt-[18px] overflow-x-auto overscroll-x-contain rounded-[11px] border border-[#d6deda] bg-[#eef1ef] p-3.5 [container-type:inline-size] [scrollbar-color:#9ba7a2_transparent] [scrollbar-width:thin]" aria-label={`${layout.label} ${showNumpad ? 'full-size' : 'TKL'} keyboard`} role="group">
          <div className="relative h-[calc(6.5*var(--keyboard-unit)+18px)] min-w-[calc(var(--keyboard-columns)*40px+18px)] w-[max(100%,calc(var(--keyboard-columns)*40px+18px))] rounded-[10px] border border-[#171b17] bg-[#222822] p-[9px] shadow-[0_14px_32px_rgba(25,32,28,0.18),inset_0_1px_rgba(255,255,255,0.06)] [--keyboard-unit:max(40px,calc((100cqw-18px)/var(--keyboard-columns)))]" style={boardStyle}>
            {visibleKeys.map((keyboardKey) => {
              const tested = testedCodes.has(keyboardKey.code);
              const held = heldCodes.has(keyboardKey.code);
              const failed = failedCodes.has(keyboardKey.code);
              const state = held ? 'pressed' : failed ? 'failed' : tested ? 'tested' : 'untested';
              const stateClasses = held
                ? 'translate-y-0.5 border-[#f0c94e] bg-[#866c1f] text-[#fff9e7] shadow-[0_1px_0_#151a17,inset_0_2px_4px_rgba(0,0,0,0.2)] after:block after:bg-[#f6d76e] forced-colors:border-[3px] forced-colors:border-[Highlight]'
                : failed
                  ? 'border-[#dc8076] bg-[#743d38] text-[#fff2f0] after:hidden forced-colors:border-[3px] forced-colors:border-dashed forced-colors:border-[Mark] [&_i]:absolute [&_i]:top-[3px] [&_i]:right-[3px] [&_i]:flex [&_i]:size-3 [&_i]:items-center [&_i]:justify-center [&_i]:rounded-full [&_i]:bg-[#ef9a91] [&_i]:font-sans [&_i]:text-[8px] [&_i]:font-bold [&_i]:not-italic [&_i]:text-[#552522]'
                  : tested
                    ? 'border-[#76d4ae] bg-[#31715a] text-[#effff8] after:absolute after:top-1 after:right-1 after:size-1 after:rounded-full after:bg-[#a5f1d1] forced-colors:border-[3px] forced-colors:border-[Highlight]'
                    : 'border-[#728079] bg-[#303833] text-[#f2f5f3] shadow-[0_3px_0_#151a17]';
              return (
                <kbd
                  aria-label={`${keyboardKey.label} key, ${state}`}
                  className={[
                    'absolute flex select-none flex-col items-center justify-center overflow-hidden rounded-[5px] border p-1 text-center font-mono text-[10px] leading-[1.1] transition-[background,border-color,box-shadow,transform] duration-90 [height:calc(var(--key-h)*var(--keyboard-unit)-5px)] [left:calc(var(--key-x)*var(--keyboard-unit)+9px)] [top:calc(var(--key-y)*var(--keyboard-unit)+9px)] [width:calc(var(--key-w)*var(--keyboard-unit)-5px)] [&_small]:mb-[3px] [&_small]:text-[8px] [&_small]:text-[#aeb9b4]',
                    tested && 'is-tested',
                    failed && 'is-failed',
                    held && 'is-held',
                    stateClasses,
                    keyboardKey.shape === 'iso-enter' && 'keyboard-key-iso-enter pl-3 [clip-path:polygon(0_0,100%_0,100%_100%,17%_100%,17%_50%,0_50%)]',
                  ].filter(Boolean).join(' ')}
                  data-testid={`key-${keyboardKey.code}`}
                  key={keyboardKey.code}
                  onContextMenu={(event) => toggleFailed(event, keyboardKey.code)}
                  style={getKeyStyle(keyboardKey)}
                  title={`Right-click to mark ${keyboardKey.label} as ${failed ? 'working' : 'failed'}`}
                >
                  {keyboardKey.secondaryLabel && <small>{keyboardKey.secondaryLabel}</small>}
                  <span>{keyboardKey.label}</span>
                  {failed && !held && <i aria-hidden="true">!</i>}
                </kbd>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex justify-end gap-[18px] text-[10px] text-muted max-[420px]:justify-start [&_span]:flex [&_span]:items-center [&_span]:gap-1.5 [&_i]:size-[11px] [&_i]:rounded-[3px] [&_i]:border" aria-label="Key states">
          <span><i className="border-[#5dad8c]! bg-[#31715a]" />Tested</span>
          <span><i className="border-[#c4a23b]! bg-[#866c1f]" />Pressed</span>
          <span><i className="border-[#c56e65]! bg-[#743d38]" />Failed</span>
        </div>
      </div>
    </section>
  );
}
