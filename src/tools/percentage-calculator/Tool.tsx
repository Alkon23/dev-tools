import { useEffect, useRef, useState } from 'react';
import { Check, Clipboard } from 'lucide-react';
import {
  calculatePercentageChange,
  calculatePercentageOf,
  calculatePercentageRatio,
  formatPercentageResult,
  parsePercentageInput,
} from './percentageCalculator';

interface CalculatorDefinition {
  id: string;
  title: string;
  description: string;
  formula: string;
  leftLabel: string;
  leftPlaceholder: string;
  leftSuffix?: string;
  rightLabel: string;
  rightPlaceholder: string;
  resultSuffix?: string;
  zeroField?: 'left' | 'right';
  zeroError?: string;
  calculate: (left: number, right: number) => number | undefined;
}

const calculators: CalculatorDefinition[] = [
  {
    id: 'percentage-of',
    title: 'Percentage of a value',
    description: 'Find a percentage of any number.',
    formula: 'X% × Y',
    leftLabel: 'Percentage',
    leftPlaceholder: 'X',
    leftSuffix: '%',
    rightLabel: 'Value',
    rightPlaceholder: 'Y',
    calculate: calculatePercentageOf,
  },
  {
    id: 'percentage-ratio',
    title: 'Percentage ratio',
    description: 'Find what percentage one number is of another.',
    formula: 'X ÷ Y × 100',
    leftLabel: 'Part',
    leftPlaceholder: 'X',
    rightLabel: 'Whole',
    rightPlaceholder: 'Y',
    resultSuffix: '%',
    zeroField: 'right',
    zeroError: 'Whole value must not be zero.',
    calculate: calculatePercentageRatio,
  },
  {
    id: 'percentage-change',
    title: 'Percentage increase or decrease',
    description: 'Measure the percentage change from a starting value to an ending value.',
    formula: '(To − From) ÷ From × 100',
    leftLabel: 'Starting value',
    leftPlaceholder: 'From',
    rightLabel: 'Ending value',
    rightPlaceholder: 'To',
    resultSuffix: '%',
    zeroField: 'left',
    zeroError: 'Starting value must not be zero.',
    calculate: calculatePercentageChange,
  },
];

interface CalculatorCardProps {
  copiedCalculator: string | null;
  definition: CalculatorDefinition;
  index: number;
  onCopy: (calculatorId: string, value: string) => void;
}

