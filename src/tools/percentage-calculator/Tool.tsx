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
    <section className="tool-card percentage-card" aria-labelledby={`${definition.id}-title`}>
      <div className="percentage-card-heading">
        <div>
          <span className="section-index">{String(index + 1).padStart(2, '0')}</span>
          <h2 id={`${definition.id}-title`}>{definition.title}</h2>
          <p>{definition.description}</p>
        </div>
        <code>{definition.formula}</code>
      </div>

      <div className="percentage-fields">
        <div className="percentage-field">
          <label htmlFor={`${definition.id}-left`}>{definition.leftLabel}</label>
          <div className={`percentage-input-shell${leftError ? ' is-invalid' : ''}`}>
            <input
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
            {definition.leftSuffix && <span aria-hidden="true">{definition.leftSuffix}</span>}
          </div>
          {leftError && <p className="percentage-field-error" id={leftErrorId}>{leftError}</p>}
        </div>

        <div className="percentage-field">
          <label htmlFor={`${definition.id}-right`}>{definition.rightLabel}</label>
          <div className={`percentage-input-shell${rightError ? ' is-invalid' : ''}`}>
            <input
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
          {rightError && <p className="percentage-field-error" id={rightErrorId}>{rightError}</p>}
        </div>

        <div className="percentage-field percentage-result-field" aria-live="polite">
          <label htmlFor={`${definition.id}-result`}>Result</label>
          <div className={`percentage-input-shell percentage-result-shell${resultError ? ' is-invalid' : ''}`}>
            <input
              aria-describedby={resultError ? resultErrorId : undefined}
              aria-invalid={Boolean(resultError)}
              aria-label={`${definition.title} result`}
              id={`${definition.id}-result`}
              placeholder="Result"
              readOnly
              type="text"
              value={result}
            />
            {definition.resultSuffix && <span aria-hidden="true">{definition.resultSuffix}</span>}
            <button
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
          {resultError && <p className="percentage-field-error" id={resultErrorId}>{resultError}</p>}
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
    <div className="percentage-calculator-tool" aria-label="Percentage calculator" role="region">
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
