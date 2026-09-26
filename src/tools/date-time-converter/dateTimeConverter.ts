import {
  format,
  formatISO,
  formatISO9075,
  formatRFC3339,
  formatRFC7231,
  fromUnixTime,
  getTime,
  getUnixTime,
  isValid,
  parseISO,
} from 'date-fns';

export type DateFormatId =
  | 'iso-8601'
  | 'iso-9075'
  | 'rfc-3339'
  | 'rfc-7231'
  | 'unix-seconds'
  | 'unix-milliseconds'
  | 'utc';

export interface DateFormatDefinition {
  id: DateFormatId;
  label: string;
  formatDate: (date: Date) => string;
  parseDate: (value: string) => Date;
  matches: (value: string) => boolean;
}

const ISO_8601_REGEX = /^([+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([.,]\d+(?!:))?)?(\17[0-5]\d([.,]\d+)?)?([zZ]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
const ISO_9075_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{1,6})?(([+-])\d{2}:\d{2}|Z)?$/;
const RFC_3339_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,9})?(([+-])\d{2}:\d{2}|Z)$/;
const RFC_7231_REGEX = /^[A-Za-z]{3},\s\d{2}\s[A-Za-z]{3}\s\d{4}\s\d{2}:\d{2}:\d{2}\sGMT$/;

function parseNativeDate(value: string) {
  return new Date(value);
}

function isUtcDateString(value: string) {
  const date = new Date(value);
  return isValid(date) && date.toUTCString() === value;
}

export const DATE_FORMATS: readonly DateFormatDefinition[] = [
  {
    id: 'iso-8601',
    label: "ISO 8601 (yyyy-MM-dd'T'HH:mm:ssXXX)",
    formatDate: formatISO,
    parseDate: parseISO,
    matches: (value) => ISO_8601_REGEX.test(value),
  },
  {
    id: 'iso-9075',
    label: 'ISO 9075 (yyyy-MM-dd HH:mm:ss)',
    formatDate: formatISO9075,
    parseDate: parseISO,
    matches: (value) => ISO_9075_REGEX.test(value),
  },
  {
    id: 'rfc-3339',
    label: "RFC 3339 (yyyy-MM-dd'T'HH:mm:ssXXX)",
    formatDate: formatRFC3339,
    parseDate: parseNativeDate,
    matches: (value) => RFC_3339_REGEX.test(value),
  },
  {
    id: 'rfc-7231',
    label: "RFC 7231 (EEE, dd MMM yyyy HH:mm:ss 'GMT')",
    formatDate: formatRFC7231,
    parseDate: parseNativeDate,
    matches: (value) => RFC_7231_REGEX.test(value),
  },
  {
    id: 'unix-seconds',
    label: 'Unix timestamp (seconds since 1970-01-01)',
    formatDate: (date) => String(getUnixTime(date)),
    parseDate: (value) => fromUnixTime(Number(value)),
    matches: (value) => /^\d{1,10}$/.test(value),
  },
  {
    id: 'unix-milliseconds',
    label: 'Unix timestamp (milliseconds since 1970-01-01)',
    formatDate: (date) => String(getTime(date)),
    parseDate: (value) => new Date(Number(value)),
    matches: (value) => /^\d{11,13}$/.test(value),
  },
  {
    id: 'utc',
    label: "UTC (EEE, dd MMM yyyy HH:mm:ss 'GMT')",
    formatDate: (date) => date.toUTCString(),
    parseDate: parseNativeDate,
    matches: isUtcDateString,
  },
];

export const DEFAULT_FORMAT_ID: DateFormatId = 'unix-milliseconds';

export function detectDateFormat(value: string) {
  const trimmedValue = value.trim();
  const detectionOrder: DateFormatId[] = [
    'iso-9075',
    'rfc-3339',
    'iso-8601',
    'rfc-7231',
    'utc',
    'unix-seconds',
    'unix-milliseconds',
  ];

  return detectionOrder
    .map((id) => DATE_FORMATS.find((formatDefinition) => formatDefinition.id === id))
    .find((formatDefinition) => formatDefinition?.matches(trimmedValue))?.id;
}

export function parseDateInput(value: string, formatId: DateFormatId, now = new Date()) {
  if (!value.trim()) {
    return now;
  }

  const definition = DATE_FORMATS.find(({ id }) => id === formatId);
  if (!definition) {
    return undefined;
  }

  try {
    const date = definition.parseDate(value.trim());
    return isValid(date) ? date : undefined;
  } catch {
    return undefined;
  }
}

export function formatPredefinedDate(date: Date) {
  return DATE_FORMATS.map(({ id, label, formatDate }) => ({
    id,
    label,
    value: formatDate(date),
  }));
}

export function formatCustomDate(date: Date, pattern: string) {
  if (!pattern) {
    return '';
  }

  try {
    return format(date, pattern);
  } catch {
    return '';
  }
}