function CalculatorCard({ copiedCalculator, definition, index, onCopy }: CalculatorCardProps) {
  const [leftInput, setLeftInput] = useState('');
  const [rightInput, setRightInput] = useState('');
  const left = parsePercentageInput(leftInput);
  const right = parsePercentageInput(rightInput);
  const leftZeroError = definition.zeroField === 'left' && left.status === 'valid' && left.value === 0;
  const rightZeroError = definition.zeroField === 'right' && right.status === 'valid' && right.value === 0;
  const leftError = left.status === 'invalid'
    ? 'Enter a valid number.'
    : leftZeroError ? definition.zeroError : undefined;
  const rightError = right.status === 'invalid'
    ? 'Enter a valid number.'
    : rightZeroError ? definition.zeroError : undefined;

  let result = '';
  let resultError: string | undefined;
  if (left.status === 'valid' && right.status === 'valid' && !leftZeroError && !rightZeroError) {
    const calculatedValue = definition.calculate(left.value, right.value);
    if (calculatedValue === undefined) {
      resultError = 'Result is outside the supported numeric range.';
    } else {
      result = formatPercentageResult(calculatedValue);
    }
  }

  const leftErrorId = `${definition.id}-left-error`;
  const rightErrorId = `${definition.id}-right-error`;
  const resultErrorId = `${definition.id}-result-error`;

  return (
    <section className="tool-card p-[clamp(22px,3vw,32px)] max-[420px]:px-[18px]" aria-labelledby={`${definition.id}-title`}>
      <div className="mb-[22px] flex items-start justify-between gap-5 border-b border-line pb-[18px] max-[420px]:flex-col max-[420px]:gap-3">
        <div className="min-w-0">
          <span className="section-index">{String(index + 1).padStart(2, '0')}</span>
          <h2 className="ml-[9px] inline text-lg font-semibold" id={`${definition.id}-title`}>{definition.title}</h2>
          <p className="mt-1.5 mb-0 text-xs leading-[1.5] text-muted">{definition.description}</p>
        </div>
        <code className="shrink-0 whitespace-nowrap rounded-[7px] border border-[#edda99] bg-[#fff3c9] px-2.5 py-2 font-mono text-[10px] text-[#6a4d00]">{definition.formula}</code>
      </div>

      <div className="grid grid-cols-3 gap-[17px] max-[760px]:grid-cols-1">
        <div className="flex min-w-0 flex-col gap-[7px]">
          <label className="text-[11px] font-semibold text-[#45504c]" htmlFor={`${definition.id}-left`}>{definition.leftLabel}</label>
          <div className={`flex min-w-0 items-stretch overflow-hidden rounded-[7px] border bg-[#f8faf9] transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-focus ${leftError ? 'border-[#b74b42]' : 'border-[#d8dfdc]'}`}>
            <input
              className="min-h-11 min-w-0 flex-1 bg-transparent px-3 py-[9px] font-mono text-xs text-ink outline-0 placeholder:text-[#929c98]"
              aria-describedby={leftError ? leftErrorId : undefined}
              aria-invalid={Boolean(leftError)}
              autoFocus={index === 0}
              id={`${definition.id}-left`}
              inputMode="decimal"
              onChange={(event) => setLeftInput(event.target.value)}
              placeholder={definition.leftPlaceholder}
              spellCheck={false}
              type="text"
              value={leftInput}
            />
            {definition.leftSuffix && <span className="flex min-w-[38px] shrink-0 items-center justify-center border-l border-[#d8dfdc] bg-[#eef1ef] px-2 font-mono text-[10px] text-[#65706c]" aria-hidden="true">{definition.leftSuffix}</span>}
          </div>
          {leftError && <p className="error-text leading-[1.4]" id={leftErrorId}>{leftError}</p>}
        </div>

        <div className="flex min-w-0 flex-col gap-[7px]">
          <label className="text-[11px] font-semibold text-[#45504c]" htmlFor={`${definition.id}-right`}>{definition.rightLabel}</label>
          <div className={`flex min-w-0 items-stretch overflow-hidden rounded-[7px] border bg-[#f8faf9] transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-focus ${rightError ? 'border-[#b74b42]' : 'border-[#d8dfdc]'}`}>
            <input
              className="min-h-11 min-w-0 flex-1 bg-transparent px-3 py-[9px] font-mono text-xs text-ink outline-0 placeholder:text-[#929c98]"
              aria-describedby={rightError ? rightErrorId : undefined}
              aria-invalid={Boolean(rightError)}
              id={`${definition.id}-right`}
              inputMode="decimal"
              onChange={(event) => setRightInput(event.target.value)}
              placeholder={definition.rightPlaceholder}
              spellCheck={false}
              type="text"
              value={rightInput}
            />
          </div>
          {rightError && <p className="error-text leading-[1.4]" id={rightErrorId}>{rightError}</p>}
        </div>

        <div className="flex min-w-0 flex-col gap-[7px]" aria-live="polite">
          <label className="text-[11px] font-semibold text-[#45504c]" htmlFor={`${definition.id}-result`}>Result</label>
          <div className={`flex min-w-0 items-stretch overflow-hidden rounded-[7px] border bg-[#f8faf9] transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-focus ${resultError ? 'border-[#b74b42]' : 'border-[#d8dfdc]'}`}>
            <input
              className="min-h-11 min-w-0 flex-1 bg-transparent px-3 py-[9px] font-mono text-xs font-semibold text-[#33403b] outline-0 placeholder:text-[#929c98]"
              aria-describedby={resultError ? resultErrorId : undefined}
              aria-invalid={Boolean(resultError)}
              aria-label={`${definition.title} result`}
              id={`${definition.id}-result`}
              placeholder="Result"
              readOnly
              type="text"
              value={result}
            />
            {definition.resultSuffix && <span className="flex min-w-[38px] shrink-0 items-center justify-center border-l border-[#d8dfdc] bg-[#eef1ef] px-2 font-mono text-[10px] text-[#65706c]" aria-hidden="true">{definition.resultSuffix}</span>}
            <button
              className="flex w-[42px] shrink-0 cursor-pointer items-center justify-center border-0 border-l border-[#d8dfdc] bg-[#f1f4f2] text-[#5f6a65] enabled:hover:bg-[#fff2c2] enabled:hover:text-accent-dark focus-visible:shadow-[inset_0_0_0_2px_var(--color-accent-dark)] focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-45"
              aria-label={`Copy ${definition.title} result`}
              disabled={!result}
              onClick={() => onCopy(definition.id, result)}
              title={`Copy ${definition.title} result`}
              type="button"
            >
              {copiedCalculator === definition.id
                ? <Check size={16} aria-hidden="true" />
                : <Clipboard size={16} aria-hidden="true" />}
            </button>
          </div>
          {resultError && <p className="error-text leading-[1.4]" id={resultErrorId}>{resultError}</p>}
        </div>
      </div>
    </section>
  );
}

export default function PercentageCalculatorTool() {
  const [copiedCalculator, setCopiedCalculator] = useState<string | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
  }, []);

  async function copyResult(calculatorId: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedCalculator(calculatorId);
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => setCopiedCalculator(null), 1600);
  }

  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-[18px]" aria-label="Percentage calculator" role="region">
      {calculators.map((definition, index) => (
        <CalculatorCard
          copiedCalculator={copiedCalculator}
          definition={definition}
          index={index}
          key={definition.id}
          onCopy={copyResult}
        />
      ))}
    </div>
  );
}
