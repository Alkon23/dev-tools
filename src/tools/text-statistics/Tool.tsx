import { useState } from 'react';
import { formatBytes, getTextStatistics } from './textStatistics';

export default function TextStatisticsTool() {
  const [text, setText] = useState('');
  const statistics = getTextStatistics(text);
  const metrics = [
    { label: 'Character count', value: statistics.characters.toLocaleString() },
    { label: 'Word count', value: statistics.words.toLocaleString() },
    { label: 'Line count', value: statistics.lines.toLocaleString() },
    { label: 'Byte size', value: formatBytes(statistics.bytes) },
  ];

  return (
    <section className="tool-card mx-auto max-w-[900px]" aria-label="Text statistics">
      <div className="field-group">
        <label htmlFor="statistics-text">Your text</label>
        <textarea
          className="min-h-[220px]"
          id="statistics-text"
          onChange={(event) => setText(event.target.value)}
          placeholder="Your text..."
          rows={8}
          value={text}
        />
      </div>

      <div className="mt-6 grid grid-cols-4 gap-3 max-[760px]:grid-cols-2 max-[420px]:grid-cols-1" aria-live="polite">
        {metrics.map((metric) => (
          <div className="flex min-w-0 flex-col gap-2 rounded-lg border border-[#d8dfdc] bg-[#f8faf9] p-4" key={metric.label} role="group" aria-label={metric.label}>
            <span className="text-[11px] font-semibold text-muted">{metric.label}</span>
            <strong className="[overflow-wrap:anywhere] font-mono text-[clamp(20px,2.4vw,28px)] font-medium text-ink">{metric.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
