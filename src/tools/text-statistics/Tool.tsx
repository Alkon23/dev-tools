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
    <section className="tool-card text-statistics-tool" aria-label="Text statistics">
      <div className="field-group">
        <label htmlFor="statistics-text">Your text</label>
        <textarea
          className="text-statistics-input"
          id="statistics-text"
          onChange={(event) => setText(event.target.value)}
          placeholder="Your text..."
          rows={8}
          value={text}
        />
      </div>

      <div className="statistics-grid" aria-live="polite">
        {metrics.map((metric) => (
          <div className="statistic" key={metric.label} role="group" aria-label={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
