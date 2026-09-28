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
    <section className="mx-auto flex max-w-[1040px] flex-col gap-[18px]" aria-label="Crontab generator">
      <div className="tool-card p-[clamp(22px,3vw,34px)] max-[420px]:px-[18px]">
        <div className="mx-auto max-w-[620px] text-center">
          <label className="mb-2.5 block text-xs font-semibold text-[#45504c]" htmlFor="cron-expression">Cron expression</label>
          <input
            className="min-h-[60px] w-full rounded-[9px] border border-[#d8dfdc] bg-[#f8faf9] px-4 py-2 text-center font-mono text-[clamp(22px,4vw,30px)] tracking-[0.025em] text-ink transition-[border-color,box-shadow] focus:border-accent focus:shadow-focus focus:outline-0 aria-invalid:border-[#b74b42] max-[420px]:text-xl"
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
          {!result.valid && <p className="mt-2 text-xs text-[#a53b32]" id="cron-error">This cron is invalid.</p>}
        </div>

        <p className="mx-auto mt-5 mb-6 min-h-8 text-center text-[clamp(18px,2.5vw,22px)] leading-[1.45] text-[#3e4844]" id="cron-description" aria-live="polite">
          {result.description || '\u00a0'}
        </p>

        <fieldset className="m-0 grid grid-cols-[repeat(3,max-content)] justify-center gap-x-7 gap-y-3.5 border-0 border-t border-line pt-[23px] max-[760px]:grid-cols-1 max-[760px]:justify-items-start">
          <legend className="mx-auto mb-[17px] px-2.5 font-mono text-[9px] tracking-[0.09em] text-muted uppercase">Description options</legend>
          <label className="flex cursor-pointer items-center gap-[9px] text-xs font-semibold text-[#45504c]">
            <input
              className="m-0 size-[17px] accent-accent-dark"
              checked={options.verbose}
              onChange={(event) => setOption('verbose', event.target.checked)}
              type="checkbox"
            />
            Verbose
          </label>
          <label className="flex cursor-pointer items-center gap-[9px] text-xs font-semibold text-[#45504c]">
            <input
              className="m-0 size-[17px] accent-accent-dark"
              checked={options.use24HourTimeFormat}
              onChange={(event) => setOption('use24HourTimeFormat', event.target.checked)}
              type="checkbox"
            />
            Use 24-hour time format
          </label>
          <label className="flex cursor-pointer items-center gap-[9px] text-xs font-semibold text-[#45504c]">
            <input
              className="m-0 size-[17px] accent-accent-dark"
              checked={options.dayOfWeekStartIndexZero}
              onChange={(event) => setOption('dayOfWeekStartIndexZero', event.target.checked)}
              type="checkbox"
            />
            Days start at 0
          </label>
        </fieldset>
      </div>

      <div className="tool-card p-[clamp(22px,3vw,34px)] max-[420px]:px-[18px]">
        <div className="mb-5 flex items-start gap-3.5 border-b border-line pb-[17px]">
          <span className="section-index">REFERENCE</span>
          <div>
            <h2 className="mt-0 mb-1 text-[17px] font-semibold">Expression anatomy</h2>
            <p className="m-0 text-xs leading-[1.5] text-muted">Enter five fields, or add an optional seconds field at the beginning.</p>
          </div>
        </div>

        <pre className="m-0 overflow-x-auto rounded-[9px] bg-sidebar px-[22px] py-5 font-mono text-[clamp(11px,1.8vw,13px)] leading-[1.7] text-[#eaf0ed] max-[420px]:px-4" aria-label="Cron expression field diagram"><code>{CRON_DIAGRAM}</code></pre>

        <div className="mt-[30px] mb-5 flex items-start gap-3.5 border-b border-line pb-[17px]">
          <span className="section-index">SYNTAX</span>
          <div>
            <h2 className="mt-0 mb-1 text-[17px] font-semibold">Operators and common shortcuts</h2>
            <p className="m-0 text-xs leading-[1.5] text-muted">Shortcut names are shown for reference; use their expanded expression in this validator.</p>
          </div>
        </div>

        <div className="overflow-x-auto max-[760px]:overflow-visible">
          <table className="w-full min-w-[780px] border-collapse text-xs leading-[1.5] max-[760px]:block max-[760px]:min-w-0">
            <thead className="max-[760px]:absolute max-[760px]:size-px max-[760px]:overflow-hidden max-[760px]:[clip-path:inset(50%)] max-[760px]:whitespace-nowrap">
              <tr>
                <th className="px-3 pb-2.5 text-left font-mono text-[9px] tracking-[0.07em] text-muted uppercase" scope="col">Symbol</th>
                <th className="px-3 pb-2.5 text-left font-mono text-[9px] tracking-[0.07em] text-muted uppercase" scope="col">Meaning</th>
                <th className="px-3 pb-2.5 text-left font-mono text-[9px] tracking-[0.07em] text-muted uppercase" scope="col">Valid expression</th>
                <th className="px-3 pb-2.5 text-left font-mono text-[9px] tracking-[0.07em] text-muted uppercase" scope="col">Equivalent</th>
              </tr>
            </thead>
            <tbody className="max-[760px]:grid max-[760px]:gap-3">
              {CRON_HELPERS.map((helper) => (
                <tr className="max-[760px]:block max-[760px]:overflow-hidden max-[760px]:rounded-lg max-[760px]:border max-[760px]:border-line max-[760px]:bg-[#fafbf9]" key={helper.symbol}>
                  <td className="min-w-[115px] border-t border-line px-3 py-[13px] align-top text-[#4b5551] before:hidden before:content-[attr(data-label)] max-[760px]:grid max-[760px]:w-full max-[760px]:grid-cols-[118px_minmax(0,1fr)] max-[760px]:gap-3 max-[760px]:border-t-0 max-[760px]:px-3 max-[760px]:py-2.5 max-[760px]:before:block max-[760px]:before:pt-0.5 max-[760px]:before:font-mono max-[760px]:before:text-[8px] max-[760px]:before:tracking-[0.07em] max-[760px]:before:text-muted max-[760px]:before:uppercase max-[420px]:grid-cols-[96px_minmax(0,1fr)]" data-label="Symbol">
                    <code className="font-mono text-[11px] whitespace-nowrap text-ink">{helper.symbol}</code>
                    {!helper.supported && <span className="mt-1 block w-max rounded-full bg-[#f2efe7] px-1.5 py-[3px] font-mono text-[8px] tracking-[0.05em] text-[#746d5d] uppercase">Reference only</span>}
                  </td>
                  <td className="border-t border-line px-3 py-[13px] align-top text-[#4b5551] before:hidden before:content-[attr(data-label)] max-[760px]:grid max-[760px]:w-full max-[760px]:grid-cols-[118px_minmax(0,1fr)] max-[760px]:gap-3 max-[760px]:px-3 max-[760px]:py-2.5 max-[760px]:before:block max-[760px]:before:pt-0.5 max-[760px]:before:font-mono max-[760px]:before:text-[8px] max-[760px]:before:tracking-[0.07em] max-[760px]:before:text-muted max-[760px]:before:uppercase max-[420px]:grid-cols-[96px_minmax(0,1fr)]" data-label="Meaning">{helper.meaning}</td>
                  <td className="border-t border-line px-3 py-[13px] align-top text-[#4b5551] before:hidden before:content-[attr(data-label)] max-[760px]:grid max-[760px]:w-full max-[760px]:grid-cols-[118px_minmax(0,1fr)] max-[760px]:gap-3 max-[760px]:px-3 max-[760px]:py-2.5 max-[760px]:before:block max-[760px]:before:pt-0.5 max-[760px]:before:font-mono max-[760px]:before:text-[8px] max-[760px]:before:tracking-[0.07em] max-[760px]:before:text-muted max-[760px]:before:uppercase max-[420px]:grid-cols-[96px_minmax(0,1fr)]" data-label="Valid expression"><code className="font-mono text-[11px] whitespace-nowrap text-ink">{helper.example}</code></td>
                  <td className="border-t border-line px-3 py-[13px] align-top text-[#4b5551] before:hidden before:content-[attr(data-label)] max-[760px]:grid max-[760px]:w-full max-[760px]:grid-cols-[118px_minmax(0,1fr)] max-[760px]:gap-3 max-[760px]:px-3 max-[760px]:py-2.5 max-[760px]:before:block max-[760px]:before:pt-0.5 max-[760px]:before:font-mono max-[760px]:before:text-[8px] max-[760px]:before:tracking-[0.07em] max-[760px]:before:text-muted max-[760px]:before:uppercase max-[420px]:grid-cols-[96px_minmax(0,1fr)]" data-label="Equivalent">{helper.equivalent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
