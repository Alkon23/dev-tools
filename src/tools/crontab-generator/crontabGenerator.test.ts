import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CRON_EXPRESSION,
  DEFAULT_CRON_OPTIONS,
  describeCron,
} from './crontabGenerator';

describe('describeCron', () => {
  it('describes the default expression', () => {
    expect(describeCron(DEFAULT_CRON_EXPRESSION)).toEqual({
      description: 'At 40 minutes past the hour, every hour, every day',
      valid: true,
    });
  });

  it('supports step values and optional seconds', () => {
    expect(describeCron('*/10 * * * *').description).toBe('Every 10 minutes, every hour, every day');
    expect(describeCron('0 5 14 * * *')).toMatchObject({ valid: true });
  });

  it('accepts month and weekday aliases', () => {
    expect(describeCron('0 0 * JAN MON')).toMatchObject({ valid: true });
  });

  it('accepts one blank day field but not two', () => {
    expect(describeCron('0 0 ? * 1')).toMatchObject({ valid: true });
    expect(describeCron('0 0 ? * ?')).toEqual({ description: '', valid: false });
  });

  it.each(['', '   ', '60 * * * *', '* * * *', '@daily'])(
    'rejects unsupported input %j',
    (expression) => {
      expect(describeCron(expression)).toEqual({ description: '', valid: false });
    },
  );

  it('uses verbose output when enabled', () => {
    const concise = describeCron('5 14 * * *', { ...DEFAULT_CRON_OPTIONS, verbose: false });
    const verbose = describeCron('5 14 * * *', DEFAULT_CRON_OPTIONS);

    expect(concise.description).toBe('At 14:05');
    expect(verbose.description).toBe('At 14:05, every day');
  });

  it('supports 12-hour time descriptions', () => {
    const result = describeCron('5 14 * * *', {
      ...DEFAULT_CRON_OPTIONS,
      use24HourTimeFormat: false,
    });

    expect(result.description).toBe('At 02:05 PM, every day');
  });

  it('uses the configured day-of-week starting index', () => {
    const zeroBased = describeCron('0 0 * * 1', DEFAULT_CRON_OPTIONS);
    const oneBased = describeCron('0 0 * * 1', {
      ...DEFAULT_CRON_OPTIONS,
      dayOfWeekStartIndexZero: false,
    });

    expect(zeroBased.description).toContain('Monday');
    expect(oneBased.description).toContain('Sunday');
  });
});
