import { useState } from 'react';
import { calculateRuleOfThree, formatResult, parseNumber, type ProportionMode } from './ruleOfThree';

const fields = ['A', 'B', 'C'] as const;

export default function RuleOfThreeTool() {
  const [mode, setMode] = useState<ProportionMode>('direct');
  const [inputs, setInputs] = useState({ A: '', B: '', C: '' });
  const parsed = fields.map((field) => parseNumber(inputs[field]));
  const denominatorIndex = mode === 'direct' ? 0 : 2;
  const errors = parsed.map((value, index) => {
    if (value.status === 'invalid') return 'Enter a valid finite number.';
    if (index === denominatorIndex && value.status === 'valid' && value.value === 0) {
      return `${fields[index]} must not be zero in ${mode} proportion.`;
    }
    return undefined;
  });
  const [a, b, c] = parsed;
  const ready = a.status === 'valid' && b.status === 'valid' && c.status === 'valid' && !errors.some(Boolean);
  const result = ready ? calculateRuleOfThree(a.value, b.value, c.value, mode) : undefined;
  const resultText = result === undefined ? '' : formatResult(result);
  const formula = mode === 'direct' ? 'X = B × C ÷ A' : 'X = A × B ÷ C';

  return (
    <section className="tool-card" aria-label="Rule of three">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-xs font-semibold">Proportion type</span>
          <div className="segmented-control w-[280px] max-w-full grid-cols-2" role="group" aria-label="Proportion type">
            {(['direct', 'inverse'] as const).map((option) => (
              <button
                className={mode === option ? 'is-selected' : ''}
                key={option}
                type="button"
                aria-pressed={mode === option}
                onClick={() => setMode(option)}
              >
                {option === 'direct' ? 'Direct' : 'Inverse'}
              </button>
            ))}
          </div>
        </div>
        <code className="rounded-lg border border-line bg-(--control-bg) px-4 py-3 text-sm">{formula}</code>
      </div>

      <p className="my-5 text-sm text-muted">
        {mode === 'direct'
          ? 'When one quantity increases, the other increases proportionally. A / B = C / X.'
          : 'When one quantity increases, the other decreases proportionally. A × B = C × X.'}
      </p>

      <div className="grid grid-cols-2 gap-x-5 gap-y-6 sm:gap-x-10">
        {fields.map((field, index) => (
          <div className="flex min-w-0 flex-col gap-2" key={field}>
            <label className="text-xs font-semibold" htmlFor={`proportion-${field}`}>{field} — {field === 'C' ? 'New' : 'Known'} value</label>
            <input
              className="input-control font-mono"
              id={`proportion-${field}`}
              type="text"
              inputMode="decimal"
              spellCheck={false}
              placeholder={field}
              value={inputs[field]}
              aria-invalid={Boolean(errors[index])}
              aria-describedby={errors[index] ? `proportion-${field}-error` : undefined}
              onChange={(event) => setInputs({ ...inputs, [field]: event.target.value })}
            />
            {errors[index] && <p className="error-text" id={`proportion-${field}-error`}>{errors[index]}</p>}
          </div>
        ))}
        <div className="flex min-w-0 flex-col gap-2">
          <label className="text-xs font-semibold" htmlFor="proportion-result">X — Result</label>
          <input className="input-control font-mono font-semibold" id="proportion-result" readOnly value={resultText} placeholder="X" aria-invalid={ready && result === undefined} aria-describedby={ready && result === undefined ? 'proportion-result-error' : undefined} />
          {ready && result === undefined && <p className="error-text" id="proportion-result-error" role="status">Result is outside the supported numeric range.</p>}
        </div>
      </div>

      <p className="mt-4 mb-0 text-xs leading-relaxed text-muted">
        {mode === 'direct'
          ? 'Example: 2 items cost 10. At the same price per item, 5 items cost 25.'
          : 'Example: 4 workers finish a job in 6 days. At the same rate per worker, 8 workers finish in 3 days.'}
      </p>
    </section>
  );
}
