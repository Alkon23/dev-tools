import { isValidCron } from 'cron-validator';
import cronstrue from 'cronstrue';

export interface CronDescriptionOptions {
  verbose: boolean;
  use24HourTimeFormat: boolean;
  dayOfWeekStartIndexZero: boolean;
}

export interface CronDescriptionResult {
  description: string;
  valid: boolean;
}

export interface CronHelper {
  symbol: string;
  meaning: string;
  example: string;
  equivalent: string;
  supported: boolean;
}

export const DEFAULT_CRON_EXPRESSION = '40 * * * *';

export const DEFAULT_CRON_OPTIONS: Readonly<CronDescriptionOptions> = {
  verbose: true,
  use24HourTimeFormat: true,
  dayOfWeekStartIndexZero: true,
};

export const CRON_HELPERS: readonly CronHelper[] = [
  {
    symbol: '*',
    meaning: 'Any value',
    example: '* * * * *',
    equivalent: 'Every minute',
    supported: true,
  },
  {
    symbol: '-',
    meaning: 'Range of values',
    example: '1-10 * * * *',
    equivalent: 'Minutes 1 through 10',
    supported: true,
  },
  {
    symbol: ',',
    meaning: 'List of values',
    example: '1,10 * * * *',
    equivalent: 'At minutes 1 and 10',
    supported: true,
  },
  {
    symbol: '/',
    meaning: 'Step values',
    example: '*/10 * * * *',
    equivalent: 'Every 10 minutes',
    supported: true,
  },
  {
    symbol: '@yearly',
    meaning: 'Once every year at midnight on January 1',
    example: '0 0 1 1 *',
    equivalent: 'Common shortcut; use the expression shown',
    supported: false,
  },
  {
    symbol: '@annually',
    meaning: 'Same as @yearly',
    example: '0 0 1 1 *',
    equivalent: 'Common shortcut; use the expression shown',
    supported: false,
  },
  {
    symbol: '@monthly',
    meaning: 'Once a month at midnight on the first day',
    example: '0 0 1 * *',
    equivalent: 'Common shortcut; use the expression shown',
    supported: false,
  },
  {
    symbol: '@weekly',
    meaning: 'Once a week at midnight on Sunday',
    example: '0 0 * * 0',
    equivalent: 'Common shortcut; use the expression shown',
    supported: false,
  },
  {
    symbol: '@daily',
    meaning: 'Once a day at midnight',
    example: '0 0 * * *',
    equivalent: 'Common shortcut; use the expression shown',
    supported: false,
  },
  {
    symbol: '@midnight',
    meaning: 'Same as @daily',
    example: '0 0 * * *',
    equivalent: 'Common shortcut; use the expression shown',
    supported: false,
  },
  {
    symbol: '@hourly',
    meaning: 'Once an hour at the beginning of the hour',
    example: '0 * * * *',
    equivalent: 'Common shortcut; use the expression shown',
    supported: false,
  },
  {
    symbol: '@reboot',
    meaning: 'Run at startup',
    example: 'Not available',
    equivalent: 'Not supported by this validator',
    supported: false,
  },
];

export function describeCron(
  expression: string,
  options: Readonly<CronDescriptionOptions> = DEFAULT_CRON_OPTIONS,
): CronDescriptionResult {
  const valid = isValidCron(expression, {
    allowBlankDay: true,
    alias: true,
    seconds: true,
  });

  if (!valid) {
    return { description: '', valid: false };
  }

  try {
    return {
      description: cronstrue.toString(expression, {
        ...options,
        throwExceptionOnParseError: true,
      }),
      valid: true,
    };
  } catch {
    return { description: '', valid: false };
  }
}
