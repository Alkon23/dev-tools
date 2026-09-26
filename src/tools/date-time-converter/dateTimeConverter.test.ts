import { describe, expect, it } from 'vitest';
import {
  detectDateFormat,
  formatCustomDate,
  formatPredefinedDate,
  parseDateInput,
} from './dateTimeConverter';

describe('date-time conversion', () => {
  it('detects standard strings and distinguishes timestamp precision', () => {
    expect(detectDateFormat('2023-04-12T23:10:24+02:00')).toBe('rfc-3339');
    expect(detectDateFormat('2022-01-01 12:00:00Z')).toBe('iso-9075');
    expect(detectDateFormat('1681333824')).toBe('unix-seconds');
    expect(detectDateFormat('1681333824000')).toBe('unix-milliseconds');
  });

  it('parses timestamps and rejects malformed input', () => {
    expect(parseDateInput('1681333824', 'unix-seconds')?.toISOString()).toBe('2023-04-12T21:10:24.000Z');
    expect(parseDateInput('1681333824000', 'unix-milliseconds')?.toISOString()).toBe('2023-04-12T21:10:24.000Z');
    expect(parseDateInput('not-a-date', 'iso-8601')).toBeUndefined();
  });

  it('uses the supplied current time for empty input', () => {
    const now = new Date('2024-01-02T03:04:05.000Z');
    expect(parseDateInput('', 'unix-milliseconds', now)).toBe(now);
  });

  it('formats every predefined result and supports custom tokens', () => {
    const date = new Date('2023-04-12T21:10:24.123Z');
    const results = formatPredefinedDate(date);

    expect(results).toHaveLength(7);
    expect(results.find(({ id }) => id === 'unix-seconds')?.value).toBe('1681333824');
    expect(results.find(({ id }) => id === 'unix-milliseconds')?.value).toBe('1681333824123');
    expect(formatCustomDate(date, "yyyy/MM/dd 'at' HH:mm:ss")).toMatch(/^2023\/04\/12 at \d{2}:10:24$/);
  });
});
