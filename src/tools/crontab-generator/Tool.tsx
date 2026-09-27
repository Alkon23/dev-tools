import { useState } from 'react';
import {
  CRON_HELPERS,
  DEFAULT_CRON_EXPRESSION,
  DEFAULT_CRON_OPTIONS,
  describeCron,
  type CronDescriptionOptions,
} from './crontabGenerator';

const CRON_DIAGRAM = `┌──────────── [optional] seconds (0 - 59)
│ ┌────────── minute (0 - 59)
│ │ ┌──────── hour (0 - 23)
│ │ │ ┌────── day of month (1 - 31)
│ │ │ │ ┌──── month (1 - 12) or jan, feb, mar ...
│ │ │ │ │ ┌── day of week (0 - 6, Sunday = 0) or sun, mon ...
│ │ │ │ │ │
* * * * * *`;

export default function CrontabGeneratorTool() {
  const [expression, setExpression] = useState(DEFAULT_CRON_EXPRESSION);
  const [options, setOptions] = useState<CronDescriptionOptions>({ ...DEFAULT_CRON_OPTIONS });
  const result = describeCron(expression, options);

  function setOption(option: keyof CronDescriptionOptions, value: boolean) {
    setOptions((current) => ({ ...current, [option]: value }));
  }

  return (
    <section className="cron-tool" aria-label="Crontab generator">
      <div className="tool-card cron-builder-card">
        <div className="cron-expression-field">
          <label htmlFor="cron-expression">Cron expression</label>
          <input
            aria-describedby={result.valid ? 'cron-description' : 'cron-error cron-description'}
            aria-invalid={!result.valid}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            autoFocus
            id="cron-expression"
            onChange={(event) => setExpression(event.target.value)}
            placeholder="* * * * *"
            spellCheck={false}
            type="text"
            value={expression}
          />
          {!result.valid && <p className="cron-error" id="cron-error">This cron is invalid.</p>}
        </div>

        <p className="cron-description" id="cron-description" aria-live="polite">
          {result.description || '\u00a0'}
        </p>

        <fieldset className="cron-options">
          <legend>Description options</legend>
          <label>
            <input
              checked={options.verbose}
              onChange={(event) => setOption('verbose', event.target.checked)}
              type="checkbox"
            />
            Verbose
          </label>
          <label>
            <input
              checked={options.use24HourTimeFormat}
              onChange={(event) => setOption('use24HourTimeFormat', event.target.checked)}
              type="checkbox"
            />
            Use 24-hour time format
          </label>
          <label>
            <input
              checked={options.dayOfWeekStartIndexZero}
              onChange={(event) => setOption('dayOfWeekStartIndexZero', event.target.checked)}
              type="checkbox"
            />
            Days start at 0
          </label>
        </fieldset>
      </div>

      <div className="tool-card cron-reference-card">
        <div className="cron-section-heading">
          <span className="section-index">REFERENCE</span>
          <div>
            <h2>Expression anatomy</h2>
            <p>Enter five fields, or add an optional seconds field at the beginning.</p>
          </div>
        </div>

        <pre className="cron-diagram" aria-label="Cron expression field diagram"><code>{CRON_DIAGRAM}</code></pre>

        <div className="cron-section-heading cron-syntax-heading">
          <span className="section-index">SYNTAX</span>
          <div>
            <h2>Operators and common shortcuts</h2>
            <p>Shortcut names are shown for reference; use their expanded expression in this validator.</p>
          </div>
        </div>

        <div className="cron-table-shell">
          <table className="cron-helper-table">
            <thead>
              <tr>
                <th scope="col">Symbol</th>
                <th scope="col">Meaning</th>
                <th scope="col">Valid expression</th>
                <th scope="col">Equivalent</th>
              </tr>
            </thead>
            <tbody>
              {CRON_HELPERS.map((helper) => (
                <tr key={helper.symbol}>
                  <td data-label="Symbol">
                    <code>{helper.symbol}</code>
                    {!helper.supported && <span className="cron-reference-only">Reference only</span>}
                  </td>
                  <td data-label="Meaning">{helper.meaning}</td>
                  <td data-label="Valid expression"><code>{helper.example}</code></td>
                  <td data-label="Equivalent">{helper.equivalent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
